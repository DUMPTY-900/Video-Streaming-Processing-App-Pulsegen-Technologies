# 🎥 StreamFlow - Advanced Video Streaming Platform

StreamFlow is a full-stack MERN video streaming application designed for seamless video uploads, real-time processing, and content sensitivity analysis. It features a modern, glassmorphic UI, multi-tenant architecture, and robust role-based access control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-complete-success.svg)

## 🚀 Key Features

### Core Functionality
*   **Video Upload**: Chunk-based upload handling with `multer` supporting large files.
*   **Real-Time Processing**: Live progress bars using **Socket.io** to track video analysis.
*   **Content Sensitivity Analysis**: Automated keyword-based detection to flag unsafe content (Safe/Flagged).
*   **Video Streaming**: Optimized HTTP Range Requests (`206 Partial Content`) for smooth playback.
*   **Authentication**: Secure JWT-based auth with Role-Based Access Control (Viewer, Editor, Admin).

### Advanced Features
*   **Multi-Tenancy**: Data isolation ensuring users only see content within their tenant.
*   **Ephemeral Storage Handling**: Robust error handling for cloud platforms with non-persistent storage (e.g., Render Free Tier).
*   **Advanced Filtering**: Filter by Sensitivity (Safe/Flagged) and Category.
*   **Smart Sorting**: Sort by Newest, Oldest, File Size, or Duration.
*   **User-Defined Categories**: Tag uploads with custom categories (Gaming, Vlog, Tech, etc.).
*   **Performance**: Implemented `Cache-Control` headers for API optimization.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React + Vite | Fast, modern client-side framework |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with Glassmorphism design |
| **Backend** | Node.js + Express | Robust REST API server |
| **Database** | MongoDB + Mongoose | NoSQL database for metadata & user info |
| **Real-time** | Socket.io | Bi-directional communication for updates |
| **Storage** | Local FS (Ephemeral) | Standard filesystem storage for video files |

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/DUMPTY-900/Video-Streaming-Processing-App-Pulsegen-Technologies.git
cd Video-Streaming-Processing-App-Pulsegen-Technologies
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/streamflow
JWT_SECRET=your_super_secret_key_123
UPLOAD_DIR=uploads
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🏃‍♂️ Running the Application

### Development Mode (Recommended)
Run both backend and frontend in separate terminals:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Access the app at `http://localhost:5173`.

---

## 📚 API Documentation

### Videos

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/videos` | List all videos (supports query params) | User |
| `POST` | `/api/videos` | Upload a new video | Editor/Admin |
| `GET` | `/api/videos/:id` | Get video metadata | User |
| `DELETE` | `/api/videos/:id` | Delete a video | Editor/Admin |
| `GET` | `/api/videos/:id/stream` | Stream video content | User |

**Query Parameters for `/api/videos`:**
*   `sensitivity`: `all`, `safe`, `flagged`
*   `category`: `all`, `Gaming`, `Vlog`, etc.
*   `sort`: `newest`, `oldest`, `size_desc`, `size_asc`, `duration_desc`

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get JWT |

---

## 🏗️ Architecture Overview

The application follows a **Modular Monolith** structure with clear separation of concerns:

*   **`frontend/`**: Contains the React SPA. Components are split into `pages`, `components`, and `context` (for global state like Auth and Socket).
*   **`backend/`**:
    *   **`controllers/`**: Handles request logic.
    *   **`models/`**: Mongoose schemas.
    *   **`services/`**: Business logic (e.g., `processing.service.ts` for dummy FFmpeg simulation).
    *   **`routes/`**: API route definitions.
    *   **`middlewares/`**: Auth checks (`protect`, `authorize`) and file handling (`upload`).

---

## 🧪 Testing
The application includes basic structure for testing. To run manual verification:
1.  Register two users: one `admin` and one `viewer` (change role in Mongo Compass).
2.  Login as Admin -> Upload Video -> Observe Progress Bar.
3.  Login as Viewer -> Verify you can Watch but NOT Delete.

---

## 📝 License
This project is open-sourced under the MIT license.
