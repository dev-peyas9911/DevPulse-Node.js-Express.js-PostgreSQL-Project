import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issues.service";

// Create Issue
const createIssue = async (req: Request, res: Response) => {
  const reporter_id = req.user?.id;
  // console.log("from controller", req?.user);
  try {
    const result = await issuesService.createIssueIntoDB(req.body, reporter_id);
    // console.log(result)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
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

// Get all issues
const getAllIssues = async(req:Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssuesFromDB();
    // console.log(result)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issues retrived successfully",
      data: result.rows,
    });
  } catch (error:any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
}

export const issuesController = {
  createIssue,
  getAllIssues
};
