// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const prisma = new PrismaClient();

/**
 * authenticateToken
 * - verifies JWT
 * - if token contains a valid user id => fetch user from DB and check isBlocked
 * - if token role === 'admin' => accept (this allows env-based admin login)
 * - if token contains email but not id => try looking up user by email
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access token required." });

    // Verify token (throws if invalid)
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { id, email, role } = payload;

    // 1) If token contains id (and it's not 0), check DB for blocked user
    if (typeof id !== "undefined" && id !== null && id !== 0) {
      const dbUser = await prisma.user.findUnique({ where: { id } });
      if (!dbUser) return res.status(401).json({ message: "User not found." });
      if (dbUser.isBlocked) return res.status(403).json({ message: "Account blocked. Contact admin." });

      req.user = { id: dbUser.id, role: dbUser.role, email: dbUser.email };
      return next();
    }

    // 2) If token explicitly declares admin role -> accept (no DB lookup)
    if (role === "admin") {
      req.user = { id: id ?? 0, role: "admin", email: email ?? null };
      return next();
    }

    // 3) Fallback: if token has email, lookup user by email
    if (email) {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) return res.status(401).json({ message: "User not found." });
      if (dbUser.isBlocked) return res.status(403).json({ message: "Account blocked. Contact admin." });

      req.user = { id: dbUser.id, role: dbUser.role, email: dbUser.email };
      return next();
    }

    // otherwise invalid token payload
    return res.status(403).json({ message: "Invalid token payload." });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({ message: "Invalid token." });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access only." });
  next();
};

export const authorizeAdminOrProfessor = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "professor") return next();
  res.status(403).json({ message: "Access denied. Professors/Admins only." });
};
