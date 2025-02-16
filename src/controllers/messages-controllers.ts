import { ExpressHandler } from "../types/constant";
import Message from "../models/messages-model";
import { mkdirSync, renameSync } from "fs";

export const getMessages: ExpressHandler = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const { user2 } = req.body;

    if (!user1 || !user2) {
      return res.status(400).send("Both userId's are required");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const uploadFiles: ExpressHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    const fileDir = `src/uploads/files/${date}`;
    const fileName = `${fileDir}/${req.file.originalname}`;

    mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    return res.status(200).json({ filePath: fileName });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
