const axios = require("axios");
const db = require("../db");
const URL_ML = require("../environment/environment").URL_ML;

async function getUserRatingInteractions(userId) {
  const { rows } = await db.query(
    `SELECT movie_id, rating FROM ratings WHERE user_id = $1`,
    [userId],
  );
  return rows.map((r) => ({
    movie_id: Number(r.movie_id),
    rating: Number(r.rating),
  }));
}

/**
 * Gọi Python /search/re-rank. Lỗi → null.
 */
async function rerankSearchWithMl(interactions, candidateIds) {
  if (!candidateIds.length || !interactions.length) return null;
  try {
    const response = await axios.post(
      `${URL_ML}/search/re-rank`,
      {
        interactions,
        candidate_ids: candidateIds,
      },
      { timeout: 15000 },
    );
    if (
      response.data &&
      response.data.status === "ok" &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data.map((id) => Number(id));
    }
  } catch (err) {
    console.error("ML search re-rank:", err.message);
  }
  return null;
}

function orderRowsByIds(rows, idOrder) {
  const byId = new Map(rows.map((r) => [Number(r.id), r]));
  const ordered = [];
  const seen = new Set();
  for (const id of idOrder) {
    const row = byId.get(id);
    if (row) {
      ordered.push(row);
      seen.add(id);
    }
  }
  for (const r of rows) {
    const id = Number(r.id);
    if (!seen.has(id)) ordered.push(r);
  }
  return ordered;
}

module.exports = {
  getUserRatingInteractions,
  rerankSearchWithMl,
  orderRowsByIds,
};
