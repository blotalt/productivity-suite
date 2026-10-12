package com.productivity.suite.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "document_blocks")
public class DocumentBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // paragraph, h1, h2, h3, bullet, number, todo, code, quote, callout, divider

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String properties; // JSON string for metadata like checked status, code lang, callout emoji

    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    @JsonBackReference
    private Document document;

    public DocumentBlock() {}

    public DocumentBlock(String type, String content, String properties, Integer position, Document document) {
        this.type = type;
        this.content = content;
        this.properties = properties;
        this.position = position;
        this.document = document;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getProperties() { return properties; }
    public void setProperties(String properties) { this.properties = properties; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
}
