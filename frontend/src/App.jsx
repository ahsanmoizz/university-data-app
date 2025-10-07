import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadAnalyze from "./pages/UploadAnalyze";
import AdminPanel from "./pages/AdminPanel";
import PaymentPage from "./pages/PaymentPage";
import PublicDashboard from "./pages/PublicDashboard";
import ProfessorPanel from "./pages/ProfessorPanel";
import Dashboard from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
export default function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Student */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="student">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/calendar"
  element={
    <ProtectedRoute role="student">
      <CalendarView />
    </ProtectedRoute>
  }
/>
          <Route
            path="/upload"
            element={
              <ProtectedRoute role="student">
                <UploadAnalyze />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* Professor */}
          <Route
            path="/professor"
            element={
              <ProtectedRoute role="professor">
                <ProfessorPanel />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Public */}
          <Route path="/public" element={<PublicDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
