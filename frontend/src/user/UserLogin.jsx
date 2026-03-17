import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authAPI } from "../services/api";

const UserLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  /* ---------------- OTP TIMER ---------------- */

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

  /* ---------------- SEND OTP ---------------- */

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.sendOtp(email, "user");

      if (response.data.success) {
        setStep("otp");
        startCountdown();
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.verifyOtp(email, otp, "user");

      if (response.data.success) {
        const user = response.data.user;

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/dashboard");
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    try {
      await authAPI.resendOtp(email);
      startCountdown();
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */

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

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a2b] p-4 font-sans">
      <div className="flex flex-col md:row w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl flex-row">
        
        {/* Left Panel: Razorpay Branding (Hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 bg-[#091e35] p-10 flex-col text-white">
          <div className="mb-12">
            <h1 className="text-xl font-bold italic tracking-tight">
              <span className="text-blue-400">/</span>Finixpay
            </h1>
            <p className="text-xs font-semibold tracking-wider opacity-70">Magic Checkout</p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-semibold leading-tight">
              Hello again,<br />
              Exciting offer waiting for you
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🌍</div>
                <p className="text-sm opacity-90">Enjoy hassle free shopping with<br/>the best offers applied for you</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🤩</div>
                <p className="text-sm opacity-90">Explore unbeatable prices<br/>and unmatchable value</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🛡️</div>
                <p className="text-sm opacity-90">100% secure & spam free, we<br/>will not annoy you, pinky promise!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative">
          {/* Close button icon to match image */}
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-grow flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {step === "login" ? "Login with Email" : "Verify Your Identity"}
            </h3>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100 animate-pulse">
                {error}
              </div>
            )}

            {step === "login" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="border border-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. alex@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-gray-800 font-medium outline-none bg-transparent"
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-[#091e35] text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98]"
                >
                  {loading ? "Processing..." : (
                    <>
                      Login with <span className="italic">FinixPay</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="border border-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 text-center">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="0 0 0 0 0 0"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-2xl tracking-[0.5em] text-gray-800 font-bold outline-none text-center bg-transparent"
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-[#091e35] text-white py-4 rounded-lg font-bold hover:bg-black transition-all"
                >
                  {loading ? "Verifying..." : "Confirm OTP"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                  >
                    {resendDisabled ? `Resend available in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex py-8 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold tracking-widest">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                theme="outline"
                shape="pill"
              />
            </div>
          </div>

          {/* Footer disclaimer */}
          <p className="mt-8 text-[10px] text-gray-400 text-center px-4 leading-relaxed">
            By Proceeding, I agree to my data being processed as per FinixPay's 
            <span className="underline ml-1 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;