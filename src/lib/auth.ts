// import jwt from "jsonwebtoken";
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET!; // Set this in your .env

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
    };
  } catch (err) {
    return null;
  }
}
