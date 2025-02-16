"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controllers_1 = require("../controllers/auth-controllers");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const authRoutes = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: "src/uploads/profiles/" });
authRoutes.post("/signup", auth_controllers_1.signup);
authRoutes.post("/login", auth_controllers_1.login);
authRoutes.get("/get-userinfo", auth_middleware_1.verifyToken, auth_controllers_1.getUserInfo);
authRoutes.post("/update-profile", auth_middleware_1.verifyToken, auth_controllers_1.updateProfile);
authRoutes.post("/add-profile-image", auth_middleware_1.verifyToken, upload.single("profile-image"), auth_controllers_1.addProfileImage);
authRoutes.delete("/remove-profile-image", auth_middleware_1.verifyToken, auth_controllers_1.removeProfileImage);
authRoutes.post("/logout", auth_controllers_1.logout);
exports.default = authRoutes;
