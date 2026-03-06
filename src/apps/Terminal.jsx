import React, { useState, useRef, useEffect, useCallback } from "react";

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

const VIRTUAL_FS = {
  "~": ["Documents", "Downloads", "Projects", "Shared", ".vbrc", ".bashrc"],
  "~/Documents": ["NOV_Analysis_Q1.pdf", "Investment_Thesis.docx", "Board_Deck_2026.pptx"],
  "~/Downloads": ["Market_Report_2026.pdf", "Competitor_Analysis.xlsx"],
  "~/Projects": ["Project_Alpha", "Project_Beta", "Project_Gamma"],
  "~/Shared": ["Deal_Pipeline.xlsx", "Portfolio_Overview.pdf", "Team_Contacts.csv"],
};

const FILE_CONTENTS = {
  ".vbrc": `# VentureBuilder OS Configuration\nexport VB_VERSION="2.0.0"\nexport VB_THEME="dark"\nexport VB_USER="operator"`,
  ".bashrc": `# ~/.bashrc - VB Shell\nPS1="vb@venturebuilder:~$ "\nalias ll='ls -la'\nalias cls='clear'`,
  "README.md": `# Project Alpha\n\nEarly-stage venture in the renewable energy space.\nTarget: Series A by Q3 2026.\n\nTeam: 4 FTEs + 2 advisors`,
};

const NEOFETCH_ART = `
\x1b[32m  ██╗   ██╗██████╗  \x1b[0m   vb@venturebuilder
\x1b[32m  ██║   ██║██╔══██╗ \x1b[0m   ─────────────────
\x1b[32m  ██║   ██║██████╔╝ \x1b[0m   OS: VentureBuilder OS 2.0
\x1b[32m  ╚██╗ ██╔╝██╔══██╗ \x1b[0m   Kernel: VB-Kernel 6.1.0
\x1b[32m   ╚████╔╝ ██████╔╝ \x1b[0m   Shell: vbsh 1.0
\x1b[32m    ╚═══╝  ╚═════╝  \x1b[0m   Resolution: ${window.innerWidth}x${window.innerHeight}
\x1b[32m                    \x1b[0m   Theme: Dark [VB Gold]
\x1b[32m  VENTURE BUILDER   \x1b[0m   Terminal: vb-term 2.0
\x1b[32m                    \x1b[0m   CPU: VB Quantum Core (12) @ 4.2GHz
\x1b[32m                    \x1b[0m   Memory: 1.2 GiB / 32.0 GiB
`;

const PROMPT = "vb@venturebuilder:~$ ";

const HELP_TEXT = `Available commands:
  help       Show this help message
  ls         List directory contents
  pwd        Print working directory
  cd <dir>   Change directory
  cat <file> Display file contents
  whoami     Display current user
  date       Display current date and time
  clear      Clear the terminal
  echo       Print arguments to stdout
  version    Show VentureBuilder OS version
  about      About VentureBuilder OS
  neofetch   System information display
  history    Show command history
`;

const ABOUT_TEXT = `
╔══════════════════════════════════════╗
║       VentureBuilder OS v2.0        ║
║──────────────────────────────────────║
║  The operating system for modern    ║
║  venture building operations.       ║
║                                     ║
║  Built with precision. Designed     ║
║  for operators who move fast.       ║
║                                     ║
║  © 2026 VentureBuilder Fund         ║
╚══════════════════════════════════════╝
`;

export default function Terminal() {
  const [lines, setLines] = useState([
    { type: "system", text: "VentureBuilder OS Terminal v2.0" },
    { type: "system", text: "Type 'help' for available commands.\n" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [cwd, setCwd] = useState("~");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const addOutput = useCallback((text, type = "output") => {
    setLines((prev) => [...prev, { type, text }]);
  }, []);

  const executeCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setLines((prev) => [...prev, { type: "input", text: `${PROMPT}${trimmed}` }]);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        addOutput(HELP_TEXT);
        break;

      case "clear":
        setLines([]);
        return;

      case "ls": {
        const dir = VIRTUAL_FS[cwd];
        if (dir) {
          const output = dir.map((item) => {
            const isDir = VIRTUAL_FS[`${cwd}/${item}`] !== undefined;
            return isDir ? `\x1b[34m${item}/\x1b[0m` : item;
          }).join("  ");
          addOutput(output);
        } else {
          addOutput("ls: cannot access: No such file or directory", "error");
        }
        break;
      }

      case "cd": {
        const target = args[0] || "~";
        if (target === "..") {
          if (cwd !== "~") {
            const parts = cwd.split("/");
            parts.pop();
            setCwd(parts.join("/") || "~");
          }
        } else if (target === "~" || target === "/") {
          setCwd("~");
        } else {
          const newPath = `${cwd}/${target}`;
          if (VIRTUAL_FS[newPath]) {
            setCwd(newPath);
          } else {
            addOutput(`cd: ${target}: No such file or directory`, "error");
          }
        }
        break;
      }

      case "pwd":
        addOutput(`/home/vb/${cwd === "~" ? "" : cwd.replace("~/", "")}`);
        break;

      case "cat": {
        const filename = args[0];
        if (!filename) {
          addOutput("cat: missing file operand", "error");
        } else if (FILE_CONTENTS[filename]) {
          addOutput(FILE_CONTENTS[filename]);
        } else {
          addOutput(`cat: ${filename}: No such file or directory`, "error");
        }
        break;
      }

      case "whoami":
        addOutput("vb-operator");
        break;

      case "date":
        addOutput(new Date().toString());
        break;

      case "echo":
        addOutput(args.join(" "));
        break;

      case "version":
        addOutput("VentureBuilder OS v2.0.0 (Build 2026.03)");
        break;

      case "about":
        addOutput(ABOUT_TEXT);
        break;

      case "neofetch":
        addOutput(NEOFETCH_ART);
        break;

      case "history":
        addOutput(history.map((h, i) => `  ${i + 1}  ${h}`).join("\n") || "No history yet.");
        break;

      case "uptime":
        addOutput(`up ${Math.floor(Math.random() * 30 + 1)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`);
        break;

      case "uname":
        addOutput("VB-Kernel 6.1.0 venturebuilder x86_64");
        break;

      default:
        addOutput(`${command}: command not found. Type 'help' for available commands.`, "error");
    }
  }, [cwd, history, addOutput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx !== -1) {
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }, [input, executeCommand, history, historyIdx]);

  const renderLine = useCallback((line) => {
    let text = line.text;
    let color = VB.gold2;
    if (line.type === "input") color = VB.ink;
    else if (line.type === "error") color = VB.coral;
    else if (line.type === "system") color = VB.teal;

    // Simple ANSI color replacement for display
    text = text.replace(/\x1b\[32m/g, "").replace(/\x1b\[34m/g, "").replace(/\x1b\[0m/g, "");

    return (
      <div style={{
        color,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        lineHeight: 1.5,
      }}>
        {text}
      </div>
    );
  }, []);

  return (
    <div
      onClick={() => inputRef.current && inputRef.current.focus()}
      style={{
        height: "100%",
        background: VB.bg,
        fontFamily: VB.fontMono,
        fontSize: 13,
        padding: 12,
        overflow: "auto",
        cursor: "text",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1 }}>
        {lines.map((line, i) => (
          <div key={i}>{renderLine(line)}</div>
        ))}

        {/* Input Line */}
        <div style={{
          display: "flex",
          alignItems: "center",
          color: VB.ink,
          lineHeight: 1.5,
        }}>
          <span style={{ color: VB.teal, whiteSpace: "pre" }}>vb</span>
          <span style={{ color: VB.muted }}>@</span>
          <span style={{ color: VB.gold }}>venturebuilder</span>
          <span style={{ color: VB.muted }}>:</span>
          <span style={{ color: VB.teal2 }}>{cwd}</span>
          <span style={{ color: VB.ink }}>$ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: VB.ink,
              fontFamily: VB.fontMono,
              fontSize: 13,
              caretColor: VB.gold,
              lineHeight: 1.5,
              padding: 0,
            }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
