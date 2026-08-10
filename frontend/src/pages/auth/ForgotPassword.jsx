import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiLock, FiShield, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../lib/api.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success(`6-digit OTP code sent to ${email}`);
      setStep(2);
    } catch (err) {
      console.error('Send OTP error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter the valid 6-digit OTP code");
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otp.trim() });
      toast.success("OTP verified successfully! Create your new password.");
      setStep(3);
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        password
      });
      toast.success("Password reset successfully! You can now sign in.");
      navigate('/login');
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <Link
            to="/login"
            className="erp-focus inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-primary dark:text-slate-400"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          {/* Progress Indicator */}
          <div className="mt-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 1 ? 'bg-primary' : 'bg-slate-300'}`}>1</span>
              Email
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-2 dark:bg-slate-800" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 2 ? 'bg-primary' : 'bg-slate-300'}`}>2</span>
              Verify OTP
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-2 dark:bg-slate-800" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-primary' : 'text-slate-400'}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 3 ? 'bg-primary' : 'bg-slate-300'}`}>3</span>
              New Password
            </div>
          </div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="mt-6 space-y-6">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                  <FiMail className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold text-slate-950 dark:text-white">Forgot Password?</h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered work email to receive a 6-digit OTP code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="erp-focus h-11 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending OTP Code...' : 'Send OTP Code'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter & Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="mt-6 space-y-6">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
                  <FiShield className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold text-slate-950 dark:text-white">Enter Security OTP</h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  We sent a 6-digit OTP code to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold tracking-widest text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="erp-focus h-11 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Password Update Box */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-5">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-3">
                  <FiCheckCircle className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold text-slate-950 dark:text-white">Create New Password</h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Your OTP was verified. Set your new secure password below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="erp-focus h-11 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Remember your password?{" "}
            <Link to="/login" className="font-bold text-primary hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
