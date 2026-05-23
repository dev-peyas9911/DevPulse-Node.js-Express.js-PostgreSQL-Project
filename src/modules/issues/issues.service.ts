import { pool } from "../../db";
import type { Issues } from "./issues.interface";

const createIssueIntoDB = async(payload:Issues) => {
    const {title, description, type, status} = payload;
    const result = await pool.query(`
        
        `)
}

export const issuesService = {
    createIssueIntoDB
}