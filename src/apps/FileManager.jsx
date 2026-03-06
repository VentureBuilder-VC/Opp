import React, { useState, useCallback, useMemo } from "react";

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

const INITIAL_FS = {
  "/": {
    type: "dir",
    children: ["Documents", "Downloads", "Projects", "Shared"],
  },
  "/Documents": {
    type: "dir",
    children: ["NOV_Analysis_Q1.pdf", "Investment_Thesis.docx", "Board_Deck_2026.pptx", "Financial_Model_v3.xlsx", "Due_Diligence_Checklist.pdf"],
  },
  "/Downloads": {
    type: "dir",
    children: ["Market_Report_2026.pdf", "Competitor_Analysis.xlsx", "Logo_Assets.zip", "NDA_Template.docx"],
  },
  "/Projects": {
    type: "dir",
    children: ["Project_Alpha", "Project_Beta", "Project_Gamma"],
  },
  "/Projects/Project_Alpha": {
    type: "dir",
    children: ["README.md", "pitch_deck.pptx", "financials.xlsx", "team_bios.docx"],
  },
  "/Projects/Project_Beta": {
    type: "dir",
    children: ["proposal.pdf", "budget.xlsx", "timeline.md"],
  },
  "/Projects/Project_Gamma": {
    type: "dir",
    children: ["overview.md", "contracts.zip"],
  },
  "/Shared": {
    type: "dir",
    children: ["Deal_Pipeline.xlsx", "Portfolio_Overview.pdf", "Team_Contacts.csv", "Meeting_Notes_Q1.md", "VB_Brand_Guidelines.pdf"],
  },
};

const FILE_ICONS = {
  pdf: "📄", docx: "📝", xlsx: "📊", pptx: "📊", zip: "📦",
  md: "📋", csv: "📑", default: "📄", dir: "📁",
};

const FILE_SIZES = {
  "NOV_Analysis_Q1.pdf": "2.4 MB", "Investment_Thesis.docx": "890 KB",
  "Board_Deck_2026.pptx": "14.2 MB", "Financial_Model_v3.xlsx": "3.1 MB",
  "Due_Diligence_Checklist.pdf": "456 KB", "Market_Report_2026.pdf": "5.7 MB",
  "Competitor_Analysis.xlsx": "1.8 MB", "Logo_Assets.zip": "24.5 MB",
  "NDA_Template.docx": "124 KB", "Deal_Pipeline.xlsx": "2.9 MB",
  "Portfolio_Overview.pdf": "8.3 MB", "Team_Contacts.csv": "45 KB",
  "Meeting_Notes_Q1.md": "12 KB", "VB_Brand_Guidelines.pdf": "18.7 MB",
  "README.md": "4 KB", "pitch_deck.pptx": "9.2 MB", "financials.xlsx": "1.4 MB",
  "team_bios.docx": "340 KB", "proposal.pdf": "2.1 MB", "budget.xlsx": "890 KB",
  "timeline.md": "8 KB", "overview.md": "6 KB", "contracts.zip": "3.4 MB",
};

function getFileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function getFileSize(name) {
  return FILE_SIZES[name] || "—";
}

export default function FileManager() {
  const [fs, setFs] = useState(INITIAL_FS);
  const [currentPath, setCurrentPath] = useState("/");
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const currentDir = fs[currentPath] || { type: "dir", children: [] };
  const items = currentDir.children || [];

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter((name) => name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const breadcrumbs = useMemo(() => {
    if (currentPath === "/") return ["/"];
    const parts = currentPath.split("/").filter(Boolean);
    const crumbs = ["/"];
    let path = "";
    for (const p of parts) {
      path += "/" + p;
      crumbs.push(path);
    }
    return crumbs;
  }, [currentPath]);

  const navigateTo = useCallback((name) => {
    const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    if (fs[newPath] && fs[newPath].type === "dir") {
      setCurrentPath(newPath);
      setSelected(null);
      setSearch("");
    }
  }, [currentPath, fs]);

  const navigateBreadcrumb = useCallback((path) => {
    setCurrentPath(path);
    setSelected(null);
    setSearch("");
  }, []);

  const isDir = useCallback((name) => {
    const path = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    return fs[path] && fs[path].type === "dir";
  }, [currentPath, fs]);

  const handleDelete = useCallback((name) => {
    setFs((prev) => {
      const next = { ...prev };
      const dir = { ...next[currentPath] };
      dir.children = dir.children.filter((c) => c !== name);
      next[currentPath] = dir;
      const childPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
      delete next[childPath];
      return next;
    });
    setSelected(null);
  }, [currentPath]);

  const handleRename = useCallback((oldName) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setRenaming(null);
      return;
    }
    setFs((prev) => {
      const next = { ...prev };
      const dir = { ...next[currentPath] };
      dir.children = dir.children.map((c) => (c === oldName ? renameValue : c));
      next[currentPath] = dir;
      const oldPath = currentPath === "/" ? `/${oldName}` : `${currentPath}/${oldName}`;
      const newPath = currentPath === "/" ? `/${renameValue}` : `${currentPath}/${renameValue}`;
      if (next[oldPath]) {
        next[newPath] = next[oldPath];
        delete next[oldPath];
      }
      return next;
    });
    setRenaming(null);
  }, [currentPath, renameValue]);

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      setNewFolderMode(false);
      return;
    }
    setFs((prev) => {
      const next = { ...prev };
      const dir = { ...next[currentPath] };
      dir.children = [...dir.children, newFolderName];
      next[currentPath] = dir;
      const newPath = currentPath === "/" ? `/${newFolderName}` : `${currentPath}/${newFolderName}`;
      next[newPath] = { type: "dir", children: [] };
      return next;
    });
    setNewFolderMode(false);
    setNewFolderName("");
  }, [currentPath, newFolderName]);

  const toolbarBtn = {
    padding: "4px 10px",
    borderRadius: 4,
    border: `1px solid ${VB.border}`,
    background: "transparent",
    color: VB.ink2,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: VB.fontBody,
    transition: "all 0.15s",
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: VB.bg,
      color: VB.ink,
      fontFamily: VB.fontBody,
      fontSize: 13,
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderBottom: `1px solid ${VB.border}`,
        background: VB.bg2,
        flexShrink: 0,
      }}>
        <button
          onClick={() => {
            if (currentPath !== "/") {
              const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
              setCurrentPath(parent);
              setSelected(null);
            }
          }}
          style={{ ...toolbarBtn, opacity: currentPath === "/" ? 0.3 : 1 }}
          disabled={currentPath === "/"}
        >
          &#8592; Back
        </button>
        <button onClick={() => setNewFolderMode(true)} style={toolbarBtn}>+ New Folder</button>
        <div style={{ flex: 1 }} />
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: VB.surface,
          border: `1px solid ${VB.border}`,
          borderRadius: 4,
          padding: "2px 8px",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={VB.muted} strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: VB.ink,
              fontSize: 12,
              fontFamily: VB.fontBody,
              width: 120,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            onClick={() => setViewMode("list")}
            style={{ ...toolbarBtn, background: viewMode === "list" ? VB.surface2 : "transparent" }}
          >
            ☰
          </button>
          <button
            onClick={() => setViewMode("grid")}
            style={{ ...toolbarBtn, background: viewMode === "grid" ? VB.surface2 : "transparent" }}
          >
            ⊞
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 12px",
        borderBottom: `1px solid ${VB.border}`,
        background: VB.surface,
        flexShrink: 0,
        flexWrap: "wrap",
      }}>
        {breadcrumbs.map((crumb, i) => {
          const label = crumb === "/" ? "Home" : crumb.split("/").pop();
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {i > 0 && <span style={{ color: VB.muted, fontSize: 10 }}>/</span>}
              <button
                onClick={() => navigateBreadcrumb(crumb)}
                style={{
                  background: "none",
                  border: "none",
                  color: isLast ? VB.gold : VB.ink2,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: VB.fontMono,
                  padding: "2px 4px",
                  borderRadius: 3,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { if (!isLast) e.target.style.color = VB.gold; }}
                onMouseLeave={(e) => { if (!isLast) e.target.style.color = VB.ink2; }}
              >
                {label}
              </button>
            </span>
          );
        })}
      </div>

      {/* File List / Grid */}
      <div style={{
        flex: 1,
        overflow: "auto",
        padding: viewMode === "grid" ? 12 : 0,
      }}>
        {newFolderMode && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: VB.surface2,
            borderBottom: `1px solid ${VB.border}`,
          }}>
            <span>📁</span>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setNewFolderMode(false); setNewFolderName(""); }
              }}
              onBlur={handleCreateFolder}
              placeholder="Folder name..."
              style={{
                background: VB.bg,
                border: `1px solid ${VB.gold}`,
                borderRadius: 3,
                color: VB.ink,
                padding: "2px 6px",
                fontSize: 12,
                fontFamily: VB.fontBody,
                outline: "none",
              }}
            />
          </div>
        )}

        {viewMode === "list" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${VB.border}` }}>
                <th style={{ textAlign: "left", padding: "6px 12px", color: VB.muted, fontSize: 11, fontWeight: 500 }}>Name</th>
                <th style={{ textAlign: "left", padding: "6px 12px", color: VB.muted, fontSize: 11, fontWeight: 500, width: 80 }}>Size</th>
                <th style={{ textAlign: "right", padding: "6px 12px", color: VB.muted, fontSize: 11, fontWeight: 500, width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((name) => {
                const dir = isDir(name);
                const isSel = selected === name;
                return (
                  <tr
                    key={name}
                    onClick={() => setSelected(name)}
                    onDoubleClick={() => dir && navigateTo(name)}
                    style={{
                      background: isSel ? "rgba(181,211,52,0.08)" : "transparent",
                      cursor: "pointer",
                      borderBottom: `1px solid ${VB.border}`,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(181,211,52,0.04)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{dir ? "📁" : getFileIcon(name)}</span>
                      {renaming === name ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(name);
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          onBlur={() => handleRename(name)}
                          style={{
                            background: VB.bg,
                            border: `1px solid ${VB.gold}`,
                            borderRadius: 3,
                            color: VB.ink,
                            padding: "1px 4px",
                            fontSize: 12,
                            fontFamily: VB.fontBody,
                            outline: "none",
                          }}
                        />
                      ) : (
                        <span style={{ color: dir ? VB.gold : VB.ink }}>{name}</span>
                      )}
                    </td>
                    <td style={{ padding: "6px 12px", color: VB.muted, fontSize: 11 }}>
                      {dir ? "—" : getFileSize(name)}
                    </td>
                    <td style={{ padding: "6px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRenaming(name); setRenameValue(name); }}
                          style={{
                            background: "none", border: "none", color: VB.muted,
                            cursor: "pointer", fontSize: 11, padding: "2px 6px",
                            borderRadius: 3, transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => { e.target.style.color = VB.teal; }}
                          onMouseLeave={(e) => { e.target.style.color = VB.muted; }}
                        >
                          Rename
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(name); }}
                          style={{
                            background: "none", border: "none", color: VB.muted,
                            cursor: "pointer", fontSize: 11, padding: "2px 6px",
                            borderRadius: 3, transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => { e.target.style.color = VB.coral; }}
                          onMouseLeave={(e) => { e.target.style.color = VB.muted; }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 12,
          }}>
            {filteredItems.map((name) => {
              const dir = isDir(name);
              const isSel = selected === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  onDoubleClick={() => dir && navigateTo(name)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 12,
                    borderRadius: 8,
                    border: isSel ? `1px solid ${VB.gold}` : `1px solid transparent`,
                    background: isSel ? "rgba(181,211,52,0.08)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: VB.fontBody,
                    color: VB.ink,
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(181,211,52,0.04)"; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = isSel ? "rgba(181,211,52,0.08)" : "transparent"; }}
                >
                  <span style={{ fontSize: 32 }}>{dir ? "📁" : getFileIcon(name)}</span>
                  <span style={{
                    fontSize: 11,
                    textAlign: "center",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                    color: dir ? VB.gold : VB.ink2,
                  }}>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div style={{
            textAlign: "center",
            color: VB.muted,
            padding: 40,
            fontSize: 13,
          }}>
            {search ? `No files matching "${search}"` : "This folder is empty"}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: "4px 12px",
        borderTop: `1px solid ${VB.border}`,
        background: VB.bg2,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: VB.muted,
        flexShrink: 0,
      }}>
        <span>{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}</span>
        <span style={{ fontFamily: VB.fontMono }}>{currentPath}</span>
      </div>
    </div>
  );
}
