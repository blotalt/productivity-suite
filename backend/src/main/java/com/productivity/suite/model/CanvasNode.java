package com.productivity.suite.model;

import jakarta.persistence.*;

@Entity
@Table(name = "canvas_nodes")
public class CanvasNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long whiteboardId;
    private String nodeUid; // client identifier, e.g. "node-1"
    private String type; // sticky, card, rectangle, circle, text, mindmap
    private Double x;
    private Double y;
    private Double width;
    private Double height;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String color;
    private Integer fontSize;

    @Column(columnDefinition = "TEXT")
    private String data; // extra metadata or shape properties

    public CanvasNode() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWhiteboardId() { return whiteboardId; }
    public void setWhiteboardId(Long whiteboardId) { this.whiteboardId = whiteboardId; }

    public String getNodeUid() { return nodeUid; }
    public void setNodeUid(String nodeUid) { this.nodeUid = nodeUid; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }

    public Double getWidth() { return width; }
    public void setWidth(Double width) { this.width = width; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getFontSize() { return fontSize; }
    public void setFontSize(Integer fontSize) { this.fontSize = fontSize; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}
