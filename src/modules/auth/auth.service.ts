import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup into DB
const signupIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  // Password hashing with bcrypt
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role)
        VALUES($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  // Delete password
  delete result.rows[0].password;
  return result;
};

// Login into DB
const loginIntoDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  // 1. Check if the user exists ->
  const userData = await pool.query(
    `
    SELECT * FROM users
    WHERE email=$1
    `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  // 2. Compare the password -> Done
  const user = userData.rows[0];
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new Error("Invalid Credentials");
  }
  //3. Generate Token -> Done
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const accessToken = jwt.sign(jwtPayload, config.jwt_secret as string, {
    expiresIn: "2d",
  });
  delete user.password;
  return { accessToken, user };
};

export const authService = {
  signupIntoDB,
  loginIntoDB,
};
