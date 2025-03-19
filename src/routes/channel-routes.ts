import { Router } from "express";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
} from "../controllers/channel-controllers";
import { verifyToken } from "../middlewares/auth-middleware";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);

export default channelRoutes;
