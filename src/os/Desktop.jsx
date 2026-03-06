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

const TASKBAR_H = 48;

function ClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{
      position: "absolute",
      top: 24,
      right: 28,
      textAlign: "right",
      pointerEvents: "none",
      userSelect: "none",
    }}>
      <div style={{
        fontFamily: VB.fontHeader,
        fontSize: 56,
        color: VB.ink,
        letterSpacing: 3,
        lineHeight: 1,
        textShadow: "0 2px 16px rgba(0,0,0,0.5)",
        opacity: 0.85,
      }}>
        {timeStr}
      </div>
      <div style={{
        fontFamily: VB.fontBody,
        fontSize: 15,
        color: VB.ink2,
        marginTop: 4,
        letterSpacing: 0.5,
        textShadow: "0 1px 8px rgba(0,0,0,0.5)",
        opacity: 0.7,
      }}>
        {dateStr}
      </div>
    </div>
  );
}

function ContextMenu({ x, y, onAction, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { label: "New Window", icon: "🪟", action: "new_window" },
    { label: "Refresh", icon: "🔄", action: "refresh" },
    { type: "divider" },
    { label: "Settings", icon: "⚙️", action: "settings" },
    { label: "About", icon: "ℹ️", action: "about" },
  ];

  return (
    <div ref={ref} style={{
      position: "fixed",
      left: x,
      top: y,
      zIndex: 999999,
      background: VB.surface,
      border: `1px solid ${VB.border2}`,
      borderRadius: 8,
      padding: "6px 0",
      minWidth: 180,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      fontFamily: VB.fontBody,
      animation: "fadeIn 0.12s ease-out",
    }}>
      {items.map((item, i) => {
        if (item.type === "divider") {
          return <div key={i} style={{ height: 1, background: VB.border, margin: "4px 8px" }} />;
        }
        return (
          <button
            key={i}
            onClick={() => { onAction(item.action); onClose(); }}
            onMouseEnter={(e) => { e.target.style.background = `rgba(181,211,52,0.1)`; }}
            onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              color: VB.ink,
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: VB.fontBody,
              transition: "background 0.1s",
            }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Desktop({ apps, onLaunchApp }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const lastClick = useRef({});

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextAction = useCallback((action) => {
    if (action === "new_window" && apps.length > 0) {
      onLaunchApp(apps[0].id);
    } else if (action === "refresh") {
      window.location.reload();
    } else if (action === "settings") {
      onLaunchApp("settings");
    } else if (action === "about") {
      onLaunchApp("settings");
    }
  }, [apps, onLaunchApp]);

  const handleIconClick = useCallback((appId) => {
    const now = Date.now();
    const last = lastClick.current[appId] || 0;
    if (now - last < 400) {
      onLaunchApp(appId);
      lastClick.current[appId] = 0;
    } else {
      setSelectedIcon(appId);
      lastClick.current[appId] = now;
    }
  }, [onLaunchApp]);

  const handleDesktopClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
      setContextMenu(null);
    }
  }, []);

  const desktopApps = (apps || []).slice(0, 8);

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      style={{
        position: "fixed",
        inset: 0,
        bottom: TASKBAR_H,
        background: VB.bg,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(0,151,167,0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(181,211,52,0.04) 0%, transparent 50%),
          linear-gradient(rgba(181,211,52,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(181,211,52,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100%, 100%, 40px 40px, 40px 40px",
        overflow: "hidden",
        fontFamily: VB.fontBody,
      }}
    >
      {/* Desktop Icons */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        gap: 8,
        padding: "20px 16px",
        maxHeight: `calc(100vh - ${TASKBAR_H + 40}px)`,
        alignContent: "flex-start",
      }}>
        {desktopApps.map((app) => {
          const isSel = selectedIcon === app.id;
          return (
            <button
              key={app.id}
              onClick={() => handleIconClick(app.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "10px 8px",
                width: 82,
                borderRadius: 8,
                border: isSel ? `1px solid ${VB.gold}` : "1px solid transparent",
                background: isSel ? "rgba(181,211,52,0.1)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: VB.fontBody,
              }}
              onMouseEnter={(e) => {
                if (!isSel) e.currentTarget.style.background = "rgba(181,211,52,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!isSel) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${VB.surface2} 0%, ${VB.bg2} 100%)`,
                border: `1px solid ${VB.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}>
                {app.icon}
              </div>
              <span style={{
                color: VB.ink2,
                fontSize: 10,
                fontWeight: 500,
                textAlign: "center",
                lineHeight: 1.2,
                wordBreak: "break-word",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                maxWidth: 72,
              }}>
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clock Widget */}
      <ClockWidget />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
