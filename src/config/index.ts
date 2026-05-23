import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connectionString: process.env.connectionString,
  port: process.env.PORT,
  jwt_secret: process.env.jwt_secret
};

export default config;
