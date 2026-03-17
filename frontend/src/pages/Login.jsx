import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authAPI } from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    role: "user",
  });

  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { email, otp, role } = formData;

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

  /* ---------------- Register Page ---------------- */

  const switchToRegister = () => navigate("/register");

  /* ---------------- Send OTP ---------------- */

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.sendOtp(email, role);

      if (response.data.success) {
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
      const response = await authAPI.verifyOtp(email, otp, role);

      if (response.data.success) {
        const user = response.data.user;

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "admin") navigate("/admin");
        else if (user.role === "agent") navigate("/agent");
        else navigate(`/${user.name}`);
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

 /* ---------------- Google Login ---------------- */
const handleGoogleSuccess = async (credentialResponse) => {
  if (!credentialResponse || !credentialResponse.credential) {
    setError("Google login failed: no credential received");
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
        token: credentialResponse.credential, // this is the JWT from Google
        role: role, // from your form select
      }),
    });

    const data = await res.json();

    if (data.success) {
      const user = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "agent") navigate("/agent");
      else navigate(`/${user.name}`);
    } else {
      setError(data.message || "Google authentication failed");
    }
  } catch (err) {
    console.error("Backend Error:", err);
    setError("Unable to connect to server");
  } finally {
    setLoading(false);
  }
}; 

  /* ---------------- UI ---------------- */

return (
    <div className="min-h-screen flex items-center justify-center bg-[#121c2c] p-4 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl min-h-[550px]">
        
        {/* Left Panel: Branding & Features */}
        <div className="hidden md:flex md:w-1/2 bg-[#091e35] p-10 flex-col text-white">
          <div className="mb-12">
            <h1 className="text-xl font-bold italic tracking-tight">
              <span className="text-blue-400">/</span>Finixpay
            </h1>
            <p className="text-sm font-medium opacity-90">Magic Checkout</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold leading-tight mb-8">
              Hello again,<br />
              Exciting offer waiting for you
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🌍</div>
              <p className="text-sm opacity-90 font-medium">Enjoy hassle free shopping with<br/>the best offers applied for you</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🤩</div>
              <p className="text-sm opacity-90 font-medium">Explore unbeatable prices<br/>and unmatchable value</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🛡️</div>
              <p className="text-sm opacity-90 font-medium">100% secure & spam free, we<br/>will not annoy you, pinky promise!</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Form Logic */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg mb-4 border border-red-100">
              {error}
            </div>
          )}

          <div className="flex-grow flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {step === "login" ? "Login with Email" : "Verify OTP"}
            </h3>

            {step === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role Selector styled to match */}
                <div className="mb-2">
                   <select
                    name="role"
                    value={role}
                    onChange={onChange}
                    className="w-full text-xs font-semibold text-blue-600 bg-blue-50 border-none rounded-md px-2 py-1 mb-2 outline-none"
                  >
                    <option value="user">USER MODE</option>
                    <option value="admin">ADMIN MODE</option>
                    <option value="agent">AGENT MODE</option>
                  </select>
                </div>

                <div className="relative border border-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="name@example.com"
                    required
                    className="w-full text-gray-700 font-medium outline-none mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#091e35] text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  {loading ? "Please wait..." : "Login with Finixpay"}
                </button>
              </form>
            ) : (
              /* OTP Step */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="relative border border-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 text-center">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={onChange}
                    maxLength={6}
                    placeholder="000 000"
                    required
                    className="w-full text-2xl tracking-[0.5em] text-gray-800 font-bold outline-none text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#091e35] text-white py-4 rounded-lg font-bold hover:bg-black transition-colors"
                >
                  {loading ? "Verifying..." : "Confirm OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  className="w-full text-sm font-semibold text-blue-600 disabled:text-gray-400"
                >
                  {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </form>
            )}

            {/* Social & Switch Links */}
            <div className="mt-8">
               <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold">OR USE GOOGLE</span>
                  <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <div className="flex justify-center mt-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                />
              </div>

              <p className="mt-8 text-center text-xs text-gray-500">
                New here? <button onClick={switchToRegister} className="text-blue-600 font-bold">Create an account</button>
              </p>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-gray-400 text-center px-4 leading-relaxed">
            By Proceeding, I agree to my data being processed as per FinixPay's <span className="underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;