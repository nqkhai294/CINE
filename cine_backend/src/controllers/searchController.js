const db = require("../db");
const {
  getUserRatingInteractions,
  rerankSearchWithMl,
} = require("../utils/searchRerank");

const MAX_SEARCH_RERANK_POOL = 200;
const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 50;

const SEARCH_GENRES_SUBQUERY = `COALESCE(
               (SELECT JSON_AGG(g.name)
                FROM Movie_Genres mg
                JOIN Genres g ON mg.genre_id = g.id
                WHERE mg.movie_id = m.id),
               '[]'::json
             ) AS genres`;

async function fetchSearchFullByIdsOrdered(ids) {
  if (!ids.length) return [];
  const { rows } = await db.query(
    `SELECT m.*, ${SEARCH_GENRES_SUBQUERY}
     FROM movies m
     WHERE m.id = ANY($1::int[])
     ORDER BY array_position($2::int[], m.id::int)`,
    [ids, ids],
  );
  return rows;
}

async function fetchSearchSqlSlice(keyword, sqlOffset, sqlLimit) {
  if (sqlLimit <= 0) return [];
  const { rows } = await db.query(
    `SELECT m.*, ${SEARCH_GENRES_SUBQUERY}
     FROM movies m
     WHERE m.title ILIKE '%' || $1 || '%'
     ORDER BY m.popularity DESC NULLS LAST
     OFFSET $2 LIMIT $3`,
    [keyword, sqlOffset, sqlLimit],
  );
  return rows;
}

module.exports.searchMovies = async (req, res) => {
  try {
    const keywordRaw = req.query.keyword;
    if (!keywordRaw || String(keywordRaw).trim() === "") {
      return res.status(400).json({ message: "Missing search keyword!" });
    }
    const keyword = String(keywordRaw).trim();

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    let limit = parseInt(String(req.query.limit), 10) || DEFAULT_SEARCH_LIMIT;
    limit = Math.min(MAX_SEARCH_LIMIT, Math.max(1, limit));
    const offset = (page - 1) * limit;

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM movies m WHERE m.title ILIKE '%' || $1 || '%'`,
      [keyword],
    );
    const total = countRows[0].total;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    let data = [];
    let personalized = false;

    if (total === 0) {
      data = [];
    } else if (req.user) {
      const interactions = await getUserRatingInteractions(req.user.id);
      if (interactions.length > 0) {
        const { rows: poolRows } = await db.query(
          `SELECT m.id FROM movies m WHERE m.title ILIKE '%' || $1 || '%' ORDER BY m.popularity DESC NULLS LAST LIMIT $2`,
          [keyword, MAX_SEARCH_RERANK_POOL],
        );
        const poolIds = poolRows.map((r) => Number(r.id));
        const M = poolIds.length;

        if (M === 0) {
          data = [];
        } else {
          const mlOrder = await rerankSearchWithMl(interactions, poolIds);
          const rankedIds = mlOrder || poolIds;
          personalized = Boolean(mlOrder);

          const start = offset;
          const end = Math.min(start + limit, total);

          if (start >= total) {
            data = [];
          } else if (end <= M) {
            data = await fetchSearchFullByIdsOrdered(
              rankedIds.slice(start, end),
            );
          } else if (start >= M) {
            data = await fetchSearchSqlSlice(keyword, start, end - start);
          } else {
            const idsHead = rankedIds.slice(start, M);
            const headRows = await fetchSearchFullByIdsOrdered(idsHead);
            const tailRows = await fetchSearchSqlSlice(keyword, M, end - M);
            data = [...headRows, ...tailRows];
          }
        }
      } else {
        data = await fetchSearchSqlSlice(keyword, offset, limit);
      }
    } else {
      data = await fetchSearchSqlSlice(keyword, offset, limit);
    }

    res.status(200).json({
      result: {
        status: "ok",
        message: "Search completed successfully",
      },
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      personalized,
    });
  } catch (error) {
    console.log("Error when searching movies", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logSearch = async (req, res) => {
  try {
    console.log("req.body", req.body);

    const { keyword } = req.body;
    const userId = req.user.id;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Missing search keyword!" });
    }

    const query = {
      text: `INSERT INTO search_history (user_id, keyword)
                   VALUES ($1, $2)`,
      values: [userId, keyword.trim()],
    };

    await db.query(query);

    res.status(201).json({
      result: {
        status: "ok",
        message: "Search logged successfully",
      },
    });
  } catch (error) {
    console.log("Error when log search", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
