# Leadrift CRM

**Leadrift CRM** is a full-stack lead-management web app built for the **Future Interns: Full Stack Web Development (Task 02)** track. It lets a small sales team capture leads, move them through a visual pipeline, take notes, and watch their workspace update in real time. Repository: **`FUTURE_FS_02`**.

## Highlights

- **Auth that just works**: register / login, JWT sessions, hashed passwords, and an in-app **change password** flow with current-password verification.
- **Dashboard analytics**: stat cards (total / hot / converted / follow-ups due) plus three live charts powered by Recharts: weekly lead growth (line), leads by source (pie), and a conversion funnel (bar).
- **Pipeline (Kanban) board**: five stages (**New → Contacted → Qualified → Converted / Lost**) with smooth drag-and-drop powered by `@dnd-kit`. Each column has its own gradient header and live count, and status updates persist immediately.
- **Lead detail page**: edit status, set a follow-up **date and time**, add timestamped notes, and delete the lead.
- **Live activity sidebar**: a right-rail feed (visible on `lg+` screens) that streams new lead and note events the moment they happen, animated in with Framer Motion.
- **Realtime updates**: Socket.io broadcasts `lead:created / updated / deleted` and `activity:new` events so every open tab and the activity sidebar stay in sync.
- **Hot / warm / cold scoring**: recency-based engagement tier auto-derived from the last touchpoint (note added or moved to *Contacted*).
- **AI Assistant widget**: floating chat button on every authenticated page. With `OPENAI_API_KEY` set it answers questions about your leads using the live workspace data; without a key it returns a friendly mock reply.
- **Productivity touches**: `Ctrl + K` (or `⌘ + K`) opens **Add Lead** from any screen, follow-ups due today / overdue are surfaced as a red alert on the dashboard, and the whole UI ships with a polished **dark / light theme toggle**.
- **Polished UI**: Tailwind CSS, glass-morphism cards, cyan neon accents, deep ocean gradient background, Framer Motion page transitions, and react-hot-toast feedback.

## Tech stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite, React Router 7, Tailwind CSS, Framer Motion, Recharts, `@dnd-kit`, react-hot-toast, Axios, Socket.io client |
| **Backend** | Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs`, OpenAI SDK |
| **Database** | MongoDB (with Mongoose) |
| **Realtime** | Socket.io (lead + activity broadcasts) |
| **Deployment** | Vercel (client) · Render (API) · MongoDB Atlas (database) |

## Project structure

```
FUTURE_FS_02/
├── client/                 # React + Vite frontend
│   ├── vercel.json         # SPA rewrite for deep-link routing on Vercel
│   └── src/
│       ├── components/     # Navbar, AddLeadModal, AIAssistant, ActivityFeed, AnalyticsChart, LeadCard, ScoreBadge, StatCard, ProtectedLayout, ...
│       ├── context/        # AuthContext, SocketContext, ThemeContext, AddLeadCommandContext (Ctrl+K)
│       ├── pages/          # DashboardPage, KanbanPage (route `/kanban`, titled "Pipeline"), LeadDetailPage, LoginPage, SettingsPage
│       ├── hooks/          # useHasSession (gates protected routes)
│       └── utils/          # axios client, auth helpers
├── server/                 # Express API
│   ├── controllers/        # auth, leads, activities, analytics
│   ├── middleware/         # JWT `protect`
│   ├── models/             # User, Lead, Activity (Mongoose)
│   ├── routes/             # /api/auth, /api/leads, /api/activities, /api/analytics, /api/ai
│   ├── socket/             # Socket.io init + emit helpers (lead + activity events)
│   ├── utils/              # scoreLeads (hot/warm/cold), email helpers
│   └── server.js           # App entry (CORS, Mongo, routes, error handler)
├── package.json            # Root: runs client + API together with `concurrently`
├── .env.example            # Server env template (root .env is read by the API)
└── README.md
```

## Run locally

### 1. Prerequisites

- **Node.js 18+** and npm
- A MongoDB connection string: local (`mongodb://127.0.0.1:27017/leadrift`) or **MongoDB Atlas** (`mongodb+srv://...`)

### 2. Install dependencies

From the repo root, install everything in one go:

```bash
npm install              # installs the workspace runner (concurrently)
npm run install:all      # installs both server/ and client/ deps
```

(Or install each side manually: `cd server && npm install` then `cd ../client && npm install`.)

### 3. Configure environment

Copy `.env.example` to `.env` at the **repo root** and fill in your values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/leadrift
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
# Optional: enables the real OpenAI-powered AI Assistant. Without it, the assistant returns a mock reply.
# OPENAI_API_KEY=sk-your-openai-key
```

> The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5000`, so the client needs **no** env config for local development.

### 4. Start the app

From the repo root, run **both** the API and the Vite dev server with one command:

```bash
npm run dev
```

…or in two terminals if you prefer:

```bash
# terminal 1: API
cd server && npm run dev

# terminal 2: client
cd client && npm run dev
```

Open **<http://localhost:5173>** and create your account from the **Register** tab.

## Using the system

1. **Register** an account on the login page (passwords must be at least 6 characters). The session is stored as a JWT in `localStorage`, so a refresh keeps you signed in.
2. The **Dashboard** is your snapshot: empty states guide you until you add your first lead.
3. Click **Add lead** in the navbar (or hit **`Ctrl + K`** / **`⌘ + K`** from any screen) to capture a name, email, phone, company, source, and pipeline stage.
4. Open the **Pipeline** page (route `/kanban`) to drag a card across **New → Contacted → Qualified → Converted / Lost**. The first move into *Contacted* counts as a touchpoint and warms the lead's score.
5. Click **Open detail →** on a card to edit the status, set a **follow-up date & time**, add **notes**, or delete the lead. Every note bumps the engagement score back to **hot**.
6. The **dashboard alerts** section turns red whenever a follow-up is due today or overdue: click through to the lead.
7. Watch the **Live activity** sidebar (right rail on large screens) animate in new events the moment they happen across the team.
8. The floating **AI Assistant** button (bottom-right) opens a chat that can summarize or answer questions about the leads in your workspace.
9. **Settings** lets you change your password (current password required).
10. Toggle **dark / light** with the button in the navbar: the choice persists.

> **Realtime:** open the app in two browser windows (or share with a teammate) and watch lead changes appear instantly without refreshing.

## API overview

All routes (except `register` / `login`) require a `Authorization: Bearer <token>` header.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create account, returns `{ token, user }` |
| `POST` | `/api/auth/login` | Sign in, returns `{ token, user }` |
| `POST` | `/api/auth/change-password` | Update password (requires current) |
| `GET` | `/api/leads` | List all leads in the workspace |
| `POST` | `/api/leads` | Create a lead |
| `GET` | `/api/leads/:id` | Read a lead |
| `PATCH` | `/api/leads/:id` | Update fields (status, follow-up, …) |
| `DELETE` | `/api/leads/:id` | Remove a lead |
| `POST` | `/api/leads/:id/notes` | Append a note (also bumps recency for scoring) |
| `GET` | `/api/activities` | Read recent activity events (powers the live sidebar) |
| `POST` | `/api/activities` | Log a custom activity (also broadcast over Socket.io) |
| `GET` | `/api/analytics/weekly` | Weekly lead-growth buckets used by the dashboard line chart |
| `POST` | `/api/ai/chat` | Ask the AI Assistant: uses OpenAI when `OPENAI_API_KEY` is set, otherwise returns a friendly mock reply |
| `GET` | `/api/health` | Liveness probe (`{ ok: true, name: "Leadrift API" }`) |

## Deployment

The project is split for serverless-friendly hosting:

- **Frontend → Vercel.** Set the root to `client/`, build command `npm run build`, output `dist`. Set env var `VITE_API_URL` to your deployed API origin (e.g. `https://leadrift-api.onrender.com`). The included `client/vercel.json` handles SPA routing so deep links (`/dashboard`, `/leads/:id`) don't 404.
- **Backend → Render.** Web Service from the `server/` folder, start command `npm start`. Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL: comma-separate multiple), `NODE_ENV=production`, and optionally `OPENAI_API_KEY`.
- **Database → MongoDB Atlas.** Use the SRV connection string. If your network blocks SRV DNS lookups (`querySrv ECONNREFUSED`), Atlas's *Connect → Drivers → SRV off* gives you a non-SRV `mongodb://...` string that works around it.

## Scripts reference

| Where | Command | What it does |
| --- | --- | --- |
| repo root | `npm run dev` | Start API + Vite client together (`concurrently`) |
| repo root | `npm run install:all` | Install deps in both `server/` and `client/` |
| `server/` | `npm run dev` | API with `node --watch` |
| `server/` | `npm start` | API without watch (used in production) |
| `client/` | `npm run dev` | Vite dev server (port 5173) |
| `client/` | `npm run build` | Production build into `client/dist/` |
| `client/` | `npm run preview` | Preview the production build locally |

## License

Released under the [MIT License](./LICENSE).

---

Originally developed during my internship at **Future Interns** to practice end-to-end full-stack workflows: authentication, CRUD, realtime updates, and dashboard analytics.

**Acknowledgment:** built with assistance from **Cursor** (AI-assisted IDE).
**Author:** [Serge Ishimwe](https://github.com/Sergi-e), full-stack developer, Rwanda.
