import mongoose from "mongoose";
import Channel from "../models/chennel-model";
import User from "../models/user-model";
import { ExpressHandler } from "../types/constant";

export const createChannel: ExpressHandler = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    if (!name || !members)
      return res.status(400).send("Name and members are mandatory");

    const userId = req.userId;

    const admin = await User.findById(userId);
    if (!admin) return res.status(404).send("Admin not found");

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return res.status(404).send("Some members are not found");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    res
      .status(201)
      .json({ message: "Channel created successfully", channel: newChannel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "There is a problem while creating a new channel" });
  }
};

export const getUserChannels: ExpressHandler = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updateAt: -1 });

    res
      .status(201)
      .json({ message: "Channels fetched successfully", channels });
  } catch (error) {
    res
      .status(500)
      .json({ message: "There is a problem while fetching the channels" });
  }
};
