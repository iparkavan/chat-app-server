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
exports.getAllContacts = exports.getContactsForDmList = exports.searchContacts = void 0;
const user_model_1 = __importDefault(require("../models/user-model"));
const messages_model_1 = __importDefault(require("../models/messages-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const searchContacts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerms } = req.body;
        if (searchTerms === undefined || searchTerms === null) {
            return res.status(400).send("Search Term is Reaquired");
        }
        const sanitizedSearchTerm = searchTerms.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(sanitizedSearchTerm, "i");
        const contacts = yield user_model_1.default.find({
            $and: [
                { _id: { $ne: req.userId } },
                { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
            ],
        });
        return res.status(200).json({ contacts });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.searchContacts = searchContacts;
const getContactsForDmList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        if (req.userId) {
            userId = new mongoose_1.default.Types.ObjectId(req.userId);
        }
        const contacts = yield messages_model_1.default.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: { $first: "$timestamp" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                },
            },
            { $unwind: "$contactInfo" },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    profileImage: "$contactInfo.profileImage",
                    bgColor: "$contactInfo.bgColor",
                },
            },
            {
                $sort: { lastMessageTime: -1 },
            },
        ]);
        // console.log(userId, contacts);
        return res.status(200).json({ contacts });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.getContactsForDmList = getContactsForDmList;
const getAllContacts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = user_model_1.default.find({ _id: { $ne: req.userId } }, "firstName, lastName, _id, email");
        const contacts = (yield users).map((user) => ({
            label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id,
        }));
        return res.status(200).json({ contacts });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllContacts = getAllContacts;
