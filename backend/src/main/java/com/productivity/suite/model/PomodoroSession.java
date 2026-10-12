package com.productivity.suite.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pomodoro_sessions")
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taskTitle;
    private Integer durationMinutes;
    private String type; // WORK, SHORT_BREAK, LONG_BREAK
    private LocalDateTime completedAt;
    private String soundscapeUsed; // RAIN, CAFE, WHITE_NOISE, WAVES, CAMPFIRE, LOFI, SILENT
    private String notes;
    private Integer rating;

    public PomodoroSession() {
        this.completedAt = LocalDateTime.now();
        this.type = "WORK";
        this.durationMinutes = 25;
        this.soundscapeUsed = "RAIN";
    }

    public PomodoroSession(String taskTitle, Integer durationMinutes, String type, String soundscapeUsed) {
        this();
        this.taskTitle = taskTitle;
        this.durationMinutes = durationMinutes;
        this.type = type;
        this.soundscapeUsed = soundscapeUsed;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getSoundscapeUsed() { return soundscapeUsed; }
    public void setSoundscapeUsed(String soundscapeUsed) { this.soundscapeUsed = soundscapeUsed; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
