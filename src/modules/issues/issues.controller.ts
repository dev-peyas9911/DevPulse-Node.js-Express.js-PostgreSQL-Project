import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issues.service";
import type { TIssueQuery } from "./issues.interface";
import type { JwtPayload } from "jsonwebtoken";

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
    const result = await issuesService.getAllIssuesFromDB(
      req.query as TIssueQuery,
    );
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
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!",
      });
    }
    // console.log(result)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue retrived successfully",
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

// Update Issue
const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData = req.user;
  try {
    const result = await issuesService.updateIssueIntoDB(
      id as string,
      req.body,
      userData as JwtPayload,
    );
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!",
      });
    }
    // console.log(result)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue updated successfully",
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

// Delete Issue
const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData = req.user;
  try {
    await issuesService.deleteIssueIntoDB(id as string, userData as JwtPayload);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
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
  updateIssue,
  deleteIssue,
};
