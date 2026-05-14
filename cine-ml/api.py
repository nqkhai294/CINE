import pickle
import pandas as pd
import os
import numpy as np
from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel, Field
from sklearn.metrics.pairwise import cosine_similarity
from surprise import dump as surprise_dump

app = FastAPI()

class Interaction(BaseModel):
    movie_id: int
    rating: float

class CBRequest(BaseModel):
    user_id: int
    top_n: int
    interactions: list[Interaction]


class SearchRerankRequest(BaseModel):
    interactions: list[Interaction]
    candidate_ids: list[int]


class SimilarRerankRequest(BaseModel):
    interactions: list[Interaction]
    top_n: int = 30


class CFUserRequest(BaseModel):
    """Lọc cộng tác (SVD Surprise): chỉ cần user_id; limit = số phim trả về."""

    user_id: int
    limit: int = Field(default=15, ge=1, le=100)


def build_user_profile(interactions_df, tfidf_matrix, indices):
    user_profile = np.zeros(tfidf_matrix.shape[1], dtype=float)
    for row in interactions_df:
        item_id = int(row.movie_id)
        rating = row.rating
        if item_id in indices:
            item_index = indices[item_id]
            item_vector = tfidf_matrix[item_index].toarray().ravel()
            user_profile += rating * item_vector

    norm = np.linalg.norm(user_profile)
    if norm > 0:
        user_profile = user_profile / norm
    return user_profile


def get_similar_candidate_ids(movie_id: int, candidate_pool: int = 30):
    if movie_id not in indices:
        return []

    idx = indices[movie_id]
    similarities = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).ravel()
    ranked_indices = similarities.argsort()[::-1]

    candidate_ids = []
    for row_idx in ranked_indices:
        mid = int(data.iloc[row_idx]["id"])
        if mid == movie_id:
            continue
        candidate_ids.append(mid)
        if len(candidate_ids) >= candidate_pool:
            break
    return candidate_ids


def rerank_candidate_ids(interactions, candidate_ids):
    if not candidate_ids:
        return []

    if not interactions:
        return candidate_ids

    user_profile = build_user_profile(interactions, tfidf_matrix, indices)
    if np.all(user_profile == 0):
        return candidate_ids

    pairs = []
    for pos, mid in enumerate(candidate_ids):
        if mid not in indices:
            pairs.append((float("-inf"), pos, mid))
            continue
        row_idx = indices[mid]
        vec = tfidf_matrix[row_idx]
        sim = float(cosine_similarity(user_profile.reshape(1, -1), vec)[0][0])
        pairs.append((sim, pos, mid))

    pairs.sort(key=lambda x: (-x[0], x[1]))
    return [p[2] for p in pairs]


print("Loading model...")
base_dir = os.path.dirname(__file__)
try:
    model_dir = os.path.join(base_dir, "model", "content-based")
    tfidf_matrix = pickle.load(open(os.path.join(model_dir, "tfidf_matrix.pkl"), "rb"))
    data = pickle.load(open(os.path.join(model_dir, "movie_data.pkl"), "rb"))
    data["id"] = data["id"].astype(int)

    indices = pd.Series(data.index, index=data["id"]).drop_duplicates()
    print("Model loaded successfully")
except Exception as e:
    print(f"Model loading error: {e}")
    tfidf_matrix = None
    data = None
    indices = None

cf_algo = None
try:
    cf_dump_path = os.path.join(
        base_dir, "model", "collaborative-filtering", "cf_surprise.dump"
    )
    if os.path.isfile(cf_dump_path):
        _, cf_algo = surprise_dump.load(cf_dump_path)
        print("CF (SVD) loaded:", cf_dump_path)
    else:
        print("CF dump không có (tùy chọn):", cf_dump_path)
except Exception as e:
    cf_algo = None
    print(f"CF load bỏ qua: {e}")


def _cf_raw_user_id(trainset, user_id: int):
    for candidate in (user_id, str(user_id)):
        if trainset.knows_user(candidate):
            return candidate
    return None


def _rated_movie_ids_from_trainset(trainset, raw_uid):
    inner_uid = trainset.to_inner_uid(raw_uid)
    return {
        int(trainset.to_raw_iid(i_inner))
        for i_inner, _ in trainset.ur[inner_uid]
    }


def cf_recommend_movie_ids(algo, user_id: int, limit: int):
    """Trả về danh sách movie_id."""
    trainset = algo.trainset
    uid = _cf_raw_user_id(trainset, user_id)
    if uid is None:
        return [], "unknown_user"

    rated = _rated_movie_ids_from_trainset(trainset, uid)
    preds = []
    for inner_iid in trainset.all_items():
        raw_iid = trainset.to_raw_iid(inner_iid)
        mid = int(raw_iid)
        if mid in rated:
            continue
        est = algo.predict(uid, raw_iid).est
        preds.append((mid, float(est)))

    preds.sort(key=lambda x: -x[1])
    k = max(1, min(limit, 100))
    return [p[0] for p in preds[:k]], None


@app.get("/recommend/{movie_id}")
def get_recommendations(movie_id: int):
    if tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        recommended_ids = get_similar_candidate_ids(movie_id, candidate_pool=30)
        return {"status": "ok", "data": recommended_ids}
    except Exception as e:
        print(f"Recommendation error: {e}")
        return {"status": "error", "data": []}


@app.post("/recommend/{movie_id}/re-rank")
def get_recommendations_reranked(movie_id: int, request: SimilarRerankRequest):
    if tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        candidate_ids = get_similar_candidate_ids(movie_id, candidate_pool=30)
        if not candidate_ids:
            return {"status": "ok", "data": []}

        reranked_ids = rerank_candidate_ids(request.interactions, candidate_ids)
        top_n = max(1, min(request.top_n, 50))
        return {"status": "ok", "data": reranked_ids[:top_n]}
    except Exception as e:
        print(f"Recommendation rerank error: {e}")
        return {"status": "error", "data": []}


@app.post("/recommend/content-based")
def get_content_based_recommendations(request: CBRequest):
    """
    Hàm gợi ý dựa trên model CB. 
    """
    if tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        user_profile = build_user_profile(request.interactions, tfidf_matrix, indices)
        if np.all(user_profile == 0):
            return {"status": "ok", "data": []}

        similarities = cosine_similarity(user_profile.reshape(1, -1), tfidf_matrix).ravel()
        ranked_indices = similarities.argsort()[::-1]

        seen_movie_ids = {interaction.movie_id for interaction in request.interactions}
        top_n = max(1, min(request.top_n, 50))
        recommended_ids = []

        for idx in ranked_indices:
            movie_id = int(data.iloc[idx]["id"])
            if movie_id in seen_movie_ids:
                continue
            recommended_ids.append(movie_id)
            if len(recommended_ids) >= top_n:
                break

        return {"status": "ok", "data": recommended_ids}
    except Exception as e:
        print(f"Content-based recommendation error: {e}")
        return {"status": "error", "data": []}


@app.post("/search/re-rank")
def search_rerank(request: SearchRerankRequest):
    """
    Lấy danh sách id phim và interactions (rating) của user từ nodejs, sau đó build_user_profile, rồi sắp xếp 
    giảm dần theo cosine_similarity.
    """
    if tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        candidate_ids = [int(x) for x in request.candidate_ids]
        if not candidate_ids:
            return {"status": "ok", "data": []}

        sorted_ids = rerank_candidate_ids(request.interactions, candidate_ids)
        return {"status": "ok", "data": sorted_ids}
    except Exception as e:
        print(f"Search re-rank error: {e}")
        return {"status": "error", "data": request.candidate_ids}


@app.post("/recommend/cf/user")
def recommend_cf_for_user(request: CFUserRequest):
    """
    Hàm gợi ý dựa trên model CF. 
    """
    if cf_algo is None:
        return {"status": "ok", "data": [], "meta": {"reason": "no_model"}}

    try:
        ids, reason = cf_recommend_movie_ids(
            cf_algo, request.user_id, request.limit
        )
        meta = {"reason": reason} if reason else {}
        return {"status": "ok", "data": ids, "meta": meta}
    except Exception as e:
        print(f"CF recommend error: {e}")
        return {"status": "error", "data": [], "meta": {"reason": str(e)}}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)