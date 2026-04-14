import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/api.js";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "website",
  status: "new",
};

export default function AddLeadModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(defaultForm);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/leads", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        source: form.source.trim() || "website",
        status: form.status,
      });
      toast.success("Lead created");
      onCreated?.(data);
      window.dispatchEvent(new Event("leadrift:leads-changed"));
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Could not create lead";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close modal"
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-lead-title"
              className="pointer-events-auto w-full max-w-[420px] max-h-[min(90vh,100dvh)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-[#2E4A5A] dark:bg-[#1A2F3A]/95"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <h2 id="add-lead-title" className="text-lg font-semibold text-slate-900 dark:text-[#E0F7FA]">
                New lead
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#E0F7FA]/50">
                Add contact details and pipeline stage. Required fields match what your team saves to the
                workspace.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/60">
                  Full Name
                  <input
                    required
                    placeholder="e.g. Jane Doe"
                    className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none ring-brand-cyan/0 transition focus:ring-2 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/60">
                  Email Address
                  <input
                    required
                    type="email"
                    placeholder="jane@example.com"
                    className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-cyan/60 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/60">
                  Phone Number
                  <input
                    placeholder="(555) 123-4567"
                    className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-cyan/60 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/60">
                  Company Name
                  <input
                    placeholder="e.g. Acme Corp"
                    className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-cyan/60 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/60">
                  Lead Source
                  <input
                    placeholder="e.g. Website, Referral, Cold Call"
                    className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-cyan/60 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                    value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/60">
                  Pipeline Stage (Initial Status)
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-cyan/60 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA]"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-[#E0F7FA]/70 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-brand-cyan px-4 py-2 text-sm font-medium text-white shadow-neon disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Create lead"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
