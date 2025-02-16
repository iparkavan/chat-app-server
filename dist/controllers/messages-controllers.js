"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = exports.getMessages = void 0;
const messages_model_1 = __importDefault(require("../models/messages-model"));
const fs_1 = require("fs");
const getMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user1 = req.userId;
        const { user2 } = req.body;
        if (!user1 || !user2) {
            return res.status(400).send("Both userId's are required");
        }
        const messages = yield messages_model_1.default.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 },
            ],
        }).sort({ timestamp: 1 });
        return res.status(200).json({ messages });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getMessages = getMessages;
const uploadFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).send("File is required");
        }
        const date = Date.now();
        const fileDir = `src/uploads/files/${date}`;
        const fileName = `${fileDir}/${req.file.originalname}`;
        (0, fs_1.mkdirSync)(fileDir, { recursive: true });
        (0, fs_1.renameSync)(req.file.path, fileName);
        return res.status(200).json({ filePath: fileName });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});
exports.uploadFiles = uploadFiles;
