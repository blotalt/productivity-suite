package com.productivity.suite.controller;

import com.productivity.suite.model.PomodoroSession;
import com.productivity.suite.repository.PomodoroSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pomodoro")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class PomodoroController {

    private final PomodoroSessionRepository pomodoroRepository;

    public PomodoroController(PomodoroSessionRepository pomodoroRepository) {
        this.pomodoroRepository = pomodoroRepository;
    }

    @GetMapping("/sessions")
    public List<PomodoroSession> getSessions() {
        return pomodoroRepository.findAllByOrderByCompletedAtDesc();
    }

    @PostMapping("/sessions")
    public PomodoroSession logSession(@RequestBody PomodoroSession session) {
        if (session.getCompletedAt() == null) {
            session.setCompletedAt(LocalDateTime.now());
        }
        return pomodoroRepository.save(session);
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        if (!pomodoroRepository.existsById(id)) return ResponseEntity.notFound().build();
        pomodoroRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        List<PomodoroSession> sessions = pomodoroRepository.findAll();

        int totalFocusMinutes = sessions.stream()
                .filter(s -> "WORK".equalsIgnoreCase(s.getType()))
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 25)
                .sum();

        LocalDate today = LocalDate.now();
        int todayFocusMinutes = sessions.stream()
                .filter(s -> "WORK".equalsIgnoreCase(s.getType()))
                .filter(s -> s.getCompletedAt() != null && s.getCompletedAt().toLocalDate().isEqual(today))
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 25)
                .sum();

        long workSessionsCount = sessions.stream()
                .filter(s -> "WORK".equalsIgnoreCase(s.getType()))
                .count();

        // Calculate consecutive day streak
        Set<LocalDate> activeDays = sessions.stream()
                .filter(s -> s.getCompletedAt() != null)
                .map(s -> s.getCompletedAt().toLocalDate())
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate checkDate = today;
        if (!activeDays.contains(checkDate)) {
            checkDate = today.minusDays(1);
        }
        while (activeDays.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        Map<String, Long> soundscapeUsage = sessions.stream()
                .filter(s -> s.getSoundscapeUsed() != null)
                .collect(Collectors.groupingBy(PomodoroSession::getSoundscapeUsed, Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFocusMinutes", totalFocusMinutes);
        stats.put("todayFocusMinutes", todayFocusMinutes);
        stats.put("completedSessions", workSessionsCount);
        stats.put("currentStreak", Math.max(streak, 1));
        stats.put("soundscapeUsage", soundscapeUsage);
        stats.put("targetMinutesToday", 120);

        return stats;
    }
}
