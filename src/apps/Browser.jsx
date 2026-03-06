import React, { useState, useCallback, useRef } from "react";

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

const BOOKMARKS = [
  { name: "VentureBuilder", url: "https://venturebuilder.fund" },
  { name: "GitHub", url: "https://github.com" },
  { name: "LinkedIn", url: "https://linkedin.com" },
];

const QUICK_LINKS = [
  { icon: "\uD83C\uDFE2", name: "VentureBuilder", url: "https://venturebuilder.fund", desc: "Fund Homepage" },
  { icon: "\uD83D\uDCBB", name: "GitHub", url: "https://github.com", desc: "Code Repository" },
  { icon: "\uD83D\uDD17", name: "LinkedIn", url: "https://linkedin.com", desc: "Professional Network" },
  { icon: "\uD83D\uDCCA", name: "Crunchbase", url: "https://crunchbase.com", desc: "Market Data" },
  { icon: "\uD83D\uDCF0", name: "TechCrunch", url: "https://techcrunch.com", desc: "Tech News" },
  { icon: "\uD83D\uDCC8", name: "Bloomberg", url: "https://bloomberg.com", desc: "Finance News" },
];

function HomePage({ onNavigate }) {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: VB.bg,
      fontFamily: VB.fontBody,
      padding: 40,
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: `linear-gradient(135deg, ${VB.gold} 0%, ${VB.teal} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: VB.fontHeader,
        fontSize: 32,
        color: VB.bg,
        fontWeight: 700,
        marginBottom: 24,
        boxShadow: "0 8px 32px rgba(181,211,52,0.2)",
      }}>
        VB
      </div>
      <h1 style={{
        fontFamily: VB.fontHeader,
        fontSize: 36,
        color: VB.ink,
        letterSpacing: 3,
        margin: "0 0 8px",
      }}>
        VENTUREBUILDER
      </h1>
      <p style={{
        color: VB.muted,
        fontSize: 14,
        margin: "0 0 32px",
      }}>
        Welcome to VB Browser
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        maxWidth: 480,
        width: "100%",
      }}>
        {QUICK_LINKS.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.url)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: 16,
              borderRadius: 10,
              border: `1px solid ${VB.border}`,
              background: VB.surface,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: VB.fontBody,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = VB.border2;
              e.currentTarget.style.background = VB.surface2;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = VB.border;
              e.currentTarget.style.background = VB.surface;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span style={{ color: VB.ink, fontSize: 12, fontWeight: 600 }}>{item.name}</span>
            <span style={{ color: VB.muted, fontSize: 10 }}>{item.desc}</span>
          </button>
        ))}
      </div>

      <div style={{
        marginTop: 40,
        color: VB.muted,
        fontSize: 11,
        fontFamily: VB.fontMono,
      }}>
        VB Browser v1.0 | VentureBuilder OS
      </div>
    </div>
  );
}

export default function Browser() {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const iframeRef = useRef(null);

  const navigate = useCallback((targetUrl) => {
    if (!targetUrl || !targetUrl.trim()) return;
    let finalUrl = targetUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    setUrl(finalUrl);
    setCurrentUrl(finalUrl);
    setShowHome(false);
    setLoading(true);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIdx + 1);
      newHistory.push(finalUrl);
      return newHistory;
    });
    setHistoryIdx((prev) => prev + 1);
    setTimeout(() => setLoading(false), 1500);
  }, [historyIdx]);

  const goBack = useCallback(() => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      const prevUrl = history[newIdx];
      setUrl(prevUrl);
      setCurrentUrl(prevUrl);
      setShowHome(false);
      setLoading(true);
      setTimeout(() => setLoading(false), 800);
    } else {
      setShowHome(true);
      setUrl("");
      setCurrentUrl("");
    }
  }, [historyIdx, history]);

  const goForward = useCallback(() => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      const nextUrl = history[newIdx];
      setUrl(nextUrl);
      setCurrentUrl(nextUrl);
      setLoading(true);
      setTimeout(() => setLoading(false), 800);
    }
  }, [historyIdx, history]);

  const refresh = useCallback(() => {
    if (currentUrl && iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = currentUrl;
      setTimeout(() => setLoading(false), 1000);
    }
  }, [currentUrl]);

  const goHome = useCallback(() => {
    setShowHome(true);
    setUrl("");
    setCurrentUrl("");
  }, []);

  const navBtn = {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    color: VB.ink2,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    flexShrink: 0,
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: VB.bg,
      color: VB.ink,
      fontFamily: VB.fontBody,
    }}>
      {/* Navigation Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 8px",
        borderBottom: `1px solid ${VB.border}`,
        background: VB.bg2,
        flexShrink: 0,
      }}>
        <button
          onClick={goBack}
          style={{ ...navBtn, opacity: historyIdx > 0 || !showHome ? 1 : 0.3 }}
          disabled={historyIdx <= 0 && showHome}
          title="Back"
          onMouseEnter={(e) => { e.currentTarget.style.background = VB.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          &#8592;
        </button>
        <button
          onClick={goForward}
          style={{ ...navBtn, opacity: historyIdx < history.length - 1 ? 1 : 0.3 }}
          disabled={historyIdx >= history.length - 1}
          title="Forward"
          onMouseEnter={(e) => { e.currentTarget.style.background = VB.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          &#8594;
        </button>
        <button
          onClick={refresh}
          style={navBtn}
          title="Refresh"
          onMouseEnter={(e) => { e.currentTarget.style.background = VB.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          &#8635;
        </button>
        <button
          onClick={goHome}
          style={navBtn}
          title="Home"
          onMouseEnter={(e) => { e.currentTarget.style.background = VB.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          &#8962;
        </button>

        {/* URL Bar */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: VB.surface,
          border: `1px solid ${VB.border}`,
          borderRadius: 6,
          padding: "4px 10px",
          marginLeft: 4,
        }}>
          {currentUrl && !showHome && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={VB.teal} strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(url);
            }}
            placeholder="Enter URL or search..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: VB.ink,
              fontSize: 12,
              fontFamily: VB.fontMono,
            }}
          />
          {loading && (
            <div style={{
              width: 14,
              height: 14,
              border: `2px solid ${VB.border}`,
              borderTop: `2px solid ${VB.gold}`,
              borderRadius: "50%",
              animation: "vb-browser-spin 0.8s linear infinite",
            }} />
          )}
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "3px 8px",
        borderBottom: `1px solid ${VB.border}`,
        background: VB.surface,
        flexShrink: 0,
      }}>
        <span style={{ color: VB.muted, fontSize: 10, marginRight: 4 }}>Bookmarks:</span>
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => navigate(bm.url)}
            style={{
              padding: "3px 8px",
              borderRadius: 4,
              border: "none",
              background: "transparent",
              color: VB.ink2,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: VB.fontBody,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(181,211,52,0.08)";
              e.currentTarget.style.color = VB.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = VB.ink2;
            }}
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Loading Bar */}
        {loading && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 10,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: `linear-gradient(90deg, ${VB.gold}, ${VB.teal}, ${VB.gold})`,
              animation: "vb-browser-loading 1.2s ease-in-out infinite",
              width: "40%",
            }} />
          </div>
        )}

        {showHome ? (
          <HomePage onNavigate={navigate} />
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title="VB Browser"
            onLoad={() => setLoading(false)}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#fff",
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: "3px 12px",
        borderTop: `1px solid ${VB.border}`,
        background: VB.bg2,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10,
        color: VB.muted,
        fontFamily: VB.fontMono,
        flexShrink: 0,
      }}>
        <span>{showHome ? "VB Home" : currentUrl}</span>
        <span>{loading ? "Loading..." : "Ready"}</span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes vb-browser-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vb-browser-loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
