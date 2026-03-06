import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

const VB = {
  bg: "#091C1D", bg2: "#0d2526", surface: "#0f2d2e", surface2: "#132f30",
  border: "rgba(181,211,52,0.15)", border2: "rgba(181,211,52,0.3)",
  ink: "#f5f2ec", ink2: "#c8d4ce", muted: "#849BA6",
  gold: "#B5D334", gold2: "#cde84a", teal: "#0097A7", teal2: "#00b8cc",
  coral: "#E46962", purple: "#a855f7",
  fontHeader: "'Bebas Neue', sans-serif",
  fontMono: "'DM Mono', monospace",
  fontBody: "'DM Sans', sans-serif",
};

const STORAGE_KEY = "vb_os_notes";

const DEFAULT_NOTES = [
  {
    id: "note-1",
    title: "Welcome to VB Notes",
    content: "This is your personal notepad within VentureBuilder OS.\n\n**Bold text** with double asterisks.\n*Italic text* with single asterisks.\n\nStart taking notes!",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "note-2",
    title: "Deal Pipeline Notes",
    content: "Q1 pipeline review:\n\n- Project Alpha: Series A ready\n- Project Beta: Due diligence phase\n- Project Gamma: Early evaluation\n\n**Action items:**\n- Schedule board review for Alpha\n- Request financials from Beta team",
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "note-3",
    title: "Meeting Notes - Strategy Session",
    content: "Discussed portfolio rebalancing strategy.\n\nKey takeaways:\n1. Focus on *sustainable growth* sectors\n2. Increase allocation to AI/ML ventures\n3. Review exit timeline for mature holdings\n\nNext meeting: Friday 3PM",
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
  },
];

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_NOTES;
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    /* ignore */
  }
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function renderFormattedText(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    let rendered = line;
    rendered = rendered.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${VB.ink};font-weight:600">$1</strong>`);
    rendered = rendered.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, `<em style="color:${VB.ink2}">$1</em>`);
    return (
      <div
        key={i}
        style={{ minHeight: line === "" ? 16 : "auto", lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: rendered || "&nbsp;" }}
      />
    );
  });
}

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const editorRef = useRef(null);

  // Set initial active on mount
  useEffect(() => {
    const loaded = loadNotes();
    if (loaded.length > 0 && !activeId) {
      setActiveId(loaded[0].id);
    }
  }, []);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeId) || null;
  }, [notes, activeId]);

  const filteredNotes = useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter((n) =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const createNote = useCallback(() => {
    const newNote = {
      id: "note-" + Date.now(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
    setEditing(true);
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (activeId === id) {
        setActiveId(next[0]?.id || null);
      }
      return next;
    });
  }, [activeId]);

  const updateNote = useCallback((id, updates) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    );
  }, []);

  return (
    <div style={{
      height: "100%",
      display: "flex",
      background: VB.bg,
      color: VB.ink,
      fontFamily: VB.fontBody,
      fontSize: 13,
    }}>
      {/* Sidebar - Note List */}
      <div style={{
        width: 240,
        borderRight: `1px solid ${VB.border}`,
        background: VB.bg2,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: 12,
          borderBottom: `1px solid ${VB.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontFamily: VB.fontHeader,
              fontSize: 18,
              color: VB.gold,
              letterSpacing: 1,
            }}>
              NOTES
            </span>
            <button
              onClick={createNote}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${VB.border2}`,
                background: "transparent",
                color: VB.gold,
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(181,211,52,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              title="New Note"
            >
              +
            </button>
          </div>

          {/* Search */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: VB.surface,
            border: `1px solid ${VB.border}`,
            borderRadius: 6,
            padding: "4px 8px",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={VB.muted} strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: VB.ink,
                fontSize: 11,
                fontFamily: VB.fontBody,
              }}
            />
          </div>
        </div>

        {/* Note List */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {filteredNotes.map((note) => {
            const isActive = note.id === activeId;
            const preview = note.content.replace(/\*+/g, "").slice(0, 60);
            return (
              <button
                key={note.id}
                onClick={() => { setActiveId(note.id); setEditing(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  border: "none",
                  borderBottom: `1px solid ${VB.border}`,
                  borderLeft: isActive ? `3px solid ${VB.gold}` : "3px solid transparent",
                  background: isActive ? "rgba(181,211,52,0.08)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.1s",
                  fontFamily: VB.fontBody,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(181,211,52,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{
                  color: isActive ? VB.ink : VB.ink2,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {note.title}
                </div>
                <div style={{
                  color: VB.muted,
                  fontSize: 10,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 4,
                }}>
                  {preview || "Empty note"}
                </div>
                <div style={{
                  color: VB.muted,
                  fontSize: 9,
                  fontFamily: VB.fontMono,
                  opacity: 0.7,
                }}>
                  {formatDate(note.updatedAt)}
                </div>
              </button>
            );
          })}
          {filteredNotes.length === 0 && (
            <div style={{
              padding: 20,
              textAlign: "center",
              color: VB.muted,
              fontSize: 12,
            }}>
              {search ? "No notes match your search" : "No notes yet"}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {activeNote ? (
          <>
            {/* Editor Toolbar */}
            <div style={{
              padding: "8px 16px",
              borderBottom: `1px solid ${VB.border}`,
              background: VB.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setEditing(!editing)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: `1px solid ${editing ? VB.gold : VB.border}`,
                    background: editing ? "rgba(181,211,52,0.15)" : "transparent",
                    color: editing ? VB.gold : VB.muted,
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: VB.fontBody,
                    transition: "all 0.15s",
                  }}
                >
                  {editing ? "Preview" : "Edit"}
                </button>
                <span style={{ color: VB.muted, fontSize: 10, fontFamily: VB.fontMono }}>
                  {formatDate(activeNote.updatedAt)}
                </span>
              </div>
              <button
                onClick={() => deleteNote(activeNote.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: `1px solid ${VB.border}`,
                  background: "transparent",
                  color: VB.muted,
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: VB.fontBody,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = VB.coral; e.currentTarget.style.borderColor = VB.coral; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = VB.muted; e.currentTarget.style.borderColor = VB.border; }}
              >
                Delete
              </button>
            </div>

            {/* Title */}
            <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
              {editing ? (
                <input
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${VB.border}`,
                    outline: "none",
                    color: VB.ink,
                    fontFamily: VB.fontHeader,
                    fontSize: 24,
                    letterSpacing: 1,
                    paddingBottom: 8,
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <h2 style={{
                  fontFamily: VB.fontHeader,
                  fontSize: 24,
                  color: VB.ink,
                  letterSpacing: 1,
                  margin: 0,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${VB.border}`,
                }}>
                  {activeNote.title}
                </h2>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
              {editing ? (
                <textarea
                  ref={editorRef}
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Start writing..."
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: VB.ink2,
                    fontFamily: VB.fontBody,
                    fontSize: 13,
                    lineHeight: 1.6,
                    resize: "none",
                    padding: 0,
                    boxSizing: "border-box",
                  }}
                  spellCheck={false}
                />
              ) : (
                <div style={{ color: VB.ink2, fontSize: 13 }}>
                  {renderFormattedText(activeNote.content)}
                </div>
              )}
            </div>

            {/* Status */}
            <div style={{
              padding: "4px 16px",
              borderTop: `1px solid ${VB.border}`,
              background: VB.bg2,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: VB.muted,
              fontFamily: VB.fontMono,
              flexShrink: 0,
            }}>
              <span>{activeNote.content.length} characters</span>
              <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            color: VB.muted,
          }}>
            <span style={{ fontSize: 40, opacity: 0.5 }}>📝</span>
            <span>Select a note or create a new one</span>
          </div>
        )}
      </div>
    </div>
  );
}
