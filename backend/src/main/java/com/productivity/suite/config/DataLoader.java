package com.productivity.suite.config;

import com.productivity.suite.model.*;
import com.productivity.suite.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final DocumentRepository documentRepository;
    private final DocumentBlockRepository blockRepository;
    private final WhiteboardRepository whiteboardRepository;
    private final CanvasNodeRepository nodeRepository;
    private final CanvasEdgeRepository edgeRepository;
    private final TimelineMilestoneRepository milestoneRepository;
    private final TimelineDependencyRepository dependencyRepository;
    private final PomodoroSessionRepository pomodoroRepository;

    public DataLoader(
            SprintRepository sprintRepository,
            IssueRepository issueRepository,
            DocumentRepository documentRepository,
            DocumentBlockRepository blockRepository,
            WhiteboardRepository whiteboardRepository,
            CanvasNodeRepository nodeRepository,
            CanvasEdgeRepository edgeRepository,
            TimelineMilestoneRepository milestoneRepository,
            TimelineDependencyRepository dependencyRepository,
            PomodoroSessionRepository pomodoroRepository
    ) {
        this.sprintRepository = sprintRepository;
        this.issueRepository = issueRepository;
        this.documentRepository = documentRepository;
        this.blockRepository = blockRepository;
        this.whiteboardRepository = whiteboardRepository;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
        this.milestoneRepository = milestoneRepository;
        this.dependencyRepository = dependencyRepository;
        this.pomodoroRepository = pomodoroRepository;
    }

    @Override
    public void run(String... args) {
        seedSprintsAndIssues();
        seedDocuments();
        seedWhiteboard();
        seedGanttTimeline();
        seedPomodoroSessions();
    }

    private void seedSprintsAndIssues() {
        if (sprintRepository.count() > 0) return;

        Sprint sprint1 = new Sprint("Sprint 24: Real-Time Engine", "Deliver Notion block editor, Jira kanban swimlanes, and Gantt charts", LocalDate.now().minusDays(3), LocalDate.now().plusDays(11), "ACTIVE");
        sprint1 = sprintRepository.save(sprint1);

        Sprint sprint2 = new Sprint("Sprint 25: AI Workflows & Sync", "Automated sprint insights and team real-time collaboration", LocalDate.now().plusDays(12), LocalDate.now().plusDays(26), "PLANNED");
        sprintRepository.save(sprint2);

        // Issue 1: IN_PROGRESS
        Issue issue1 = new Issue();
        issue1.setTitle("Implement Drag-and-Drop Swimlane Kanban Board");
        issue1.setDescription("Support multi-column workflows, linear-style keyboard shortcuts, and swimlanes by priority, assignee, and track.");
        issue1.setStatus("IN_PROGRESS");
        issue1.setPriority("URGENT");
        issue1.setType("STORY");
        issue1.setStoryPoints(8);
        issue1.setAssignee("Alex Vance");
        issue1.setReporter("Sarah Connor");
        issue1.setSprintId(sprint1.getId());
        issue1.setSwimlaneKey("Frontend UX");
        issue1.setPosition(0);
        issue1.setStartDate(LocalDate.now().minusDays(2));
        issue1.setDueDate(LocalDate.now().plusDays(3));
        issue1.addSubtask(new Subtask("Column drag handlers", true, 0, issue1));
        issue1.addSubtask(new Subtask("Card position re-order calculations", true, 1, issue1));
        issue1.addSubtask(new Subtask("Swimlane grouping filters (Priority/Assignee)", false, 2, issue1));
        issueRepository.save(issue1);

        // Issue 2: TODO
        Issue issue2 = new Issue();
        issue2.setTitle("Slash Command Block Engine for Rich-Text Editor");
        issue2.setDescription("Build Notion-style block editor responding to `/` trigger: headings, code blocks, callouts, and checklists.");
        issue2.setStatus("TODO");
        issue2.setPriority("HIGH");
        issue2.setType("STORY");
        issue2.setStoryPoints(5);
        issue2.setAssignee("Elena Rostova");
        issue2.setReporter("Sarah Connor");
        issue2.setSprintId(sprint1.getId());
        issue2.setSwimlaneKey("Core Engine");
        issue2.setPosition(1);
        issue2.setStartDate(LocalDate.now());
        issue2.setDueDate(LocalDate.now().plusDays(5));
        issue2.addSubtask(new Subtask("Block type parser for markdown shortcuts", true, 0, issue2));
        issue2.addSubtask(new Subtask("Popup slash menu navigation with arrow keys", false, 1, issue2));
        issue2.addSubtask(new Subtask("Block drag handles and reordering", false, 2, issue2));
        issueRepository.save(issue2);

        // Issue 3: IN_REVIEW
        Issue issue3 = new Issue();
        issue3.setTitle("Web Audio Ambient Soundscapes & Pomodoro Timer");
        issue3.setDescription("Synthesize offline ambient soundscapes (rain, cafe noise, lo-fi beats) using Web Audio API nodes with zero external audio assets.");
        issue3.setStatus("IN_REVIEW");
        issue3.setPriority("MEDIUM");
        issue3.setType("TASK");
        issue3.setStoryPoints(3);
        issue3.setAssignee("Marcus Bell");
        issue3.setReporter("Alex Vance");
        issue3.setSprintId(sprint1.getId());
        issue3.setSwimlaneKey("Platform");
        issue3.setPosition(0);
        issue3.setStartDate(LocalDate.now().minusDays(3));
        issue3.setDueDate(LocalDate.now().plusDays(1));
        issue3.addSubtask(new Subtask("Pink noise generator for rain", true, 0, issue3));
        issue3.addSubtask(new Subtask("Binaural beats oscillator", true, 1, issue3));
        issue3.addSubtask(new Subtask("Streak counter & session storage persistence", true, 2, issue3));
        issueRepository.save(issue3);

        // Issue 4: DONE
        Issue issue4 = new Issue();
        issue4.setTitle("Infinite Whiteboard Canvas Pan & Zoom Coordinate Math");
        issue4.setDescription("Vectorized infinite viewport with zoom clamp, panning matrix, and sticky note card rendering.");
        issue4.setStatus("DONE");
        issue4.setPriority("HIGH");
        issue4.setType("STORY");
        issue4.setStoryPoints(5);
        issue4.setAssignee("Elena Rostova");
        issue4.setReporter("Alex Vance");
        issue4.setSprintId(sprint1.getId());
        issue4.setSwimlaneKey("Core Engine");
        issue4.setPosition(0);
        issue4.setStartDate(LocalDate.now().minusDays(5));
        issue4.setDueDate(LocalDate.now().minusDays(1));
        issue4.addSubtask(new Subtask("Wheel zoom transform", true, 0, issue4));
        issue4.addSubtask(new Subtask("Curved Bezier connectors between nodes", true, 1, issue4));
        issueRepository.save(issue4);

        // Issue 5: BACKLOG
        Issue issue5 = new Issue();
        issue5.setTitle("Gantt Milestone Dependency Graph & Deadline Alarms");
        issue5.setDescription("Render interactive Gantt bars with predecessor dependency connectors and highlight critical path items.");
        issue5.setStatus("BACKLOG");
        issue5.setPriority("HIGH");
        issue5.setType("TASK");
        issue5.setStoryPoints(5);
        issue5.setAssignee("David Miller");
        issue5.setReporter("Alex Vance");
        issue5.setSprintId(null);
        issue5.setSwimlaneKey("Frontend UX");
        issue5.setPosition(0);
        issue5.setDueDate(LocalDate.now().plusDays(14));
        issueRepository.save(issue5);
    }

    private void seedDocuments() {
        if (documentRepository.count() > 0) return;

        Document doc1 = new Document();
        doc1.setTitle("Productivity Suite System Architecture");
        doc1.setIcon("⚡");
        doc1.setCoverUrl("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80");
        doc1.setPinned(true);
        doc1.setFavorite(true);
        doc1 = documentRepository.save(doc1);

        blockRepository.save(new DocumentBlock("h1", "Productivity & Project Management Architecture", null, 0, doc1));
        blockRepository.save(new DocumentBlock("callout", "Unified workspace combining Notion modular blocks, Jira agile sprints, Linear speed, and Miro canvas thinking.", "{\"icon\":\"💡\"}", 1, doc1));
        blockRepository.save(new DocumentBlock("paragraph", "This document establishes the architecture for our monolithic-first productivity suite. Every component communicates through strongly-typed REST APIs and reactive frontend states.", null, 2, doc1));
        blockRepository.save(new DocumentBlock("h2", "Core Pillars & Subsystems", null, 3, doc1));
        blockRepository.save(new DocumentBlock("bullet", "Kanban & Sprint Boards: Multi-column workflows with swimlanes, subtasks, and story points.", null, 4, doc1));
        blockRepository.save(new DocumentBlock("bullet", "Notion-Style Block Editor: Slash commands (/h1, /code, /quote), instant markdown, and re-orderable blocks.", null, 5, doc1));
        blockRepository.save(new DocumentBlock("bullet", "Pomodoro & Deep Work Tracker: Ambient Web Audio soundscapes and streak tracking.", null, 6, doc1));
        blockRepository.save(new DocumentBlock("bullet", "Infinite Canvas Whiteboard: Node diagramming, sticky notes, and flowchart arrows.", null, 7, doc1));
        blockRepository.save(new DocumentBlock("bullet", "Gantt & Timeline View: Interactive schedules, dependency links, and deadline alarms.", null, 8, doc1));
        blockRepository.save(new DocumentBlock("h2", "Implementation Milestones", null, 9, doc1));
        blockRepository.save(new DocumentBlock("todo", "Spring Boot 4 backend with H2 file persistence", "{\"checked\":true}", 10, doc1));
        blockRepository.save(new DocumentBlock("todo", "Next.js App Router frontend with Tailwind CSS", "{\"checked\":true}", 11, doc1));
        blockRepository.save(new DocumentBlock("todo", "Full interactive drag-and-drop & slash menu integration", "{\"checked\":false}", 12, doc1));
        blockRepository.save(new DocumentBlock("code", "const config = {\n  backend: 'http://localhost:8080/api',\n  ambientAudio: true,\n  theme: 'dark-linear'\n};", "{\"language\":\"javascript\"}", 13, doc1));
        blockRepository.save(new DocumentBlock("quote", "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra", null, 14, doc1));

        Document doc2 = new Document();
        doc2.setTitle("Sprint Planning & Roadmap");
        doc2.setIcon("🚀");
        doc2.setParentId(doc1.getId());
        doc2.setPinned(false);
        doc2.setFavorite(true);
        doc2 = documentRepository.save(doc2);

        blockRepository.save(new DocumentBlock("h1", "Q4 Product Strategy", null, 0, doc2));
        blockRepository.save(new DocumentBlock("paragraph", "Aligning engineering output with immediate productivity gains across product teams.", null, 1, doc2));
        blockRepository.save(new DocumentBlock("callout", "Target delivery date: End of current sprint with zero regressions.", "{\"icon\":\"🎯\"}", 2, doc2));
    }

    private void seedWhiteboard() {
        if (whiteboardRepository.count() > 0) return;

        Whiteboard wb = new Whiteboard("Product Vision & Architecture Mind Map");
        wb.setZoomLevel(1.0);
        wb.setPanX(0.0);
        wb.setPanY(0.0);
        wb = whiteboardRepository.save(wb);

        // Nodes
        CanvasNode n1 = new CanvasNode();
        n1.setWhiteboardId(wb.getId());
        n1.setNodeUid("node-center");
        n1.setType("mindmap");
        n1.setContent("Unified Productivity Platform");
        n1.setColor("#818cf8"); // Indigo
        n1.setX(420.0);
        n1.setY(260.0);
        n1.setWidth(240.0);
        n1.setHeight(80.0);
        n1.setFontSize(16);
        nodeRepository.save(n1);

        CanvasNode n2 = new CanvasNode();
        n2.setWhiteboardId(wb.getId());
        n2.setNodeUid("node-kanban");
        n2.setType("card");
        n2.setContent("Agile Kanban & Sprints\n• Drag-and-drop\n• Swimlanes\n• Subtasks & points");
        n2.setColor("#38bdf8"); // Sky
        n2.setX(120.0);
        n2.setY(80.0);
        n2.setWidth(220.0);
        n2.setHeight(110.0);
        n2.setFontSize(13);
        nodeRepository.save(n2);

        CanvasNode n3 = new CanvasNode();
        n3.setWhiteboardId(wb.getId());
        n3.setNodeUid("node-notion");
        n3.setType("sticky");
        n3.setContent("Notion Block Editor\n/h1, /code, /quote\nMarkdown triggers\nNested pages");
        n3.setColor("#fde047"); // Yellow sticky
        n3.setX(740.0);
        n3.setY(80.0);
        n3.setWidth(200.0);
        n3.setHeight(130.0);
        n3.setFontSize(13);
        nodeRepository.save(n3);

        CanvasNode n4 = new CanvasNode();
        n4.setWhiteboardId(wb.getId());
        n4.setNodeUid("node-pomodoro");
        n4.setType("sticky");
        n4.setContent("Deep Work & Pomodoro\n• Web Audio soundscapes\n• Rain, cafe, white noise\n• Streak tracking");
        n4.setColor("#f472b6"); // Pink sticky
        n4.setX(120.0);
        n4.setY(420.0);
        n4.setWidth(220.0);
        n4.setHeight(120.0);
        n4.setFontSize(13);
        nodeRepository.save(n4);

        CanvasNode n5 = new CanvasNode();
        n5.setWhiteboardId(wb.getId());
        n5.setNodeUid("node-gantt");
        n5.setType("card");
        n5.setContent("Gantt & Timeline View\n• Predecessor links\n• Critical path\n• Deadline alarms");
        n5.setColor("#4ade80"); // Emerald
        n5.setX(740.0);
        n5.setY(420.0);
        n5.setWidth(220.0);
        n5.setHeight(110.0);
        n5.setFontSize(13);
        nodeRepository.save(n5);

        // Edges connecting center node to all satellites
        CanvasEdge e1 = new CanvasEdge();
        e1.setWhiteboardId(wb.getId());
        e1.setEdgeUid("edge-1");
        e1.setFromNodeUid("node-center");
        e1.setToNodeUid("node-kanban");
        e1.setFromAnchor("top");
        e1.setToAnchor("right");
        e1.setStyle("curved");
        e1.setColor("#94a3b8");
        edgeRepository.save(e1);

        CanvasEdge e2 = new CanvasEdge();
        e2.setWhiteboardId(wb.getId());
        e2.setEdgeUid("edge-2");
        e2.setFromNodeUid("node-center");
        e2.setToNodeUid("node-notion");
        e2.setFromAnchor("top");
        e2.setToAnchor("left");
        e2.setStyle("curved");
        e2.setColor("#94a3b8");
        edgeRepository.save(e2);

        CanvasEdge e3 = new CanvasEdge();
        e3.setWhiteboardId(wb.getId());
        e3.setEdgeUid("edge-3");
        e3.setFromNodeUid("node-center");
        e3.setToNodeUid("node-pomodoro");
        e3.setFromAnchor("bottom");
        e3.setToAnchor("right");
        e3.setStyle("curved");
        e3.setColor("#94a3b8");
        edgeRepository.save(e3);

        CanvasEdge e4 = new CanvasEdge();
        e4.setWhiteboardId(wb.getId());
        e4.setEdgeUid("edge-4");
        e4.setFromNodeUid("node-center");
        e4.setToNodeUid("node-gantt");
        e4.setFromAnchor("bottom");
        e4.setToAnchor("left");
        e4.setStyle("curved");
        e4.setColor("#94a3b8");
        edgeRepository.save(e4);
    }

    private void seedGanttTimeline() {
        if (milestoneRepository.count() > 0) return;

        LocalDate today = LocalDate.now();

        TimelineMilestone m1 = new TimelineMilestone();
        m1.setTitle("Architecture Design & Schema Setup");
        m1.setDescription("Define data models, REST endpoints, and JPA persistence");
        m1.setStartDate(today.minusDays(5));
        m1.setEndDate(today.minusDays(2));
        m1.setProgress(100);
        m1.setStatus("COMPLETED");
        m1.setPriority("HIGH");
        m1.setAssignee("Elena Rostova");
        m1.setColor("#10b981");
        m1.setAlarmDaysBefore(2);
        m1.setAlarmActive(false);
        m1 = milestoneRepository.save(m1);

        TimelineMilestone m2 = new TimelineMilestone();
        m2.setTitle("Kanban Board & Swimlanes Development");
        m2.setDescription("Drag and drop board with subtasks and multi-attribute filters");
        m2.setStartDate(today.minusDays(2));
        m2.setEndDate(today.plusDays(4));
        m2.setProgress(70);
        m2.setStatus("IN_PROGRESS");
        m2.setPriority("URGENT");
        m2.setAssignee("Alex Vance");
        m2.setColor("#3b82f6");
        m2.setAlarmDaysBefore(3);
        m2.setAlarmActive(true);
        m2 = milestoneRepository.save(m2);

        TimelineMilestone m3 = new TimelineMilestone();
        m3.setTitle("Notion Block Editor & Slash Parser");
        m3.setDescription("Hierarchical document tree and modular rich-text blocks");
        m3.setStartDate(today.plusDays(1));
        m3.setEndDate(today.plusDays(7));
        m3.setProgress(45);
        m3.setStatus("IN_PROGRESS");
        m3.setPriority("HIGH");
        m3.setAssignee("Sarah Connor");
        m3.setColor("#8b5cf6");
        m3.setAlarmDaysBefore(2);
        m3.setAlarmActive(true);
        m3 = milestoneRepository.save(m3);

        TimelineMilestone m4 = new TimelineMilestone();
        m4.setTitle("Infinite Canvas Whiteboard Engine");
        m4.setDescription("Pan/zoom canvas with bezier connections and sticky notes");
        m4.setStartDate(today.plusDays(5));
        m4.setEndDate(today.plusDays(12));
        m4.setProgress(15);
        m4.setStatus("PLANNED");
        m4.setPriority("MEDIUM");
        m4.setAssignee("Marcus Bell");
        m4.setColor("#f59e0b");
        m4.setAlarmDaysBefore(4);
        m4.setAlarmActive(true);
        m4 = milestoneRepository.save(m4);

        TimelineMilestone m5 = new TimelineMilestone();
        m5.setTitle("Milestone QA & Enterprise Production Release");
        m5.setDescription("Complete end-to-end integration and smoke testing");
        m5.setStartDate(today.plusDays(12));
        m5.setEndDate(today.plusDays(16));
        m5.setProgress(0);
        m5.setStatus("PLANNED");
        m5.setPriority("URGENT");
        m5.setAssignee("Alex Vance");
        m5.setColor("#ef4444");
        m5.setAlarmDaysBefore(5);
        m5.setAlarmActive(true);
        m5 = milestoneRepository.save(m5);

        // Dependencies: m1 -> m2 -> m3 -> m4 -> m5
        dependencyRepository.save(new TimelineDependency(m1.getId(), m2.getId(), "FINISH_TO_START", 0));
        dependencyRepository.save(new TimelineDependency(m2.getId(), m3.getId(), "START_TO_START", 3));
        dependencyRepository.save(new TimelineDependency(m3.getId(), m4.getId(), "FINISH_TO_START", 0));
        dependencyRepository.save(new TimelineDependency(m4.getId(), m5.getId(), "FINISH_TO_START", 0));
    }

    private void seedPomodoroSessions() {
        if (pomodoroRepository.count() > 0) return;

        pomodoroRepository.save(new PomodoroSession("Sprint board drag handlers", 25, "WORK", "RAIN"));
        pomodoroRepository.save(new PomodoroSession("Quick recharge", 5, "SHORT_BREAK", "SILENT"));
        pomodoroRepository.save(new PomodoroSession("Notion slash menu command parser", 25, "WORK", "CAFE"));
        pomodoroRepository.save(new PomodoroSession("Whiteboard pan/zoom matrix math", 25, "WORK", "WHITE_NOISE"));
        pomodoroRepository.save(new PomodoroSession("Refactoring REST endpoints", 25, "WORK", "CAMPFIRE"));
    }
}
