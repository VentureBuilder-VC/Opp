import { useState, useEffect, useRef } from "react";

const VB = {
  bg:"#091C1D", bg2:"#0d2526", surface:"#0f2d2e", surface2:"#132f30",
  border:"rgba(181,211,52,0.15)", border2:"rgba(181,211,52,0.3)",
  ink:"#f5f2ec", ink2:"#c8d4ce", muted:"#849BA6",
  gold:"#B5D334", gold2:"#cde84a", teal:"#0097A7", teal2:"#00b8cc",
  coral:"#E46962", purple:"#a855f7",
};

const uid = () => Math.random().toString(36).slice(2, 9);

const STORAGE_KEY = "vb_os_notes";

const loadNotes = () => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
};

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const editorRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {} }, [notes]);

  const active = notes.find(n => n.id === activeId);
  const filtered = notes.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()));

  const addNote = () => {
    const n = { id: uid(), title: "Untitled Note", body: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), color: VB.gold };
    setNotes(ns => [n, ...ns]);
    setActiveId(n.id);
  };

  const updateNote = (field, value) => {
    setNotes(ns => ns.map(n => n.id === activeId ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id) => {
    setNotes(ns => ns.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  const colors = [VB.gold, VB.teal2, VB.coral, VB.purple, "#22c55e", "#f59e0b"];

  return (
    <div style={{ display: "flex", height: "100%", background: VB.bg, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: `1px solid ${VB.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: 12, borderBottom: `1px solid ${VB.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: VB.ink }}>Notes</span>
            <button onClick={addNote} style={{ background: VB.gold, color: VB.bg, border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ width: "100%", padding: "6px 10px", borderRadius: 6, fontSize: 10, background: VB.surface2, border: `1px solid ${VB.border}`, color: VB.ink, fontFamily: "'DM Mono',monospace" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 6 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: VB.muted, fontSize: 11 }}>
              {notes.length === 0 ? "No notes yet. Click + to create one." : "No matching notes."}
            </div>
          )}
          {filtered.map(n => (
            <div key={n.id} onClick={() => setActiveId(n.id)}
              style={{ padding: "10px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 2, borderLeft: `3px solid ${n.color || VB.gold}`,
                background: n.id === activeId ? VB.surface2 : "transparent", transition: "background .15s" }}
              onMouseEnter={e => { if (n.id !== activeId) e.currentTarget.style.background = VB.surface; }}
              onMouseLeave={e => { if (n.id !== activeId) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: VB.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title || "Untitled"}</div>
              <div style={{ fontSize: 9, color: VB.muted, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{formatDate(n.updatedAt)}</div>
              <div style={{ fontSize: 9, color: VB.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body.slice(0, 60) || "Empty note"}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px", borderTop: `1px solid ${VB.border}`, fontSize: 9, color: VB.muted, fontFamily: "'DM Mono',monospace" }}>
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {active ? (
          <>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${VB.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <input value={active.title} onChange={e => updateNote("title", e.target.value)}
                style={{ flex: 1, fontSize: 16, fontFamily: "'Bebas Neue',sans-serif", fontWeight: 400, letterSpacing: ".04em", color: VB.ink, background: "transparent", border: "none", padding: 0 }} />
              <div style={{ display: "flex", gap: 4 }}>
                {colors.map(c => (
                  <div key={c} onClick={() => updateNote("color", c)}
                    style={{ width: 14, height: 14, borderRadius: "50%", background: c, cursor: "pointer", border: active.color === c ? "2px solid white" : "2px solid transparent" }} />
                ))}
              </div>
              <button onClick={() => deleteNote(active.id)}
                style={{ background: "rgba(228,105,98,.1)", color: VB.coral, border: `1px solid rgba(228,105,98,.25)`, borderRadius: 4, padding: "4px 10px", fontSize: 9, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Delete
              </button>
            </div>
            <div style={{ padding: "4px 16px", fontSize: 8, color: VB.muted, fontFamily: "'DM Mono',monospace", borderBottom: `1px solid ${VB.border}` }}>
              Created {formatDate(active.createdAt)} · Updated {formatDate(active.updatedAt)}
            </div>
            <textarea ref={editorRef} value={active.body} onChange={e => updateNote("body", e.target.value)}
              placeholder="Start typing..."
              style={{ flex: 1, padding: 16, fontSize: 13, lineHeight: 1.7, color: VB.ink, background: VB.bg, border: "none", resize: "none", fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: VB.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: .5 }}>📝</div>
            <div style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Select a note or create a new one</div>
          </div>
        )}
      </div>
    </div>
  );
}
