package com.productivity.suite.model;

import jakarta.persistence.*;

@Entity
@Table(name = "timeline_dependencies")
public class TimelineDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long predecessorId;
    private Long successorId;
    private String type; // FINISH_TO_START, START_TO_START, FINISH_TO_FINISH
    private Integer lagDays;

    public TimelineDependency() {
        this.type = "FINISH_TO_START";
        this.lagDays = 0;
    }

    public TimelineDependency(Long predecessorId, Long successorId, String type, Integer lagDays) {
        this.predecessorId = predecessorId;
        this.successorId = successorId;
        this.type = type;
        this.lagDays = lagDays;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPredecessorId() { return predecessorId; }
    public void setPredecessorId(Long predecessorId) { this.predecessorId = predecessorId; }

    public Long getSuccessorId() { return successorId; }
    public void setSuccessorId(Long successorId) { this.successorId = successorId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getLagDays() { return lagDays; }
    public void setLagDays(Integer lagDays) { this.lagDays = lagDays; }
}
