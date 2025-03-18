import { Router } from "express";
import {
  createChannel,
  getUserChannels,
} from "../controllers/channel-controllers";
import { verifyToken } from "../middlewares/auth-middleware";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);

export default channelRoutes;
