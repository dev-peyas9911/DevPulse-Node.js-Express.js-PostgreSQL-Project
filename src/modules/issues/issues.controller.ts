import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.createIssueIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const issuesController = {
  createIssue,
};
