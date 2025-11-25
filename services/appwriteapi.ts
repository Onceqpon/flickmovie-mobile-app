import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!; // Filmy
const SERIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SERIES_COLLECTION_ID!; // Seriale (NOWE)

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const avatars = new Avatars(client);
const database = new Databases(client);

// --- AUTHENTICATION ---

export const createUser = async (email: string, password: string, username: string) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw new Error("Account creation failed");

    // const avatarUrl = avatars.getInitials(username); // (Opcjonalne, na razie nieużywane)

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
    
    // Jeśli chcesz pobierać awatar:
    // const avatar = avatars.getInitials(currentAccount.name); 

    return currentAccount;
  } catch (error) {
    // console.log("Appwrite Error (getCurrentUser): ", error);
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
}

// --- FILMY (Bez zmian) ---

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("movie_id", movie.id),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
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
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
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

// --- SERIALE (NOWE) ---

export const updateSeriesSearchCount = async (query: string, series: TVSeries) => {
  try {
    // 1. Szukamy w kolekcji SERIALI po series_id
    const result = await database.listDocuments(DATABASE_ID, SERIES_COLLECTION_ID, [
      Query.equal("series_id", series.id),
    ]);

    if (result.documents.length > 0) {
      // Aktualizacja istniejącego
      const existingSeries = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        SERIES_COLLECTION_ID,
        existingSeries.$id,
        {
          count: existingSeries.count + 1,
        }
      );
    } else {
      // Tworzenie nowego (Używamy 'name' zamiast 'title')
      await database.createDocument(DATABASE_ID, SERIES_COLLECTION_ID, ID.unique(), {
        series_id: series.id,
        name: series.name, 
        count: 1,
        poster_url: `${TMDB_IMAGE_BASE_URL}${series.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating series search count:", error);
    // Nie rzucamy błędu krytycznego, żeby nie blokować UI
  }
};

export const getTrendingSeries = async (): Promise<TrendingSeries[]> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, SERIES_COLLECTION_ID, [
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