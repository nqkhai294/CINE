import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Actor {
  id: number;
  name: string;
  profile_url: string | null;
}

export interface Director {
  id: number;
  name: string;
  profile_url: string | null;
}

export interface Movie {
  adult?: boolean;
  backdrop_url: string;
  genres: string[];
  id: string;
  original_language: string;
  original_title?: string;
  summary: string;
  popularity: number;
  poster_url: string;
  video_url: string;
  release_date: string;
  release_year: number;
  title: string;
  trailer_url: string;
  tmdb_vote_average: string;
  tmdb_vote_count: number;
  runtime: number;
  avg_rating: number;
  actors?: Actor[];
  directors?: Director[];
}

export interface User {
  id: number;
  user_id: number;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
}
