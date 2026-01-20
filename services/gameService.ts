import { Client, Databases, ID, Models, Permission, Query, RealtimeResponseEvent, Role } from "react-native-appwrite";
import { fetchMoviesForGame } from "./tmdbapi";

const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_FLICKMOVIEDATABASE_ID!;
const ACTIVE_GAMES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_ACTIVE_GAMES_COLLECTION_ID!;
const GAME_PARTICIPANTS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_GAME_PARTICIPANTS_COLLECTION_ID!;
const GAME_HISTORY_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_GAME_HISTORY_COLLECTION_ID!;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const database = new Databases(client);

export interface GameState extends Models.Document {
  host_id: string;
  status: 'lobby' | 'genre_selection' | 'in_progress' | 'finished';
  game_code: string;
  genres_required_count: number;
  round_current: number;
  round_total: number;
  movies_pool: string; 
  merged_genres: string;
  content_type: 'movie' | 'tv';
  providers: string; 
}

export interface GameParticipant extends Models.Document {
  user_id: string;
  game_id: string;
  nickname: string;
  avatar_url?: string;
  is_ready: boolean;
  selected_genres: string; 
  votes: string; 
}

const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const createGame = async (
    hostId: string, 
    hostName: string, 
    avatar: string, 
    config: { 
        genresCount: number;
        contentType: 'movie' | 'tv'; 
        providers: number[];        
    }
) => {
  try {
    const gameCode = Math.floor(100000 + Math.random() * 900000).toString();

    const game = await database.createDocument<GameState>(
      DATABASE_ID,
      ACTIVE_GAMES_COLLECTION_ID,
      ID.unique(),
      {
        host_id: hostId,
        status: 'lobby',
        game_code: gameCode,
        genres_required_count: config.genresCount,
        round_current: 1,
        round_total: 4, 
        movies_pool: '[]',
        merged_genres: '[]',
        content_type: config.contentType,
        providers: JSON.stringify(config.providers)
      },
      [
        Permission.read(Role.any()), 
        Permission.update(Role.user(hostId)), 
        Permission.delete(Role.user(hostId))
      ]
    );

    await joinGameAsParticipant(game.$id, hostId, hostName, avatar);
    return game;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create game");
  }
};

export const getGame = async (gameId: string) => {
    try {
      return await database.getDocument<GameState>(
        DATABASE_ID,
        ACTIVE_GAMES_COLLECTION_ID,
        gameId
      );
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch game");
    }
};

export const joinGameByCode = async (code: string, userId: string, userName: string, avatar: string) => {
  try {
    const games = await database.listDocuments<GameState>(
      DATABASE_ID,
      ACTIVE_GAMES_COLLECTION_ID,
      [Query.equal('game_code', code), Query.limit(1)]
    );

    if (games.total === 0) throw new Error("Game not found");
    const game = games.documents[0];

    if (game.status !== 'lobby') throw new Error("Game already started");

    const existing = await database.listDocuments(
      DATABASE_ID,
      GAME_PARTICIPANTS_COLLECTION_ID,
      [Query.equal('game_id', game.$id), Query.equal('user_id', userId)]
    );

    if (existing.total === 0) {
      await joinGameAsParticipant(game.$id, userId, userName, avatar);
    }

    return game;
  } catch (error: any) {
    throw new Error(error.message || "Failed to join game");
  }
};

const joinGameAsParticipant = async (gameId: string, userId: string, name: string, avatar: string) => {
  const safeAvatar = (avatar && avatar.length > 0) 
    ? avatar 
    : `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(name)}&project=${PROJECT_ID}`;

  return await database.createDocument<GameParticipant>(
    DATABASE_ID,
    GAME_PARTICIPANTS_COLLECTION_ID,
    ID.unique(),
    {
      game_id: gameId,
      user_id: userId,
      nickname: name,
      avatar_url: safeAvatar,
      is_ready: false,
      selected_genres: '[]',
      votes: '{}'
    },
    [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
    ]
  );
};

export const subscribeToGame = (gameId: string, callback: (game: GameState | null) => void) => {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${ACTIVE_GAMES_COLLECTION_ID}.documents.${gameId}`,
    (response: RealtimeResponseEvent<GameState>) => {
      if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
          callback(null); 
      } else {
          callback(response.payload);
      }
    }
  );
};

export const subscribeToParticipants = (gameId: string, callback: (participants: GameParticipant[]) => void) => {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${GAME_PARTICIPANTS_COLLECTION_ID}.documents`,
    async (response) => {
        const payload = response.payload as GameParticipant;
        if (payload.game_id === gameId) {
            const list = await getGameParticipants(gameId);
            callback(list);
        }
    }
  );
};

export const getGameParticipants = async (gameId: string) => {
  try {
      const result = await database.listDocuments<GameParticipant>(
        DATABASE_ID,
        GAME_PARTICIPANTS_COLLECTION_ID,
        [Query.equal('game_id', gameId)]
      );
      return result.documents;
  } catch (error) {
      return [];
  }
};

export const submitGenres = async (participantId: string, genres: number[]) => {
  await database.updateDocument(
    DATABASE_ID,
    GAME_PARTICIPANTS_COLLECTION_ID,
    participantId,
    {
      selected_genres: JSON.stringify(genres),
      is_ready: true 
    }
  );
};

export const submitRoundVotes = async (participantId: string, round: number, votedMovieIds: number[]) => {
    const doc = await database.getDocument<GameParticipant>(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, participantId);
    const votes = JSON.parse(doc.votes || '{}');
    
    votes[`round_${round}`] = votedMovieIds;

    await database.updateDocument(
        DATABASE_ID,
        GAME_PARTICIPANTS_COLLECTION_ID,
        participantId,
        {
            votes: JSON.stringify(votes),
            is_ready: true 
        }
    );
};

export const startGame = async (gameId: string) => {
  const gameDoc = await getGame(gameId); 
  const participants = await getGameParticipants(gameId);
  
  const allGenres = new Set<number>();
  participants.forEach((p) => {
    const genres = JSON.parse(p.selected_genres);
    genres.forEach((g: number) => allGenres.add(g));
  });

  const mergedGenres = Array.from(allGenres);
  const providers = JSON.parse(gameDoc.providers || '[]');

  const movies = await fetchMoviesForGame({
      genreIds: mergedGenres,
      providerIds: providers,
      type: gameDoc.content_type
  });

  const cardsPerPlayer = 10;
  const requiredCount = participants.length * cardsPerPlayer;

  if (movies.length < requiredCount) {
      throw new Error(
          `Not enough movies! Found ${movies.length}, but need ${requiredCount} (${participants.length} players × ${cardsPerPlayer} cards). Please add more Genres.`
      );
  }

  const shuffledMovies = shuffleArray(movies);
  const pool = shuffledMovies.slice(0, requiredCount);

  await database.updateDocument(
    DATABASE_ID,
    ACTIVE_GAMES_COLLECTION_ID,
    gameId,
    {
      status: 'in_progress',
      merged_genres: JSON.stringify(mergedGenres),
      movies_pool: JSON.stringify(pool),
      round_current: 1,
      round_total: 4 
    }
  );

  const promises = participants.map((p) => 
      database.updateDocument(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, p.$id, { is_ready: false })
  );
  await Promise.all(promises);
};

export const nextRoundOrFinish = async (gameId: string, currentRound: number, totalRounds: number) => {
    const participants = await getGameParticipants(gameId);
    const game = await getGame(gameId);
    
    const currentPool = JSON.parse(game.movies_pool || '[]');

    const votedMovieIds = new Set<string>();
    
    participants.forEach((p) => {
        const votesMap = JSON.parse(p.votes || '{}');
        const roundVotes = votesMap[`round_${currentRound}`] || []; 
        
        roundVotes.forEach((id: number | string) => {
            votedMovieIds.add(String(id));
        });
    });

    const nextRoundMovies = currentPool.filter((m: any) => votedMovieIds.has(String(m.id)));

    const finalNextPool = nextRoundMovies.length > 0 ? nextRoundMovies : currentPool;

    if (currentRound >= 4) { 
        await database.updateDocument(
            DATABASE_ID,
            ACTIVE_GAMES_COLLECTION_ID,
            gameId,
            { status: 'finished' }
        );
    } else {
        const shuffledNextPool = shuffleArray(finalNextPool);

        const promises = participants.map((p) => 
            database.updateDocument(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, p.$id, { is_ready: false })
        );
        await Promise.all(promises);

        await database.updateDocument(
            DATABASE_ID,
            ACTIVE_GAMES_COLLECTION_ID,
            gameId,
            {
                round_current: currentRound + 1,
                movies_pool: JSON.stringify(shuffledNextPool) 
            }
        );
    }
};

export const saveToHistory = async (userId: string, winners: any[], mode: 'multiplayer' | 'singleplayer' = 'multiplayer') => {
    try {
        await database.createDocument(
            DATABASE_ID,
            GAME_HISTORY_COLLECTION_ID,
            ID.unique(),
            {
                user_id: userId,
                items: JSON.stringify(winners),
                game_mode: mode,
            },
            [
                Permission.read(Role.user(userId)), 
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId))
            ]
        );
    } catch (error: any) {
        throw new Error(error.message || "Failed to save history");
    }
};

export const updateGameSettings = async (
    gameId: string, 
    config: { 
        genresCount: number;
        contentType: 'movie' | 'tv';
        providers: number[];
    }
) => {
  try {
    await database.updateDocument(
      DATABASE_ID,
      ACTIVE_GAMES_COLLECTION_ID,
      gameId,
      {
        genres_required_count: config.genresCount,
        content_type: config.contentType,
        providers: JSON.stringify(config.providers)
      }
    );
  } catch (error: any) {
    throw new Error(error.message || "Failed to update settings");
  }
};

export const resetParticipantsGenres = async (gameId: string) => {
    const participants = await getGameParticipants(gameId);
    
    const promises = participants.map((p) => 
        database.updateDocument(
            DATABASE_ID, 
            GAME_PARTICIPANTS_COLLECTION_ID, 
            p.$id, 
            { 
                selected_genres: '[]', 
                is_ready: false 
            }
        )
    );
    await Promise.all(promises);
};

export const leaveGame = async (gameId: string, participantId: string, isHost: boolean) => {
    try {
        if (isHost) {
            const participants = await getGameParticipants(gameId);
            
            const deleteParticipantsPromises = participants.map(p => 
                database.deleteDocument(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, p.$id)
            );
            await Promise.all(deleteParticipantsPromises);

            await database.deleteDocument(DATABASE_ID, ACTIVE_GAMES_COLLECTION_ID, gameId);
        } else {
            await database.deleteDocument(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, participantId);
        }
    } catch (error) {
        console.error("Error leaving game:", error);
    }
};