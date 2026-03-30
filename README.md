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
- A MongoDB database (local or MongoDB Atlas)

## MongoDB Atlas (free tier) — connection string

Atlas gives you a hosted MongoDB cluster so you do not need a local `mongod` process.

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in or create an account.
2. Create a **free (M0) cluster** (pick any cloud region close to you).
3. Under **Database Access**, create a **database user** (username + password). Save the password — you will need it in the URI.
4. Under **Network Access**, add an IP allowlist entry. For development, **Allow access from anywhere** (`0.0.0.0/0`) is common; for better security, use your current IP only.
5. Click **Database** → **Connect** on your cluster → **Drivers** → copy the **connection string** (it looks like `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/...`).
6. Replace `<password>` with your database user’s password (URL-encode special characters if needed).
7. Append a database name, e.g. `...mongodb.net/leadrift?retryWrites=true&w=majority`.
8. In the project root, copy `.env.example` to `.env` and set:

   ```env
   MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/leadrift?retryWrites=true&w=majority
   ```

9. Restart the API after changing `.env`.

## Setup

1. **Environment (root `.env`)**  
   Set `MONGO_URI` (Atlas or local), `JWT_SECRET`, and `PORT` (default `5000`).  
   Set `CLIENT_ORIGIN=http://localhost:5173` so the browser can call the API (CORS + Socket.io).

2. **Optional: client API origin (`client/.env`)**  
   By default the UI calls `http://localhost:5000`. To point at another host, create `client/.env`:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

   Use the **origin only** (no `/api` suffix). Restart `npm run dev` after changing.

3. **Install**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Run API** (from `server/`)

   ```bash
   npm run dev
   ```

5. **Run client** (from `client/`)

   ```bash
   npm run dev
   ```

6. **Check**  
   - UI: [http://localhost:5173](http://localhost:5173)  
   - API health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## How the frontend talks to the backend

- **HTTP:** Axios in `client/src/utils/api.js` uses base URL `http://localhost:5000/api` (or `VITE_API_URL` + `/api`). Every request automatically sends `Authorization: Bearer <JWT>` from `localStorage` after login.
- **Realtime:** Socket.io connects to the same origin (`http://localhost:5000` by default) so `activity:new` and lead events work while the Vite app runs on port 5173.

The Vite dev server can still proxy `/api` and `/socket.io`, but the app is configured to call the API directly so behavior matches a typical split-origin dev setup.

## Scripts

| Location | Command         | Purpose        |
|----------|-----------------|----------------|
| `server` | `npm run dev`   | API + watch    |
| `server` | `npm start`     | API, no watch  |
| `client` | `npm run dev`   | Vite dev       |
| `client` | `npm run build` | Production build |

---

Originally: a full stack CRM application developed during my internship at Future Interns, designed to manage client interactions and workflows.
