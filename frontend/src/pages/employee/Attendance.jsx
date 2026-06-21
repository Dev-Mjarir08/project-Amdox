import { useEffect, useState, useRef } from "react";
import { FiClock, FiMapPin, FiWifi, FiLogOut, FiLogIn } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

export default function EmployeeAttendance() {
  const [logs, setLogs] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [timerText, setTimerText] = useState("00:00:00");
  const [status, setStatus] = useState("present"); // present (Office) or remote
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);

  const loadStatusAndLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load current clock in status
      const statusData = await apiFetch("/api/attendance/status");
      setClockedIn(statusData.clockedIn);
      setActiveRecord(statusData.record);

      // Load past personal logs
      const logsData = await apiFetch("/api/attendance");
      setLogs(logsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusAndLogs();
    return () => clearInterval(intervalRef.current);
  }, []);

  // Update session duration timer
  useEffect(() => {
    if (clockedIn && activeRecord?.check_in) {
      const startSecs = parseTimeToSeconds(activeRecord.check_in);
      
      const updateTimer = () => {
        const now = new Date();
        const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const diff = nowSecs - startSecs;
        
        if (diff >= 0) {
          setTimerText(formatSecondsToTime(diff));
        } else {
          // Cross-midnight or invalid
          setTimerText("00:00:00");
        }
      };

      updateTimer();
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      clearInterval(intervalRef.current);
      setTimerText("00:00:00");
    }

    return () => clearInterval(intervalRef.current);
  }, [clockedIn, activeRecord]);

  const parseTimeToSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const formatSecondsToTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      const record = await apiFetch("/api/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      setClockedIn(true);
      setActiveRecord(record);
      loadStatusAndLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      await apiFetch("/api/attendance/clock-out", {
        method: "POST",
      });
      setClockedIn(false);
      setActiveRecord(null);
      loadStatusAndLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Attendance"
        title="Check-In Workspace"
        description="Clock in at the start of your shift, choose work location, and monitor your hours."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Clock In / Out Panel */}
        <section className="erp-panel flex flex-col justify-between rounded-xl p-6">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Shift Tracker</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {clockedIn ? "Session active" : "Not clocked in"}
            </p>
          </div>

          <div className="my-8 flex flex-col items-center justify-center">
            <div className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 shadow-panel transition ${
              clockedIn 
                ? "border-primary bg-primary/5 text-primary animate-pulse" 
                : "border-slate-200 bg-slate-50/50 text-slate-400 dark:border-slate-800"
            }`}>
              <FiClock className="h-8 w-8" />
              <span className="mt-2 text-2xl font-black">{timerText}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold">Logged Hours</span>
            </div>
            {clockedIn && activeRecord && (
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Clocked in since {activeRecord.check_in} ({activeRecord.status})
              </p>
            )}
          </div>

          <div className="space-y-4">
            {!clockedIn && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Work Location</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("present")}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      status === "present"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <FiMapPin className="h-4 w-4" />
                    Office
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("remote")}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      status === "remote"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <FiWifi className="h-4 w-4" />
                    Remote
                  </button>
                </div>
              </div>
            )}

            {clockedIn ? (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="erp-focus flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-danger px-5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-600 disabled:opacity-50"
              >
                <FiLogOut className="h-4 w-4" />
                Clock Out Session
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="erp-focus flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                <FiLogIn className="h-4 w-4" />
                Clock In Shift
              </button>
            )}
          </div>
        </section>

        {/* Attendance Logs */}
        <section className="erp-panel overflow-hidden rounded-xl">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/20">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">This Month's Logs</h3>
          </div>
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <p className="text-sm text-slate-400">Loading your logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-450 dark:border-slate-800">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Clock In</th>
                    <th className="px-6 py-3">Clock Out</th>
                    <th className="px-6 py-3">Hours Worked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                        No check-in logs recorded this month.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {log.date}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            log.status === "present"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              : "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                          }`}>
                            {log.status === "present" ? "Present" : "Remote"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {log.check_in}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {log.check_out || <span className="italic text-slate-400">Active</span>}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {log.hours_worked !== null ? `${log.hours_worked}h` : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
