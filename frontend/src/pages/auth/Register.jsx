import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiLock, FiMail, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import api from "../../lib/api.js";
import logo from "../../assets/logo.png";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.enum(["admin", "hr", "manager", "employee"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'employee' }
  });

  const watchRole = watch('role');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  useEffect(() => {
    register('role');
  }, [register]);

  async function onSubmit(values) {
    try {
      const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (localUsers.some(u => u.email === values.email)) {
        toast.error('Email is already registered!');
        return;
      }

      // Backend registration
      try {
        await api.post('/auth/register', {
          name: values.fullName,
          email: values.email,
          company: values.company,
          role: values.role,
          password: values.password,
        });
      } catch (err) {
        console.warn('Backend registration warning:', err);
      }

      localUsers.push({
        id: 'u-' + Date.now(),
        name: values.fullName,
        email: values.email,
        company: values.company,
        role: values.role,
        password: values.password
      });
      localStorage.setItem('registeredUsers', JSON.stringify(localUsers));

      // Trigger OTP email sending
      setRegisteredEmail(values.email);
      try {
        await api.post('/auth/send-otp', { email: values.email });
        toast.success(`OTP verification code sent to ${values.email}`);
      } catch (e) {
        toast.info('Account created. Please verify your OTP code.');
      }

      setShowOtpModal(true);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed');
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      toast.error('Please enter the valid OTP code');
      return;
    }
    try {
      setIsVerifyingOtp(true);
      await api.post('/auth/verify-otp', { email: registeredEmail, otp: otpInput });
      toast.success('Email verified successfully! You can now sign in.');
      setShowOtpModal(false);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResendingOtp(true);
      await api.post('/auth/send-otp', { email: registeredEmail });
      toast.success(`New OTP code sent to ${registeredEmail}`);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AMDOX ERP Logo" className="h-12 w-12 rounded-xl object-cover shadow-sm border border-white/10" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                AMDOX ERP
              </p>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Create account</h1>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</span>
              <span className="relative mt-2 block">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('fullName')}
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </span>
              {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Work Email</span>
              <span className="relative mt-2 block">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  {...register('email')}
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </span>
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Company</span>
              <span className="relative mt-2 block">
                <FiBriefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('company')}
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </span>
              {errors.company && <p className="mt-1 text-xs text-rose-500">{errors.company.message}</p>}
            </label>
            <div className="sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Workspace Role</span>
              <div className="mt-2 grid gap-3 grid-cols-2 sm:grid-cols-4">
                {[
                  { id: 'admin', label: 'Admin', desc: 'Full ERP Control' },
                  { id: 'hr', label: 'HR', desc: 'People & Payroll' },
                  { id: 'manager', label: 'Manager', desc: 'Projects & Tasks' },
                  { id: 'employee', label: 'Employee', desc: 'Personal Board' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setValue('role', r.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition duration-200 hover:scale-[1.02] ${
                      watchRole === r.id
                        ? 'border-primary bg-primary/5 text-primary shadow-soft dark:bg-primary/10'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{r.label}</span>
                    <span className="mt-1 text-[10px] opacity-70 leading-normal">{r.desc}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="mt-1 text-xs text-rose-500">{errors.role.message}</p>}
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</span>
              <span className="relative mt-2 block">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </span>
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm Password</span>
              <span className="relative mt-2 block">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register('confirmPassword')}
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </span>
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="erp-focus mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
          >
            Create Workspace
            <FiArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-primary hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {/* OTP Email Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <form onSubmit={handleVerifyOtp} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary dark:bg-blue-900/40">
                <FiMail className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Verify Your Email</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                We sent a 6-digit OTP code to <strong className="text-slate-800 dark:text-slate-200">{registeredEmail}</strong>
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white text-center text-2xl font-bold tracking-[8px] text-slate-900 erp-focus dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isVerifyingOtp ? 'Verifying Code...' : 'Verify Email & Continue'}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp}
                className="text-xs font-semibold text-slate-500 hover:text-primary transition py-1 dark:text-slate-400"
              >
                {isResendingOtp ? 'Sending New OTP...' : 'Resend OTP Code'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
