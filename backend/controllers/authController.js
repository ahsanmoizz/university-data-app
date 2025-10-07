// backend/controllers/authController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/emailService.js";

const prisma = new PrismaClient();

// Helper: Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 1️⃣ Register → send OTP
export const register = async (req, res) => {
  try {
    const { username, email, password, role = "student" } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isVerified)
      return res.status(400).json({ message: "User already registered." });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    const passwordHash = await bcrypt.hash(password, 10);

   await prisma.user.upsert({
  where: { email },
  update: { username, passwordHash, otp, otpExpiry, role },
  create: { username, email, passwordHash, otp, otpExpiry, role },
});

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// 2️⃣ Verify OTP → create/activate user
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // 🔹 Validate OTP
    if (user.otp !== otp || new Date() > user.otpExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    // 🔹 If user not verified → mark verified
    if (!user.isVerified) {
      await prisma.user.update({
        where: { email },
        data: { isVerified: true, otp: null, otpExpiry: null },
      });
    } else {
      // 🔹 For login OTP flow → just clear OTP
      await prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiry: null },
      });
    }

    // 🔹 Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "OTP verified successfully.",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "OTP verification failed." });
  }
};
// 3️⃣ Login (supports both password & OTP-based)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
 /*if (
  email === process.env.ADMIN_EMAIL &&
  password === process.env.ADMIN_PASSWORD
) {
  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    message: "Admin login successful",
    token,
    user: { email, role: "admin" },
  });
} */
if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
  // include id:0 so middleware can handle it consistently
  const token = jwt.sign(
    { id: 0, email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    message: "Admin login successful",
    token,
    user: { id: 0, email, username: "admin", role: "admin" },
  });
}
    // ✅ Step 1: Check user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify OTP first." });

    // ✅ Step 2: If password is provided → password login
    if (password) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "Invalid credentials." });

      const token = generateToken(user);
      return res.status(200).json({
        message: "Login successful (password).",
        token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    }

    // ✅ Step 3: If password missing → send OTP for login
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent for login. Check your email.",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};


// 4️⃣ Forgot password → resend OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending new OTP." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.otp !== otp || new Date() > user.otpExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, otp: null, otpExpiry: null },
    });

    res.status(200).json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Error resetting password." });
  }
};
