import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student"); // 👈 NEW
  const navigate = useNavigate();

  // 1️⃣ Send OTP
  const handleSendOtp = async () => {
    if (!email || !username || !password) {
      alert("Please fill all fields before sending OTP.");
      return;
    }
    try {
      await API.post("/auth/register", { email, username, password, role }); // 👈 include role
      alert("OTP sent! Check your email.");
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Error sending OTP.");
    }
  };

  // 2️⃣ Verify OTP
  const handleVerify = async () => {
    if (!otp) {
      alert("Please enter OTP.");
      return;
    }
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      alert(res.data.message || "Registration complete!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("OTP verification failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border p-6 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      {/* STEP 1 — REGISTER INFO */}
      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="Username"
            className="border p-2 w-full mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 👇 New dropdown for role selection */}
          <select
            className="border p-2 w-full mb-4"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Register as Student</option>
            <option value="professor">Register as Professor</option>
          </select>

          <button
            onClick={handleSendOtp}
            className="bg-green-600 text-white w-full py-2 rounded"
          >
            Send OTP
          </button>
        </>
      )}

      {/* STEP 2 — VERIFY OTP */}
      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="border p-2 w-full mb-4"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerify}
            className="bg-black text-white w-full py-2 rounded"
          >
            Verify OTP
          </button>
        </>
      )}

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
