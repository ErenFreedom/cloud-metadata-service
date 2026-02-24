import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import { cleanupUnverifiedClients } from "./utils/cleanup";
import { errorHandler } from "./middleware/error.middleware";

import clientRoutes from "./routes/client.routes";
import gatewayRoutes from "./routes/gateway.routes";
import sensorRoutes from "./routes/sensor.routes";
import siteRecoveryRoutes from "./routes/siteRecovery.routes";
import dashboardRoutes from "./routes/dashboard.routes";

dotenv.config();

const app = express();


if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}


const allowedOrigins =
  process.env.CORS_ORIGINS?.split(",").map(origin => origin.trim()) || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, curl, server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/clients", clientRoutes);
app.use("/api/gateway", gatewayRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/site", siteRecoveryRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);


const PORT = process.env.PORT || 3001;
let server: any;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      setInterval(cleanupUnverifiedClients, 2 * 60 * 1000);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

startServer();


process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");

  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});