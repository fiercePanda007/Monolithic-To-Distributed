import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "fg736rr36rgy63";

// Middleware to authenticate user with JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });
    req.user = user;
    next();
  });
};

export default authenticateToken;
