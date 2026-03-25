const db = require("../db");

/**
 * GET /api/users/me/watch-progress?movie_id=...
 * Lấy tiến độ + cấu hình xem của user cho một phim (để restore khi mở trang xem)
 */
module.exports.getWatchProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.query.movie_id;

    if (!movieId) {
      return res.status(400).json({
        result: { status: "error", message: "movie_id is required" },
      });
    }

    const query = {
      text: `SELECT progress_seconds, duration, playback_rate, quality,
                    subtitle_lang, subtitle_enabled, skip_intro, updated_at
             FROM user_watch_progress
             WHERE user_id = $1 AND movie_id = $2`,
      values: [userId, movieId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(200).json({
        result: { status: "ok", message: "No progress yet" },
        data: null,
      });
    }

    const row = rows[0];
    res.status(200).json({
      result: { status: "ok", message: "success" },
      data: {
        currentTime: Number(row.progress_seconds),
        duration: row.duration != null ? Number(row.duration) : null,
        playbackRate: Number(row.playback_rate),
        quality: row.quality,
        subtitleLang: row.subtitle_lang,
        subtitleEnabled: Boolean(row.subtitle_enabled),
        skipIntro: Boolean(row.skip_intro),
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("getWatchProgress error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * PUT/PATCH /api/users/me/watch-progress
 * Body: { movie_id, current_time?, duration?, playback_rate?, quality?, subtitle_lang?, subtitle_enabled?, skip_intro? }
 */
module.exports.upsertWatchProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const b = req.body;

    const movie_id = b.movie_id;
    const current_time = b.current_time;
    const duration = b.duration;
    const playback_rate = b.playback_rate;
    const quality = b.quality;
    const subtitle_lang = b.subtitle_lang;
    const subtitle_enabled = b.subtitle_enabled;
    const skip_intro = b.skip_intro;

    const currentPercent = current_time / duration;
    let finalViewCount = 1;
    let finalMaxProgress = currentPercent;

    if (!movie_id) {
      return res.status(400).json({
        result: { status: "error", message: "movie_id is required" },
      });
    }

    // Kiểm tra phim tồn tại
    const movieCheck = await db.query("SELECT id FROM movies WHERE id = $1", [
      movie_id,
    ]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({
        result: { status: "error", message: "Movie not found" },
      });
    }

    // Lấy bản ghi hiện có (nếu có) để partial update — chỉ ghi đè field có trong body
    const existing = await db.query(
      `SELECT progress_seconds, duration, playback_rate, quality,
              subtitle_lang, subtitle_enabled, skip_intro, view_count, max_progress_percent
       FROM user_watch_progress
       WHERE user_id = $1 AND movie_id = $2`,
      [userId, movie_id],
    );
    const def = {
      progress_seconds: 0,
      duration: null,
      playback_rate: 1,
      quality: "auto",
      subtitle_lang: null,
      subtitle_enabled: false,
      skip_intro: false,
    };
    const existingRow = existing.rows[0];

    console.log("Existing watch progress:", existingRow);

    // Logic xử lý tăng view_count
    if (existingRow) {
      console.log("Existing view count:", existingRow.view_count);
      const oldPercent = existingRow.progress_seconds / existingRow.duration;

      // Tăng view count nếu user đã xem qua 85% phim và lần xem mới < 15%
      if (oldPercent >= 0.85 && currentPercent < 0.15) {
        finalViewCount = existingRow.view_count + 1;
      } else {
        finalViewCount = existingRow.view_count;
      }
    }

    // Logic xử lý max_progress
    if (existingRow) {
      if (finalMaxProgress < existingRow.max_progress_percent) {
        finalMaxProgress = existingRow.max_progress_percent;
      }
    }

    const merged = {
      progress_seconds:
        current_time !== undefined && current_time !== null
          ? Number(current_time)
          : (existingRow?.progress_seconds ?? def.progress_seconds),
      duration:
        duration !== undefined && duration !== null
          ? Number(duration)
          : (existingRow?.duration ?? def.duration),
      playback_rate:
        playback_rate !== undefined && playback_rate !== null
          ? Number(playback_rate)
          : (existingRow?.playback_rate ?? def.playback_rate),
      quality:
        quality !== undefined && quality !== null
          ? quality
          : (existingRow?.quality ?? def.quality),
      subtitle_lang:
        subtitle_lang !== undefined
          ? subtitle_lang
          : (existingRow?.subtitle_lang ?? def.subtitle_lang),
      subtitle_enabled:
        subtitle_enabled !== undefined
          ? Boolean(subtitle_enabled)
          : (existingRow?.subtitle_enabled ?? def.subtitle_enabled),
      skip_intro:
        skip_intro !== undefined
          ? Boolean(skip_intro)
          : (existingRow?.skip_intro ?? def.skip_intro),
      view_count: finalViewCount,
      max_progress_percent: finalMaxProgress,
    };

    const query = {
      text: `INSERT INTO user_watch_progress (
               user_id, movie_id, progress_seconds, duration,
               playback_rate, quality, subtitle_lang, subtitle_enabled, skip_intro, view_count, max_progress_percent
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (user_id, movie_id)
             DO UPDATE SET
               progress_seconds = EXCLUDED.progress_seconds,
               duration = EXCLUDED.duration,
               playback_rate = EXCLUDED.playback_rate,
               quality = EXCLUDED.quality,
               subtitle_lang = EXCLUDED.subtitle_lang,
               subtitle_enabled = EXCLUDED.subtitle_enabled,
               skip_intro = EXCLUDED.skip_intro,
               view_count = EXCLUDED.view_count,
               max_progress_percent = EXCLUDED.max_progress_percent,
               updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
      values: [
        userId,
        movie_id,
        merged.progress_seconds,
        merged.duration,
        merged.playback_rate,
        merged.quality,
        merged.subtitle_lang,
        merged.subtitle_enabled,
        merged.skip_intro,
        merged.view_count,
        merged.max_progress_percent,
      ],
    };

    const { rows } = await db.query(query);
    const row = rows[0];

    res.status(200).json({
      result: { status: "ok", message: "Watch progress saved" },
      data: {
        currentTime: Number(row.progress_seconds),
        duration: row.duration != null ? Number(row.duration) : null,
        playbackRate: Number(row.playback_rate),
        quality: row.quality,
        subtitleLang: row.subtitle_lang,
        subtitleEnabled: Boolean(row.subtitle_enabled),
        skipIntro: Boolean(row.skip_intro),
        viewCount: row.view_count,
        maxProgressPercent: row.max_progress_percent,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("upsertWatchProgress error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
