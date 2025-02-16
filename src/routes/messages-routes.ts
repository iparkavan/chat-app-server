import Router from "express";
import { verifyToken } from "../middlewares/auth-middleware";
import { getMessages, uploadFiles } from "../controllers/messages-controllers";
import multer from "multer";

const messageRoutes = Router();
const upload = multer({ dest: "src/uploads/files/" });

messageRoutes.post("/get-messages", verifyToken, getMessages);
messageRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  uploadFiles
);

export default messageRoutes;
