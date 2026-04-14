import pickle
import pandas as pd
import os
import numpy as np
from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

class Interaction(BaseModel):
    movie_id: int
    rating: float

class CBRequest(BaseModel):
    user_id: int
    top_n: int
    interactions: list[Interaction]


def build_user_profile(interactions_df, tfidf_matrix, indices):
    user_profile = np.zeros(tfidf_matrix.shape[1], dtype=float)
    for row in interactions_df:
        item_id = int(row.movie_id)
        rating = row.rating
        if item_id in indices:
            item_index = indices[item_id]
            item_vector = tfidf_matrix[item_index].toarray().ravel()
            user_profile += rating * item_vector
    return user_profile


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


@app.get("/recommend/{movie_id}")
def get_recommendations(movie_id: int):
    if tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        if movie_id not in indices:
            return {"status": "ok", "data": []}

        idx = indices[movie_id]

        sim_scores = list(
            enumerate(cosine_similarity(tfidf_matrix[idx], tfidf_matrix).ravel())
        )
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:11]

        movie_indices = [i[0] for i in sim_scores]
        recommended_ids = data["id"].iloc[movie_indices].tolist()

        return {"status": "ok", "data": recommended_ids}
    except Exception as e:
        print(f"Recommendation error: {e}")
        return {"status": "error", "data": []}


@app.post("/recommend/content-based")
def get_content_based_recommendations(request: CBRequest):
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)