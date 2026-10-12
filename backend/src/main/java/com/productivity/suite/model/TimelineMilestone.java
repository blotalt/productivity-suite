package com.productivity.suite.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "timeline_milestones")
public class TimelineMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer progress; // 0 - 100
    private String status; // PLANNED, IN_PROGRESS, COMPLETED, CRITICAL, BLOCKED
    private String priority; // URGENT, HIGH, MEDIUM, LOW
    private String assignee;
    private String color; // #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6
    private Integer alarmDaysBefore;
    private boolean isAlarmActive;
    private Long issueId;

    public TimelineMilestone() {
        this.progress = 0;
        this.status = "PLANNED";
        this.color = "#3b82f6";
        this.alarmDaysBefore = 3;
        this.isAlarmActive = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getAlarmDaysBefore() { return alarmDaysBefore; }
    public void setAlarmDaysBefore(Integer alarmDaysBefore) { this.alarmDaysBefore = alarmDaysBefore; }

    public boolean isAlarmActive() { return isAlarmActive; }
    public void setAlarmActive(boolean alarmActive) { isAlarmActive = alarmActive; }

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }
}
