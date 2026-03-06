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

const PROCESSES = [
  { pid: 1, name: "vb-kernel", cpu: 0.3, mem: 124, status: "running" },
  { pid: 42, name: "window-manager", cpu: 1.2, mem: 256, status: "running" },
  { pid: 87, name: "deal-pipeline-svc", cpu: 4.5, mem: 512, status: "running" },
  { pid: 112, name: "portfolio-tracker", cpu: 2.1, mem: 384, status: "running" },
  { pid: 156, name: "risk-engine", cpu: 8.3, mem: 768, status: "running" },
  { pid: 201, name: "ml-scoring-api", cpu: 12.7, mem: 1024, status: "running" },
  { pid: 234, name: "notification-daemon", cpu: 0.5, mem: 64, status: "running" },
  { pid: 267, name: "data-sync-worker", cpu: 3.8, mem: 448, status: "running" },
  { pid: 299, name: "auth-service", cpu: 0.8, mem: 96, status: "running" },
  { pid: 341, name: "analytics-engine", cpu: 6.2, mem: 640, status: "running" },
  { pid: 378, name: "cache-manager", cpu: 1.5, mem: 192, status: "running" },
  { pid: 410, name: "log-aggregator", cpu: 0.9, mem: 128, status: "running" },
];

function GaugeBar({ label, value, max, color, unit }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
      }}>
        <span style={{ color: VB.ink2, fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontSize: 12, fontFamily: VB.fontMono }}>
          {typeof value === "number" ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div style={{
        height: 8,
        background: VB.bg,
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${VB.border}`,
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: pct > 80 ? VB.coral : pct > 60 ? VB.gold : color,
          borderRadius: 4,
          transition: "width 0.5s ease, background 0.3s",
        }} />
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 2,
        fontSize: 9,
        color: VB.muted,
        fontFamily: VB.fontMono,
      }}>
        <span>0</span>
        <span>{pct.toFixed(0)}%</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function MiniChart({ data, color, height = 40 }) {
  const max = Math.max(...data, 1);

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 1,
      height,
      padding: "0 2px",
    }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: color,
            borderRadius: "2px 2px 0 0",
            opacity: 0.5 + (i / data.length) * 0.5,
            transition: "height 0.3s ease",
            minHeight: 1,
          }}
        />
      ))}
    </div>
  );
}

export default function SystemMonitor() {
  const [cpu, setCpu] = useState(32);
  const [mem, setMem] = useState(12.4);
  const [disk, setDisk] = useState(67);
  const [netUp, setNetUp] = useState(2.3);
  const [netDown, setNetDown] = useState(14.7);
  const [cpuHistory, setCpuHistory] = useState(() => Array.from({ length: 30 }, () => Math.random() * 60 + 15));
  const [memHistory, setMemHistory] = useState(() => Array.from({ length: 30 }, () => Math.random() * 10 + 8));
  const [netHistory, setNetHistory] = useState(() => Array.from({ length: 30 }, () => Math.random() * 20 + 2));
  const [uptime, setUptime] = useState(0);
  const [processes, setProcesses] = useState(PROCESSES);
  const [tab, setTab] = useState("overview");

  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newCpu = Math.max(5, Math.min(95, cpu + (Math.random() - 0.5) * 15));
      const newMem = Math.max(4, Math.min(30, mem + (Math.random() - 0.5) * 2));
      const newNetUp = Math.max(0.1, netUp + (Math.random() - 0.5) * 1.5);
      const newNetDown = Math.max(0.5, netDown + (Math.random() - 0.5) * 5);

      setCpu(newCpu);
      setMem(newMem);
      setNetUp(newNetUp);
      setNetDown(newNetDown);

      setCpuHistory((prev) => [...prev.slice(1), newCpu]);
      setMemHistory((prev) => [...prev.slice(1), newMem]);
      setNetHistory((prev) => [...prev.slice(1), newNetDown]);

      setUptime(Math.floor((Date.now() - startTime.current) / 1000));

      setProcesses((prev) => prev.map((p) => ({
        ...p,
        cpu: Math.max(0, p.cpu + (Math.random() - 0.5) * 2),
        mem: Math.max(32, p.mem + Math.floor((Math.random() - 0.5) * 32)),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [cpu, mem, netUp, netDown]);

  const formatUptime = useCallback((secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  }, []);

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
      {/* Header */}
      <div style={{
        padding: "8px 16px",
        borderBottom: `1px solid ${VB.border}`,
        background: VB.bg2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["overview", "processes"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                border: "none",
                background: tab === t ? "rgba(181,211,52,0.15)" : "transparent",
                color: tab === t ? VB.gold : VB.muted,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: VB.fontBody,
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: VB.muted,
          fontSize: 11,
          fontFamily: VB.fontMono,
        }}>
          <span style={{ color: VB.teal }}>UPTIME</span>
          <span>{formatUptime(uptime)}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {tab === "overview" ? (
          <>
            {/* Stats Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 20,
            }}>
              {[
                { label: "CPU", value: `${cpu.toFixed(0)}%`, color: VB.gold },
                { label: "Memory", value: `${mem.toFixed(1)} GB`, color: VB.teal },
                { label: "Disk", value: `${disk}%`, color: VB.purple },
                { label: "Network", value: `${netDown.toFixed(1)} Mb/s`, color: VB.teal2 },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: VB.surface,
                  border: `1px solid ${VB.border}`,
                  borderRadius: 8,
                  padding: 14,
                  textAlign: "center",
                }}>
                  <div style={{ color: VB.muted, fontSize: 10, fontWeight: 600, marginBottom: 4, letterSpacing: 1 }}>
                    {stat.label.toUpperCase()}
                  </div>
                  <div style={{
                    fontFamily: VB.fontHeader,
                    fontSize: 28,
                    color: stat.color,
                    letterSpacing: 1,
                  }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Gauges + Network */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}>
              <div style={{
                background: VB.surface,
                border: `1px solid ${VB.border}`,
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{
                  fontFamily: VB.fontHeader,
                  fontSize: 14,
                  color: VB.gold,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}>
                  RESOURCE USAGE
                </div>
                <GaugeBar label="CPU" value={cpu} max={100} color={VB.gold} unit="%" />
                <GaugeBar label="Memory" value={mem} max={32} color={VB.teal} unit=" GB" />
                <GaugeBar label="Disk" value={disk} max={100} color={VB.purple} unit="%" />
              </div>

              <div style={{
                background: VB.surface,
                border: `1px solid ${VB.border}`,
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{
                  fontFamily: VB.fontHeader,
                  fontSize: 14,
                  color: VB.gold,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}>
                  NETWORK I/O
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: VB.ink2, fontSize: 11 }}>Download</span>
                    <span style={{ color: VB.teal, fontSize: 11, fontFamily: VB.fontMono }}>{netDown.toFixed(1)} Mb/s</span>
                  </div>
                  <MiniChart data={netHistory} color={VB.teal} height={36} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: VB.ink2, fontSize: 11 }}>Upload</span>
                    <span style={{ color: VB.gold, fontSize: 11, fontFamily: VB.fontMono }}>{netUp.toFixed(1)} Mb/s</span>
                  </div>
                  <MiniChart data={netHistory.map((v) => v * 0.2)} color={VB.gold} height={36} />
                </div>
              </div>
            </div>

            {/* History Charts */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}>
              <div style={{
                background: VB.surface,
                border: `1px solid ${VB.border}`,
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: VB.fontHeader, fontSize: 14, color: VB.gold, letterSpacing: 1 }}>CPU HISTORY</span>
                  <span style={{ color: VB.gold, fontSize: 11, fontFamily: VB.fontMono }}>{cpu.toFixed(0)}%</span>
                </div>
                <MiniChart data={cpuHistory} color={VB.gold} height={60} />
              </div>
              <div style={{
                background: VB.surface,
                border: `1px solid ${VB.border}`,
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: VB.fontHeader, fontSize: 14, color: VB.teal, letterSpacing: 1 }}>MEMORY HISTORY</span>
                  <span style={{ color: VB.teal, fontSize: 11, fontFamily: VB.fontMono }}>{mem.toFixed(1)} GB</span>
                </div>
                <MiniChart data={memHistory} color={VB.teal} height={60} />
              </div>
            </div>
          </>
        ) : (
          /* Processes Tab */
          <div style={{
            background: VB.surface,
            border: `1px solid ${VB.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${VB.border}` }}>
                  {["PID", "NAME", "CPU %", "MEM (MB)", "STATUS"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i < 2 ? "left" : i === 4 ? "center" : "right",
                      padding: "10px 12px",
                      color: VB.muted,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: VB.fontMono,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processes
                  .sort((a, b) => b.cpu - a.cpu)
                  .map((proc) => (
                    <tr
                      key={proc.pid}
                      style={{ borderBottom: `1px solid ${VB.border}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(181,211,52,0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "8px 12px", fontFamily: VB.fontMono, fontSize: 11, color: VB.muted }}>
                        {proc.pid}
                      </td>
                      <td style={{ padding: "8px 12px", fontFamily: VB.fontMono, fontSize: 11, color: VB.ink }}>
                        {proc.name}
                      </td>
                      <td style={{
                        padding: "8px 12px",
                        fontFamily: VB.fontMono,
                        fontSize: 11,
                        textAlign: "right",
                        color: proc.cpu > 10 ? VB.coral : proc.cpu > 5 ? VB.gold : VB.ink2,
                      }}>
                        {proc.cpu.toFixed(1)}
                      </td>
                      <td style={{
                        padding: "8px 12px",
                        fontFamily: VB.fontMono,
                        fontSize: 11,
                        textAlign: "right",
                        color: VB.ink2,
                      }}>
                        {proc.mem}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: "rgba(181,211,52,0.12)",
                          color: VB.gold,
                          fontSize: 9,
                          fontWeight: 600,
                          fontFamily: VB.fontMono,
                        }}>
                          {proc.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
