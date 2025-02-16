import mongoose, { Schema, Document } from "mongoose";
import { genSalt, hash } from "bcrypt";

interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
  profileSetup: boolean;
  bgColor: number;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
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
userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
  }
  next();
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;

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
