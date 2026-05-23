import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcryptjs";

const signupIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  // Password hashing with bcrypt
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(`
        INSERT INTO users(name, email, password, role)
        VALUES($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING *
    `, [name, email, hashPassword, role])
    // Delete password
    delete result.rows[0].password;
    return result;
};

export const authService = {
  signupIntoDB,
};
