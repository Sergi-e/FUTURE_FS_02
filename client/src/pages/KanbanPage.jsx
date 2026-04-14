import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import LeadCard from "../components/LeadCard.jsx";
import Page from "../components/Page.jsx";

const COLUMNS = [
  {
    status: "new",
    title: "New",
    headerClass:
      "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-violet-500/20",
    ringClass: "ring-violet-400/60 dark:ring-violet-400/50",
  },
  {
    status: "contacted",
    title: "Contacted",
    headerClass:
      "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20",
    ringClass: "ring-blue-400/60 dark:ring-blue-400/50",
  },
  {
    status: "qualified",
    title: "Qualified",
    headerClass:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25",
    ringClass: "ring-amber-400/60 dark:ring-amber-400/50",
  },
  {
    status: "converted",
    title: "Converted",
    headerClass:
      "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-500/20",
    ringClass: "ring-emerald-400/60 dark:ring-emerald-400/50",
  },
  {
    status: "lost",
    title: "Lost",
    headerClass:
      "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-500/25",
    ringClass: "ring-red-400/60 dark:ring-red-400/50",
  },
];

const STATUSES = COLUMNS.map((c) => c.status);

const dropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.45" },
    },
  }),
};

function resolveDropStatus(overId, leads) {
  if (!overId) return null;
  const id = String(overId);
  if (STATUSES.includes(id)) return id;
  const hit = leads.find((l) => String(l._id) === id);
  return hit ? hit.status : null;
}

function DraggableLead({ lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(lead._id),
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
  };

  return (
    <LeadCard
      lead={lead}
      asLink={false}
      dragRef={setNodeRef}
      dragAttributes={attributes}
      dragListeners={listeners}
      isDragging={isDragging}
      style={style}
      footer={
        <Link
          to={`/leads/${lead._id}`}
          className="text-xs font-medium text-brand-cyan hover:underline dark:text-cyan-300"
          onClick={(e) => e.stopPropagation()}
        >
          Open detail →
        </Link>
      }
    />
  );
}

function KanbanColumn({ status, title, headerClass, ringClass, leads, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[min(70vh,520px)] min-w-[260px] flex-1 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white/30 shadow-lg backdrop-blur-md transition dark:border-[#2E4A5A] dark:bg-[#243B47] lg:min-w-0 lg:shrink ${
        isOver ? `ring-2 ring-offset-2 ring-offset-transparent dark:ring-offset-[#1A2F3A] ${ringClass}` : ""
      }`}
    >
      <div
        className={`flex items-center justify-between gap-2 rounded-t-lg px-3 py-2.5 ${headerClass}`}
      >
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold tabular-nums backdrop-blur-sm">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 pr-1">{children}</div>
    </div>
  );
}

function KanbanEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/90 bg-gradient-to-b from-white/50 to-slate-100/40 py-20 text-center dark:border-[#2E4A5A] dark:from-white/5 dark:to-transparent">
      <div
        className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-cyan/20 text-4xl"
        aria-hidden
      >
        🗂️
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-[#E0F7FA]">
        No leads on the board yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-[#E0F7FA]/55">
        Create your first lead with{" "}
        <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-[#2E4A5A] dark:bg-[#243B47]">
          Ctrl+K
        </kbd>{" "}
        or the Add lead button — then drag cards between columns as your pipeline moves.
      </p>
    </div>
  );
}

export default function KanbanPage() {
  const socket = useSocket();
  const [leads, setLeads] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const loadLeads = useCallback(async () => {
    try {
      const { data } = await api.get("/leads");
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Could not load board");
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const onRefresh = () => loadLeads();
    window.addEventListener("leadrift:leads-changed", onRefresh);
    return () => window.removeEventListener("leadrift:leads-changed", onRefresh);
  }, [loadLeads]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadLeads();
    socket.on("lead:created", refresh);
    socket.on("lead:updated", refresh);
    socket.on("lead:deleted", refresh);
    return () => {
      socket.off("lead:created", refresh);
      socket.off("lead:updated", refresh);
      socket.off("lead:deleted", refresh);
    };
  }, [socket, loadLeads]);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map((s) => [s, []]));
    for (const lead of leads) {
      const s = lead.status && map[lead.status] ? lead.status : "new";
      map[s].push(lead);
    }
    return map;
  }, [leads]);

  const activeLead = activeId ? leads.find((l) => String(l._id) === String(activeId)) : null;

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = String(active.id);
    const newStatus = resolveDropStatus(over.id, leads);
    if (!newStatus) return;

    const lead = leads.find((l) => String(l._id) === leadId);
    if (!lead || lead.status === newStatus) return;

    const prev = leads;
    setLeads((list) =>
      list.map((l) => (String(l._id) === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const { data } = await api.patch(`/leads/${leadId}`, { status: newStatus });
      setLeads((list) => list.map((l) => (String(l._id) === leadId ? data : l)));
      toast.success("Lead moved");
    } catch {
      toast.error("Could not update status");
      setLeads(prev);
    }
  }

  return (
    <Page className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E0F7FA]">Pipeline</h1>
        <p className="text-sm text-slate-500 dark:text-[#E0F7FA]/50">
          Drag cards between stages to update a lead&apos;s status. Changes save automatically to your workspace.
        </p>
      </div>

      {leads.length === 0 ? (
        <KanbanEmptyState />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragCancel={() => setActiveId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="-mx-4 flex flex-col gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-row lg:items-start lg:overflow-visible lg:px-0">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                headerClass={col.headerClass}
                ringClass={col.ringClass}
                leads={byStatus[col.status] || []}
              >
                {(byStatus[col.status] || []).map((lead) => (
                  <DraggableLead key={lead._id} lead={lead} />
                ))}
              </KanbanColumn>
            ))}
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeLead ? (
              <div className="w-[min(100vw-2rem,280px)] rotate-1 cursor-grabbing opacity-[0.97]">
                <LeadCard lead={activeLead} asLink={false} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </Page>
  );
}
