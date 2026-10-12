package com.productivity.suite.controller;

import com.productivity.suite.model.Document;
import com.productivity.suite.model.DocumentBlock;
import com.productivity.suite.repository.DocumentBlockRepository;
import com.productivity.suite.repository.DocumentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final DocumentBlockRepository blockRepository;

    public DocumentController(DocumentRepository documentRepository, DocumentBlockRepository blockRepository) {
        this.documentRepository = documentRepository;
        this.blockRepository = blockRepository;
    }

    @GetMapping("/documents")
    public List<Document> getAllDocuments() {
        return documentRepository.findByArchivedFalseOrderByUpdatedAtDesc();
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/documents")
    public Document createDocument(@RequestBody Document doc) {
        if (doc.getTitle() == null || doc.getTitle().isBlank()) {
            doc.setTitle("Untitled Document");
        }
        if (doc.getIcon() == null) doc.setIcon("📝");
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());
        Document saved = documentRepository.save(doc);

        // Add a default introductory block
        DocumentBlock initialBlock = new DocumentBlock("paragraph", "", null, 0, saved);
        blockRepository.save(initialBlock);

        return documentRepository.findById(saved.getId()).orElse(saved);
    }

    @PutMapping("/documents/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody Document update) {
        return documentRepository.findById(id).map(existing -> {
            if (update.getTitle() != null) existing.setTitle(update.getTitle());
            if (update.getIcon() != null) existing.setIcon(update.getIcon());
            if (update.getCoverUrl() != null) existing.setCoverUrl(update.getCoverUrl());
            if (update.getParentId() != null) existing.setParentId(update.getParentId());
            existing.setPinned(update.isPinned());
            existing.setFavorite(update.isFavorite());
            existing.setArchived(update.isArchived());
            existing.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(documentRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        if (!documentRepository.existsById(id)) return ResponseEntity.notFound().build();
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- BLOCKS ---
    @PostMapping("/documents/{docId}/blocks")
    public ResponseEntity<DocumentBlock> addBlock(@PathVariable Long docId, @RequestBody DocumentBlock block) {
        return documentRepository.findById(docId).map(doc -> {
            block.setDocument(doc);
            if (block.getPosition() == null) block.setPosition(doc.getBlocks().size());
            DocumentBlock saved = blockRepository.save(block);
            doc.setUpdatedAt(LocalDateTime.now());
            documentRepository.save(doc);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/documents/{docId}/blocks/sync")
    public ResponseEntity<List<DocumentBlock>> syncBlocks(@PathVariable Long docId, @RequestBody List<DocumentBlock> newBlocks) {
        return documentRepository.findById(docId).map(doc -> {
            // Clear existing blocks and replace with new block sequence
            blockRepository.deleteByDocumentId(docId);
            for (int i = 0; i < newBlocks.size(); i++) {
                DocumentBlock b = newBlocks.get(i);
                b.setId(null);
                b.setDocument(doc);
                b.setPosition(i);
                blockRepository.save(b);
            }
            doc.setUpdatedAt(LocalDateTime.now());
            documentRepository.save(doc);
            return ResponseEntity.ok(blockRepository.findByDocumentIdOrderByPositionAsc(docId));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/blocks/{id}")
    public ResponseEntity<DocumentBlock> updateBlock(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return blockRepository.findById(id).map(block -> {
            if (updates.containsKey("content")) block.setContent((String) updates.get("content"));
            if (updates.containsKey("type")) block.setType((String) updates.get("type"));
            if (updates.containsKey("properties")) block.setProperties((String) updates.get("properties"));
            if (updates.containsKey("position")) block.setPosition((Integer) updates.get("position"));
            DocumentBlock saved = blockRepository.save(block);
            if (block.getDocument() != null) {
                block.getDocument().setUpdatedAt(LocalDateTime.now());
                documentRepository.save(block.getDocument());
            }
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/blocks/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable Long id) {
        if (!blockRepository.existsById(id)) return ResponseEntity.notFound().build();
        blockRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
