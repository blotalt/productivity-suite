package com.productivity.suite.repository;

import com.productivity.suite.model.TimelineMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimelineMilestoneRepository extends JpaRepository<TimelineMilestone, Long> {
    List<TimelineMilestone> findAllByOrderByStartDateAsc();
}
