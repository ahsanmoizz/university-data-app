import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [useOtp, setUseOtp] = useState(true); // toggle between OTP & password
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Step 1 — Send OTP
  const handleSendOtp = async () => {
    try {
      await API.post("/auth/login", { email });
      setStep(2);
    } catch (err) {
      alert("Error sending OTP.");
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async () => {
    try {
      const { data } = await API.post("/auth/verify-otp", { email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      redirectRole(data.user.role);
    } catch (err) {
      alert("Invalid OTP.");
    }
  };

  // Alternative — Password Login
  const handlePasswordLogin = async () => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userUpdated"));
      redirectRole(data.user.role);
    } catch (err) {
      alert("Login failed.");
    }
  };

  const redirectRole = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "professor") navigate("/professor");
    else navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 border p-6 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {/* Toggle OTP / Password mode */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setUseOtp(true)}
          className={`px-4 py-2 ${useOtp ? "bg-black text-white" : "bg-gray-200"}`}
        >
          OTP Login
        </button>
        <button
          onClick={() => setUseOtp(false)}
          className={`px-4 py-2 ${!useOtp ? "bg-black text-white" : "bg-gray-200"}`}
        >
          Password Login
        </button>
      </div>

      {/* OTP LOGIN FLOW */}
      {useOtp ? (
        <>
          {step === 1 ? (
            <>
              <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full mb-4"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleSendOtp}
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
              <button
                onClick={handleVerifyOtp}
                className="bg-black text-white w-full py-2 rounded"
              >
                Verify OTP
              </button>
            </>
          )}
        </>
      ) : (
        <>
          {/* PASSWORD LOGIN FLOW */}
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-2"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-4"
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
  className="border p-2 w-full mb-4"
  value={role}
  onChange={(e) => setRole(e.target.value)}
>
  <option value="student">Login as Student</option>
  <option value="professor">Login as Professor</option>
  <option value="admin">Login as Admin</option>
</select>

          <button
            onClick={handlePasswordLogin}
            className="bg-blue-600 text-white w-full py-2 rounded"
          >
            Login
          </button>
        </>
      )}
       <p className="text-sm text-right mt-2">
  <a href="/forgot-password" className="text-blue-600 underline">Forgot password?</a>
</p>
      <p className="mt-4 text-center text-sm">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 underline">
          Register here
        </Link>
      </p>

    </div>
  );
}
