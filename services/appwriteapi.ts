import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!; // Filmy
const SERIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SERIES_COLLECTION_ID!; // Seriale (NOWE)

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

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