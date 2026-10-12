# Zenith Productivity & Project Management Suite (Pillar 1)

A complete **Notion + Jira + Linear replacement** suite built as a modern decoupled stack:
- **Backend**: Java Spring Boot 4 (Java 17/21, Spring Data JPA, H2 file database, REST API)
- **Frontend**: Next.js 15 (React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Audio API)

---

## 🏛️ Architecture Overview

```
productivity-suite/
├── backend/                  # Java Spring Boot 4 Application
│   ├── src/main/java/com/productivity/suite/
│   │   ├── config/           # CORS & DataLoader (Initial Seeds)
│   │   ├── controller/       # REST Controllers
│   │   ├── model/            # JPA Entities
│   │   └── repository/       # Spring Data Repositories
│   ├── src/main/resources/   # application.properties (H2 DB)
│   └── mvnw.cmd              # Maven Wrapper
└── frontend/                 # Next.js 15 App Router Frontend
    ├── src/app/              # Next.js App Shell & Layout
    ├── src/components/       # 5 Pillar Feature Components
    │   ├── KanbanBoard.tsx   # Interactive Kanban & Sprint Boards
    │   ├── NotionEditor.tsx  # Notion-Style Rich-Text Block Editor
    │   ├── PomodoroTracker.tsx# Pomodoro & Web Audio Ambient Soundscapes
    │   ├── WhiteboardCanvas.tsx# Infinite Canvas Whiteboard
    │   └── GanttTimeline.tsx # Interactive Gantt & Timeline View
    ├── src/lib/
    │   ├── api.ts            # Strongly-typed Spring Boot API Client
    │   └── soundscapes.ts    # Web Audio API Ambient Sound Synthesizer
    └── package.json
```

---

## 🚀 Key Feature Breakdown

### 1. Interactive Kanban & Sprint Boards
- **Multi-Column Workflows**: Backlog, To Do, In Progress, In Review, Done.
- **Fluid Drag-and-Drop**: Drag cards between columns with immediate visual feedback and persistent database updates.
- **Swimlanes Grouping**: Filter and group issues by Tracks/Components, Priority, Assignee, or Flat view.
- **Subtasks & Checklist Milestones**: Expandable checklist with live progress bar and completion counting.
- **Sprint Management**: Velocity trackers, active sprint goals, story points, and issue modal.

### 2. Notion-Style Rich-Text Block Editor
- **Slash Commands (`/`)**: Triggerable popup menu for `/h1`, `/h2`, `/h3`, `/todo`, `/bullet`, `/code`, `/quote`, `/callout`, and `/divider`.
- **Markdown Shortcuts**: Instant conversion when typing `# `, `## `, `- `, `[] `, `> `, or ````.
- **Drag-and-Drop Blocks**: Reorder modular content blocks with 6-dot handles.
- **Page Hierarchy**: Nested document navigation, icon emoji picker, cover images, and auto-sync.

### 3. Pomodoro & Deep Work Tracker
- **Focus Timer**: Work (25m), Short Break (5m), Long Break (15m) with circular SVG countdown timer.
- **Web Audio Ambient Soundscapes**: 100% offline synthetic audio generated via HTML5 Web Audio API:
  - *Rainfall* (bandpassed pink noise)
  - *Cafe Murmur* (frequency modulated harmonic resonances)
  - *Brown / White Noise* (deep focus hum)
  - *Campfire* (crackling wood bursts)
  - *Ocean Waves* (LFO-swelled rhythmic sweeps)
  - *Binaural Tone* (432Hz stereo alpha beat)
- **Streaks & Session Logger**: Consecutive day streak counter, daily focus minutes goal progress, and session logs.

### 4. Infinite Canvas Whiteboard
- **Pan & Zoom Viewport**: Smooth wheel zooming (0.3x to 2.5x) and drag-to-pan infinite canvas.
- **Node Diagramming**: Sticky notes with color variations, architecture cards, and central mind-map concept nodes.
- **Flowchart SVG Connections**: Curved Bezier arrows dynamically anchored to node coordinates.
- **Connect Tool**: Click source node then click target node to create flowchart paths.

### 5. Interactive Gantt & Timeline View
- **Timeline Schedules**: Days/weeks calendar header with interactive progress completion bars.
- **Milestone Dependencies**: Predecessor-to-successor dependency arrows and tracking.
- **Deadline Alarms**: Configurable alert threshold days with urgent warning badges and banners for critical or overdue milestones.

---

## 🏃 Quick Start Guide

### Start Backend (Spring Boot):
```bash
cd backend
.\mvnw.cmd spring-boot:run
# Backend is live at http://localhost:8080
# H2 Console available at http://localhost:8080/h2-console
```

### Start Frontend (Next.js):
```bash
cd frontend
npm.cmd run dev -- -p 3001
# Frontend is live at http://localhost:3001
```
