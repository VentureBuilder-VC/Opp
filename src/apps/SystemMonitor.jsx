import { useState, useEffect, useRef } from "react";

const VB = {
  bg:"#091C1D", bg2:"#0d2526", surface:"#0f2d2e", surface2:"#132f30",
  border:"rgba(181,211,52,0.15)", border2:"rgba(181,211,52,0.3)",
  ink:"#f5f2ec", ink2:"#c8d4ce", muted:"#849BA6",
  gold:"#B5D334", gold2:"#cde84a", teal:"#0097A7", teal2:"#00b8cc",
  coral:"#E46962", purple:"#a855f7",
};

function Gauge({ label, value, color, unit = "%" }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ background: VB.surface, border: `1px solid ${VB.border}`, borderRadius: 8, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase", color: VB.muted }}>{label}</span>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color, lineHeight: 1 }}>{Math.round(value)}{unit}</span>
      </div>
      <div style={{ height: 6, background: VB.bg, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

function MiniChart({ data, color, height = 40 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 200;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * height}`).join(" ");
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={`0,${height} ${points} ${w},${height}`} fill={`${color}15`} stroke="none" />
    </svg>
  );
}

export default function SystemMonitor() {
  const [cpu, setCpu] = useState(35);
  const [mem, setMem] = useState(62);
  const [net, setNet] = useState(12);
  const [disk, setDisk] = useState(45);
  const [cpuHistory, setCpuH] = useState([35]);
  const [memHistory, setMemH] = useState([62]);
  const [netHistory, setNetH] = useState([12]);
  const [uptime, setUptime] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      const newCpu = Math.min(100, Math.max(5, cpu + (Math.random() - 0.48) * 15));
      const newMem = Math.min(95, Math.max(30, mem + (Math.random() - 0.5) * 5));
      const newNet = Math.min(100, Math.max(0, net + (Math.random() - 0.45) * 20));
      setCpu(newCpu);
      setMem(newMem);
      setNet(newNet);
      setDisk(d => Math.min(90, Math.max(30, d + (Math.random() - 0.5) * 2)));
      setCpuH(h => [...h.slice(-30), newCpu]);
      setMemH(h => [...h.slice(-30), newMem]);
      setNetH(h => [...h.slice(-30), newNet]);
      setUptime(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1500);
    return () => clearInterval(iv);
  }, [cpu, mem, net]);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  const processes = [
    { name: "vbos-kernel", pid: 1, cpu: 2.1, mem: 45, status: "running" },
    { name: "window-manager", pid: 12, cpu: cpu * 0.15, mem: 128, status: "running" },
    { name: "problem-statement", pid: 45, cpu: cpu * 0.35, mem: 312, status: "running" },
    { name: "ai-subsystem", pid: 78, cpu: cpu * 0.12, mem: 256, status: "running" },
    { name: "network-service", pid: 99, cpu: net * 0.08, mem: 64, status: "running" },
    { name: "supabase-sync", pid: 112, cpu: 0.8, mem: 32, status: "idle" },
    { name: "intel-fetcher", pid: 134, cpu: net * 0.05, mem: 48, status: "idle" },
    { name: "research-cache", pid: 156, cpu: 0.3, mem: 96, status: "running" },
    { name: "desktop-renderer", pid: 200, cpu: cpu * 0.08, mem: 84, status: "running" },
  ];

  return (
    <div style={{ height: "100%", overflow: "auto", background: VB.bg, padding: 16, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: VB.ink }}>System Monitor</div>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: VB.muted }}>VentureBuilder OS · Uptime: {formatUptime(uptime)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pu 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#22c55e" }}>All systems operational</span>
        </div>
      </div>

      {/* Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        <Gauge label="CPU" value={cpu} color={cpu > 80 ? VB.coral : cpu > 60 ? "#f59e0b" : VB.gold} />
        <Gauge label="Memory" value={mem} color={mem > 80 ? VB.coral : VB.teal2} />
        <Gauge label="Network" value={net} color={VB.purple} unit=" Mb/s" />
        <Gauge label="Disk" value={disk} color={disk > 80 ? VB.coral : VB.gold2} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "CPU History", data: cpuHistory, color: VB.gold },
          { label: "Memory History", data: memHistory, color: VB.teal2 },
          { label: "Network I/O", data: netHistory, color: VB.purple },
        ].map(c => (
          <div key={c.label} style={{ background: VB.surface, border: `1px solid ${VB.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase", color: VB.muted, marginBottom: 8 }}>{c.label}</div>
            <MiniChart data={c.data} color={c.color} />
          </div>
        ))}
      </div>

      {/* Process List */}
      <div style={{ background: VB.surface, border: `1px solid ${VB.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${VB.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase", color: VB.gold }}>
            <span style={{ width: 10, height: 1, background: VB.gold, display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />Processes
          </span>
          <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: VB.muted }}>{processes.length} active</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: VB.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>
              {["PID", "Name", "CPU %", "Mem (MB)", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 14px", borderBottom: `1px solid ${VB.border}`, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processes.map(p => (
              <tr key={p.pid} style={{ fontSize: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = VB.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "6px 14px", color: VB.muted, fontFamily: "'DM Mono',monospace", fontSize: 9 }}>{p.pid}</td>
                <td style={{ padding: "6px 14px", color: VB.ink, fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: "6px 14px", color: p.cpu > 20 ? VB.coral : VB.ink2, fontFamily: "'DM Mono',monospace", fontSize: 9 }}>{p.cpu.toFixed(1)}</td>
                <td style={{ padding: "6px 14px", color: VB.ink2, fontFamily: "'DM Mono',monospace", fontSize: 9 }}>{p.mem}</td>
                <td style={{ padding: "6px 14px" }}>
                  <span style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", padding: "2px 6px", borderRadius: 3,
                    background: p.status === "running" ? "rgba(34,197,94,.1)" : "rgba(132,155,166,.08)",
                    color: p.status === "running" ? "#22c55e" : VB.muted }}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
