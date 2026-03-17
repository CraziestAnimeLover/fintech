import jwt from "jsonwebtoken";
import User from "../models/User.js";

const { verify } = jwt;
// Protect routes - verify JWT token
export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    });
  }
}