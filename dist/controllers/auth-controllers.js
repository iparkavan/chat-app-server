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
exports.logout = exports.removeProfileImage = exports.addProfileImage = exports.updateProfile = exports.getUserInfo = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../types/constant");
const bcrypt_1 = require("bcrypt");
const user_model_1 = __importDefault(require("../models/user-model"));
const fs_1 = require("fs");
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    const JWT_KEY = process.env.JWT_KEY;
    return jsonwebtoken_1.default.sign({ email, userId }, JWT_KEY, { expiresIn: maxAge });
};
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password is required");
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                message: "You have already registered your account, try signin",
            });
        const user = yield user_model_1.default.create({ email, password });
        res.cookie(constant_1.ACCESS_TOKEN, createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "none",
        });
        return res.status(201).json({
            userInfo: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage,
                bgColor: user.bgColor,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password is required");
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).send("User with the given email not found");
        }
        const auth = yield (0, bcrypt_1.compare)(password, user.password);
        if (!auth) {
            return res.status(400).send("Invalid password");
        }
        res.cookie(constant_1.ACCESS_TOKEN, createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "none",
        });
        return res.status(200).json({
            id: user.id,
            email: user.email,
            profileSetup: user.profileSetup,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            bgColor: user.bgColor,
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
});
exports.login = login;
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield user_model_1.default.findById(req.userId);
        if (!userInfo)
            return res.status(404).send("User with the given id not found");
        return res.status(200).json({
            id: userInfo.id,
            email: userInfo.email,
            profileSetup: userInfo.profileSetup,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            profileImage: userInfo.profileImage,
            bgColor: userInfo.bgColor,
        });
    }
    catch (error) {
        res.status(401).json({ message: "Error sending userInfo" });
    }
});
exports.getUserInfo = getUserInfo;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, bgColor } = req.body;
        if (!firstName || !lastName || !bgColor)
            return res
                .status(400)
                .send("Firstname, Lastname and BgColor is mandatory");
        const userInfo = yield user_model_1.default.findByIdAndUpdate(req.userId, { firstName, lastName, bgColor, profileSetup: true }, { new: true, runValidators: true });
        if (!userInfo)
            return res.status(404).send("User with the given id not found");
        return res.status(200).json({
            id: userInfo.id,
            email: userInfo.email,
            profileSetup: userInfo.profileSetup,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            profileImage: userInfo.profileImage,
            bgColor: userInfo.bgColor,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateProfile = updateProfile;
const addProfileImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).send("Image File is required");
        }
        const date = Date.now();
        let fileName = `src/uploads/profiles/${date}-${req.file.originalname}`;
        (0, fs_1.renameSync)(req.file.path, fileName);
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(req.userId, { profileImage: fileName }, { new: true, runValidators: true });
        return res.status(200).json({
            profileImage: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.profileImage,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.addProfileImage = addProfileImage;
const removeProfileImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        if (user.profileImage) {
            (0, fs_1.unlinkSync)(user.profileImage);
        }
        user.profileImage = null;
        yield user.save();
        return res.status(200).send("Profile Image removed successfully");
    }
    catch (error) {
        res.status(400).json({ message: "Unable to remove the profile image" });
    }
});
exports.removeProfileImage = removeProfileImage;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie(constant_1.ACCESS_TOKEN, "", { maxAge: 1, secure: true, sameSite: 'none' });
        return res.status(200).send("Logout Successfull");
    }
    catch (error) {
        res.status(500).json({ message: "There is a problem with logging out" });
    }
});
exports.logout = logout;
