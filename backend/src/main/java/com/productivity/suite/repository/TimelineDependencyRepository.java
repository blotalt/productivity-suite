package com.productivity.suite.repository;

import com.productivity.suite.model.TimelineDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimelineDependencyRepository extends JpaRepository<TimelineDependency, Long> {
    List<TimelineDependency> findByPredecessorId(Long predecessorId);
    List<TimelineDependency> findBySuccessorId(Long successorId);
}
