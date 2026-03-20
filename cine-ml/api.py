import pickle
import pandas as pd
import os
from fastapi import FastAPI, HTTPException
import uvicorn

app = FastAPI()

# --- 1. LOAD MODEL (CHỈ CHẠY 1 LẦN KHI SERVER BẮT ĐẦU) ---
print("⏳ Đang tải model vào bộ nhớ...")
base_dir = os.path.dirname(__file__)
try:
    cosine_sim = pickle.load(open(os.path.join(base_dir, 'cosine_similarity_matrix.pkl'), 'rb'))
    data = pickle.load(open(os.path.join(base_dir, 'movie_data.pkl'), 'rb'))
    
    # Tạo map index sẵn để tra cứu nhanh
    indices = pd.Series(data.index, index=data['id']).drop_duplicates()
    print("✅ Model đã tải xong! API sẵn sàng.")
except Exception as e:
    print(f"❌ Lỗi tải model: {e}")
    cosine_sim = None
    data = None
    indices = None

# --- 2. ĐỊNH NGHĨA API ---
@app.get("/recommend/{movie_id}")
def get_recommendations(movie_id: int):
    if cosine_sim is None:
        raise HTTPException(status_code=500, detail="Model chưa được tải")

    try:
        if movie_id not in indices:
            return {"status": "ok", "data": []}

        idx = indices[movie_id]
        
        # Tính toán (Siêu nhanh vì model đã nằm trong RAM)
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:11]
        
        movie_indices = [i[0] for i in sim_scores]
        recommended_ids = data['id'].iloc[movie_indices].tolist()
        
        return {"status": "ok", "data": recommended_ids}

    except Exception as e:
        print(f"Lỗi: {e}")
        return {"status": "error", "data": []}

# Chạy server nếu file được execute trực tiếp
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)