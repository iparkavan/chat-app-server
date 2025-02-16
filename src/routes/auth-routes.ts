import {
  addProfileImage,
  getUserInfo,
  login,
  logout,
  removeProfileImage,
  signup,
  updateProfile,
} from "../controllers/auth-controllers";
import { verifyToken } from "../middlewares/auth-middleware";
import Router from "express";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "src/uploads/profiles/" });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/get-userinfo", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);
authRoutes.post("/logout", logout);

export default authRoutes;
