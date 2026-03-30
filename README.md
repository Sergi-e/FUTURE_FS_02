# FUTURE_FS_02 — Leadrift

A full-stack CRM (**Leadrift**) for the Future Interns FS track: MERN + Socket.io, with a React client (Tailwind, Framer Motion) and an Express API.

## Layout

```
FUTURE_FS_02/
├── client/          # Vite + React
├── server/          # Express, Mongoose, Socket.io
├── .env             # Local secrets (gitignored — use .env.example as reference)
└── .env.example
```

## Prerequisites

- Node.js 18+
- MongoDB running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Setup

1. **Environment**  
   Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, and `PORT`. Optional: `CLIENT_ORIGIN` (defaults to `http://localhost:5173`).

2. **Install**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Run API** (from `server/`)

   ```bash
   npm run dev
   ```

4. **Run client** (from `client/`)

   ```bash
   npm run dev
   ```

5. **Check**  
   Open [http://localhost:5173](http://localhost:5173) for the UI and [http://localhost:5000/api/health](http://localhost:5000/api/health) for the API health JSON.

The Vite dev server proxies `/api` and `/socket.io` to the backend on port 5000.

## Scripts

| Location | Command        | Purpose        |
|----------|----------------|----------------|
| `server` | `npm run dev`  | API + watch    |
| `server` | `npm start`    | API, no watch  |
| `client` | `npm run dev`  | Vite dev       |
| `client` | `npm run build`| Production build |

---

Originally: a full stack CRM application developed during my internship at Future Interns, designed to manage client interactions and workflows.
