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
    console.log("Bắt đầu lấy dữ liệu phim (movies)...");
    let moviesToInsert = [];
    for (let page = 1; page <= 5; page++) {
      // Vẫn lấy 100 phim (5 trang)
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          page: page,
        },
      });
      moviesToInsert.push(...response.data.results);
    }

    console.log(
      `Lấy được ${moviesToInsert.length} phim. Bắt đầu chèn vào CSDL...`
    );
    let insertedMovieCount = 0;
    let movieIdsToUpdateTrailer = []; // Lưu ID để cập nhật trailer sau

    for (const movie of moviesToInsert) {
      if (!movie.poster_path || !movie.overview) continue;

      const movieQuery = {
        text: `INSERT INTO Movies (id, title, summary, poster_url, release_year)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (id) DO NOTHING
               RETURNING id`, // Bỏ trailer_url khỏi INSERT
        values: [
          movie.id,
          movie.title,
          movie.overview,
          `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          parseInt(movie.release_date.split("-")[0]) || null,
        ],
      };

      const movieRes = await db.query(movieQuery);

      if (movieRes.rowCount > 0) {
        insertedMovieCount++;
        const insertedMovieId = movieRes.rows[0].id;
        movieIdsToUpdateTrailer.push(insertedMovieId); // Thêm ID vào danh sách chờ

        // Chèn vào bảng Movie_Genres (không đổi)
        for (const genreId of movie.genre_ids) {
          const genreQuery = {
            text: `INSERT INTO Movie_Genres (movie_id, genre_id)
                   VALUES ($1, $2)
                   ON CONFLICT (movie_id, genre_id) DO NOTHING`,
            values: [insertedMovieId, genreId],
          };
          await db.query(genreQuery);
        }
      }
    }
    console.log(`Đã chèn thành công ${insertedMovieCount} phim mới.`);

    // --- Bắt đầu quá trình CẬP NHẬT TRAILER ---
    console.log(
      `Bắt đầu cập nhật trailer cho ${movieIdsToUpdateTrailer.length} phim...`
    );
    let updatedTrailerCount = 0;
    for (const movieId of movieIdsToUpdateTrailer) {
      const trailerUrl = await getTrailerKey(movieId);
      if (trailerUrl) {
        const updateQuery = {
          text: `UPDATE Movies SET trailer_url = $1 WHERE id = $2`,
          values: [trailerUrl, movieId],
        };
        await db.query(updateQuery);
        updatedTrailerCount++;
      }
      // Thêm một chút delay để tránh bị TMDB chặn vì gọi API quá nhanh
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(
      `Đã cập nhật trailer thành công cho ${updatedTrailerCount} phim.`
    );
  } catch (error) {
    console.error("Lỗi khi seeding movies:", error.message);
  }
};

const seedMovies = async () => {
  try {
    console.log("Bắt đầu lấy dữ liệu phim (movies)...");
    let moviesToInsert = [];
    for (let page = 1; page <= 5; page++) {
      // Lấy 100 phim (5 trang)
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          page: page,
        },
      });
      moviesToInsert.push(...response.data.results);
    }

    console.log(
      `Lấy được ${moviesToInsert.length} phim. Bắt đầu chèn/cập nhật CSDL...`
    );
    let insertedMovieCount = 0;

    // 1. Chèn phim MỚI (bỏ qua phim cũ)
    // Vẫn giữ logic cũ để thêm phim mới nếu có
    for (const movie of moviesToInsert) {
      if (!movie.poster_path || !movie.overview) continue;

      const movieQuery = {
        text: `INSERT INTO Movies (id, title, summary, poster_url, release_year)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (id) DO NOTHING`,
        values: [
          movie.id,
          movie.title,
          movie.overview,
          `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          parseInt(movie.release_date.split("-")[0]) || null,
        ],
      };

      const movieRes = await db.query(movieQuery);
      if (movieRes.rowCount > 0) {
        insertedMovieCount++;
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
    console.log(`Đã chèn thành công ${insertedMovieCount} phim MỚI.`);

    // --- BẮT ĐẦU QUÁ TRÌNH CẬP NHẬT TRAILER (ĐÃ TỐI ƯU) ---
    console.log("Đang tìm các phim thiếu trailer để cập nhật...");

    // 2. CHỈ LẤY những phim đang thiếu trailer từ CSDL
    const { rows: moviesToUpdate } = await db.query(
      "SELECT id FROM Movies WHERE trailer_url IS NULL OR trailer_url = ''"
    );

    if (moviesToUpdate.length === 0) {
      console.log("Tất cả phim đều đã có trailer. Không cần cập nhật.");
      // Không cần làm gì thêm, kết thúc phần này
      return;
    }

    console.log(`Tìm thấy ${moviesToUpdate.length} phim cần cập nhật trailer.`);
    let updatedTrailerCount = 0;

    // 3. CHỈ LẶP QUA những phim thực sự thiếu
    for (const movie of moviesToUpdate) {
      const trailerUrl = await getTrailerKey(movie.id); // movie.id từ CSDL
      if (trailerUrl) {
        const updateQuery = {
          text: `UPDATE Movies SET trailer_url = $1 WHERE id = $2`,
          values: [trailerUrl, movie.id],
        };
        await db.query(updateQuery);
        updatedTrailerCount++;
      }
      // Delay để tránh bị API rate limit
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(
      `Đã cập nhật trailer thành công cho ${updatedTrailerCount} phim.`
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
