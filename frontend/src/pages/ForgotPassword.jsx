import { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      await API.post("/auth/forgot-password", { email });
      alert("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      alert("Error sending OTP.");
    }
  };

  const resetPassword = async () => {
    try {
      await API.post("/auth/reset-password", { email, otp, newPassword });
      alert("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      alert("Error resetting password.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border p-6 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            className="border p-2 w-full mb-4"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={sendOtp}
            className="bg-black text-white w-full py-2 rounded"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="border p-2 w-full mb-4"
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter new password"
            className="border p-2 w-full mb-4"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={resetPassword}
            className="bg-blue-600 text-white w-full py-2 rounded"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
}
