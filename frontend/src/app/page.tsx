"use client";

import React, { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import NotionEditor from "@/components/NotionEditor";
import PomodoroTracker from "@/components/PomodoroTracker";
import WhiteboardCanvas from "@/components/WhiteboardCanvas";
import GanttTimeline from "@/components/GanttTimeline";
import { soundEngine, SoundscapeType } from "@/lib/soundscapes";
import {
  Kanban,
  FileText,
  Clock,
  Sparkles,
  LayoutGrid,
  Calendar,
  Volume2,
  VolumeX,
  Server,
  Layers,
  Flame,
  CheckCircle2,
  Sliders,
  Maximize2,
  Command,
} from "lucide-react";

type ActiveTab = "KANBAN" | "NOTION" | "POMODORO" | "WHITEBOARD" | "GANTT";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("KANBAN");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Quick soundscape toggle from header
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientSound, setAmbientSound] = useState<SoundscapeType>("RAIN");

  useEffect(() => {
    // Check Spring Boot backend health
    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/sprints");
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleHeaderAmbient = () => {
    if (ambientPlaying) {
      soundEngine.stop?.();
      setAmbientPlaying(false);
    } else {
      soundEngine.play?.(ambientSound);
      setAmbientPlaying(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100">
      {/* Top Application Header */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-40 select-none">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                ZENITH SUITE
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono">
                Pillar 1
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-none">
              Notion + Jira + Linear Replacement
            </p>
          </div>
        </div>

        {/* Pillar Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 space-x-1 text-xs">
          <button
            onClick={() => setActiveTab("KANBAN")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "KANBAN"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban &amp; Sprints</span>
          </button>

          <button
            onClick={() => setActiveTab("NOTION")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "NOTION"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notion Editor</span>
          </button>

          <button
            onClick={() => setActiveTab("POMODORO")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "POMODORO"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Deep Work &amp; Focus</span>
          </button>

          <button
            onClick={() => setActiveTab("WHITEBOARD")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "WHITEBOARD"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Whiteboard</span>
          </button>

          <button
            onClick={() => setActiveTab("GANTT")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "GANTT"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Gantt &amp; Timeline</span>
          </button>
        </nav>

        {/* Right Tools: Ambient Audio & Backend Indicator */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Quick Ambient Soundscape toggle */}
          <button
            onClick={toggleHeaderAmbient}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              ambientPlaying
                ? "bg-indigo-950/60 border-indigo-500/50 text-indigo-300 font-semibold"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Web Audio Ambient Rain"
          >
            {ambientPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-[11px]">Rain (Live)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[11px]">Ambient Muted</span>
              </>
            )}
          </button>

          {/* Backend Status indicator */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border ${
              backendOnline === true
                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                : backendOnline === false
                ? "bg-red-950/40 border-red-800/40 text-red-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? "bg-emerald-400 animate-pulse"
                  : backendOnline === false
                  ? "bg-red-500"
                  : "bg-slate-500"
              }`}
            />
            <span className="font-mono text-[11px] font-semibold">
              {backendOnline === true
                ? "Spring Boot :8080"
                : backendOnline === false
                ? "Backend Offline"
                : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-hidden p-3.5 relative">
        {activeTab === "KANBAN" && <KanbanBoard />}
        {activeTab === "NOTION" && <NotionEditor />}
        {activeTab === "POMODORO" && <PomodoroTracker />}
        {activeTab === "WHITEBOARD" && <WhiteboardCanvas />}
        {activeTab === "GANTT" && <GanttTimeline />}
      </main>
    </div>
  );
}
