

import { ACCESS_TOKEN, ExpressHandler } from "../types/constant";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyToken: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies[ACCESS_TOKEN];

  if (!token) return res.status(401).send("You are not authenticated!");

  jwt.verify(
    token,
    process.env.JWT_KEY as string,
    (err: VerifyErrors | null, decoded: any) => {
      if (err) return res.status(403).send("Token is not valid");

      const payload = decoded as JwtPayload;

      req.userId = payload.userId;

      next();
    }
  );
};
