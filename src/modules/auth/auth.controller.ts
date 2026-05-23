import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

// Signup User
const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginIntoDB(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successfull",
      data: {
        token: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  signupUser,
  loginUser,
};
