import React, { useState, useEffect, useCallback, useMemo } from "react";

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

const STORAGE_KEY = "vb_os_calendar";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const CATEGORIES = [
  { id: "meeting", label: "Meeting", color: VB.teal },
  { id: "deadline", label: "Deadline", color: VB.coral },
  { id: "review", label: "Review", color: VB.gold },
  { id: "personal", label: "Personal", color: VB.purple },
  { id: "milestone", label: "Milestone", color: VB.gold2 },
];

function todayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULT_EVENTS = [
  { id: "ev1", date: todayStr(0), title: "Portfolio Review", category: "review", time: "10:00 AM" },
  { id: "ev2", date: todayStr(1), title: "Deal Pipeline Sync", category: "meeting", time: "2:00 PM" },
  { id: "ev3", date: todayStr(3), title: "Board Deck Deadline", category: "deadline", time: "5:00 PM" },
  { id: "ev4", date: todayStr(5), title: "Team Offsite", category: "personal", time: "9:00 AM" },
  { id: "ev5", date: todayStr(-2), title: "Q1 Report Submitted", category: "milestone", time: "12:00 PM" },
  { id: "ev6", date: todayStr(7), title: "Investor Call", category: "meeting", time: "11:00 AM" },
];

function loadEvents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return DEFAULT_EVENTS;
}

function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) { /* ignore */ }
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(loadEvents);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("09:00 AM");
  const [newCategory, setNewCategory] = useState("meeting");

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayDate = todayStr(0);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDay]);

  const getDateStr = useCallback((day) => {
    if (!day) return "";
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }, [year, month]);

  const getEventsForDate = useCallback((dateStr) => {
    return events.filter((e) => e.date === dateStr);
  }, [events]);

  const prevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToday = useCallback(() => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  }, []);

  const addEvent = useCallback(() => {
    if (!newTitle.trim() || !selectedDate) return;
    const ev = {
      id: "ev-" + Date.now(),
      date: selectedDate,
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
    };
    setEvents((prev) => [...prev, ev]);
    setNewTitle("");
    setShowAddEvent(false);
  }, [newTitle, newTime, newCategory, selectedDate]);

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const upcomingEvents = useMemo(() => {
    const now = todayStr(0);
    return events
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
      .slice(0, 5);
  }, [events]);

  const getCatColor = (catId) => {
    return CATEGORIES.find((c) => c.id === catId)?.color || VB.muted;
  };

  const navBtn = {
    background: "transparent",
    border: `1px solid ${VB.border}`,
    color: VB.ink2,
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 13,
    fontFamily: VB.fontBody,
    transition: "all 0.15s",
  };

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
        padding: "12px 16px",
        borderBottom: `1px solid ${VB.border}`,
        background: VB.bg2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={navBtn}>&larr;</button>
          <span style={{
            fontFamily: VB.fontHeader,
            fontSize: 22,
            color: VB.ink,
            letterSpacing: 1.5,
            minWidth: 200,
            textAlign: "center",
          }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn}>&rarr;</button>
        </div>
        <button onClick={goToday} style={{ ...navBtn, color: VB.gold, borderColor: VB.border2 }}>
          Today
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Calendar Grid */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", padding: 12 }}>
          {/* Day Headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            marginBottom: 4,
          }}>
            {DAYS.map((d) => (
              <div key={d} style={{
                textAlign: "center",
                padding: "6px 0",
                color: VB.muted,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: VB.fontMono,
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            flex: 1,
          }}>
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} style={{ background: VB.bg2, borderRadius: 4 }} />;
              }
              const dateStr = getDateStr(day);
              const isToday = dateStr === todayDate;
              const isSelected = dateStr === selectedDate;
              const dayEvents = getEventsForDate(dateStr);

              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(dateStr); setShowAddEvent(false); }}
                  style={{
                    background: isSelected
                      ? "rgba(181,211,52,0.12)"
                      : isToday
                        ? "rgba(0,151,167,0.1)"
                        : VB.surface,
                    border: isSelected
                      ? `1px solid ${VB.gold}`
                      : isToday
                        ? `1px solid ${VB.teal}`
                        : `1px solid ${VB.border}`,
                    borderRadius: 6,
                    padding: "4px 6px",
                    cursor: "pointer",
                    textAlign: "left",
                    minHeight: 60,
                    transition: "all 0.1s",
                    fontFamily: VB.fontBody,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = VB.border2;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isToday) e.currentTarget.style.borderColor = VB.border;
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? VB.teal2 : isSelected ? VB.gold : VB.ink2,
                    marginBottom: 2,
                  }}>
                    {day}
                  </span>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div key={ev.id} style={{
                      fontSize: 9,
                      padding: "1px 4px",
                      borderRadius: 3,
                      background: `${getCatColor(ev.category)}22`,
                      color: getCatColor(ev.category),
                      marginTop: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.4,
                    }}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span style={{ fontSize: 8, color: VB.muted, marginTop: 1 }}>
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div style={{
          width: 240,
          borderLeft: `1px solid ${VB.border}`,
          background: VB.bg2,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "auto",
        }}>
          {selectedDate ? (
            <div style={{ padding: 12 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <span style={{
                  fontFamily: VB.fontHeader,
                  fontSize: 16,
                  color: VB.ink,
                  letterSpacing: 1,
                }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => setShowAddEvent(!showAddEvent)}
                  style={{
                    width: 24, height: 24, borderRadius: 4,
                    border: `1px solid ${VB.border2}`,
                    background: showAddEvent ? VB.gold : "transparent",
                    color: showAddEvent ? VB.bg : VB.gold,
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  +
                </button>
              </div>

              {showAddEvent && (
                <div style={{
                  background: VB.surface,
                  border: `1px solid ${VB.border2}`,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                }}>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Event title..."
                    onKeyDown={(e) => { if (e.key === "Enter") addEvent(); }}
                    style={{
                      width: "100%",
                      background: VB.bg,
                      border: `1px solid ${VB.border}`,
                      borderRadius: 4,
                      color: VB.ink,
                      padding: "6px 8px",
                      fontSize: 12,
                      fontFamily: VB.fontBody,
                      outline: "none",
                      marginBottom: 6,
                      boxSizing: "border-box",
                    }}
                    autoFocus
                  />
                  <input
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Time..."
                    style={{
                      width: "100%",
                      background: VB.bg,
                      border: `1px solid ${VB.border}`,
                      borderRadius: 4,
                      color: VB.ink,
                      padding: "6px 8px",
                      fontSize: 12,
                      fontFamily: VB.fontBody,
                      outline: "none",
                      marginBottom: 6,
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewCategory(cat.id)}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          border: newCategory === cat.id ? `1px solid ${cat.color}` : `1px solid ${VB.border}`,
                          background: newCategory === cat.id ? `${cat.color}22` : "transparent",
                          color: cat.color,
                          cursor: "pointer",
                          fontSize: 10,
                          fontFamily: VB.fontBody,
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={addEvent}
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: 4,
                      border: "none",
                      background: VB.gold,
                      color: VB.bg,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: VB.fontBody,
                    }}
                  >
                    Add Event
                  </button>
                </div>
              )}

              {selectedEvents.length > 0 ? (
                selectedEvents.map((ev) => (
                  <div key={ev.id} style={{
                    background: VB.surface,
                    border: `1px solid ${VB.border}`,
                    borderLeft: `3px solid ${getCatColor(ev.category)}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    marginBottom: 6,
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}>
                      <div>
                        <div style={{ color: VB.ink, fontSize: 12, fontWeight: 500 }}>
                          {ev.title}
                        </div>
                        <div style={{ color: VB.muted, fontSize: 10, marginTop: 2, fontFamily: VB.fontMono }}>
                          {ev.time}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        style={{
                          background: "none", border: "none", color: VB.muted,
                          cursor: "pointer", fontSize: 12, padding: "0 2px",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = VB.coral; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = VB.muted; }}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: VB.muted, fontSize: 11, textAlign: "center", padding: 16 }}>
                  No events. Click + to add one.
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: 12 }}>
              <div style={{
                fontFamily: VB.fontHeader,
                fontSize: 16,
                color: VB.gold,
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                UPCOMING
              </div>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => (
                  <div key={ev.id} style={{
                    background: VB.surface,
                    border: `1px solid ${VB.border}`,
                    borderLeft: `3px solid ${getCatColor(ev.category)}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    marginBottom: 6,
                  }}>
                    <div style={{ color: VB.ink, fontSize: 12, fontWeight: 500 }}>
                      {ev.title}
                    </div>
                    <div style={{
                      color: VB.muted, fontSize: 10, marginTop: 2, fontFamily: VB.fontMono,
                      display: "flex", gap: 8,
                    }}>
                      <span>{new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span>{ev.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: VB.muted, fontSize: 11, textAlign: "center", padding: 16 }}>
                  No upcoming events
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
