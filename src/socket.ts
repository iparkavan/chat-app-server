import { Server } from "http";
import { Server as SockeIOServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Message from "./models/messages-model";
import { MessagesTypes } from "./types/constant";
import Channel from "./models/chennel-model";
import { create } from "domain";

const SetupSocket = (server: Server) => {
  const io = new SockeIOServer(server, {
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

  // const disconnect = (
  //   socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  // ) => {
  //   console.log(`client disconnected: ${socket.id}`);

  //   for (const [userId, socketId] of userSocketMap.entries()) {
  //     if (userId === socketId) {
  //       userSocketMap.delete(userId);
  //       break;
  //     }
  //   }
  // };

  const disconnect = (socket: Socket) => {
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

  const sendChannelMessage = async (message: MessagesTypes) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName profileImage bgColor")
      .exec();

    // const messageData = await Message.create(message).then((msg) =>
    //   msg.populate(
    //     "sender recipient",
    //     "id email firstName lastName profileImage bgColor"
    //   )
    // );

    if (!messageData) {
      console.error("Message not found after creation");
      return;
    }

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    const channel = await Channel.findById(channelId).populate("members");

    if (messageData) {
      const finalData = { ...messageData.toObject(), channel };

      if (channel && channel.members) {
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("recieve-channel-message", finalData);
          }
        });

        // if (channel?.admin?._id) {
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("recieve-channel-message", finalData);
        }
        // }
      }
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
    socket.on("send-channel-message", sendChannelMessage);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default SetupSocket;
