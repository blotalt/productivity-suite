"use client";

import React, { useState, useEffect, useRef } from "react";
import { soundEngine, SoundscapeType } from "@/lib/soundscapes";
import { api, PomodoroSession, PomodoroStats } from "@/lib/api";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Volume2,
  VolumeX,
  CloudRain,
  Coffee,
  Radio,
  Flame as CampfireIcon,
  Waves,
  Music,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  BarChart3,
  Sliders,
} from "lucide-react";

export default function PomodoroTracker() {
  const [mode, setMode] = useState<"WORK" | "SHORT_BREAK" | "LONG_BREAK">("WORK");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskTitle, setTaskTitle] = useState("Focus Deep Work Sprint");

  // Soundscapes
  const [selectedSoundscape, setSelectedSoundscape] = useState<SoundscapeType>("RAIN");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Stats & Sessions
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MODE_TIMES = {
    WORK: 25 * 60,
    SHORT_BREAK: 5 * 60,
    LONG_BREAK: 15 * 60,
  };

  useEffect(() => {
    loadStatsAndSessions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundEngine.stop?.();
    };
  }, []);

  const loadStatsAndSessions = async () => {
    try {
      setLoading(true);
      const [fetchedStats, fetchedSessions] = await Promise.all([
        api.getPomodoroStats(),
        api.getPomodoroSessions(),
      ]);
      setStats(fetchedStats);
      setRecentSessions(fetchedSessions.slice(0, 10));
    } catch (err) {
      console.error("Failed to load pomodoro stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, taskTitle, selectedSoundscape]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    // Play sound notification
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}

    // Save session to Spring Boot
    const duration = mode === "WORK" ? 25 : mode === "SHORT_BREAK" ? 5 : 15;
    try {
      await api.logPomodoroSession({
        taskTitle,
        durationMinutes: duration,
        type: mode,
        soundscapeUsed: isAudioPlaying ? selectedSoundscape : "SILENT",
      });
      loadStatsAndSessions();
    } catch (err) {
      console.error("Failed to log session:", err);
    }

    // Switch mode
    if (mode === "WORK") {
      setMode("SHORT_BREAK");
      setTimeLeft(MODE_TIMES.SHORT_BREAK);
    } else {
      setMode("WORK");
      setTimeLeft(MODE_TIMES.WORK);
    }
  };

  const switchMode = (newMode: "WORK" | "SHORT_BREAK" | "LONG_BREAK") => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const toggleTimer = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);

    // Auto-toggle soundscape along with timer if enabled
    if (nextState) {
      if (selectedSoundscape !== "SILENT" && !isAudioPlaying) {
        soundEngine.play?.(selectedSoundscape);
        setIsAudioPlaying(true);
      }
    } else {
      soundEngine.stop?.();
      setIsAudioPlaying(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
    soundEngine.stop?.();
    setIsAudioPlaying(false);
  };

  const toggleSoundscape = (type: SoundscapeType) => {
    if (selectedSoundscape === type && isAudioPlaying) {
      soundEngine.stop?.();
      setIsAudioPlaying(false);
    } else {
      setSelectedSoundscape(type);
      soundEngine.play?.(type);
      setIsAudioPlaying(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume?.(newVol);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalTime = MODE_TIMES[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const SOUNDSCAPES: { id: SoundscapeType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "RAIN", label: "Rainfall", icon: <CloudRain className="w-4 h-4" />, desc: "Filtered pink noise" },
    { id: "CAFE", label: "Cafe Murmur", icon: <Coffee className="w-4 h-4" />, desc: "Warm chatter hum" },
    { id: "WHITE_NOISE", label: "Brown Noise", icon: <Radio className="w-4 h-4" />, desc: "Deep focus hum" },
    { id: "CAMPFIRE", label: "Campfire", icon: <CampfireIcon className="w-4 h-4" />, desc: "Crackling wood" },
    { id: "WAVES", label: "Ocean Waves", icon: <Waves className="w-4 h-4" />, desc: "Rhythmic swell" },
    { id: "LOFI", label: "Binaural Tone", icon: <Music className="w-4 h-4" />, desc: "432Hz alpha beat" },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Banner: Streak and Progress Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-slate-100 text-lg">
                Deep Work &amp; Pomodoro Engine
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> {stats?.currentStreak || 1} Day Streak
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synthesized ambient soundscapes and deep focus session counters
            </p>
          </div>
        </div>

        {/* Daily Focus Goal Bar */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Today&apos;s Focus</div>
            <div className="text-sm font-bold text-indigo-400">
              {stats?.todayFocusMinutes || 0} / {stats?.targetMinutesToday || 120} min
            </div>
          </div>
          <div className="w-28 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, ((stats?.todayFocusMinutes || 0) / (stats?.targetMinutesToday || 120)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Timer on Left, Ambient Soundscapes & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto">
        {/* Left Column: Timer & Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl space-x-1 text-xs">
            <button
              onClick={() => switchMode("WORK")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === "WORK"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Deep Work (25m)
            </button>
            <button
              onClick={() => switchMode("SHORT_BREAK")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === "SHORT_BREAK"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => switchMode("LONG_BREAK")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === "LONG_BREAK"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Active Task Input */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full text-center bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Big Countdown Display */}
          <div className="relative flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-64 h-64 -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800/80"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 112}
                strokeDashoffset={2 * Math.PI * 112 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  mode === "WORK"
                    ? "text-indigo-500"
                    : mode === "SHORT_BREAK"
                    ? "text-emerald-500"
                    : "text-purple-500"
                }`}
                fill="transparent"
              />
            </svg>

            {/* Time Center */}
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-5xl font-black text-slate-100 tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
                {mode === "WORK" ? "Focus Sprint" : "Recharge"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-xl font-bold flex items-center space-x-2 text-white shadow-xl transition transform active:scale-95 ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                  : mode === "WORK"
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={handleSessionComplete}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              title="Skip to next session"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Ambient Soundscapes & Stats (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Ambient Soundscapes Synthesizer Panel */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Ambient Soundscapes (Web Audio)
                </h3>
              </div>

              {isAudioPlaying && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Playing Live
                </span>
              )}
            </div>

            {/* Soundscape presets grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {SOUNDSCAPES.map((sc) => {
                const isActive = selectedSoundscape === sc.id && isAudioPlaying;

                return (
                  <button
                    key={sc.id}
                    onClick={() => toggleSoundscape(sc.id)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition ${
                      isActive
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-lg shadow-indigo-950/40"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      {sc.icon}
                    </div>
                    <div>
                      <div>{sc.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{sc.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-800/60 text-xs">
              <button
                onClick={() => handleVolumeChange(volume === 0 ? 0.5 : 0)}
                className="text-slate-400 hover:text-white transition"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 w-8 text-right font-mono">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Recent Completed Sessions History */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Deep Work History ({stats?.completedSessions || 0} Sessions)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {stats?.totalFocusMinutes || 0} total mins
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {recentSessions.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">
                  No sessions recorded yet. Start your first sprint!
                </div>
              ) : (
                recentSessions.map((session, i) => (
                  <div
                    key={session.id || i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium text-slate-300 truncate">
                        {session.taskTitle}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {session.soundscapeUsed || "RAIN"}
                      </span>
                      <span className="font-mono text-indigo-400 text-[11px] font-bold">
                        {session.durationMinutes}m
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
