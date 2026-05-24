import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check if the token exists
      const token = req.headers.authorization;
      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access",
        });
      }
      // 2. Verify the token
      const decoded = jwt.verify(
        token as string,
        config.jwt_secret as string,
      ) as JwtPayload;
    //   console.log(decoded);
      // 3. Find the user into database
      const userData = await pool.query(
        `
        SELECT * FROM users
        WHERE id=$1
        `,
        [decoded.id],
      );
    //   console.log(userData.rows[0]);
      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found",
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
