# Leadrift CRM

**Leadrift CRM** is a full-stack lead-management app for the Future Interns **Full Stack Web Development** track. Repository name on GitHub: **`FUTURE_FS_02`**.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 18, Vite, React Router, Tailwind CSS, Framer Motion, Recharts, @dnd-kit, react-hot-toast, Axios, Socket.io client |
| **Backend** | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs |
| **Database** | MongoDB with Mongoose |
| **Realtime** | Socket.io (lead + activity broadcasts) |

## GitHub

- **Repository name:** `FUTURE_FS_02` — push this project to a public GitHub repo with that name (or your course’s required naming) for submission.

## Project layout

```
FUTURE_FS_02/
├── client/          # Vite + React UI
├── server/          # Express API + Socket.io
├── .env             # Local secrets (gitignored)
├── .env.example     # Template for root env
└── client/.env.example   # Optional VITE_API_URL
```

## Prerequisites

- **Node.js** 18+
- **MongoDB** — local install or **MongoDB Atlas** (free tier)

## MongoDB Atlas (free) — get a connection URI

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **free M0 cluster** and a **database user** (save the password).
3. Under **Network Access**, allow your IP or `0.0.0.0/0` for development.
4. **Connect** → **Drivers** → copy the **connection string** (`mongodb+srv://...`).
5. Replace `<password>` with your user password (URL-encode special characters if needed).
6. Add a database name, e.g. `...mongodb.net/leadrift?retryWrites=true&w=majority`.

## Environment variables

**Root `.env`** (copy from `.env.example`):

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string (Atlas `mongodb+srv://` or local `mongodb://127.0.0.1:27017/leadrift`) |
| `JWT_SECRET` | Long random string for signing JWTs |
| `PORT` | API port (default `5000`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS + Socket.io (e.g. `http://localhost:5173`) |

**Optional `client/.env`:**

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API **origin only** (no `/api` suffix). **Leave unset in Vite dev** to use the proxy at `/api`. Set for production builds or if you bypass the proxy. |

## Run locally

1. **Install dependencies**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure `.env`** at the repo root with `MONGO_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN`.

3. **Start the API** (terminal 1)

   ```bash
   cd server
   npm run dev
   ```

4. **Start the client** (terminal 2)

   ```bash
   cd client
   npm run dev
   ```

   **Or** from the **repo root** (after `npm install` there once): `npm run dev` — starts **both** the API and the Vite app.

5. Open the **Leadrift UI** at **http://localhost:5173** (Vite). The dev server may open your browser automatically.

   **Important:** Port **5000** is the **API only** (JSON). It does **not** serve the React app, so opening only `http://localhost:5000` will not show the CRM screens.

6. Health check: **http://localhost:5000/api/health**

In Vite dev, the UI talks to the API through the **proxy** (`/api` → port 5000). Keep the API running on the port set in `PORT`.

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm run dev` | API with file watch |
| `server` | `npm start` | API without watch |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production build |

---

Originally developed during an internship at Future Interns to practice full-stack CRM workflows (auth, CRUD, realtime updates, and analytics-style views).

**Acknowledgment:** This project was built with assistance from **Cursor** (AI-assisted IDE).  
**Serge Ishimwe** — full-stack developer, Rwanda.
