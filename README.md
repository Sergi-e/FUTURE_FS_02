# Leadrift CRM

**Leadrift CRM** is a full-stack lead-management app for the Future Interns **Full Stack Web Development** track. Repository name on GitHub: **`FUTURE_FS_02`**.

## Features

- **Authentication:** Secure login and registration with JWT and password hashing.
- **Ocean Dark Theme:** A beautiful, responsive UI built with Tailwind CSS featuring glass-morphism cards, cyan neon accents, and a deep ocean gradient background.
- **Dashboard Analytics:** Live charts (powered by Recharts) showing weekly lead growth, leads by source (pie chart), and conversion funnel (bar chart).
- **Pipeline (Kanban):** A drag-and-drop board to visually move leads through stages (New, Contacted, Qualified, Converted, Lost).
- **AI Assistant:** A floating, context-aware AI chat widget built using the OpenAI API. (Currently in demo mode until an API key is provided).
- **Real-time Updates:** Activity feeds and lead statuses update instantly across all connected clients via Socket.io.
- **User-Friendly UX:** Clear form labels, helpful placeholders, and show/hide password toggles.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 18, Vite, React Router, Tailwind CSS, Framer Motion, Recharts, @dnd-kit, react-hot-toast, Axios, Socket.io client |
| **Backend** | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, OpenAI |
| **Database** | MongoDB with Mongoose |
| **Realtime** | Socket.io (lead + activity broadcasts) |

## Deployment

This app is fully deployed on the cloud:
- **Frontend:** Hosted on [Vercel](https://vercel.com/)
- **Backend:** Hosted on [Render](https://render.com/)
- **Database:** Hosted on [MongoDB Atlas](https://www.mongodb.com/atlas/database)

## Run locally

1. **Install dependencies**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure `.env`** at the repo root:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/leadrift
   JWT_SECRET=your_super_secret_key
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   OPENAI_API_KEY=your_openai_key # Optional for AI Assistant
   ```

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

5. Open the **Leadrift UI** at **http://localhost:5173**.

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
