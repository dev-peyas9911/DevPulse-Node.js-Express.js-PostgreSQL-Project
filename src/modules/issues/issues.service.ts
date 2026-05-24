import { pool } from "../../db";
import type { Issues } from "./issues.interface";

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

const getAllIssuesFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM issues
        
        `);
  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM issues
        WHERE id=$1
        `,
    [id],
  );
  return result;
};

export const issuesService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
};
