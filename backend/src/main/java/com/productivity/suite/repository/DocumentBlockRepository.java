package com.productivity.suite.repository;

import com.productivity.suite.model.DocumentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentBlockRepository extends JpaRepository<DocumentBlock, Long> {
    List<DocumentBlock> findByDocumentIdOrderByPositionAsc(Long documentId);
    void deleteByDocumentId(Long documentId);
}
