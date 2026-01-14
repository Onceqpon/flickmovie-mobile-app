import { Client, Databases, ID, Models, Permission, Query, RealtimeResponseEvent, Role } from "react-native-appwrite";
import { fetchMoviesForGame } from "./tmdbapi";

// --- KONFIGURACJA ---
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_FLICKMOVIEDATABASE_ID!;
const ACTIVE_GAMES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_ACTIVE_GAMES_COLLECTION_ID!;
const GAME_PARTICIPANTS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_GAME_PARTICIPANTS_COLLECTION_ID!;
const GAME_HISTORY_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_GAME_HISTORY_COLLECTION_ID!;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const database = new Databases(client);

// --- TYPY DANYCH ---

export interface GameState extends Models.Document {
  host_id: string;
  status: 'lobby' | 'genre_selection' | 'in_progress' | 'finished';
  game_code: string;
  genres_required_count: number;
  round_current: number;
  round_total: number;
  movies_pool: string; 
  merged_genres: string;
  // NOWE POLA:
  content_type: 'movie' | 'tv';
  providers: string; // JSON string
}

export interface GameParticipant extends Models.Document {
  user_id: string;
  game_id: string;
  nickname: string;
  avatar_url?: string;
  is_ready: boolean;
  selected_genres: string; // JSON string (Lista ID gatunków)
  votes: string; // JSON string (Słownik: { "round_1": [123, 456], ... })
}

// --- TWORZENIE I DOŁĄCZANIE (LOBBY) ---

export const createGame = async (
    hostId: string, 
    hostName: string, 
    avatar: string, 
    config: { 
        rounds: number; 
        genresCount: number;
        contentType: 'movie' | 'tv'; // NOWE
        providers: number[];         // NOWE
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
        round_total: config.rounds,
        movies_pool: '[]',
        merged_genres: '[]',
        // ZAPISUJEMY WYBORY HOSTA
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

    // Sprawdź czy użytkownik już jest w grze
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
  // ZABEZPIECZENIE: Generuj inicjały jeśli brak avatara (naprawia błędy source.uri)
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
        Permission.read(Role.any()),          // Wszyscy widzą gracza
        Permission.update(Role.user(userId)), // Tylko gracz edytuje swoje dane (wybory)
        Permission.delete(Role.user(userId))  // Gracz może wyjść
    ]
  );
};

// --- REALTIME (NASŁUCHIWANIE) ---

export const subscribeToGame = (gameId: string, callback: (game: GameState) => void) => {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${ACTIVE_GAMES_COLLECTION_ID}.documents.${gameId}`,
    (response: RealtimeResponseEvent<GameState>) => {
      callback(response.payload);
    }
  );
};

export const subscribeToParticipants = (gameId: string, callback: (participants: GameParticipant[]) => void) => {
  return client.subscribe(
    `databases.${DATABASE_ID}.collections.${GAME_PARTICIPANTS_COLLECTION_ID}.documents`,
    async (response) => {
        const payload = response.payload as GameParticipant;
        // Filtrujemy zdarzenia tylko dla aktualnej gry
        if (payload.game_id === gameId) {
            const list = await getGameParticipants(gameId);
            callback(list);
        }
    }
  );
};

export const getGameParticipants = async (gameId: string) => {
  const result = await database.listDocuments<GameParticipant>(
    DATABASE_ID,
    GAME_PARTICIPANTS_COLLECTION_ID,
    [Query.equal('game_id', gameId)]
  );
  return result.documents;
};

// --- AKCJE GRACZA ---

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

// --- LOGIKA HOSTA (SILNIK GRY) ---

export const startGame = async (gameId: string) => {
  const gameDoc = await getGame(gameId); // Pobieramy grę, żeby znać jej ustawienia
  const participants = await getGameParticipants(gameId);
  
  const allGenres = new Set<number>();
  participants.forEach((p) => {
    const genres = JSON.parse(p.selected_genres);
    genres.forEach((g: number) => allGenres.add(g));
  });

  const mergedGenres = Array.from(allGenres);
  const providers = JSON.parse(gameDoc.providers || '[]'); // Pobieramy dostawców

  // Pobieramy z uwzględnieniem Typu i Dostawców
  const movies = await fetchMoviesForGame({
      genreIds: mergedGenres,
      providerIds: providers,
      type: gameDoc.content_type // 'movie' lub 'tv'
  });

  const requiredCount = participants.length * 10;
  const pool = movies.slice(0, requiredCount);

  await database.updateDocument(
    DATABASE_ID,
    ACTIVE_GAMES_COLLECTION_ID,
    gameId,
    {
      status: 'in_progress',
      merged_genres: JSON.stringify(mergedGenres),
      movies_pool: JSON.stringify(pool),
      round_current: 1
    }
  );

  const promises = participants.map((p) => 
      database.updateDocument(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, p.$id, { is_ready: false })
  );
  await Promise.all(promises);
};

export const nextRoundOrFinish = async (gameId: string, currentRound: number, maxRounds: number) => {
    const participants = await getGameParticipants(gameId);
    
    // 1. Zbieramy głosy z obecnej rundy
    const roundVotes: number[][] = participants.map((p) => {
        const votes = JSON.parse(p.votes || '{}');
        return votes[`round_${currentRound}`] || [];
    });
    
    // 2. TWORZENIE NOWEJ PULI (SUMA POLUBIEŃ)
    // Tworzymy zbiór wszystkich ID filmów, które dostały chociaż 1 like.
    const allVotedIds = new Set(roundVotes.flat());
    
    const gameDoc = await database.getDocument<GameState>(DATABASE_ID, ACTIVE_GAMES_COLLECTION_ID, gameId);
    const oldPool = JSON.parse(gameDoc.movies_pool);

    // Nowa pula to filmy ze starej puli, które są na liście polubionych
    const nextPool = oldPool.filter((m: any) => allVotedIds.has(m.id));

    // 3. SPRAWDZENIE CZY KONIEC
    // Kończymy jeśli: osiągnięto limit rund LUB pula na następną rundę jest pusta (nikt nic nie polubił)
    if (currentRound >= maxRounds || nextPool.length === 0) {
        
        // Jeśli nextPool jest pusty, to znaczy że w ostatniej rundzie nikt nic nie wybrał.
        // Wtedy wynikiem jest pula z POPRZEDNIEJ rundy (oldPool).
        // Jeśli nextPool ma filmy, to one są zwycięzcami.
        const finalResults = nextPool.length > 0 ? nextPool : oldPool;

        await database.updateDocument(DATABASE_ID, ACTIVE_GAMES_COLLECTION_ID, gameId, {
            status: 'finished',
            movies_pool: JSON.stringify(finalResults) // Zapisujemy wyniki
        });
    } else {
        // 4. KOLEJNA RUNDA
        await database.updateDocument(DATABASE_ID, ACTIVE_GAMES_COLLECTION_ID, gameId, {
            round_current: currentRound + 1,
            movies_pool: JSON.stringify(nextPool) // Zapisujemy nową, mniejszą pulę
        });
        
        // Resetujemy graczy
        const promises = participants.map((p) => 
            database.updateDocument(DATABASE_ID, GAME_PARTICIPANTS_COLLECTION_ID, p.$id, { is_ready: false })
        );
        await Promise.all(promises);
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
                items: JSON.stringify(winners), // Zmiana na 'items' zgodnie z Twoim screenem
                game_mode: mode,                // Twoje nowe pole
                // $createdAt doda się samo automatycznie
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