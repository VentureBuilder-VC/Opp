import { useState, useRef } from "react";

const VB = {
  bg:"#091C1D", bg2:"#0d2526", surface:"#0f2d2e", surface2:"#132f30",
  border:"rgba(181,211,52,0.15)", border2:"rgba(181,211,52,0.3)",
  ink:"#f5f2ec", ink2:"#c8d4ce", muted:"#849BA6",
  gold:"#B5D334", gold2:"#cde84a", teal:"#0097A7", teal2:"#00b8cc",
  coral:"#E46962", purple:"#a855f7",
};

const BOOKMARKS = [
  { name: "VentureBuilder", url: "https://venturebuilder.fund" },
  { name: "GitHub", url: "https://github.com" },
  { name: "LinkedIn", url: "https://linkedin.com" },
  { name: "Crunchbase", url: "https://crunchbase.com" },
  { name: "PitchBook", url: "https://pitchbook.com" },
];

const HOME_PAGE = `
<div style="font-family:'DM Sans',Helvetica,sans-serif;background:#091C1D;color:#f5f2ec;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;">
  <div style="text-align:center;">
    <div style="width:64px;height:64px;background:#B5D334;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
      <svg width="32" height="32" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#091C1D" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 2v13M3 7l8 4.5L19 7" stroke="#091C1D" stroke-width="1.8"/></svg>
    </div>
    <h1 style="font-family:'Bebas Neue',sans-serif;font-size:36px;margin:0 0 8px;letter-spacing:.04em;">VentureBuilder Browser</h1>
    <p style="color:#849BA6;font-size:13px;margin:0 0 32px;">Navigate the web from within VBOS</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:480px;">
      <a href="https://venturebuilder.fund" style="background:#0f2d2e;border:1px solid rgba(181,211,52,.15);border-radius:10px;padding:20px;text-align:center;text-decoration:none;color:#f5f2ec;transition:border-color .15s;">
        <div style="font-size:24px;margin-bottom:6px;">🏢</div>
        <div style="font-size:11px;font-weight:600;">VentureBuilder</div>
      </a>
      <a href="https://github.com" style="background:#0f2d2e;border:1px solid rgba(181,211,52,.15);border-radius:10px;padding:20px;text-align:center;text-decoration:none;color:#f5f2ec;">
        <div style="font-size:24px;margin-bottom:6px;">💻</div>
        <div style="font-size:11px;font-weight:600;">GitHub</div>
      </a>
      <a href="https://linkedin.com" style="background:#0f2d2e;border:1px solid rgba(181,211,52,.15);border-radius:10px;padding:20px;text-align:center;text-decoration:none;color:#f5f2ec;">
        <div style="font-size:24px;margin-bottom:6px;">👥</div>
        <div style="font-size:11px;font-weight:600;">LinkedIn</div>
      </a>
    </div>
  </div>
</div>
`;

export default function Browser() {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHome, setShowHome] = useState(true);
  const iframeRef = useRef(null);

  const navigate = (targetUrl) => {
    let finalUrl = targetUrl;
    if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;
    setCurrentUrl(finalUrl);
    setUrl(finalUrl);
    setShowHome(false);
    const newHistory = [...history.slice(0, historyIndex + 1), finalUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) navigate(url.trim());
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setUrl(history[newIdx]);
      setShowHome(false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setUrl(history[newIdx]);
    }
  };

  const goHome = () => {
    setShowHome(true);
    setCurrentUrl("");
    setUrl("");
  };

  const refresh = () => {
    if (iframeRef.current && currentUrl) {
      iframeRef.current.src = currentUrl;
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: VB.bg, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Toolbar */}
      <div style={{ padding: "6px 10px", borderBottom: `1px solid ${VB.border}`, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, background: VB.bg2 }}>
        {/* Nav + URL bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={goBack} disabled={historyIndex <= 0}
            style={{ background: "none", border: "none", color: historyIndex > 0 ? VB.ink : VB.muted, cursor: historyIndex > 0 ? "pointer" : "default", fontSize: 14, padding: "2px 6px" }}>◀</button>
          <button onClick={goForward} disabled={historyIndex >= history.length - 1}
            style={{ background: "none", border: "none", color: historyIndex < history.length - 1 ? VB.ink : VB.muted, cursor: historyIndex < history.length - 1 ? "pointer" : "default", fontSize: 14, padding: "2px 6px" }}>▶</button>
          <button onClick={refresh}
            style={{ background: "none", border: "none", color: VB.ink, cursor: "pointer", fontSize: 13, padding: "2px 6px" }}>↻</button>
          <button onClick={goHome}
            style={{ background: "none", border: "none", color: VB.ink, cursor: "pointer", fontSize: 13, padding: "2px 6px" }}>🏠</button>
          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL..."
              style={{ width: "100%", padding: "6px 12px", borderRadius: 16, fontSize: 11, background: VB.surface, border: `1px solid ${VB.border}`, color: VB.ink, fontFamily: "'DM Mono',monospace" }} />
          </form>
        </div>
        {/* Bookmarks bar */}
        <div style={{ display: "flex", gap: 4, paddingLeft: 4 }}>
          {BOOKMARKS.map(b => (
            <button key={b.name} onClick={() => navigate(b.url)}
              style={{ background: "none", border: "none", color: VB.muted, cursor: "pointer", fontSize: 9, fontFamily: "'DM Sans',sans-serif", padding: "2px 8px", borderRadius: 4, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = VB.gold}
              onMouseLeave={e => e.currentTarget.style.color = VB.muted}>
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: "relative" }}>
        {showHome ? (
          <div style={{ height: "100%", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: HOME_PAGE }} />
        ) : (
          <iframe ref={iframeRef} src={currentUrl} title="Browser"
            style={{ width: "100%", height: "100%", border: "none", background: "white" }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        )}
      </div>
    </div>
  );
}
