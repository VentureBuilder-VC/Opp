// Data access layer — abstracts Supabase vs localStorage
// When Supabase is configured, uses it. Otherwise falls back to localStorage.
import { supabase, isSupabaseConfigured } from "./supabase.js";

// ══════════════════════════════════════════════════════════════════════════════
// RESEARCH
// ══════════════════════════════════════════════════════════════════════════════

export async function loadResearch() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("research")
      .select("company_id, data, status, fetched_at");
    if (error) throw error;
    const research = {};
    const rStatus = {};
    for (const row of data || []) {
      research[row.company_id] = { ...row.data, fetchedAt: row.fetched_at };
      rStatus[row.company_id] = row.status;
    }
    return { research, rStatus };
  }
  // localStorage fallback
  const raw = localStorage.getItem("vb_research");
  if (!raw) return { research: {}, rStatus: {} };
  const saved = JSON.parse(raw);
  const research = saved.research || {};
  const rStatus = saved.rStatus
    ? Object.fromEntries(Object.keys(saved.rStatus).map(k => [k, "done"]))
    : {};
  return { research, rStatus };
}

export async function saveResearch(companyId, data, status = "done") {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("research")
      .upsert({
        company_id: companyId,
        data,
        status,
        fetched_at: new Date().toISOString(),
      }, { onConflict: "company_id" });
    if (error) throw error;
    return;
  }
  // localStorage fallback handled by App.jsx existing save logic
}

// ══════════════════════════════════════════════════════════════════════════════
// STAKEHOLDER INTEL
// ══════════════════════════════════════════════════════════════════════════════

export async function loadStakeholderIntel() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("stakeholder_intel")
      .select("stakeholder_id, data, fetched_at");
    if (error) throw error;
    const intel = {};
    for (const row of data || []) {
      intel[row.stakeholder_id] = { ...row.data, fetchedAt: row.fetched_at };
    }
    return intel;
  }
  const raw = localStorage.getItem("vb_research");
  if (!raw) return {};
  return JSON.parse(raw).shIntel || {};
}

export async function saveStakeholderIntel(shId, data) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("stakeholder_intel")
      .upsert({
        stakeholder_id: shId,
        data,
        fetched_at: new Date().toISOString(),
      }, { onConflict: "stakeholder_id" });
    if (error) throw error;
    return;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

export async function loadAnalysis() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("analysis")
      .select("partner_id, data, status");
    if (error) throw error;
    const analysis = {};
    for (const row of data || []) {
      analysis[row.partner_id] = row.data;
    }
    return analysis;
  }
  const raw = localStorage.getItem("vb_research");
  if (!raw) return {};
  return JSON.parse(raw).analysis || {};
}

export async function saveAnalysis(partnerId, data) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("analysis")
      .upsert({
        partner_id: partnerId,
        data,
        status: "done",
      }, { onConflict: "partner_id" });
    if (error) throw error;
    return;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ACTIONS & CRM
// ══════════════════════════════════════════════════════════════════════════════

export async function loadActionsCRM() {
  if (isSupabaseConfigured()) {
    const [actionsRes, crmRes] = await Promise.all([
      supabase.from("actions").select("*"),
      supabase.from("crm").select("*"),
    ]);
    if (actionsRes.error) throw actionsRes.error;
    if (crmRes.error) throw crmRes.error;
    return {
      actions: (actionsRes.data || []).map(a => ({
        id: a.id, title: a.title, status: a.status, owner: a.owner,
        due: a.due_date, probId: a.problem_id, pid: a.partner_id, notes: a.notes,
      })),
      crm: (crmRes.data || []).map(c => ({
        id: c.id, name: c.name, website: c.website, contact: c.contact,
        stage: c.stage, lastContacted: c.last_contacted, probId: c.problem_id,
        pid: c.partner_id, nextAction: c.next_action, notes: c.notes,
        fitScore: c.fit_score, dealMemo: c.deal_memo,
      })),
    };
  }
  const raw = localStorage.getItem("vb_actions_crm");
  if (!raw) return { actions: [], crm: [] };
  const d = JSON.parse(raw);
  return { actions: d.actions || [], crm: d.crm || [] };
}

export async function saveAction(action) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("actions").upsert({
      id: action.id, title: action.title, status: action.status,
      owner: action.owner, due_date: action.due, problem_id: action.probId,
      partner_id: action.pid, notes: action.notes,
    }, { onConflict: "id" });
    if (error) throw error;
  }
}

export async function deleteActionDB(id) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("actions").delete().eq("id", id);
    if (error) throw error;
  }
}

export async function saveCRM(entry) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("crm").upsert({
      id: entry.id, name: entry.name, website: entry.website,
      contact: entry.contact, stage: entry.stage,
      last_contacted: entry.lastContacted, problem_id: entry.probId,
      partner_id: entry.pid, next_action: entry.nextAction,
      notes: entry.notes, fit_score: entry.fitScore, deal_memo: entry.dealMemo,
    }, { onConflict: "id" });
    if (error) throw error;
  }
}

export async function deleteCRMDB(id) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("crm").delete().eq("id", id);
    if (error) throw error;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PROBLEMS
// ══════════════════════════════════════════════════════════════════════════════

export async function saveProblem(p) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("problems").upsert({
      id: p.id, partner_id: p.pid, bu: p.bu, priority: p.pri,
      title: p.title, impact: p.impact, category: p.cat,
      reach: p.reach, impact_score: p.impact2, confidence: p.confidence,
      effort: p.effort, value_low: p.low, value_mid: p.mid, value_high: p.high,
      basis: p.basis, rice_note: p.riceNote, causes: p.causes,
      success_criteria: p.success, stakeholders: p.shs,
      radar_scores: p.radarScores, urgency_level: p.urgencyLevel,
      stakeholder_influence: p.stakeholderInfluence,
      urgency_signals: p.urgencySignals,
    }, { onConflict: "id" });
    if (error) throw error;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INTEL CACHE (for live data)
// ══════════════════════════════════════════════════════════════════════════════

export async function getIntelCache(source, entityType, entityId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("intel_cache")
      .select("data, fetched_at")
      .eq("source", source)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId || "")
      .gt("expires_at", new Date().toISOString())
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return null;
    return data;
  }
  // localStorage cache fallback
  const key = `vb_intel_${source}_${entityType}_${entityId || "all"}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const cached = JSON.parse(raw);
  if (new Date(cached.expires_at) < new Date()) {
    localStorage.removeItem(key);
    return null;
  }
  return cached;
}

export async function setIntelCache(source, entityType, entityId, data) {
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4h
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("intel_cache").insert({
      source, entity_type: entityType, entity_id: entityId || "",
      data, fetched_at: new Date().toISOString(), expires_at: expiresAt,
    });
    if (error) throw error;
    return;
  }
  const key = `vb_intel_${source}_${entityType}_${entityId || "all"}`;
  localStorage.setItem(key, JSON.stringify({
    data, fetched_at: new Date().toISOString(), expires_at: expiresAt,
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ══════════════════════════════════════════════════════════════════════════════

export async function logAudit(action, entityType, entityId, details = {}) {
  if (isSupabaseConfigured()) {
    await supabase.from("audit_log").insert({
      action, entity_type: entityType, entity_id: entityId, details,
    });
  }
}
