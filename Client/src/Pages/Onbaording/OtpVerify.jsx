// src/pages/auth/OtpVerify.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { API_BASE as API } from "../../constants/api";

export default function OtpVerify() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const submitRef = useRef(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;
    setLoading(true);
    try {
      await axios.post(
        `${API}/auth/verify-otp`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email verified! Complete your profile.");
      navigate("/signup/onboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      submitRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-blue-100">
        <h2
          className="text-3xl font-bold text-center text-navyBlue"
          style={{ color: "#1A2A4F" }}
        >
          Verify Email
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Enter the 6-digit OTP sent to your email
        </p>

        <form onSubmit={submit} className="mt-8">
          <input
            required
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full text-center text-2xl tracking-widest px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            disabled={loading || otp.length !== 6}
            className="mt-6 w-full py-3 bg-navyBlue text-white rounded-lg disabled:opacity-50 transition-all"
            style={{ backgroundColor: "#1A2A4F" }}
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
