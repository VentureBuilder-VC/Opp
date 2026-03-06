import React, { useState, useRef, useCallback, useEffect } from "react";

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

const TASKBAR_H = 48;

export default function WindowManager({ windows, onUpdate, onClose, onFocus, onMinimize, onMaximize, renderApp }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const handleMouseDown = useCallback((e, win) => {
    if (win.maximized) return;
    e.preventDefault();
    onFocus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = win.x;
    const origY = win.y;
    dragRef.current = { id: win.id, startX, startY, origX, origY };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onUpdate(dragRef.current.id, {
        x: dragRef.current.origX + dx,
        y: Math.max(0, dragRef.current.origY + dy),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [onUpdate, onFocus]);

  const handleResizeDown = useCallback((e, win) => {
    if (win.maximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = win.w;
    const origH = win.h;
    resizeRef.current = { id: win.id, startX, startY, origW, origH };

    const onMove = (ev) => {
      if (!resizeRef.current) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;
      onUpdate(resizeRef.current.id, {
        w: Math.max(320, resizeRef.current.origW + dx),
        h: Math.max(200, resizeRef.current.origH + dy),
      });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [onUpdate, onFocus]);

  const maxZ = windows.reduce((m, w) => Math.max(m, w.zIndex || 0), 0);

  return (
    <>
      {windows.map((win) => {
        if (win.minimized) return null;
        const isFocused = win.zIndex === maxZ && !win.minimized;
        const isMax = win.maximized;
        const style = {
          position: "fixed",
          left: isMax ? 0 : win.x,
          top: isMax ? 0 : win.y,
          width: isMax ? "100vw" : win.w,
          height: isMax ? `calc(100vh - ${TASKBAR_H}px)` : win.h,
          zIndex: win.zIndex || 1,
          display: "flex",
          flexDirection: "column",
          background: VB.surface,
          border: `1px solid ${isFocused ? VB.gold : VB.border}`,
          borderRadius: isMax ? 0 : 8,
          boxShadow: isFocused
            ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${VB.border2}`
            : "0 4px 16px rgba(0,0,0,0.3)",
          overflow: "hidden",
          transition: isMax ? "all 0.25s cubic-bezier(.4,0,.2,1)" : "box-shadow 0.2s",
          fontFamily: VB.fontBody,
          userSelect: dragRef.current || resizeRef.current ? "none" : "auto",
        };

        const titleBarStyle = {
          display: "flex",
          alignItems: "center",
          height: 36,
          minHeight: 36,
          background: isFocused ? VB.bg2 : VB.bg,
          borderBottom: `1px solid ${VB.border}`,
          padding: "0 8px",
          cursor: isMax ? "default" : "grab",
          gap: 8,
          flexShrink: 0,
        };

        const btnBase = {
          width: 14, height: 14, borderRadius: "50%",
          border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, lineHeight: 1, color: VB.bg,
          transition: "transform 0.15s, filter 0.15s",
        };

        return (
          <div
            key={win.id}
            style={style}
            onMouseDown={() => onFocus(win.id)}
          >
            {/* Title Bar */}
            <div
              style={titleBarStyle}
              onMouseDown={(e) => handleMouseDown(e, win)}
              onDoubleClick={() => onMaximize(win.id)}
            >
              {/* Window Controls */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
                  style={{ ...btnBase, background: VB.coral }}
                  title="Close"
                  onMouseEnter={(e) => { e.target.style.transform = "scale(1.2)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                >
                  &times;
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }}
                  style={{ ...btnBase, background: VB.gold }}
                  title="Minimize"
                  onMouseEnter={(e) => { e.target.style.transform = "scale(1.2)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                >
                  &#8211;
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }}
                  style={{ ...btnBase, background: VB.teal }}
                  title={isMax ? "Restore" : "Maximize"}
                  onMouseEnter={(e) => { e.target.style.transform = "scale(1.2)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                >
                  {isMax ? "\u29C9" : "\u25A1"}
                </button>
              </div>

              {/* Icon + Title */}
              <span style={{ fontSize: 14, marginRight: 4 }}>{win.icon || "\uD83D\uDCBB"}</span>
              <span style={{
                color: isFocused ? VB.ink : VB.muted,
                fontSize: 13,
                fontFamily: VB.fontBody,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}>
                {win.title}
              </span>
            </div>

            {/* Content Area */}
            <div style={{
              flex: 1,
              overflow: "auto",
              background: VB.surface,
              position: "relative",
            }}>
              {renderApp(win)}
            </div>

            {/* Resize Handle */}
            {!isMax && (
              <div
                onMouseDown={(e) => handleResizeDown(e, win)}
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 18,
                  height: 18,
                  cursor: "nwse-resize",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: 0.4 }}>
                  <path d="M9 1L1 9M9 4L4 9M9 7L7 9" stroke={VB.gold} strokeWidth="1.2" fill="none" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
