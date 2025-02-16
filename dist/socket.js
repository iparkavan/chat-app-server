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
const socket_io_1 = require("socket.io");
const messages_model_1 = __importDefault(require("./models/messages-model"));
const SetupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: "GET,POST",
            credentials: true,
        },
    });
    const userSocketMap = new Map();
    const disconnect = (socket) => {
        console.log(`client disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (userId === socketId) {
                userSocketMap.delete(userId);
                break;
            }
        }
    };
    // Function for sending the message from server to client
    const sendMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);
        const createdMessage = yield messages_model_1.default.create(message);
        const messageData = yield messages_model_1.default.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName profileImage bgColor")
            .populate("recipient", "id email firstName lastName profileImage bgColor");
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("recieveMessage", messageData);
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("recieveMessage", messageData);
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with Socket ID: ${socket.id}`);
        }
        else {
            console.log("Userid Not provided during the connection");
        }
        socket.on("sendMessage", sendMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};
exports.default = SetupSocket;
