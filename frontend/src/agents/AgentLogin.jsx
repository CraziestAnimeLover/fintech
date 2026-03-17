import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

const AgentLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { email, otp } = formData;
  const role = "agent";

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  /* ---------------- OTP Countdown ---------------- */
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
  };

  /* ---------------- Send OTP ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.sendOtp(email, role);
      if (res.data.success) {
        setStep("otp");
        startCountdown();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Verify OTP ---------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.verifyOtp(email, otp, role);
      if (res.data.success) {
        const user = res.data.user;
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/agent");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Resend OTP ---------------- */
  const handleResendOtp = async () => {
    if (resendDisabled) return;

    try {
      await authAPI.resendOtp(email);
      startCountdown();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    }
  };

  /* ---------------- Google Login ---------------- */
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google login failed");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          role: role,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/agent");
      } else {
        setError(data.message || "Google authentication failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121c2c] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl min-h-[550px]">

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 bg-[#091e35] p-10 flex-col text-white">
          <div className="mb-12">
            <h1 className="text-xl font-bold italic">
              <span className="text-blue-400">/</span>Finixpay
            </h1>
            <p className="text-sm opacity-90">Agent Portal</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">
              Welcome Agent,<br />
              Manage your earnings easily
            </h2>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">💰</div>
              <p className="text-sm">Track commissions & transactions</p>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">⚡</div>
              <p className="text-sm">Fast settlements & withdrawals</p>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">🔒</div>
              <p className="text-sm">Secure & reliable platform</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded mb-4">
              {error}
            </div>
          )}

          <h3 className="text-2xl font-bold mb-6">
            {step === "login" ? "Agent Login" : "Verify OTP"}
          </h3>

          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="border p-3 rounded-lg">
                <label className="text-xs text-gray-400">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full outline-none"
                />
              </div>

              <button className="w-full bg-[#091e35] text-white py-4 rounded-lg font-bold">
                {loading ? "Sending..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={onChange}
                maxLength={6}
                required
                placeholder="000000"
                className="w-full text-center text-2xl tracking-widest border p-3 rounded-lg"
              />

              <button className="w-full bg-[#091e35] text-white py-4 rounded-lg font-bold">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendDisabled}
                className="w-full text-sm text-blue-600"
              >
                {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </form>
          )}

          {/* Google */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 mb-3">OR CONTINUE WITH</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google failed")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;