// backend/utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"University Data System" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP for login/registration is: ${otp}. It expires in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};
