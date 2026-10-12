package com.productivity.suite.controller;

import com.productivity.suite.model.Issue;
import com.productivity.suite.model.Sprint;
import com.productivity.suite.model.Subtask;
import com.productivity.suite.repository.IssueRepository;
import com.productivity.suite.repository.SprintRepository;
import com.productivity.suite.repository.SubtaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class KanbanController {

    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final SubtaskRepository subtaskRepository;

    public KanbanController(SprintRepository sprintRepository, IssueRepository issueRepository, SubtaskRepository subtaskRepository) {
        this.sprintRepository = sprintRepository;
        this.issueRepository = issueRepository;
        this.subtaskRepository = subtaskRepository;
    }

    // --- SPRINTS ---
    @GetMapping("/sprints")
    public List<Sprint> getSprints() {
        return sprintRepository.findAll();
    }

    @PostMapping("/sprints")
    public Sprint createSprint(@RequestBody Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    @PutMapping("/sprints/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint sprintDetails) {
        return sprintRepository.findById(id).map(sprint -> {
            sprint.setName(sprintDetails.getName());
            sprint.setGoal(sprintDetails.getGoal());
            sprint.setStartDate(sprintDetails.getStartDate());
            sprint.setEndDate(sprintDetails.getEndDate());
            sprint.setStatus(sprintDetails.getStatus());
            return ResponseEntity.ok(sprintRepository.save(sprint));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ISSUES ---
    @GetMapping("/issues")
    public List<Issue> getIssues() {
        return issueRepository.findAllByOrderByPositionAsc();
    }

    @PostMapping("/issues")
    public Issue createIssue(@RequestBody Issue issue) {
        if (issue.getStatus() == null) issue.setStatus("TODO");
        if (issue.getPriority() == null) issue.setPriority("MEDIUM");
        if (issue.getType() == null) issue.setType("TASK");
        return issueRepository.save(issue);
    }

    @PutMapping("/issues/{id}")
    public ResponseEntity<Issue> updateIssue(@PathVariable Long id, @RequestBody Issue update) {
        return issueRepository.findById(id).map(existing -> {
            if (update.getTitle() != null) existing.setTitle(update.getTitle());
            if (update.getDescription() != null) existing.setDescription(update.getDescription());
            if (update.getStatus() != null) existing.setStatus(update.getStatus());
            if (update.getPriority() != null) existing.setPriority(update.getPriority());
            if (update.getType() != null) existing.setType(update.getType());
            if (update.getStoryPoints() != null) existing.setStoryPoints(update.getStoryPoints());
            if (update.getAssignee() != null) existing.setAssignee(update.getAssignee());
            if (update.getSprintId() != null) existing.setSprintId(update.getSprintId());
            if (update.getSwimlaneKey() != null) existing.setSwimlaneKey(update.getSwimlaneKey());
            if (update.getPosition() != null) existing.setPosition(update.getPosition());
            if (update.getDueDate() != null) existing.setDueDate(update.getDueDate());
            if (update.getStartDate() != null) existing.setStartDate(update.getStartDate());
            return ResponseEntity.ok(issueRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        if (!issueRepository.existsById(id)) return ResponseEntity.notFound().build();
        issueRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Drag-and-drop batch status/order updates
    @PostMapping("/issues/batch-update")
    public ResponseEntity<List<Issue>> batchUpdateIssues(@RequestBody List<Issue> issues) {
        List<Issue> updated = issueRepository.saveAll(issues);
        return ResponseEntity.ok(updated);
    }

    // --- SUBTASKS ---
    @PostMapping("/issues/{issueId}/subtasks")
    public ResponseEntity<Subtask> addSubtask(@PathVariable Long issueId, @RequestBody Subtask subtask) {
        return issueRepository.findById(issueId).map(issue -> {
            subtask.setIssue(issue);
            if (subtask.getPosition() == null) subtask.setPosition(issue.getSubtasks().size());
            Subtask saved = subtaskRepository.save(subtask);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/subtasks/{id}")
    public ResponseEntity<Subtask> toggleSubtask(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return subtaskRepository.findById(id).map(subtask -> {
            if (payload.containsKey("completed")) {
                subtask.setCompleted((Boolean) payload.get("completed"));
            }
            if (payload.containsKey("title")) {
                subtask.setTitle((String) payload.get("title"));
            }
            return ResponseEntity.ok(subtaskRepository.save(subtask));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subtasks/{id}")
    public ResponseEntity<Void> deleteSubtask(@PathVariable Long id) {
        if (!subtaskRepository.existsById(id)) return ResponseEntity.notFound().build();
        subtaskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
