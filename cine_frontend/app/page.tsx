import {
  getHighestRatedMovies,
  getNewestMovies,
  getTrendingRatedMovies,
} from "@/api/api";
import { MovieHero } from "@/components/home/movie-hero";
import { TopMoviesSection } from "@/components/home/top-movies-section";
import { RecommendedGenresSection } from "@/components/home/recommended-genres-section";
import { RecentlyWatchedSection } from "@/components/home/recently-watched-section";

export default async function Home() {
  const [highestRatedMovies, trendingMovies, tenNewestMovies] =
    await Promise.all([
      getHighestRatedMovies(),
      getTrendingRatedMovies(),
      getNewestMovies(),
    ]);

  return (
    <main className="relative">
      <MovieHero movies={highestRatedMovies} />

      <RecentlyWatchedSection />

      <RecommendedGenresSection />

      {trendingMovies.length > 0 && (
        <TopMoviesSection
          title="Các phim đang xu hướng"
          movies={trendingMovies}
        />
      )}

      <TopMoviesSection
        title="10 phim mới cập nhật"
        movies={tenNewestMovies}
      />
    </main>
  );
}
