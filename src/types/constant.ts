import { NextFunction, Request, Response } from "express";

export const ACCESS_TOKEN = "__access-token";

export type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

// export type senderReciver = {
//   _id: string;
//   email: string;
//   bgColor: number;
//   firstName: string;
//   lastName: string;
// };

// _id: string;
// sender: string;
// recipient: string;
// messageType: string;
// content: string | undefined;
// fileUrl: string | undefined;

export type MessagesTypes = {
  _id: string;
  sender: string;
  recipient: string;
  messageType: "text" | "file";
  content: string | undefined;
  fileUrl: string | undefined;
  timestamp: string;
};

// types.d.ts

declare global {
  namespace Express {
    interface Request {
      userId?: string | undefined; // Allow both string and DecodedIdToken types
    }
  }
}
