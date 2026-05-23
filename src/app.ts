import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config";
import sendResponse from "./utils/sendResponse";
import { authRoute } from "./modules/auth/auth.route";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended:true}));

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Express Server",
  });
});

app.use("/api/auth", authRoute)

export default app;
