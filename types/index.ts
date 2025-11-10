import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Movie {
  adult?: boolean;
  backdrop_url: string;
  genres: number[];
  id: number;
  original_language: string;
  original_title?: string;
  summary: string;
  popularity: number;
  poster_url: string;
  release_date: string;
  release_year: string;
  title: string;
  trailer_url: boolean;
  tmdb_vote_average: number;
  tmdb_vote_count: number;
}

export interface MovieDetail extends Movie {
  actors: { name: string }[];
  directors: { name: string }[];
}
