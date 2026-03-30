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
} from "@dnd-kit/core";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import LeadCard from "../components/LeadCard.jsx";

const COLUMNS = [
  { status: "new", title: "New" },
  { status: "contacted", title: "Contacted" },
  { status: "qualified", title: "Qualified" },
  { status: "converted", title: "Converted" },
  { status: "lost", title: "Lost" },
];

const STATUSES = COLUMNS.map((c) => c.status);

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
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

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

function KanbanColumn({ status, title, leads, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[min(70vh,520px)] flex-1 flex-col rounded-xl border border-slate-200/70 bg-white/30 p-3 shadow-lg backdrop-blur-md transition dark:border-white/15 dark:bg-white/5 ${
        isOver ? "ring-2 ring-brand-violet/50 dark:ring-brand-violet/40" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-white/70">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">{children}</div>
    </div>
  );
}

export default function KanbanPage() {
  const socket = useSocket();
  const [leads, setLeads] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Kanban</h1>
        <p className="text-sm text-slate-500 dark:text-white/50">
          Drag cards across columns — each drop calls <code className="text-brand-cyan">PATCH /api/leads/:id</code>.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              leads={byStatus[col.status] || []}
            >
              {(byStatus[col.status] || []).map((lead) => (
                <DraggableLead key={lead._id} lead={lead} />
              ))}
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="opacity-95">
              <LeadCard lead={activeLead} asLink={false} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
