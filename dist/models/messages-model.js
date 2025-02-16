"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    messageType: {
        type: String,
        enum: ['text', 'file'],
        required: true,
    },
    content: {
        type: String,
        required: function () {
            return this.messageType === 'text';
        },
    },
    fileUrl: {
        type: String,
        required: function () {
            return this.messageType === 'file';
        },
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
