# NỀN TẢNG PHÁT NHẠC TRỰC TUYẾN VÀ QUẢN LÝ NỘI DUNG ÂM NHẠC ỨNG DỤNG TRÍ TUỆ NHÂN TẠO VÀ GIS
> **Đồ án chuyên ngành / Graduation Capstone Project**  
> **Tác giả:** Đội ngũ Kỹ sư Phần mềm & AI  
> **Phiên bản:** 1.0.0 (Production-Ready)

---

## MỤC LỤC
1. [Giới Thiệu Tổng Quan](#1-giới-thiệu-tổng-quan)
2. [Kiến Trúc Hệ Thống (Architecture & Tech Stack)](#2-kiến-trúc-hệ-thống-architecture--tech-stack)
3. [Thiết Kế Cơ Sở Dữ Liệu (MongoDB Schemas)](#3-thiết-kế-cơ-sở-dữ-liệu-mongodb-schemas)
4. [Các Tính Năng & Giải Thuật Cốt Lõi](#4-các-tính-năng--giải-thuật-cốt-lõi)
   - 4.1. [Xác Thực & Phân Quyền (RBAC: User, Artist, Admin)](#41-xác-thực--phân-quyền-rbac)
   - 4.2. [Trình Phát Nhạc & Ghi Nhận Hành Vi (Music Player)](#42-trình-phát-nhạc--ghi-nhận-hành-vi)
   - 4.3. [Hệ Thống Gợi Ý Hybrid (Content-Based & Collaborative)](#43-hệ-thống-gợi-ý-hybrid)
   - 4.4. [AI: Phân Loại Thể Loại & Đặc Trưng Âm Học (Librosa)](#44-ai-phân-loại-thể-loại--đặc-trưng-âm-học)
   - 4.5. [AI: Phân Tích Cảm Xúc Tiếng Việt & Tạo Playlist Tự Động (NLP)](#45-ai-phân-tích-cảm-xúc-tiếng-việt--tạo-playlist-tự-động)
   - 4.6. [AI: Phát Hiện Tương Đồng Âm Thanh & Chống Đạo Nhạc](#46-ai-phát-hiện-tương-đồng-âm-thanh--chống-đạo-nhạc)
   - 4.7. [Hệ Thống Bản Đồ Không Gian Địa Lý (GIS & Heatmap)](#47-hệ-thống-bản-đồ-không-gian-địa-lý-gis--heatmap)
5. [Cấu Trúc Thư Mục Dự Án](#5-cấu-trúc-thư-mục-dự-án)
6. [Hướng Dẫn Cài Đặt & Vận Hành Hệ Thống](#6-hướng-dẫn-cài-đặt--vận-hành-hệ-thống)
7. [Tài Khoản Kiểm Thử Đăng Nhập Sẵn (Demo Accounts)](#7-tài-khoản-kiểm-thử-đăng-nhập-sẵn)
8. [Tài Liệu RESTful API Endpoints](#8-tài-liệu-restful-api-endpoints)

---

## 1. GIỚI THIỆU TỔNG QUAN

Dự án **"Nền tảng phát nhạc trực tuyến và quản lý nội dung âm nhạc ứng dụng trí tuệ nhân tạo và GIS"** là giải pháp phần mềm toàn diện kết hợp giữa giải trí đa phương tiện (Music Streaming), khoa học dữ liệu (Data Science), Trí tuệ nhân tạo (AI/NLP/Audio Signal Processing) và Hệ thống thông tin địa lý (GIS).

### Mục tiêu dự án:
- Cung cấp dịch vụ nghe nhạc trực tuyến chất lượng cao với trình phát Sticky Player đa chức năng.
- Ứng dụng **Trí tuệ nhân tạo (AI)** để:
  - Phân tích cảm xúc ngôn ngữ tự nhiên tiếng Việt (Vietnamese NLP / PhoBERT) giúp tự động tạo danh sách phát theo tâm trạng (vui, buồn, chill, tập gym, lãng mạn, tập trung).
  - Trích xuất đặc trưng âm học (MFCC, Mel-Spectrogram, Tempo, Energy, Valence) bằng thư viện `Librosa`.
  - Kiểm tra độ tương đồng vector âm thanh để cảnh báo đạo nhạc, bảo hộ tác quyền âm nhạc tự động.
  - Gợi ý bài hát cá nhân hóa kết hợp (Hybrid Recommendation: 60% Content-Based Cosine Similarity + 40% Collaborative Filtering).
- Ứng dụng **Hệ thống thông tin địa lý (GIS)**:
  - Trực quan hóa tọa độ phân bố nghệ sĩ trên nền tảng bản đồ số Leaflet & OpenStreetMap.
  - Phân tích mật độ sáng tạo âm nhạc theo vùng miền thông qua lớp bản đồ nhiệt (Heatmap).
- Quản lý quy trình phát hành âm nhạc quốc tế (Spotify, Apple Music, YouTube Music, TikTok) và thẩm định tác quyền minh bạch.

---

## 2. KIẾN TRÚC HỆ THỐNG (ARCHITECTURE & TECH STACK)

Hệ thống được thiết kế theo kiến trúc Microservices / Service-Oriented Architecture (SOA) hiện đại:

```text
┌──────────────────────────────────────────────────────────────────┐
│                   FRONTEND CLIENT (Single Page App)               │
│          React 18 + Vite + Tailwind CSS + Leaflet GIS            │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ HTTP / REST / JWT
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND API GATEWAY                         │
│             Node.js + Express.js + Mongoose ORM                  │
│       (Xác thực RBAC, Quản lý Nhạc, Lịch sử, Tác quyền, GIS)     │
└───────────────┬──────────────────────────────────┬───────────────┘
                │ Internal Mongoose Driver         │ HTTP / JSON
                ▼                                  ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│       DATABASE STORAGE        │  │     AI & DATA MICROSERVICE    │
│    MongoDB & In-Memory Fallback│  │     Python FastAPI / Uvicorn  │
│  (Users, Tracks, GIS, History)│  │ (Librosa, PhoBERT NLP, Scikit)│
└───────────────────────────────┘  └───────────────────────────────┘
```

### Công nghệ sử dụng:
1. **Frontend:**
   - **Framework:** ReactJS (Vite), React Router DOM v6.
   - **Giao diện:** Tailwind CSS, Lucide Icons, hiệu ứng âm thanh Equalizer sống động.
   - **GIS Engine:** LeafletJS, React-Leaflet, Leaflet Heatmap Plugin & CartoDB Dark Tiles.
   - **Player:** HTML5 Audio API kết hợp Context API quản lý trạng thái nghe nhạc toàn cục.
2. **Backend:**
   - **Nền tảng:** Node.js, Express.js.
   - **Bảo mật:** JWT (JSON Web Tokens), Bcrypt password hashing.
   - **Tải lên tệp:** Multer (xử lý audio và ảnh bìa).
   - **Giao tiếp liên dịch vụ:** Axios.
3. **Database:**
   - **NoSQL:** MongoDB & Mongoose ORM.
   - **Tính năng độc quyền:** Tích hợp `mongodb-memory-server` tự động fallback khi máy chấm bài chưa cài sẵn MongoDB cục bộ.
4. **AI & Data Service:**
   - **Framework:** Python FastAPI, Uvicorn, Pydantic.
   - **Xử lý âm thanh:** `Librosa`, `NumPy`, `SciPy`, `SoundFile`.
   - **Học máy & Gợi ý:** `Scikit-learn` (Cosine Similarity, Euclidean Distance, Classifier).
   - **Xử lý ngôn ngữ tự nhiên:** PhoBERT / Vietnamese Lexicon Semantic Engine.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (MONGODB SCHEMAS)

Hệ thống bao gồm 8 Schema Mongoose hoàn chỉnh, chuẩn hóa quan hệ giữa các thực thể:

### 1. `Users` (Người dùng)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `username` | String | Tên người dùng, duy nhất, bắt buộc |
| `email` | String | Email định danh, regex chuẩn |
| `password` | String | Mật khẩu đã được mã hóa bằng Bcrypt (10 salt rounds) |
| `avatar` | String | Đường dẫn ảnh đại diện |
| `role` | String | Phân quyền: `Enum: ['user', 'artist', 'admin']` (mặc định: `'user'`) |
| `createdAt` / `updatedAt` | Date | Dấu vết thời gian tự động |

### 2. `Artists` (Nghệ sĩ & Tọa độ GIS)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `userId` | ObjectId | Liên kết `Ref User` |
| `artistName` | String | Nghệ danh biểu diễn |
| `biography` | String | Tiểu sử, quá trình hoạt động nghệ thuật |
| `country` | String | Quốc gia (mặc định: `'Vietnam'`) |
| `city` | String | Tỉnh / Thành phố hoạt động chính |
| `latitude` | Number | **Vĩ độ GIS** (dùng cho Leaflet Marker & Heatmap) |
| `longitude` | Number | **Kinh độ GIS** (dùng cho Leaflet Marker & Heatmap) |
| `avatar` | String | Ảnh nghệ sĩ |
| `monthlyListeners` | Number | Số lượng người nghe hàng tháng |
| `verified` | Boolean | Huy hiệu nghệ sĩ đã xác minh |

### 3. `Tracks` (Bài hát & Đặc trưng âm học)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `title` | String | Tên bài hát |
| `artistId` | ObjectId | Liên kết `Ref Artist` |
| `albumId` | ObjectId | Liên kết `Ref Album` (tùy chọn) |
| `genre` | String | Thể loại: V-Pop, Rap/Hip-hop, Indie, Ballad, EDM, R&B,... |
| `audioUrl` | String | Đường dẫn luồng phát trực tuyến (Audio Stream URL) |
| `coverUrl` | String | Đường dẫn ảnh bìa bài hát |
| `duration` | Number | Thời lượng phát (giây) |
| `audioFeatures` | Object | **Đặc trưng âm học AI:** `tempo`, `energy`, `valence`, `danceability`, `acousticness`, `spectralCentroid`, `zeroCrossingRate`, `mfcc: [Number]` |
| `copyrightId` | ObjectId | Liên kết `Ref Copyright` |
| `playCount` | Number | Tổng số lượt phát |
| `likesCount` | Number | Số lượt người dùng yêu thích |
| `status` | String | Trạng thái: `Enum: ['published', 'pending', 'rejected']` |

### 4. `Albums` (Album / Đĩa đơn)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `title` | String | Tên album |
| `artistId` | ObjectId | Liên kết `Ref Artist` |
| `coverUrl` | String | Ảnh bìa album |
| `releaseDate` | Date | Ngày phát hành |
| `description` | String | Mô tả concept album |
| `tracks` | [ObjectId] | Mảng liên kết `[Ref Track]` |

### 5. `Playlists` (Danh sách phát)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `userId` | ObjectId | Liên kết `Ref User` (người tạo) |
| `name` | String | Tên danh sách phát |
| `description` | String | Mô tả |
| `coverUrl` | String | Ảnh đại diện playlist |
| `tracks` | [ObjectId] | Mảng các bài hát `[Ref Track]` |
| `isPublic` | Boolean | Chế độ công khai hoặc riêng tư |

### 6. `ListeningHistory` (Lịch sử tương tác & Nghe nhạc)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `userId` | ObjectId | Liên kết `Ref User` (Indexed) |
| `trackId` | ObjectId | Liên kết `Ref Track` (Indexed) |
| `listenedAt` | Date | Thời điểm tương tác (Indexed) |
| `duration` | Number | Số giây đã nghe |
| `completed` | Boolean | `true` nếu đã nghe > 80% thời lượng bài |
| `action` | String | Hành vi: `Enum: ['play', 'skip', 'like']` |

### 7. `Copyright` (Quản lý Bản quyền)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `trackId` | ObjectId | Liên kết `Ref Track` |
| `owner` | String | Chủ sở hữu bản quyền |
| `author` | String | Nhạc sĩ / Tác giả sáng tác |
| `declaration` | String | Lời cam kết tuyên bố tác quyền |
| `similarityScore`| Number | **Điểm tương đồng âm học do AI tính toán (0 - 100%)** |
| `similarityNotes`| String | Ghi chú cảnh báo từ thuật toán AI |
| `status` | String | `Enum: ['pending', 'approved', 'rejected']` |

### 8. `Distribution` (Phát hành & Phân phối)
| Trường | Kiểu dữ liệu | Ràng buộc / Mô tả |
| :--- | :--- | :--- |
| `_id` | ObjectId | Khóa chính |
| `artistId` | ObjectId | Liên kết `Ref Artist` |
| `releaseId` | String | Mã phát hành định danh (ISRC / UPC) |
| `releaseTitle` | String | Tên bản phát hành |
| `platforms` | [String] | Các nền tảng: `['Spotify', 'Apple Music', 'YouTube Music', 'TikTok', 'Zing MP3']` |
| `status` | String | `Enum: ['pending', 'processing', 'approved', 'rejected']` |
| `submittedAt` | Date | Ngày nộp yêu cầu |
| `processedAt` | Date | Ngày phê duyệt phân phối |

---

## 4. CÁC TÍNH NĂNG & GIẢI THUẬT CỐT LÕI

### 4.1. Xác thực & Phân quyền (RBAC)
- Sử dụng mô hình kiểm soát truy cập dựa trên vai trò (Role-Based Access Control):
  - **User (Thành viên):** Nghe nhạc, tìm kiếm bài hát theo thể loại, lưu bài hát yêu thích, tự tạo playlist, xem lịch sử nghe, trải nghiệm AI Tạo Playlist và tra cứu bản đồ GIS.
  - **Artist (Nghệ sĩ):** Toàn bộ quyền của User + Truy cập Kênh Nghệ Sĩ (`/artist-studio`), đăng tải bài hát mới, tùy chỉnh tọa độ địa lý GIS (`latitude`, `longitude`), sử dụng công cụ AI kiểm tra đạo nhạc trước khi phát hành, gửi hồ sơ bản quyền và gửi yêu cầu phát hành quốc tế.
  - **Admin (Quản trị viên):** Truy cập Trung tâm Quản trị (`/admin`), giám sát toàn diện KPI hệ thống (lượt nghe, tỷ lệ hoàn thành, skip rate), phê duyệt/từ chối bài hát có cảnh báo tương đồng âm học cao từ AI, xử lý phân phối quốc tế và quản lý người dùng.

### 4.2. Trình phát nhạc & Ghi nhận hành vi (Music Player)
- **Sticky Player** cố định dưới chân màn hình, hỗ trợ:
  - Phát / Tạm dừng (Play / Pause).
  - Chuyển bài trước / kế tiếp (Next / Previous).
  - Thanh tua thời gian trực quan (Progress Bar Seek).
  - Điều chỉnh âm lượng & Tắt âm nhanh (Mute).
  - Phát ngẫu nhiên (Shuffle) và Lặp lại (Repeat: Off / All / One).
- **Tự động ghi nhận hành vi (`ListeningHistory`):**
  - Khi bắt đầu nghe: Ghi nhận sự kiện `action: 'play'`.
  - Khi người dùng nghe đạt từ 80% thời lượng: Hệ thống tự động đánh dấu `completed: true`. Dữ liệu này dùng để tính toán chỉ số mức độ gắn bó (Retention) và nuôi thuật toán Collaborative Filtering.

### 4.3. Hệ thống Gợi ý Hybrid (Content-Based & Collaborative)
Thuật toán kết hợp tỷ trọng đa nguồn:
$$\text{HybridScore} = 0.6 \times \text{ContentScore} + 0.4 \times \text{CollabScore}$$

1. **Content-Based Filtering:**
   - Mỗi bài hát được biểu diễn bằng vector đặc trưng âm thanh đa chiều:
     $$\vec{V} = [\text{tempo}_{\text{norm}}, \text{energy}, \text{valence}, \text{danceability}, \text{acousticness}, \text{mfcc}_1, \dots, \text{mfcc}_8]$$
   - Tính toán độ tương đồng giữa bài hát mục tiêu và kho bài hát thông qua Cosine Similarity:
     $$\text{CosineSimilarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$
2. **Collaborative Filtering:**
   - Dựa trên ma trận lịch sử nghe của cộng đồng người dùng có cùng sở thích (User-Item Matrix) để phát hiện bài hát mà những người nghe tương tự đã yêu thích hoặc nghe trọn vẹn.

### 4.4. AI: Phân loại thể loại & Đặc trưng âm học (Librosa)
- Sử dụng mô-đun Python `Librosa` phân rã tín hiệu âm thanh:
  - **MFCC (Mel-Frequency Cepstral Coefficients):** 13 hệ số mô phỏng cách tai người cảm nhận cao độ âm thanh.
  - **Tempo (BPM):** Dò nhịp trống chủ đạo và mật độ khởi phát âm thanh (Onset Strength Envelope).
  - **RMS Energy:** Đo năng lượng trung bình bình phương của sóng âm thanh.
  - **Spectral Centroid:** Xác định "độ sáng" của âm thanh tần số cao.
  - **Zero Crossing Rate:** Tần suất đổi dấu của tín hiệu sóng âm.

### 4.5. AI: Phân tích cảm xúc tiếng Việt & Tạo Playlist tự động (NLP)
- Người dùng chỉ cần nhập một câu tự sự bằng tiếng Việt (ví dụ: *"Hôm nay buồn quá, muốn nghe nhạc nhẹ nhàng xoa dịu tâm hồn"*).
- Bộ phân loại NLP tiếng Việt nhận diện 6 trạng thái cảm xúc:
  1. `sad` (Buồn bã, tâm trạng) $\rightarrow$ Lọc nhạc Ballad, Acoustic; Energy thấp ($<0.45$), Valence thấp.
  2. `happy` (Vui vẻ, phấn khởi) $\rightarrow$ Lọc nhạc V-Pop, R&B; Energy cao ($>0.65$), Danceability cao.
  3. `relaxed` (Thư giãn, chill) $\rightarrow$ Lọc nhạc Indie, Lo-fi; Tempo 70-110 BPM, Acousticness cao.
  4. `energetic` (Năng lượng, gym) $\rightarrow$ Lọc nhạc EDM, Rap, Rock; Tempo $>125$ BPM, Energy cực cao.
  5. `romantic` (Lãng mạn, hẹn hò) $\rightarrow$ Lọc nhạc Trữ tình, Ballad; Valence ấm áp.
  6. `focus` (Tập trung, học bài) $\rightarrow$ Lọc nhạc Instrumental, không gây xao nhãng.
- Kết quả trả về một playlist gồm các ca khúc tối ưu cùng thẻ giải thích lý do đề xuất của AI.

### 4.6. AI: Phát hiện tương đồng âm thanh & Chống đạo nhạc
- Trước khi nghệ sĩ xuất bản bài hát, hệ thống kích hoạt tính năng **AI Pre-check**:
  - Đối chiếu vector đặc trưng âm phổ của bài hát mới với toàn bộ cơ sở dữ liệu.
  - Nếu độ trùng khớp $\ge 85\%$: Hệ thống phát cảnh báo `HIGH_RISK_PLAGIARISM` và tự động chuyển trạng thái bài hát về `pending` (Chờ duyệt) để Admin thẩm định thủ công, ngăn chặn tình trạng đạo nhạc.

### 4.7. Hệ thống Bản đồ Không gian Địa lý (GIS & Heatmap)
- Ứng dụng LeafletJS và OpenStreetMap:
  - Ghim vị trí các nghệ sĩ Việt Nam thông qua tọa độ chuẩn GIS (`latitude`, `longitude`).
  - Khi nhấp vào Marker nghệ sĩ: Hiển thị Popup chứa Avatar, Nghệ danh, Vị trí địa lý, Số người nghe và nút **"Phát bài hát của nghệ sĩ"**.
  - **Lớp bản đồ nhiệt (Heatmap Layer):** Trực quan hóa mật độ sáng tạo âm nhạc theo thang màu (Xanh dương $\rightarrow$ Xanh lá $\rightarrow$ Vàng $\rightarrow$ Đỏ) dựa trên số lượng tác phẩm và người nghe của từng khu vực.
  - Bảng thống kê tỷ lệ phân bố theo Tỉnh/Thành phố (Hà Nội, TP.HCM, Đà Nẵng, Quảng Ninh, Cần Thơ, Nghệ An,...) với tính năng Click để bay đến tọa độ tương ứng (Fly-to animation).

---

## 5. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
music-platform/
├── backend/                              # Node.js + Express API Gateway
│   ├── src/
│   │   ├── config/                       # Kết nối MongoDB & Fallback Memory Server
│   │   │   └── db.js
│   │   ├── models/                       # 8 Mongoose Schemas chuẩn thiết kế
│   │   │   ├── User.js
│   │   │   ├── Artist.js
│   │   │   ├── Track.js
│   │   │   ├── Album.js
│   │   │   ├── Playlist.js
│   │   │   ├── ListeningHistory.js
│   │   │   ├── Copyright.js
│   │   │   └── Distribution.js
│   │   ├── controllers/                  # Điều khiển nghiệp vụ & giải thuật
│   │   │   ├── authController.js
│   │   │   ├── trackController.js
│   │   │   ├── artistController.js
│   │   │   ├── albumController.js
│   │   │   ├── playlistController.js
│   │   │   ├── historyController.js
│   │   │   ├── copyrightController.js
│   │   │   ├── distributionController.js
│   │   │   ├── aiController.js
│   │   │   ├── gisController.js
│   │   │   └── statsController.js
│   │   ├── services/                     # Dịch vụ AI & Recommendation
│   │   │   ├── recommendationService.js  # Content-Based & Collaborative Filtering
│   │   │   ├── nlpService.js             # Vietnamese NLP Emotion Engine
│   │   │   └── audioService.js           # Audio Similarity & Plagiarism Detector
│   │   ├── middleware/                   # Auth, RBAC, Multer Upload, Error Handlers
│   │   │   ├── authMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── routes/                       # Định tuyến RESTful API
│   │   ├── seed/                         # Seeder tạo dữ liệu mẫu phong phú
│   │   │   └── seedData.js
│   │   └── server.js                     # Điểm khởi chạy Express Server
│   ├── uploads/                          # Thư mục lưu trữ file audio & hình ảnh
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── ai-service/                           # Python AI & Audio Processing Microservice
│   ├── models/
│   │   ├── audio_features.py             # Trích xuất đặc trưng âm thanh Librosa
│   │   ├── genre_classifier.py           # Phân loại thể loại nhạc
│   │   ├── emotion_nlp.py                # Phân tích cảm xúc tiếng Việt (PhoBERT)
│   │   └── similarity_detector.py        # So sánh vector âm học chống đạo nhạc
│   ├── app.py                            # FastAPI application server
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                             # Giao diện ReactJS (Vite) + Tailwind + GIS
│   ├── src/
│   │   ├── components/                   # Player, Sidebar, Header, Cards, Heatmap
│   │   │   ├── Player.jsx                # Sticky Bottom Audio Player
│   │   │   ├── Sidebar.jsx               # Thanh điều hướng phân quyền
│   │   │   ├── Header.jsx                # Thanh tìm kiếm & chuyển đổi tài khoản
│   │   │   ├── TrackCard.jsx             # Thẻ hiển thị bài hát
│   │   │   ├── TrackRow.jsx              # Hàng danh sách bài hát
│   │   │   ├── ArtistCard.jsx            # Thẻ nghệ sĩ
│   │   │   ├── HeatmapLayer.jsx          # Lớp bản đồ nhiệt Leaflet
│   │   │   └── ProtectedRoute.jsx        # Bảo vệ tuyến đường theo Role
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Quản lý phiên đăng nhập & RBAC
│   │   │   └── PlayerContext.jsx         # Quản lý phát nhạc & Lịch sử
│   │   ├── pages/                        # Các trang chính của hệ thống
│   │   │   ├── Home.jsx                  # Trang chủ, Gợi ý AI, Bảng xếp hạng
│   │   │   ├── Search.jsx                # Tìm kiếm bài hát, nghệ sĩ, lọc thể loại
│   │   │   ├── GISMap.jsx                # Bản đồ số GIS & Heatmap phân bố nghệ sĩ
│   │   │   ├── AIPalette.jsx             # AI Studio tạo playlist từ cảm xúc NLP
│   │   │   ├── TrackDetail.jsx           # Trực quan hóa âm học & kiểm tra bản quyền
│   │   │   ├── ArtistDashboard.jsx       # Kênh Nghệ Sĩ: Đăng nhạc, Tọa độ GIS, Tác quyền
│   │   │   ├── AdminDashboard.jsx        # Kênh Quản Trị: Duyệt bản quyền, Thống kê KPI
│   │   │   ├── Playlists.jsx             # Quản lý danh sách phát
│   │   │   ├── History.jsx               # Lịch sử nghe nhạc & Tỷ lệ hoàn thành
│   │   │   ├── Login.jsx                 # Đăng nhập (Hỗ trợ 1-Click Fast Login)
│   │   │   └── Register.jsx              # Đăng ký tài khoản
│   │   ├── services/
│   │   │   └── api.js                    # Cấu hình Axios Interceptor JWT
│   │   ├── App.jsx                       # Định tuyến React Router
│   │   ├── index.css                     # Cấu hình Tailwind & Custom CSS
│   │   └── main.jsx
│   ├── index.html                        # Chứa Leaflet CSS & Fonts
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md                             # Tài liệu kỹ thuật chi tiết
```

---

## 6. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH HỆ THỐNG

### Yêu cầu tiên quyết:
- **Node.js:** Phiên bản `>= 18.x` (khuyến nghị Node 20+).
- **npm** hoặc **yarn / pnpm**.
- **Python (tùy chọn):** Phiên bản `>= 3.9` (nếu chạy AI Microservice độc lập; Backend đã tích hợp sẵn module fallback nên có thể chạy độc lập ngay cả khi chưa có Python).
- **MongoDB:** Cài đặt cục bộ cổng 27017 hoặc sử dụng MongoDB Atlas URI (Backend tự động kích hoạt `mongodb-memory-server` nếu không tìm thấy MongoDB đang mở).

---

### BƯỚC 1: Cài đặt và Chạy Backend API (Node.js)

1. Mở cửa sổ Terminal và chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường:
   Tệp `.env` đã được chuẩn bị sẵn. Bạn có thể kiểm tra nội dung:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/music_streaming_db
   JWT_SECRET=secret_jwt_key_music_platform_2026_super_secure
   AI_SERVICE_URL=http://127.0.0.1:8000
   ```

4. Khởi tạo dữ liệu mẫu (Seed Data) chứa nghệ sĩ GIS, bài hát và bản quyền:
   ```bash
   npm run seed
   ```

5. Khởi động Backend Server:
   ```bash
   npm start
   ```
   > 🚀 Máy chủ sẽ chạy tại: **http://localhost:5000**  
   > 📡 Kiểm tra trạng thái: **http://localhost:5000/api/health**

---

### BƯỚC 2: Cài đặt và Chạy AI Microservice (Python - Tùy Chọn)

1. Mở một cửa sổ Terminal mới và chuyển vào thư mục `ai-service`:
   ```bash
   cd ai-service
   ```

2. Tạo môi trường ảo và cài đặt thư viện:
   ```bash
   python -m venv venv
   # Kích hoạt trên Windows:
   venv\Scripts\activate
   # Kích hoạt trên macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. Khởi chạy FastAPI Server:
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 8000 --reload
   ```
   > 🌐 Tài liệu Swagger tương tác: **http://127.0.0.1:8000/docs**

*(Lưu ý: Nếu chưa cài đặt môi trường Python, Backend Node.js sẽ tự động chuyển sang cơ chế Phân tích cảm xúc & Tương đồng vector nội tại mà không làm gián đoạn bất kỳ trải nghiệm nào của người dùng).*

---

### BƯỚC 3: Cài đặt và Chạy Frontend (React + Vite)

1. Mở một cửa sổ Terminal mới và chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi động giao diện phát triển:
   ```bash
   npm run dev
   ```
   > 🌟 Mở trình duyệt tại địa chỉ: **http://localhost:3000**

---

## 7. TÀI KHOẢN KIỂM THỬ ĐĂNG NHẬP SẴN

Hệ thống đã chuẩn bị sẵn 3 tài khoản mẫu đại diện cho 3 nhóm vai trò (RBAC). Tại trang Đăng Nhập (`/login`), bạn có thể nhấp trực tiếp vào các nút **"1-Click Fast Login"** để đăng nhập ngay lập tức:

| Vai trò (Role) | Email | Mật khẩu | Quyền hạn nổi bật |
| :--- | :--- | :--- | :--- |
| **Admin (Quản trị viên)** | `admin@musicai.vn` | `123456` | Xem báo cáo phân tích toàn hệ thống, duyệt bài hát có cảnh báo đạo nhạc, duyệt bản quyền, quản lý phân phối. |
| **Artist (Nghệ sĩ - Sơn Tùng)** | `sontung@musicai.vn` | `123456` | Đăng tải bài hát mới, cập nhật tọa độ GIS, dùng AI quét đạo nhạc trước khi nộp, khai báo bản quyền. |
| **User (Người nghe phổ thông)** | `user@musicai.vn` | `123456` | Nghe nhạc trực tuyến, tạo playlist, thả tim bài hát, dùng AI tạo playlist từ cảm xúc, xem bản đồ GIS. |

---

## 8. TÀI LIỆU RESTFUL API ENDPOINTS

### 1. Xác thực (Authentication)
- `POST /api/auth/register`: Đăng ký tài khoản mới (User / Artist).
- `POST /api/auth/login`: Đăng nhập hệ thống, nhận JWT Token.
- `GET /api/auth/me`: Lấy thông tin cá nhân và hồ sơ nghệ sĩ (nếu có).
- `PUT /api/auth/profile`: Cập nhật thông tin tài khoản.

### 2. Quản lý Bài hát (Tracks)
- `GET /api/tracks`: Lấy danh sách bài hát (hỗ trợ `search`, `genre`, `artistId`, `sort`).
- `GET /api/tracks/:id`: Xem chi tiết bài hát, đặc trưng âm học và bản quyền.
- `POST /api/tracks`: Nghệ sĩ đăng tải bài hát mới (kích hoạt AI Plagiarism Pre-check).
- `PUT /api/tracks/:id`: Chỉnh sửa bài hát (Artist sở hữu hoặc Admin).
- `DELETE /api/tracks/:id`: Xóa bài hát.
- `POST /api/tracks/:id/like`: Thả tim / Bỏ yêu thích bài hát.

### 3. Hệ thống Thông tin Địa lý (GIS)
- `GET /api/gis/artists`: Trả về danh sách tọa độ nghệ sĩ `[latitude, longitude]` và dữ liệu bản đồ nhiệt `heatmapPoints: [lat, lng, intensity]`.
- `GET /api/gis/geojson`: Xuất dữ liệu định dạng chuẩn GeoJSON FeatureCollection.
- `GET /api/gis/density-stats`: Thống kê tỷ lệ và số lượng nghệ sĩ phân bố theo Tỉnh/Thành phố.

### 4. Trí tuệ Nhân tạo & Gợi ý (AI & Recommendation)
- `POST /api/ai/emotion-playlist`: Nhận văn bản cảm xúc tiếng Việt $\rightarrow$ Trả về phân tích tâm trạng NLP & tạo danh sách phát tự động.
- `POST /api/ai/analyze-emotion`: Phân tích cảm xúc độc lập từ câu chữ.
- `GET /api/ai/recommendations`: Gợi ý bài hát Hybrid (Content-Based + Collaborative Filtering) theo gu người dùng.
- `GET /api/ai/similar-tracks/:trackId`: Tìm các bài hát tương đồng nhất về mặt âm học (Cosine Similarity).
- `POST /api/ai/check-plagiarism`: Đối chiếu vector đặc trưng âm thanh với toàn bộ catalog để phát hiện đạo nhạc.

### 5. Quản lý Bản quyền & Phân phối (Copyright & Distribution)
- `POST /api/copyright`: Nghệ sĩ nộp hồ sơ cam kết bản quyền tác phẩm.
- `GET /api/copyright`: Admin xem toàn bộ danh sách hồ sơ bản quyền kèm điểm tương đồng AI.
- `GET /api/copyright/artist`: Nghệ sĩ xem danh sách bản quyền của chính mình.
- `PATCH /api/copyright/:id/review`: Admin phê duyệt (`approved`) hoặc từ chối (`rejected`) bản quyền.
- `POST /api/distribution`: Nghệ sĩ nộp yêu cầu phát hành quốc tế (Spotify, Apple Music,...).
- `GET /api/distribution`: Admin duyệt danh sách phân phối.
- `PATCH /api/distribution/:id/status`: Admin cập nhật trạng thái phân phối (`processing`, `approved`, `rejected`).

### 6. Lịch sử Nghe & Thống kê (History & Analytics)
- `POST /api/history`: Ghi nhận sự kiện nghe nhạc (`action: 'play' | 'skip' | 'like'`, `duration`, `completed`).
- `GET /api/history`: Lấy lịch sử nghe nhạc và tỷ lệ hoàn thành bài hát của người dùng.
- `DELETE /api/history`: Xóa lịch sử nghe nhạc.
- `GET /api/stats/system`: Admin xem toàn bộ chỉ số KPI hệ thống, bài hát hot, phân bổ thể loại.
- `GET /api/stats/artist`: Nghệ sĩ xem thống kê số lượt nghe, lượt thích và tỷ lệ hoàn thành của các bài hát mình phát hành.

---

## 9. LỜI KẾT
Dự án được xây dựng với cấu trúc mã nguồn chỉn chu, áp dụng các chuẩn mực công nghệ phần mềm chuyên nghiệp, giải quyết trọn vẹn bài toán tích hợp giữa **Âm nhạc**, **Trí tuệ nhân tạo (AI)** và **Hệ thống thông tin địa lý (GIS)**. Sản phẩm sẵn sàng cho việc nghiệm thu, báo cáo đồ án tốt nghiệp và phát triển thương mại hóa trong tương lai!
