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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = require("bcrypt");
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    profileImage: {
        type: String,
        required: false,
    },
    profileSetup: {
        type: Boolean,
        default: false,
    },
    bgColor: {
        type: Number,
        default: 0,
    },
});
// Pre-save hook to hash the password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            const salt = yield (0, bcrypt_1.genSalt)();
            this.password = yield (0, bcrypt_1.hash)(this.password, salt);
        }
        next();
    });
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
// import mongoose from "mongoose";
// import { genSalt, hash } from "bcrypt";
// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, "Email is required"],
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: [true, "Password is required"],
//   },
//   firstName: {
//     type: String,
//     required: false,
//   },
//   lastName: {
//     type: String,
//     required: false,
//   },
//   profileImage: {
//     type: String,
//     required: false,
//   },
//   profileSetup: {
//     type: Boolean,
//     default: false,
//   },
//   bgColor: {
//     type: Number,
//     default: false,
//   },
// });
// userSchema.pre("save", async function (next) {
//   const salt = await genSalt();
//   this.password = await hash(this.password, salt);
//   next();
// });
// const User = mongoose.model("User", userSchema);
// export default User;
