import React, { useState, useCallback } from "react";

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

const ACCENT_COLORS = [
  { name: "Gold", value: "#B5D334" },
  { name: "Teal", value: "#0097A7" },
  { name: "Coral", value: "#E46962" },
  { name: "Purple", value: "#a855f7" },
  { name: "Lime", value: "#cde84a" },
  { name: "Cyan", value: "#00b8cc" },
];

const WALLPAPERS = [
  { name: "Grid (Default)", id: "grid", preview: VB.bg },
  { name: "Gradient Dark", id: "gradient-dark", preview: "linear-gradient(135deg, #091C1D, #0f2d2e)" },
  { name: "Gradient Teal", id: "gradient-teal", preview: "linear-gradient(135deg, #091C1D, #0097A7)" },
  { name: "Gradient Gold", id: "gradient-gold", preview: "linear-gradient(135deg, #091C1D, #3a4a10)" },
  { name: "Solid Dark", id: "solid-dark", preview: "#0a0a0a" },
  { name: "Solid Surface", id: "solid-surface", preview: "#0f2d2e" },
];

const SECTIONS = [
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "display", label: "Display", icon: "🖥️" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "account", label: "Account", icon: "👤" },
  { id: "about", label: "About", icon: "ℹ️" },
];

function Card({ title, children }) {
  return (
    <div style={{
      background: VB.surface,
      border: `1px solid ${VB.border}`,
      borderRadius: 10,
      padding: 20,
      marginBottom: 16,
    }}>
      {title && (
        <h3 style={{
          fontFamily: VB.fontHeader,
          fontSize: 18,
          color: VB.gold,
          letterSpacing: 1,
          marginBottom: 16,
          marginTop: 0,
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
    }}>
      <span style={{ color: VB.ink2, fontSize: 13 }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: checked ? VB.gold : VB.bg2,
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: checked ? VB.bg : VB.muted,
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          transition: "left 0.2s, background 0.2s",
        }} />
      </button>
    </div>
  );
}

export default function Settings({ user }) {
  const [section, setSection] = useState("appearance");
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#B5D334");
  const [wallpaper, setWallpaper] = useState("grid");
  const [notifSound, setNotifSound] = useState(true);
  const [notifBanner, setNotifBanner] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifDeals, setNotifDeals] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);

  const renderSection = useCallback(() => {
    switch (section) {
      case "appearance":
        return (
          <>
            <Card title="Theme">
              <div style={{ display: "flex", gap: 12 }}>
                {["dark", "light"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      borderRadius: 8,
                      border: `2px solid ${theme === t ? VB.gold : VB.border}`,
                      background: t === "dark" ? VB.bg : "#f5f2ec",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 4,
                      background: t === "dark"
                        ? `linear-gradient(${VB.bg}, ${VB.surface})`
                        : "linear-gradient(#fff, #e8e6e0)",
                      marginBottom: 8,
                      border: `1px solid ${t === "dark" ? VB.border : "#ddd"}`,
                    }} />
                    <span style={{
                      color: t === "dark" ? VB.ink : "#333",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}>
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Accent Color">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: c.value,
                      border: accentColor === c.value ? `3px solid ${VB.ink}` : `2px solid transparent`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      position: "relative",
                    }}
                    title={c.name}
                  >
                    {accentColor === c.value && (
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: VB.bg,
                        fontSize: 16,
                        fontWeight: 700,
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 8, color: VB.muted, fontSize: 11 }}>
                Selected: {ACCENT_COLORS.find((c) => c.value === accentColor)?.name || accentColor}
              </div>
            </Card>
          </>
        );

      case "display":
        return (
          <Card title="Wallpaper">
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}>
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => setWallpaper(wp.id)}
                  style={{
                    padding: 0,
                    borderRadius: 8,
                    border: wallpaper === wp.id ? `2px solid ${VB.gold}` : `2px solid ${VB.border}`,
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    background: "none",
                  }}
                >
                  <div style={{
                    width: "100%",
                    height: 60,
                    background: wp.preview,
                  }} />
                  <div style={{
                    padding: "6px 8px",
                    background: VB.bg2,
                    color: wallpaper === wp.id ? VB.gold : VB.ink2,
                    fontSize: 10,
                    textAlign: "center",
                    fontFamily: VB.fontBody,
                  }}>
                    {wp.name}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        );

      case "notifications":
        return (
          <>
            <Card title="General">
              <Toggle label="Sound notifications" checked={notifSound} onChange={setNotifSound} />
              <Toggle label="Banner notifications" checked={notifBanner} onChange={setNotifBanner} />
              <Toggle label="Email notifications" checked={notifEmail} onChange={setNotifEmail} />
            </Card>
            <Card title="Categories">
              <Toggle label="Deal updates" checked={notifDeals} onChange={setNotifDeals} />
              <Toggle label="System alerts" checked={notifSystem} onChange={setNotifSystem} />
            </Card>
          </>
        );

      case "account":
        return (
          <Card title="Account Information">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${VB.gold} 0%, ${VB.teal} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: VB.fontHeader,
                fontSize: 24,
                color: VB.bg,
              }}>
                {(user?.name || "VB")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: VB.ink, fontSize: 16, fontWeight: 600 }}>
                  {user?.name || "VB Operator"}
                </div>
                <div style={{ color: VB.muted, fontSize: 12, marginTop: 2 }}>
                  {user?.email || "operator@venturebuilder.fund"}
                </div>
                <div style={{
                  marginTop: 6,
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(181,211,52,0.15)",
                  color: VB.gold,
                  fontSize: 10,
                  fontWeight: 600,
                }}>
                  ADMIN
                </div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${VB.border}`, paddingTop: 16 }}>
              {[
                { label: "Organization", value: "VentureBuilder Fund" },
                { label: "Role", value: "Operating Partner" },
                { label: "Member since", value: "January 2024" },
                { label: "Last login", value: new Date().toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${VB.border}`,
                }}>
                  <span style={{ color: VB.muted, fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: VB.ink2, fontSize: 12 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        );

      case "about":
        return (
          <>
            <Card title="System Information">
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${VB.gold} 0%, ${VB.teal} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: VB.fontHeader,
                  fontSize: 20,
                  color: VB.bg,
                  fontWeight: 700,
                }}>
                  VB
                </div>
                <div>
                  <div style={{
                    fontFamily: VB.fontHeader,
                    fontSize: 22,
                    color: VB.ink,
                    letterSpacing: 1,
                  }}>
                    VENTUREBUILDER OS
                  </div>
                  <div style={{ color: VB.muted, fontSize: 12, marginTop: 2 }}>
                    Version 2.0.0 (Build 2026.03.06)
                  </div>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${VB.border}`, paddingTop: 12 }}>
                {[
                  { label: "Kernel", value: "VB-Kernel 6.1.0" },
                  { label: "Architecture", value: "x86_64" },
                  { label: "Desktop", value: "VB Desktop Environment" },
                  { label: "Window Manager", value: "VB WM 2.0" },
                  { label: "Shell", value: "vbsh 1.0" },
                  { label: "Runtime", value: "React 18+" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                  }}>
                    <span style={{ color: VB.muted, fontSize: 12, fontFamily: VB.fontMono }}>{item.label}</span>
                    <span style={{ color: VB.ink2, fontSize: 12, fontFamily: VB.fontMono }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Legal">
              <p style={{ color: VB.muted, fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                VentureBuilder OS is proprietary software developed by VentureBuilder Fund.
                All rights reserved. This software is provided for authorized use only.
              </p>
              <div style={{ marginTop: 12 }}>
                <span style={{ color: VB.teal, fontSize: 11, fontFamily: VB.fontMono }}>
                  venturebuilder.fund
                </span>
              </div>
            </Card>
          </>
        );

      default:
        return null;
    }
  }, [section, theme, accentColor, wallpaper, notifSound, notifBanner, notifEmail, notifDeals, notifSystem, user]);

  return (
    <div style={{
      height: "100%",
      display: "flex",
      background: VB.bg,
      color: VB.ink,
      fontFamily: VB.fontBody,
      fontSize: 13,
    }}>
      {/* Sidebar */}
      <div style={{
        width: 200,
        borderRight: `1px solid ${VB.border}`,
        background: VB.bg2,
        padding: "12px 0",
        flexShrink: 0,
        overflow: "auto",
      }}>
        <div style={{
          padding: "8px 16px 16px",
          fontFamily: VB.fontHeader,
          fontSize: 18,
          color: VB.gold,
          letterSpacing: 1,
        }}>
          SETTINGS
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 16px",
              border: "none",
              background: section === s.id ? "rgba(181,211,52,0.1)" : "transparent",
              color: section === s.id ? VB.ink : VB.ink2,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: VB.fontBody,
              textAlign: "left",
              transition: "all 0.15s",
              borderLeft: section === s.id ? `3px solid ${VB.gold}` : "3px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (section !== s.id) e.currentTarget.style.background = "rgba(181,211,52,0.05)";
            }}
            onMouseLeave={(e) => {
              if (section !== s.id) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: "auto",
        padding: 24,
      }}>
        <h2 style={{
          fontFamily: VB.fontHeader,
          fontSize: 28,
          color: VB.ink,
          letterSpacing: 1.5,
          marginBottom: 20,
          marginTop: 0,
        }}>
          {SECTIONS.find((s) => s.id === section)?.label.toUpperCase()}
        </h2>
        {renderSection()}
      </div>
    </div>
  );
}
