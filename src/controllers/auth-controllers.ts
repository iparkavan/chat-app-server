import jwt from "jsonwebtoken";
import { ACCESS_TOKEN, ExpressHandler } from "../types/constant";
import { compare } from "bcrypt";
import User from "../models/user-model";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email: string, userId: string) => {
  const JWT_KEY = process.env.JWT_KEY as string;
  return jwt.sign({ email, userId }, JWT_KEY, { expiresIn: maxAge });
};


export const signup: ExpressHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password is required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({
        message: "You have already registered your account, try signin",
      });

    const user = await User.create({ email, password });

    res.cookie(ACCESS_TOKEN, createToken(email, user.id), {
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
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const login: ExpressHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User with the given email not found");
    }

    const auth = await compare(password, user.password);

    if (!auth) {
      return res.status(400).send("Invalid password");
    }

    res.cookie(ACCESS_TOKEN, createToken(email, user.id), {
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
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getUserInfo: ExpressHandler = async (req, res, next) => {
  try {
    const userInfo = await User.findById(req.userId);

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
  } catch (error) {
    res.status(401).json({ message: "Error sending userInfo" });
  }
};

export const updateProfile: ExpressHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, bgColor } = req.body;

    if (!firstName || !lastName || !bgColor)
      return res
        .status(400)
        .send("Firstname, Lastname and BgColor is mandatory");

    const userInfo = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, bgColor, profileSetup: true },
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addProfileImage: ExpressHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("Image File is required");
    }

    const date = Date.now();

    let fileName = `src/uploads/profiles/${date}-${req.file.originalname}`;
    renameSync(req.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: fileName },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      profileImage: updatedUser?.profileImage,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeProfileImage: ExpressHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.profileImage) {
      unlinkSync(user.profileImage);
    }

    user.profileImage = null;

    await user.save();

    return res.status(200).send("Profile Image removed successfully");
  } catch (error) {
    res.status(400).json({ message: "Unable to remove the profile image" });
  }
};

export const logout: ExpressHandler = async (req, res, next) => {
  try {
   res.cookie(ACCESS_TOKEN, "", {maxAge: 1, secure: true, sameSite: 'none'})
    return res.status(200).send("Logout Successfull");
  } catch (error) {
    res.status(500).json({ message: "There is a problem with logging out" });
  }
};
