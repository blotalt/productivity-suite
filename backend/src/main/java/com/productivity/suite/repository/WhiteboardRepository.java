package com.productivity.suite.repository;

import com.productivity.suite.model.Whiteboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WhiteboardRepository extends JpaRepository<Whiteboard, Long> {
}
