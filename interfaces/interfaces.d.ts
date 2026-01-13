interface BaseMovie {
  id: number;
  title: string;
  adult: boolean;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  backdrop_path: string | null;
  poster_path: string | null;
}

interface Movie extends BaseMovie {
  genre_ids: number[];
}

interface MovieDetails extends BaseMovie {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
}

interface TVSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

interface TVSeriesDetails extends TVSeries {
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  networks: {
    name: string;
    id: number;
    logo_path: string | null;
    origin_country: string;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  status: string;
  tagline: string;
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }[];
}

interface SeasonDetails {
  _id: string;
  air_date: string;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
}

interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface TrendingSeries {
  series_id: number;
  name: string;
  count: number;
  poster_url: string;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

interface ReviewDocument {
  $id: string;
  movie_id?: number;
  series_id?: number;
  user_id: string;
  username: string;
  avatar_url: string;
  rating: number;
  content: string;
  title: string;
  poster_path: string;
  $createdAt: string;
}