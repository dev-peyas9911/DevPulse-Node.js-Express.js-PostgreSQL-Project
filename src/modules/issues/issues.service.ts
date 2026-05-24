import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { Issues, TIssueQuery } from "./issues.interface";

const createIssueIntoDB = async (payload: Issues, reporter_id: number) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, reporter_id],
  );
  return result;
};

const getAllIssuesFromDB = async (queryParams: TIssueQuery) => {
  // From
  const { sort = "newest", type, status } = queryParams;

  // Base query
  let query = `
    SELECT * FROM issues
  `;

  // Dynamic conditions
  const conditions: string[] = [];

  // Dynamic values
  const values: string[] = [];

  // Filter by type
  if (type) {
    values.push(type);

    conditions.push(`type = $${values.length}`);
  }

  // Filter by status
  if (status) {
    values.push(status);

    conditions.push(`status = $${values.length}`);
  }

  // Add WHERE clause if needed
  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }

  // Sorting
  if (sort === "oldest") {
    query += `
      ORDER BY created_at ASC
    `;
  } else {
    query += `
      ORDER BY created_at DESC
    `;
  }

  //   console.log(query);
  //   console.log(values);

  const result = await pool.query(query, values);

  //    get users information
  const issues = result.rows;

  // If no issues
  if (issues.length === 0) {
    return [];
  }

  // Extract unique reporter ids
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  // Create placeholders
  const placeholders = reporterIds
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  // Fetch reporters
  const usersQuery = `
    SELECT id, name, role
    FROM users
    WHERE id IN (${placeholders})
  `;

  const usersResult = await pool.query(usersQuery, reporterIds);

  const users = usersResult.rows;

  // Create map
  const userMap = new Map();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  // Transform issues
  const transformedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter: userMap.get(issue.reporter_id),

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return transformedIssues;
};

const getSingleIssueFromDB = async (id: string) => {
  //   const result = await pool.query(
  //     `
  //         SELECT * FROM issues
  //         WHERE id=$1
  //         `,
  //     [id],
  //   );
  //   return result;

  // -------
  // 1. Fetch issue
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id],
  );

  // 2. Check issue exists
  if (issueResult.rows.length === 0) {
    return null;
  }

  // 3. Extract issue
  const issue = issueResult.rows[0];

  // 4. Fetch reporter
  const userResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id],
  );

  // 5. Extract reporter
  const reporter = userResult.rows[0];

  // 6. Transform response
  const transformedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter,

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };

  return transformedIssue;
};

const updateIssueIntoDB = async (
  id: string,
  payload: any,
  user: JwtPayload,
) => {
  // 1. Find issue
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id],
  );

  // 2. Check issue exists
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // 3. Authorization Logic

  // If contributor
  if (user.role === "contributor") {
    // Check ownership
    if (issue.reporter_id !== user.id) {
      throw new Error("You are not authorized to update this issue");
    }

    // Check status
    if (issue.status !== "open") {
      throw new Error("You cannot update a non-open issue");
    }
  }

  // Maintainer bypasses everything

  // 4. Dynamic update fields
  const updates: string[] = [];

  const values: any[] = [];

  let fieldIndex = 1;

  // title
  if (payload.title) {
    updates.push(`title = $${fieldIndex}`);

    values.push(payload.title);

    fieldIndex++;
  }

  // description
  if (payload.description) {
    updates.push(`description = $${fieldIndex}`);

    values.push(payload.description);

    fieldIndex++;
  }

  // type
  if (payload.type) {
    updates.push(`type = $${fieldIndex}`);

    values.push(payload.type);

    fieldIndex++;
  }

  // Always update updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  // Add id at end
  values.push(id);

  // 5. Final query
  const query = `
    UPDATE issues
    SET ${updates.join(", ")}
    WHERE id = $${fieldIndex}
    RETURNING *
  `;

  // 6. Execute update
  const result = await pool.query(query, values);

  return result.rows[0];
};

export const issuesService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
};
