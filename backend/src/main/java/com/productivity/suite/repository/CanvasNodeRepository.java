package com.productivity.suite.repository;

import com.productivity.suite.model.CanvasNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CanvasNodeRepository extends JpaRepository<CanvasNode, Long> {
    List<CanvasNode> findByWhiteboardId(Long whiteboardId);
    Optional<CanvasNode> findByWhiteboardIdAndNodeUid(Long whiteboardId, String nodeUid);
    void deleteByWhiteboardId(Long whiteboardId);
}
