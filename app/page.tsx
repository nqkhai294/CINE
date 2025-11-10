import { MovieHero } from "@/components/movie-hero";
import { TopMoviesSection } from "@/components/top-movies-section";
import { sampleMovies } from "@/data/sample-movies";

export default function Home() {
  return (
    <main className="relative">
      <MovieHero movies={sampleMovies} />
      <TopMoviesSection title="Top 10 phim lẻ hôm nay" movies={sampleMovies} />
    </main>
  );
}
