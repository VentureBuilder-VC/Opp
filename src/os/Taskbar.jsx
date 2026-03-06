import React, { useState, useEffect, useCallback } from "react";

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

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const hours = time.getHours();
  const mins = String(time.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return (
    <span style={{ fontFamily: VB.fontMono, fontSize: 12, color: VB.ink2 }}>
      {h12}:{mins} {ampm}
    </span>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={VB.muted} strokeWidth="2" strokeLinecap="round">
      <path d="M5 12.55a11 11 0 0114 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <circle cx="12" cy="20" r="1" fill={VB.gold} stroke="none" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 24 16" fill="none" stroke={VB.muted} strokeWidth="1.5">
      <rect x="1" y="3" width="18" height="10" rx="2" />
      <rect x="3" y="5" width="12" height="6" rx="1" fill={VB.gold} stroke="none" />
      <path d="M21 7v2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={VB.muted} strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

export default function Taskbar({
  windows, focusedId, onFocusWindow, onToggleMinimize,
  apps, onLaunchApp, onToggleLauncher, launcherOpen
}) {
  const [hoveredWin, setHoveredWin] = useState(null);
  const [hoveredLauncher, setHoveredLauncher] = useState(false);

  const maxZ = windows.reduce((m, w) => Math.max(m, w.zIndex || 0), 0);

  return (
    <div style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: TASKBAR_H,
      background: `linear-gradient(180deg, ${VB.bg2} 0%, ${VB.bg} 100%)`,
      borderTop: `1px solid ${VB.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      zIndex: 99999,
      fontFamily: VB.fontBody,
      backdropFilter: "blur(12px)",
      gap: 8,
    }}>
      {/* Left: Logo + Launcher */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {/* VB Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: `linear-gradient(135deg, ${VB.gold} 0%, ${VB.teal} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: VB.fontHeader, fontSize: 15, color: VB.bg,
            fontWeight: 700,
          }}>
            VB
          </div>
          <span style={{
            fontFamily: VB.fontHeader, fontSize: 14, color: VB.ink,
            letterSpacing: 1.5, lineHeight: 1,
            display: "flex", flexDirection: "column",
          }}>
            <span>VENTUREBUILDER</span>
            <span style={{ fontSize: 9, color: VB.muted, letterSpacing: 2 }}>OS</span>
          </span>
        </div>

        {/* App Launcher Button */}
        <button
          onClick={onToggleLauncher}
          onMouseEnter={() => setHoveredLauncher(true)}
          onMouseLeave={() => setHoveredLauncher(false)}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: launcherOpen
              ? VB.gold
              : hoveredLauncher ? VB.surface2 : "transparent",
            border: `1px solid ${launcherOpen ? VB.gold : VB.border2}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          title="App Launcher"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill={launcherOpen ? VB.bg : VB.gold}>
            <rect x="1" y="1" width="5" height="5" rx="1" />
            <rect x="10" y="1" width="5" height="5" rx="1" />
            <rect x="1" y="10" width="5" height="5" rx="1" />
            <rect x="10" y="10" width="5" height="5" rx="1" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: VB.border, flexShrink: 0 }} />

      {/* Center: Open Windows */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 4,
        overflow: "hidden",
        padding: "0 4px",
      }}>
        {windows.map((win) => {
          const isFocused = win.zIndex === maxZ && !win.minimized;
          const isHovered = hoveredWin === win.id;
          return (
            <button
              key={win.id}
              onClick={() => {
                if (win.minimized) {
                  onToggleMinimize(win.id);
                } else {
                  onFocusWindow(win.id);
                }
              }}
              onMouseEnter={() => setHoveredWin(win.id)}
              onMouseLeave={() => setHoveredWin(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                height: 34,
                borderRadius: 6,
                border: "none",
                background: isFocused
                  ? `rgba(181,211,52,0.15)`
                  : isHovered
                    ? `rgba(181,211,52,0.08)`
                    : "transparent",
                cursor: "pointer",
                color: isFocused ? VB.ink : VB.muted,
                fontFamily: VB.fontBody,
                fontSize: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 180,
                transition: "all 0.15s",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 14 }}>{win.icon || "\uD83D\uDCBB"}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{win.title}</span>
              {isFocused && (
                <div style={{
                  position: "absolute",
                  bottom: 0, left: "25%", right: "25%",
                  height: 2,
                  borderRadius: 1,
                  background: VB.gold,
                }} />
              )}
              {win.minimized && (
                <div style={{
                  position: "absolute",
                  bottom: 0, left: "40%", right: "40%",
                  height: 2,
                  borderRadius: 1,
                  background: VB.muted,
                  opacity: 0.5,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: VB.border, flexShrink: 0 }} />

      {/* Right: System Tray */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <WifiIcon />
        <BatteryIcon />
        <BellIcon />
        <div style={{ width: 1, height: 20, background: VB.border }} />
        <Clock />
      </div>
    </div>
  );
}
