import { Account, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

const CONTENT_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_FLICKMOVIEDATABASE_ID!; 

const MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SERIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SERIES_COLLECTION_ID!;
const WATCHLIST_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!;
const WATCHLIST_SERIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_SERIES_COLLECTION_ID!;

const STORAGE_ID = process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID!;
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email: string, password: string, username: string) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw new Error("Account creation failed");

    await signIn(email, password);
    const currentUser = await account.get();

    return currentUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message || "Unknown error");
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message || "Login failed");
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No user logged in");

    return currentAccount;
  } catch {
    return null;
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserName = async (name: string) => {
  try {
    const result = await account.updateName(name);
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update username");
  }
};

export const updateUserPassword = async (password: string, oldPassword: string) => {
  try {
    const result = await account.updatePassword(password, oldPassword);
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update password");
  }
};

export const uploadFile = async (file: { uri: string; name: string; type: string }) => {
  if (!file) return;

  try {
    const uploadedFile = await storage.createFile(
      STORAGE_ID,
      ID.unique(),
      {
        name: file.name,
        type: file.type,
        size: 0,
        uri: file.uri,
      }
    );

    const fileUrl = `${ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`;
    
    return fileUrl;
  } catch (error: any) {
    throw new Error(error.message || "File upload failed");
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(STORAGE_ID, fileId);
    return true;
  } catch (error: any) {
    console.log("Error deleting file:", error);
    return false;
  }
};

export const updateUserAvatar = async (avatarUrl: string) => {
  try {
    const result = await account.updatePrefs({ avatar: avatarUrl });
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update avatar");
  }
};

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(CONTENT_DATABASE_ID, MOVIES_COLLECTION_ID, [
      Query.equal("movie_id", movie.id),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        CONTENT_DATABASE_ID,
        MOVIES_COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(CONTENT_DATABASE_ID, MOVIES_COLLECTION_ID, ID.unique(), {
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    const result = await database.listDocuments(CONTENT_DATABASE_ID, MOVIES_COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents.map((doc) => ({
      movie_id: doc.movie_id,
      title: doc.title,
      count: doc.count,
      poster_url: doc.poster_url,
    })) as TrendingMovie[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSeriesSearchCount = async (query: string, series: TVSeries) => {
  try {
    const result = await database.listDocuments(CONTENT_DATABASE_ID, SERIES_COLLECTION_ID, [
      Query.equal("series_id", series.id),
    ]);

    if (result.documents.length > 0) {
      const existingSeries = result.documents[0];
      await database.updateDocument(
        CONTENT_DATABASE_ID,
        SERIES_COLLECTION_ID,
        existingSeries.$id,
        {
          count: existingSeries.count + 1,
        }
      );
    } else {
      await database.createDocument(CONTENT_DATABASE_ID, SERIES_COLLECTION_ID, ID.unique(), {
        series_id: series.id,
        name: series.name,
        count: 1,
        poster_url: `${TMDB_IMAGE_BASE_URL}${series.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating series search count:", error);
  }
};

export const getTrendingSeries = async (): Promise<TrendingSeries[]> => {
  try {
    const result = await database.listDocuments(CONTENT_DATABASE_ID, SERIES_COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents.map((doc) => ({
      series_id: doc.series_id,
      name: doc.name,
      count: doc.count,
      poster_url: doc.poster_url,
    })) as TrendingSeries[];
  } catch (error) {
    console.error("Error getting trending series:", error);
    return [];
  }
};

export const addToWatchlist = async (
  userId: string,
  movie: { id: number; title: string; poster_path: string; vote_average: number }
) => {
  try {
    const result = await database.createDocument(
      USERS_DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      ID.unique(),
      {
        user_Id: userId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      }
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to add to watchlist");
  }
};

export const removeFromWatchlist = async (userId: string, movieId: number) => {
  try {
    const documents = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("user_Id", userId), Query.equal("movie_id", movieId)]
    );

    if (documents.documents.length > 0) {
      const docId = documents.documents[0].$id;
      await database.deleteDocument(USERS_DATABASE_ID, WATCHLIST_COLLECTION_ID, docId);
      return true;
    }
    return false;
  } catch (error: any) {
    throw new Error(error.message || "Failed to remove from watchlist");
  }
};

export const getUserWatchlist = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("user_Id", userId), Query.orderDesc("$createdAt")]
    );
    return result.documents.map((doc) => ({
      id: doc.movie_id,
      title: doc.title,
      poster_path: doc.poster_path,
      vote_average: doc.vote_average,
      $id: doc.$id, 
    }));
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch watchlist");
  }
};

export const checkIsOnWatchlist = async (userId: string, movieId: number) => {
  try {
    const result = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("user_Id", userId), Query.equal("movie_id", movieId)]
    );
    return result.documents.length > 0;
  } catch (error) {
    return false;
  }
};

// --- WATCHLIST (SERIES) ---

export const addToWatchlistSeries = async (
  userId: string,
  series: { id: number; name: string; poster_path: string; vote_average: number }
) => {
  try {
    const result = await database.createDocument(
      USERS_DATABASE_ID,
      WATCHLIST_SERIES_COLLECTION_ID,
      ID.unique(),
      {
        user_Id: userId,
        series_id: series.id,
        name: series.name,
        poster_path: series.poster_path,
        vote_average: series.vote_average,
      }
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to add series to watchlist");
  }
};

export const removeFromWatchlistSeries = async (userId: string, seriesId: number) => {
  try {
    const documents = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_SERIES_COLLECTION_ID,
      [Query.equal("user_Id", userId), Query.equal("series_id", seriesId)]
    );

    if (documents.documents.length > 0) {
      const docId = documents.documents[0].$id;
      await database.deleteDocument(USERS_DATABASE_ID, WATCHLIST_SERIES_COLLECTION_ID, docId);
      return true;
    }
    return false;
  } catch (error: any) {
    throw new Error(error.message || "Failed to remove series from watchlist");
  }
};

export const getUserWatchlistSeries = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_SERIES_COLLECTION_ID,
      [Query.equal("user_Id", userId), Query.orderDesc("$createdAt")]
    );
    return result.documents.map((doc) => ({
      id: doc.series_id,
      title: doc.name, // Mapping 'name' to 'title' for easier rendering in UI
      poster_path: doc.poster_path,
      vote_average: doc.vote_average,
      $id: doc.$id, 
    }));
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch series watchlist");
  }
};

export const checkIsOnWatchlistSeries = async (userId: string, seriesId: number) => {
  try {
    const result = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_SERIES_COLLECTION_ID,
      [Query.equal("user_Id", userId), Query.equal("series_id", seriesId)]
    );
    return result.documents.length > 0;
  } catch (error) {
    return false;
  }
};

export const getWatchlistCount = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("user_Id", userId),
        Query.limit(1) // Pobieramy tylko 1, bo interesuje nas tylko 'total'
      ]
    );
    return result.total;
  } catch (error) {
    console.error("Error fetching watchlist count:", error);
    return 0;
  }
};

export const getWatchlistSeriesCount = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      USERS_DATABASE_ID,
      WATCHLIST_SERIES_COLLECTION_ID,
      [
        Query.equal("user_Id", userId),
        Query.limit(1)
      ]
    );
    return result.total;
  } catch (error) {
    console.error("Error fetching watchlist series count:", error);
    return 0;
  }
};