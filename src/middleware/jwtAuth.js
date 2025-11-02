import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { findUserById } from "../db/inMemoryUserStore.js";

export const jwtAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Missing or invalid authorization header" });

    const token = auth.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid token (user not found)" });

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

