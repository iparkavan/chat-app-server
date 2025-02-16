"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth-middleware");
const messages_controllers_1 = require("../controllers/messages-controllers");
const multer_1 = __importDefault(require("multer"));
const messageRoutes = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: "src/uploads/files/" });
messageRoutes.post("/get-messages", auth_middleware_1.verifyToken, messages_controllers_1.getMessages);
messageRoutes.post("/upload-file", auth_middleware_1.verifyToken, upload.single("file"), messages_controllers_1.uploadFiles);
exports.default = messageRoutes;
