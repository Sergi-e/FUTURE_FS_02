import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import Page from "../components/Page.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("new");
  const [followUp, setFollowUp] = useState("");
  const [noteText, setNoteText] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const loadLead = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/leads/${id}`);
      setLead(data);
      setStatus(data.status || "new");
      setFollowUp(toLocalInputValue(data.followUpDate));
    } catch {
      toast.error("Lead not found");
      navigate("/kanban", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  useEffect(() => {
    if (!socket || !id) return;
    const onUpdated = (payload) => {
      if (payload && String(payload._id) === String(id)) {
        setLead(payload);
        setStatus(payload.status || "new");
        setFollowUp(toLocalInputValue(payload.followUpDate));
      }
    };
    const onDeleted = (payload) => {
      if (payload && String(payload._id) === String(id)) {
        toast("This lead was removed");
        navigate("/kanban", { replace: true });
      }
    };
    socket.on("lead:updated", onUpdated);
    socket.on("lead:deleted", onDeleted);
    return () => {
      socket.off("lead:updated", onUpdated);
      socket.off("lead:deleted", onDeleted);
    };
  }, [socket, id, navigate]);

  async function saveDetails(e) {
    e.preventDefault();
    setSavingMeta(true);
    try {
      const body = {
        status,
        followUpDate: followUp ? new Date(followUp).toISOString() : null,
      };
      const { data } = await api.patch(`/leads/${id}`, body);
      setLead(data);
      toast.success("Lead updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingMeta(false);
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Write something first");
      return;
    }
    setSavingNote(true);
    try {
      const { data } = await api.post(`/leads/${id}/notes`, { text: noteText.trim() });
      setLead(data);
      setNoteText("");
      toast.success("Note added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add note");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success("Lead deleted");
      navigate("/kanban", { replace: true });
    } catch {
      toast.error("Delete failed");
    }
  }

  if (loading || !lead) {
    return (
      <Page>
        <p className="text-sm text-slate-500 dark:text-white/50">Loading lead…</p>
      </Page>
    );
  }

  const score = lead.score || "cold";

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/kanban"
            className="text-xs font-medium text-brand-cyan hover:underline dark:text-cyan-300"
          >
            ← Back to board
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {lead.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/50">{lead.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScoreBadge score={score} className="!px-3 !py-1 !text-[11px]" />
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-400/50 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={saveDetails}
          className="glass-card space-y-4 p-5 lg:col-span-1"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Details</h2>
          <label className="block text-xs font-medium text-slate-600 dark:text-white/55">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/70 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-600 dark:text-white/55">
            Follow-up
            <input
              type="datetime-local"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/70 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5 dark:text-white"
            />
          </label>
          <div className="text-xs text-slate-500 dark:text-white/45">
            <p>Phone: {lead.phone || "—"}</p>
            <p>Company: {lead.company || "—"}</p>
            <p>Source: {lead.source || "—"}</p>
          </div>
          <button
            type="submit"
            disabled={savingMeta}
            className="w-full rounded-lg bg-brand-violet py-2 text-sm font-medium text-white shadow-neon disabled:opacity-60"
          >
            {savingMeta ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="glass-card space-y-4 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notes</h2>
          <form onSubmit={addNote} className="flex flex-col gap-2 sm:flex-row">
            <input
              className="flex-1 rounded-lg border border-slate-300/80 bg-white/70 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5 dark:text-white"
              placeholder="Add a note…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button
              type="submit"
              disabled={savingNote}
              className="rounded-lg bg-brand-cyan px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-60 dark:text-slate-900"
            >
              {savingNote ? "Adding…" : "Add note"}
            </button>
          </form>
          <ul className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {(lead.notes || []).length === 0 ? (
              <li className="text-sm text-slate-500 dark:text-white/45">No notes yet.</li>
            ) : (
              [...(lead.notes || [])]
                .slice()
                .reverse()
                .map((n) => (
                  <li
                    key={n._id || `${n.text}-${n.createdAt}`}
                    className="rounded-lg border border-slate-200/70 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-slate-800 dark:text-white/90">{n.text}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-white/40">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      {n.author?.name ? ` · ${n.author.name}` : ""}
                    </p>
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>
    </Page>
  );
}
