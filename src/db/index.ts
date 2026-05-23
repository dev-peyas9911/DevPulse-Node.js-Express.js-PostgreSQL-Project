import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connectionString,
});

export const initDB = async () => {
  try {
    // Create Users Table
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

    // Create Issues Table
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
