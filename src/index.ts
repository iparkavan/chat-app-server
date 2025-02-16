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

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
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

const server: Server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

SetupSocket(server);
// console.log(process.env.DATABASE_URL as string)

mongoose
  .connect(databaseURL)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.log(err.message));

// nQumkesk6qvtou8C
