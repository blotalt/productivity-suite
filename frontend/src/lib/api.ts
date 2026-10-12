// API Client for Spring Boot Backend
const API_BASE = "http://localhost:8080/api";

export interface Sprint {
  id?: number;
  name: string;
  goal: string;
  startDate?: string;
  endDate?: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
}

export interface Subtask {
  id?: number;
  title: string;
  completed: boolean;
  position?: number;
}

export interface Issue {
  id?: number;
  title: string;
  description?: string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  type: "STORY" | "BUG" | "TASK" | "EPIC";
  storyPoints?: number;
  assignee?: string;
  reporter?: string;
  sprintId?: number | null;
  swimlaneKey?: string;
  position?: number;
  dueDate?: string;
  startDate?: string;
  subtasks?: Subtask[];
}

export interface DocumentBlock {
  id?: number;
  type: "paragraph" | "h1" | "h2" | "h3" | "bullet" | "number" | "todo" | "code" | "quote" | "callout" | "divider";
  content: string;
  properties?: string | null;
  position?: number;
}

export interface Document {
  id?: number;
  title: string;
  icon?: string;
  coverUrl?: string;
  parentId?: number | null;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
  blocks?: DocumentBlock[];
}

export interface CanvasNode {
  id?: number;
  nodeUid: string;
  type: "sticky" | "card" | "rectangle" | "circle" | "text" | "mindmap";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  fontSize?: number;
  data?: string;
}

export interface CanvasEdge {
  id?: number;
  edgeUid: string;
  fromNodeUid: string;
  toNodeUid: string;
  fromAnchor: "top" | "right" | "bottom" | "left";
  toAnchor: "top" | "right" | "bottom" | "left";
  label?: string;
  style: "curved" | "straight" | "step";
  color?: string;
}

export interface WhiteboardData {
  whiteboard: {
    id: number;
    title: string;
    zoomLevel: number;
    panX: number;
    panY: number;
  };
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export interface TimelineMilestone {
  id?: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CRITICAL" | "BLOCKED";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  assignee?: string;
  color?: string;
  alarmDaysBefore?: number;
  alarmActive?: boolean;
  issueId?: number;
}

export interface TimelineDependency {
  id?: number;
  predecessorId: number;
  successorId: number;
  type: "FINISH_TO_START" | "START_TO_START" | "FINISH_TO_FINISH";
  lagDays?: number;
}

export interface DeadlineAlarm {
  milestoneId: number;
  title: string;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  severity: "CRITICAL" | "HIGH" | "WARNING";
  assignee?: string;
}

export interface PomodoroSession {
  id?: number;
  taskTitle: string;
  durationMinutes: number;
  type: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  completedAt?: string;
  soundscapeUsed?: string;
  notes?: string;
  rating?: number;
}

export interface PomodoroStats {
  totalFocusMinutes: number;
  todayFocusMinutes: number;
  completedSessions: number;
  currentStreak: number;
  soundscapeUsage: Record<string, number>;
  targetMinutesToday: number;
}

// Request helper
async function req<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

// Kanban & Sprints
export const api = {
  getSprints: () => req<Sprint[]>("/sprints"),
  createSprint: (sprint: Sprint) => req<Sprint>("/sprints", { method: "POST", body: JSON.stringify(sprint) }),
  getIssues: () => req<Issue[]>("/issues"),
  createIssue: (issue: Issue) => req<Issue>("/issues", { method: "POST", body: JSON.stringify(issue) }),
  updateIssue: (id: number, issue: Partial<Issue>) => req<Issue>(`/issues/${id}`, { method: "PUT", body: JSON.stringify(issue) }),
  deleteIssue: (id: number) => req<void>(`/issues/${id}`, { method: "DELETE" }),
  batchUpdateIssues: (issues: Issue[]) => req<Issue[]>("/issues/batch-update", { method: "POST", body: JSON.stringify(issues) }),
  addSubtask: (issueId: number, subtask: Partial<Subtask>) => req<Subtask>(`/issues/${issueId}/subtasks`, { method: "POST", body: JSON.stringify(subtask) }),
  toggleSubtask: (subtaskId: number, completed: boolean) => req<Subtask>(`/subtasks/${subtaskId}`, { method: "PATCH", body: JSON.stringify({ completed }) }),
  deleteSubtask: (subtaskId: number) => req<void>(`/subtasks/${subtaskId}`, { method: "DELETE" }),

  // Documents (Notion)
  getDocuments: () => req<Document[]>("/documents"),
  getDocument: (id: number) => req<Document>(`/documents/${id}`),
  createDocument: (doc: Partial<Document>) => req<Document>("/documents", { method: "POST", body: JSON.stringify(doc) }),
  updateDocument: (id: number, doc: Partial<Document>) => req<Document>(`/documents/${id}`, { method: "PUT", body: JSON.stringify(doc) }),
  deleteDocument: (id: number) => req<void>(`/documents/${id}`, { method: "DELETE" }),
  syncBlocks: (docId: number, blocks: DocumentBlock[]) => req<DocumentBlock[]>(`/documents/${docId}/blocks/sync`, { method: "PUT", body: JSON.stringify(blocks) }),

  // Whiteboard
  getWhiteboard: (id = 1) => req<WhiteboardData>(`/whiteboards/${id}`),
  syncWhiteboard: (id: number, data: { nodes: CanvasNode[]; edges: CanvasEdge[]; zoomLevel?: number; panX?: number; panY?: number }) =>
    req<WhiteboardData>(`/whiteboards/${id}/sync`, { method: "POST", body: JSON.stringify(data) }),

  // Gantt Timeline
  getMilestones: () => req<TimelineMilestone[]>("/timeline/milestones"),
  createMilestone: (m: Partial<TimelineMilestone>) => req<TimelineMilestone>("/timeline/milestones", { method: "POST", body: JSON.stringify(m) }),
  updateMilestone: (id: number, m: Partial<TimelineMilestone>) => req<TimelineMilestone>(`/timeline/milestones/${id}`, { method: "PUT", body: JSON.stringify(m) }),
  deleteMilestone: (id: number) => req<void>(`/timeline/milestones/${id}`, { method: "DELETE" }),
  getDependencies: () => req<TimelineDependency[]>("/timeline/dependencies"),
  createDependency: (dep: Partial<TimelineDependency>) => req<TimelineDependency>("/timeline/dependencies", { method: "POST", body: JSON.stringify(dep) }),
  deleteDependency: (id: number) => req<void>(`/timeline/dependencies/${id}`, { method: "DELETE" }),
  getAlarms: () => req<DeadlineAlarm[]>("/timeline/alarms"),

  // Pomodoro
  getPomodoroSessions: () => req<PomodoroSession[]>("/pomodoro/sessions"),
  logPomodoroSession: (session: Partial<PomodoroSession>) => req<PomodoroSession>("/pomodoro/sessions", { method: "POST", body: JSON.stringify(session) }),
  getPomodoroStats: () => req<PomodoroStats>("/pomodoro/stats"),
};
