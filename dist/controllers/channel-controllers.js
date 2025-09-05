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
exports.getChannelMessages = exports.getUserChannels = exports.createChannel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chennel_model_1 = __importDefault(require("../models/chennel-model"));
const user_model_1 = __importDefault(require("../models/user-model"));
const createChannel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, members } = req.body;
        if (!name || !members)
            return res.status(400).send("Name and members are mandatory");
        const userId = req.userId;
        const admin = yield user_model_1.default.findById(userId);
        if (!admin)
            return res.status(404).send("Admin not found");
        const validMembers = yield user_model_1.default.find({ _id: { $in: members } });
        if (validMembers.length !== members.length) {
            return res.status(404).send("Some members are not found");
        }
        const newChannel = new chennel_model_1.default({
            name,
            members,
            admin: userId,
        });
        yield newChannel.save();
        res
            .status(201)
            .json({ message: "Channel created successfully", channel: newChannel });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "There is a problem while creating a new channel" });
    }
});
exports.createChannel = createChannel;
const getUserChannels = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.userId);
        const channels = yield chennel_model_1.default.find({
            $or: [{ admin: userId }, { members: userId }],
        }).sort({ updateAt: -1 });
        res
            .status(201)
            .json({ message: "Channels fetched successfully", channels });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "There is a problem while fetching the channels" });
    }
});
exports.getUserChannels = getUserChannels;
const getChannelMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { channelId } = req.params;
        const channel = yield chennel_model_1.default.findById(channelId).populate({
            path: "messages",
            populate: {
                path: "sender",
                select: "firstName lastName email _id bgColor profileImage",
            },
        });
        if (!channel) {
            res.status(404).json({ message: "Channels not found" });
        }
        const messages = channel === null || channel === void 0 ? void 0 : channel.messages;
        res.status(201).json({ messages });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "There is a problem while fetching the channels" });
    }
});
exports.getChannelMessages = getChannelMessages;
