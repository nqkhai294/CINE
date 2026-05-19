# CINE

Hệ thống xem phim CINE gồm 3 phần:

- `cine_backend`: API Node.js/Express
- `cine_frontend`: Next.js
- `cine-ml`: Python/FastAPI

Tài liệu này hướng dẫn cách cài đặt và chạy hệ thống với Docker Desktop.

## 1. Lấy mã nguồn

```bash
git clone https://github.com/nqkhai294/CINE.git
cd CINE
```

## 2. Tạo file môi trường

Tạo file `.env.production` trong 3 thư mục `cine_frontend`, `cine_backend`, và `cine_ml` với nội dung mẫu như file `.env.production.example`.

<Để có kết quả chạy thuận lợi nhất, truy cập `https://drive.google.com/drive/folders/1fp_SaMCidTm0lsTsL2w_PbLzVuAU7AZU` để lấy file .env chuẩn>

## 3. Chạy bằng Docker Desktop

Repo đã có sẵn cấu hình Docker cho cả 3 service ở root:

- `docker-compose.prod.yml`
- `cine_backend/Dockerfile`
- `cine_frontend/Dockerfile`
- `cine-ml/Dockerfile`

### 3.1 Build và chạy toàn bộ hệ thống

Truy cập Docker Desktop và bật Terminal ở góc phải màn hình.
cd vào thư mục CINE

Từ thư mục gốc của project, chạy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3.2 Kiểm tra trạng thái container

```bash
docker compose -f docker-compose.prod.yml ps
```

### 3.3 Xem log

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### 3.4 Dừng hệ thống

```bash
docker compose -f docker-compose.prod.yml down
```

## Truy cập localhost:3000 để trải nghiệm
