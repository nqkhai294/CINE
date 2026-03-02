import { getHighestRatedMovies, getNewestMovies } from "@/api/api";
import { MovieHero } from "@/components/home/movie-hero";
import { TopMoviesSection } from "@/components/home/top-movies-section";
import { RecommendedGenresSection } from "@/components/home/recommended-genres-section";

export default async function Home() {
  const [highestRatedMovies, tenNewestMovies] = await Promise.all([
      getHighestRatedMovies(),
      getNewestMovies(),
    ]);

  return (
    <main className="relative">
      <MovieHero movies={highestRatedMovies} />

      <RecommendedGenresSection />

      <TopMoviesSection
        title="Top 10 phim mới cập nhật"
        movies={tenNewestMovies}
      />
    </main>
  );
}
