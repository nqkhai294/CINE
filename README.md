
# CINE
Hệ thống xem phim trực tuyến hỗ trợ cá nhân hóa người dùng.

# Giới thiệu
Cine là một nền tảng website xem phim trực tuyến hiện đại, tích hợp công cụ gợi ý phim cá nhân hóa (Recommender System). Nền tảng cung cấp các chức năng cơ bản của một website xem phim, đồng thời sử dụng dữ liệu người dùng để cá nhân hóa theo từng cá nhân. Hệ thống sử dụng kết hợp hai thuật toán gợi ý bao gồm lọc cộng tác (Collaborative Filtering) và lọc dựa trên nội dung (Content-Based Filtering) để tối ưu hóa trải nghiệm người dùng. Hiệu quả của hai thuật toán được thử nghiệm dựa trên tập dữ liệu MovieLens 100K.

Cấu trúc dự án gồm 3 phần: 
- `cine_backend`: API Node.js/Express
- `cine_frontend`: Next.js
- `cine-ml`: Python/FastAPI


## Cài đặt
Dưới đây là hướng dẫn cài đặt và chạy nền tảng với Docker Desktop.

### 1. Cài đặt Docker Desktop
Tải và cài đặt Docker Desktop, link tải `https://www.docker.com/`

### 2. Lấy mã nguồn

```bash
git clone https://github.com/nqkhai294/CINE.git
cd CINE
```

### 3. Tạo file môi trường

Tạo file `.env.production` trong 3 thư mục `cine_frontend`, `cine_backend`, và `cine_ml` với nội dung mẫu như file `.env.production.example`.

<Để có kết quả chạy thuận lợi nhất, truy cập `https://drive.google.com/drive/folders/1fp_SaMCidTm0lsTsL2w_PbLzVuAU7AZU` để lấy file .env.production chuẩn>

### 4. Chạy bằng Docker Desktop
Repo đã có sẵn cấu hình Docker cho cả 3 service ở root:

- `docker-compose.prod.yml`
- `cine_backend/Dockerfile`
- `cine_frontend/Dockerfile`
- `cine-ml/Dockerfile`

Truy cập Docker Desktop và bật Terminal ở góc phải màn hình.
cd vào thư mục CINE

Từ thư mục gốc của project, chạy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### 4.1. Kiểm tra trạng thái container

```bash
docker compose -f docker-compose.prod.yml ps
```

#### 4.2. Xem log

```bash
docker compose -f docker-compose.prod.yml logs -f
```


## Cách sử dụng
Sau khi chạy Docker, nền tảng được chạy ở `localhost:3000`. Về backend chạy ở `localhost:4200` và Python Service chạy ở `localhost:80000`.

### 4.3. Dừng hệ thống

```bash
docker compose -f docker-compose.prod.yml down
```

## Công nghệ sử dụng
* **Frontend Client:** Next.js (React), Tailwind CSS, Redux Toolkit.
* **Backend Server:** Node.js, Express.
* **Machine Learning Service:** Python, FastAPI, Pandas, Scikit-learn, Surprise.
* **Database-as-a-Service:** PostgreSQL (Hosted trên **Supabase**).
* **Containerization:** Docker & Docker Compose.


## Lời cảm ơn
Tôi xin cảm ơn TS. Nguyễn Thu Trang đã đồng hành, cho ý kiến để tôi hoàn thiện dự án này. 
    
