import "./loadEnv.js";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { initSocketServer } from "./socket/index.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import activityRoutes from "./routes/activities.js";
import analyticsRoutes from "./routes/analytics.js";
import aiRoutes from "./routes/ai.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const isProduction = process.env.NODE_ENV === "production";
const envOrigins =
  process.env.CLIENT_ORIGIN?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
const devBrowserOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = isProduction
  ? envOrigins.length > 0
    ? envOrigins
    : ["http://localhost:5173"]
  : [...new Set([...devBrowserOrigins, ...envOrigins])];

function corsOriginCheck(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  callback(new Error(`CORS blocked origin: ${origin}`));
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: isProduction
    ? {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      }
    : {
        // Any dev URL (localhost, 127.0.0.1, LAN IP, preview port) — strict list breaks Vite `host: true`.
        origin: true,
        methods: ["GET", "POST"],
        credentials: true,
      },
});

app.use(
  cors(
    isProduction
      ? {
          origin: corsOriginCheck,
          credentials: true,
        }
      : {
          origin: true,
          credentials: true,
        }
  )
);
app.use(express.json());

// Register connection handlers and stash `io` for controllers to broadcast on.
initSocketServer(io);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "Leadrift API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

// Catches errors passed via `next(err)` (e.g. from CORS or auth middleware)
app.use((err, _req, res, _next) => {
  console.error(err);
  const safe =
    isProduction || !err.message
      ? "Something went wrong"
      : err.message;
  res.status(500).json({ message: safe });
});

async function start() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI in .env — add it at the project root.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (String(err.message).includes("querySrv") || String(err.code) === "ECONNREFUSED") {
      console.error(
        "Hint: SRV DNS lookup failed or outbound access blocked. Try: (1) Atlas → Connect → turn SRV OFF and use the standard mongodb://… URI in MONGO_URI, (2) switch DNS to 8.8.8.8 / 1.1.1.1, (3) disable VPN or try another network (e.g. phone hotspot)."
      );
    }
    process.exit(1);
  }

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
