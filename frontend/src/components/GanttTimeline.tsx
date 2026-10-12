"use client";

import React, { useState, useEffect } from "react";
import {
  api,
  TimelineMilestone,
  TimelineDependency,
  DeadlineAlarm,
} from "@/lib/api";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Link2,
  ChevronRight,
  Filter,
  CheckCircle2,
  User,
  ArrowRight,
  X,
} from "lucide-react";

export default function GanttTimeline() {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [dependencies, setDependencies] = useState<TimelineDependency[]>([]);
  const [alarms, setAlarms] = useState<DeadlineAlarm[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Milestone Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [newProgress, setNewProgress] = useState(0);
  const [newStatus, setNewStatus] = useState<TimelineMilestone["status"]>("PLANNED");
  const [newPriority, setNewPriority] = useState<TimelineMilestone["priority"]>("HIGH");
  const [newAssignee, setNewAssignee] = useState("Alex Vance");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [newAlarmDays, setNewAlarmDays] = useState(3);

  // Dependency Modal
  const [isDepModalOpen, setIsDepModalOpen] = useState(false);
  const [predId, setPredId] = useState<number | null>(null);
  const [succId, setSuccId] = useState<number | null>(null);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const [fetchedMilestones, fetchedDeps, fetchedAlarms] = await Promise.all([
        api.getMilestones(),
        api.getDependencies(),
        api.getAlarms(),
      ]);
      setMilestones(fetchedMilestones);
      setDependencies(fetchedDeps);
      setAlarms(fetchedAlarms);
    } catch (err) {
      console.error("Failed to load timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.createMilestone({
        title: newTitle,
        description: newDesc,
        startDate: newStartDate,
        endDate: newEndDate,
        progress: newProgress,
        status: newStatus,
        priority: newPriority,
        assignee: newAssignee,
        color: newColor,
        alarmDaysBefore: newAlarmDays,
        alarmActive: true,
      });
      setIsModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      loadTimelineData();
    } catch (err) {
      console.error("Failed to create milestone:", err);
    }
  };

  const handleCreateDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predId || !succId || predId === succId) return;

    try {
      await api.createDependency({
        predecessorId: predId,
        successorId: succId,
        type: "FINISH_TO_START",
      });
      setIsDepModalOpen(false);
      setPredId(null);
      setSuccId(null);
      loadTimelineData();
    } catch (err) {
      console.error("Failed to create dependency:", err);
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      await api.deleteMilestone(id);
      loadTimelineData();
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  const toggleMilestoneAlarm = async (m: TimelineMilestone) => {
    if (!m.id) return;
    try {
      await api.updateMilestone(m.id, { alarmActive: !m.alarmActive });
      loadTimelineData();
    } catch (err) {
      console.error("Failed to toggle alarm:", err);
    }
  };

  const updateProgress = async (id: number, progress: number) => {
    try {
      await api.updateMilestone(id, {
        progress,
        status: progress === 100 ? "COMPLETED" : "IN_PROGRESS",
      });
      loadTimelineData();
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  // Compute Gantt Scale Range
  const calculateTimelineBounds = () => {
    if (milestones.length === 0) {
      const now = new Date();
      return { minDate: now, maxDate: new Date(now.getTime() + 20 * 86400000), totalDays: 20 };
    }

    const startTimestamps = milestones.map((m) => new Date(m.startDate).getTime());
    const endTimestamps = milestones.map((m) => new Date(m.endDate).getTime());

    const minTime = Math.min(...startTimestamps) - 2 * 86400000;
    const maxTime = Math.max(...endTimestamps) + 4 * 86400000;

    const minDate = new Date(minTime);
    const maxDate = new Date(maxTime);
    const totalDays = Math.max(14, Math.ceil((maxTime - minTime) / 86400000));

    return { minDate, maxDate, totalDays };
  };

  const { minDate, totalDays } = calculateTimelineBounds();

  // Helper to calculate X offset percentage and width percentage
  const getGanttBarCoordinates = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const min = minDate.getTime();

    const startDay = (start - min) / 86400000;
    const durationDays = Math.max(1, (end - start) / 86400000);

    const leftPercent = Math.max(0, (startDay / totalDays) * 100);
    const widthPercent = Math.min(100 - leftPercent, (durationDays / totalDays) * 100);

    return { leftPercent, widthPercent };
  };

  // Generate date labels
  const dateColumns: { label: string; isToday: boolean }[] = [];
  const todayStr = new Date().toISOString().split("T")[0];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(minDate.getTime() + i * 86400000);
    const dateKey = d.toISOString().split("T")[0];
    dateColumns.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isToday: dateKey === todayStr,
    });
  }

  const filteredMilestones = milestones.filter(
    (m) => filterStatus === "ALL" || m.status === filterStatus
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Banner: Deadlines Alarms & Alert Warning */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-slate-100 text-lg">
                Interactive Gantt &amp; Timeline View
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                {alarms.length} Deadline Alarms
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visual project schedules with milestone dependencies and deadline alarms
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsDepModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition border border-slate-700/60"
          >
            <Link2 className="w-4 h-4 text-indigo-400" />
            <span>Link Dependency</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Alarms Feed Banner (if any) */}
      {alarms.length > 0 && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-red-400 flex items-center gap-1.5 shrink-0">
            <Bell className="w-4 h-4 text-red-400 animate-bounce" /> Urgent Deadline Alarms:
          </span>
          <div className="flex flex-wrap gap-2 flex-1">
            {alarms.map((alarm, i) => (
              <div
                key={i}
                className="bg-red-900/50 border border-red-700/50 px-2.5 py-1 rounded-lg text-red-200 flex items-center space-x-2"
              >
                <span className="font-semibold">{alarm.title}</span>
                <span className="text-[10px] bg-red-950 px-1.5 py-0.5 rounded text-red-300 font-mono">
                  {alarm.isOverdue
                    ? "OVERDUE"
                    : `${alarm.daysRemaining} days remaining`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar Filter */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {["ALL", "IN_PROGRESS", "PLANNED", "COMPLETED", "CRITICAL"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                filterStatus === status
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="text-slate-500 text-xs">
          Showing {filteredMilestones.length} milestones • {dependencies.length} active dependencies
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Loading Gantt schedules from Spring Boot backend...
        </div>
      ) : (
        <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          {/* Header row: Left Milestone column + Date Columns */}
          <div className="flex border-b border-slate-800/80 bg-slate-950/80 text-xs font-semibold text-slate-400">
            {/* Left Header */}
            <div className="w-80 p-3 shrink-0 border-r border-slate-800/80">
              Milestone &amp; Owner
            </div>

            {/* Date Columns Header */}
            <div className="flex-1 flex overflow-x-hidden">
              {dateColumns.map((col, idx) => (
                <div
                  key={idx}
                  className={`flex-1 min-w-[40px] text-center py-3 text-[11px] border-r border-slate-800/30 truncate ${
                    col.isToday
                      ? "bg-indigo-950/40 text-indigo-400 font-bold border-indigo-700/50"
                      : "text-slate-500"
                  }`}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* Body Rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredMilestones.map((m) => {
              const { leftPercent, widthPercent } = getGanttBarCoordinates(
                m.startDate,
                m.endDate
              );

              // Find incoming dependencies for this milestone
              const incomingDeps = dependencies.filter((d) => d.successorId === m.id);

              return (
                <div
                  key={m.id}
                  className="flex border-b border-slate-800/40 hover:bg-slate-900/50 transition group"
                >
                  {/* Left Column: Milestone Info */}
                  <div className="w-80 p-3 shrink-0 border-r border-slate-800/80 flex flex-col justify-between space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: m.color || "#3b82f6" }}
                        />
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {m.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Alarm toggle */}
                        <button
                          onClick={() => toggleMilestoneAlarm(m)}
                          className={`p-1 rounded transition ${
                            m.alarmActive
                              ? "text-red-400 hover:text-red-300"
                              : "text-slate-600 hover:text-slate-400"
                          }`}
                          title={m.alarmActive ? "Alarm active" : "Alarm muted"}
                        >
                          {m.alarmActive ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => m.id && handleDeleteMilestone(m.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {m.assignee || "Unassigned"}
                      </span>
                      <span>
                        {m.startDate} → {m.endDate}
                      </span>
                    </div>

                    {/* Dependencies Pill */}
                    {incomingDeps.length > 0 && (
                      <div className="flex items-center space-x-1 text-[9px] text-indigo-400 font-mono">
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span>Depends on #{incomingDeps.map((d) => d.predecessorId).join(", #")}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive Gantt Bar */}
                  <div className="flex-1 relative p-3 flex items-center">
                    {/* Background date guidelines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {dateColumns.map((col, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 border-r border-slate-800/20 ${
                            col.isToday ? "bg-indigo-950/20 border-indigo-900/30" : ""
                          }`}
                        />
                      ))}
                    </div>

                    {/* Timeline Bar */}
                    <div
                      className="absolute h-8 rounded-lg shadow-lg flex items-center justify-between px-2 overflow-hidden transition-all group-hover:h-9"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(4, widthPercent)}%`,
                        backgroundColor: `${m.color || "#3b82f6"}33`,
                        border: `1.5px solid ${m.color || "#3b82f6"}`,
                      }}
                    >
                      {/* Completed Progress Fill */}
                      <div
                        className="absolute inset-y-0 left-0 transition-all opacity-40"
                        style={{
                          width: `${m.progress}%`,
                          backgroundColor: m.color || "#3b82f6",
                        }}
                      />

                      <span className="relative z-10 text-[11px] font-bold text-white truncate drop-shadow">
                        {m.title}
                      </span>

                      {/* Progress Badge & Click to Increment */}
                      <button
                        onClick={() =>
                          m.id && updateProgress(m.id, m.progress >= 100 ? 0 : m.progress + 25)
                        }
                        className="relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white font-bold hover:bg-black/70 transition shrink-0"
                        title="Click to advance progress (+25%)"
                      >
                        {m.progress}%
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: New Milestone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> New Gantt Milestone
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Release Beta v1.0"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TimelineMilestone["priority"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Alarm Days</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={newAlarmDays}
                    onChange={(e) => setNewAlarmDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assignee</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Color Tag</label>
                  <div className="flex space-x-2 pt-1">
                    {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full transition ${
                          newColor === c ? "ring-2 ring-white scale-110" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Milestone Dependency */}
      {isDepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-400" /> Link Milestone Dependency
              </h3>
              <button
                onClick={() => setIsDepModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDependency} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Predecessor (Must finish first)</label>
                <select
                  required
                  value={predId || ""}
                  onChange={(e) => setPredId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                >
                  <option value="">Select predecessor milestone...</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.id} - {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Successor (Depends on predecessor)</label>
                <select
                  required
                  value={succId || ""}
                  onChange={(e) => setSuccId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                >
                  <option value="">Select successor milestone...</option>
                  {milestones
                    .filter((m) => m.id !== predId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        #{m.id} - {m.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDepModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!predId || !succId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Create Dependency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
