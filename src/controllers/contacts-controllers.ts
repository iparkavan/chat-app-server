import { ExpressHandler } from "../types/constant";
import User from "../models/user-model";
import Message from "../models/messages-model";
import mongoose from "mongoose";

export const searchContacts: ExpressHandler = async (req, res, next) => {
  try {
    const { searchTerms } = req.body;

    if (searchTerms === undefined || searchTerms === null) {
      return res.status(400).send("Search Term is Reaquired");
    }

    const sanitizedSearchTerm = searchTerms.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });

    return res.status(200).json({ contacts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getContactsForDmList: ExpressHandler = async (req, res, next) => {
  try {
    let userId: mongoose.Types.ObjectId | undefined;

    if (req.userId) {
      userId = new mongoose.Types.ObjectId(req.userId);
    }

    const contacts = await Message.aggregate([
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
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getAllContacts: ExpressHandler = async (req, res, next) => {
  try {
    const users = User.find(
      { _id: { $ne: req.userId } },
      "firstName, lastName, _id, email"
    );

    const contacts = (await users).map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return res.status(200).json({ contacts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
