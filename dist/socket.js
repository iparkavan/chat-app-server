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
const chennel_model_1 = __importDefault(require("./models/chennel-model"));
const user_model_1 = __importDefault(require("./models/user-model"));
const SetupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: [
                "https://chat-app-client-rose.vercel.app", // ✅ Frontend URL
                "http://localhost:3000",
            ],
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket", "polling"], // ✅ Ensures stable connection
        allowEIO3: true, // ✅ Allow legacy support
    });
    const userSocketMap = new Map();
    const disconnect = (socket) => {
        console.log(`❌ User disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                console.log(`Removing user ${userId} from active sockets.`);
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
    const sendChannelMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
        const { channelId, sender, content, messageType, fileUrl } = message;
        const createdMessage = yield messages_model_1.default.create({
            sender,
            recipient: null,
            content,
            messageType,
            timestamp: new Date(),
            fileUrl,
        });
        const messageData = yield messages_model_1.default.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName profileImage bgColor")
            .exec();
        if (!messageData) {
            console.error("Message not found after creation");
            return;
        }
        yield chennel_model_1.default.findByIdAndUpdate(channelId, {
            $push: { messages: createdMessage._id },
        });
        const channel = yield chennel_model_1.default.findById(channelId).populate("members");
        if (messageData) {
            const finalData = Object.assign(Object.assign({}, messageData.toObject()), { channel });
            if (channel && channel.members) {
                channel.members.forEach((member) => {
                    const memberSocketId = userSocketMap.get(member._id.toString());
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("recieve-channel-message", finalData);
                    }
                });
                const adminSocketId = userSocketMap.get(channel.admin._id.toString());
                if (adminSocketId) {
                    io.to(adminSocketId).emit("recieve-channel-message", finalData);
                }
            }
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
        // Handle typing event
        socket.on("typing", (_a) => __awaiter(void 0, [_a], void 0, function* ({ recipientId }) {
            try {
                if (!recipientId)
                    return;
                const recipientSocketId = userSocketMap.get(recipientId);
                if (!recipientSocketId)
                    return;
                const sender = yield user_model_1.default.findById(userId).select("firstName lastName profileImage");
                if (sender) {
                    io.to(recipientSocketId).emit("typing", {
                        senderId: userId, // ✅ Now frontend knows who is typing
                        // recipientId,
                        firstName: sender.firstName,
                        lastName: sender.lastName,
                        profileImage: sender.profileImage,
                    });
                }
            }
            catch (error) {
                console.error("Error handling typing event:", error);
            }
        }));
        // Handle stop typing event
        socket.on("stop-typing", ({ recipientId }) => {
            if (!recipientId)
                return;
            const recipientSocketId = userSocketMap.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("stop-typing", { senderId: userId }); // ✅ Send `senderId` to remove only that user
            }
        });
        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};
exports.default = SetupSocket;
