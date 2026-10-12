package com.productivity.suite.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "whiteboards")
public class Whiteboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Double zoomLevel;
    private Double panX;
    private Double panY;
    private LocalDateTime updatedAt;

    public Whiteboard() {
        this.zoomLevel = 1.0;
        this.panX = 0.0;
        this.panY = 0.0;
        this.updatedAt = LocalDateTime.now();
    }

    public Whiteboard(String title) {
        this();
        this.title = title;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getZoomLevel() { return zoomLevel; }
    public void setZoomLevel(Double zoomLevel) { this.zoomLevel = zoomLevel; }

    public Double getPanX() { return panX; }
    public void setPanX(Double panX) { this.panX = panX; }

    public Double getPanY() { return panY; }
    public void setPanY(Double panY) { this.panY = panY; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
