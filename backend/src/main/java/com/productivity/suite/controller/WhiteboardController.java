package com.productivity.suite.controller;

import com.productivity.suite.model.CanvasEdge;
import com.productivity.suite.model.CanvasNode;
import com.productivity.suite.model.Whiteboard;
import com.productivity.suite.repository.CanvasEdgeRepository;
import com.productivity.suite.repository.CanvasNodeRepository;
import com.productivity.suite.repository.WhiteboardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class WhiteboardController {

    private final WhiteboardRepository whiteboardRepository;
    private final CanvasNodeRepository nodeRepository;
    private final CanvasEdgeRepository edgeRepository;

    public WhiteboardController(WhiteboardRepository whiteboardRepository, CanvasNodeRepository nodeRepository, CanvasEdgeRepository edgeRepository) {
        this.whiteboardRepository = whiteboardRepository;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    @GetMapping("/whiteboards")
    public List<Whiteboard> getWhiteboards() {
        return whiteboardRepository.findAll();
    }

    @GetMapping("/whiteboards/{id}")
    public ResponseEntity<Map<String, Object>> getWhiteboardData(@PathVariable Long id) {
        return whiteboardRepository.findById(id).map(wb -> {
            List<CanvasNode> nodes = nodeRepository.findByWhiteboardId(id);
            List<CanvasEdge> edges = edgeRepository.findByWhiteboardId(id);
            Map<String, Object> resp = new HashMap<>();
            resp.put("whiteboard", wb);
            resp.put("nodes", nodes);
            resp.put("edges", edges);
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/whiteboards")
    public Whiteboard createWhiteboard(@RequestBody Whiteboard wb) {
        if (wb.getTitle() == null || wb.getTitle().isBlank()) {
            wb.setTitle("Untitled Whiteboard");
        }
        wb.setUpdatedAt(LocalDateTime.now());
        return whiteboardRepository.save(wb);
    }

    @PutMapping("/whiteboards/{id}/viewport")
    public ResponseEntity<Whiteboard> updateViewport(@PathVariable Long id, @RequestBody Map<String, Double> viewport) {
        return whiteboardRepository.findById(id).map(wb -> {
            if (viewport.containsKey("zoomLevel")) wb.setZoomLevel(viewport.get("zoomLevel"));
            if (viewport.containsKey("panX")) wb.setPanX(viewport.get("panX"));
            if (viewport.containsKey("panY")) wb.setPanY(viewport.get("panY"));
            wb.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(whiteboardRepository.save(wb));
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class WhiteboardSyncPayload {
        public List<CanvasNode> nodes;
        public List<CanvasEdge> edges;
        public Double zoomLevel;
        public Double panX;
        public Double panY;
    }

    @Transactional
    @PostMapping("/whiteboards/{id}/sync")
    public ResponseEntity<Map<String, Object>> syncWhiteboard(@PathVariable Long id, @RequestBody WhiteboardSyncPayload payload) {
        return whiteboardRepository.findById(id).map(wb -> {
            if (payload.zoomLevel != null) wb.setZoomLevel(payload.zoomLevel);
            if (payload.panX != null) wb.setPanX(payload.panX);
            if (payload.panY != null) wb.setPanY(payload.panY);
            wb.setUpdatedAt(LocalDateTime.now());
            whiteboardRepository.save(wb);

            if (payload.nodes != null) {
                nodeRepository.deleteByWhiteboardId(id);
                for (CanvasNode n : payload.nodes) {
                    n.setId(null);
                    n.setWhiteboardId(id);
                    nodeRepository.save(n);
                }
            }

            if (payload.edges != null) {
                edgeRepository.deleteByWhiteboardId(id);
                for (CanvasEdge e : payload.edges) {
                    e.setId(null);
                    e.setWhiteboardId(id);
                    edgeRepository.save(e);
                }
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("whiteboard", wb);
            resp.put("nodes", nodeRepository.findByWhiteboardId(id));
            resp.put("edges", edgeRepository.findByWhiteboardId(id));
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }
}
