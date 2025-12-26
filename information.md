
## High‑level system design

Build a **monorepo** with two apps:

- `backend/` – Node.js + Express + MongoDB + Socket.io + FFmpeg.[1][2][3][4]
- `frontend/` – React + Vite + (Context or Redux) + Socket.io client.[5][1]

Use **JWT auth**, **multi‑tenant RBAC**, **local or S3 storage** for videos, and **HTTP Range** for streaming.[6][7][8][1]

***

## Backend – required behavior

Tech stack:

- Node.js (LTS), Express.js, MongoDB (Mongoose), Socket.io, Multer (or Busboy), FFmpeg CLI or fluent‑ffmpeg.[2][9][4][1]

### Data models

Define at least:

- `User`:
  - `email`, `passwordHash`
  - `tenantId`
  - `roles: ['viewer' | 'editor' | 'admin']`
- `Video`:
  - `tenantId`
  - `owner` (user id)
  - `originalFilename`, `storedPath`, `mimeType`, `size`, `duration`
  - `status: 'uploaded' | 'processing' | 'processed' | 'failed'`
  - `sensitivity: 'safe' | 'flagged' | 'unknown'`
  - `processingProgress` (0–100)
  - `createdAt`, `updatedAt`
  - optional metadata: `category`, `description`, `resolution`, etc.

### Auth & multi‑tenancy

- Endpoints for:
  - `POST /auth/register`
  - `POST /auth/login` → returns JWT.  
- Middleware to:
  - Verify JWT.
  - Attach `userId`, `tenantId`, `roles` to `req`.
  - Enforce tenant isolation: all `Video` queries are filtered by `tenantId` and, for viewers, only allowed videos.[1]
- RBAC helpers:
  - `requireRole('viewer' | 'editor' | 'admin')`.
  - Example:
    - Viewer: can list and stream videos they are allowed to see.
    - Editor: can upload, update metadata, delete own videos within tenant.
    - Admin: manage all users and videos in their tenant.[1]

### Video upload API

Use Multer for `multipart/form-data` uploads.[9][1]

- `POST /api/videos` (auth required, at least editor role):
  - Fields: `file` + optional `title`, `description`, `category`.
  - Validate:
    - MIME type (e.g., `video/mp4`, `video/webm`).
    - Max size (configurable).
  - Store file:
    - Either local `uploads/<tenantId>/<uuid>.mp4`
    - Or cloud path if using S3.
  - Create `Video` document with status `uploaded` and `processingProgress = 0`.
  - Enqueue processing job (can be an in‑process queue for the assignment).
  - Emit initial Socket.io event: `video:queued` with basic metadata.

### Video processing pipeline

Implement a background worker (can be a plain async function triggered after upload) that:

1. Validates the file again (sanity check).
2. Runs FFmpeg operations, e.g.:
   - Extract duration.
   - Optionally compress or normalize to a standard format/bitrate.[10][11][2]
3. Periodically updates `processingProgress` (e.g., 10%, 20%, … 100%) based on FFmpeg progress callbacks or simulated steps.[3][2]
4. Performs **sensitivity analysis**:
   - For the assignment, implement a deterministic stub:
     - Example: read a short audio transcript with a placeholder LL model or randomly classify for demo, but structure code so a real model can plug in.
   - Set `sensitivity` to `safe` or `flagged`.
5. Updates `status` to `processed` (or `failed` on error).
6. Emits Socket.io events to the user’s room:
   - `video:progress` {videoId, progress}
   - `video:completed` {videoId, sensitivity}
   - `video:error` {videoId, error}

### Real‑time layer (Socket.io)

- On connection, authenticate via JWT (either in query or a separate `auth` event).[12][5]
- Join the user into:
  - A per‑user room (e.g., `user:<id>`).
  - Optionally a per‑tenant room.
- Backend emits all video processing updates to:
  - `io.to('user:<id>').emit('video:progress', ...)`.

### Listing and filtering

- `GET /api/videos`:
  - Query params: `status`, `sensitivity`, `fromDate`, `toDate`, `category`, etc.[1]
  - Apply tenant isolation and RBAC.
- `GET /api/videos/:id`:
  - Returns full metadata if user can access it.

### Streaming endpoint (HTTP Range)

- `GET /api/videos/:id/stream`:
  - Find `Video` by id and tenant.
  - Read `Range` header.
  - Implement standard range streaming logic:
    - Parse `bytes=start-end`.[7][8][6]
    - Compute chunk bounds, set:
      - `Content-Range`, `Accept-Ranges`, `Content-Length`, `Content-Type`.
    - Return status `206` and stream file with `fs.createReadStream({start, end})`.[8][6][7]
  - Deny access if:
    - User not authorized.
    - Status not `processed` (or you decide to allow streaming while processing).

### Error handling & config

- Central error middleware:
  - Standard JSON `{message, code, details?}`.
- Use `.env` for:
  - `MONGO_URI`, `JWT_SECRET`, `UPLOAD_DIR`, `FRONTEND_URL`, etc.
- Basic logging for:
  - Auth failures
  - Upload failures
  - FFmpeg errors.

### Tests

- At least:
  - Auth flow test (register + login).
  - Upload endpoint test (mock file).
  - Streaming handler test (returns 206 and correct headers).

***

## Frontend – required behavior

Tech stack:

- React + Vite, TypeScript optional.
- State: React Context or Redux Toolkit.
- Styling: Tailwind or CSS Modules.
- HTTP: Axios or Fetch.
- Realtime: Socket.io client.[5][1]

### Auth UI

- Pages:
  - `Login` and `Register` forms.
- On success:
  - Store JWT (e.g., in memory or localStorage).
  - Store user + tenant + role in global state.

### Upload interface

- Page/section: “Upload Video”.
- Form:
  - File input (accept only video).
  - Metadata fields like title, description, category.
- Show:
  - Client‑side upload progress using Axios `onUploadProgress`.
  - After upload returns, subscribe to Socket.io updates for that video to show **processing progress** separately (e.g., a second progress bar).[13][14]

### Real‑time dashboard

- Table or cards with:

  - Video title
  - Status (uploaded / processing / processed / failed)
  - Sensitivity (safe / flagged / unknown)
  - Owner
  - Created date
  - Actions: “Play”, “Details”

- Subscribe to Socket.io:
  - When `video:progress` comes in, update the row’s progress %.
  - When `video:completed`, update status and sensitivity.

### Video library and filtering

- Page: “Library”.
- Controls:
  - Filter by sensitivity (all / safe / flagged).
  - Filter by date range.
  - Search by title/category.[1]
- Use `GET /api/videos` with query params for filters.

### Media player page

- Route: `/videos/:id`.
- Fetch video metadata.
- Embed `<video>` tag pointing to backend streaming URL:
  - e.g. `<video src={`${API_URL}/api/videos/${id}/stream`} controls />`
- Ensure browser sends `Range` header automatically and streaming works.[7][8][9]

### RBAC in UI

- Hide/disable features based on role:
  - Viewer:
    - No upload button.
    - Can only see assigned/visible videos.
  - Editor:
    - Can upload and manage own videos.
  - Admin:
    - User management screens (minimal for assignment: list users, set roles) and full library for tenant.[1]

### UX & responsiveness

- Layout that works on desktop + mobile (e.g., responsive cards/list).
- Clear states:
  - Empty states (no videos yet).
  - Error banners for network/auth issues.
  - Spinners during loading.

---

## Deployment & docs

- Deploy:
  - Backend: any Node‑friendly host (Render, Railway, Fly, Heroku‑like).[1]
  - Frontend: Vercel/Netlify.
  - MongoDB: MongoDB Atlas.[1]
  - Configure CORS, environment variables, HTTPS if available.
- Documentation (`README.md`):

  - Overview of architecture (text + simple diagram).
  - Step‑by‑step: local setup (backend then frontend).
  - Example `.env` files.
  - API docs:
    - Auth endpoints
    - Video upload, list, streaming endpoints.
  - Description of video pipeline and sensitivity analysis.
  - Assumptions (e.g., “sensitivity model is stubbed, can be replaced with real model”).
  - Known limitations (e.g., single worker, no distributed queue).[1]

- Provide a short **demo script** in the README that corresponds to:

  1. Register/login as a user.
  2. Upload a video and see upload progress.
  3. Watch processing progress update in real time.
  4. See safe/flagged status and details.
  5. Play the video via streaming.
  6. Show how roles/tenants change what is visible.[1]


[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/83298507/93653f3f-44f1-4439-83d8-da38aee0d6be/224b49f0-6807-4655-b2fb-2a3f83c257e5.pdf)
[2](https://www.digitalocean.com/community/tutorials/how-to-build-a-media-processing-api-in-node-js-with-express-and-ffmpeg-wasm)
[3](https://ffmpeg-api.com/docs/processing)
[4](https://ffmpeg.org/ffmpeg.html)
[5](https://socket.io/how-to/use-with-react)
[6](https://cri.dev/posts/2025-06-18-how-to-http-range-requests-video-nodejs/)
[7](https://blog.logrocket.com/build-video-streaming-server-node/)
[8](https://smoores.dev/post/http_range_requests/)
[9](https://www.geeksforgeeks.org/node-js/how-to-build-video-streaming-application-using-node-js/)
[10](https://transloadit.com/devtips/stream-video-processing-with-node-js-and-ffmpeg/)
[11](https://mayallo.com/video-processing-using-ffmpeg-nodejs/)
[12](https://socket.io/how-to/upload-a-file)
[13](https://blog.fossasia.org/file-upload-progress-in-a-node-app-using-socket-io/)
[14](https://www.npmjs.com/package/socketio-file-upload)
[15](https://www.youtube.com/watch?v=EV1lzCjB7PI)
[16](https://stackoverflow.com/questions/72176714/merge-video-and-audio-using-ffmpeg-in-express-js)
[17](https://ffmpeg-api.com/docs/examples)
[18](https://gist.github.com/paulvales/38bf6394ca23e0360123aa2d9e064969)
[19](https://www.reddit.com/r/letsplay/comments/pgos1c/some_code_examples_for_using_ffmpeg_to_process/)
[20](https://www.youtube.com/watch?v=XBjDhsL2nGc)
[21](https://trigger.dev/docs/guides/examples/ffmpeg-video-processing)