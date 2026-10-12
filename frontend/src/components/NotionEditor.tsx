"use client";

import React, { useState, useEffect, useRef } from "react";
import { api, Document, DocumentBlock } from "@/lib/api";
import {
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Code,
  Quote,
  Sparkles,
  Info,
  Minus,
  Pin,
  Star,
  Search,
  Check,
  ChevronRight,
  Folder,
  Image as ImageIcon,
  Smile,
  Copy,
} from "lucide-react";

interface SlashCommand {
  id: DocumentBlock["type"];
  label: string;
  icon: React.ReactNode;
  desc: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { id: "h1", label: "Heading 1", icon: <Heading1 className="w-4 h-4 text-indigo-400" />, desc: "Large top-level title" },
  { id: "h2", label: "Heading 2", icon: <Heading2 className="w-4 h-4 text-blue-400" />, desc: "Medium section header" },
  { id: "h3", label: "Heading 3", icon: <Heading3 className="w-4 h-4 text-sky-400" />, desc: "Sub-section header" },
  { id: "paragraph", label: "Text", icon: <FileText className="w-4 h-4 text-slate-400" />, desc: "Plain formatted text block" },
  { id: "todo", label: "To-do List", icon: <CheckSquare className="w-4 h-4 text-emerald-400" />, desc: "Checklist with interactive toggle" },
  { id: "bullet", label: "Bulleted List", icon: <List className="w-4 h-4 text-amber-400" />, desc: "Standard bulleted list" },
  { id: "code", label: "Code Block", icon: <Code className="w-4 h-4 text-pink-400" />, desc: "Monospace code with syntax highlight" },
  { id: "quote", label: "Quote", icon: <Quote className="w-4 h-4 text-purple-400" />, desc: "Indented italic quote callout" },
  { id: "callout", label: "Callout Box", icon: <Info className="w-4 h-4 text-cyan-400" />, desc: "Highlighted banner with icon" },
  { id: "divider", label: "Divider", icon: <Minus className="w-4 h-4 text-slate-500" />, desc: "Visual horizontal divider" },
];

export default function NotionEditor() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);
  const [searchDoc, setSearchDoc] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Slash menu state
  const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // Drag-and-drop block reordering
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);

  // Emoji picker toggle
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        selectDocument(docs[0].id!);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectDocument = async (id: number) => {
    try {
      const doc = await api.getDocument(id);
      setActiveDoc(doc);
      setBlocks(doc.blocks || []);
    } catch (err) {
      console.error("Failed to select document:", err);
    }
  };

  const createDocument = async () => {
    try {
      const newDoc = await api.createDocument({
        title: "Untitled Document",
        icon: "📄",
        pinned: false,
        favorite: false,
      });
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDoc(newDoc);
      setBlocks(newDoc.blocks || []);
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    try {
      await api.deleteDocument(id);
      const remaining = documents.filter((d) => d.id !== id);
      setDocuments(remaining);
      if (remaining.length > 0) {
        selectDocument(remaining[0].id!);
      } else {
        setActiveDoc(null);
        setBlocks([]);
      }
    } catch (err) {
      console.error("Failed to delete doc:", err);
    }
  };

  // Sync blocks to backend with debounce
  const syncTimer = useRef<NodeJS.Timeout | null>(null);
  const triggerSync = (updatedBlocks: DocumentBlock[]) => {
    setBlocks(updatedBlocks);
    if (!activeDoc?.id) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSaving(true);
    syncTimer.current = setTimeout(async () => {
      try {
        await api.syncBlocks(activeDoc.id!, updatedBlocks);
      } catch (err) {
        console.error("Failed to sync blocks:", err);
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  // Handle block content change + Markdown shortcuts
  const handleContentChange = (index: number, newText: string) => {
    const updated = [...blocks];
    const currentBlock = updated[index];

    // Check slash command trigger
    if (newText.startsWith("/")) {
      setSlashMenuIndex(index);
      setSlashQuery(newText.slice(1).toLowerCase());
      setSlashSelectedIndex(0);
      currentBlock.content = newText;
      triggerSync(updated);
      return;
    } else {
      setSlashMenuIndex(null);
    }

    // Markdown shortcut detection on starting prefix
    if (newText === "# ") {
      currentBlock.type = "h1";
      currentBlock.content = "";
    } else if (newText === "## ") {
      currentBlock.type = "h2";
      currentBlock.content = "";
    } else if (newText === "### ") {
      currentBlock.type = "h3";
      currentBlock.content = "";
    } else if (newText === "- " || newText === "* ") {
      currentBlock.type = "bullet";
      currentBlock.content = "";
    } else if (newText === "[] " || newText === "[ ] ") {
      currentBlock.type = "todo";
      currentBlock.content = "";
      currentBlock.properties = JSON.stringify({ checked: false });
    } else if (newText === "> ") {
      currentBlock.type = "quote";
      currentBlock.content = "";
    } else if (newText === "```") {
      currentBlock.type = "code";
      currentBlock.content = "";
      currentBlock.properties = JSON.stringify({ language: "javascript" });
    } else if (newText === "--- ") {
      currentBlock.type = "divider";
      currentBlock.content = "";
    } else {
      currentBlock.content = newText;
    }

    triggerSync(updated);
  };

  // Select a slash command from menu
  const applySlashCommand = (blockIdx: number, type: DocumentBlock["type"]) => {
    const updated = [...blocks];
    updated[blockIdx].type = type;
    updated[blockIdx].content = "";
    if (type === "todo") updated[blockIdx].properties = JSON.stringify({ checked: false });
    if (type === "code") updated[blockIdx].properties = JSON.stringify({ language: "javascript" });
    if (type === "callout") updated[blockIdx].properties = JSON.stringify({ icon: "💡" });

    setSlashMenuIndex(null);
    setSlashQuery("");
    triggerSync(updated);
  };

  // Add block below
  const addBlock = (afterIdx: number, type: DocumentBlock["type"] = "paragraph") => {
    const updated = [...blocks];
    const newBlock: DocumentBlock = {
      type,
      content: "",
      position: afterIdx + 1,
    };
    updated.splice(afterIdx + 1, 0, newBlock);
    triggerSync(updated);
  };

  // Delete block
  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      // Just clear
      const updated = [{ type: "paragraph" as const, content: "", position: 0 }];
      triggerSync(updated);
      return;
    }
    const updated = blocks.filter((_, i) => i !== index);
    triggerSync(updated);
  };

  // Toggle todo item
  const toggleTodo = (index: number) => {
    const updated = [...blocks];
    let isChecked = false;
    try {
      const parsed = JSON.parse(updated[index].properties || "{}");
      isChecked = !parsed.checked;
    } catch {
      isChecked = true;
    }
    updated[index].properties = JSON.stringify({ checked: isChecked });
    triggerSync(updated);
  };

  // Drag and drop block reordering
  const handleBlockDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedBlockIdx(idx);
    e.dataTransfer.setData("text/plain", idx.toString());
  };

  const handleBlockDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedBlockIdx === null || draggedBlockIdx === targetIdx) {
      setDraggedBlockIdx(null);
      return;
    }

    const updated = [...blocks];
    const [moved] = updated.splice(draggedBlockIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setDraggedBlockIdx(null);
    triggerSync(updated);
  };

  // Filter slash commands
  const filteredSlash = SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(slashQuery) || cmd.id.toLowerCase().includes(slashQuery)
  );

  return (
    <div className="flex h-full bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
      {/* Document Hierarchy Sidebar */}
      <div className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col p-3 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Documents
            </span>
          </div>
          <button
            onClick={createDocument}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition"
            title="Create Document"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search documents */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/90 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {documents
            .filter((d) => d.title.toLowerCase().includes(searchDoc.toLowerCase()))
            .map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => doc.id && selectDocument(doc.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition text-xs ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-sm shrink-0">{doc.icon || "📄"}</span>
                    <span className="truncate">{doc.title}</span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        doc.id && deleteDocument(doc.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950/40 relative">
        {activeDoc ? (
          <div>
            {/* Cover Banner */}
            {activeDoc.coverUrl ? (
              <div className="relative h-44 w-full overflow-hidden group">
                <img
                  src={activeDoc.coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    const newUrl = prompt("Enter cover image URL:", activeDoc.coverUrl);
                    if (newUrl !== null && activeDoc.id) {
                      api.updateDocument(activeDoc.id, { coverUrl: newUrl });
                      setActiveDoc({ ...activeDoc, coverUrl: newUrl });
                    }
                  }}
                  className="absolute bottom-2 right-4 px-2 py-1 bg-black/60 hover:bg-black/80 text-white rounded text-[11px] opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                >
                  Change Cover
                </button>
              </div>
            ) : (
              <div className="pt-6 px-12">
                <button
                  onClick={() => {
                    const preset = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80";
                    if (activeDoc.id) {
                      api.updateDocument(activeDoc.id, { coverUrl: preset });
                      setActiveDoc({ ...activeDoc, coverUrl: preset });
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Add Cover
                </button>
              </div>
            )}

            {/* Document Header */}
            <div className="max-w-3xl mx-auto px-10 pt-6 pb-2 space-y-3">
              <div className="flex items-center justify-between">
                {/* Icon emoji selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-3xl p-1 hover:bg-slate-800 rounded-lg transition"
                  >
                    {activeDoc.icon || "📄"}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-12 left-0 z-40 bg-slate-900 border border-slate-800 p-2 rounded-xl grid grid-cols-6 gap-2 shadow-2xl">
                      {["⚡", "🚀", "💡", "📑", "🎨", "🔥", "🎯", "🛠️", "📊", "🧠", "💎", "💻"].map(
                        (emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (activeDoc.id) {
                                api.updateDocument(activeDoc.id, { icon: emoji });
                                setActiveDoc({ ...activeDoc, icon: emoji });
                              }
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl p-1.5 hover:bg-slate-800 rounded"
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Auto-save status indicator */}
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  {saving ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Saved to Spring Boot
                    </span>
                  )}
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                value={activeDoc.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveDoc({ ...activeDoc, title: val });
                  if (activeDoc.id) {
                    api.updateDocument(activeDoc.id, { title: val });
                  }
                }}
                placeholder="Untitled Document"
                className="w-full text-3xl font-extrabold text-slate-100 bg-transparent border-none focus:outline-none tracking-tight placeholder-slate-600"
              />

              <div className="text-[11px] text-slate-500 flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <span>Type <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded">/</code> for commands</span>
                <span>•</span>
                <span>Type <code className="text-slate-400 bg-slate-900 px-1 rounded"># </code> for H1, <code className="text-slate-400 bg-slate-900 px-1 rounded">- </code> for bullets, <code className="text-slate-400 bg-slate-900 px-1 rounded">[] </code> for todo</span>
              </div>
            </div>

            {/* Blocks List */}
            <div className="max-w-3xl mx-auto px-10 pb-28 space-y-1">
              {blocks.map((block, idx) => {
                let isChecked = false;
                if (block.type === "todo" && block.properties) {
                  try {
                    isChecked = JSON.parse(block.properties).checked;
                  } catch {
                    isChecked = false;
                  }
                }

                let calloutIcon = "💡";
                if (block.type === "callout" && block.properties) {
                  try {
                    calloutIcon = JSON.parse(block.properties).icon || "💡";
                  } catch {
                    calloutIcon = "💡";
                  }
                }

                return (
                  <div
                    key={idx}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleBlockDrop(e, idx)}
                    className="group relative flex items-start space-x-2 py-1 px-1 rounded-lg hover:bg-slate-900/30 transition"
                  >
                    {/* Drag Handle & Plus Menu */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 pt-1 select-none">
                      <div
                        draggable
                        onDragStart={(e) => handleBlockDragStart(e, idx)}
                        className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-0.5 rounded"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      <button
                        onClick={() => addBlock(idx)}
                        className="text-slate-600 hover:text-indigo-400 p-0.5 rounded transition"
                        title="Add block below"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Block Content Renderers */}
                    <div className="flex-1">
                      {block.type === "h1" && (
                        <input
                          type="text"
                          value={block.content}
                          placeholder="Heading 1"
                          onChange={(e) => handleContentChange(idx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addBlock(idx);
                            } else if (e.key === "Backspace" && !block.content) {
                              deleteBlock(idx);
                            }
                          }}
                          className="w-full text-2xl font-bold text-slate-100 bg-transparent border-none focus:outline-none placeholder-slate-700"
                        />
                      )}

                      {block.type === "h2" && (
                        <input
                          type="text"
                          value={block.content}
                          placeholder="Heading 2"
                          onChange={(e) => handleContentChange(idx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addBlock(idx);
                            } else if (e.key === "Backspace" && !block.content) {
                              deleteBlock(idx);
                            }
                          }}
                          className="w-full text-xl font-semibold text-slate-200 bg-transparent border-none focus:outline-none placeholder-slate-700"
                        />
                      )}

                      {block.type === "h3" && (
                        <input
                          type="text"
                          value={block.content}
                          placeholder="Heading 3"
                          onChange={(e) => handleContentChange(idx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addBlock(idx);
                            } else if (e.key === "Backspace" && !block.content) {
                              deleteBlock(idx);
                            }
                          }}
                          className="w-full text-lg font-semibold text-slate-300 bg-transparent border-none focus:outline-none placeholder-slate-700"
                        />
                      )}

                      {block.type === "paragraph" && (
                        <textarea
                          rows={1}
                          value={block.content}
                          placeholder="Type something or '/' for commands..."
                          onChange={(e) => {
                            handleContentChange(idx, e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              addBlock(idx);
                            } else if (e.key === "Backspace" && !block.content) {
                              deleteBlock(idx);
                            }
                          }}
                          className="w-full text-sm text-slate-200 bg-transparent border-none focus:outline-none resize-none leading-relaxed placeholder-slate-600"
                        />
                      )}

                      {block.type === "bullet" && (
                        <div className="flex items-start space-x-2">
                          <span className="text-slate-500 font-bold text-sm leading-relaxed">•</span>
                          <input
                            type="text"
                            value={block.content}
                            placeholder="List item..."
                            onChange={(e) => handleContentChange(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addBlock(idx, "bullet");
                              } else if (e.key === "Backspace" && !block.content) {
                                deleteBlock(idx);
                              }
                            }}
                            className="w-full text-sm text-slate-200 bg-transparent border-none focus:outline-none leading-relaxed placeholder-slate-600"
                          />
                        </div>
                      )}

                      {block.type === "todo" && (
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTodo(idx)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={block.content}
                            placeholder="To-do item..."
                            onChange={(e) => handleContentChange(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addBlock(idx, "todo");
                              } else if (e.key === "Backspace" && !block.content) {
                                deleteBlock(idx);
                              }
                            }}
                            className={`w-full text-sm bg-transparent border-none focus:outline-none ${
                              isChecked ? "line-through text-slate-500" : "text-slate-200"
                            }`}
                          />
                        </div>
                      )}

                      {block.type === "quote" && (
                        <div className="border-l-2 border-indigo-500 pl-3 py-1 bg-indigo-950/20 rounded-r">
                          <textarea
                            rows={1}
                            value={block.content}
                            placeholder="Empty quote..."
                            onChange={(e) => handleContentChange(idx, e.target.value)}
                            className="w-full italic text-slate-300 bg-transparent border-none focus:outline-none text-sm resize-none"
                          />
                        </div>
                      )}

                      {block.type === "callout" && (
                        <div className="flex items-start space-x-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                          <span className="text-lg">{calloutIcon}</span>
                          <textarea
                            rows={1}
                            value={block.content}
                            placeholder="Callout text..."
                            onChange={(e) => handleContentChange(idx, e.target.value)}
                            className="w-full text-sm text-slate-200 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
                          />
                        </div>
                      )}

                      {block.type === "code" && (
                        <div className="relative bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-xs">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400">
                            <span className="text-[10px] uppercase font-bold text-indigo-400">JavaScript / Code</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(block.content)}
                              className="flex items-center gap-1 hover:text-white transition"
                              title="Copy code"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={block.content}
                            placeholder="// Paste or write code here..."
                            onChange={(e) => handleContentChange(idx, e.target.value)}
                            className="w-full bg-transparent text-emerald-300 border-none focus:outline-none resize-none leading-relaxed"
                          />
                        </div>
                      )}

                      {block.type === "divider" && (
                        <div className="py-2">
                          <hr className="border-slate-800" />
                        </div>
                      )}
                    </div>

                    {/* Slash Command Popup Menu */}
                    {slashMenuIndex === idx && (
                      <div className="absolute left-10 top-8 z-50 bg-slate-900 border border-slate-800 rounded-xl w-64 shadow-2xl p-1.5 space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">
                          Basic Blocks
                        </div>
                        {filteredSlash.length === 0 ? (
                          <div className="px-2 py-2 text-xs text-slate-500">No commands match &quot;{slashQuery}&quot;</div>
                        ) : (
                          filteredSlash.map((cmd, cIdx) => (
                            <button
                              key={cmd.id}
                              onClick={() => applySlashCommand(idx, cmd.id)}
                              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left transition text-xs ${
                                slashSelectedIndex === cIdx
                                  ? "bg-indigo-600/30 text-indigo-300"
                                  : "text-slate-300 hover:bg-slate-800/80"
                              }`}
                            >
                              <div className="p-1 rounded bg-slate-800 shrink-0">{cmd.icon}</div>
                              <div>
                                <div className="font-semibold">{cmd.label}</div>
                                <div className="text-[10px] text-slate-500">{cmd.desc}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-600" />
            <p className="text-sm">Select or create a document to start writing</p>
          </div>
        )}
      </div>
    </div>
  );
}
