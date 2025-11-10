require("dotenv").config();
const axios = require("axios");
const db = require("./db");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// 1. Func get genres from TMDB
const seedGenres = async () => {
  try {
    console.log("Seeding genres...");
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY, language: "en-US" },
    });

    const genres = response.data.genres;
    let insertedCount = 0;

    for (const genre of genres) {
      // ON CONFLICT DO NOTHING để tránh lỗi khi chạy lại seeding
      const query = {
        text: `INSERT INTO genres (id, name) VALUES ($1, $2)
                   ON CONFLICT (id) DO NOTHING`,
        values: [genre.id, genre.name],
      };

      const res = await db.query(query);
      if (res.rowCount > 0) {
        insertedCount++;
      }
    }
    console.log(`Inserted genre: ${insertedCount}`);
  } catch (error) {
    console.error("Error seeding genres:", error.message);
  }
};

const getTrailerKey = async (movieId) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/videos`,
      {
        params: { api_key: TMDB_API_KEY, language: "en-US" },
      }
    );

    const videos = response.data.results;
    const trailer = videos.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    );

    if (trailer) {
      return `https://www.youtube.com/watch?v=${trailer.key}`;
    }
    return null;
  } catch (error) {
    console.warn(`Không tìm thấy video cho phim ${movieId}:`, error.message);
    return null;
  }
};

const seedCreditsForMovie = async (movieId) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/credits`,
      {
        params: { api_key: TMDB_API_KEY, language: "en-US" },
      }
    );

    const crew = response.data.crew;
    const cast = response.data.cast;

    // Insert directors
    const director = crew.find((person) => person.job === "Director");
    if (director) {
      await db.query({
        text: `INSERT INTO directors (id, name) VALUES ($1, $2)
               ON CONFLICT (id) DO NOTHING`,
        values: [director.id, director.name],
      });

      // insert into Movie_Directors
      await db.query({
        text: `INSERT INTO movie_directors (movie_id, director_id) VALUES ($1, $2)
               ON CONFLICT (movie_id, director_id) DO NOTHING`,
        values: [movieId, director.id],
      });
    }

    // Insert main cast (top 5)
    const top5Actors = cast.slice(0, 5);
    for (const actor of top5Actors) {
      await db.query({
        text: `INSERT INTO actors (id, name) 
               VALUES ($1, $2)
               ON CONFLICT (id) DO NOTHING`,
        values: [actor.id, actor.name],
      });

      // insert into Movie_Actors
      await db.query({
        text: `INSERT INTO movie_actors (movie_id, actor_id) VALUES ($1, $2)
               ON CONFLICT (movie_id, actor_id) DO NOTHING`,
        values: [movieId, actor.id],
      });
    }
    return true;
  } catch (error) {
    console.log(`Lỗi khi seeding credits cho phim ${movieId}:`, error.message);
    return false;
  }
};

const seedMovies = async () => {
  try {
    console.log("Bắt đầu lấy dữ liệu 1000 phim (50 trang)...");
    let moviesToInsert = [];
    for (let page = 1; page <= 50; page++) {
      // Lấy 500 phim (25 trang)
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          page: page,
        },
      });
      moviesToInsert.push(...response.data.results);
      // Delay nhẹ
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log(
      `Lấy được ${moviesToInsert.length} phim. Bắt đầu chèn/cập nhật CSDL...`
    );
    let insertedOrUpdatedCount = 0;

    // --- Vòng lặp 1: Chèn hoặc Cập nhật Phim ---
    for (const movie of moviesToInsert) {
      if (!movie.poster_path || !movie.overview || !movie.release_date)
        continue;

      // NÂNG CẤP: Thêm tất cả các trường mới vào câu INSERT
      const movieQuery = {
        text: `INSERT INTO Movies (
                   id, title, summary, poster_url, release_year,
                   backdrop_url, popularity, tmdb_vote_average, tmdb_vote_count, release_date, original_language
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 -- NÂNG CẤP: Đổi thành DO UPDATE để làm mới dữ liệu khi chạy lại
                 ON CONFLICT (id) DO UPDATE SET
                   title = EXCLUDED.title,
                   summary = EXCLUDED.summary,
                   poster_url = EXCLUDED.poster_url,
                   release_year = EXCLUDED.release_year,
                   backdrop_url = EXCLUDED.backdrop_url,
                   popularity = EXCLUDED.popularity,
                   tmdb_vote_average = EXCLUDED.tmdb_vote_average,
                   tmdb_vote_count = EXCLUDED.tmdb_vote_count,
                   release_date = EXCLUDED.release_date,
                   original_language = EXCLUDED.original_language
                 RETURNING id`, // Thêm RETURNING id để biết nó đã được xử lý
        values: [
          movie.id,
          movie.title,
          movie.overview, // Dữ liệu của bạn là 'overview'
          `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          parseInt(movie.release_date.split("-")[0]) || null,
          // Các giá trị mới
          movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
          movie.popularity,
          movie.vote_average,
          movie.vote_count,
          movie.release_date || null, // Lưu cả ngày phát hành đầy đủ
          movie.original_language,
        ],
      };

      const movieRes = await db.query(movieQuery);
      if (movieRes.rowCount > 0) {
        insertedOrUpdatedCount++;
      }

      // Chèn liên kết thể loại (an toàn vì có ON CONFLICT)
      for (const genreId of movie.genre_ids) {
        const genreQuery = {
          text: `INSERT INTO Movie_Genres (movie_id, genre_id)
                 VALUES ($1, $2)
                 ON CONFLICT (movie_id, genre_id) DO NOTHING`,
          values: [movie.id, genreId],
        };
        await db.query(genreQuery);
      }
    }
    console.log(`Đã chèn/cập nhật thành công ${insertedOrUpdatedCount} phim.`);

    // --- Vòng lặp 2: Cập nhật TRAILER (Tối ưu) ---
    // (Giữ nguyên không đổi)
    console.log("Đang tìm các phim thiếu trailer để cập nhật...");
    const { rows: moviesToUpdateTrailer } = await db.query(
      "SELECT id FROM Movies WHERE trailer_url IS NULL OR trailer_url = ''"
    );
    console.log(
      `Tìm thấy ${moviesToUpdateTrailer.length} phim cần cập nhật trailer.`
    );
    let updatedTrailerCount = 0;
    for (const movie of moviesToUpdateTrailer) {
      const trailerUrl = await getTrailerKey(movie.id);
      if (trailerUrl) {
        await db.query({
          text: `UPDATE Movies SET trailer_url = $1 WHERE id = $2`,
          values: [trailerUrl, movie.id],
        });
        updatedTrailerCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(
      `Đã cập nhật trailer thành công cho ${updatedTrailerCount} phim.`
    );

    // --- Vòng lặp 3: Cập nhật CREDITS (Tối ưu) ---
    // (Giữ nguyên không đổi)
    console.log("Đang tìm các phim thiếu đạo diễn/diễn viên để cập nhật...");
    const { rows: moviesToUpdateCredits } = await db.query(
      `SELECT M.id FROM Movies M
       LEFT JOIN Movie_Directors MD ON M.id = MD.movie_id
       WHERE MD.movie_id IS NULL`
    );
    console.log(
      `Tìm thấy ${moviesToUpdateCredits.length} phim cần cập nhật credits.`
    );
    let updatedCreditsCount = 0;
    for (const movie of moviesToUpdateCredits) {
      const success = await seedCreditsForMovie(movie.id);
      if (success) {
        updatedCreditsCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(
      `Đã cập nhật credits thành công cho ${updatedCreditsCount} phim.`
    );
  } catch (error) {
    console.error("Lỗi khi seeding movies:", error.message);
  }
};

const main = async () => {
  console.log("--Start SEED--");

  await seedGenres();
  await seedMovies();

  console.log("--Complete SEED--");
  // end process
  process.exit(0);
};

main();
