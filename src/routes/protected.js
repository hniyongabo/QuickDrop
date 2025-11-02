import express from "express";
import { jwtAuth } from "../middleware/jwtAuth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

router.get("/me", jwtAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

router.get("/admin-only", jwtAuth, requireRole("admin"), (req, res) => {
  res.json({ secret: "only admins can see this" });
});

router.get("/user-only", jwtAuth, requireRole("user"), (req, res) => {
  res.json({ secret: "only users with role user can see this" });
});

export default router;
