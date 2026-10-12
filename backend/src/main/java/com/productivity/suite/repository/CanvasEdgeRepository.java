package com.productivity.suite.repository;

import com.productivity.suite.model.CanvasEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CanvasEdgeRepository extends JpaRepository<CanvasEdge, Long> {
    List<CanvasEdge> findByWhiteboardId(Long whiteboardId);
    void deleteByWhiteboardId(Long whiteboardId);
}
