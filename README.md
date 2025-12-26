# Video Streaming & Processing Application

Welcome to the **Video Streaming & Processing App**! 🎥

This application is a full-stack solution designed to handle the complete lifecycle of video content—from secure upload to processing and streaming. It was built to demonstrate a modern, scalable architecture handling real-world challenges like large file uploads, real-time status updates, and role-based security.

## 🚀 Overview

The core goal of this project is to provide a seamless platform where users can upload videos, have them automatically analyzed for sensitivity (safe/flagged), and then stream them back with an adaptive player. 

It solves several key technical challenges:
*   **Real-time Feedback**: Users aren't left guessing; they see a live progress bar as their video uploads, processes, and gets analyzed.
*   **Security**: Not everyone can upload. We use a **Role-Based Access Control (RBAC)** system so only 'Editors' or 'Admins' can contribute content, while 'Viewers' can watch.
*   **Performance**: Videos are streamed using **HTTP Range Requests**, meaning you can scrub through a video instantly without waiting for the whole file to download.

## ✨ Key Features

*   **Secure Authentication**: JWT-based login and registration with Bcrypt password hashing.
*   **Multi-Tenancy**: Built-in support for tenant isolation (users only see their organization's videos).
*   **Smart Video Processing**: 
    *   Extracts metadata (duration, format) using FFmpeg.
    *   Simulates transcoding pipelines.
    *   Performs content sensitivity analysis to flag inappropriate content.
*   **Live Updates**: Powered by **Socket.io**, the dashboard updates instantly when processing completes—no page refreshes needed.
*   **Resumable Streaming**: HTML5 video player integration that supports seeking and efficient bandwidth usage.
*   **Robust Backend**: Node.js & Express server with MongoDB for metadata persistence.

## 🛠️ Technology Stack

We chose a robust **MERN-like** stack (without the 'M' being mandatory, but we used MongoDB) optimized for performance and type safety.

*   **Frontend**: 
    *   **React (Vite)**: For a blazing fast UI.
    *   **TypeScript**: Ensures code reliability and catches errors early.
    *   **Tailwind CSS**: For a clean, responsive, and modern aesthetic.
    *   **Socket.io Client**: For real-time event listening.
*   **Backend**: 
    *   **Node.js & Express**: The backbone of our API.
    *   **MongoDB (Mongoose)**: Flexible schema for storing users and video metadata.
    *   **Multer**: Handles `multipart/form-data` for video uploads.
    *   **FFmpeg**: The industry standard for video manipulation.
    *   **Socket.io**: Handles the bi-directional communication channel.

## ⚙️ Prerequisites

Before you start, make sure you have:
1.  **Node.js** (v16 or higher) installed.
2.  **MongoDB** running locally (or have a connection string for MongoDB Atlas).
3.  **FFmpeg** installed on your system path (optional, but recommended for metadata extraction).

## 🚀 Getting Started

### 1. Clone & Setup
```bash
git clone https://github.com/DUMPTY-900/Video-Streaming-Processing-App-Pulsegen-Technologies
cd Video-Streaming-Processing-App-Pulsegen-Technologies
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` (or rely on defaults):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/video-app  # Or your Atlas URI
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal navigate to the frontend folder:
```bash
cd frontend
npm install
```
Start the React app:
```bash
npm run dev
```
Visit **http://localhost:5173** in your browser.

## 📖 how to Use

1.  **Register a User**: 
    *   Go to `/register`.
    *   Select **Editor** role if you want to upload videos.
2.  **Upload a Video**:
    *   Click the **Upload** button on the dashboard.
    *   Select an MP4/MOV file. Watch the progress bar!
3.  **Watch Magic Happen**:
    *   The status will cycle: `Uploaded` -> `Processing` -> `Processed`.
    *   If the mock AI sensitivity detector finds it "Safe", it will be green. If "Flagged", red.
4.  **Stream**:
    *   Click the **Play** button on any processed video to watch it.

## ☁️ Deployment (Render.com)

This project is configured for easy deployment on Render.
*   **Backend**: Deploy as a *Web Service*. Add build command `npm install && npm run build` and start command `npm start`.
*   **Frontend**: Deploy as a *Static Site*. Add build command `npm install && npm run build` and publish directory `dist`.
*   **Env Vars**: Ensure you set `MONGO_URI` and `VITE_API_BASE_URL` in the respective services.

---

