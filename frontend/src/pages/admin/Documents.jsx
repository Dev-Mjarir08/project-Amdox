import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiFile, FiUpload, FiDownload, FiTrash2, FiSearch } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Contract");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/documents");
      if (res.data) setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      if (file) {
        formData.append("file", file);
      }

      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTitle("");
      setFile(null);
      setIsModalOpen(false);
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to upload: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteDocument = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/documents/${deleteConfirmId}`);
      toast.success("Document deleted successfully!");
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to delete document: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Document Management & Contracts"
        description="Access company policies, employee contract details, certifications, and manage document logs."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <FiUpload className="h-4 w-4" /> Upload Document
          </button>
        }
      />

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by document title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading document vault...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No documents found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <div key={doc._id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 flex items-center justify-between hover:shadow-soft transition">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/20">
                    <FiFile className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h4>
                    <p className="text-xs text-slate-500">{doc.category} | Version: {doc.version}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Uploaded by: {doc.uploadedBy?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.fileUrl.startsWith("/") ? `http://localhost:5000${doc.fileUrl}` : doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded p-1.5 text-primary hover:bg-blue-50"
                  >
                    <FiDownload className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Upload New Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Contract">Contract</option>
                <option value="Identity">Identity Document</option>
                <option value="Certificate">Certificate</option>
                <option value="Policy">Policy / Handbook</option>
                <option value="Other">Other</option>
              </select>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Choose file</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteDocument}
        loading={deleting}
        title="Delete Document"
        message="Are you sure you want to delete this document from the library? This action cannot be undone."
      />
    </div>
  );
}
