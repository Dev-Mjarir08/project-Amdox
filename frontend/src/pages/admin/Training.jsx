import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiBookOpen, FiPlus, FiUser, FiCalendar, FiCheck } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import api from "../../lib/api.js";
import useAuthStore from "../../stores/useAuthStore.js";

export default function Training() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const currentUser = useAuthStore((state) => state.user);
  const isHRorAdmin = currentUser?.role === "hr" || currentUser?.role === "admin";

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    startDate: "",
    endDate: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/training");
      if (res.data) setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/training", form);
      setForm({ title: "", description: "", instructor: "", startDate: "", endDate: "" });
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error("Failed to create course: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (courseId) => {
    try {
      await api.post(`/training/${courseId}/join`);
      toast.success("Successfully enrolled in this session.");
      fetchCourses();
    } catch (err) {
      toast.error("Failed to enroll: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="L&D"
        title="Training & Certifications"
        description="Schedule corporate courses, verify professional accreditations, and log employee skill training."
        actions={
          isHRorAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" /> Create Session
            </button>
          )
        }
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading training logs...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const hasJoined = course.attendees?.some((a) => a._id === currentUser?.id);
            return (
              <div key={course._id} className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      course.status === "completed"
                        ? "bg-slate-100 text-slate-700"
                        : course.status === "ongoing"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <FiUser className="h-4 w-4" />
                      <span>Instructor: {course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="h-4 w-4" />
                      <span>{course.startDate} to {course.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-850">
                  <span className="text-xs font-medium text-slate-500">
                    {course.attendees?.length || 0} Registered
                  </span>
                  {hasJoined ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <FiCheck /> Enrolled
                    </span>
                  ) : (
                    course.status !== "completed" && (
                      <button
                        onClick={() => handleJoin(course._id)}
                        className="rounded bg-primary px-3 py-1 text-xs font-bold text-white transition hover:bg-blue-700"
                      >
                        Join Course
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Create Training Program</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Course Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <textarea
                placeholder="Course Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Instructor Name"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
