import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import sendResponse from "./utils/sendResponse";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Express Server",
  });
});

// Auth related api
app.use("/api/auth", authRoute);

// Issue related api
app.use("/api/issues", issuesRoute);

// Global Error
app.use(globalErrorHandler);

export default app;
