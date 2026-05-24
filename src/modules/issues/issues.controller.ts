import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issues.service";
import type { TIssueQuery } from "./issues.interface";

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
const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query as TIssueQuery);
    // console.log(result)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

// Get Single Issue
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssueFromDB(id as string);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!",
      });
    }
    // console.log(result)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue retrived successfully",
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

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
};
