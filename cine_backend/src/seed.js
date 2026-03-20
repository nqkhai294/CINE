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

async function seedCreditsForMovie(movieId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/credits`,
      {
        params: { api_key: TMDB_API_KEY, language: "en-US" },
      }
    );

    const crew = response.data.crew;
    const cast = response.data.cast;

    // 1. Tìm và chèn Đạo diễn (KÈM ẢNH)
    const director = crew.find((person) => person.job === "Director");
    if (director) {
      // Tạo URL ảnh (w185 là size ảnh chân dung)
      const directorProfileUrl = director.profile_path
        ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
        : null;

      // Chèn vào bảng Directors (nếu chưa có)
      // NÂNG CẤP: Thêm profile_url và ON CONFLICT DO UPDATE
      await db.query({
        text: `INSERT INTO Directors (id, name, profile_url) VALUES ($1, $2, $3)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 profile_url = EXCLUDED.profile_url`,
        values: [director.id, director.name, directorProfileUrl],
      });
      // Chèn vào bảng liên kết Movie_Directors (nếu chưa có)
      await db.query({
        text: `INSERT INTO Movie_Directors (movie_id, director_id) VALUES ($1, $2)
               ON CONFLICT (movie_id, director_id) DO NOTHING`,
        values: [movieId, director.id],
      });
    }

    // 2. Tìm và chèn 5 Diễn viên chính (KÈM ẢNH)
    const top5Actors = cast.slice(0, 5); // Lấy 5 người đầu
    for (const actor of top5Actors) {
      // Tạo URL ảnh
      const actorProfileUrl = actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : null;

      // Chèn vào bảng Actors (nếu chưa có)
      // NÂNG CẤP: Thêm profile_url và ON CONFLICT DO UPDATE
      await db.query({
        text: `INSERT INTO Actors (id, name, profile_url) VALUES ($1, $2, $3)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 profile_url = EXCLUDED.profile_url`,
        values: [actor.id, actor.name, actorProfileUrl],
      });
      // Chèn vào bảng liên kết Movie_Actors (nếu chưa có)
      await db.query({
        text: `INSERT INTO Movie_Actors (movie_id, actor_id) VALUES ($1, $2)
               ON CONFLICT (movie_id, actor_id) DO NOTHING`,
        values: [movieId, actor.id],
      });
    }
    return true; // Báo hiệu thành công
  } catch (error) {
    console.warn(`(Bỏ qua) Lỗi khi lấy credits cho phim ${movieId}.`);
    return false;
  }
}

const seedMovies = async () => {
  try {
    console.log("Bắt đầu lấy dữ liệu 1000 phim (50 trang)...");
    let moviesToInsert = [];
    for (let page = 1; page <= 50; page++) {
      // Lấy 1000 phim (50 trang)
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

      const movieQuery = {
        text: `INSERT INTO Movies (
                   id, title, summary, poster_url, release_year,
                   backdrop_url, popularity, tmdb_vote_average, tmdb_vote_count, release_date, original_language
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
                 RETURNING id`,
        values: [
          movie.id,
          movie.title,
          movie.overview,
          `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          parseInt(movie.release_date.split("-")[0]) || null,
          movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
          movie.popularity,
          movie.vote_average,
          movie.vote_count,
          movie.release_date || null,
          movie.original_language,
        ],
      };

      const movieRes = await db.query(movieQuery);
      if (movieRes.rowCount > 0) {
        insertedOrUpdatedCount++;
      }

      // Chèn liên kết thể loại
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

    // --- (PHẦN MỚI) Vòng lặp 4: Cập nhật RUNTIME (Tối ưu) ---
    console.log("Đang tìm các phim thiếu thời lượng (runtime) để cập nhật...");
    // 1. Tìm các phim chưa có runtime
    const { rows: moviesToUpdateRuntime } = await db.query(
      "SELECT id FROM Movies WHERE runtime IS NULL OR runtime = 0" // Thêm 'OR runtime = 0'
    );
    console.log(
      `Tìm thấy ${moviesToUpdateRuntime.length} phim cần cập nhật runtime.`
    );

    let updatedRuntimeCount = 0;
    for (const movie of moviesToUpdateRuntime) {
      try {
        // 2. Gọi API chi tiết phim CHỈ để lấy runtime
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}`, {
          params: { api_key: TMDB_API_KEY, language: "vi-VN" }, // Lấy tiếng Việt nếu có
        });

        const runtime = response.data.runtime; // Lấy runtime (số phút)

        if (runtime && runtime > 0) {
          // Chỉ cập nhật nếu runtime hợp lệ
          // 3. Cập nhật vào CSDL
          await db.query({
            text: `UPDATE Movies SET runtime = $1 WHERE id = $2`,
            values: [runtime, movie.id],
          });
          updatedRuntimeCount++;
        }
      } catch (error) {
        // Nếu phim 404 hoặc lỗi, cứ bỏ qua
        console.warn(`(Bỏ qua) Không thể lấy runtime cho phim ${movie.id}.`);
      }
      // Delay để tránh bị block
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(
      `Đã cập nhật runtime thành công cho ${updatedRuntimeCount} phim.`
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
