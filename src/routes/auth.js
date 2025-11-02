import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";
import { createUser, findUserByEmail } from "../db/inMemoryUserStore.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: "User already exists" });

    const saltRounds = config.bcryptSaltRounds;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await createUser({ id: uuidv4(), email, passwordHash, role: role === "admin" ? "admin" : "user" });

    // Do not return password/hash in response
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return res.json({ accessToken: token, tokenType: "Bearer", expiresIn: config.jwtExpiresIn });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

