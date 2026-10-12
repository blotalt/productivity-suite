package com.productivity.suite.repository;

import com.productivity.suite.model.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByIssueIdOrderByPositionAsc(Long issueId);
}
