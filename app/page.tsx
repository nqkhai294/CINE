import { getMovies, getHighestRatedMovies, getNewestMovies } from "@/api/api";
import { MovieHero } from "@/components/home/movie-hero";
import { TopMoviesSection } from "@/components/home/top-movies-section";

export default async function Home() {
  const [highestRatedMovies, tenNewestMovies, allMovies] = await Promise.all([
    getHighestRatedMovies(),
    getNewestMovies(),
    getMovies(),
  ]);

  return (
    <main className="relative">
      <MovieHero movies={highestRatedMovies} />
      <TopMoviesSection
        title="Top 10 phim mới cập nhật"
        movies={tenNewestMovies}
      />
    </main>
  );
}
