import {
  Movie,
  MovieDetails,
  SeasonDetails,
  TVSeries,
  TVSeriesDetails
} from "interfaces/interfaces";

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const SORT_OPTIONS = {
  POPULARITY: "popularity.desc",
  TOP_RATED: "vote_average.desc",
  NEWEST: "primary_release_date.desc",
  REVENUE: "revenue.desc",
  MOST_VOTED: "vote_count.desc",
};

export const fetchMovies = async ({
  query,
  genreId,
  sortBy,
  page = 1,
}: {
  query?: string;
  genreId?: number | string | null;
  sortBy?: string;
  page?: number;
}): Promise<Movie[]> => {
  let endpoint;

  if (query) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
    endpoint += "&vote_count.gte=1";
  } else if (genreId) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&with_genres=${genreId}&page=${page}`;
  } else if (sortBy) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=${sortBy}&page=${page}`;
    endpoint += "&vote_count.gte=200";
  } else {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateString = oneYearAgo.toISOString().split("T")[0];

    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=vote_average.desc&primary_release_date.gte=${dateString}&vote_count.gte=200&page=${page}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }

    const data = await response.json();

    if (query) {
      return data.results.filter(
        (item: any) => item.vote_count > 0 && item.poster_path
      );
    }

    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const fetchMovieDetails = async (
  movieId: string | number | undefined | null
): Promise<MovieDetails | null> => {
  if (!movieId) {
    return null;
  }

  try {
    // ZAKTUALIZOWANO: Dodano append_to_response
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&append_to_response=watch/providers`, 
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      console.error(`fetchMovieDetails Error: ${response.status} for ID: ${movieId}`);
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null; 
  }
};

export const fetchTVSeries = async ({
  query,
  genreId,
  sortBy,
  page = 1,
}: {
  query?: string;
  genreId?: number | string | null;
  sortBy?: string;
  page?: number; 
}): Promise<TVSeries[]> => {
  let endpoint;
  let sortParam = sortBy || SORT_OPTIONS.POPULARITY;

  if (sortParam.includes("primary_release_date")) {
    sortParam = "first_air_date.desc";
  }

  if (sortParam.includes("revenue")) {
    sortParam = "popularity.desc";
  }

  if (query) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`;
    endpoint += "&vote_count.gte=1";
  } else if (genreId) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/tv?with_genres=${genreId}&sort_by=${sortParam}&page=${page}`;
  } else if (sortBy) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=${sortParam}&page=${page}`;
    endpoint += "&vote_count.gte=200";
  } else {
    endpoint = `${TMDB_CONFIG.BASE_URL}/trending/tv/week?page=${page}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TV Series: ${response.statusText}`);
    }

    const data = await response.json();

    if (query) {
      return data.results.filter(
        (item: any) => item.vote_count > 0 && item.poster_path
      );
    }

    return data.results;
  } catch (error) {
    console.error("Error fetching TV Series:", error);
    throw error;
  }
};

export const fetchTVSeriesDetails = async (
  seriesId: string
): Promise<TVSeriesDetails> => {
  try {
    // ZAKTUALIZOWANO: Dodano language i append_to_response
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&append_to_response=watch/providers`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TV series details: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV series details:", error);
    throw error;
  }
};

export const fetchSeasonDetails = async (
  seriesId: number,
  seasonNumber: number
): Promise<SeasonDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch season details`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching season details:", error);
    throw error;
  }
};

export const WATCH_PROVIDERS = {
  NETFLIX: 8,
  DISNEY_PLUS: 337,
  MAX: 1899,
  AMAZON_PRIME: 119,
  APPLE_TV: 350,
  SKYSHOWTIME: 1773
};

export const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" }, 
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

export const fetchMoviesForGame = async ({
  genreIds,
  providerIds,
  type = 'movie',
  minYear,
  maxYear,
  minRating
}: {
  genreIds: number[];
  providerIds: number[];
  type?: 'movie' | 'tv' | null;
  minYear?: string;
  maxYear?: string;
  minRating?: string;
}): Promise<any[]> => {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  
  const genresString = genreIds.join("|"); 
  const providersString = providerIds.join("|"); 
  
  const voteCountLimit = mediaType === 'tv' ? 10 : 50;
  
  let baseEndpoint = `${TMDB_CONFIG.BASE_URL}/discover/${mediaType}?sort_by=popularity.desc&watch_region=PL&vote_count.gte=${voteCountLimit}`;
  
  // URL Parametry (dla API)
  if (genresString) baseEndpoint += `&with_genres=${genresString}`;
  if (providersString) baseEndpoint += `&with_watch_providers=${providersString}`;

  if (minYear) {
      const param = mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
      baseEndpoint += `&${param}=${minYear}-01-01`;
  }
  if (maxYear) {
      const param = mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte';
      baseEndpoint += `&${param}=${maxYear}-12-31`;
  }
  if (minRating && parseFloat(minRating) > 0) {
      baseEndpoint += `&vote_average.gte=${minRating}`;
  }

  try {
    const probeResponse = await fetch(`${baseEndpoint}&page=1`, {
       method: "GET",
       headers: TMDB_CONFIG.headers,
    });
    
    if (!probeResponse.ok) throw new Error(`Probe fetch failed`);
    
    const probeData = await probeResponse.json();
    const totalPages = probeData.total_pages || 1;
    
    if (totalPages === 0) return [];
    
    const maxPage = Math.min(totalPages, 20); 
    const randomPage = Math.floor(Math.random() * maxPage) + 1;
    
    let results = [];
    if (randomPage === 1) {
        results = probeData.results;
    } else {
        const randomPageResponse = await fetch(`${baseEndpoint}&page=${randomPage}`, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });
        const randomPageData = await randomPageResponse.json();
        results = randomPageData.results;
    }
    
    // Normalizacja
    const normalizedResults = results
      .filter((item: any) => item.poster_path) 
      .map((item: any) => ({
          ...item,
          id: item.id,
          title: item.title || item.name, 
          release_date: item.release_date || item.first_air_date,
          media_type: mediaType 
      }));

    // --- KLUCZOWE: RĘCZNE FILTROWANIE "PO STRONIE KLIENTA" ---
    // (Zabezpieczenie przed błędami API)
    const strictlyFilteredResults = normalizedResults.filter((item: any) => {
        const year = parseInt(item.release_date?.split('-')[0] || "0");
        const rating = item.vote_average;

        // Sprawdzamy rok
        if (minYear && year < parseInt(minYear)) return false;
        if (maxYear && year > parseInt(maxYear)) return false;
        
        // Sprawdzamy ocenę
        if (minRating && rating < parseFloat(minRating)) return false;

        return true;
    });

    return strictlyFilteredResults.sort(() => 0.5 - Math.random());
    
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
};