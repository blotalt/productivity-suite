"use client";

import React, { useState, useEffect } from "react";
import { api, Issue, Sprint, Subtask } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
  Trash2,
  X,
  Target,
  ArrowRight,
} from "lucide-react";

const COLUMNS: { id: Issue["status"]; label: string; color: string }[] = [
  { id: "BACKLOG", label: "Backlog", color: "bg-slate-500" },
  { id: "TODO", label: "To Do", color: "bg-blue-500" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-amber-500" },
  { id: "IN_REVIEW", label: "In Review", color: "bg-purple-500" },
  { id: "DONE", label: "Done", color: "bg-emerald-500" },
];

export default function KanbanBoard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprintId, setActiveSprintId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [swimlaneBy, setSwimlaneBy] = useState<"NONE" | "PRIORITY" | "ASSIGNEE" | "SWIMLANE">("SWIMLANE");
  const [loading, setLoading] = useState(true);
  const [draggedIssueId, setDraggedIssueId] = useState<number | null>(null);
  const [expandedIssueIds, setExpandedIssueIds] = useState<Set<number>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState<Issue["status"]>("TODO");
  const [newPriority, setNewPriority] = useState<Issue["priority"]>("MEDIUM");
  const [newType, setNewType] = useState<Issue["type"]>("STORY");
  const [newAssignee, setNewAssignee] = useState("Alex Vance");
  const [newSwimlane, setNewSwimlane] = useState("Frontend UX");
  const [newPoints, setNewPoints] = useState(3);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedIssues, fetchedSprints] = await Promise.all([
        api.getIssues(),
        api.getSprints(),
      ]);
      setIssues(fetchedIssues);
      setSprints(fetchedSprints);
      const active = fetchedSprints.find((s) => s.status === "ACTIVE");
      if (active && active.id) {
        setActiveSprintId(active.id);
      }
    } catch (err) {
      console.error("Failed to load kanban data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedIssueId(id);
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Issue["status"]) => {
    e.preventDefault();
    const id = draggedIssueId;
    if (!id) return;

    const issueToUpdate = issues.find((i) => i.id === id);
    if (!issueToUpdate || issueToUpdate.status === targetStatus) {
      setDraggedIssueId(null);
      return;
    }

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: targetStatus } : i))
    );
    setDraggedIssueId(null);

    try {
      await api.updateIssue(id, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update status on drop:", err);
      loadData();
    }
  };

  const toggleSubtask = async (issueId: number, subtaskId: number, currentCompleted: boolean) => {
    // Optimistic
    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === issueId && i.subtasks) {
          return {
            ...i,
            subtasks: i.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !currentCompleted } : st
            ),
          };
        }
        return i;
      })
    );

    try {
      await api.toggleSubtask(subtaskId, !currentCompleted);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
      loadData();
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIssueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createIssue({
        title: newTitle,
        description: newDesc,
        status: newStatus,
        priority: newPriority,
        type: newType,
        assignee: newAssignee,
        swimlaneKey: newSwimlane,
        storyPoints: newPoints,
        sprintId: activeSprintId,
      });

      if (created.id && newSubtasks.length > 0) {
        for (const st of newSubtasks) {
          await api.addSubtask(created.id, { title: st, completed: false });
        }
      }

      setIsModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewSubtasks([]);
      loadData();
    } catch (err) {
      console.error("Failed to create issue:", err);
    }
  };

  const handleDeleteIssue = async (id: number) => {
    if (!confirm("Delete this issue?")) return;
    setIssues((prev) => prev.filter((i) => i.id !== id));
    try {
      await api.deleteIssue(id);
    } catch (err) {
      console.error("Failed to delete issue:", err);
      loadData();
    }
  };

  // Filter issues
  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(search.toLowerCase())) ||
      (i.assignee && i.assignee.toLowerCase().includes(search.toLowerCase()));

    const matchesPriority = filterPriority === "ALL" || i.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Swimlanes grouping
  const getSwimlaneKeys = (): string[] => {
    if (swimlaneBy === "NONE") return ["All Tasks"];
    if (swimlaneBy === "PRIORITY") return ["URGENT", "HIGH", "MEDIUM", "LOW"];
    if (swimlaneBy === "ASSIGNEE") {
      const assignees = Array.from(new Set(filteredIssues.map((i) => i.assignee || "Unassigned")));
      return assignees.length > 0 ? assignees : ["Unassigned"];
    }
    // Default: SWIMLANE / Track
    const lanes = Array.from(new Set(filteredIssues.map((i) => i.swimlaneKey || "General")));
    return lanes.length > 0 ? lanes : ["General"];
  };

  const activeSprint = sprints.find((s) => s.id === activeSprintId);
  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = issues
    .filter((i) => i.status === "DONE")
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  const getPriorityBadge = (priority: Issue["priority"]) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-red-950/70 text-red-400 border border-red-800/60 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Urgent</span>;
      case "HIGH":
        return <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-orange-950/70 text-orange-400 border border-orange-800/60">High</span>;
      case "MEDIUM":
        return <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-amber-950/70 text-amber-400 border border-amber-800/60">Med</span>;
      case "LOW":
        return <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">Low</span>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sprint Info Banner & Controls */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-slate-100 text-lg">
                {activeSprint ? activeSprint.name : "All Sprints"}
              </h2>
              {activeSprint && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40">
                  {activeSprint.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {activeSprint?.goal || "Manage workflows with multi-column swimlanes & subtasks"}
            </p>
          </div>
        </div>

        {/* Sprint points stats */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="bg-slate-800/70 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Velocity: </span>
            <span className="font-bold text-indigo-400">{donePoints}</span>
            <span className="text-slate-500"> / {totalPoints} pts</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Filter and Swimlane Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues, assignees, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Priority filter */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Priority:
            </span>
            {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-1 rounded transition text-xs font-medium ${
                  filterPriority === p
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Swimlanes selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Swimlanes:
            </span>
            {(["SWIMLANE", "PRIORITY", "ASSIGNEE", "NONE"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSwimlaneBy(mode)}
                className={`px-2 py-1 rounded transition text-xs font-medium ${
                  swimlaneBy === mode
                    ? "bg-slate-800 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode === "SWIMLANE" ? "Tracks" : mode === "NONE" ? "Flat" : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Loading board data from Spring Boot backend...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {getSwimlaneKeys().map((laneKey) => {
            const laneIssues = filteredIssues.filter((i) => {
              if (swimlaneBy === "NONE") return true;
              if (swimlaneBy === "PRIORITY") return i.priority === laneKey;
              if (swimlaneBy === "ASSIGNEE") return (i.assignee || "Unassigned") === laneKey;
              return (i.swimlaneKey || "General") === laneKey;
            });

            return (
              <div key={laneKey} className="space-y-3">
                {swimlaneBy !== "NONE" && (
                  <div className="flex items-center space-x-2 pb-1 border-b border-slate-800/80">
                    <span className="font-semibold text-slate-300 text-xs tracking-wider uppercase">
                      {laneKey}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">
                      {laneIssues.length}
                    </span>
                  </div>
                )}

                {/* Columns grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {COLUMNS.map((col) => {
                    const colIssues = laneIssues.filter((i) => i.status === col.id);

                    return (
                      <div
                        key={col.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                        className={`flex flex-col bg-slate-900/40 border border-slate-800/60 rounded-xl p-2.5 min-h-[160px] transition ${
                          draggedIssueId ? "hover:border-indigo-500/50 hover:bg-slate-900/80" : ""
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${col.color}`} />
                            <span className="text-xs font-semibold text-slate-300">{col.label}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {colIssues.length}
                          </span>
                        </div>

                        {/* Cards List */}
                        <div className="space-y-2.5 flex-1">
                          {colIssues.map((issue) => {
                            const isExpanded = issue.id ? expandedIssueIds.has(issue.id) : false;
                            const subtasks = issue.subtasks || [];
                            const completedSubtasks = subtasks.filter((st) => st.completed).length;

                            return (
                              <div
                                key={issue.id}
                                draggable
                                onDragStart={(e) => issue.id && handleDragStart(e, issue.id)}
                                className="group relative bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 shadow-md hover:shadow-indigo-950/20 transition cursor-grab active:cursor-grabbing space-y-2"
                              >
                                {/* Top row: Type, Points, Delete */}
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                                      {issue.type}
                                    </span>
                                    {issue.storyPoints && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                                        {issue.storyPoints} pts
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    {getPriorityBadge(issue.priority)}
                                    <button
                                      onClick={() => issue.id && handleDeleteIssue(issue.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Title */}
                                <h4 className="text-xs font-medium text-slate-200 leading-snug group-hover:text-indigo-300 transition">
                                  {issue.title}
                                </h4>

                                {issue.description && (
                                  <p className="text-[11px] text-slate-400 line-clamp-2">
                                    {issue.description}
                                  </p>
                                )}

                                {/* Subtasks Progress Checklist Milestone */}
                                {subtasks.length > 0 && (
                                  <div className="pt-1 border-t border-slate-800/60">
                                    <button
                                      onClick={() => issue.id && toggleExpand(issue.id)}
                                      className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition"
                                    >
                                      <div className="flex items-center space-x-1">
                                        {isExpanded ? (
                                          <ChevronDown className="w-3 h-3 text-slate-500" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-slate-500" />
                                        )}
                                        <span>Subtasks</span>
                                      </div>
                                      <span className="font-mono text-[10px] text-slate-500">
                                        {completedSubtasks}/{subtasks.length}
                                      </span>
                                    </button>

                                    {/* Progress bar */}
                                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                                      <div
                                        className="bg-emerald-500 h-full transition-all"
                                        style={{
                                          width: `${(completedSubtasks / subtasks.length) * 100}%`,
                                        }}
                                      />
                                    </div>

                                    {/* Expanded subtask list */}
                                    {isExpanded && (
                                      <div className="mt-2 space-y-1.5 pl-1">
                                        {subtasks.map((st) => (
                                          <div
                                            key={st.id}
                                            onClick={() =>
                                              issue.id && st.id && toggleSubtask(issue.id, st.id, st.completed)
                                            }
                                            className="flex items-center space-x-2 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none"
                                          >
                                            {st.completed ? (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            ) : (
                                              <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0 hover:text-slate-400" />
                                            )}
                                            <span
                                              className={st.completed ? "line-through text-slate-500" : ""}
                                            >
                                              {st.title}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Card Footer: Assignee & Due Date */}
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-[9px]">
                                      {issue.assignee ? issue.assignee.charAt(0) : "U"}
                                    </div>
                                    <span className="truncate max-w-[80px]">{issue.assignee}</span>
                                  </div>

                                  {issue.dueDate && (
                                    <span className="flex items-center space-x-1 text-slate-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{issue.dueDate}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Issue */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Create New Issue
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement webhook handlers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Provide context and requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Issue["status"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Issue["priority"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Issue["type"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="STORY">Story</option>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="EPIC">Epic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Swimlane Track</label>
                  <input
                    type="text"
                    value={newSwimlane}
                    onChange={(e) => setNewSwimlane(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assignee</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              {/* Subtasks input */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Subtask Milestones</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a checklist item..."
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtaskInput.trim()) {
                        setNewSubtasks((prev) => [...prev, newSubtaskInput.trim()]);
                        setNewSubtaskInput("");
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {newSubtasks.length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {newSubtasks.map((st, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-950 p-1.5 rounded text-slate-300">
                        <span>• {st}</span>
                        <button
                          type="button"
                          onClick={() => setNewSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
