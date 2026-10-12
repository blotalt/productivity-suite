package com.productivity.suite.model;

import jakarta.persistence.*;

@Entity
@Table(name = "canvas_edges")
public class CanvasEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long whiteboardId;
    private String edgeUid;
    private String fromNodeUid;
    private String toNodeUid;
    private String fromAnchor; // top, right, bottom, left
    private String toAnchor; // top, right, bottom, left
    private String label;
    private String style; // curved, straight, step
    private String color;

    public CanvasEdge() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWhiteboardId() { return whiteboardId; }
    public void setWhiteboardId(Long whiteboardId) { this.whiteboardId = whiteboardId; }

    public String getEdgeUid() { return edgeUid; }
    public void setEdgeUid(String edgeUid) { this.edgeUid = edgeUid; }

    public String getFromNodeUid() { return fromNodeUid; }
    public void setFromNodeUid(String fromNodeUid) { this.fromNodeUid = fromNodeUid; }

    public String getToNodeUid() { return toNodeUid; }
    public void setToNodeUid(String toNodeUid) { this.toNodeUid = toNodeUid; }

    public String getFromAnchor() { return fromAnchor; }
    public void setFromAnchor(String fromAnchor) { this.fromAnchor = fromAnchor; }

    public String getToAnchor() { return toAnchor; }
    public void setToAnchor(String toAnchor) { this.toAnchor = toAnchor; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
