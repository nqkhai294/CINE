# ml_model/get_content_recs.py
import sys
import pandas as pd
import pickle
import os

def get_recommendations(movie_id, cosine_sim_matrix, data):
    try:
        # 1. Tạo "bản đồ" tra cứu ID -> Vị trí (index)
        indices = pd.Series(data.index, index=data['id']).drop_duplicates()
        
        # 2. Lấy vị trí (index) của phim trong ma trận
        idx = indices[movie_id]

        # 3. Lấy điểm tương đồng
        sim_scores = list(enumerate(cosine_sim_matrix[idx]))

        # 4. Sắp xếp
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # 5. Lấy 15 phim đầu (bỏ qua phim đầu tiên, vì đó là chính nó)
        sim_scores = sim_scores[1:16]

        # 6. Lấy ID của 15 phim đó
        movie_indices = [i[0] for i in sim_scores]
        
        # 7. Trả về ID, không phải title
        return data['id'].iloc[movie_indices]

    except KeyError:
        # Nếu không tìm thấy ID, trả về mảng rỗng
        return []
    except Exception as e:
        print(f"Error in Python: {e}")
        return []

# --- HÀM CHÍNH (MAIN) ---
if __name__ == "__main__":
    
    # 1. Lấy ID phim từ Node.js (Node.js sẽ truyền nó vào đây)
    # sys.argv[1] là đối số (argument) đầu tiên được truyền vào
    try:
        input_movie_id = int(sys.argv[1])
    except:
        print("Lỗi: Cần truyền vào movie_id (dạng số).")
        sys.exit(1) # Thoát với mã lỗi
    
    # 2. Định nghĩa đường dẫn file (để script biết load file ở đâu)
    base_dir = os.path.dirname(__file__) # Thư mục hiện tại (ml_model)
    sim_matrix_path = os.path.join(base_dir, 'cosine_similarity_matrix.pkl')
    movie_data_path = os.path.join(base_dir, 'movie_data.pkl')

    # 3. Load "bộ não" đã lưu
    try:
        cosine_sim = pickle.load(open(sim_matrix_path, 'rb'))
        data = pickle.load(open(movie_data_path, 'rb'))
    except Exception as e:
        print(f"Lỗi: Không thể load file model .pkl. Lỗi: {e}")
        sys.exit(1)

    # 4. Chạy hàm gợi ý
    recommendations = get_recommendations(input_movie_id, cosine_sim, data)
    
    # 5. PRINT kết quả
    # Đây là bước quan trọng nhất. Node.js sẽ "nghe" thấy dòng print này.
    # Chúng ta in ra một danh sách ID, cách nhau bằng dấu phẩy
    # ví dụ: "787699,872585,1022789"
    if len(recommendations) > 0:
    # Nếu recommendations là Pandas, .tolist() là cần thiết
    # Nếu nó đã là list, .tolist() không ảnh hưởng gì (nhưng nên kiểm tra)
        try:
            # Thử gọi .tolist() (nếu là Pandas)
            rec_list = recommendations.tolist()
        except AttributeError:
            # Nếu lỗi, nó đã là một list rồi
            rec_list = recommendations

        print(','.join(map(str, rec_list)))
    else:
        print("") # In ra chuỗi rỗng nếu không có gợi ý