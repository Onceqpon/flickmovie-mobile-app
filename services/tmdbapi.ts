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
}: {
  query?: string;
  genreId?: number | string | null;
  sortBy?: string;
}): Promise<Movie[]> => {
  let endpoint;

  if (query) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`;
    endpoint += "&vote_count.gte=1";
  } else if (genreId) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&with_genres=${genreId}`;
  } else if (sortBy) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=${sortBy}`;
    endpoint += "&vote_count.gte=200";
  } else {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateString = oneYearAgo.toISOString().split("T")[0];

    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=vote_average.desc&primary_release_date.gte=${dateString}&vote_count.gte=200`;
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
        return data.results.filter((item: any) => item.vote_count > 0 && item.poster_path);
    }
    
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchTVSeries = async ({
  query,
  genreId,
  sortBy,
}: {
  query?: string;
  genreId?: number | string | null;
  sortBy?: string;
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
    endpoint = `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}`;
    endpoint += "&vote_count.gte=1";
  } else if (genreId) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/tv?with_genres=${genreId}&sort_by=${sortParam}`;
  } else if (sortBy) {
    endpoint = `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=${sortParam}`;
    endpoint += "&vote_count.gte=200";

  } else {
    endpoint = `${TMDB_CONFIG.BASE_URL}/trending/tv/week`;
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
        return data.results.filter((item: any) => item.vote_count > 0 && item.poster_path);
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
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}?api_key=${TMDB_CONFIG.API_KEY}`,
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