"use client";

import React, { useState, useEffect, useRef } from "react";
import { api, CanvasNode, CanvasEdge, WhiteboardData } from "@/lib/api";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  StickyNote,
  Square,
  Circle,
  Network,
  Trash2,
  Save,
  Sparkles,
  Link2,
  MousePointer,
  RotateCcw,
} from "lucide-react";

export default function WhiteboardCanvas() {
  const [whiteboardId, setWhiteboardId] = useState(1);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Tools: "SELECT" | "PAN" | "CONNECT"
  const [activeTool, setActiveTool] = useState<"SELECT" | "PAN" | "CONNECT">("SELECT");
  const [connectSourceNodeUid, setConnectSourceNodeUid] = useState<string | null>(null);

  // Dragging nodes
  const [draggingNodeUid, setDraggingNodeUid] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWhiteboard();
  }, [whiteboardId]);

  const loadWhiteboard = async () => {
    try {
      setLoading(true);
      const data = await api.getWhiteboard(whiteboardId);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      if (data.whiteboard) {
        setZoom(data.whiteboard.zoomLevel || 1);
        setPan({ x: data.whiteboard.panX || 0, y: data.whiteboard.panY || 0 });
      }
    } catch (err) {
      console.error("Failed to load whiteboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveWhiteboard = async (newNodes = nodes, newEdges = edges) => {
    setSaving(true);
    try {
      await api.syncWhiteboard(whiteboardId, {
        nodes: newNodes,
        edges: newEdges,
        zoomLevel: zoom,
        panX: pan.x,
        panY: pan.y,
      });
    } catch (err) {
      console.error("Failed to save whiteboard:", err);
    } finally {
      setSaving(false);
    }
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.3, prev * factor)));
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "PAN" || e.button === 1 || e.altKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeUid) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const mouseX = (e.clientX - containerRect.left - pan.x) / zoom;
      const mouseY = (e.clientY - containerRect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) =>
          n.nodeUid === draggingNodeUid
            ? { ...n, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }
            : n
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggingNodeUid) {
      setDraggingNodeUid(null);
      saveWhiteboard();
    }
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeUid: string) => {
    e.stopPropagation();

    if (activeTool === "CONNECT") {
      if (!connectSourceNodeUid) {
        setConnectSourceNodeUid(nodeUid);
      } else if (connectSourceNodeUid !== nodeUid) {
        // Create connection edge
        const newEdge: CanvasEdge = {
          edgeUid: `edge-${Date.now()}`,
          fromNodeUid: connectSourceNodeUid,
          toNodeUid: nodeUid,
          fromAnchor: "right",
          toAnchor: "left",
          style: "curved",
          color: "#94a3b8",
        };
        const nextEdges = [...edges, newEdge];
        setEdges(nextEdges);
        setConnectSourceNodeUid(null);
        setActiveTool("SELECT");
        saveWhiteboard(nodes, nextEdges);
      }
      return;
    }

    const node = nodes.find((n) => n.nodeUid === nodeUid);
    if (!node) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const mouseX = (e.clientX - containerRect.left - pan.x) / zoom;
    const mouseY = (e.clientY - containerRect.top - pan.y) / zoom;

    setDragOffset({ x: mouseX - node.x, y: mouseY - node.y });
    setDraggingNodeUid(nodeUid);
  };

  // Node text edit
  const handleNodeContentChange = (nodeUid: string, text: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.nodeUid === nodeUid ? { ...n, content: text } : n))
    );
  };

  // Add new nodes
  const addNode = (type: CanvasNode["type"], color: string, defaultText: string) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const centerX = containerRect ? (containerRect.width / 2 - pan.x) / zoom - 100 : 300;
    const centerY = containerRect ? (containerRect.height / 2 - pan.y) / zoom - 50 : 200;

    const newNode: CanvasNode = {
      nodeUid: `node-${Date.now()}`,
      type,
      x: centerX,
      y: centerY,
      width: type === "sticky" ? 180 : 220,
      height: type === "sticky" ? 120 : 100,
      content: defaultText,
      color,
      fontSize: 13,
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    saveWhiteboard(nextNodes, edges);
  };

  // Delete node
  const deleteNode = (nodeUid: string) => {
    const nextNodes = nodes.filter((n) => n.nodeUid !== nodeUid);
    const nextEdges = edges.filter(
      (e) => e.fromNodeUid !== nodeUid && e.toNodeUid !== nodeUid
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
    saveWhiteboard(nextNodes, nextEdges);
  };

  // Render curved bezier connectors between nodes
  const renderEdgeSvgPath = (edge: CanvasEdge) => {
    const fromNode = nodes.find((n) => n.nodeUid === edge.fromNodeUid);
    const toNode = nodes.find((n) => n.nodeUid === edge.toNodeUid);
    if (!fromNode || !toNode) return null;

    const startX = fromNode.x + fromNode.width;
    const startY = fromNode.y + fromNode.height / 2;
    const endX = toNode.x;
    const endY = toNode.y + toNode.height / 2;

    const dx = Math.abs(endX - startX) * 0.5;
    const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

    return (
      <g key={edge.edgeUid}>
        <path
          d={pathD}
          fill="none"
          stroke={edge.color || "#64748b"}
          strokeWidth="2.5"
          strokeDasharray="4 2"
          className="transition-all"
        />
        {/* Arrowhead */}
        <polygon
          points={`${endX},${endY} ${endX - 7},${endY - 4} ${endX - 7},${endY + 4}`}
          fill={edge.color || "#64748b"}
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Whiteboard Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Tools */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setActiveTool("SELECT");
              setConnectSourceNodeUid(null);
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTool === "SELECT"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>

          <button
            onClick={() => {
              setActiveTool("PAN");
              setConnectSourceNodeUid(null);
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTool === "PAN"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Pan Canvas</span>
          </button>

          <button
            onClick={() => setActiveTool("CONNECT")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTool === "CONNECT"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Click source node then target node"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>
              {connectSourceNodeUid ? "Click Target Node..." : "Connect Nodes"}
            </span>
          </button>
        </div>

        {/* Center: Add Items */}
        <div className="flex items-center space-x-1.5 border-x border-slate-800 px-3">
          <button
            onClick={() => addNode("sticky", "#fef08a", "Idea: New Architecture")}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-500/20 transition font-medium"
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Sticky Note</span>
          </button>

          <button
            onClick={() => addNode("card", "#38bdf8", "Feature Subsystem\n• Spec and endpoints")}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/20 transition font-medium"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>

          <button
            onClick={() => addNode("mindmap", "#c084fc", "Central Concept")}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/20 transition font-medium"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mind Map</span>
          </button>
        </div>

        {/* Right: Zoom & Save */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1 text-slate-400 hover:text-slate-200 transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-300 px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
              className="p-1 text-slate-400 hover:text-slate-200 transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 text-slate-400 hover:text-slate-200 transition border-l border-slate-800 ml-1"
              title="Reset view (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => saveWhiteboard()}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Canvas"}</span>
          </button>
        </div>
      </div>

      {/* Infinite Canvas Viewport */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex-1 relative overflow-hidden bg-slate-950 border border-slate-800/80 rounded-xl canvas-grid select-none ${
          activeTool === "PAN" || isPanning ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
      >
        {/* Transformable Canvas Layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* SVG Connector Arrows Layer */}
          <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
            {edges.map((edge) => renderEdgeSvgPath(edge))}
          </svg>

          {/* Interactive Nodes Layer */}
          <div className="absolute inset-0 pointer-events-auto">
            {nodes.map((node) => {
              const isConnectSource = connectSourceNodeUid === node.nodeUid;

              return (
                <div
                  key={node.nodeUid}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.nodeUid)}
                  className={`group absolute rounded-xl p-3 shadow-xl transition-shadow cursor-move flex flex-col justify-between ${
                    isConnectSource
                      ? "ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950"
                      : ""
                  } ${
                    node.type === "sticky"
                      ? "border border-amber-300/40 text-slate-900 font-sans shadow-amber-950/20"
                      : node.type === "mindmap"
                      ? "border-2 border-indigo-400 bg-indigo-950/90 text-indigo-100 rounded-2xl shadow-indigo-950/40"
                      : "border border-slate-700 bg-slate-900/95 text-slate-100 shadow-slate-950/50"
                  }`}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${node.width}px`,
                    minHeight: `${node.height}px`,
                    backgroundColor:
                      node.type === "sticky" ? node.color || "#fef08a" : undefined,
                  }}
                >
                  {/* Top Bar: Delete button */}
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {node.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.nodeUid);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 rounded transition"
                      title="Delete node"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Content Editable Area */}
                  <textarea
                    rows={3}
                    value={node.content}
                    onChange={(e) => handleNodeContentChange(node.nodeUid, e.target.value)}
                    onBlur={() => saveWhiteboard()}
                    className={`w-full bg-transparent border-none focus:outline-none resize-none leading-snug text-xs font-medium ${
                      node.type === "sticky" ? "text-slate-900" : "text-slate-100"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas Hint Floating Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 backdrop-blur-md pointer-events-none">
          <span>Scroll wheel to zoom • Drag background to pan • Click &apos;Connect Nodes&apos; to link flowchart arrows</span>
        </div>
      </div>
    </div>
  );
}
