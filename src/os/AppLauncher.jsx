import React, { useState, useEffect, useRef, useCallback } from "react";

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

export default function AppLauncher({ apps, onLaunch, onClose }) {
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [hoveredApp, setHoveredApp] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    if (searchRef.current) searchRef.current.focus();
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const filtered = apps.filter((app) => {
    const q = search.toLowerCase();
    return app.name.toLowerCase().includes(q) || (app.description || "").toLowerCase().includes(q);
  });

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background: visible ? "rgba(9,28,29,0.85)" : "rgba(9,28,29,0)",
        backdropFilter: visible ? "blur(20px)" : "blur(0px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        fontFamily: VB.fontBody,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          padding: "0 24px",
          transform: visible ? "translateY(0)" : "translateY(30px)",
          opacity: visible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Search Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: VB.surface,
          border: `1px solid ${VB.border2}`,
          borderRadius: 12,
          padding: "12px 20px",
          marginBottom: 32,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={VB.muted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: VB.ink,
              fontFamily: VB.fontBody,
              fontSize: 16,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none", border: "none", color: VB.muted,
                cursor: "pointer", fontSize: 16, padding: 0,
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* App Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 16,
        }}>
          {filtered.map((app) => {
            const isHovered = hoveredApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => { onLaunch(app.id); handleClose(); }}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 8px",
                  borderRadius: 12,
                  border: "none",
                  background: isHovered ? `rgba(181,211,52,0.1)` : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: isHovered ? "scale(1.08)" : "scale(1)",
                }}
              >
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${VB.surface2} 0%, ${VB.bg2} 100%)`,
                  border: `1px solid ${isHovered ? VB.gold : VB.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  transition: "border-color 0.2s",
                  boxShadow: isHovered ? `0 4px 16px rgba(181,211,52,0.15)` : "none",
                }}>
                  {app.icon}
                </div>
                <span style={{
                  color: isHovered ? VB.ink : VB.ink2,
                  fontSize: 11,
                  fontWeight: 500,
                  textAlign: "center",
                  lineHeight: 1.2,
                  transition: "color 0.2s",
                }}>
                  {app.name}
                </span>
                {app.description && (
                  <span style={{
                    color: VB.muted,
                    fontSize: 9,
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: 80,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {app.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: "center",
            color: VB.muted,
            padding: 40,
            fontSize: 14,
          }}>
            No apps found for "{search}"
          </div>
        )}

        {/* Hint */}
        <div style={{
          textAlign: "center",
          marginTop: 32,
          color: VB.muted,
          fontSize: 11,
          fontFamily: VB.fontMono,
        }}>
          Press <span style={{ color: VB.gold }}>ESC</span> or click outside to close
        </div>
      </div>
    </div>
  );
}
