import { Server } from "http";
import { Server as SockeIOServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Message from "./models/messages-model";
import { MessagesTypes } from "./types/constant";

const SetupSocket = (server: Server) => {
  const io = new SockeIOServer(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: "GET,POST",
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    console.log(`client disconnected: ${socket.id}`);

    for (const [userId, socketId] of userSocketMap.entries()) {
      if (userId === socketId) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  // Function for sending the message from server to client
  const sendMessage = async (message: MessagesTypes) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName profileImage bgColor")
      .populate(
        "recipient",
        "id email firstName lastName profileImage bgColor"
      );     

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with Socket ID: ${socket.id}`);
    } else {
      console.log("Userid Not provided during the connection");
    }

    socket.on("sendMessage", sendMessage);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default SetupSocket;
