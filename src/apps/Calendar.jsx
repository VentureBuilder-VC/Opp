import { useState, useEffect } from "react";

const VB = {
  bg:"#091C1D", bg2:"#0d2526", surface:"#0f2d2e", surface2:"#132f30",
  border:"rgba(181,211,52,0.15)", border2:"rgba(181,211,52,0.3)",
  ink:"#f5f2ec", ink2:"#c8d4ce", muted:"#849BA6",
  gold:"#B5D334", gold2:"#cde84a", teal:"#0097A7", teal2:"#00b8cc",
  coral:"#E46962", purple:"#a855f7",
};

const uid = () => Math.random().toString(36).slice(2, 9);
const STORAGE_KEY = "vb_os_calendar";
const CATEGORIES = [
  { name: "Meeting", color: VB.teal2 },
  { name: "Deadline", color: VB.coral },
  { name: "Review", color: VB.gold },
  { name: "Personal", color: VB.purple },
  { name: "Travel", color: "#22c55e" },
];

const loadEvents = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };

export default function Calendar() {
  const [events, setEvents] = useState(loadEvents);
  const [viewing, setViewing] = useState(new Date());
  const [selected, setSelected] = useState(null); // date string "YYYY-MM-DD"
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEvt, setNewEvt] = useState({ title: "", category: "Meeting", time: "09:00" });

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch {} }, [events]);

  const year = viewing.getFullYear();
  const month = viewing.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const getDayStr = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const getEventsForDay = (d) => events.filter(e => e.date === getDayStr(d));

  const prevMonth = () => setViewing(new Date(year, month - 1, 1));
  const nextMonth = () => setViewing(new Date(year, month + 1, 1));
  const monthName = viewing.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const addEvent = () => {
    if (!newEvt.title.trim() || !selected) return;
    const cat = CATEGORIES.find(c => c.name === newEvt.category) || CATEGORIES[0];
    setEvents(es => [...es, { id: uid(), title: newEvt.title, date: selected, time: newEvt.time, category: newEvt.category, color: cat.color }]);
    setNewEvt({ title: "", category: "Meeting", time: "09:00" });
    setAddingEvent(false);
  };

  const deleteEvent = (id) => setEvents(es => es.filter(e => e.id !== id));

  const selectedEvents = selected ? events.filter(e => e.date === selected).sort((a, b) => a.time.localeCompare(b.time)) : [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Build grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ display: "flex", height: "100%", background: VB.bg, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Calendar Grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: VB.surface2, border: `1px solid ${VB.border}`, color: VB.ink, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>◀</button>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: VB.ink, letterSpacing: ".04em" }}>{monthName}</div>
          <button onClick={nextMonth} style={{ background: VB.surface2, border: `1px solid ${VB.border}`, color: VB.ink, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>▶</button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 9, fontFamily: "'DM Mono',monospace", color: VB.muted, padding: 4, letterSpacing: ".1em", textTransform: "uppercase" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, flex: 1 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const dayStr = getDayStr(d);
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selected;
            const dayEvents = getEventsForDay(d);
            return (
              <div key={d} onClick={() => setSelected(dayStr)}
                style={{
                  padding: 4, borderRadius: 6, cursor: "pointer", minHeight: 48,
                  background: isSelected ? VB.surface2 : isToday ? `${VB.gold}0a` : "transparent",
                  border: `1px solid ${isSelected ? VB.border2 : isToday ? `${VB.gold}30` : "transparent"}`,
                  transition: "all .15s"
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = VB.surface; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? `${VB.gold}0a` : "transparent"; }}>
                <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? VB.gold : VB.ink, textAlign: "right", marginBottom: 2 }}>{d}</div>
                {dayEvents.slice(0, 3).map(ev => (
                  <div key={ev.id} style={{ fontSize: 7, padding: "1px 4px", borderRadius: 3, background: `${ev.color}20`, color: ev.color, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Mono',monospace" }}>
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div style={{ fontSize: 7, color: VB.muted, textAlign: "center" }}>+{dayEvents.length - 3}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar: selected day agenda */}
      <div style={{ width: 260, borderLeft: `1px solid ${VB.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: 12, borderBottom: `1px solid ${VB.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: VB.ink }}>
              {selected ? new Date(selected + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
            </div>
          </div>
          {selected && (
            <button onClick={() => setAddingEvent(true)} style={{ background: VB.gold, color: VB.bg, border: "none", borderRadius: 4, width: 22, height: 22, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          )}
        </div>

        {addingEvent && selected && (
          <div style={{ padding: 12, borderBottom: `1px solid ${VB.border}`, background: VB.surface2 }}>
            <input value={newEvt.title} onChange={e => setNewEvt(p => ({ ...p, title: e.target.value }))} placeholder="Event title" autoFocus
              style={{ width: "100%", marginBottom: 6, padding: "6px 8px", borderRadius: 4, fontSize: 10, background: VB.bg, border: `1px solid ${VB.border}`, color: VB.ink, fontFamily: "'DM Sans',sans-serif" }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input type="time" value={newEvt.time} onChange={e => setNewEvt(p => ({ ...p, time: e.target.value }))}
                style={{ flex: 1, padding: "4px 6px", borderRadius: 4, fontSize: 10, background: VB.bg, border: `1px solid ${VB.border}`, color: VB.ink, fontFamily: "'DM Mono',monospace" }} />
              <select value={newEvt.category} onChange={e => setNewEvt(p => ({ ...p, category: e.target.value }))}
                style={{ flex: 1, padding: "4px 6px", borderRadius: 4, fontSize: 10, background: VB.bg, border: `1px solid ${VB.border}`, color: VB.ink }}>
                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={addEvent} style={{ background: VB.gold, color: VB.bg, border: "none", borderRadius: 4, padding: "5px 12px", fontSize: 9, cursor: "pointer", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Add</button>
              <button onClick={() => setAddingEvent(false)} style={{ background: VB.surface, color: VB.muted, border: `1px solid ${VB.border}`, borderRadius: 4, padding: "5px 12px", fontSize: 9, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {!selected && (
            <div style={{ textAlign: "center", padding: 32, color: VB.muted, fontSize: 11 }}>Click a day to view events</div>
          )}
          {selected && selectedEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: VB.muted, fontSize: 11 }}>No events. Click + to add one.</div>
          )}
          {selectedEvents.map(ev => {
            const cat = CATEGORIES.find(c => c.name === ev.category);
            return (
              <div key={ev.id} style={{ padding: "10px 12px", borderRadius: 6, marginBottom: 6, borderLeft: `3px solid ${ev.color}`, background: VB.surface }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: VB.ink }}>{ev.title}</div>
                  <button onClick={() => deleteEvent(ev.id)} style={{ background: "none", border: "none", color: VB.muted, cursor: "pointer", fontSize: 10 }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: VB.teal2 }}>{ev.time}</span>
                  <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: `${ev.color}18`, color: ev.color, fontFamily: "'DM Mono',monospace" }}>{ev.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming events */}
        <div style={{ padding: 12, borderTop: `1px solid ${VB.border}` }}>
          <div style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: VB.gold, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>
            <span style={{ width: 10, height: 1, background: VB.gold, display: "inline-block", marginRight: 4, verticalAlign: "middle" }}/>Upcoming
          </div>
          {events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 4).map(ev => (
            <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: VB.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</span>
              <span style={{ fontSize: 8, color: VB.muted, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{ev.date.slice(5)}</span>
            </div>
          ))}
          {events.filter(e => e.date >= todayStr).length === 0 && <div style={{ fontSize: 9, color: VB.muted }}>No upcoming events</div>}
        </div>
      </div>
    </div>
  );
}
