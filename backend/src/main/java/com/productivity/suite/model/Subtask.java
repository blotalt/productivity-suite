package com.productivity.suite.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "subtasks")
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private boolean completed;
    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id")
    @JsonBackReference
    private Issue issue;

    public Subtask() {}

    public Subtask(String title, boolean completed, Integer position, Issue issue) {
        this.title = title;
        this.completed = completed;
        this.position = position;
        this.issue = issue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Issue getIssue() { return issue; }
    public void setIssue(Issue issue) { this.issue = issue; }
}
