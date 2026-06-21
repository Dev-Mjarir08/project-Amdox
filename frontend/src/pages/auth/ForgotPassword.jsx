import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { apiFetch } from "../../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setSuccess(res.message || "Reset link sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to trigger password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-xl border border-white/70 bg-white/80 p-6 sm:p-10 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-black text-white">
              AX
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Security Space
              </p>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Recover Password</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Provide your registered work email to receive a password reset recovery link.
            </p>

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Work Email</span>
              <span className="relative mt-2 block">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@amdoxerp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="erp-focus h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="erp-focus mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="mt-6 flex justify-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary dark:text-slate-400">
                <FiArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
