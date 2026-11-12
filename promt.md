Bạn là một Senior Full-stack Developer, AI Engineer và System Architect chuyên nghiệp. Hãy xây dựng hoàn chỉnh từ đầu đến cuối dự án phần mềm có tên: "Nền tảng phát nhạc trực tuyến và quản lý nội dung âm nhạc ứng dụng trí tuệ nhân tạo và GIS" (Dựa trên đồ án chuyên ngành).

Yêu cầu dự án phải bao gồm toàn bộ mã nguồn (Source Code), cấu trúc thư mục, thiết kế cơ sở dữ liệu chi tiết, các API backend, giao diện frontend, các mô-đun AI/Python và một file `README.md` cực kỳ chi tiết hướng dẫn từ quá trình cài đặt đến cách sử dụng.

---

## I. CÔNG NGHỆ SỬ DỤNG (TECH STACK)
1. **Frontend**: ReactJS (Vite), Tailwind CSS, React Router, LeafletJS (cho bản đồ GIS).
2. **Backend**: Node.js, Express.js, JWT Authentication (Phân quyền: User, Artist, Admin).
3. **Database**: MongoDB & Mongoose (NoSQL).
4. **AI & Data Service (Python):** 
   - Flask hoặc FastAPI phục vụ các mô-đun AI.
   - Thư viện xử lý âm thanh: `Librosa`, `NumPy`, `Pandas`, `Scikit-learn`.
   - Xử lý ngôn ngữ tự nhiên (NLP) phân tích cảm xúc tiếng Việt (PhoBERT/Transformer hoặc mô hình tương đương).
5. **GIS Integration:** Leaflet + OpenStreetMap + Heatmap plugin để hiển thị bản đồ phân bố nghệ sĩ.

---

## II. THIẾT KẾ CƠ SỞ DỮ LIỆU (MONGODB SCHEMAS)
Hãy tạo các Mongoose models đầy đủ các trường sau:

1. **Users (Người dùng):**
   - `_id`, `username`, `email`, `password` (hashed), `avatar`, `role` (Enum: ['user', 'artist', 'admin']), `createdAt`, `updatedAt`.
2. **Artists (Nghệ sĩ):**
   - `_id`, `userId` (Ref User), `artistName`, `biography`, `country`, `city`, `latitude`, `longitude`, `avatar`, `createdAt`.
3. **Tracks (Bài hát):**
   - `_id`, `title`, `artistId` (Ref Artist), `albumId` (Ref Album, optional), `genre`, `audioUrl`, `coverUrl`, `duration`, `releaseDate`, `audioFeatures` (Object chứa: `tempo`, `energy`, `mfcc`, v.v.), `copyrightId`, `createdAt`.
4. **Albums (Album/Single):**
   - `_id`, `title`, `artistId` (Ref Artist), `coverUrl`, `releaseDate`, `description`, `tracks` ([Ref Track]).
5. **Playlists (Danh sách phát):**
   - `_id`, `userId` (Ref User), `name`, `description`, `coverUrl`, `tracks` ([Ref Track]), `isPublic` (Boolean), `createdAt`.
6. **ListeningHistory (Lịch sử nghe nhạc):**
   - `_id`, `userId` (Ref User), `trackId` (Ref Track), `listenedAt`, `duration`, `completed` (Boolean), `action` (Enum: ['play', 'skip', 'like']).
7. **Copyright (Bản quyền):**
   - `_id`, `trackId` (Ref Track), `owner`, `author`, `declaration`, `status` (Enum: ['pending', 'approved', 'rejected']), `createdAt`.
8. **Distribution (Phát hành/Phân phối):**
   - `_id`, `artistId` (Ref Artist), `releaseId`, `platforms` ([String]), `status` (Enum: ['pending', 'processing', 'approved', 'rejected']), `submittedAt`, `processedAt`.

---

## III. CÁC TÍNH NĂNG VÀ CHỨC NĂNG CẦN TRIỂN KHAI

1. **Hệ thống Xác thực & Phân quyền (Auth & RBAC):**
   - Đăng ký, đăng nhập (JWT), mã hóa mật khẩu bằng bcrypt.
   - Phân quyền chặt chẽ giữa 3 nhóm: `User` (nghe nhạc, tìm kiếm, tạo playlist, like, follow), `Artist` (đăng tải bài hát, quản lý album, khai báo bản quyền, gửi yêu cầu phát hành), `Admin` (quản lý toàn bộ người dùng, duyệt bài hát, duyệt bản quyền, xem thống kê hệ thống).
2. **Trình phát nhạc trực tuyến (Music Player):**
   - Giao diện phát nhạc dưới chân trang (Sticky Player) với các nút: Play, Pause, Next, Previous, Progress Bar, Volume, Repeat, Shuffle.
   - Tự động ghi nhận lịch sử nghe (`ListeningHistory`) khi người dùng nghe nhạc.
3. **Hệ thống Gợi ý Âm nhạc thông minh (Recommendation System - Python/Node):**
   - Kết hợp **Content-Based Filtering** (tính độ tương đồng vector đặc trưng âm thanh dùng Cosine Similarity) và **Collaborative Filtering** dựa trên lịch sử tương tác để đề xuất bài hát cá nhân hóa.
4. **Trí tuệ nhân tạo (AI Modules):**
   - **Phân loại thể loại nhạc tự động:** Trích xuất đặc trưng âm thanh (`MFCC`, `Mel-Spectrogram`, `Tempo`, `Energy`) bằng `Librosa` và dự đoán thể loại.
   - **Phân tích cảm xúc & Tự động tạo Playlist:** Nhận nội dung văn bản do người dùng nhập vào (ví dụ: *"Hôm nay buồn quá, muốn nghe nhạc nhẹ nhàng"*), xử lý NLP để phân loại cảm xúc (vui, buồn, thư giãn, năng lượng, lãng mạn, tập trung) và tự động tạo playlist phù hợp.
   - **Phát hiện tương đồng âm thanh (Hỗ trợ chống đạo nhạc):** So sánh vector đặc trưng giữa các bài hát, tính điểm tương đồng (Cosine Similarity / DTW) để cảnh báo quản trị viên nếu phát hiện trùng lặp cao.
5. **Hệ thống Thông tin Địa lý GIS:**
   - Tích hợp LeafletJS hiển thị bản đồ, đánh dấu vị trí nghệ sĩ (`latitude`, `longitude`) và vẽ bản đồ nhiệt (`Heatmap`) mật độ phân bố nghệ sĩ theo khu vực.
6. **Thống kê & Phân tích hành vi:**
   - Thống kê tổng số lượt nghe, bài hát hot, nghệ sĩ phổ biến, tỷ lệ hoàn thành bài hát cho Admin và Artist.

---

## IV. CẤU TRÚC THƯ MỤC DỰ ÁN MẪU
Hãy tổ chức mã nguồn rõ ràng theo mô hình Microservices / Monorepo chuẩn:
```text
music-platform/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB connection
│   │   ├── models/           # Mongoose schemas
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # RESTful API routes
│   │   ├── middleware/       # Auth & Role middlewares
│   │   └── server.js
│   └── package.json
├── ai-service/               # Python AI & Audio processing Service
│   ├── models/               # ML models / scripts
│   ├── app.py                # FastAPI / Flask server
│   └── requirements.txt
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Player, Sidebar, Header, Cards
│   │   ├── pages/            # Home, Search, ArtistDashboard, AdminDashboard, GISMap
│   │   ├── services/         # Axios API calls
│   │   └── App.jsx
│   └── package.json
└── README.md                 # Hướng dẫn chi tiết quá trình làm và sử dụng