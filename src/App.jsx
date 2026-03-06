import { useState, useEffect, useCallback, useRef } from "react";

// ── OS App imports (lazy-ish) ────────────────────────────────────────────────
import ProblemStatement from "./apps/ProblemStatement.jsx";
import FileManager from "./apps/FileManager.jsx";
import Terminal from "./apps/Terminal.jsx";
import Settings from "./apps/Settings.jsx";
import Notes from "./apps/Notes.jsx";
import Calendar from "./apps/Calendar.jsx";
import SystemMonitor from "./apps/SystemMonitor.jsx";
import Browser from "./apps/Browser.jsx";

// ── VB Design Tokens ─────────────────────────────────────────────────────────
const VB = {
  bg:"#091C1D", bg2:"#0d2526", surface:"#0f2d2e", surface2:"#132f30",
  border:"rgba(181,211,52,0.15)", border2:"rgba(181,211,52,0.3)",
  ink:"#f5f2ec", ink2:"#c8d4ce", muted:"#849BA6",
  gold:"#B5D334", gold2:"#cde84a", teal:"#0097A7", teal2:"#00b8cc",
  coral:"#E46962", purple:"#a855f7",
};

const uid = () => Math.random().toString(36).slice(2, 9);

// ── App Registry ─────────────────────────────────────────────────────────────
const APP_REGISTRY = [
  { id:"problem-statement", name:"Problem Statement", icon:"🎯", desc:"Partner discovery, RICE scoring, AI research & deal pipeline", category:"Work", defaultW:1200, defaultH:800 },
  { id:"file-manager",      name:"Files",             icon:"📁", desc:"Browse and manage virtual file system",                    category:"System", defaultW:800, defaultH:550 },
  { id:"terminal",           name:"Terminal",          icon:"⬛", desc:"Command line interface",                                   category:"System", defaultW:720, defaultH:480 },
  { id:"notes",              name:"Notes",             icon:"📝", desc:"Quick notes with markdown support",                        category:"Productivity", defaultW:700, defaultH:500 },
  { id:"calendar",           name:"Calendar",          icon:"📅", desc:"Schedule and manage events",                               category:"Productivity", defaultW:750, defaultH:580 },
  { id:"settings",           name:"Settings",          icon:"⚙️", desc:"System preferences and configuration",                    category:"System", defaultW:650, defaultH:500 },
  { id:"system-monitor",     name:"System Monitor",    icon:"📊", desc:"CPU, memory, network, and process monitoring",             category:"System", defaultW:700, defaultH:520 },
  { id:"browser",            name:"Browser",           icon:"🌐", desc:"Web browser",                                              category:"Internet", defaultW:900, defaultH:600 },
];

const APP_COMPONENTS = {
  "problem-statement": ProblemStatement,
  "file-manager": FileManager,
  "terminal": Terminal,
  "notes": Notes,
  "calendar": Calendar,
  "settings": Settings,
  "system-monitor": SystemMonitor,
  "browser": Browser,
};

// ── Global OS Styles ─────────────────────────────────────────────────────────
const OS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:#091C1D;}::-webkit-scrollbar-thumb{background:rgba(181,211,52,0.2);border-radius:2px;}
@keyframes fu{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@keyframes sp{to{transform:rotate(360deg);}}
@keyframes pu{0%,100%{opacity:1;}50%{opacity:.3;}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);}}
@keyframes desktopBoot{0%{opacity:0;filter:brightness(0);}60%{opacity:1;filter:brightness(.5);}100%{opacity:1;filter:brightness(1);}}
.fu{animation:fu .3s ease both;}
.card{background:#0f2d2e;border:1px solid rgba(181,211,52,0.12);border-radius:8px;transition:border-color .15s;}
.card:hover{border-color:rgba(181,211,52,0.24);}
.btn{border:none;cursor:pointer;font-family:'DM Sans',sans-serif;border-radius:5px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:7px 13px;transition:all .15s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;}
.bg{background:#B5D334;color:#091C1D;}.bg:hover:not(:disabled){background:#cde84a;transform:translateY(-1px);}
.bg:disabled{background:#1a3830;color:#4a6550;cursor:not-allowed;}
.bt{background:rgba(0,151,167,.12);color:#00b8cc;border:1px solid rgba(0,151,167,.25);}.bt:hover{background:rgba(0,151,167,.22);}
.bo{background:rgba(181,211,52,.07);color:#B5D334;border:1px solid rgba(181,211,52,.2);}.bo:hover{background:rgba(181,211,52,.14);}
.br{background:rgba(228,105,98,.1);color:#E46962;border:1px solid rgba(228,105,98,.25);}.br:hover{background:rgba(228,105,98,.2);}
.bv{background:rgba(168,85,247,.1);color:#a855f7;border:1px solid rgba(168,85,247,.25);}.bv:hover{background:rgba(168,85,247,.2);}
input,textarea,select{background:#132f30;border:1px solid rgba(181,211,52,.15);border-radius:5px;color:#f5f2ec;font-family:'DM Mono',monospace;font-size:11px;padding:7px 10px;width:100%;}
input:focus,textarea:focus,select:focus{outline:none;border-color:rgba(0,151,167,.5);box-shadow:0 0 0 3px rgba(0,151,167,.08);}
textarea{resize:vertical;}select option{background:#132f30;}
.os-window{position:absolute;display:flex;flex-direction:column;border-radius:10px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4);transition:box-shadow .2s;}
.os-window.focused{box-shadow:0 12px 48px rgba(181,211,52,.12),0 4px 16px rgba(0,0,0,.5);}
.os-window.maximized{border-radius:0!important;}
.stab{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:7px 13px;color:#849BA6;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;}
.stab.on{color:#B5D334;border-bottom-color:#B5D334;}.stab:hover:not(.on){color:#c8d4ce;}
.tab{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:11px 16px;color:#849BA6;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;}
.tab.on{color:#B5D334;border-bottom-color:#B5D334;}.tab:hover:not(.on){color:#c8d4ce;}
.pill{font-size:7px;font-family:'DM Mono',monospace;letter-spacing:.08em;padding:1px 5px;border-radius:10px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;}
body{overflow:hidden;margin:0;padding:0;}
`;

// ── Login Gate ────────────────────────────────────────────────────────────────
const isDev = import.meta.env.DEV;
let _tokenExp = 0;
const _parseCredential = (credential) => {
  const payload = JSON.parse(atob(credential.split(".")[1]));
  _tokenExp = (payload.exp || 0) * 1000;
  return payload;
};

function LoginGate({ onLogin }) {
  const btnRef = useRef(null);
  useEffect(() => {
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = _parseCredential(response.credential);
          if (payload.hd !== "venturebuilder.vc") {
            alert("Access restricted to venturebuilder.vc accounts");
            return;
          }
          onLogin({ email: payload.email, name: payload.name, picture: payload.picture, credential: response.credential });
        },
        hosted_domain: "venturebuilder.vc",
      });
      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, { theme: "filled_black", size: "large", text: "signin_with", shape: "rectangular" });
      }
    };
    if (window.google?.accounts?.id) { init(); return; }
    const iv = setInterval(() => { if (window.google?.accounts?.id) { clearInterval(iv); init(); } }, 100);
    return () => clearInterval(iv);
  }, [onLogin]);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:VB.bg,color:VB.ink}}>
      <style>{OS_STYLES}</style>
      <div style={{animation:"scaleIn .6s ease both"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{width:48,height:48,background:VB.gold,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#091C1D" strokeWidth="1.8" strokeLinejoin="round"/><path d="M11 2v13M3 7l8 4.5L19 7" stroke="#091C1D" strokeWidth="1.8"/></svg>
          </div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:VB.ink,lineHeight:1}}>VentureBuilder OS</div>
            <div style={{fontSize:10,color:VB.gold,fontFamily:"'DM Mono',monospace",marginTop:2}}>Partner Discovery Operating System</div>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <p style={{color:VB.muted,marginBottom:24,fontSize:13}}>Sign in with your venturebuilder.vc account</p>
          <div ref={btnRef} style={{display:"inline-block"}}/>
        </div>
      </div>
    </div>
  );
}

// ── Boot Screen ──────────────────────────────────────────────────────────────
function BootScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing kernel...");

  useEffect(() => {
    const steps = [
      [10, "Loading VentureBuilder kernel..."],
      [25, "Mounting virtual filesystem..."],
      [40, "Starting window manager..."],
      [55, "Loading Problem Statement module..."],
      [70, "Initializing AI subsystem..."],
      [85, "Starting network services..."],
      [95, "Loading desktop environment..."],
      [100, "Ready."],
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i][0]);
        setStatus(steps[i][1]);
        i++;
      } else {
        clearInterval(iv);
        setTimeout(onComplete, 300);
      }
    }, 280);
    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#050e0f",color:VB.ink}}>
      <style>{OS_STYLES}</style>
      <div style={{width:48,height:48,background:VB.gold,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>
        <svg width="24" height="24" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#091C1D" strokeWidth="1.8" strokeLinejoin="round"/><path d="M11 2v13M3 7l8 4.5L19 7" stroke="#091C1D" strokeWidth="1.8"/></svg>
      </div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:".06em",marginBottom:24}}>VentureBuilder OS</div>
      <div style={{width:300,height:3,background:VB.surface2,borderRadius:2,overflow:"hidden",marginBottom:12}}>
        <div style={{height:"100%",background:VB.gold,borderRadius:2,transition:"width .3s ease",width:`${progress}%`}}/>
      </div>
      <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{status}</div>
    </div>
  );
}

// ── Window Component ─────────────────────────────────────────────────────────
function Window({ win, focused, onFocus, onClose, onMinimize, onMaximize, onUpdate, children }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const handleMouseDownDrag = useCallback((e) => {
    if (win.maximized) return;
    e.preventDefault();
    onFocus(win.id);
    const startX = e.clientX - win.x;
    const startY = e.clientY - win.y;
    const onMove = (ev) => onUpdate(win.id, { x: ev.clientX - startX, y: ev.clientY - startY });
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [win, onFocus, onUpdate]);

  const handleMouseDownResize = useCallback((e) => {
    if (win.maximized) return;
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.w;
    const startH = win.h;
    const onMove = (ev) => onUpdate(win.id, { w: Math.max(400, startW + ev.clientX - startX), h: Math.max(300, startH + ev.clientY - startY) });
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [win, onUpdate]);

  if (win.minimized) return null;

  const style = win.maximized
    ? { top: 0, left: 0, width: "100%", height: "calc(100vh - 48px)", zIndex: win.zIndex, borderRadius: 0 }
    : { top: win.y, left: win.x, width: win.w, height: win.h, zIndex: win.zIndex };

  const app = APP_REGISTRY.find(a => a.id === win.appId);

  return (
    <div className={`os-window${focused ? " focused" : ""}${win.maximized ? " maximized" : ""}`}
      style={{ ...style, background: VB.bg, border: `1px solid ${focused ? VB.border2 : VB.border}`, position: "absolute" }}
      onMouseDown={() => onFocus(win.id)} ref={dragRef}>
      {/* Title Bar */}
      <div onMouseDown={handleMouseDownDrag} onDoubleClick={() => onMaximize(win.id)}
        style={{ height: 34, background: focused ? VB.bg2 : "#0a1e1f", borderBottom: `1px solid ${VB.border}`,
          display: "flex", alignItems: "center", padding: "0 10px", gap: 8, cursor: win.maximized ? "default" : "move", flexShrink: 0, userSelect: "none" }}>
        <span style={{ fontSize: 14 }}>{app?.icon || "📄"}</span>
        <span style={{ flex: 1, fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: focused ? VB.ink : VB.muted,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{win.title}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }}
            style={{ width: 14, height: 14, borderRadius: "50%", border: "none", background: "#f59e0b", cursor: "pointer", fontSize: 0 }} title="Minimize"/>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }}
            style={{ width: 14, height: 14, borderRadius: "50%", border: "none", background: "#22c55e", cursor: "pointer", fontSize: 0 }} title="Maximize"/>
          <button onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
            style={{ width: 14, height: 14, borderRadius: "50%", border: "none", background: VB.coral, cursor: "pointer", fontSize: 0 }} title="Close"/>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {children}
      </div>
      {/* Resize Handle */}
      {!win.maximized && (
        <div onMouseDown={handleMouseDownResize}
          style={{ position: "absolute", bottom: 0, right: 0, width: 16, height: 16, cursor: "nwse-resize" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{opacity:.3}}>
            <path d="M14 16L16 14M10 16L16 10M6 16L16 6" stroke={VB.muted} strokeWidth="1"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ── App Launcher ─────────────────────────────────────────────────────────────
function AppLauncher({ apps, onLaunch, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(filtered.map(a => a.category))];

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(5,14,15,.85)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:80,animation:"fadeIn .2s ease"}}>
      <div onClick={e => e.stopPropagation()} style={{width:"100%",maxWidth:700}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:VB.ink,marginBottom:8}}>Applications</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps..."
            style={{width:320,padding:"10px 16px",borderRadius:20,fontSize:12,background:VB.surface2,border:`1px solid ${VB.border}`,color:VB.ink,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}
            autoFocus />
        </div>
        {categories.map(cat => (
          <div key={cat} style={{marginBottom:24}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".14em",textTransform:"uppercase",color:VB.gold,marginBottom:10,paddingLeft:4}}>
              <span style={{width:12,height:1,background:VB.gold,display:"inline-block",marginRight:6,verticalAlign:"middle"}}/>{cat}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
              {filtered.filter(a => a.category === cat).map(app => (
                <div key={app.id} onClick={() => { onLaunch(app.id); onClose(); }}
                  style={{background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:10,padding:16,textAlign:"center",cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = VB.border2; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = VB.border; e.currentTarget.style.transform = ""; }}>
                  <div style={{fontSize:28,marginBottom:6}}>{app.icon}</div>
                  <div style={{fontSize:11,fontWeight:600,color:VB.ink,fontFamily:"'DM Sans',sans-serif"}}>{app.name}</div>
                  <div style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3,lineHeight:1.4}}>{app.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desktop ──────────────────────────────────────────────────────────────────
function DesktopArea({ apps, onLaunchApp }) {
  const [time, setTime] = useState(new Date());
  const [ctxMenu, setCtxMenu] = useState(null);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(iv);
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  // Desktop icons — show key apps
  const desktopApps = apps.filter(a => ["problem-statement","terminal","file-manager","notes","browser"].includes(a.id));

  return (
    <div onContextMenu={handleContextMenu} onClick={() => setCtxMenu(null)}
      style={{position:"absolute",inset:0,bottom:48,background:`radial-gradient(ellipse at 30% 20%, #0d2a2b 0%, ${VB.bg} 70%)`,overflow:"hidden"}}>
      {/* Subtle grid pattern */}
      <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:"linear-gradient(rgba(181,211,52,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(181,211,52,.5) 1px, transparent 1px)",backgroundSize:"60px 60px"}}/>

      {/* Clock widget */}
      <div style={{position:"absolute",top:24,right:32,textAlign:"right"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:56,color:VB.ink,lineHeight:1,opacity:.9,letterSpacing:".04em"}}>
          {time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}
        </div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:VB.muted,marginTop:4}}>
          {time.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
        </div>
      </div>

      {/* Desktop Icons */}
      <div style={{position:"absolute",top:24,left:24,display:"flex",flexDirection:"column",gap:8}}>
        {desktopApps.map(app => (
          <div key={app.id} onDoubleClick={() => onLaunchApp(app.id)}
            style={{width:80,padding:"12px 4px",borderRadius:8,textAlign:"center",cursor:"pointer",transition:"background .15s",userSelect:"none"}}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(181,211,52,.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{fontSize:32,marginBottom:4,filter:"drop-shadow(0 2px 4px rgba(0,0,0,.3))"}}>{app.icon}</div>
            <div style={{fontSize:9,color:VB.ink2,fontFamily:"'DM Sans',sans-serif",fontWeight:500,lineHeight:1.2,textShadow:"0 1px 3px rgba(0,0,0,.5)"}}>{app.name}</div>
          </div>
        ))}
      </div>

      {/* VB watermark */}
      <div style={{position:"absolute",bottom:64,right:32,opacity:.06}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:72,color:VB.gold,lineHeight:1}}>VB</div>
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <div onClick={e => e.stopPropagation()} style={{position:"fixed",top:ctxMenu.y,left:ctxMenu.x,background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:8,padding:4,minWidth:180,zIndex:10000,boxShadow:"0 8px 24px rgba(0,0,0,.4)",animation:"scaleIn .1s ease"}}>
          {[
            { label: "New Window", icon: "➕", action: () => onLaunchApp("terminal") },
            { label: "Problem Statement", icon: "🎯", action: () => onLaunchApp("problem-statement") },
            null,
            { label: "System Monitor", icon: "📊", action: () => onLaunchApp("system-monitor") },
            { label: "Settings", icon: "⚙️", action: () => onLaunchApp("settings") },
          ].map((item, i) => item === null
            ? <div key={i} style={{height:1,background:VB.border,margin:"4px 8px"}}/>
            : <div key={i} onClick={() => { item.action(); setCtxMenu(null); }}
                style={{padding:"8px 12px",fontSize:11,color:VB.ink,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",borderRadius:4,display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={e => e.currentTarget.style.background = VB.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{fontSize:13}}>{item.icon}</span>{item.label}
              </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Taskbar ──────────────────────────────────────────────────────────────────
function Taskbar({ windows, focusedId, onFocusWindow, onToggleMinimize, onLaunchApp, onToggleLauncher }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,height:48,background:"rgba(9,28,29,.96)",borderTop:`1px solid ${VB.border}`,backdropFilter:"blur(12px)",display:"flex",alignItems:"center",padding:"0 12px",gap:8,zIndex:9000}}>
      {/* App Launcher Button */}
      <div onClick={onToggleLauncher} title="Applications"
        style={{width:34,height:34,borderRadius:8,background:`${VB.gold}18`,border:`1px solid ${VB.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s",flexShrink:0}}
        onMouseEnter={e => { e.currentTarget.style.background = `${VB.gold}30`; e.currentTarget.style.borderColor = VB.border2; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${VB.gold}18`; e.currentTarget.style.borderColor = VB.border; }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill={VB.gold}/>
          <rect x="10" y="1" width="5" height="5" rx="1" fill={VB.gold}/>
          <rect x="1" y="10" width="5" height="5" rx="1" fill={VB.gold}/>
          <rect x="10" y="10" width="5" height="5" rx="1" fill={VB.gold}/>
        </svg>
      </div>

      <div style={{width:1,height:24,background:VB.border,flexShrink:0}}/>

      {/* VB Logo */}
      <div style={{display:"flex",alignItems:"center",gap:6,paddingRight:10,flexShrink:0}}>
        <div style={{width:22,height:22,background:VB.gold,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="11" height="11" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#091C1D" strokeWidth="2"/></svg>
        </div>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:VB.muted,letterSpacing:".06em"}}>VBOS</span>
      </div>

      <div style={{width:1,height:24,background:VB.border,flexShrink:0}}/>

      {/* Window Buttons */}
      <div style={{flex:1,display:"flex",alignItems:"center",gap:4,overflow:"auto",padding:"0 4px"}}>
        {windows.map(w => {
          const app = APP_REGISTRY.find(a => a.id === w.appId);
          const isFocused = w.id === focusedId && !w.minimized;
          return (
            <div key={w.id} onClick={() => w.minimized ? onToggleMinimize(w.id) : onFocusWindow(w.id)}
              style={{height:32,padding:"0 12px",borderRadius:6,display:"flex",alignItems:"center",gap:6,cursor:"pointer",flexShrink:0,
                background:isFocused ? `${VB.gold}18` : "transparent",
                border:`1px solid ${isFocused ? VB.border2 : "transparent"}`,
                transition:"all .15s"}}
              onMouseEnter={e => { if (!isFocused) e.currentTarget.style.background = VB.surface2; }}
              onMouseLeave={e => { if (!isFocused) e.currentTarget.style.background = "transparent"; }}>
              <span style={{fontSize:13}}>{app?.icon || "📄"}</span>
              <span style={{fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:isFocused ? VB.ink : VB.muted,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title}</span>
              {w.minimized && <span style={{width:4,height:4,borderRadius:"50%",background:VB.gold,flexShrink:0}}/>}
            </div>
          );
        })}
      </div>

      {/* System Tray */}
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0,paddingLeft:8}}>
        <span style={{fontSize:11,color:VB.muted}} title="Network">📶</span>
        <span style={{fontSize:11,color:VB.muted}} title="Battery">🔋</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:VB.ink2,lineHeight:1}}>
              {time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}
            </div>
            <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,lineHeight:1,marginTop:2}}>
              {time.toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN OS APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const nextZ = useRef(10);

  // ── Window Management ────────────────────────────────────────────────────
  const launchApp = useCallback((appId) => {
    const app = APP_REGISTRY.find(a => a.id === appId);
    if (!app) return;

    // If already open and not minimized, focus it
    const existing = windows.find(w => w.appId === appId && !w.minimized);
    if (existing) {
      setFocusedId(existing.id);
      setWindows(ws => ws.map(w => w.id === existing.id ? { ...w, zIndex: nextZ.current++ } : w));
      return;
    }

    // If minimized, restore it
    const minimized = windows.find(w => w.appId === appId && w.minimized);
    if (minimized) {
      setWindows(ws => ws.map(w => w.id === minimized.id ? { ...w, minimized: false, zIndex: nextZ.current++ } : w));
      setFocusedId(minimized.id);
      return;
    }

    const offset = (windows.length % 6) * 30;
    const newWin = {
      id: uid(),
      appId: app.id,
      title: app.name,
      x: 80 + offset,
      y: 40 + offset,
      w: app.defaultW,
      h: app.defaultH,
      minimized: false,
      maximized: app.id === "problem-statement",
      zIndex: nextZ.current++,
    };
    setWindows(ws => [...ws, newWin]);
    setFocusedId(newWin.id);
  }, [windows]);

  const closeWindow = useCallback((id) => {
    setWindows(ws => ws.filter(w => w.id !== id));
    setFocusedId(f => f === id ? null : f);
  }, []);

  const focusWindow = useCallback((id) => {
    setFocusedId(id);
    setWindows(ws => ws.map(w => w.id === id ? { ...w, zIndex: nextZ.current++ } : w));
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true } : w));
    setFocusedId(f => f === id ? null : f);
  }, []);

  const maximizeWindow = useCallback((id) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  }, []);

  const toggleMinimize = useCallback((id) => {
    setWindows(ws => ws.map(w => {
      if (w.id !== id) return w;
      if (w.minimized) return { ...w, minimized: false, zIndex: nextZ.current++ };
      return { ...w, minimized: true };
    }));
    setFocusedId(id);
  }, []);

  const updateWindow = useCallback((id, updates) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  // ── Auto-launch Problem Statement on first boot ──────────────────────────
  useEffect(() => {
    if (booted && windows.length === 0) {
      launchApp("problem-statement");
    }
  }, [booted]);

  // ── Render ────────────────────────────────────────────────────────────────
  // Auth gate (production only)
  if (!isDev && !user) return <LoginGate onLogin={setUser} />;

  // Boot sequence
  if (!booted) return <BootScreen onComplete={() => setBooted(true)} />;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:VB.bg,height:"100vh",color:VB.ink,overflow:"hidden",position:"relative"}}>
      <style>{OS_STYLES}</style>

      {/* Desktop Background */}
      <DesktopArea apps={APP_REGISTRY} onLaunchApp={launchApp} />

      {/* Windows */}
      {windows.map(w => {
        const AppComp = APP_COMPONENTS[w.appId];
        if (!AppComp) return null;
        return (
          <Window key={w.id} win={w} focused={w.id === focusedId}
            onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow}
            onMaximize={maximizeWindow} onUpdate={updateWindow}>
            <AppComp user={user} />
          </Window>
        );
      })}

      {/* Taskbar */}
      <Taskbar windows={windows} focusedId={focusedId}
        onFocusWindow={focusWindow} onToggleMinimize={toggleMinimize}
        onLaunchApp={launchApp} onToggleLauncher={() => setLauncherOpen(o => !o)} />

      {/* App Launcher Overlay */}
      {launcherOpen && <AppLauncher apps={APP_REGISTRY} onLaunch={launchApp} onClose={() => setLauncherOpen(false)} />}
    </div>
  );
}
