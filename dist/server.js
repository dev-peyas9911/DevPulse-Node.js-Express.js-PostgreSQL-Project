

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import cors from "cors";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connectionString: process.env.connectionString,
  port: process.env.PORT,
  jwt_secret: process.env.jwt_secret
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(

            id SERIAL PRIMARY KEY,

            name VARCHAR(20) NOT NULL,
            email VARCHAR(20) UNIQUE NOT NULL,
            password TEXT NOT NULL,

            role VARCHAR(20) DEFAULT 'contributor',

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(

            id SERIAL PRIMARY KEY,

            title TEXT NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL,

            status VARCHAR(20) DEFAULT 'open',

            reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var signupIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role)
        VALUES($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users
    WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.jwt_secret, {
    expiresIn: "2d"
  });
  delete user.password;
  return { accessToken, user };
};
var authService = {
  signupIntoDB,
  loginIntoDB
};

// src/modules/auth/auth.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await authService.signupIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successfull",
      data: {
        token: result.accessToken,
        user: result.user
      }
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var authController = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload, reporter_id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssuesFromDB = async (queryParams) => {
  const { sort = "newest", type, status } = queryParams;
  let query = `
    SELECT * FROM issues
  `;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }
  if (sort === "oldest") {
    query += `
      ORDER BY created_at ASC
    `;
  } else {
    query += `
      ORDER BY created_at DESC
    `;
  }
  const result = await pool.query(query, values);
  const issues = result.rows;
  if (issues.length === 0) {
    return [];
  }
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(", ");
  const usersQuery = `
    SELECT id, name, role
    FROM users
    WHERE id IN (${placeholders})
  `;
  const usersResult = await pool.query(usersQuery, reporterIds);
  const users = usersResult.rows;
  const userMap = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    userMap.set(user.id, user);
  });
  const transformedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return transformedIssues;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    return null;
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  const transformedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return transformedIssue;
};
var updateIssueIntoDB = async (id, payload, user) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You are not authorized to update this issue");
    }
    if (issue.status !== "open") {
      throw new Error("You cannot update a non-open issue");
    }
  }
  const updates = [];
  const values = [];
  let fieldIndex = 1;
  if (payload.title) {
    updates.push(`title = $${fieldIndex}`);
    values.push(payload.title);
    fieldIndex++;
  }
  if (payload.description) {
    updates.push(`description = $${fieldIndex}`);
    values.push(payload.description);
    fieldIndex++;
  }
  if (payload.type) {
    updates.push(`type = $${fieldIndex}`);
    values.push(payload.type);
    fieldIndex++;
  }
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const query = `
    UPDATE issues
    SET ${updates.join(", ")}
    WHERE id = $${fieldIndex}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};
var deleteIssueIntoDB = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new Error("You are not authorized to delete issues");
  }
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    `,
    [id]
  );
  return null;
};
var issuesService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueIntoDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  const reporter_id = req.user?.id;
  try {
    const result = await issuesService.createIssueIntoDB(req.body, reporter_id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(
      req.query
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssueFromDB(id);
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!"
      });
    }
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const userData = req.user;
  try {
    const result = await issuesService.updateIssueIntoDB(
      id,
      req.body,
      userData
    );
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!"
      });
    }
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  const userData = req.user;
  try {
    await issuesService.deleteIssueIntoDB(id, userData);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.jwt_secret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users
        WHERE id=$1
        `,
        [decoded.id]
      );
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issuesController.createIssue);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch("/:id", auth_default(), issuesController.updateIssue);
router2.delete("/:id", auth_default(), issuesController.deleteIssue);
var issuesRoute = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5000"
  })
);
app.get("/", (req, res) => {
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Express Server"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`This Server is listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map