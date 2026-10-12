package com.productivity.suite.controller;

import com.productivity.suite.model.TimelineDependency;
import com.productivity.suite.model.TimelineMilestone;
import com.productivity.suite.repository.TimelineDependencyRepository;
import com.productivity.suite.repository.TimelineMilestoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timeline")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class GanttController {

    private final TimelineMilestoneRepository milestoneRepository;
    private final TimelineDependencyRepository dependencyRepository;

    public GanttController(TimelineMilestoneRepository milestoneRepository, TimelineDependencyRepository dependencyRepository) {
        this.milestoneRepository = milestoneRepository;
        this.dependencyRepository = dependencyRepository;
    }

    @GetMapping("/milestones")
    public List<TimelineMilestone> getMilestones() {
        return milestoneRepository.findAllByOrderByStartDateAsc();
    }

    @PostMapping("/milestones")
    public TimelineMilestone createMilestone(@RequestBody TimelineMilestone milestone) {
        if (milestone.getStartDate() == null) milestone.setStartDate(LocalDate.now());
        if (milestone.getEndDate() == null) milestone.setEndDate(LocalDate.now().plusDays(7));
        if (milestone.getProgress() == null) milestone.setProgress(0);
        return milestoneRepository.save(milestone);
    }

    @PutMapping("/milestones/{id}")
    public ResponseEntity<TimelineMilestone> updateMilestone(@PathVariable Long id, @RequestBody TimelineMilestone update) {
        return milestoneRepository.findById(id).map(existing -> {
            if (update.getTitle() != null) existing.setTitle(update.getTitle());
            if (update.getDescription() != null) existing.setDescription(update.getDescription());
            if (update.getStartDate() != null) existing.setStartDate(update.getStartDate());
            if (update.getEndDate() != null) existing.setEndDate(update.getEndDate());
            if (update.getProgress() != null) existing.setProgress(update.getProgress());
            if (update.getStatus() != null) existing.setStatus(update.getStatus());
            if (update.getPriority() != null) existing.setPriority(update.getPriority());
            if (update.getAssignee() != null) existing.setAssignee(update.getAssignee());
            if (update.getColor() != null) existing.setColor(update.getColor());
            if (update.getAlarmDaysBefore() != null) existing.setAlarmDaysBefore(update.getAlarmDaysBefore());
            existing.setAlarmActive(update.isAlarmActive());
            return ResponseEntity.ok(milestoneRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/milestones/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        if (!milestoneRepository.existsById(id)) return ResponseEntity.notFound().build();
        milestoneRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Dependencies
    @GetMapping("/dependencies")
    public List<TimelineDependency> getDependencies() {
        return dependencyRepository.findAll();
    }

    @PostMapping("/dependencies")
    public TimelineDependency addDependency(@RequestBody TimelineDependency dep) {
        return dependencyRepository.save(dep);
    }

    @DeleteMapping("/dependencies/{id}")
    public ResponseEntity<Void> deleteDependency(@PathVariable Long id) {
        if (!dependencyRepository.existsById(id)) return ResponseEntity.notFound().build();
        dependencyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Deadline Alarms Overview
    @GetMapping("/alarms")
    public List<Map<String, Object>> getActiveAlarms() {
        LocalDate today = LocalDate.now();
        List<TimelineMilestone> milestones = milestoneRepository.findAll();

        return milestones.stream()
                .filter(m -> m.isAlarmActive() && m.getEndDate() != null && m.getProgress() < 100)
                .map(m -> {
                    long daysUntilDeadline = ChronoUnit.DAYS.between(today, m.getEndDate());
                    boolean isOverdue = daysUntilDeadline < 0;
                    boolean isTriggered = daysUntilDeadline <= (m.getAlarmDaysBefore() != null ? m.getAlarmDaysBefore() : 3);

                    if (isOverdue || isTriggered) {
                        Map<String, Object> alarm = new HashMap<>();
                        alarm.put("milestoneId", m.getId());
                        alarm.put("title", m.getTitle());
                        alarm.put("dueDate", m.getEndDate());
                        alarm.put("daysRemaining", daysUntilDeadline);
                        alarm.put("isOverdue", isOverdue);
                        alarm.put("severity", isOverdue ? "CRITICAL" : (daysUntilDeadline <= 1 ? "HIGH" : "WARNING"));
                        alarm.put("assignee", m.getAssignee());
                        return alarm;
                    }
                    return null;
                })
                .filter(a -> a != null)
                .collect(Collectors.toList());
    }
}
