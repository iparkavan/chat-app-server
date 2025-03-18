import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth-routes";
import cookieParser from "cookie-parser";
import path from "path";
import contactRoutes from "./routes/contacts-routes";
import SetupSocket from "./socket";
import { Server, IncomingMessage, ServerResponse } from "http";
import messageRoutes from "./routes/messages-routes";
import channelRoutes from "./routes/channel-routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const databaseURL = process.env.DATABASE_URL as string;
const nextURL = process.env.ORIGIN as string;

// app.use(cors({
//   origin:[process.env.ORIGIN as string],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }))

// app.use(
//   cors({
//     origin: "https://chat-app-client-rose.vercel.app",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//     credentials: true,
//   })
// );

const allowedOrigins = [
  "https://chat-app-client-rose.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.use("/uploads/profiles", express.static("/uploads/profiles"));

app.use("/src/uploads/profiles", express.static("src/uploads/profiles"));
app.use("/src/uploads/files", express.static("src/uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/channel", channelRoutes);

const server: Server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

SetupSocket(server);

mongoose
  .connect(databaseURL)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1); // Exit if database connection fails
  });

// nQumkesk6qvtou8C
