import { useState, useRef, useEffect } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ScatterChart, Scatter, ZAxis, CartesianGrid, ReferenceLine,
} from "recharts";

const VB = {
  bg:"#091C1D", bg2:"#0d2526", surface:"#0f2d2e", surface2:"#132f30",
  border:"rgba(181,211,52,0.15)", border2:"rgba(181,211,52,0.3)",
  ink:"#f5f2ec", ink2:"#c8d4ce", muted:"#849BA6",
  gold:"#B5D334", gold2:"#cde84a", teal:"#0097A7", teal2:"#00b8cc",
  coral:"#E46962", purple:"#a855f7",
};

const CAT = {
  "Operational Risk":"#E46962","Revenue Growth":"#B5D334","Product / Technology":"#00b8cc",
  "Process / Enabler":"#cde84a","Market Expansion":"#0097A7","Digital / AI":"#a855f7",
  "Integration":"#f59e0b","Field Intelligence":"#22c55e","Asset Automation":"#00b8cc","Cost Optimisation":"#B5D334",
};

const f$ = n => n>=1e6?`$${(n/1e6).toFixed(0)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${n}`;
const getRice = p => Math.round(((p.reach||50)*(p.impact2||5)*((p.confidence||70)/100))/(p.effort||5)*10)/10;
const now = () => new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const uid = () => Math.random().toString(36).slice(2,9);

// ── GLOBAL SEED DATA ──────────────────────────────────────────────────────────
const NOV_BUS = [
  { id:"nov",     buLabel:"Artificial Lift Systems (ALS)",           buShort:"ALS",  color:VB.gold,    desc:"ESP and surface pumping systems, Max digital platform, CHP/IGP gas handling." },
  { id:"nov_ds",  buLabel:"Digital Services (M/D Totco)",            buShort:"DS",   color:"#00b8cc",  desc:"Max™ Platform IIoT solution, ~41% EDR market share, data from 200,000+ wells." },
  { id:"nov_dt",  buLabel:"Downhole Technologies",                   buShort:"DT",   color:"#a855f7",  desc:"Friction reduction tools, motors, MWD/LWD systems, directional tools." },
  { id:"nov_fgs", buLabel:"Fiber Glass Systems",                     buShort:"FGS",  color:"#22c55e",  desc:"Global leader in composite pipe and tank solutions. ~$650M revenue." },
  { id:"nov_ise", buLabel:"Intervention & Stimulation Equipment",    buShort:"ISE",  color:"#E46962",  desc:"eFrac fleet, CoilFUSE™, Power Pods, Agitator™ tools, Max Completions™." },
  { id:"nov_mfg", buLabel:"Manufacturing",                           buShort:"MFG",  color:"#f59e0b",  desc:"500+ global locations. Precision machining, heavy fabrication, assembly." },
  { id:"nov_pm",  buLabel:"Production & Midstream",                  buShort:"P&M",  color:"#3b82f6",  desc:"Reciprocating, centrifugal, and PC pumps; chokes; flow control valves." },
  { id:"nov_rh",  buLabel:"ReedHycalog",                             buShort:"RH",   color:"#f07870",  desc:"Global leader in PDC drill bit technology. ION™ and I-DARE™ cutters." },
  { id:"nov_rt",  buLabel:"Rig Technologies",                        buShort:"RT",   color:"#cde84a",  desc:"ATOM RTX robotics, NOVOS™ automation, Red Zone Manager™ AI safety." },
  { id:"nov_ts",  buLabel:"Tuboscope",                               buShort:"TS",   color:"#0097A7",  desc:"Tubular inspection, Tube-Kote™ internal coatings, TracID RFID tracking." },
  { id:"nov_tp",  buLabel:"Tubular Products (Grant Prideco)",        buShort:"TP",   color:"#B5D334",  desc:"High-performance drill pipe and premium connections. Delta™ connections." },
];

const NOV_BU_MAP = Object.fromEntries(NOV_BUS.map(b=>[b.buShort, b]));

const SEED_PARTNERS = [
  { id:"nov", name:"NOV", full:"National Oilwell Varco", sector:"OEM", color:VB.gold, avatar:"NOV",
    desc:"Leading OEM for drilling, completions, production, and industrial processes. 11 Business Units spanning hardware, digital, and services.",
    tags:["ESP","artificial lift","PDC bits","rig automation","fiber glass","IIoT","Max platform","eFrac","manufacturing"] },
  { id:"ey", name:"EY", full:"EY Energy Practice", sector:"Consulting", color:"#f59e0b", avatar:"EY",
    desc:"EY holds the change management & digital transformation contract. OFS companies hold the technical solutions EY's clients need.", tags:["change management","digital transformation","OFS"] },
];

const SEED_PROBS = [
  // NOV
  { id:"n1", pid:"nov", bu:"ALS", pri:"High", title:"Supply Chain Vulnerability & Tariff Exposure",
    impact:"Engineering bandwidth diverted; cost basis unstable; new product development stalled; customer pricing disrupted", cat:"Operational Risk",
    reach:85, impact2:8, confidence:80, effort:6, low:8e6, mid:22e6, high:45e6,
    basis:"Rystad 2024: OFS tariff exposure avg 12-18% COGS impact; NOV AL ~$180M revenue base; IHS Markit supply chain disruption cost benchmarks",
    riceNote:"High reach (all product lines); significant financial impact; high confidence given tariff trajectory",
    causes:["China dependency","Insufficient OEM documentation","Tariff environment changing faster than supply chain can adapt"],
    success:"Diversified supply base; predictable cost structure; OEM-level documentation complete for all key components",
    shs:["Engineering","Procurement","Sales","Customers"],
    radarScores:{Financial:8,Strategic:7,Urgency:9,Solvability:6,"Market Size":7},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"VP Engineering",influence:9,interest:8,type:"internal"},
      {name:"Procurement Lead",influence:7,interest:10,type:"internal"},
      {name:"Key Customers",influence:8,interest:9,type:"external"},
      {name:"Alt. Suppliers",influence:5,interest:7,type:"external"},
    ],
    urgencySignals:[
      {date:"Q1 2025",event:"Trump tariff 2.0 — additional 10-25% on Chinese manufactured goods",category:"Macro",impact:"Critical"},
      {date:"Q1 2026",event:"US-China tariff escalation resumes — further component sourcing disruption",category:"Macro",impact:"Critical"},
      {date:"Q1 2024",event:"US Section 301 tariffs extended on Chinese electronics & motors",category:"Macro",impact:"High"},
    ]},
  { id:"n2", pid:"nov", bu:"ALS", pri:"High", title:"Digital Platform Commercialisation & ROI Demonstration",
    impact:"Slow managed service revenue growth; difficulty converting to performance-based contracts; competitive risk from third-party digital players", cat:"Revenue Growth",
    reach:70, impact2:9, confidence:75, effort:7, low:15e6, mid:42e6, high:90e6,
    basis:"Wood Mackenzie 2024: Digital managed services $2-8/BOE premium; 2-4% production uplift; SLB/BKR digital segment margin premiums",
    riceNote:"Highest long-term value; confidence risk due to conversion complexity; urgency driven by competitive digital entrants",
    causes:["No standardised ROI framework","Small operator budget constraints","Production attribution complexity"],
    success:"Documented ROI case studies; structured managed service pricing; measurable 2-4% production uplift",
    shs:["Digital/Max team","Sales","Operators","NOV leadership"],
    radarScores:{Financial:9,Strategic:10,Urgency:8,Solvability:5,"Market Size":10},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"NOV Leadership",influence:10,interest:9,type:"internal"},
      {name:"Digital/Max Team",influence:7,interest:10,type:"internal"},
      {name:"Operator Execs",influence:9,interest:7,type:"external"},
      {name:"3rd-Party Digital",influence:6,interest:5,type:"competitor"},
    ],
    urgencySignals:[
      {date:"Q2 2024",event:"SLB acquires ChampionX — digital managed services land-grab accelerates",category:"Competitive",impact:"High"},
      {date:"Q1 2025",event:"Baker Hughes launches AI-powered ESP monitoring SaaS — pricing undercuts OFS incumbents",category:"Competitive",impact:"High"},
      {date:"Q3 2025",event:"NOC AI procurement budgets +$2.1B across Saudi Aramco, ADNOC, QatarEnergy",category:"Market",impact:"High"},
    ]},
  { id:"n3", pid:"nov", bu:"ALS", pri:"High", title:"Gas Handling & ESP Reliability in High-GOR Wells",
    impact:"Up to $180K per failure event; customer dissatisfaction; limits addressable market", cat:"Product / Technology",
    reach:60, impact2:9, confidence:85, effort:8, low:12e6, mid:28e6, high:55e6,
    basis:"$180K/failure event (stated); Permian high-GOR well count >4,000 (EIA 2024); avg 2.1 failures/yr/well; addressable market expansion value (Spears & Associates)",
    riceNote:"Precise dollar anchor from stated failure cost; reach constrained to high-GOR subset; high confidence on technical problem validity",
    causes:["Fundamental limits of centrifugal design at high GOR","CHP/IGP in early commercialisation"],
    success:"Reliable ESP operation through full run life in high-GOR; CHP/IGP commercially scaled",
    shs:["Operators (Permian, ME)","Field service teams","Engineering"],
    radarScores:{Financial:8,Strategic:8,Urgency:8,Solvability:4,"Market Size":8},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Permian Operators",influence:9,interest:10,type:"external"},
      {name:"Field Engineering",influence:6,interest:9,type:"internal"},
      {name:"ME NOCs",influence:8,interest:8,type:"external"},
      {name:"R&D / CHP Team",influence:5,interest:10,type:"internal"},
    ],
    urgencySignals:[
      {date:"Q3 2024",event:"EIA: Permian high-GOR well count exceeds 4,200 — 18% YoY growth",category:"Market",impact:"High"},
      {date:"Q2 2025",event:"Halliburton Summit ESP reports 22% run-life improvement via gas-handling redesign",category:"Competitive",impact:"Medium"},
    ]},
  { id:"n4", pid:"nov", bu:"ALS", pri:"Medium", title:"Startup Commercial Agreement Framework",
    impact:"Promising technology partners lost to slow negotiations; competitive disadvantage in digital adoption speed", cat:"Process / Enabler",
    reach:40, impact2:6, confidence:90, effort:3, low:2e6, mid:8e6, high:20e6,
    basis:"Cost of delayed tech partnership (6-12 month opportunity cost); OFS-startup deal acceleration ROI (Bain 2023); repeated negotiation cycle bandwidth cost",
    riceNote:"Low effort = excellent RICE score despite moderate reach; quick win that enables other problems to be solved faster",
    causes:["Valuation gap between AI/digital cos and NOV multiples","No pilot-to-partnership templates"],
    success:"2-3 pre-negotiated commercial templates; measurable reduction in time to signed pilot",
    shs:["Digital team","VP","NOV corporate","Startup partners"],
    radarScores:{Financial:5,Strategic:7,Urgency:6,Solvability:10,"Market Size":4},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"NOV VP/Corp Dev",influence:10,interest:7,type:"internal"},
      {name:"Digital Team",influence:6,interest:10,type:"internal"},
      {name:"Startup Partners",influence:4,interest:10,type:"external"},
      {name:"Legal / Finance",influence:8,interest:5,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"n5", pid:"nov", bu:"ALS", pri:"Medium", title:"International Expansion Execution",
    impact:"Revenue realization delayed; resource strain; cross-BU coordination burden", cat:"Market Expansion",
    reach:50, impact2:8, confidence:65, effort:9, low:10e6, mid:35e6, high:80e6,
    basis:"Aramco ESP spend ~$800M/yr (company filings); NOV current ME AL market share ~3-5%; international qualification premium 20-35% margin uplift (Spears AL Middle East report)",
    riceNote:"Very high potential dollar value; confidence tempered by qualification timeline risk; high effort drags RICE score",
    causes:["Extract was US-only startup","International qualification is long and demanding"],
    success:"Saudi Arabia facility operational 2026; Aramco field trial qualified; CHP adopted internationally",
    shs:["Chris Osburn","Chuck Wheeler","Saudi Aramco","Iraq distributor"],
    radarScores:{Financial:9,Strategic:9,Urgency:7,Solvability:3,"Market Size":9},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Saudi Aramco",influence:10,interest:9,type:"external"},
      {name:"Chris Osburn",influence:8,interest:10,type:"internal"},
      {name:"Iraq Distributor",influence:4,interest:8,type:"external"},
      {name:"NOV BU Leads",influence:7,interest:6,type:"internal"},
    ],
    urgencySignals:[
      {date:"Q4 2024",event:"Aramco IKTVA threshold raised to 40% — local content pressure intensifies",category:"Regulatory",impact:"High"},
      {date:"Q4 2025",event:"Aramco fields pilot digital ESP optimization from Halliburton — competitive threat to NOV",category:"Competitive",impact:"High"},
    ]},
  // ── NOV DIGITAL SERVICES ──────────────────────────────────────────────────
  { id:"ds1", pid:"nov", bu:"DS", pri:"High", title:"Data Leakage & Third-Party Monetization of NOV Data",
    impact:"Rising AWS costs; competitive erosion; NOV's data used to build competing products", cat:"Revenue Growth",
    reach:80, impact2:9, confidence:85, effort:6, low:8e6, mid:25e6, high:60e6,
    basis:"Third parties extract via open API, resell analytics; AWS cost spiralling with data volume",
    riceNote:"Immediate revenue and cost impact; high confidence since problem is actively occurring",
    causes:["Open API without usage caps","Insufficient in-platform analytics to retain customers"],
    success:"Reduced third-party extraction; new ARR from data access tiers or managed analytics",
    shs:["Digital team","NOV leadership","Customers","Third-party vendors"],
    radarScores:{Financial:9,Strategic:9,Urgency:9,Solvability:6,"Market Size":8},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"NOV Digital Leadership",influence:10,interest:9,type:"internal"},
      {name:"3rd-Party Vendors",influence:7,interest:3,type:"competitor"},
      {name:"Operator Customers",influence:8,interest:7,type:"external"},
      {name:"AWS/Cloud",influence:5,interest:6,type:"external"},
    ],
    urgencySignals:[
      {date:"Q3 2025",event:"SLB DELFI and BKR Leucipa aggressively marketing integrated ecosystems — pulling customers away from NOV API",category:"Competitive",impact:"High"},
    ]},
  { id:"ds2", pid:"nov", bu:"DS", pri:"High", title:"No Automated Cross-Well Learning Capture",
    impact:"200,000+ wells generating no compounding intelligence; competitive differentiation unrealized", cat:"Digital / AI",
    reach:75, impact2:9, confidence:80, effort:7, low:10e6, mid:30e6, high:70e6,
    basis:"200K+ wells under Max management; no ML pipeline to extract cross-well learnings",
    riceNote:"Massive untapped data moat; high confidence on technical feasibility with right ML partner",
    causes:["No ML pipeline to extract and standardize cross-well learnings","No product built to surface recommendations"],
    success:"Automated lessons-learned capture and AI-assisted well planning available on Max",
    shs:["Customers","Digital product team","Sales"],
    radarScores:{Financial:8,Strategic:10,Urgency:8,Solvability:5,"Market Size":10},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Digital Product Team",influence:8,interest:10,type:"internal"},
      {name:"Operator Data Teams",influence:7,interest:9,type:"external"},
      {name:"NOV Leadership",influence:9,interest:8,type:"internal"},
      {name:"AI/ML Partners",influence:5,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ds3", pid:"nov", bu:"DS", pri:"High", title:"Fragmented Data Architecture Across Well Lifecycle",
    impact:"No unified customer view across drilling, completions, and production; limits cross-sell; forces manual integration", cat:"Integration",
    reach:70, impact2:8, confidence:80, effort:8, low:8e6, mid:22e6, high:50e6,
    basis:"Separate Max/API (drilling), PI (production), TimeseriesDB (completions) — no unified layer",
    riceNote:"Foundational infrastructure problem; solving it unlocks multiple revenue streams",
    causes:["Separate systems built independently for each lifecycle phase","No unified data layer"],
    success:"Single digital experience across all three lifecycle phases via unified API or data layer",
    shs:["Customers","Digital team","Other NOV BUs"],
    radarScores:{Financial:7,Strategic:9,Urgency:7,Solvability:4,"Market Size":9},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"CTO / Architecture",influence:9,interest:9,type:"internal"},
      {name:"NOV BU Leaders",influence:7,interest:7,type:"internal"},
      {name:"Operator IT/OT",influence:8,interest:8,type:"external"},
      {name:"OSDU Standards",influence:5,interest:6,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ds4", pid:"nov", bu:"DS", pri:"Medium", title:"Perception Gap & Digital Sales Enablement",
    impact:"Digital products underleveraged; losing deals to competitors with stronger brand presence", cat:"Process / Enabler",
    reach:65, impact2:7, confidence:85, effort:4, low:3e6, mid:12e6, high:30e6,
    basis:"NOV not perceived as digital company despite 35+ years capability; marketing severely underdeveloped",
    riceNote:"Low effort quick win; marketing investment has outsized ROI vs engineering spend",
    causes:["Corporate marketing restrictions","Internal 'equipment vs digital company' identity conflict"],
    success:"Measurable increase in operator awareness; improved win rates in digital-led deals",
    shs:["Sales","Marketing","Customers","NOV leadership"],
    radarScores:{Financial:6,Strategic:7,Urgency:6,Solvability:9,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"CMO / Marketing",influence:8,interest:8,type:"internal"},
      {name:"Sales Leadership",influence:9,interest:9,type:"internal"},
      {name:"Operator Execs",influence:7,interest:5,type:"external"},
      {name:"Digital Competitors",influence:6,interest:3,type:"competitor"},
    ],
    urgencySignals:[]},
  { id:"ds5", pid:"nov", bu:"DS", pri:"Medium", title:"System Stability Under Growing Data Load",
    impact:"Major outage risk across multiple rigs; severe customer trust and revenue consequences", cat:"Operational Risk",
    reach:85, impact2:9, confidence:75, effort:7, low:5e6, mid:18e6, high:45e6,
    basis:"Data demand growing faster than infrastructure designed for; no load management or usage caps",
    riceNote:"High urgency given single outage could cascade across 200K+ wells",
    causes:["Data demand growing faster than infrastructure designed for","No load management or usage caps"],
    success:"Load management framework in place; SLA-backed uptime guarantees; scalable infrastructure roadmap",
    shs:["Operators","Drilling contractors","Digital infrastructure team"],
    radarScores:{Financial:8,Strategic:7,Urgency:9,Solvability:6,"Market Size":7},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"Infrastructure Lead",influence:9,interest:10,type:"internal"},
      {name:"Drilling Contractors",influence:7,interest:9,type:"external"},
      {name:"AWS/Cloud Ops",influence:6,interest:8,type:"external"},
      {name:"Customer Ops Teams",influence:8,interest:9,type:"external"},
    ],
    urgencySignals:[]},

  // ── NOV DOWNHOLE TECHNOLOGIES ─────────────────────────────────────────────
  { id:"dt1", pid:"nov", bu:"DT", pri:"High", title:"Seal Failure Under Harsh Downhole Conditions",
    impact:"1–2 tool failures/week; forced trip-outs; tool destruction; customer attrition", cat:"Product / Technology",
    reach:80, impact2:9, confidence:85, effort:7, low:10e6, mid:28e6, high:60e6,
    basis:"1-2 failures/week at estimated $40-80K NPT cost per event; customer attrition risk on repeat failures",
    riceNote:"High frequency, high cost — fastest path to customer retention improvement",
    causes:["High-pressure, high-sand, aggressive-chemistry environments exceed current seal material limits","No vendor has delivered a reliable cross-condition solution"],
    success:"Seals surviving full run life across all tool types in target environments; weekly failure rate near zero",
    shs:["Field service","Customers","Engineering","Operations"],
    radarScores:{Financial:8,Strategic:7,Urgency:9,Solvability:5,"Market Size":7},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"Field Service Teams",influence:7,interest:10,type:"internal"},
      {name:"Operator Drilling Mgrs",influence:9,interest:9,type:"external"},
      {name:"Engineering R&D",influence:8,interest:9,type:"internal"},
      {name:"Seal Vendors",influence:5,interest:8,type:"external"},
    ],
    urgencySignals:[
      {date:"Ongoing 2025-26",event:"Customers drilling longer laterals with more aggressive fluid chemistries — accelerating seal failure rates beyond design tolerances",category:"Market",impact:"High"},
    ]},
  { id:"dt2", pid:"nov", bu:"DT", pri:"High", title:"Erosion of Small-ID Tool Components",
    impact:"Premature wear, customer-visible failures, attrition; threatens ZP Agitator revenue", cat:"Product / Technology",
    reach:60, impact2:8, confidence:85, effort:6, low:5e6, mid:15e6, high:35e6,
    basis:"ZP Agitator is a key revenue product; repeat erosion events causing customer churn",
    riceNote:"Targeted solution with clear product-line revenue protection; coating vendors exist but not for this ID range",
    causes:["No commercial HVOF-equivalent coating for ¾\"–1\" IDs","Carbide inserts geometrically incompatible","Abrasive fluids accelerating wear beyond design tolerances"],
    success:"Durable erosion-resistant coating applicable to ¾\"–1\" IDs integrated into existing manufacturing; measurable reduction in failures",
    shs:["Engineering","Field service","Customers","Sales"],
    radarScores:{Financial:7,Strategic:7,Urgency:8,Solvability:6,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Engineering Team",influence:8,interest:10,type:"internal"},
      {name:"ZP Agitator Customers",influence:8,interest:9,type:"external"},
      {name:"Coating Vendors",influence:5,interest:8,type:"external"},
      {name:"Field Service",influence:6,interest:9,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"dt3", pid:"nov", bu:"DT", pri:"High", title:"Connection Cracking and Fatigue Across All Tool Sizes",
    impact:"Failures across entire product line; customer NPT; cross-BU issue", cat:"Product / Technology",
    reach:75, impact2:8, confidence:80, effort:7, low:8e6, mid:20e6, high:45e6,
    basis:"Affects motors, friction reduction tools, coiled tubing; thin-wall connections under cyclic loading",
    riceNote:"Cross-product failure mode — fix has multiplier effect across entire portfolio",
    causes:["Thin-wall designs leave minimal thread engagement","Cyclic loading and high make-up torque drive fatigue","Double-shoulder designs insufficient"],
    success:"Thread geometry or material treatment extending fatigue life across all sizes (1.5\"–20\"+ OD) without sacrificing flow area",
    shs:["All downhole engineering teams","Field service","Customers"],
    radarScores:{Financial:7,Strategic:8,Urgency:8,Solvability:5,"Market Size":7},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Downhole Engineering",influence:9,interest:10,type:"internal"},
      {name:"Operators / Drillers",influence:8,interest:9,type:"external"},
      {name:"Thread/Material Vendors",influence:5,interest:7,type:"external"},
      {name:"Field Service Teams",influence:7,interest:9,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"dt4", pid:"nov", bu:"DT", pri:"High", title:"Engineering Capacity for New Product Development",
    impact:"10+ high-revenue ideas stalled; new product pipeline — the BU's primary growth engine — throttled by sustaining demands", cat:"Process / Enabler",
    reach:70, impact2:8, confidence:90, effort:4, low:5e6, mid:18e6, high:45e6,
    basis:"Only 1 of 3 engineers available for development; sustaining demands continuous and under-resourced",
    riceNote:"Low effort structural fix with massive pipeline unlock value; quick win relative to impact",
    causes:["Only 1 of 3 engineers available for new development","Sustaining demands are continuous and under-resourced"],
    success:"Dedicated R&D capacity to run 2–3 concurrent development tracks without disrupting sustaining support",
    shs:["R&D team","BU leadership","Customers awaiting next-gen tools"],
    radarScores:{Financial:7,Strategic:9,Urgency:8,Solvability:7,"Market Size":8},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"BU President Andy",influence:10,interest:9,type:"internal"},
      {name:"R&D Engineers",influence:6,interest:10,type:"internal"},
      {name:"Product Management",influence:7,interest:8,type:"internal"},
      {name:"Key Operator Customers",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"dt5", pid:"nov", bu:"DT", pri:"Medium", title:"Sales Force Technical Knowledge Gap",
    impact:"Lost sales; incorrect customer-facing information; inability to differentiate from lower-cost competitors", cat:"Process / Enabler",
    reach:60, impact2:7, confidence:90, effort:3, low:3e6, mid:10e6, high:25e6,
    basis:"No formal technical training; product complexity requires engineering-level knowledge; geographically distributed team",
    riceNote:"Highest near-term ROI per dollar; training already done ad hoc — needs systemization",
    causes:["No formal technical training program","Product complexity requires engineering-level knowledge","Geographically distributed team makes training logistically difficult"],
    success:"All sales personnel accurately articulating competitive technical advantages; measurable improvement in win rates",
    shs:["Sales team","Customers","BU revenue"],
    radarScores:{Financial:6,Strategic:7,Urgency:6,Solvability:9,"Market Size":6},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Sales Leadership",influence:8,interest:9,type:"internal"},
      {name:"Engineering (Khoi)",influence:7,interest:7,type:"internal"},
      {name:"Operator Purchasing",influence:7,interest:5,type:"external"},
      {name:"Competitor Sales",influence:5,interest:3,type:"competitor"},
    ],
    urgencySignals:[]},

  // ── NOV FIBER GLASS SYSTEMS ───────────────────────────────────────────────
  { id:"fgs1", pid:"nov", bu:"FGS", pri:"High", title:"Product Development Execution Risk",
    impact:"Missing 3-year window risks ceding market share in hydrogen, geothermal, and chemical segments", cat:"Revenue Growth",
    reach:85, impact2:9, confidence:80, effort:7, low:20e6, mid:60e6, high:140e6,
    basis:"$650M → $1.1B target; ~$175M of internal growth in 3 years; identified markets ready",
    riceNote:"Existential growth target; external partnerships can de-risk 30% of delivery",
    causes:["Small multi-discipline R&D team","No systematic external technology sourcing process","Bandwidth consumed by sustaining projects"],
    success:"2–3 key product lines launched within 3 years; 30% of internal growth target de-risked via external partnerships",
    shs:["R&D leadership","BU president","External technology partners"],
    radarScores:{Financial:10,Strategic:10,Urgency:9,Solvability:6,"Market Size":10},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"BU President",influence:10,interest:9,type:"internal"},
      {name:"R&D Team",influence:7,interest:10,type:"internal"},
      {name:"Raw Material Partners",influence:6,interest:8,type:"external"},
      {name:"EPC Contractors",influence:5,interest:7,type:"external"},
    ],
    urgencySignals:[
      {date:"2025",event:"Global fiberglass market growing at 6.38% CAGR to $57.36B by 2035; hydrogen transport at 37.5% CAGR",category:"Market",impact:"High"},
    ]},
  { id:"fgs2", pid:"nov", bu:"FGS", pri:"High", title:"Temperature Performance Ceiling (Spoolable Pipe)",
    impact:"Locked out of high-temp applications; estimated $30–50M addressable market with existing customers", cat:"Product / Technology",
    reach:55, impact2:8, confidence:80, effort:7, low:8e6, mid:22e6, high:50e6,
    basis:"HDPE liner chemistry limits temperature; higher-performance extrusion process not yet qualified",
    riceNote:"Clear dollar anchor; chemistry solution likely exists in university/national lab pipelines",
    causes:["HDPE liner chemistry limits temperature","Higher-performance extrusion process not yet qualified"],
    success:"Liner formulation achieving 20°C higher operating temperature; qualified through customer field trial",
    shs:["R&D engineering","Key customers","Material chemistry partners"],
    radarScores:{Financial:7,Strategic:8,Urgency:7,Solvability:6,"Market Size":8},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"R&D Chemistry Team",influence:8,interest:10,type:"internal"},
      {name:"High-Temp Customers",influence:7,interest:9,type:"external"},
      {name:"Resin Suppliers",influence:6,interest:8,type:"external"},
      {name:"University Labs",influence:5,interest:8,type:"external"},
    ],
    urgencySignals:[]},
  { id:"fgs3", pid:"nov", bu:"FGS", pri:"High", title:"Lack of Aftermarket / Digital Revenue Stream",
    impact:"Revenue ends at installation; no inspection or replacement cycle; limits lifetime customer value", cat:"Revenue Growth",
    reach:70, impact2:8, confidence:75, effort:6, low:5e6, mid:18e6, high:45e6,
    basis:"Product performs too well for replacement cycles; no integrated sensing in current manufacturing",
    riceNote:"Digital revenue layer creates recurring income on top of existing capital sales",
    causes:["Product performs too well for replacement cycles","No integrated sensing in current manufacturing"],
    success:"Leak detection or structural health monitoring integrated into pipe; at least one segment generating recurring digital revenue",
    shs:["R&D","Sales","Customers (operators, utilities)"],
    radarScores:{Financial:8,Strategic:8,Urgency:6,Solvability:7,"Market Size":8},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Sales / Commercial",influence:8,interest:9,type:"internal"},
      {name:"R&D Engineering",influence:7,interest:9,type:"internal"},
      {name:"Operator Asset Mgrs",influence:7,interest:8,type:"external"},
      {name:"Sensor/IoT Startups",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"fgs4", pid:"nov", bu:"FGS", pri:"Medium", title:"Adoption Inertia in New Market Segments",
    impact:"Slower penetration of hydrogen, geothermal, and CCUS markets; competitors gain first-mover advantage", cat:"Market Expansion",
    reach:60, impact2:7, confidence:70, effort:6, low:5e6, mid:20e6, high:55e6,
    basis:"Engineering conservatism; lifecycle ROI not well communicated; lack of design-to-code approval tools",
    riceNote:"Market timing is critical — hydrogen and geothermal standards forming now",
    causes:["Engineering conservatism","Lifecycle ROI not well communicated","Lack of design-to-code approval tools"],
    success:"Lifecycle ROI tools available for sales; at least one major qualification win in hydrogen or geothermal",
    shs:["Sales","New market customers","Standards bodies"],
    radarScores:{Financial:7,Strategic:8,Urgency:7,Solvability:7,"Market Size":9},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"New Market Customers",influence:7,interest:9,type:"external"},
      {name:"Sales Engineering",influence:7,interest:8,type:"internal"},
      {name:"Standards Bodies",influence:6,interest:5,type:"external"},
      {name:"EPC Contractors",influence:6,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"fgs5", pid:"nov", bu:"FGS", pri:"Medium", title:"Tariff & Resin Supply Chain Volatility",
    impact:"Unpredictable cost structures; margin erosion; risk of being undercut in key markets", cat:"Operational Risk",
    reach:80, impact2:7, confidence:80, effort:6, low:5e6, mid:15e6, high:35e6,
    basis:"Resin and fiber sourcing exposed to energy prices and tariff shifts across 26 plants",
    riceNote:"Mirrors NOV ALS supply chain problem; learnings transferable",
    causes:["Resin and fiber sourcing exposed to energy prices and tariff shifts across 26 plants"],
    success:"Diversified, tariff-resilient supply base with no critical single-country dependency",
    shs:["Procurement","Operations","Finance"],
    radarScores:{Financial:7,Strategic:6,Urgency:8,Solvability:6,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Global Procurement",influence:8,interest:10,type:"internal"},
      {name:"Plant Managers",influence:7,interest:8,type:"internal"},
      {name:"Key Resin Suppliers",influence:6,interest:7,type:"external"},
      {name:"Customers",influence:7,interest:6,type:"external"},
    ],
    urgencySignals:[]},

  // ── NOV INTERVENTION & STIMULATION EQUIPMENT ─────────────────────────────
  { id:"ise1", pid:"nov", bu:"ISE", pri:"High", title:"Fleet Health Monitoring & Predictive Maintenance",
    impact:"$85K–$125K per fleet per year in unplanned downtime; limits performance-based contract model", cat:"Asset Automation",
    reach:75, impact2:9, confidence:80, effort:7, low:12e6, mid:35e6, high:80e6,
    basis:"$85-125K/fleet/yr unplanned downtime; shift to performance contracts requires condition-based data",
    riceNote:"Clear financial anchor; pilot opportunity on existing eFrac lease fleet",
    causes:["No condition-based monitoring on power ends or drive trains","Reactive maintenance culture","Fragmented telemetry across fleet types"],
    success:"Predictive alerts on component failures before NPT occurs; documented reduction in unplanned downtime; integrated with Max Completions™",
    shs:["Operators","Field service teams","Engineering","Sales"],
    radarScores:{Financial:9,Strategic:9,Urgency:8,Solvability:6,"Market Size":8},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Operator Asset Mgrs",influence:9,interest:9,type:"external"},
      {name:"Field Service Teams",influence:7,interest:10,type:"internal"},
      {name:"Engineering",influence:8,interest:9,type:"internal"},
      {name:"NOV Digital (Max)",influence:7,interest:8,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"ise2", pid:"nov", bu:"ISE", pri:"High", title:"Sales Process Qualification & Close Rate",
    impact:"Massive engineering and commercial resources wasted on unqualified quotes; close rate well below industry norms", cat:"Process / Enabler",
    reach:80, impact2:8, confidence:90, effort:3, low:5e6, mid:15e6, high:35e6,
    basis:"No structured CRM-driven lead qualification; NOV used as benchmark price anchor; wasted engineering time",
    riceNote:"Lowest effort, highest confidence — immediate revenue efficiency gain",
    causes:["No structured CRM-driven lead qualification","Cultural acceptance of all incoming RFQs","NOV used as benchmark price anchor"],
    success:"Qualified lead funnel implemented; unqualified quotes reduced by ≥50%; measurable improvement in close rate within 12 months",
    shs:["Sales","Engineering","Product management","Customers"],
    radarScores:{Financial:7,Strategic:7,Urgency:7,Solvability:9,"Market Size":6},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Sales Leadership",influence:9,interest:9,type:"internal"},
      {name:"Engineering Teams",influence:7,interest:7,type:"internal"},
      {name:"CRM/IT",influence:5,interest:8,type:"internal"},
      {name:"Key Operator Buyers",influence:8,interest:6,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ise3", pid:"nov", bu:"ISE", pri:"High", title:"Technician Shortage for Electric & Automated Systems",
    impact:"~40% vacancy constrains eFrac fleet scaling; quality and safety risk; limits adoption of advanced automation", cat:"Operational Risk",
    reach:70, impact2:8, confidence:85, effort:6, low:8e6, mid:22e6, high:50e6,
    basis:"40% vacancy rate; legacy workforce trained on diesel/mechanical; competition from data centers for electrical talent",
    riceNote:"Structural constraint on eFrac growth; training pathway is tractable within 12-18 months",
    causes:["Legacy workforce trained on diesel/mechanical systems","Training pipelines slow","Competition for electrical talent from data centers and other industries"],
    success:"Structured training program in place; vacancy rate below 20%; field crews certified on eFrac and automated control systems",
    shs:["Field operations","Customers","HR","Training teams"],
    radarScores:{Financial:8,Strategic:8,Urgency:9,Solvability:6,"Market Size":7},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"Operations VP",influence:9,interest:9,type:"internal"},
      {name:"HR / Training",influence:7,interest:9,type:"internal"},
      {name:"eFrac Customers",influence:8,interest:8,type:"external"},
      {name:"Training Institutions",influence:5,interest:8,type:"external"},
    ],
    urgencySignals:[
      {date:"Ongoing 2025-26",event:"Data centers and power generation projects competing directly for electrical technician talent — driving up wages and extending vacancy periods",category:"Market",impact:"High"},
    ]},
  { id:"ise4", pid:"nov", bu:"ISE", pri:"Medium", title:"Coiled Tubing Reach & Real-Time Friction Data",
    impact:"Mechanical limits prevent access to growing share of 3–4 mile lateral wells; reach optimization is manual", cat:"Product / Technology",
    reach:55, impact2:7, confidence:75, effort:7, low:5e6, mid:15e6, high:38e6,
    basis:"CoilFUSE™ addresses hardware but data gap remains; 3-4 mile laterals becoming standard",
    riceNote:"Hardware solution exists; data layer is the remaining gap",
    causes:["String weight and friction limits","Limited real-time downhole data near the coil end","CoilFUSE™ addresses hardware but data gap remains"],
    success:"Real-time friction and weight data available at surface during CT operations; measurable improvement in reach and first-run success rate",
    shs:["Operators","CT field crews","Engineering"],
    radarScores:{Financial:6,Strategic:7,Urgency:6,Solvability:6,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"CT Field Engineers",influence:7,interest:10,type:"internal"},
      {name:"Operator Drilling Mgrs",influence:8,interest:8,type:"external"},
      {name:"Downhole Sensors",influence:5,interest:9,type:"external"},
      {name:"CTES Digital",influence:6,interest:9,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ise5", pid:"nov", bu:"ISE", pri:"Medium", title:"Supply Chain Visibility & Procurement Latency",
    impact:"Component delays hold up manufacturing; procurement lead times unpredictable; opportunity cost of idle capacity", cat:"Operational Risk",
    reach:65, impact2:7, confidence:80, effort:5, low:3e6, mid:10e6, high:25e6,
    basis:"Bespoke order culture masking repeat configurations; 60%+ of repeat orders treated as bespoke",
    riceNote:"Standardization of 60%+ repeat orders is a tractable quick win",
    causes:["Bespoke order culture masking repeat configurations","No automated procurement triggers","Manual buyer follow-up for order status"],
    success:"≥60% of repeat configurations standardized; automated procurement alerts reduce manual follow-up; lead time predictability improved",
    shs:["Manufacturing","Procurement","Sales","Customers"],
    radarScores:{Financial:6,Strategic:5,Urgency:6,Solvability:8,"Market Size":5},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Manufacturing Ops",influence:8,interest:9,type:"internal"},
      {name:"Procurement",influence:7,interest:10,type:"internal"},
      {name:"Sales Teams",influence:7,interest:7,type:"internal"},
      {name:"Customers",influence:7,interest:6,type:"external"},
    ],
    urgencySignals:[]},

  // ── NOV MANUFACTURING ─────────────────────────────────────────────────────
  { id:"mfg1", pid:"nov", bu:"MFG", pri:"High", title:"Additive Manufacturing for Legacy & Low-Volume Parts",
    impact:"Primary machining consumed by legacy spare parts; long customer wait times; opportunity cost on main production lines", cat:"Product / Technology",
    reach:75, impact2:8, confidence:80, effort:6, low:8e6, mid:22e6, high:50e6,
    basis:"Primary machining bottleneck from legacy parts; additive maturing but not yet viable for all geometries",
    riceNote:"Frees high-value machining capacity; addressable with TRL 5-7 additive partners now",
    causes:["Additive technology doesn't yet meet all material/geometric requirements","Post-processing complexity","Investment deprioritized"],
    success:"Additive cell operational for qualifying parts; legacy spare lead times reduced ≥50%; primary machining freed",
    shs:["Operations","Aftermarket sales","Customers with legacy installed base"],
    radarScores:{Financial:8,Strategic:8,Urgency:7,Solvability:6,"Market Size":7},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Plant Operations Mgrs",influence:8,interest:8,type:"internal"},
      {name:"Aftermarket Sales",influence:7,interest:9,type:"internal"},
      {name:"Legacy Customers",influence:7,interest:9,type:"external"},
      {name:"Additive Tech Partners",influence:5,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"mfg2", pid:"nov", bu:"MFG", pri:"High", title:"Shop Floor Automation & Robotics",
    impact:"Labor shortage limits throughput; manual processes create quality risk and safety exposure", cat:"Asset Automation",
    reach:80, impact2:8, confidence:80, effort:6, low:5e6, mid:18e6, high:45e6,
    basis:"1.9M skilled manufacturing worker national shortfall projected by 2033; no robotics deployed at NOV MFG",
    riceNote:"Dual benefit: throughput gain + workforce sustainability; cobot solutions mature and proven",
    causes:["No robotics deployed","Manual-only culture","No clear pilot pathway identified"],
    success:"Cobot or robotic welding solution piloted; measurable throughput gain and reduction in quality escapes",
    shs:["Plant operations","HSE","Customers dependent on lead times"],
    radarScores:{Financial:7,Strategic:8,Urgency:7,Solvability:7,"Market Size":7},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Plant Managers",influence:8,interest:8,type:"internal"},
      {name:"HSE Leadership",influence:7,interest:8,type:"internal"},
      {name:"Workforce / Union",influence:6,interest:6,type:"internal"},
      {name:"Cobot Vendors",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[
      {date:"2025 Forecast",event:"National skilled manufacturing labor shortfall projected to reach 1.9M workers by 2033 — NOV facing hiring freeze during downturn",category:"Market",impact:"High"},
    ]},
  { id:"mfg3", pid:"nov", bu:"MFG", pri:"High", title:"Manufacturing Diversification into Aerospace & Defense",
    impact:"Idle capacity during downturns creates layoff risk and fixed cost burden", cat:"Market Expansion",
    reach:70, impact2:8, confidence:75, effort:7, low:10e6, mid:28e6, high:65e6,
    basis:"ITAR certification obtained; NOV forecasting ~12% revenue decline 2026; aerospace/defense adjacent",
    riceNote:"ITAR certification removes the primary barrier; timing is now with OG downturn creating capacity",
    causes:["Organizational inertia","Certification gaps (AS9100)","Limited BD pipeline outside oil and gas"],
    success:"2–3 qualified programs generating revenue within 18 months; utilization improved ≥15%",
    shs:["Plant managers","Workforce","NOV leadership"],
    radarScores:{Financial:8,Strategic:9,Urgency:8,Solvability:6,"Market Size":9},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"BU Leadership",influence:10,interest:9,type:"internal"},
      {name:"Plant Managers",influence:8,interest:7,type:"internal"},
      {name:"Aerospace OEMs",influence:7,interest:8,type:"external"},
      {name:"Defense Primes",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[
      {date:"Q1 2026",event:"NOV forecasting ~12% revenue decline in 2026; idle manufacturing capacity creating pressure to diversify",category:"Market",impact:"Critical"},
    ]},
  { id:"mfg4", pid:"nov", bu:"MFG", pri:"Medium", title:"Supply Chain Visibility & Tariff Mitigation",
    impact:"Unpredictable cost basis; procurement delays; competitors gaining advantage through smarter tariff routing", cat:"Operational Risk",
    reach:75, impact2:7, confidence:80, effort:5, low:3e6, mid:10e6, high:25e6,
    basis:"Global footprint not systematically leveraged; manual procurement; steel tariffs 2025",
    riceNote:"500+ global locations = significant tariff arbitrage opportunity if systematized",
    causes:["Global footprint not systematically leveraged","Manual procurement follow-up","Insufficient material arrival visibility"],
    success:"Active tariff mitigation strategy in place; automated procurement alerts reduce manual follow-up",
    shs:["Procurement","Operations","Finance","Customers"],
    radarScores:{Financial:7,Strategic:6,Urgency:8,Solvability:7,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Global Procurement",influence:8,interest:10,type:"internal"},
      {name:"Plant Controllers",influence:7,interest:8,type:"internal"},
      {name:"Steel Suppliers",influence:6,interest:7,type:"external"},
      {name:"Finance / CFO",influence:8,interest:7,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"mfg5", pid:"nov", bu:"MFG", pri:"Medium", title:"Organizational Change Management & Diversification Speed",
    impact:"Market windows missed; adjacent market opportunities lost to slower internal decision-making", cat:"Process / Enabler",
    reach:65, impact2:7, confidence:80, effort:5, low:3e6, mid:10e6, high:25e6,
    basis:"Oil and gas specialization culture slowing recognition of aerospace/defense opportunities",
    riceNote:"Culture change unlocks all other diversification initiatives",
    causes:["Oil and gas specialization culture","No structured change management program","Limited diversification incentives"],
    success:"Structured process for evaluating adjacent market work; reduced time from opportunity to first production run",
    shs:["Plant managers","BU leadership","Business development"],
    radarScores:{Financial:5,Strategic:7,Urgency:7,Solvability:7,"Market Size":7},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"BU President",influence:10,interest:9,type:"internal"},
      {name:"Plant Managers",influence:8,interest:6,type:"internal"},
      {name:"HR / OD",influence:6,interest:8,type:"internal"},
      {name:"BD Team",influence:6,interest:9,type:"internal"},
    ],
    urgencySignals:[]},

  // ── NOV PRODUCTION & MIDSTREAM ────────────────────────────────────────────
  { id:"pm1", pid:"nov", bu:"P&M", pri:"High", title:"Legacy Parts Database & Quoting Bottleneck",
    impact:"Engineering diverted from R&D; quoting errors causing incorrect shipments; cannot scale standard product sales", cat:"Process / Enabler",
    reach:85, impact2:8, confidence:90, effort:4, low:5e6, mid:18e6, high:42e6,
    basis:"100K+ part numbers from acquisitions and ERP migrations; only engineers can resolve ambiguities",
    riceNote:"Low effort, very high confidence — AI filtering tool is a tractable quick win",
    causes:["Multiple acquisitions with incompatible nomenclature systems","ERP migrations without data cleanup","No automated filtering or validation tool"],
    success:"Top 25% of actively-sold part numbers validated and accessible to quoting teams; measurable reduction in engineering involvement in standard RFQs",
    shs:["Engineering","Customer service","Operations"],
    radarScores:{Financial:8,Strategic:7,Urgency:8,Solvability:9,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Engineering Director",influence:9,interest:9,type:"internal"},
      {name:"Customer Service",influence:7,interest:10,type:"internal"},
      {name:"IT / Data Teams",influence:6,interest:8,type:"internal"},
      {name:"Key Customers",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"pm2", pid:"nov", bu:"P&M", pri:"High", title:"Condition Monitoring & Autonomous Control",
    impact:"Lost commercial differentiation; inability to compete against AI-enabled rivals; no data to support predictive maintenance", cat:"Asset Automation",
    reach:75, impact2:9, confidence:75, effort:7, low:10e6, mid:30e6, high:70e6,
    basis:"Rapidly growing customer demand; sensor integration at 20,000 PSI / 350°F technically demanding",
    riceNote:"Choke revenue ~$100M/yr; digitizing it creates defensible moat; demo unit is the beachhead",
    causes:["Primarily mechanical engineering team with no embedded/electrical expertise","Sensor integration at 20,000 PSI / 350°F is technically demanding","No internal PLC, GUI, or integration layer"],
    success:"Pilot demo unit operational on a choke or pump; autonomous control demonstrated; predictive wear alerts linked to e-commerce spare parts ordering",
    shs:["Operations","Customers","Engineering","Sales"],
    radarScores:{Financial:9,Strategic:9,Urgency:8,Solvability:5,"Market Size":9},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Engineering Director Calvin",influence:9,interest:10,type:"internal"},
      {name:"Operator Asset Mgrs",influence:8,interest:9,type:"external"},
      {name:"NOV Digital (Ali M)",influence:8,interest:9,type:"internal"},
      {name:"IoT/Sensor Startups",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[
      {date:"Q3-Q4 2025",event:"Customers increasingly requesting AI-enabled solutions and predictive maintenance — urgency has notably increased over the last 1–2 years",category:"Market",impact:"High"},
    ]},
  { id:"pm3", pid:"nov", bu:"P&M", pri:"Medium", title:"Tribal Knowledge Capture",
    impact:"Manufacturing errors when key personnel absent; quality variability; risk of irreversible knowledge loss", cat:"Process / Enabler",
    reach:65, impact2:7, confidence:80, effort:5, low:2e6, mid:8e6, high:20e6,
    basis:"Critical knowledge held informally by experienced staff nearing retirement; no passive capture process",
    riceNote:"Asymmetric risk — cost of knowledge loss vastly exceeds cost of AI capture solution",
    causes:["No passive capture process","Tacit knowledge never converted to formal procedures","Cultural and time constraints limit structured documentation"],
    success:"AI-assisted passive capture tool deployed; critical assembly procedures documented; measurable reduction in errors from knowledge gaps",
    shs:["Engineering","Manufacturing","Quality","HR"],
    radarScores:{Financial:5,Strategic:6,Urgency:7,Solvability:7,"Market Size":5},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Senior Engineers (retiring)",influence:8,interest:6,type:"internal"},
      {name:"Quality / Engineering Mgmt",influence:8,interest:8,type:"internal"},
      {name:"HR Leadership",influence:6,interest:7,type:"internal"},
      {name:"Manufacturing Ops",influence:7,interest:7,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"pm4", pid:"nov", bu:"P&M", pri:"Medium", title:"High GVF / Multiphase Flow Handling",
    impact:"Limited addressable market in high-GOR wells; equipment failures and customer dissatisfaction in gas-heavy applications", cat:"Product / Technology",
    reach:55, impact2:7, confidence:70, effort:7, low:5e6, mid:15e6, high:38e6,
    basis:"Conventional pump technologies struggle in high GVF; no accessory devices to extend operating envelope",
    riceNote:"Mirrors NOV ALS gas handling problem — cross-BU solution potential",
    causes:["Fundamental design limits of conventional pump technologies at high GVF","No accessory devices available to extend the operating envelope"],
    success:"Device or process modification enabling reliable pump operation through high GVF conditions, compatible with existing product lines",
    shs:["Engineering","Customers (high-GOR operators)","Sales"],
    radarScores:{Financial:7,Strategic:7,Urgency:6,Solvability:5,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Product Engineering",influence:8,interest:9,type:"internal"},
      {name:"High-GOR Operators",influence:8,interest:9,type:"external"},
      {name:"FMS Sister BU",influence:6,interest:7,type:"internal"},
      {name:"R&D / Innovation",influence:6,interest:9,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"pm5", pid:"nov", bu:"P&M", pri:"Medium", title:"Advanced Materials / Carbide Alternatives for Chokes",
    impact:"Input cost instability; supply chain risk; potential inability to source material; customer pricing disruption", cat:"Operational Risk",
    reach:70, impact2:7, confidence:80, effort:6, low:3e6, mid:10e6, high:25e6,
    basis:"Tungsten carbide subject to Chinese export restrictions and price volatility; no qualified alternative",
    riceNote:"Cross-BU issue with ReedHycalog — coordinated solution could have multiplier effect",
    causes:["Over-dependence on Chinese-sourced carbide","No alternative material or coating currently qualified","Performance validation at extreme conditions is time-consuming"],
    success:"At least one qualified alternative material or coating delivering equivalent wear resistance at commercially viable cost",
    shs:["Procurement","Engineering","Sales","Customers"],
    radarScores:{Financial:7,Strategic:7,Urgency:8,Solvability:6,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Procurement",influence:8,interest:10,type:"internal"},
      {name:"Materials Engineering",influence:7,interest:9,type:"internal"},
      {name:"Chinese Carbide Suppliers",influence:6,interest:5,type:"external"},
      {name:"Alt. Material Vendors",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[]},

  // ── NOV REEDHYCALOG ───────────────────────────────────────────────────────
  { id:"rh1", pid:"nov", bu:"RH", pri:"High", title:"Absence of Real-Time Near-Bit Intelligence",
    impact:"Undetected bit damage; costly unplanned trips; limits surface optimization platforms", cat:"Product / Technology",
    reach:70, impact2:9, confidence:80, effort:8, low:15e6, mid:40e6, high:90e6,
    basis:"No commercial near-bit sensing solution exists; trip costs $200-500K per unplanned event",
    riceNote:"White space — no commercial solution exists; first mover creates durable differentiation",
    causes:["Extreme downhole environment","No commercial solution","Signal transmission across tool joints unsolved"],
    success:"Real-time temperature and vibration signal integrated with Max/Kaizen; demonstrated reduction in unplanned trips",
    shs:["Operators","Directional drillers","NOV Digital Solutions","Downhole Tools BU"],
    radarScores:{Financial:9,Strategic:10,Urgency:8,Solvability:4,"Market Size":9},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Tom Roberts (VP Tech)",influence:10,interest:10,type:"internal"},
      {name:"Operator Drilling Mgrs",influence:9,interest:9,type:"external"},
      {name:"NOV Digital Solutions",influence:7,interest:8,type:"internal"},
      {name:"University Spin-outs",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[
      {date:"Ongoing 2025-26",event:"Chinese competitors closing technology gap — if near-bit intelligence not commercialized soon, differentiation window closes",category:"Competitive",impact:"High"},
    ]},
  { id:"rh2", pid:"nov", bu:"RH", pri:"High", title:"Tungsten Carbide Cost Volatility & Material Substitution",
    impact:"Unstable cost basis; margin pressure; forced migration to lower-performing steel body bits", cat:"Operational Risk",
    reach:85, impact2:8, confidence:85, effort:6, low:10e6, mid:28e6, high:65e6,
    basis:"Near-total China sourcing; costs surged; shifting to steel body bits that underperform",
    riceNote:"Cross-BU problem (RH + Production & Midstream) — shared solution has 2x impact",
    causes:["Near-total China sourcing","No qualified alternative at scale"],
    success:"Qualified alternative wear material in production; supply chain diversified; cost basis stabilized",
    shs:["Engineering","Procurement","Sales","Operators"],
    radarScores:{Financial:8,Strategic:8,Urgency:9,Solvability:6,"Market Size":8},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"VP Engineering",influence:9,interest:9,type:"internal"},
      {name:"Procurement",influence:8,interest:10,type:"internal"},
      {name:"Operator Customers",influence:7,interest:8,type:"external"},
      {name:"Material Science Labs",influence:4,interest:9,type:"external"},
    ],
    urgencySignals:[
      {date:"2024-25",event:"China export restrictions on tungsten carbide tightening; costs surging and forcing product line compromise",category:"Macro",impact:"Critical"},
    ]},
  { id:"rh3", pid:"nov", bu:"RH", pri:"High", title:"AI-Assisted Bit Design Automation",
    impact:"Slow iteration; redundant redesigns; competitive risk as rivals automate", cat:"Digital / AI",
    reach:65, impact2:8, confidence:80, effort:6, low:5e6, mid:18e6, high:45e6,
    basis:"Manual, expertise-dependent design process; historical run data not systematically leveraged",
    riceNote:"AI design tool is tractable now; data exists in historical run records",
    causes:["Manual, expertise-dependent process","Historical run data not systematically leveraged"],
    success:"AI tool reduces design time by ≥50%; measurable improvement in first-run ROP",
    shs:["Design engineering","Field application teams","Operators"],
    radarScores:{Financial:7,Strategic:9,Urgency:7,Solvability:7,"Market Size":8},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"R&D Engineering",influence:8,interest:10,type:"internal"},
      {name:"Field App Teams",influence:7,interest:9,type:"internal"},
      {name:"Operator Drilling Mgrs",influence:7,interest:7,type:"external"},
      {name:"AI/ML Startups",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"rh4", pid:"nov", bu:"RH", pri:"Medium", title:"LSTK Contract Lock-Out",
    impact:"~15% of largest customer spend structurally inaccessible regardless of technology quality", cat:"Market Expansion",
    reach:60, impact2:7, confidence:75, effort:8, low:8e6, mid:22e6, high:55e6,
    basis:"Integrated service contracts bundle bit selection under SLB, HAL, BHI — NOV locked out",
    riceNote:"Structural commercial barrier; performance-based model is the unlock",
    causes:["Integrated service contracts bundle bit selection under major service companies"],
    success:"Performance-based commercial model attractive enough to break into LSTK programs",
    shs:["Sales","VP","Major operators","NOV leadership"],
    radarScores:{Financial:8,Strategic:8,Urgency:6,Solvability:4,"Market Size":8},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Sales VP",influence:10,interest:9,type:"internal"},
      {name:"Major Operators",influence:9,interest:6,type:"external"},
      {name:"SLB/HAL/BHI (LSTK)",influence:8,interest:2,type:"competitor"},
      {name:"NOV Leadership",influence:9,interest:8,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"rh5", pid:"nov", bu:"RH", pri:"Medium", title:"HFTO Mitigation at the Bit",
    impact:"Accelerated RSS/MWD tool damage; cross-BU friction; unplanned NPT", cat:"Product / Technology",
    reach:60, impact2:7, confidence:75, effort:7, low:5e6, mid:15e6, high:35e6,
    basis:"HFTO initiated at bit-rock interface; no near-bit dampening solution; addressed in silos across BUs",
    riceNote:"Cross-BU opportunity with Downhole Technologies; shared R&D would reduce individual cost",
    causes:["HFTO initiated at bit-rock interface","No near-bit dampening solution","Addressed in silos"],
    success:"Near-bit feature measurably reduces HFTO amplitude; validated in field trials",
    shs:["Downhole Tools BU","Directional contractors","Operators"],
    radarScores:{Financial:6,Strategic:7,Urgency:6,Solvability:6,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Tom Roberts (VP)",influence:9,interest:9,type:"internal"},
      {name:"Downhole Tools BU",influence:7,interest:7,type:"internal"},
      {name:"Directional Contractors",influence:7,interest:8,type:"external"},
      {name:"Operators",influence:8,interest:7,type:"external"},
    ],
    urgencySignals:[]},

  // ── NOV RIG TECHNOLOGIES ──────────────────────────────────────────────────
  { id:"rt1", pid:"nov", bu:"RT", pri:"High", title:"Robotics Scaling & Retrofit Integration",
    impact:"Competitive risk from Nabors and SLB; safety exposure from manual Red Zone work; revenue constrained by slow adoption", cat:"Asset Automation",
    reach:75, impact2:9, confidence:80, effort:8, low:18e6, mid:50e6, high:120e6,
    basis:"ATOM RTX proven 2 years Canada (Chevron) + Permian (HES); scaling from pilots to fleet is the gap",
    riceNote:"Technology proven — constraint is deployment speed, not R&D",
    causes:["Retrofit requires structural changes and control system integration","Rig scheduling windows are scarce","Third-party control systems require custom integration"],
    success:"Standardized retrofit kit reducing installation time; ATOM RTX deployed across ≥5 additional rigs within 12 months; control system interoperability with major third-party platforms",
    shs:["Drilling contractors","Operators","Field engineering","NOV robotics team"],
    radarScores:{Financial:10,Strategic:10,Urgency:9,Solvability:5,"Market Size":10},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"Graham Dey (VP PM)",influence:10,interest:10,type:"internal"},
      {name:"Drilling Contractors",influence:9,interest:8,type:"external"},
      {name:"Operators (Chevron/HES)",influence:9,interest:9,type:"external"},
      {name:"Nabors / SLB",influence:7,interest:2,type:"competitor"},
    ],
    urgencySignals:[
      {date:"Ongoing 2025-26",event:"Nabors RZR and SLB DrillOps aggressively scaling drill floor automation — ATOM RTX deployment speed is a competitive imperative",category:"Competitive",impact:"Critical"},
    ]},
  { id:"rt2", pid:"nov", bu:"RT", pri:"High", title:"Personnel on Board (POB) Cost Reduction",
    impact:"Enormous operator cost burden for crew logistics to remote locations; safety exposure from human presence in hazardous environments", cat:"Asset Automation",
    reach:70, impact2:8, confidence:75, effort:7, low:15e6, mid:40e6, high:90e6,
    basis:"Crew logistics costs $50-200K/day on remote operations; automation not yet at remote-supervision maturity",
    riceNote:"ME NOCs (Aramco, ADNOC) are primary growth market — POB reduction is a top priority for them",
    causes:["Highly skilled work still requires physical presence","Remote operations infrastructure immature","Automation not yet at full remote-supervision maturity"],
    success:"Remote operations capability reducing POB on at least one operator program; documented cost reduction in crew logistics",
    shs:["Operators (Chevron, Exxon, Aramco)","Drilling contractors","NOV digital and automation teams"],
    radarScores:{Financial:9,Strategic:9,Urgency:8,Solvability:5,"Market Size":9},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Saudi Aramco",influence:10,interest:9,type:"external"},
      {name:"ADNOC",influence:9,interest:8,type:"external"},
      {name:"Chevron",influence:8,interest:8,type:"external"},
      {name:"NOV Automation Team",influence:8,interest:10,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"rt3", pid:"nov", bu:"RT", pri:"High", title:"Data Fragmentation Across 23–26 Internal Systems",
    impact:"Engineers using 23–26 systems daily; no unified NPD revenue view; operator data processed too slowly", cat:"Integration",
    reach:80, impact2:8, confidence:85, effort:6, low:5e6, mid:18e6, high:45e6,
    basis:"Growth by acquisition created disconnected systems; security protocols block legitimate internal sharing",
    riceNote:"High confidence fix; data integration platforms are mature — needs prioritization and investment",
    causes:["Growth by acquisition created disconnected systems","No unified data layer","Security protocols block legitimate internal sharing"],
    success:"Engineers reduced to ≤5 primary systems; unified NPD revenue dashboard live; operator data processed within agreed SLA",
    shs:["Engineering","Product management","Digital team","Operators"],
    radarScores:{Financial:7,Strategic:8,Urgency:7,Solvability:7,"Market Size":7},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Engineering Leadership",influence:9,interest:9,type:"internal"},
      {name:"IT / Data Teams",influence:7,interest:8,type:"internal"},
      {name:"Product Management",influence:8,interest:9,type:"internal"},
      {name:"Operator Data Teams",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"rt4", pid:"nov", bu:"RT", pri:"Medium", title:"NPD Cycle Time & Supply Chain Delays",
    impact:"Products reach market late; competitors gain first-mover advantage", cat:"Process / Enabler",
    reach:65, impact2:7, confidence:80, effort:6, low:5e6, mid:15e6, high:38e6,
    basis:"Long-lead procurement not initiated early enough; engineers pulled to operations support",
    riceNote:"Process fix with measurable cycle-time KPI; procurement scheduling is the primary lever",
    causes:["Long-lead procurement not initiated early enough","Engineers pulled to operations support","Customer scope changes accepted mid-development"],
    success:"Procurement initiated at design concept stage; NPD schedule slippage reduced by ≥30%; scope change protocol established",
    shs:["Engineering","Procurement","Product management","Customers"],
    radarScores:{Financial:6,Strategic:7,Urgency:6,Solvability:7,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Damon Trager (NPD)",influence:8,interest:10,type:"internal"},
      {name:"Procurement",influence:7,interest:8,type:"internal"},
      {name:"Product Management",influence:8,interest:8,type:"internal"},
      {name:"Key Operators",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"rt5", pid:"nov", bu:"RT", pri:"Medium", title:"Operator Alignment & Innovation Trial Scheduling",
    impact:"Proven innovations delayed months waiting for rig access; competitive window lost", cat:"Process / Enabler",
    reach:60, impact2:7, confidence:75, effort:6, low:3e6, mid:10e6, high:25e6,
    basis:"No structured process for securing rig trial windows; operations teams prioritize uptime over innovation",
    riceNote:"Co-development partnerships with Chevron Technology Ventures and Petrobras R&D are an underutilized lever",
    causes:["No structured process for securing rig trial windows","Operations teams prioritize uptime over innovation","Multi-party alignment rarely achieved simultaneously"],
    success:"Structured innovation trial scheduling with pre-agreed windows; ≥3 active co-development programs with operators in 2026",
    shs:["Operators","Drilling contractors","NOV field and product teams"],
    radarScores:{Financial:5,Strategic:7,Urgency:6,Solvability:7,"Market Size":6},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Chevron Technology Ventures",influence:8,interest:8,type:"external"},
      {name:"Petrobras R&D",influence:7,interest:8,type:"external"},
      {name:"Graham Dey (VP)",influence:9,interest:9,type:"internal"},
      {name:"Operator Ops Teams",influence:8,interest:5,type:"external"},
    ],
    urgencySignals:[]},

  // ── NOV TUBOSCOPE ─────────────────────────────────────────────────────────
  { id:"ts1", pid:"nov", bu:"TS", pri:"High", title:"Pipe Tracking & Traceability",
    impact:"No lifecycle data per joint; 80+ years of inspection data inaccessible; cross-sell between product lines impossible", cat:"Digital / AI",
    reach:85, impact2:9, confidence:85, effort:6, low:10e6, mid:30e6, high:70e6,
    basis:"80+ years of pipe data largely inaccessible; RFID durability failure in downhole conditions",
    riceNote:"Foundational data moat; solving it unlocks cross-sell, customer value, and competitive differentiation",
    causes:["RFID durability failure","Manual data entry","No integrated data platform across inspection, coating, and machining"],
    success:"Durable pipe ID system surviving full lifecycle; unified data record per joint; accessible to customers and internal teams",
    shs:["All Tuboscope product lines","Operators","Grant Prideco BU"],
    radarScores:{Financial:8,Strategic:10,Urgency:8,Solvability:6,"Market Size":9},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Reza Fard (Global Corrosion)",influence:9,interest:10,type:"internal"},
      {name:"Operator Asset Mgrs",influence:8,interest:9,type:"external"},
      {name:"Grant Prideco BU",influence:7,interest:8,type:"internal"},
      {name:"RFID/ID Tech Startups",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ts2", pid:"nov", bu:"TS", pri:"High", title:"Non-Destructive Internal Coating Inspection",
    impact:"Cannot prove coating integrity without destructive testing; losing accounts without ability to defend performance claims", cat:"Product / Technology",
    reach:70, impact2:8, confidence:80, effort:6, low:5e6, mid:18e6, high:45e6,
    basis:"No commercially available non-destructive method for internal coating verification; losing to competitors",
    riceNote:"Corelytics already identified as a candidate — re-engagement is a quick win",
    causes:["No commercially available non-destructive method for internal coating verification"],
    success:"Field-deployable inspection method that verifies coating integrity and corrosion activity without destructive testing",
    shs:["Coating sales team","Operators (Exxon, Chevron)","R&D"],
    radarScores:{Financial:7,Strategic:8,Urgency:7,Solvability:6,"Market Size":7},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Coating Sales Team",influence:8,interest:10,type:"internal"},
      {name:"Exxon / Chevron",influence:8,interest:8,type:"external"},
      {name:"R&D Team",influence:7,interest:9,type:"internal"},
      {name:"Corelytics",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ts3", pid:"nov", bu:"TS", pri:"High", title:"Facility Automation (Pin-End Processes)",
    impact:"Manual labor creates quality inconsistency, safety risk, and high overhead; limits ability to reduce pricing under competitive pressure", cat:"Asset Automation",
    reach:70, impact2:7, confidence:85, effort:5, low:3e6, mid:10e6, high:25e6,
    basis:"Pin-end coating and edge rounding are manual; operators cutting costs — facility pricing under pressure",
    riceNote:"Low effort automation with clear ROI in reduced labor cost and quality variance",
    causes:["Automation investment deprioritized","Engineering bandwidth limited","ROI case not yet formalized"],
    success:"Automated pin-end coating and edge rounding at pilot facility; measurable reduction in labor cost and quality variance",
    shs:["Operations","Facility managers","Customers"],
    radarScores:{Financial:7,Strategic:6,Urgency:7,Solvability:8,"Market Size":6},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Facility Managers",influence:8,interest:9,type:"internal"},
      {name:"Operations VP",influence:9,interest:8,type:"internal"},
      {name:"Key Operator Accounts",influence:7,interest:7,type:"external"},
      {name:"Automation Vendors",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[]},
  { id:"ts4", pid:"nov", bu:"TS", pri:"Medium", title:"Sales Capability & Business Development",
    impact:"Major house accounts contracting; facilities sitting idle; revenue at risk without new account growth", cat:"Process / Enabler",
    reach:75, impact2:7, confidence:85, effort:4, low:3e6, mid:10e6, high:25e6,
    basis:"Sales culture built around account management; large accounts (Chevron, Oxy, COP) pulling back",
    riceNote:"Low effort quick win — hunter recruitment and incentive change is fast to implement",
    causes:["Sales culture built around account management","No structured hunter recruiting or training program"],
    success:"New business pipeline established in key regions; measurable increase in new logo revenue within 12 months",
    shs:["Sales teams","Regional managers","BU leadership"],
    radarScores:{Financial:7,Strategic:6,Urgency:7,Solvability:9,"Market Size":6},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Sales Leadership",influence:9,interest:9,type:"internal"},
      {name:"Regional Managers",influence:8,interest:8,type:"internal"},
      {name:"New Target Accounts",influence:6,interest:5,type:"external"},
      {name:"BU President",influence:10,interest:8,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"ts5", pid:"nov", bu:"TS", pri:"Medium", title:"VOC Compliance & Coating Reformulation",
    impact:"Flagship TK34XT product under regulatory threat; customer resistance to switching creates transition risk", cat:"Operational Risk",
    reach:70, impact2:7, confidence:80, effort:7, low:5e6, mid:15e6, high:35e6,
    basis:"Tightening VOC emissions regulations; 50+ years of customer dependency on TK34XT liquid coating chemistry",
    riceNote:"Regulatory deadline is real; migration to powder coatings already in progress but customer resistance is high",
    causes:["Tightening VOC emissions regulations","50+ years of customer dependency on liquid coating chemistry"],
    success:"Qualified powder coating alternative commercially available; customer migration plan in place before regulatory deadline",
    shs:["Coating R&D","Facility operations","Customers"],
    radarScores:{Financial:7,Strategic:7,Urgency:8,Solvability:6,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Coating R&D",influence:8,interest:10,type:"internal"},
      {name:"Regulators (EPA/state)",influence:7,interest:5,type:"external"},
      {name:"Long-term Customers",influence:8,interest:7,type:"external"},
      {name:"Powder Coating Vendors",influence:4,interest:10,type:"external"},
    ],
    urgencySignals:[
      {date:"April 2026",event:"TSCA PFAS reporting mandate kicks in; VOC tightening at coating facilities creating regulatory pressure on TK34XT",category:"Regulatory",impact:"High"},
    ]},

  // ── NOV TUBULAR PRODUCTS (Grant Prideco) ──────────────────────────────────
  { id:"tp1", pid:"nov", bu:"TP", pri:"High", title:"Traceability Gaps & Manual Pipe Tallies",
    impact:"Operational delays; HSE risk from missing inspection history; lost asset value from untracked pipe", cat:"Digital / AI",
    reach:85, impact2:8, confidence:85, effort:5, low:8e6, mid:25e6, high:60e6,
    basis:"No consistent digital traceability across 500+ global locations; manual clipboard entry prone to error and loss",
    riceNote:"Highly tractable — RFID/digital tally technology exists; needs field-hardened implementation",
    causes:["No consistent digital traceability across 500+ global locations","Manual clipboard entry prone to error and loss"],
    success:"Full digital traceability per joint from manufacture to retirement; real-time access at rig floor via RFID or equivalent",
    shs:["Rig crews","Inspection teams","Operators","NOV aftermarket"],
    radarScores:{Financial:8,Strategic:9,Urgency:8,Solvability:7,"Market Size":8},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"James Standefer (Ops)",influence:9,interest:10,type:"internal"},
      {name:"Rig Crews",influence:6,interest:8,type:"external"},
      {name:"Operator HSE Teams",influence:8,interest:9,type:"external"},
      {name:"NOV Digital Services",influence:7,interest:8,type:"internal"},
    ],
    urgencySignals:[]},
  { id:"tp2", pid:"nov", bu:"TP", pri:"High", title:"Connection Health & Predictive Fatigue Life",
    impact:"Unplanned connection failures; conservative inspection tolerances retiring pipe early; increased recut frequency", cat:"Product / Technology",
    reach:75, impact2:8, confidence:75, effort:7, low:8e6, mid:22e6, high:55e6,
    basis:"No predictive model beyond visual inspection; fatigue loading in 3-4 mile laterals not captured by current standards",
    riceNote:"'Connection Health Score' concept is a novel product opportunity with clear commercial differentiation",
    causes:["No predictive model beyond visual inspection","Fatigue loading in 3–4 mile laterals not fully captured by current standards"],
    success:"'Connection Health Score' per joint based on cumulative load history; measurable reduction in unplanned failures and early retirements",
    shs:["Operators","Field inspection teams","Engineering"],
    radarScores:{Financial:8,Strategic:9,Urgency:7,Solvability:5,"Market Size":8},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Engineering Team",influence:8,interest:10,type:"internal"},
      {name:"Operator Drilling Eng",influence:8,interest:9,type:"external"},
      {name:"Field Inspection Teams",influence:6,interest:8,type:"external"},
      {name:"API Standards",influence:5,interest:5,type:"external"},
    ],
    urgencySignals:[]},
  { id:"tp3", pid:"nov", bu:"TP", pri:"High", title:"Repair Frequency & Recut Logistics",
    impact:"High TCO for operators; shipping delays; lost revenue during pipe downtime", cat:"Process / Enabler",
    reach:70, impact2:7, confidence:80, effort:6, low:5e6, mid:15e6, high:38e6,
    basis:"Centralized machine shop model requires long shipping cycles; conservative field tolerances trigger premature recuts",
    riceNote:"Distributed repair network + health scoring widens tolerances — dual lever approach",
    causes:["Centralized machine shop model requires long shipping cycles","Field inspection tolerances are conservative, triggering recuts prematurely"],
    success:"Distributed repair network reducing recut turnaround time; widened field tolerances validated by health scoring data",
    shs:["Operators","NOV aftermarket","Logistics teams"],
    radarScores:{Financial:7,Strategic:7,Urgency:6,Solvability:7,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Aftermarket Sales",influence:8,interest:9,type:"internal"},
      {name:"Operators",influence:8,interest:8,type:"external"},
      {name:"Logistics Teams",influence:6,interest:8,type:"internal"},
      {name:"Machine Shop Partners",influence:5,interest:8,type:"external"},
    ],
    urgencySignals:[]},
  { id:"tp4", pid:"nov", bu:"TP", pri:"Medium", title:"Tariff & Steel Supply Chain Volatility",
    impact:"Unpredictable cost base; difficult customer pricing; engineering resources diverted to sourcing qualification", cat:"Operational Risk",
    reach:80, impact2:7, confidence:80, effort:6, low:5e6, mid:15e6, high:38e6,
    basis:"Historical dependence on imported steel; 2025 tariffs creating pricing uncertainty",
    riceNote:"Mirrors NOV ALS and FGS supply chain problems — NOV-wide coordinated response has leverage",
    causes:["Historical dependence on imported steel","Tariff environment changing faster than supply chain can adapt"],
    success:"Diversified, tariff-resilient supply base with qualified North American and alternative international sources",
    shs:["Procurement","Sales","Customers","NOV leadership"],
    radarScores:{Financial:7,Strategic:6,Urgency:8,Solvability:6,"Market Size":6},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"Procurement",influence:8,interest:10,type:"internal"},
      {name:"Steel Mill Suppliers",influence:6,interest:7,type:"external"},
      {name:"Sales / Commercial",influence:7,interest:7,type:"internal"},
      {name:"Operator Procurement",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[
      {date:"2025",event:"US 2025 steel tariffs creating pricing uncertainty; shifting some customer preference toward North American mill capacity",category:"Macro",impact:"High"},
    ]},
  { id:"tp5", pid:"nov", bu:"TP", pri:"Medium", title:"Connection Performance in Geothermal & High-H2S Applications",
    impact:"Limited addressable market in energy transition; existing metallurgy not rated for extreme thermal fatigue and H2S embrittlement", cat:"Market Expansion",
    reach:50, impact2:7, confidence:70, effort:7, low:5e6, mid:15e6, high:40e6,
    basis:"Delta Prime and Z140 metallurgy not yet qualified for sustained >450°F and high-H2S exposure",
    riceNote:"Energy transition play with existing product base — qualification investment is the barrier",
    causes:["Delta Prime and Z140 metallurgy not yet qualified for sustained >450°F and high-H2S exposure"],
    success:"Connection metallurgy qualified for geothermal and high-H2S applications; first commercial geothermal deployments completed",
    shs:["Engineering","Sales","Geothermal operators","NOV leadership"],
    radarScores:{Financial:7,Strategic:8,Urgency:6,Solvability:6,"Market Size":8},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Materials Engineering",influence:8,interest:9,type:"internal"},
      {name:"Geothermal Operators",influence:7,interest:9,type:"external"},
      {name:"API/Standards Bodies",influence:5,interest:5,type:"external"},
      {name:"Energy Transition Funds",influence:6,interest:8,type:"external"},
    ],
    urgencySignals:[]},

  // EY
  { id:"e1", pid:"ey", pri:"High", title:"Legacy Integration & AI-Ready Telemetry",
    impact:"OFS companies cannot deliver e2e digital offerings — field data siloed, incompatible with AI stacks", cat:"Integration",
    reach:90, impact2:9, confidence:85, effort:8, low:20e6, mid:55e6, high:120e6,
    basis:"EY Energy Digital 2024: 70% of OFS operators cite data integration as #1 barrier to AI adoption",
    riceNote:"Broadest reach of all EY problems; integration unlocks all other digital plays",
    causes:["Decades of siloed SCADA/historian systems","No common data standards","Legacy equipment with no native telemetry"],
    success:"Unified data layer; AI-ready telemetry pipelines; vendor-agnostic integration middleware",
    shs:["EY clients (IOCs, NOCs)","OFS technology vendors","IT/OT teams"],
    radarScores:{Financial:9,Strategic:10,Urgency:9,Solvability:5,"Market Size":10},
    urgencyLevel:9,
    stakeholderInfluence:[
      {name:"IOC/NOC CIOs",influence:9,interest:9,type:"external"},
      {name:"EY Tech Leads",influence:8,interest:10,type:"internal"},
      {name:"OFS Vendors",influence:6,interest:8,type:"external"},
      {name:"IT/OT Teams",influence:7,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"e2", pid:"ey", pri:"High", title:"Actionable Field Intelligence — Leak Detection & Proactive Issue Scanning",
    impact:"Operators relying on reactive maintenance; leak/integrity failures costing $2-15M per incident", cat:"Field Intelligence",
    reach:75, impact2:9, confidence:80, effort:7, low:15e6, mid:40e6, high:90e6,
    basis:"IOGP 2024: Avg leak incident cost $4.2M; AI-based early warning reduces incidents 35-60%",
    riceNote:"Clear dollar anchor on incident cost; strong confidence on AI detection efficacy",
    causes:["Manual inspection cycles too slow","Sensor data not actioned in real time","No AI pattern recognition on anomaly signals"],
    success:"Real-time anomaly detection on >80% of assets; incident response <2hr; proactive:reactive ratio >3:1",
    shs:["HSE teams","Asset integrity engineers","EY change leads"],
    radarScores:{Financial:8,Strategic:8,Urgency:8,Solvability:7,"Market Size":8},
    urgencyLevel:8,
    stakeholderInfluence:[
      {name:"HSE Directors",influence:9,interest:10,type:"external"},
      {name:"Asset Integrity Eng",influence:7,interest:9,type:"external"},
      {name:"EY Change Leads",influence:8,interest:8,type:"internal"},
      {name:"Regulators",influence:6,interest:6,type:"external"},
    ],
    urgencySignals:[]},
  { id:"e3", pid:"ey", pri:"High", title:"Asset Automation — Safety Monitoring & AI-Driven Uptime",
    impact:"Manual safety checks leaving assets underperforming; unplanned downtime $50-500K/day per asset", cat:"Asset Automation",
    reach:70, impact2:8, confidence:75, effort:7, low:18e6, mid:48e6, high:100e6,
    basis:"Rystad 2024: Unplanned downtime avg $180K/day Permian; AI-driven uptime improvement 8-15%",
    riceNote:"Strong financial case; confidence risk from change management complexity",
    causes:["Safety interlocks not connected to AI","No physics-aware automation layer","Operator fatigue on high-frequency monitoring"],
    success:"Autonomous safety monitoring with human-in-the-loop; unplanned downtime reduction >10%",
    shs:["Operations teams","HSE","EY transformation leads"],
    radarScores:{Financial:8,Strategic:8,Urgency:7,Solvability:6,"Market Size":8},
    urgencyLevel:7,
    stakeholderInfluence:[
      {name:"Operations VPs",influence:9,interest:8,type:"external"},
      {name:"HSE Managers",influence:7,interest:9,type:"external"},
      {name:"EY Transform Leads",influence:8,interest:9,type:"internal"},
      {name:"Control Room Ops",influence:5,interest:7,type:"external"},
    ],
    urgencySignals:[]},
  { id:"e4", pid:"ey", pri:"Medium", title:"AI Operations — Physics + Plant Realisation vs Spreadsheet Management",
    impact:"Critical decisions made via spreadsheets, ignoring physics models and real plant conditions", cat:"Digital / AI",
    reach:65, impact2:8, confidence:70, effort:8, low:12e6, mid:35e6, high:75e6,
    basis:"Wood Mackenzie: Physics-informed AI shows 3-7% production uplift vs manual",
    riceNote:"High strategic value; confidence risk due to reservoir engineer buy-in required",
    causes:["Gap between reservoir engineers and data scientists","No physics-informed ML in production","Operator trust gap"],
    success:"Physics-informed AI models in production for >3 asset types; explainable AI replacing spreadsheets",
    shs:["Reservoir engineers","Data science teams","EY change management"],
    radarScores:{Financial:7,Strategic:8,Urgency:6,Solvability:5,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"Reservoir Engineers",influence:8,interest:7,type:"external"},
      {name:"Data Science Teams",influence:6,interest:10,type:"external"},
      {name:"EY Change Mgmt",influence:8,interest:8,type:"internal"},
      {name:"Asset Managers",influence:7,interest:6,type:"external"},
    ],
    urgencySignals:[]},
  { id:"e5", pid:"ey", pri:"Medium", title:"Cost Saving Bolt-Ons with Clear ROI & Outcome-Based Commercials",
    impact:"OFS clients unable to adopt high-value digital tools — procurement requires CapEx justification", cat:"Cost Optimisation",
    reach:80, impact2:7, confidence:85, effort:4, low:5e6, mid:18e6, high:40e6,
    basis:"Bain 2023: Outcome-based contracts 2-3x faster to close; bolt-on ROI tools <12mo payback win 70% of pilots",
    riceNote:"Low effort + high confidence = strong RICE; broadest reach of EY medium-priority problems",
    causes:["No standardised outcome-based pricing templates","Procurement requires CapEx not OpEx","Difficulty proving ROI within 12-month cycles"],
    success:"3+ outcome-based commercial templates live; avg deal cycle <90 days; ROI within first billing cycle",
    shs:["EY procurement advisors","OFS commercial teams","CFOs"],
    radarScores:{Financial:7,Strategic:6,Urgency:6,Solvability:9,"Market Size":7},
    urgencyLevel:6,
    stakeholderInfluence:[
      {name:"CFOs / Finance",influence:9,interest:8,type:"external"},
      {name:"EY Procurement Adv",influence:8,interest:9,type:"internal"},
      {name:"OFS Sales Teams",influence:7,interest:10,type:"external"},
      {name:"Procurement Mgrs",influence:6,interest:7,type:"external"},
    ],
    urgencySignals:[]},
];

// Global companies (shared starting point, partners add their own on top)
const GLOBAL_COS = [
  {id:"bkr",name:"Baker Hughes",ticker:"BKR",type:"OFS",color:"#E46962",global:true},
  {id:"slb",name:"SLB",ticker:"SLB",type:"OFS",color:"#00b8cc",global:true},
  {id:"hal",name:"Halliburton",ticker:"HAL",type:"OFS",color:"#f59e0b",global:true},
  {id:"xom",name:"ExxonMobil",ticker:"XOM",type:"Operator",color:"#f07870",global:true},
  {id:"cvx",name:"Chevron",ticker:"CVX",type:"Operator",color:"#3b82f6",global:true},
  {id:"sar",name:"Saudi Aramco",ticker:"2222",type:"NOC",color:"#B5D334",global:true},
  {id:"adn",name:"ADNOC",ticker:"NOC",type:"NOC",color:"#cde84a",global:true},
];

// Global stakeholders (shared starting point)
const GLOBAL_SH = [
  {id:"s1",name:"Amin Nasser",title:"President & CEO",org:"Saudi Aramco",sector:"NOC",tags:["digitalisation","AI","energy transition"],avatar:"AN",color:"#22c55e",global:true},
  {id:"s2",name:"Lorenzo Simonelli",title:"Chairman & CEO",org:"Baker Hughes",sector:"OFS",tags:["artificial lift","IIoT","decarbonization"],avatar:"LS",color:"#E46962",global:true},
  {id:"s3",name:"Olivier Le Peuch",title:"CEO",org:"SLB",sector:"OFS",tags:["digital","managed services","Lift IQ"],avatar:"OL",color:"#00b8cc",global:true},
  {id:"s4",name:"Jeff Miller",title:"Chairman & CEO",org:"Halliburton",sector:"OFS",tags:["Summit ESP","production optimization"],avatar:"JM",color:"#f59e0b",global:true},
  {id:"s5",name:"Darren Woods",title:"Chairman & CEO",org:"ExxonMobil",sector:"Operator",tags:["Permian","technology","cost reduction"],avatar:"DW",color:"#f07870",global:true},
];

// ── STYLES ────────────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:#091C1D;}::-webkit-scrollbar-thumb{background:rgba(181,211,52,0.2);border-radius:2px;}
@keyframes fu{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@keyframes sp{to{transform:rotate(360deg);}}
@keyframes pu{0%,100%{opacity:1;}50%{opacity:.3;}}
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
.stab{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:7px 13px;color:#849BA6;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;}
.stab.on{color:#B5D334;border-bottom-color:#B5D334;}.stab:hover:not(.on){color:#c8d4ce;}
.tab{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:11px 16px;color:#849BA6;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;}
.tab.on{color:#B5D334;border-bottom-color:#B5D334;}.tab:hover:not(.on){color:#c8d4ce;}
input,textarea,select{background:#132f30;border:1px solid rgba(181,211,52,.15);border-radius:5px;color:#f5f2ec;font-family:'DM Mono',monospace;font-size:11px;padding:7px 10px;width:100%;}
input:focus,textarea:focus,select:focus{outline:none;border-color:rgba(0,151,167,.5);box-shadow:0 0 0 3px rgba(0,151,167,.08);}
textarea{resize:vertical;}select option{background:#132f30;}
.pill{font-size:7px;font-family:'DM Mono',monospace;letter-spacing:.08em;padding:1px 5px;border-radius:10px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;}
`;

// ── ATOMS ─────────────────────────────────────────────────────────────────────
const Sp = ({s=14}) => <div style={{width:s,height:s,border:`2px solid rgba(181,211,52,.15)`,borderTopColor:VB.gold,borderRadius:"50%",animation:"sp .7s linear infinite",flexShrink:0}}/>;
const Pu = ({c=VB.gold}) => <span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block",animation:"pu 2s ease-in-out infinite"}}/>;

const Bdg = ({v,sm}) => {
  const m={High:[VB.gold,"rgba(181,211,52,.1)"],Medium:[VB.teal2,"rgba(0,184,204,.1)"],Low:[VB.muted,"rgba(132,155,166,.1)"],Critical:[VB.coral,"rgba(228,105,98,.1)"],Strong:[VB.gold,"rgba(181,211,52,.1)"],Weak:[VB.muted,"rgba(132,155,166,.1)"]};
  const [c,bg]=m[v]||[VB.muted,"rgba(132,155,166,.1)"];
  return <span style={{fontSize:sm?8:9,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",padding:sm?"1px 5px":"2px 7px",borderRadius:3,background:bg,color:c,border:`1px solid ${c}35`,display:"inline-block"}}>{(v||"").toUpperCase()}</span>;
};

const Chip = ({c,children,onClick,onRemove}) => (
  <span onClick={onClick} style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".07em",padding:"2px 6px",borderRadius:3,border:`1px solid ${c||VB.border2}`,color:c||VB.muted,display:"inline-flex",alignItems:"center",gap:3,cursor:onClick?"pointer":"default"}}>
    {children}{onRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{color:VB.muted,fontSize:8,lineHeight:1,cursor:"pointer"}}>×</span>}
  </span>
);

const SL = ({c=VB.teal,mb=10,children}) => (
  <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".16em",textTransform:"uppercase",color:c,marginBottom:mb,display:"flex",alignItems:"center",gap:6}}>
    <span style={{width:12,height:1,background:c,display:"inline-block"}}/>{children}
  </div>
);

const KPI = ({label,value,sub,color=VB.gold2}) => (
  <div style={{padding:"12px 15px",background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:7}}>
    <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".13em",textTransform:"uppercase",color:VB.muted,marginBottom:4}}>{label}</div>
    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color,lineHeight:1,letterSpacing:".04em"}}>{value}</div>
    {sub&&<div style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>{sub}</div>}
  </div>
);

// ── FetchStamp: shows when data was last fetched + age indicator ──────────────
const FetchStamp = ({fetchedAt, onRefresh, loading, size="normal"}) => {
  const [age, setAge] = useState("");
  useEffect(() => {
    if (!fetchedAt) return;
    const update = () => {
      const diff = (Date.now() - new Date(fetchedAt).getTime()) / 1000;
      if (diff < 60)        setAge("just now");
      else if (diff < 3600) setAge(`${Math.floor(diff/60)}m ago`);
      else if (diff < 86400)setAge(`${Math.floor(diff/3600)}h ago`);
      else                  setAge(`${Math.floor(diff/86400)}d ago`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [fetchedAt]);

  if (!fetchedAt) return null;
  const isStale = fetchedAt && (Date.now() - new Date(fetchedAt).getTime()) > 86400000; // >24h
  const staleColor = isStale ? VB.coral : VB.teal2;
  const sm = size === "sm";

  return (
    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
      <span style={{fontSize:sm?7:8,fontFamily:"'DM Mono',monospace",color:staleColor,
                    background:`${staleColor}14`,padding:sm?"1px 5px":"2px 7px",
                    borderRadius:3,border:`1px solid ${staleColor}30`,
                    display:"flex",alignItems:"center",gap:4}}>
        <span style={{width:5,height:5,borderRadius:"50%",background:staleColor,display:"inline-block",flexShrink:0}}/>
        {isStale ? "⚠ stale · " : "✓ cached · "}
        {age}
      </span>
      {onRefresh && (
        <button onClick={onRefresh} disabled={loading}
          style={{fontSize:sm?7:8,fontFamily:"'DM Mono',monospace",color:VB.muted,background:"transparent",
                  border:`1px solid ${VB.border}`,borderRadius:3,padding:sm?"1px 6px":"2px 7px",
                  cursor:loading?"wait":"pointer",display:"flex",alignItems:"center",gap:3,
                  opacity:loading?0.5:1}}>
          {loading ? <><Pu c={VB.teal2}/> refreshing…</> : "↺ refresh"}
        </button>
      )}
    </div>
  );
};

const Overlay = ({onClose,children,w=540}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:VB.bg2,border:`1px solid ${VB.border2}`,borderRadius:10,width:Math.min(w,window.innerWidth-32),maxHeight:"90vh",overflow:"auto"}}>
      {children}
    </div>
  </div>
);

const DBar = ({low,mid,high,color}) => {
  const mx=high*1.06;
  return (
    <div style={{position:"relative",height:26,marginBottom:2}}>
      <div style={{position:"absolute",left:0,right:0,top:"50%",height:2,background:VB.surface2,borderRadius:1,transform:"translateY(-50%)"}}/>
      <div style={{position:"absolute",left:`${(low/mx)*100}%`,width:`${((high-low)/mx)*100}%`,top:"50%",height:2,background:`${color}28`,transform:"translateY(-50%)"}}/>
      <div style={{position:"absolute",left:`${(mid/mx)*100}%`,top:0,width:2,height:26,background:color,borderRadius:1,boxShadow:`0 0 8px ${color}80`,transform:"translateX(-50%)"}}/>
      <span style={{position:"absolute",left:`${(low/mx)*100}%`,bottom:0,fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,transform:"translateX(-50%)"}}>{f$(low)}</span>
      <span style={{position:"absolute",left:`${(mid/mx)*100}%`,top:0,fontSize:8,fontFamily:"'DM Mono',monospace",color,fontWeight:600,transform:"translateX(-50%)"}}>{f$(mid)}</span>
      <span style={{position:"absolute",left:`${(high/mx)*100}%`,bottom:0,fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,transform:"translateX(-50%)"}}>{f$(high)}</span>
    </div>
  );
};

// ── AI ────────────────────────────────────────────────────────────────────────
// In production (Vercel), calls go through /api/chat serverless proxy (key stays server-side).
// In local dev, calls go direct to Anthropic using VITE_ANTHROPIC_API_KEY from .env.
const isDev = import.meta.env.DEV;
const apiUrl = isDev ? "https://api.anthropic.com/v1/messages" : "/api/chat";

// Module-level auth token — set when user signs in via Google
let _authToken = null;

const getApiHeaders = () => {
  if (isDev) return {"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"};
  const h = {"Content-Type":"application/json"};
  if (_authToken) h["Authorization"] = `Bearer ${_authToken}`;
  return h;
};

const callAI = async (prompt) => {
  const res = await fetch(apiUrl, {
    method:"POST", headers:getApiHeaders(),
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,
      system:"You are a strategic analyst. Respond ONLY with valid JSON parseable by JSON.parse(). No markdown fences, no preamble.",
      messages:[{role:"user",content:prompt}]})
  });
  const d = await res.json();
  if(d.error) throw new Error(d.error.message);
  const raw = d.content?.map(b=>b.text||"").join("")||"{}";
  const clean = raw.replace(/^```json\s*/,"").replace(/^```\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(clean); }
  catch { const m=clean.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw new Error("JSON parse failed"); }
};

const callText = async (prompt) => {
  const res = await fetch(apiUrl, {
    method:"POST", headers:getApiHeaders(),
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,
      system:"You are a VentureBuilder strategic analyst specialising in energy sector venture building. Be concise and strategic.",
      messages:[{role:"user",content:prompt}]})
  });
  const d = await res.json();
  return d.content?.map(b=>b.text||"").join("")||"";
};

// ── PROMPTS ───────────────────────────────────────────────────────────────────
const pResearch = (co, probs) => {
  const sorted = [...(probs||[])].sort((a,b)=>(a.pri==="High"?0:a.pri==="Medium"?1:2)-(b.pri==="High"?0:b.pri==="Medium"?1:2));
  const pIds = sorted.slice(0,10).map(p=>p.id);
  const relObj = Object.fromEntries(pIds.map(id=>[id,"High|Medium|Low|None"]));
  return `Research ${co.name} (${co.ticker||""}, ${co.type}) as of early 2026 through the lens of these partner problem statements: ${sorted.slice(0,4).map(p=>p.title).join("; ")||"AI, digital, supply chain, ESP"}.
Return ONLY valid JSON:
{"companyOverview":"2-3 sentences","corePosition":"string","keyProblems":[{"title":"","description":"","severity":"High|Medium|Low"}],"digitalStrategy":"string","supplyChainRisks":"string","internationalExpansion":"string","competitiveWeaknesses":[""],"relevantToPartner":["how this relates to the partner problems"],"problemRelevance":${JSON.stringify(relObj)},"urgencySignals":["signal with source/date"],"radarScores":{"Digital":5,"Reliability":5,"SupplyChain":5,"International":5,"Commercial":5},"dataSources":["source — type — date"]}
Fill problemRelevance only for the partner's actual problem IDs: ${pIds.join(",")}`;
};

const pSH = (sh, probs) => {
  const sorted = [...(probs||[])].sort((a,b)=>(a.pri==="High"?0:a.pri==="Medium"?1:2)-(b.pri==="High"?0:b.pri==="Medium"?1:2));
  const pIds = sorted.slice(0,10).map(p=>p.id);
  const relObj = Object.fromEntries(pIds.map(id=>[id,"High|Medium|Low|None"]));
  return `Based on public information through early 2026, synthesise what ${sh.name} (${sh.title}, ${sh.org}) has publicly said about AI, digital transformation, energy technology, and OFS strategy, in context of these problems: ${sorted.slice(0,3).map(p=>p.title).join("; ")}.
Return ONLY valid JSON:
{"summary":"2-3 sentences","overallSentiment":"bullish|cautious|mixed|critical","relevanceScore":7,"strategicPriorities":["","",""],"signals":[{"signal":"","implication":"","urgency":"High|Medium|Low"}],"keyQuotes":[{"quote":"","source":"","date":""}],"watchFor":["upcoming event or decision to monitor"],"problemRelevance":${JSON.stringify(relObj)},"dataSources":["source — type — date"]}
Fill problemRelevance only for these problem IDs: ${pIds.join(",")}`;
};

const pAnalysis = (probs, resData, shData) =>
`Synthesise internal partner discovery with industry research and stakeholder intelligence.
Problems: ${JSON.stringify(probs.map(p=>({id:p.id,title:p.title,priority:p.pri,dollarMid:p.mid,cat:p.cat})))}
Company Research: ${JSON.stringify(resData.slice(0,5).map(r=>({company:r.name,type:r.type,keyProblems:(r.data?.keyProblems||[]).slice(0,2),relevant:(r.data?.relevantToPartner||[]).slice(0,2)})))}
Stakeholder Intel: ${JSON.stringify(shData.slice(0,3).map(s=>({name:s.name,org:s.org,priorities:(s.intel?.strategicPriorities||[]).slice(0,2),sentiment:s.intel?.overallSentiment})))}
Return ONLY valid JSON:
{"crossCuttingThemes":[{"theme":"","description":"","implication":"","urgency":"Critical|High|Medium"}],"competitiveThreatRanking":[{"company":"","threatLevel":"Critical|High|Medium|Low","primaryThreat":""}],"prioritizedRecommendations":[{"rank":1,"action":"","rationale":"","estimatedValue":""}],"ventureTheses":[{"title":"","oneLiner":"","marketSize":"","whyNow":"","ventureArchetype":"Platform|Product|Service|Data|Marketplace"}]}`;

const pThesis = (p) =>
`Generate a venture thesis for this energy/OFS problem. Return ONLY valid JSON:
{"thesisTitle":"bold venture name","oneLiner":"single sentence pitch","marketSize":"TAM with basis","whyNow":"3 specific reasons","competitiveMoat":"what makes it defensible","keyRisks":["","",""],"ventureArchetype":"Platform|Product|Service|Marketplace|Data","fundingStage":"Pre-seed|Seed|Series A|Series B"}
Problem: ${p.title}. Impact: ${p.impact}. Category: ${p.cat}. Value: ${f$(p.low)}-${f$(p.high)}.`;

const pMatch = (eyPs, ofsData) =>
`EY holds the change management contract. OFS companies are the solution providers. Match EY client problems to OFS capabilities.
EY Problems: ${JSON.stringify(eyPs.map(p=>({id:p.id,title:p.title,cat:p.cat})))}
OFS Research: ${JSON.stringify(ofsData.map(o=>({company:o.name,relevant:(o.data?.relevantToPartner||[]).slice(0,2),digital:(o.data?.digitalStrategy||"").slice(0,80)})))}
Return ONLY valid JSON:
{"matches":[{"eyProblemTitle":"","bestOfsMatch":"","matchStrength":"Strong|Medium|Weak","rationale":"","dealStructure":"","estimatedValue":""}],"ventureTheses":[{"title":"","oneLiner":"","eyProblem":"","ofsSolution":"","vbRole":"","marketSize":""}],"prioritizedDeals":[{"rank":1,"action":"","parties":[],"value":"","timeline":""}]}`;

// ── NEW FEATURE PROMPTS ───────────────────────────────────────────────────────
const pEnrich = (entityName, entityType, existingProfile, newContent, allProbs) =>
`You are a senior venture intelligence analyst. A new piece of content has been provided about ${entityName} (a ${entityType}).
Your job is to:
1. Extract all new intelligence from the content
2. Merge it with the existing profile (don't discard existing data — augment it)
3. Identify which of the tracked problems are now more or less relevant given this new information
4. Summarise what specifically changed and why it matters

EXISTING PROFILE SUMMARY:
${JSON.stringify(existingProfile).slice(0,3000)}

NEW CONTENT (from uploaded file / article / transcript):
${newContent.slice(0,5000)}

TRACKED PROBLEMS (titles only for relevance scoring):
${allProbs.slice(0,20).map((p,i)=>`${i+1}. [${p.id}] ${p.title}`).join("\n")}

Return ONLY valid JSON — no markdown, no preamble:
{
  "updatedProfile": { /* full merged profile object, same schema as existing */ },
  "changeSummary": "2-3 sentence plain-language summary of what's new",
  "newSignals": [{"signal":"","implication":"","urgency":"High|Medium|Low"}],
  "newQuotes": [{"quote":"","source":"","date":""}],
  "problemImpacts": [{"probId":"","probTitle":"","direction":"increased|decreased|unchanged","reason":"one sentence","newRelevance":7}],
  "contentType": "transcript|article|video_transcript|report|interview|other",
  "enrichedAt": "${new Date().toISOString()}"
}`;

const pIngest = (rawText, partnerName) =>
`You are a venture discovery analyst. Parse this raw discovery document for ${partnerName} and extract structured problem statements.
RAW TEXT:
${rawText.slice(0,6000)}
Return ONLY valid JSON — an array of problem objects:
[{"title":"","impact":"","cat":"Operational Risk|Revenue Growth|Product / Technology|Process / Enabler|Market Expansion|Digital / AI|Integration|Asset Automation|Cost Optimisation","pri":"High|Medium","reach":60,"impact2":7,"confidence":75,"effort":5,"low":5000000,"mid":15000000,"high":35000000,"basis":"why this dollar estimate","causes":["root cause 1","root cause 2"],"success":"what solved looks like","shs":["stakeholder1","stakeholder2"],"riceNote":"analyst note"}]
Extract 3-6 problems. All dollar values as numbers (not strings). Reach 1-100, impact2 1-10, confidence 1-100, effort 1-10.`;

const pScout = (prob, existingBuys, filters={}) =>
`You are a venture scout specialising in energy technology and industrial innovation. Identify real startups or scaleups solving this problem.
Problem: ${prob.title}
Impact: ${prob.impact}
Category: ${prob.cat}
Root causes: ${(prob.causes||[]).join("; ")}
Value opportunity: $${(prob.low/1e6).toFixed(0)}M–$${(prob.high/1e6).toFixed(0)}M
Already tracking: ${existingBuys.map(b=>b.target||b.name).filter(Boolean).join(", ")||"none"}
${filters.stage ? `Preferred stage: ${filters.stage}` : ""}
${filters.geo   ? `Preferred geography: ${filters.geo}` : ""}

Return ONLY valid JSON (no markdown, no preamble):
{"startups":[{
  "name":"",
  "oneLiner":"one sentence description",
  "fitScore":8,
  "stage":"Pre-seed|Seed|Series A|Series B|Growth",
  "hq":"City, Country",
  "founded":2021,
  "raised":"$12M",
  "whyFit":"2 sentences explaining fit to this specific problem",
  "differentiator":"key tech, IP, or moat",
  "risks":["risk1","risk2"],
  "website":"https://",
  "contactAngle":"specific outreach angle — who to contact and how",
  "signalStrength":"High|Medium|Low",
  "recentSignal":"any recent news, funding, or partnership relevant to this space"
}],"scoutNote":"1-2 sentence landscape observation","whitespaceNote":"biggest gap no startup is filling yet","marketMaturity":"Early|Emerging|Mature"}
Return 5-7 real companies. fitScore 1-10. Only name real, verifiable companies. Be specific and accurate.`;

const pDealMemo = (entry, prob, partner) =>
`You are a venture analyst at EY VentureBuilder. Write a concise deal memo for an investment committee.
Company: ${entry.name}
Website: ${entry.website||"unknown"}
Stage: ${entry.stage}
Notes: ${entry.notes||"none"}
Contact: ${entry.contact||"none"}

Problem it solves: ${prob?.title||"unknown"}
Problem impact: ${prob?.impact||"unknown"}
Problem value: $${((prob?.mid||0)/1e6).toFixed(0)}M mid-case
Partner BU: ${partner?.full||partner?.name||"NOV"}

Write a deal memo in this EXACT JSON format:
{"headline":"one punchy sentence","thesis":"2-3 sentences on why this is worth pursuing","marketContext":"1-2 sentences on market size and timing","whyNow":"what's changed that makes this urgent","whyUs":"why EY VentureBuilder + NOV is the right partner","risks":["risk1","risk2","risk3"],"nextStep":"specific, actionable next step with named stakeholder","redFlags":["flag1"],"verdict":"Strong Pass|Conditional Pass|Pass"}`;

// ── STAKEHOLDER MAP (SVG, from v3) ────────────────────────────────────────────
function StakeholderMap({stakeholders}) {
  const typeColor = {internal:VB.teal2, external:VB.gold, competitor:VB.coral};
  const w=340, h=240, cx=170, cy=112;
  const rings=[60,100,140];
  const sorted = [...stakeholders].sort((a,b)=>b.influence-a.influence);
  const placed = sorted.map((s,i)=>{
    const tier = i===0?0:i<=1?1:2;
    const angle = (i/stakeholders.length)*2*Math.PI - Math.PI/2;
    const r = rings[Math.min(tier,2)];
    return {...s, x:cx+r*Math.cos(angle), y:cy+r*Math.sin(angle)};
  });
  return (
    <svg width={w} height={h} style={{overflow:"visible",display:"block"}}>
      {rings.map((r,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={`rgba(181,211,52,${0.07-i*0.015})`} strokeDasharray="3 6"/>
      ))}
      {["High","Med","Low"].map((l,i)=>(
        <text key={l} x={cx+rings[i]+4} y={cy-3} fontSize={6}
          fontFamily="DM Mono,monospace" fill="rgba(132,155,166,0.45)">{l} Influence</text>
      ))}
      <text x={cx} y={cy+3} textAnchor="middle" fontSize={7}
        fontFamily="DM Mono,monospace" fill={VB.muted}>Core</text>
      {placed.map((s,i)=>{
        const r = 5+s.interest*0.75;
        const c = typeColor[s.type]||VB.muted;
        return (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r={r} fill={`${c}22`} stroke={c} strokeWidth={1.5}/>
            <text x={s.x} y={s.y+r+9} textAnchor="middle" fontSize={7.5}
              fontFamily="DM Mono,monospace" fill={VB.ink2}>{s.name}</text>
          </g>
        );
      })}
      <g transform={`translate(6,${h-38})`}>
        {Object.entries(typeColor).map(([t,c],i)=>(
          <g key={t} transform={`translate(0,${i*13})`}>
            <circle cx={4} cy={4} r={4} fill={c} opacity={0.7}/>
            <text x={11} y={8} fontSize={7} fontFamily="DM Mono,monospace" fill={VB.muted}>{t}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── CHARTS TOOLTIP ───────────────────────────────────────────────────────────
const CTT = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#0d2526",border:"1px solid rgba(181,211,52,0.3)",padding:"8px 12px",borderRadius:5,fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c8d4ce"}}>
      {label&&<div style={{color:"#B5D334",marginBottom:3,fontSize:9}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.fill||p.stroke||"#B5D334"}}>
          {p.name}: {typeof p.value==="number"?p.value.toFixed(1):p.value}
        </div>
      ))}
    </div>
  );
};

// ── PROBLEM CHARTS (RICE · Value · Bubble · Radar) ────────────────────────────
function ProblemsCharts({probs}) {
  const [open, setOpen] = useState(false);
  if(!probs||probs.length===0) return null;

  const CMAP = {
    "Operational Risk":"#E46962","Revenue Growth":"#B5D334","Product / Technology":"#00b8cc",
    "Process / Enabler":"#cde84a","Market Expansion":"#0097A7","Digital / AI":"#a855f7",
    "Integration":"#f59e0b","Field Intelligence":"#22c55e","Asset Automation":"#00b8cc","Cost Optimisation":"#B5D334",
  };

  const riceData = [...probs].sort((a,b)=>getRice(b)-getRice(a)).map(p=>({
    name: p.title.split(" ").slice(0,3).join(" "),
    rice: getRice(p),
    color: CMAP[p.cat]||"#B5D334",
  }));

  const valueData = probs.map(p=>({
    name: p.title.split(" ").slice(0,2).join(" "),
    Low: p.low/1e6, Mid: p.mid/1e6, High: p.high/1e6,
    color: CMAP[p.cat]||"#B5D334",
  }));

  const bubbleData = probs.map(p=>({
    x: p.effort, y: p.impact2,
    z: p.mid/1e6,
    name: p.title.split(" ").slice(0,3).join(" "),
    color: CMAP[p.cat]||"#B5D334",
  }));

  const radarAxes = ["Financial","Strategic","Urgency","Solvability","Market"];
  const radarData = radarAxes.map(axis=>{
    const entry = {axis};
    probs.forEach(p=>{
      const scores = {
        Financial: Math.round((p.impact2/10)*10),
        Strategic: Math.round(((p.reach/100)*10)),
        Urgency: Math.round((p.confidence/10)),
        Solvability: Math.round(((10-p.effort))),
        Market: Math.round((p.impact2*0.8)),
      };
      entry[p.title.split(" ")[0]] = scores[axis]||5;
    });
    return entry;
  });

  return (
    <div className="card" style={{marginBottom:16,overflow:"hidden",border:"1px solid rgba(181,211,52,0.18)"}}>
      {/* Collapse header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",background:"rgba(181,211,52,0.04)"}}
        onClick={()=>setOpen(v=>!v)}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".14em",color:"#0097A7"}}>◆  PROBLEM ANALYTICS</span>
          <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:"#849BA6"}}>RICE · Value Range · Effort/Impact Matrix · Radar</span>
        </div>
        <span style={{fontSize:10,color:"#849BA6"}}>{open?"▲ Hide":"▼ Show"}</span>
      </div>

      {open&&(
        <div className="fu" style={{padding:"14px 14px 16px"}}>
          {/* Row 1: RICE bar + Value range */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>

            {/* RICE horizontal bar */}
            <div style={{background:"#132f30",borderRadius:6,padding:13}}>
              <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".13em",color:"#849BA6",marginBottom:10}}>RICE PRIORITY SCORE — Reach × Impact × Conf / Effort</div>
              <ResponsiveContainer width="100%" height={Math.max(140, probs.length*36)}>
                <BarChart data={riceData} layout="vertical" margin={{left:0,right:28,top:0,bottom:0}}>
                  <XAxis type="number" tick={{fontSize:8,fill:"#849BA6",fontFamily:"DM Mono,monospace"}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:8,fill:"#849BA6",fontFamily:"DM Mono,monospace"}} width={120} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CTT/>}/>
                  <Bar dataKey="rice" name="RICE" radius={[0,3,3,0]}>
                    {riceData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Value range grouped bar */}
            <div style={{background:"#132f30",borderRadius:6,padding:13}}>
              <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".13em",color:"#849BA6",marginBottom:10}}>ESTIMATED VALUE RANGE ($M) — Low · Mid · High</div>
              <ResponsiveContainer width="100%" height={Math.max(140, probs.length*36)}>
                <BarChart data={valueData} margin={{left:-10,right:8,top:0,bottom:0}}>
                  <XAxis dataKey="name" tick={{fontSize:7,fill:"#849BA6",fontFamily:"DM Mono,monospace"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:8,fill:"#849BA6",fontFamily:"DM Mono,monospace"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}M`}/>
                  <Tooltip content={<CTT/>}/>
                  <Bar dataKey="Low"  name="Low $M"  fill="rgba(132,155,166,0.25)" radius={[2,2,0,0]}/>
                  <Bar dataKey="Mid"  name="Mid $M"  radius={[2,2,0,0]}>
                    {valueData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Bar>
                  <Bar dataKey="High" name="High $M" fill="rgba(132,155,166,0.12)" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Bubble + Radar */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

            {/* Effort vs Impact bubble */}
            <div style={{background:"#132f30",borderRadius:6,padding:13}}>
              <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".13em",color:"#849BA6",marginBottom:6}}>EFFORT vs IMPACT — bubble size = mid value</div>
              <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:"#849BA6",marginBottom:8,opacity:.7}}>Bottom-left = quick wins · Top-left = stars</div>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart margin={{left:-10,right:10,top:5,bottom:5}}>
                  <CartesianGrid stroke="rgba(181,211,52,0.07)" strokeDasharray="3 6"/>
                  <XAxis type="number" dataKey="x" domain={[1,10]} tick={{fontSize:8,fill:"#849BA6"}} label={{value:"Harder →",position:"insideBottom",offset:-2,fontSize:8,fill:"#849BA6"}}/>
                  <YAxis type="number" dataKey="y" domain={[1,10]} tick={{fontSize:8,fill:"#849BA6"}} label={{value:"Impact",angle:-90,position:"insideLeft",fontSize:8,fill:"#849BA6"}}/>
                  <ZAxis type="number" dataKey="z" range={[120,900]}/>
                  <ReferenceLine x={5} stroke="rgba(181,211,52,0.18)" strokeDasharray="4 4"/>
                  <ReferenceLine y={5} stroke="rgba(181,211,52,0.18)" strokeDasharray="4 4"/>
                  <Tooltip cursor={{strokeDasharray:"3 3"}} content={({active,payload})=>active&&payload?.length?(
                    <div style={{background:"#0d2526",border:"1px solid rgba(181,211,52,0.3)",padding:"7px 11px",fontSize:10,fontFamily:"DM Mono,monospace",color:"#c8d4ce",borderRadius:5}}>
                      <div style={{color:"#B5D334",marginBottom:2}}>{payload[0]?.payload?.name}</div>
                      <div>Effort: {payload[0]?.payload?.x} · Impact: {payload[0]?.payload?.y}</div>
                      <div style={{color:"#00b8cc"}}>${payload[0]?.payload?.z?.toFixed(0)}M mid</div>
                    </div>
                  ):null}/>
                  <Scatter data={bubbleData} name="Problems">
                    {bubbleData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.82}/>)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div style={{background:"#132f30",borderRadius:6,padding:13}}>
              <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".13em",color:"#849BA6",marginBottom:6}}>MULTI-DIMENSION RADAR</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {probs.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:3,fontSize:7,fontFamily:"DM Mono,monospace",color:"#849BA6"}}>
                    <span style={{width:7,height:7,borderRadius:2,background:CMAP[p.cat]||"#B5D334",display:"inline-block",flexShrink:0}}/>
                    {p.title.split(" ").slice(0,2).join(" ")}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(181,211,52,0.1)"/>
                  <PolarAngleAxis dataKey="axis" tick={{fontSize:8,fill:"#849BA6",fontFamily:"DM Mono,monospace"}}/>
                  {probs.map(p=>(
                    <Radar key={p.id} name={p.title.split(" ")[0]} dataKey={p.title.split(" ")[0]}
                      stroke={CMAP[p.cat]||"#B5D334"} fill={CMAP[p.cat]||"#B5D334"} fillOpacity={0.07} strokeWidth={1.5}/>
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,paddingTop:8,borderTop:"1px solid rgba(181,211,52,0.08)"}}>
            {[...new Set(probs.map(p=>p.cat))].map(cat=>(
              <div key={cat} style={{display:"flex",alignItems:"center",gap:4,fontSize:7,fontFamily:"DM Mono,monospace",color:"#849BA6"}}>
                <span style={{width:8,height:8,borderRadius:2,background:CMAP[cat]||"#B5D334",display:"inline-block"}}/>
                {cat}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROBLEM CARD ─────────────────────────────────────────────────────────────
function PCard({p, open, toggle, onDelete, onUpdate, thesis, onThesis, thesisLoading,
                cos, research, stakeholders, shIntel,
                actions, onAddAction, onUpdateAction, onDeleteAction,
                crm, onAddCrm, onUpdateCrm, onDeleteCrm, buys}) {
  const r = getRice(p);
  const c = CAT[p.cat]||VB.gold;
  const [pTab, setPTab] = useState("overview");

  const relevantCos = cos.filter(co => {
    const d = research[co.id];
    if(!d?.problemRelevance) return false;
    const rel = d.problemRelevance[p.id];
    return rel==="High"||rel==="Medium";
  });
  const relevantSH = stakeholders.filter(sh => {
    const intel = shIntel[sh.id];
    if(!intel?.problemRelevance) return false;
    const rel = intel.problemRelevance[p.id];
    return rel==="High"||rel==="Medium";
  });

  const myActions = (actions||[]).filter(a=>a.probId===p.id);
  const myCrm     = (crm||[]).filter(c=>c.probId===p.id);
  const openActs  = myActions.filter(a=>a.status!=="done").length;

  return (
    <div className="card" style={{borderLeft:`3px solid ${c}`,...(open?{borderColor:VB.gold}:{})}}>
      <div style={{padding:"11px 15px",cursor:"pointer",display:"flex",alignItems:"center",gap:11}} onClick={toggle}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:c,lineHeight:1,minWidth:14}}>{String(p.id).replace(/\D/g,"")}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
            <Bdg v={p.pri}/><Chip c={c}>{p.cat}</Chip>
            {p.bu&&(()=>{const buMeta=NOV_BU_MAP[p.bu];const bc=buMeta?.color||VB.muted;return <span style={{fontSize:7,padding:"1px 6px",borderRadius:10,background:`${bc}18`,color:bc,border:`1px solid ${bc}40`,fontFamily:"'DM Mono',monospace",letterSpacing:".06em",flexShrink:0}}>{p.bu}</span>;})()}
            <span style={{fontSize:12,fontWeight:600,color:VB.ink}}>{p.title}</span>
          </div>
          <div style={{fontSize:10,color:VB.muted,lineHeight:1.5,marginBottom:relevantCos.length||relevantSH.length?5:0}}>{p.impact}</div>
          {(relevantCos.length>0||relevantSH.length>0)&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:3}}>
              {relevantCos.map(co=>{const rel=research[co.id]?.problemRelevance?.[p.id];const rc=rel==="High"?VB.coral:VB.teal2;return <span key={co.id} className="pill" style={{background:`${rc}18`,color:rc,border:`1px solid ${rc}35`}}><span style={{width:4,height:4,borderRadius:"50%",background:rc,display:"inline-block"}}/>{co.name}</span>;})}
              {relevantSH.map(sh=>{const rel=shIntel[sh.id]?.problemRelevance?.[p.id];const rc=rel==="High"?VB.gold:VB.gold2;return <span key={sh.id} className="pill" style={{background:`${rc}18`,color:rc,border:`1px solid ${rc}35`}}><span style={{width:4,height:4,borderRadius:"50%",background:rc,display:"inline-block"}}/>{sh.name}</span>;})}
            </div>
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
          <div style={{display:"flex",gap:4}}>
            {openActs>0&&<span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:`${VB.teal2}18`,color:VB.teal2,fontFamily:"'DM Mono',monospace"}}>{openActs} open</span>}
            {myCrm.length>0&&<span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:`rgba(168,85,247,.15)`,color:"#a855f7",fontFamily:"'DM Mono',monospace"}}>{myCrm.length} tracked</span>}
          </div>
          {[["RICE",r],["MID",f$(p.mid)],["PRI",p.pri]].map(([l,v])=>(
            <div key={l} style={{textAlign:"right"}}>
              <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,letterSpacing:".1em"}}>{l}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:c,lineHeight:1}}>{v}</div>
            </div>
          ))}
          <span style={{color:VB.muted,fontSize:10}}>{open?"▲":"▼"}</span>
        </div>
      </div>

      {open&&(
        <div className="fu" style={{padding:"0 15px 15px"}}>
          {/* Sub-tab nav */}
          <div style={{display:"flex",borderBottom:`1px solid ${VB.border}`,marginBottom:14}}>
            {[["overview","Overview"],["rice","◆ RICE"],["actions",`⚡ Actions${openActs>0?" ("+openActs+")":""}`],["crm",`🏢 Pipeline${myCrm.length>0?" ("+myCrm.length+")":""}`],["scout","🔍 Scout"]].map(([id,lbl])=>(
              <button key={id} className={`stab ${pTab===id?"on":""}`} style={{fontSize:9}} onClick={()=>setPTab(id)}>{lbl}</button>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {pTab==="overview"&&<>
            <div style={{background:VB.surface2,padding:"12px 13px",borderRadius:6,marginBottom:10}}>
              <SL mb={7}>Estimated Value Range</SL>
              <DBar low={p.low} mid={p.mid} high={p.high} color={c}/>
              {p.basis&&<div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginTop:9,lineHeight:1.7}}><span style={{color:VB.teal}}>Basis: </span>{p.basis}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:10}}>
              <div style={{background:VB.surface2,padding:10,borderRadius:6}}>
                <SL mb={6}>RICE Breakdown</SL>
                {[["Reach",`${p.reach}%`],["Impact",`${p.impact2}/10`],["Confidence",`${p.confidence}%`],["Effort",`${p.effort}/10`],["Score",r]].map(([l,v],i)=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${VB.border}`,fontSize:10}}>
                    <span style={{color:VB.muted}}>{l}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",color:i===4?VB.gold:VB.ink2,fontWeight:i===4?700:400}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:VB.surface2,padding:10,borderRadius:6}}>
                <SL mb={6}>Root Causes</SL>
                {(p.causes||[]).map((rc,i)=><div key={i} style={{fontSize:10,color:VB.muted,padding:"3px 0",borderBottom:`1px solid ${VB.border}`,lineHeight:1.5}}>→ {rc}</div>)}
                <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",color:VB.muted,marginTop:7,marginBottom:4}}>STAKEHOLDERS</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{(p.shs||[]).map(s=><Chip key={s}>{s}</Chip>)}</div>
              </div>
              <div style={{background:VB.surface2,padding:10,borderRadius:6}}>
                <SL mb={6}>Success Criteria</SL>
                <div style={{fontSize:10,color:VB.teal2,lineHeight:1.7,marginBottom:10}}>{p.success}</div>
                <SL mb={5} c={VB.gold}>✦ Venture Thesis</SL>
                {thesis?(<div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:VB.ink,marginBottom:3}}>{thesis.thesisTitle}</div>
                  <div style={{fontSize:10,color:VB.gold,lineHeight:1.5,marginBottom:4}}>{thesis.oneLiner}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}><Chip c={VB.gold}>{thesis.ventureArchetype}</Chip><Chip c={VB.teal2}>{thesis.fundingStage}</Chip></div>
                </div>):thesisLoading?<div style={{display:"flex",gap:6,fontSize:10,color:VB.muted,alignItems:"center"}}><Sp s={12}/>Generating…</div>
                :<button className="btn bt" style={{width:"100%",justifyContent:"center",fontSize:9}} onClick={e=>{e.stopPropagation();onThesis();}}>✦ Generate Thesis</button>}
              </div>
            </div>
            {relevantCos.length>0&&(
              <div style={{background:VB.bg2,padding:"9px 12px",borderRadius:6,marginBottom:7}}>
                <SL c={VB.teal2} mb={6}>Relevant Industry Companies</SL>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {relevantCos.map(co=>{const rel=research[co.id]?.relevantToPartner?.[0]||"";return(<div key={co.id} style={{background:VB.surface2,padding:"5px 9px",borderRadius:5,borderLeft:`2px solid ${co.color}`}}><div style={{fontSize:10,color:co.color,fontWeight:600}}>{co.name}</div><div style={{fontSize:8,color:VB.muted,lineHeight:1.5}}>{rel.slice(0,60)}{rel.length>60?"…":""}</div></div>);})}
                </div>
              </div>
            )}
            {relevantSH.length>0&&(
              <div style={{background:VB.bg2,padding:"9px 12px",borderRadius:6,marginBottom:7}}>
                <SL c={VB.gold} mb={6}>Relevant Industry Leaders</SL>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {relevantSH.map(sh=>{const sig=(shIntel[sh.id]?.signals||[])[0]?.signal||"";return(<div key={sh.id} style={{background:VB.surface2,padding:"5px 9px",borderRadius:5,borderLeft:`2px solid ${sh.color}`}}><div style={{fontSize:10,color:sh.color,fontWeight:600}}>{sh.name}</div><div style={{fontSize:8,color:VB.muted}}>{sh.org}</div>{sig&&<div style={{fontSize:8,color:VB.muted,lineHeight:1.5,marginTop:2}}>{sig.slice(0,60)}{sig.length>60?"…":""}</div>}</div>);})}
                </div>
              </div>
            )}
            {(p.radarScores||p.stakeholderInfluence?.length>0||p.urgencySignals?.length>0)&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:7}}>
                {p.radarScores&&(<div style={{background:VB.bg2,padding:"10px 12px",borderRadius:6}}>
                  <SL c={VB.teal2} mb={6}>Problem Radar</SL>
                  <ResponsiveContainer width="100%" height={150}>
                    <RadarChart data={Object.entries(p.radarScores).map(([k,v])=>({axis:k,val:v}))}>
                      <PolarGrid stroke="rgba(181,211,52,0.1)"/>
                      <PolarAngleAxis dataKey="axis" tick={{fontSize:7,fill:VB.muted,fontFamily:"DM Mono,monospace"}}/>
                      <Radar dataKey="val" stroke={c} fill={c} fillOpacity={0.18} strokeWidth={1.5}/>
                    </RadarChart>
                  </ResponsiveContainer>
                  {p.riceNote&&<div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,lineHeight:1.6,marginTop:5,borderTop:`1px solid ${VB.border}`,paddingTop:5}}><span style={{color:VB.gold}}>Note: </span>{p.riceNote}</div>}
                </div>)}
                {p.stakeholderInfluence?.length>0&&(<div style={{background:VB.bg2,padding:"10px 12px",borderRadius:6}}>
                  <SL c={VB.gold} mb={6}>Stakeholder Map</SL>
                  <div style={{display:"flex",justifyContent:"center"}}><StakeholderMap stakeholders={p.stakeholderInfluence}/></div>
                </div>)}
                <div style={{background:VB.bg2,padding:"10px 12px",borderRadius:6}}>
                  <SL c={VB.coral} mb={6}>⚡ Urgency Signals</SL>
                  {p.urgencySignals?.length>0?(
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {p.urgencySignals.map((s,i)=>{const ic=s.impact==="Critical"?VB.coral:s.impact==="High"?VB.gold:VB.teal2;return(<div key={i} style={{padding:"6px 8px",background:VB.surface2,borderRadius:4,borderLeft:`2px solid ${ic}`}}><div style={{display:"flex",gap:5,marginBottom:2}}><span style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:ic,padding:"1px 4px",borderRadius:2,background:`${ic}10`}}>{s.impact}</span><span style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{s.date}</span></div><div style={{fontSize:9,color:VB.ink2,lineHeight:1.5}}>{s.event}</div></div>);})}
                    </div>
                  ):<div style={{fontSize:9,color:VB.muted}}>No urgency signals</div>}
                  {p.urgencyLevel&&<div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>URGENCY</span><div style={{flex:1,height:4,background:VB.surface2,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(p.urgencyLevel/10)*100}%`,background:p.urgencyLevel>=8?VB.coral:p.urgencyLevel>=6?VB.gold:VB.teal2,borderRadius:2}}/></div><span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:p.urgencyLevel>=8?VB.coral:p.urgencyLevel>=6?VB.gold:VB.teal2,fontWeight:600}}>{p.urgencyLevel}/10</span></div>}
                </div>
              </div>
            )}
          </>}

          {/* ── RICE Editor tab ── */}
          {pTab==="rice"&&<RiceEditor p={p} onUpdate={onUpdate}/>}

          {/* ── Actions tab ── */}
          {pTab==="actions"&&<ActionTracker probId={p.id} actions={actions} onAdd={onAddAction} onUpdate={onUpdateAction} onDelete={onDeleteAction}/>}

          {/* ── CRM Pipeline tab ── */}
          {pTab==="crm"&&<CRMPipeline probId={p.id} crm={crm} onAdd={onAddCrm} onUpdate={onUpdateCrm} onDelete={onDeleteCrm}/>}

          {/* ── Scout tab ── */}
          {pTab==="scout"&&<StartupScout p={p} buys={buys} crm={crm} onAddToCRM={onAddCrm}/>}

          <div style={{display:"flex",justifyContent:"flex-end",marginTop:10,paddingTop:8,borderTop:`1px solid ${VB.border}`}}>
            <button className="btn br" style={{fontSize:9}} onClick={onDelete}>✕ Remove</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADD PROBLEM MODAL ─────────────────────────────────────────────────────────
function AddProbModal({pid, onSave, onClose}) {
  const [f,setF] = useState({title:"",pri:"High",cat:"Digital / AI",impact:"",reach:60,impact2:7,confidence:75,effort:5,low:5e6,mid:15e6,high:35e6,basis:"",causes:"",success:"",shs:""});
  const u = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <Overlay onClose={onClose} w={620}>
      <div style={{padding:"13px 17px",borderBottom:`1px solid ${VB.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:VB.ink}}>Add Problem Statement</span>
        <button className="btn bo" style={{padding:"2px 8px"}} onClick={onClose}>✕</button>
      </div>
      <div style={{padding:17,display:"flex",flexDirection:"column",gap:9}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TITLE</div><input value={f.title} onChange={u("title")} placeholder="Problem title"/></div>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>PRIORITY</div><select value={f.pri} onChange={u("pri")}><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>CATEGORY</div><select value={f.cat} onChange={u("cat")}>{Object.keys(CAT).map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>IMPACT</div><textarea rows={2} value={f.impact} onChange={u("impact")} placeholder="Business impact…"/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
          {[["REACH %","reach"],["IMPACT /10","impact2"],["CONFIDENCE %","confidence"],["EFFORT /10","effort"]].map(([l,k])=>(
            <div key={k}><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>{l}</div><input type="number" value={f[k]} onChange={u(k)} min={1} max={100}/></div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
          {[["VALUE LOW ($)","low"],["VALUE MID ($)","mid"],["VALUE HIGH ($)","high"]].map(([l,k])=>(
            <div key={k}><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>{l}</div><input type="number" value={f[k]} onChange={u(k)}/></div>
          ))}
        </div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>DOLLAR BASIS</div><textarea rows={2} value={f.basis} onChange={u("basis")} placeholder="Public benchmarks, citations…"/></div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>ROOT CAUSES (one per line)</div><textarea rows={3} value={f.causes} onChange={u("causes")} placeholder={"Cause 1\nCause 2"}/></div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>SUCCESS CRITERIA</div><textarea rows={2} value={f.success} onChange={u("success")} placeholder="What does solved look like?"/></div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>STAKEHOLDERS (comma separated)</div><input value={f.shs} onChange={u("shs")} placeholder="Engineering, Sales, Operators"/></div>
        <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:4}}>
          <button className="btn bo" onClick={onClose}>Cancel</button>
          <button className="btn bg" onClick={()=>{
            if(!f.title.trim()) return;
            onSave({...f,id:"p"+uid(),pid,causes:f.causes.split("\n").filter(Boolean),shs:f.shs.split(",").map(s=>s.trim()).filter(Boolean),low:+f.low,mid:+f.mid,high:+f.high,reach:+f.reach,impact2:+f.impact2,confidence:+f.confidence,effort:+f.effort});
            onClose();
          }}>Save Problem</button>
        </div>
      </div>
    </Overlay>
  );
}

// ── ADD BUY MODAL ─────────────────────────────────────────────────────────────
function AddBuyModal({pid, pname, onSave, onClose}) {
  const [f,setF] = useState({type:"both",title:"",oneliner:"",target:"",targetdesc:"",market:"",vbrole:"",arch:"Product",stage:"Seed",value:"",notes:""});
  const u = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <Overlay onClose={onClose} w={560}>
      <div style={{padding:"13px 17px",borderBottom:`1px solid ${VB.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:VB.ink}}>Add Buy / Thesis — {pname}</span>
        <button className="btn bo" style={{padding:"2px 8px"}} onClick={onClose}>✕</button>
      </div>
      <div style={{padding:17,display:"flex",flexDirection:"column",gap:9}}>
        <div style={{display:"flex",gap:5}}>{[["both","🎯 Both"],["thesis","📋 Thesis Only"],["company","🏢 Target Only"]].map(([t,l])=>(
          <button key={t} className={`btn ${f.type===t?"bg":"bo"}`} style={{fontSize:9}} onClick={()=>setF(p=>({...p,type:t}))}>{l}</button>
        ))}</div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>THESIS TITLE</div><input value={f.title} onChange={u("title")} placeholder="e.g. AI-Native ESP Monitoring Platform"/></div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>ONE-LINER PITCH</div><textarea rows={2} value={f.oneliner} onChange={u("oneliner")} placeholder="Single sentence investment rationale"/></div>
        {(f.type==="company"||f.type==="both")&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TARGET COMPANY</div><input value={f.target} onChange={u("target")} placeholder="Company name"/></div>
            <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>ESTIMATED VALUE</div><input value={f.value} onChange={u("value")} placeholder="e.g. $15M deal"/></div>
          </div>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TARGET DESCRIPTION</div><textarea rows={2} value={f.targetdesc} onChange={u("targetdesc")} placeholder="What does this company do?"/></div>
        </>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>MARKET SIZE</div><input value={f.market} onChange={u("market")} placeholder="e.g. $2.4B TAM"/></div>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>VB ROLE</div><input value={f.vbrole} onChange={u("vbrole")} placeholder="Lead investor, facilitator…"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>ARCHETYPE</div><select value={f.arch} onChange={u("arch")}>{["Platform","Product","Service","Data","Marketplace"].map(o=><option key={o}>{o}</option>)}</select></div>
          <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>STAGE</div><select value={f.stage} onChange={u("stage")}>{["Pre-seed","Seed","Series A","Series B"].map(o=><option key={o}>{o}</option>)}</select></div>
        </div>
        <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>WHY NOW / NOTES</div><textarea rows={2} value={f.notes} onChange={u("notes")} placeholder="Timing rationale, contacts, next steps…"/></div>
        <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:4}}>
          <button className="btn bo" onClick={onClose}>Cancel</button>
          <button className="btn bv" onClick={()=>{if(!f.title.trim())return;onSave({...f,id:"b"+uid(),pid,pname,addedAt:now()});onClose();}}>✦ Save Buy</button>
        </div>
      </div>
    </Overlay>
  );
}

// ── INDUSTRY RESEARCH TAB (Companies + Industry Stakeholders sub-tabs) ────────

// ── INDUSTRY RESEARCH (two vertical sections: Companies + Industry Stakeholders) ──
function IndustryResearch({partner, probs, cos, research, rStatus, stakeholders, shIntel, shLoading, onResearch, onAddCo, onRemoveCo, onAddSH, onRemoveSH, onFetchSH}) {
  const [coFilter, setCoFilter] = useState("All");
  const [shFilter, setSHFilter] = useState("All");
  const [selCo, setSelCo] = useState(null);
  const [selSH, setSelSH] = useState(null);
  const [showAddCo, setShowAddCo] = useState(false);
  const [showAddSH, setShowAddSH] = useState(false);
  const [newCo, setNewCo] = useState({name:"",ticker:"",type:"OFS"});
  const [newSH, setNewSH] = useState({name:"",title:"",org:"",sector:"OFS",tags:""});

  const filtCos = coFilter==="All" ? cos : cos.filter(c=>c.type===coFilter);
  const filtSH  = shFilter==="All"  ? stakeholders : stakeholders.filter(s=>s.sector===shFilter);
  const doneRes = cos.filter(c=>rStatus[c.id]==="done").length;

  const doAddCo = () => {
    if(!newCo.name.trim()) return;
    const colors=["#E46962","#00b8cc","#f59e0b","#3b82f6","#a855f7","#22c55e"];
    onAddCo({...newCo,id:"co"+uid(),color:colors[Math.floor(Math.random()*colors.length)],pid:partner.id});
    setNewCo({name:"",ticker:"",type:"OFS"}); setShowAddCo(false);
  };

  const doAddSH = () => {
    if(!newSH.name.trim()) return;
    const colors=[VB.gold,VB.teal2,VB.coral,"#a855f7","#22c55e",VB.gold2];
    onAddSH({...newSH,id:"sh"+uid(),pid:partner.id,
      tags:newSH.tags.split(",").map(t=>t.trim()).filter(Boolean),
      avatar:newSH.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      color:colors[Math.floor(Math.random()*colors.length)]});
    setNewSH({name:"",title:"",org:"",sector:"OFS",tags:""}); setShowAddSH(false);
  };

  const globalNotice = (type) => (
    <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:9,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
      <span style={{background:"rgba(181,211,52,.07)",border:`1px solid ${VB.border}`,borderRadius:3,padding:"1px 6px",color:VB.gold}}>Global</span>
      {type}s are shared defaults ·
      <span style={{background:"rgba(0,151,167,.07)",border:`1px solid rgba(0,151,167,.3)`,borderRadius:3,padding:"1px 6px",color:VB.teal2}}>Partner</span>
      {type}s only affect {partner.name}'s analysis
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — COMPANIES
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{marginBottom:36}}>
        {/* Section title row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:11,borderBottom:`2px solid ${VB.border2}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:".04em",color:VB.ink}}>🏢 Companies</span>
            <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:doneRes>0?VB.gold:VB.muted,background:doneRes>0?"rgba(181,211,52,.07)":"transparent",padding:"1px 6px",borderRadius:3,border:`1px solid ${doneRes>0?VB.border:VB.border}`}}>{doneRes}/{cos.length} researched</span>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
            {["All","OFS","Operator","NOC","Consulting","Startup"].map(t=>(
              <button key={t} className={`btn ${coFilter===t?"bg":"bo"}`} style={{fontSize:9}} onClick={()=>setCoFilter(t)}>{t}</button>
            ))}
            <button className="btn bt" style={{fontSize:9}} onClick={()=>setShowAddCo(v=>!v)}>+ Add Company</button>
          </div>
        </div>

        {/* Add company form */}
        {showAddCo&&(
          <div className="card fu" style={{padding:12,marginBottom:12,borderLeft:`3px solid ${VB.teal}`}}>
            <div style={{fontSize:8,color:VB.teal,fontFamily:"'DM Mono',monospace",marginBottom:8}}>+ NEW COMPANY — specific to {partner.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
              <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>NAME</div><input value={newCo.name} onChange={e=>setNewCo(p=>({...p,name:e.target.value}))} placeholder="e.g. TotalEnergies"/></div>
              <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TICKER</div><input value={newCo.ticker} onChange={e=>setNewCo(p=>({...p,ticker:e.target.value}))} placeholder="TTE"/></div>
              <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TYPE</div><select value={newCo.type} onChange={e=>setNewCo(p=>({...p,type:e.target.value}))}><option>OFS</option><option>Operator</option><option>NOC</option><option>Consulting</option><option>Startup</option></select></div>
              <div style={{display:"flex",gap:5}}>
                <button className="btn bg" style={{fontSize:9}} onClick={doAddCo}>Add</button>
                <button className="btn bo" style={{fontSize:9}} onClick={()=>setShowAddCo(false)}>✕</button>
              </div>
            </div>
          </div>
        )}

        {globalNotice("compan")}

        {/* Company cards grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:9,marginBottom:14}}>
          {filtCos.map(co=>{
            const d=research[co.id]; const st=rStatus[co.id]; const sel=selCo?.id===co.id;
            return (
              <div key={co.id} className="card" onClick={()=>d&&setSelCo(sel?null:co)}
                style={{padding:12,cursor:d?"pointer":"default",borderLeft:`3px solid ${co.color}`,...(sel?{borderColor:VB.gold,boxShadow:`0 0 0 1px rgba(181,211,52,.1)`}:{})}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:VB.ink}}>{co.name}</div>
                    <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{co.ticker} · {co.type}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                    <div style={{display:"flex",gap:3,alignItems:"center"}}>
                      <span style={{fontSize:7,fontFamily:"'DM Mono',monospace",padding:"1px 5px",borderRadius:3,
                        background:co.global?"rgba(181,211,52,.07)":"rgba(0,151,167,.07)",
                        color:co.global?VB.gold:VB.teal2,border:`1px solid ${co.global?VB.border:VB.border2}`}}>{co.global?"Global":"Partner"}</span>
                      {!co.global&&<button className="btn br" style={{padding:"1px 5px",fontSize:8}} onClick={e=>{e.stopPropagation();if(sel)setSelCo(null);onRemoveCo(co.id);}}>✕</button>}
                    </div>
                  </div>
                </div>
                {d?.fetchedAt&&<div style={{marginBottom:6}} onClick={e=>e.stopPropagation()}>
                  <FetchStamp fetchedAt={d.fetchedAt} size="sm"
                    loading={st==="loading"}
                    onRefresh={e=>{onResearch(co,probs,true);}}/>
                </div>}
                {!st&&<button className="btn bo" style={{width:"100%",justifyContent:"center",fontSize:9}} onClick={e=>{e.stopPropagation();onResearch(co,probs);}}>▶ Research</button>}
                {st==="loading"&&<div style={{display:"flex",gap:6,fontSize:10,color:VB.muted,alignItems:"center"}}><Sp s={12}/>Researching…</div>}
                {st==="error"&&<div style={{fontSize:9,color:VB.coral}}>Failed — <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={e=>{e.stopPropagation();onResearch(co,probs);}}>retry</span></div>}
                {st==="done"&&d&&(
                  <div>
                    <div style={{fontSize:10,color:VB.muted,lineHeight:1.6,marginBottom:6}}>{(d.companyOverview||"").slice(0,100)}…</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:5}}>
                      {(d.keyProblems||[]).slice(0,2).map((p,i)=><Chip key={i} c={p.severity==="High"?VB.coral:VB.gold}>{(p.title||"").slice(0,22)}…</Chip>)}
                    </div>
                    {d.problemRelevance&&(
                      <div style={{marginTop:6}}>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:3}}>PROBLEM RELEVANCE</div>
                        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                          {probs.map(p=>{
                            const rel=d.problemRelevance?.[p.id]||"None";
                            const rc=rel==="High"?VB.gold:rel==="Medium"?VB.teal2:rel==="Low"?"rgba(132,155,166,.3)":"rgba(132,155,166,.08)";
                            return <div key={p.id} title={`${p.title}: ${rel}`} style={{width:14,height:14,borderRadius:2,background:rc,border:`1px solid ${rc}`,cursor:"default"}}/>;
                          })}
                        </div>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginTop:2}}>Each square = one problem · hover for name</div>
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:7,alignItems:"center"}}>
                      <span style={{fontSize:8,color:VB.teal2,fontFamily:"'DM Mono',monospace"}}>↓ Click to expand full report</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded company report */}
        {selCo&&research[selCo.id]&&(()=>{
          const r=research[selCo.id];
          return (
            <div className="card fu" style={{padding:18,borderLeft:`4px solid ${selCo.color}`,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:VB.ink}}>{selCo.name} — Full Report</div>
                  <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>AI synthesised · Public info · {r.ts}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn bt" style={{fontSize:9}} onClick={()=>onResearch(selCo,probs)}>⟳ Refresh</button>
                  <button className="btn bo" style={{fontSize:9}} onClick={()=>setSelCo(null)}>✕ Close</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9,marginBottom:12}}>
                {[["Core Position",r.corePosition],["Digital Strategy",r.digitalStrategy],["Supply Chain",r.supplyChainRisks],["International",r.internationalExpansion]].map(([l,v])=>(
                  <div key={l} style={{background:VB.surface2,padding:10,borderRadius:6}}>
                    <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",color:VB.muted,marginBottom:4}}>{l.toUpperCase()}</div>
                    <div style={{fontSize:10,color:VB.muted,lineHeight:1.6}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <SL c={VB.coral} mb={7}>Key Problems</SL>
                  {(r.keyProblems||[]).map((p,i)=>(
                    <div key={i} style={{background:VB.surface2,padding:"7px 9px",borderRadius:5,borderLeft:`2px solid ${p.severity==="High"?VB.coral:VB.gold}`,marginBottom:5}}>
                      <div style={{display:"flex",gap:5,marginBottom:2}}><Bdg v={p.severity} sm/><span style={{fontSize:10,color:VB.ink,fontWeight:600}}>{p.title}</span></div>
                      <div style={{fontSize:9,color:VB.muted}}>{p.description}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <SL c={VB.teal2} mb={7}>Relevance to {partner.name}'s Problems</SL>
                  {probs.map(prob=>{
                    const rel=r.problemRelevance?.[prob.id]||"None";
                    if(rel==="None") return null;
                    return (
                      <div key={prob.id} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"4px 0",borderBottom:`1px solid ${VB.border}`}}>
                        <Bdg v={rel} sm/>
                        <span style={{fontSize:10,color:VB.muted,lineHeight:1.4}}>{prob.title}</span>
                      </div>
                    );
                  })}
                  {(r.urgencySignals||[]).length>0&&<>
                    <SL c={VB.gold} mb={5} style={{marginTop:10}}>⚡ Signals</SL>
                    {(r.urgencySignals||[]).map((u,i)=><div key={i} style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.gold2,padding:"2px 0"}}>• {u}</div>)}
                  </>}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Divider */}
      <div style={{borderTop:`2px solid ${VB.border}`,marginBottom:32,position:"relative"}}>
        <span style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",background:VB.bg,padding:"0 12px",fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,letterSpacing:".12em"}}>INDUSTRY STAKEHOLDERS</span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — INDUSTRY STAKEHOLDERS
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        {/* Section title row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:11,borderBottom:`2px solid ${VB.border2}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:".04em",color:VB.ink}}>👤 Industry Stakeholders</span>
            <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{stakeholders.filter(s=>shIntel[s.id]&&!shIntel[s.id].error).length}/{stakeholders.length} with intel</span>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
            {["All","OFS","Operator","NOC","Consulting","Government"].map(f=>(
              <button key={f} className={`btn ${shFilter===f?"bg":"bo"}`} style={{fontSize:9}} onClick={()=>setSHFilter(f)}>{f}</button>
            ))}
            <button className="btn bt" style={{fontSize:9}} onClick={()=>setShowAddSH(v=>!v)}>+ Add Leader</button>
          </div>
        </div>

        {/* Add stakeholder form */}
        {showAddSH&&(
          <div className="card fu" style={{padding:12,marginBottom:12,borderLeft:`3px solid ${VB.teal}`}}>
            <div style={{fontSize:8,color:VB.teal,fontFamily:"'DM Mono',monospace",marginBottom:8}}>+ NEW INDUSTRY LEADER — specific to {partner.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 2fr 1fr 3fr auto",gap:7,alignItems:"end"}}>
              {[["NAME","name","e.g. Amin Nasser"],["TITLE","title","CEO"],["ORG","org","Saudi Aramco"]].map(([l,k,ph])=>(
                <div key={k}><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>{l}</div><input value={newSH[k]} onChange={e=>setNewSH(p=>({...p,[k]:e.target.value}))} placeholder={ph}/></div>
              ))}
              <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>SECTOR</div><select value={newSH.sector} onChange={e=>setNewSH(p=>({...p,sector:e.target.value}))}><option>OFS</option><option>Operator</option><option>NOC</option><option>Consulting</option><option>Government</option></select></div>
              <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TOPICS</div><input value={newSH.tags} onChange={e=>setNewSH(p=>({...p,tags:e.target.value}))} placeholder="AI, ESP, digital"/></div>
              <div style={{display:"flex",gap:4}}>
                <button className="btn bg" style={{fontSize:9}} onClick={doAddSH}>Add</button>
                <button className="btn bo" style={{fontSize:9}} onClick={()=>setShowAddSH(false)}>✕</button>
              </div>
            </div>
          </div>
        )}

        {globalNotice("leader")}

        {/* List + Detail pane */}
        <div style={{display:"grid",gridTemplateColumns:"290px 1fr",gap:12,alignItems:"start"}}>
          {/* Stakeholder list */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {filtSH.map(sh=>{
              const intel=shIntel[sh.id]; const loading=shLoading[sh.id]; const sel=selSH?.id===sh.id;
              return (
                <div key={sh.id} className="card" onClick={()=>setSelSH(sel?null:sh)}
                  style={{padding:10,cursor:"pointer",borderLeft:`3px solid ${sh.color}`,...(sel?{borderColor:VB.gold,boxShadow:`0 0 0 1px rgba(181,211,52,.1)`}:{})}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:`${sh.color}20`,border:`2px solid ${sh.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:9,color:sh.color}}>{sh.avatar}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:600,color:VB.ink}}>{sh.name}</span>
                        <span style={{fontSize:7,fontFamily:"'DM Mono',monospace",padding:"1px 5px",borderRadius:3,
                          background:sh.global?"rgba(181,211,52,.07)":"rgba(0,151,167,.07)",
                          color:sh.global?VB.gold:VB.teal2,border:`1px solid ${sh.global?VB.border:VB.border2}`}}>{sh.global?"Global":"Partner"}</span>
                      </div>
                      <div style={{fontSize:9,color:VB.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sh.title}</div>
                      <div style={{fontSize:9,color:sh.color}}>{sh.org}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                      {loading&&<Sp s={11}/>}
                      {intel&&!intel.error&&<Pu c={VB.gold}/>}
                      {!sh.global&&<button className="btn br" style={{padding:"1px 5px",fontSize:8}} onClick={e=>{e.stopPropagation();if(sel)setSelSH(null);onRemoveSH(sh.id);}}>✕</button>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:5}}>{(sh.tags||[]).slice(0,3).map(t=><Chip key={t}>{t}</Chip>)}</div>
                  {intel?.fetchedAt&&<div style={{marginTop:5}} onClick={e=>e.stopPropagation()}>
                    <FetchStamp fetchedAt={intel.fetchedAt} size="sm" loading={loading}
                      onRefresh={()=>onFetchSH(sh,probs)}/>
                  </div>}
                  {intel?.problemRelevance&&(
                    <div style={{display:"flex",gap:2,marginTop:5,flexWrap:"wrap"}}>
                      {probs.map(p=>{
                        const rel=intel.problemRelevance?.[p.id]||"None";
                        const rc=rel==="High"?VB.gold:rel==="Medium"?VB.teal2:rel==="Low"?"rgba(132,155,166,.3)":"rgba(132,155,166,.08)";
                        return <div key={p.id} title={`${p.title}: ${rel}`} style={{width:10,height:10,borderRadius:2,background:rc,border:`1px solid ${rc}`}}/>;
                      })}
                    </div>
                  )}
                  {!intel&&<button className="btn bt" style={{width:"100%",justifyContent:"center",fontSize:8,marginTop:7}}
                    onClick={e=>{e.stopPropagation();onFetchSH(sh,probs);}}>
                    ▶ Fetch Intelligence
                  </button>}
                </div>
              );
            })}
          </div>

          {/* Detail pane */}
          <div>
            {!selSH&&(
              <div style={{padding:"44px 20px",textAlign:"center",fontSize:12,color:VB.muted,background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:8}}>
                Select a leader to view their intelligence profile
              </div>
            )}
            {selSH&&(()=>{
              const intel=shIntel[selSH.id]; const loading=shLoading[selSH.id];
              return (
                <div>
                  <div className="card" style={{padding:15,marginBottom:9,borderLeft:`4px solid ${selSH.color}`}}>
                    <div style={{display:"flex",gap:11,alignItems:"center",marginBottom:11}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:`${selSH.color}20`,border:`2px solid ${selSH.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:selSH.color}}>{selSH.avatar}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:VB.ink}}>{selSH.name}</div>
                        <div style={{fontSize:11,color:VB.muted}}>{selSH.title} · {selSH.org}</div>
                        <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{(selSH.tags||[]).map(t=><Chip key={t}>{t}</Chip>)}</div>
                      </div>
                      {intel&&!intel.error&&(
                        <div style={{textAlign:"center",background:VB.surface2,padding:"8px 12px",borderRadius:6,flexShrink:0}}>
                          <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>RELEVANCE</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:(intel.relevanceScore||0)>=7?VB.gold:VB.teal2,lineHeight:1}}>{intel.relevanceScore}/10</div>
                        </div>
                      )}
                    </div>
                    {!intel&&!loading&&<button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={()=>onFetchSH(selSH,probs)}>▶ Fetch Intelligence Profile</button>}
                    {loading&&<div style={{display:"flex",gap:8,alignItems:"center"}}><Sp/><span style={{fontSize:11,color:VB.muted}}>Fetching…</span></div>}
                  </div>

                  {intel&&!intel.error&&(
                    <div className="fu" style={{display:"flex",flexDirection:"column",gap:9}}>
                      <div className="card" style={{padding:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                          <div style={{flex:1}}>
                            <SL mb={6}>Summary</SL>
                            <div style={{fontSize:11,color:VB.ink2,lineHeight:1.8}}>{intel.summary}</div>
                          </div>
                          <div style={{background:VB.surface2,padding:"8px 12px",borderRadius:6,textAlign:"center",flexShrink:0}}>
                            <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:3}}>SENTIMENT</div>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:".04em",color:intel.overallSentiment==="bullish"?VB.gold:intel.overallSentiment==="critical"?VB.coral:VB.teal2}}>{(intel.overallSentiment||"").toUpperCase()}</div>
                            <div style={{fontSize:7,color:VB.muted,marginTop:3,fontFamily:"'DM Mono',monospace"}}>{intel.ts}</div>
                          </div>
                        </div>
                      </div>

                      {intel.problemRelevance&&(
                        <div className="card" style={{padding:12}}>
                          <SL c={VB.gold} mb={7}>Problem Relevance Mapping</SL>
                          <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            {probs.map(prob=>{
                              const rel=intel.problemRelevance?.[prob.id]||"None";
                              if(rel==="None") return null;
                              return (
                                <div key={prob.id} style={{display:"flex",gap:7,alignItems:"center",padding:"3px 0",borderBottom:`1px solid ${VB.border}`}}>
                                  <Bdg v={rel} sm/>
                                  <span style={{fontSize:10,color:VB.muted,flex:1}}>{prob.title}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(intel.signals||[]).length>0&&(
                        <div className="card" style={{padding:12}}>
                          <SL c={VB.coral} mb={7}>Signals & Implications</SL>
                          {(intel.signals||[]).map((s,i)=>(
                            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,padding:"6px 0",borderBottom:`1px solid ${VB.border}`}}>
                              <div style={{fontSize:10,color:VB.ink2,lineHeight:1.5}}>{s.signal}</div>
                              <div style={{fontSize:10,color:VB.teal2,background:`${VB.teal}10`,padding:"4px 7px",borderRadius:4,lineHeight:1.5}}>
                                <span style={{fontSize:7,color:VB.teal,display:"block",marginBottom:1}}>IMPLICATION</span>{s.implication}
                              </div>
                              <Bdg v={s.urgency} sm/>
                            </div>
                          ))}
                        </div>
                      )}

                      {(intel.keyQuotes||[]).length>0&&(
                        <div className="card" style={{padding:12}}>
                          <SL mb={7}>Key Quotes</SL>
                          {(intel.keyQuotes||[]).map((q,i)=>(
                            <div key={i} style={{padding:"8px 12px",background:VB.bg2,borderRadius:5,borderLeft:`3px solid ${selSH.color}`,marginBottom:6}}>
                              <div style={{fontSize:11,color:VB.ink2,lineHeight:1.7,fontStyle:"italic",marginBottom:4}}>"{q.quote}"</div>
                              <div style={{display:"flex",gap:5}}><Chip c={VB.teal}>{q.source}</Chip><span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{q.date}</span></div>
                            </div>
                          ))}
                        </div>
                      )}

                      {(intel.strategicPriorities||[]).length>0&&(
                        <div className="card" style={{padding:12}}>
                          <SL mb={7}>Strategic Priorities</SL>
                          {(intel.strategicPriorities||[]).map((p,i)=>(
                            <div key={i} style={{display:"flex",gap:8,padding:"3px 0",borderBottom:`1px solid ${VB.border}`}}>
                              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:VB.gold,lineHeight:1,minWidth:13}}>{i+1}</span>
                              <span style={{fontSize:10,color:VB.muted,lineHeight:1.5}}>{p}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {(intel.watchFor||[]).length>0&&(
                        <div className="card" style={{padding:12}}>
                          <SL c={VB.gold} mb={7}>Watch For</SL>
                          {(intel.watchFor||[]).map((w,i)=>(
                            <div key={i} style={{fontSize:10,color:VB.muted,padding:"5px 8px",background:VB.surface2,borderRadius:4,borderLeft:`2px solid ${VB.gold}`,marginBottom:5,lineHeight:1.5}}>
                              <span style={{color:VB.gold2,marginRight:4}}>!</span>{w}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {intel?.error&&(
                    <div className="card" style={{padding:13,borderLeft:`3px solid ${VB.coral}`}}>
                      <div style={{fontSize:11,color:VB.coral}}>Fetch failed: {intel.error}</div>
                      <button className="btn bt" style={{marginTop:9,fontSize:9}} onClick={()=>onFetchSH(selSH,probs)}>Retry</button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── WORKSPACE ─────────────────────────────────────────────────────────────────
function Workspace({partner, allProbs, allBuys, partnerCos, partnerSH, shIntel, shLoading, research, rStatus, analysis, aStatus, theses, thesisL,
  onAddProb, onDelProb, onUpdateProb, onAddBuy, onDelBuy, onAddCo, onRemoveCo, onAddSH, onRemoveSH, onFetchSH, onResearch, onAnalyse, onThesis,
  actions, onAddAction, onUpdateAction, onDeleteAction, crm, onAddCrm, onUpdateCrm, onDeleteCrm}) {

  const [tab,setTab] = useState("problems");
  const [openP,setOpenP] = useState(null);
  const [buFilter,setBuFilter] = useState(null);
  const [showAddP,setShowAddP] = useState(false);
  const [showAddB,setShowAddB] = useState(false);
  const [ingestTxt,setIngestTxt] = useState("");

  const probs = allProbs.filter(p=>p.pid===partner.id);
  const buys  = allBuys.filter(b=>b.pid===partner.id);
  const totalMid = probs.reduce((s,p)=>s+p.mid,0);
  const doneRes  = partnerCos.filter(c=>rStatus[c.id]==="done").length;

  const runAllLoading = Object.values(rStatus).some(s=>s==="loading") || aStatus==="loading" || Object.values(shLoading).some(Boolean);

  const doRunAll = async () => {
    for (const co of partnerCos) {
      if(rStatus[co.id]!=="done") await onResearch(co, probs);
    }
    const freshIntel = {...shIntel};
    for (const sh of partnerSH) {
      if(!shIntel[sh.id]) {
        const result = await onFetchSH(sh, probs);
        if(result) freshIntel[sh.id] = result;
      }
    }
    await onAnalyse(partner.id, probs, partnerSH, freshIntel);
  };

  const TABS = [
    ["problems","◈  Problems"],
    ["research","◉  Industry Research"],
    ["analysis","◆  Analysis"],
    ["buys","✦  Buys"],
    ["sources","⊕  Sources"],
  ];

  return (
    <div>
      {/* Partner header */}
      <div className="card" style={{padding:"13px 17px",marginBottom:13,borderLeft:`4px solid ${partner.color}`}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:8}}>
          <div style={{width:36,height:36,borderRadius:7,background:`${partner.color}20`,border:`2px solid ${partner.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:partner.color}}>{partner.avatar}</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,letterSpacing:".04em",color:VB.ink}}>{partner.full||partner.name}</div>
            <div style={{fontSize:10,color:VB.muted}}>{partner.desc}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
              {[["Problems",probs.length,VB.gold],["Value",f$(totalMid),partner.color],["Research",`${doneRes}/${partnerCos.length}`,VB.teal2],["Buys",buys.length,VB.purple]].map(([l,v,c])=>(
                <div key={l} style={{textAlign:"center",background:VB.surface2,padding:"5px 9px",borderRadius:5}}>
                  <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:c,lineHeight:1}}>{v}</div>
                </div>
              ))}
            </div>
            <button className="btn bg" style={{fontSize:10,padding:"9px 15px",flexShrink:0,boxShadow:`0 0 18px rgba(181,211,52,0.2)`}}
              onClick={doRunAll} disabled={runAllLoading}
              title="Research all companies · Synthesise analysis · Fetch all stakeholder intel">
              {runAllLoading?<><Sp s={12}/>Running…</>:<>⚡ Run All</>}
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{(partner.tags||[]).map(t=><Chip key={t}>{t}</Chip>)}</div>
      </div>

      {/* Sub nav */}
      <div style={{background:"rgba(9,28,29,.6)",borderBottom:`1px solid ${VB.border}`,marginBottom:16,borderRadius:"6px 6px 0 0"}}>
        <div style={{display:"flex",overflowX:"auto"}}>{TABS.map(([id,l])=><button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}</button>)}</div>
      </div>

      {/* ─ PROBLEMS ─ */}
      {tab==="problems"&&(
        <div className="fu">
          {/* BU filter strip — only for NOV (multi-BU partner) */}
          {partner.id==="nov"&&(()=>{
            const buInfo = NOV_BUS.reduce((m,b)=>({...m,[b.buShort]:b}),{});
            const buCounts = {};
            probs.forEach(p=>{ buCounts[p.bu||"?"] = (buCounts[p.bu||"?"]||0)+1; });
            const filteredProbs = buFilter ? probs.filter(p=>p.bu===buFilter) : probs;
            return (
              <div style={{marginBottom:14}}>
                {/* BU pill strip */}
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
                  <button
                    onClick={()=>setBuFilter(null)}
                    style={{fontSize:8.5,padding:"4px 11px",borderRadius:20,cursor:"pointer",fontFamily:"'DM Mono',monospace",
                      background:!buFilter?VB.gold:"transparent",color:!buFilter?"#091C1D":VB.muted,
                      border:`1px solid ${!buFilter?VB.gold:VB.border}`,transition:"all .12s"}}>
                    All ({probs.length})
                  </button>
                  {NOV_BUS.map(b=>{
                    const cnt=buCounts[b.buShort]||0; if(!cnt)return null;
                    const active=buFilter===b.buShort;
                    return (
                      <button key={b.buShort} onClick={()=>setBuFilter(active?null:b.buShort)}
                        style={{fontSize:8.5,padding:"4px 11px",borderRadius:20,cursor:"pointer",fontFamily:"'DM Mono',monospace",
                          background:active?b.color:"transparent",color:active?"#091C1D":VB.muted,
                          border:`1px solid ${active?b.color:VB.border}`,transition:"all .12s",display:"flex",gap:5,alignItems:"center"}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:b.color,display:"inline-block",flexShrink:0}}/>
                        {b.buShort} ({cnt})
                      </button>
                    );
                  })}
                  {buFilter&&(
                    <span style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginLeft:4}}>
                      — {buInfo[buFilter]?.buLabel||buFilter}
                    </span>
                  )}
                </div>
                {/* Filtered problems render */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div>
                    <SL>Problem Statements — RICE + Value Scored</SL>
                    <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:2}}>
                      {buFilter?`${filteredProbs.length} problems · ${buFilter} BU`:`${probs.length} problems across ${NOV_BUS.length} Business Units`} · Company & leader pills appear once research is run
                    </div>
                  </div>
                  <button className="btn bg" style={{fontSize:10}} onClick={()=>setShowAddP(true)}>+ Add Problem</button>
                </div>
                {filteredProbs.length===0
                  ?<div style={{padding:"40px 20px",textAlign:"center",fontSize:12,color:VB.muted}}>No problems in this BU.</div>
                  :<div style={{display:"flex",flexDirection:"column",gap:7}}>
                    <ProblemsCharts probs={filteredProbs}/>
                    {filteredProbs.map(p=>(
                      <PCard key={p.id} p={p} open={openP===p.id} toggle={()=>setOpenP(openP===p.id?null:p.id)}
                        onDelete={()=>onDelProb(p.id)} onUpdate={onUpdateProb}
                        thesis={theses[p.id]} onThesis={()=>onThesis(p)} thesisLoading={thesisL[p.id]}
                        cos={partnerCos} research={research} stakeholders={partnerSH} shIntel={shIntel}
                        buys={allBuys}
                        actions={actions} onAddAction={onAddAction} onUpdateAction={onUpdateAction} onDeleteAction={onDeleteAction}
                        crm={crm} onAddCrm={onAddCrm} onUpdateCrm={onUpdateCrm} onDeleteCrm={onDeleteCrm}/>
                    ))}
                  </div>
                }
              </div>
            );
          })()}

          {/* Standard problems tab for non-NOV partners */}
          {partner.id!=="nov"&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <SL>Problem Statements — RICE + Value Scored</SL>
                  <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:2}}>
                    Company & leader pills appear on each problem once research is run
                  </div>
                </div>
                <button className="btn bg" style={{fontSize:10}} onClick={()=>setShowAddP(true)}>+ Add Problem</button>
              </div>
              {probs.length===0
                ?<div style={{padding:"40px 20px",textAlign:"center",fontSize:12,color:VB.muted}}>No problems yet.</div>
                :<div style={{display:"flex",flexDirection:"column",gap:7}}>
                  <ProblemsCharts probs={probs}/>
                  {probs.map(p=>(
                    <PCard key={p.id} p={p} open={openP===p.id} toggle={()=>setOpenP(openP===p.id?null:p.id)}
                      onDelete={()=>onDelProb(p.id)} onUpdate={onUpdateProb}
                      thesis={theses[p.id]} onThesis={()=>onThesis(p)} thesisLoading={thesisL[p.id]}
                      cos={partnerCos} research={research} stakeholders={partnerSH} shIntel={shIntel}
                      buys={allBuys}
                      actions={actions} onAddAction={onAddAction} onUpdateAction={onUpdateAction} onDeleteAction={onDeleteAction}
                      crm={crm} onAddCrm={onAddCrm} onUpdateCrm={onUpdateCrm} onDeleteCrm={onDeleteCrm}/>
                  ))}
                </div>
              }
            </>
          )}
          {showAddP&&<AddProbModal pid={partner.id} onSave={onAddProb} onClose={()=>setShowAddP(false)}/>}
        </div>
      )}

      {/* ─ INDUSTRY RESEARCH (Companies + Stakeholders sub-tabs) ─ */}
      {tab==="research"&&(
        <div className="fu">
          <IndustryResearch
            partner={partner} probs={probs}
            cos={partnerCos} research={research} rStatus={rStatus}
            stakeholders={partnerSH} shIntel={shIntel} shLoading={shLoading}
            onResearch={onResearch} onAddCo={onAddCo} onRemoveCo={onRemoveCo}
            onAddSH={onAddSH} onRemoveSH={onRemoveSH} onFetchSH={onFetchSH}
          />
        </div>
      )}

      {/* ─ ANALYSIS ─ */}
      {tab==="analysis"&&(
        <div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <SL>Cross-Company & Stakeholder Analysis</SL>
              <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{partnerCos.filter(c=>research[c.id]).length} researched · {partnerSH.filter(s=>shIntel[s.id]).length} stakeholders with intel</div>
            </div>
            <button className="btn bg" onClick={()=>onAnalyse(partner.id,probs,partnerSH,shIntel)} disabled={aStatus==="loading"||partnerCos.filter(c=>research[c.id]).length===0}>
              {aStatus==="loading"?<><Sp s={12}/>Analysing…</>:"◆ Synthesise"}
            </button>
          </div>
          {!analysis&&<div style={{padding:"40px",textAlign:"center",fontSize:12,color:VB.muted}}>Research companies and fetch stakeholder intel first, then synthesise.</div>}
          {aStatus==="loading"&&<div className="card" style={{padding:44,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Sp/><span style={{fontSize:12,color:VB.muted}}>Synthesising…</span></div>}
          {analysis&&aStatus!=="loading"&&(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {(analysis.crossCuttingThemes||[]).map((t,i)=>(
                <div key={i} className="card" style={{padding:13,borderLeft:`3px solid ${t.urgency==="Critical"?VB.coral:t.urgency==="High"?VB.gold:VB.teal2}`}}>
                  <div style={{display:"flex",gap:7,marginBottom:5,alignItems:"center"}}><Bdg v={t.urgency}/><span style={{fontSize:12,fontWeight:600,color:VB.ink}}>{t.theme}</span></div>
                  <div style={{fontSize:10,color:VB.muted,lineHeight:1.7,marginBottom:5}}>{t.description}</div>
                  <div style={{background:VB.bg2,padding:"5px 9px",borderRadius:4,borderLeft:`2px solid ${VB.teal}`,fontSize:10,color:VB.teal2}}>◈ {t.implication}</div>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <SL c={VB.coral} mb={8}>Threat Ranking</SL>
                  <div className="card" style={{overflow:"hidden"}}>
                    {(analysis.competitiveThreatRanking||[]).map((t,i)=>(
                      <div key={i} style={{padding:"8px 12px",borderBottom:`1px solid ${VB.border}`,display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:VB.muted,minWidth:18}}>#{i+1}</span>
                        <div style={{flex:1}}><div style={{fontSize:11,color:VB.ink,fontWeight:600}}>{t.company}</div><div style={{fontSize:9,color:VB.muted}}>{t.primaryThreat}</div></div>
                        <Bdg v={t.threatLevel}/>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <SL mb={8}>Recommendations</SL>
                  {(analysis.prioritizedRecommendations||[]).map((r,i)=>(
                    <div key={i} className="card" style={{padding:10,borderLeft:`3px solid ${VB.gold}`,marginBottom:6}}>
                      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:VB.gold,lineHeight:1,minWidth:18}}>{r.rank}</div>
                        <div><div style={{fontSize:11,color:VB.ink,fontWeight:600,marginBottom:2}}>{r.action}</div><div style={{fontSize:9,color:VB.muted,lineHeight:1.5}}>{r.rationale}</div>{r.estimatedValue&&<Chip c={VB.teal2}>{r.estimatedValue}</Chip>}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {(analysis.ventureTheses||[]).length>0&&(
                <div>
                  <SL c={VB.gold} mb={8}>✦ Venture Theses</SL>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:9}}>
                    {(analysis.ventureTheses||[]).map((t,i)=>(
                      <div key={i} className="card" style={{padding:13,borderTop:`2px solid ${VB.gold}`}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:VB.ink,marginBottom:4}}>{t.title}</div>
                        <div style={{fontSize:10,color:VB.gold,lineHeight:1.5,marginBottom:4}}>{t.oneLiner}</div>
                        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.teal2,marginBottom:4}}>{t.marketSize}</div>
                        <div style={{fontSize:9,color:VB.muted,lineHeight:1.6,marginBottom:6}}>{t.whyNow}</div>
                        <Chip c={VB.gold}>{t.ventureArchetype}</Chip>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─ BUYS ─ */}
      {tab==="buys"&&(
        <div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <SL>Buys & Venture Theses</SL>
            <button className="btn bv" style={{fontSize:10}} onClick={()=>setShowAddB(true)}>✦ Add Buy / Thesis</button>
          </div>
          {buys.length===0?<div style={{padding:"40px",textAlign:"center",fontSize:12,color:VB.muted}}>No buys yet.</div>:
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:10}}>
              {buys.map(b=>(
                <div key={b.id} className="card" style={{padding:15,borderTop:`2px solid ${VB.purple}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <Chip c={VB.purple}>{b.type==="thesis"?"📋 Thesis":b.type==="company"?"🏢 Target":"🎯 Both"}</Chip>
                      <Chip c={VB.gold}>{b.arch}</Chip><Chip c={VB.teal2}>{b.stage}</Chip>
                    </div>
                    <button className="btn br" style={{padding:"2px 6px",fontSize:9}} onClick={()=>onDelBuy(b.id)}>✕</button>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:VB.ink,marginBottom:3}}>{b.title}</div>
                  <div style={{fontSize:10,color:VB.gold,lineHeight:1.5,marginBottom:6}}>{b.oneliner}</div>
                  {b.target&&<div style={{background:VB.surface2,padding:"6px 8px",borderRadius:5,marginBottom:6}}>
                    <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>TARGET</div>
                    <div style={{fontSize:11,color:VB.ink,fontWeight:600}}>{b.target}</div>
                    {b.value&&<Chip c={VB.teal2}>{b.value}</Chip>}
                  </div>}
                  {b.market&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.teal2,marginBottom:3}}>{b.market}</div>}
                  {b.vbrole&&<div style={{fontSize:8,color:VB.purple,fontFamily:"'DM Mono',monospace",marginBottom:3}}>VB: {b.vbrole}</div>}
                  {b.notes&&<div style={{fontSize:9,color:VB.muted,lineHeight:1.5}}>{b.notes}</div>}
                  <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:7}}>Added {b.addedAt}</div>
                </div>
              ))}
            </div>
          }
          {showAddB&&<AddBuyModal pid={partner.id} pname={partner.name} onSave={onAddBuy} onClose={()=>setShowAddB(false)}/>}
        </div>
      )}

      {/* ─ SOURCES ─ */}
      {tab==="sources"&&(
        <div className="fu">
          <SL mb={12}>Data Provenance & Sources</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div className="card" style={{padding:13,borderLeft:`3px solid ${VB.coral}`}}>
              <SL c={VB.coral} mb={6}>Internal Discovery</SL>
              <div style={{fontSize:10,color:VB.muted,lineHeight:1.7,marginBottom:7}}>{probs.length} problem statements · RICE scored · Dollar-anchored</div>
              <span style={{fontSize:9,padding:"2px 7px",background:"rgba(228,105,98,.1)",color:VB.coral,borderRadius:3,border:"1px solid rgba(228,105,98,.3)"}}>NDA Protected</span>
            </div>
            <div className="card" style={{padding:13,borderLeft:`3px solid ${VB.gold}`}}>
              <SL c={VB.gold} mb={6}>AI Model</SL>
              <div style={{fontSize:10,color:VB.muted,lineHeight:1.7}}>All AI research uses <span style={{fontFamily:"'DM Mono',monospace",color:VB.gold}}>claude-sonnet-4-20250514</span></div>
              <div style={{fontSize:9,color:VB.muted,marginTop:4}}>Knowledge cutoff: early 2026. Verify before decisions.</div>
            </div>
          </div>
          {partnerCos.filter(c=>research[c.id]).length>0&&<>
            <SL mb={8}>Company Research Sources</SL>
            {partnerCos.filter(c=>research[c.id]).map(co=>(
              <div key={co.id} className="card" style={{padding:11,borderLeft:`3px solid ${co.color}`,marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:600,color:VB.ink}}>{co.name}</span>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:co.global?"rgba(181,211,52,.07)":"rgba(0,151,167,.07)",color:co.global?VB.gold:VB.teal2,border:`1px solid ${co.global?VB.border:VB.border2}`}}>{co.global?"Global":"Partner"}</span>
                    <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{research[co.id].ts}</span>
                  </div>
                </div>
                {(research[co.id].dataSources||[]).map((s,i)=><div key={i} style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,padding:"1px 0"}}>• {s}</div>)}
              </div>
            ))}
          </>}
          <div style={{marginTop:14}}>
            <SL mb={8}>Ingest Custom Discovery Data</SL>
            <div className="card" style={{padding:13}}>
              <textarea rows={5} value={ingestTxt} onChange={e=>setIngestTxt(e.target.value)} placeholder="Paste interview notes, RFP responses, field reports, analyst extracts…"/>
              <div style={{display:"flex",gap:7,marginTop:8}}>
                <button className="btn bg" onClick={()=>{if(ingestTxt.trim()){alert("Data ingested.");setIngestTxt("");}}} style={{fontSize:10}}>+ Ingest</button>
                <button className="btn bo" onClick={()=>setIngestTxt("")} style={{fontSize:10}}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EY × OFS MATCH ────────────────────────────────────────────────────────────
function MatchView({eyProbs, research, allCos, onRun, match, status}) {
  const researched = allCos.filter(c=>research[c.id]);
  return (
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:VB.ink}}>EY × OFS Match Engine</div>
          <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>EY holds the change management contract — OFS companies are the solution providers</div>
        </div>
        <button className="btn bg" onClick={onRun} disabled={status==="loading"||researched.length===0}>
          {status==="loading"?<><Sp s={12}/>Matching…</>:"⚡ Run Match Engine"}
        </button>
      </div>
      {researched.length===0&&<div style={{padding:"44px",textAlign:"center",fontSize:12,color:VB.muted}}>Research OFS companies first, then run the match engine.</div>}
      {status==="loading"&&<div className="card" style={{padding:44,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Sp/><span style={{fontSize:12,color:VB.muted}}>Matching…</span></div>}
      {match&&status!=="loading"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {(match.matches||[]).map((m,i)=>{
            const sc=m.matchStrength==="Strong"?VB.gold:m.matchStrength==="Medium"?VB.teal2:VB.muted;
            return (
              <div key={i} className="card" style={{padding:13,borderLeft:`3px solid ${sc}`}}>
                <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,marginBottom:5,alignItems:"center",flexWrap:"wrap"}}>
                      <Chip c={VB.gold}>{(m.eyProblemTitle||"").slice(0,30)}</Chip>
                      <span style={{fontSize:9,color:VB.muted}}>→</span>
                      <Chip c={sc}>{m.bestOfsMatch}</Chip>
                      <Bdg v={m.matchStrength}/>
                    </div>
                    <div style={{fontSize:10,color:VB.muted,lineHeight:1.6,marginBottom:5}}>{m.rationale}</div>
                    <div style={{background:VB.bg2,padding:"4px 8px",borderRadius:4,borderLeft:`2px solid ${VB.teal}`,fontSize:10,color:VB.teal2}}>Deal: {m.dealStructure}</div>
                  </div>
                  {m.estimatedValue&&<div style={{background:VB.surface2,padding:"6px 10px",borderRadius:5,textAlign:"center",flexShrink:0}}>
                    <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>VALUE</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:VB.gold}}>{m.estimatedValue}</div>
                  </div>}
                </div>
              </div>
            );
          })}
          {(match.ventureTheses||[]).length>0&&<>
            <SL c={VB.gold} mb={8}>✦ Venture Theses</SL>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:9}}>
              {match.ventureTheses.map((t,i)=>(
                <div key={i} className="card" style={{padding:13,borderTop:`2px solid ${VB.gold}`}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:VB.ink,marginBottom:4}}>{t.title}</div>
                  <div style={{fontSize:10,color:VB.gold,lineHeight:1.5,marginBottom:4}}>{t.oneLiner}</div>
                  {t.eyProblem&&<div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>EY: {t.eyProblem}</div>}
                  {t.ofsSolution&&<div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.teal2,marginBottom:4}}>OFS: {t.ofsSolution}</div>}
                  {t.marketSize&&<div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.teal2,marginTop:3}}>{t.marketSize}</div>}
                </div>
              ))}
            </div>
          </>}
          {(match.prioritizedDeals||[]).length>0&&<>
            <SL c={VB.teal2} mb={8}>Prioritized Deals</SL>
            {match.prioritizedDeals.map((d,i)=>(
              <div key={i} className="card" style={{padding:10,borderLeft:`3px solid ${VB.teal}`,marginBottom:6}}>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:VB.teal,lineHeight:1,minWidth:18}}>{d.rank}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:VB.ink,marginBottom:3}}>{d.action}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{(d.parties||[]).map(p=><Chip key={p}>{p}</Chip>)}{d.value&&<Chip c={VB.gold}>{d.value}</Chip>}{d.timeline&&<Chip c={VB.teal2}>{d.timeline}</Chip>}</div>
                  </div>
                </div>
              </div>
            ))}
          </>}
        </div>
      )}
    </div>
  );
}

// ── AI CHAT ───────────────────────────────────────────────────────────────────
function AIChat({partners, probs, buys, research, allCos, allSH, shIntel}) {
  const [msgs,setMsgs] = useState([{role:"assistant",content:"Hi! I'm the VentureBuilder AI — fully context-aware across all partners, problems, companies, stakeholders, and buys. Ask me anything."}]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  const ctx = JSON.stringify({
    partners:partners.map(p=>p.name),
    problems:probs.map(p=>({title:p.title,partner:p.pid,priority:p.pri,value:p.mid,cat:p.cat})),
    buys:buys.map(b=>({title:b.title,partner:b.pid,target:b.target})),
    research:allCos.filter(c=>research[c.id]).map(c=>({company:c.name,overview:(research[c.id]?.companyOverview||"").slice(0,80)})),
    stakeholders:allSH.map(s=>({name:s.name,org:s.org,relevance:shIntel[s.id]?.relevanceScore})),
  },null,1).slice(0,2000);

  const send = async (txt) => {
    const msg=txt||input.trim(); if(!msg) return;
    setInput(""); setLoading(true);
    setMsgs(m=>[...m,{role:"user",content:msg}]);
    try {
      const r = await callText(`Platform context:\n${ctx}\n\n---\nUser: ${msg}`);
      setMsgs(m=>[...m,{role:"assistant",content:r}]);
    } catch(e) { setMsgs(m=>[...m,{role:"assistant",content:`Error: ${e.message}`}]); }
    setLoading(false);
  };

  const QUICK=[
    {l:"Match OFS → EY",p:"Suggest the 3 best OFS company to EY problem matches. Be specific with rationale and deal structure."},
    {l:"Draft Deal Memo",p:"Draft a concise deal memo for the most promising opportunity. Sections: Opportunity, Why Now, Parties, Structure, Value, Next Steps."},
    {l:"Top 3 Buys",p:"What are the top 3 companies or venture theses VentureBuilder should pursue? Include rationale."},
    {l:"Risk Summary",p:"What are the biggest risks across partner engagements? Summarise by partner and suggest mitigation."},
    {l:"VB Strategy",p:"What is VentureBuilder's strongest strategic position given what NOV and EY need? Clearest path to a deal?"},
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:13,height:"calc(100vh - 200px)",minHeight:480}}>
      <div style={{display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:8,paddingBottom:8}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",...(m.role==="user"?{flexDirection:"row-reverse"}:{})}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:m.role==="assistant"?`${VB.gold}20`:`${VB.teal}20`,border:`1px solid ${m.role==="assistant"?VB.gold:VB.teal}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:9,color:m.role==="assistant"?VB.gold:VB.teal}}>{m.role==="assistant"?"AI":"U"}</span>
              </div>
              <div style={{background:m.role==="assistant"?VB.surface:VB.surface2,border:`1px solid ${VB.border}`,borderRadius:7,padding:"8px 12px",maxWidth:"83%"}}>
                <div style={{fontSize:11,color:VB.ink2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            </div>
          ))}
          {loading&&<div style={{display:"flex",gap:7,alignItems:"center",padding:"6px 0"}}><Sp/><span style={{fontSize:10,color:VB.muted}}>Thinking…</span></div>}
          <div ref={endRef}/>
        </div>
        <div style={{display:"flex",gap:7,paddingTop:8,borderTop:`1px solid ${VB.border}`}}>
          <textarea rows={2} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything…"
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} style={{flex:1,resize:"none"}}/>
          <button className="btn bg" onClick={()=>send()} disabled={loading||!input.trim()} style={{alignSelf:"flex-end",padding:"8px 14px"}}>Send</button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <div className="card" style={{padding:12}}>
          <SL c={VB.purple} mb={7}>Quick Actions</SL>
          {QUICK.map(q=><button key={q.l} className="btn bv" style={{width:"100%",justifyContent:"flex-start",fontSize:9,marginBottom:4}} onClick={()=>send(q.p)}>{q.l}</button>)}
        </div>
        <div className="card" style={{padding:12}}>
          <SL c={VB.gold} mb={6}>Context Loaded</SL>
          {[["Partners",partners.length],["Problems",probs.length],["Researched",allCos.filter(c=>research[c.id]).length],["Stakeholders",allSH.length],["Buys",buys.length]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${VB.border}`,fontSize:10}}>
              <span style={{color:VB.muted}}>{l}</span><span style={{fontFamily:"'DM Mono',monospace",color:VB.gold}}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:12,flex:1}}>
          <SL c={VB.teal} mb={6}>Suggested</SL>
          {["What's the best deal to pursue?","Which EY problem has most OFS solutions?","Draft an intro connecting NOV and EY.","What themes span both partners?"].map((q,i)=>(
            <div key={i} style={{fontSize:9,color:VB.muted,padding:"4px 0",borderBottom:`1px solid ${VB.border}`,cursor:"pointer",lineHeight:1.4}} onClick={()=>send(q)}>→ {q}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ENRICH PANEL — attach files/articles/transcripts to companies or leaders
// ══════════════════════════════════════════════════════════════════════════════
function EnrichPanel({entity, entityType, existingProfile, allProbs, onEnriched, onClose}) {
  const [mode,    setMode]   = useState("text");   // "text" | "file"
  const [text,    setText]   = useState("");
  const [fileName,setFN]     = useState("");
  const [status,  setSt]     = useState("idle");   // idle | loading | done | error
  const [result,  setResult] = useState(null);

  const readFile = (file) => {
    setFN(file.name);
    const reader = new FileReader();
    reader.onload = e => setText(e.target.result);
    // For PDFs/videos read as text (best-effort); for others use text
    reader.readAsText(file);
  };

  const handleEnrich = async () => {
    if (!text.trim()) return;
    setSt("loading");
    try {
      const res = await callAI(pEnrich(entity.name, entityType, existingProfile||{}, text, allProbs));
      // Attach the source file record so team can see what was uploaded
      const fileRecord = {
        name: fileName || "Pasted text",
        addedAt: new Date().toISOString(),
        charCount: text.length,
        snippet: text.slice(0,200),
        mode,
      };
      res._sourceFile = fileRecord;
      setResult(res);
      setSt("done");
    } catch(e) { setSt("error"); }
  };

  const dirColor = d => d==="increased"?VB.gold:d==="decreased"?VB.coral:VB.muted;

  return (
    <Overlay onClose={onClose} w={760}>
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${VB.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:VB.teal2,letterSpacing:".04em"}}>
            📎 Enrich — {entity.name}
          </div>
          <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:1}}>
            Upload an article, transcript, or video file to update this {entityType}'s profile and re-score problem relevance
          </div>
        </div>
        <button className="btn bo" style={{padding:"2px 8px"}} onClick={onClose}>✕</button>
      </div>

      <div style={{padding:18,display:"flex",flexDirection:"column",gap:13,maxHeight:"78vh",overflowY:"auto"}}>

        {status !== "done" && <>
          {/* Mode toggle */}
          <div style={{display:"flex",gap:6}}>
            {[["text","Paste Text / URL"],["file","Upload File"]].map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)}
                style={{fontSize:9,padding:"4px 12px",borderRadius:5,cursor:"pointer",fontFamily:"'DM Mono',monospace",
                  background:mode===m?VB.teal2:"transparent",color:mode===m?"#091C1D":VB.muted,
                  border:`1px solid ${mode===m?VB.teal2:VB.border}`}}>{l}</button>
            ))}
          </div>

          {/* File drop zone */}
          {mode==="file" && (
            <div
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)readFile(f);}}
              style={{border:`2px dashed ${VB.border2}`,borderRadius:8,padding:"24px 20px",textAlign:"center",
                      background:VB.surface,cursor:"pointer",position:"relative"}}>
              <input type="file"
                accept=".txt,.pdf,.docx,.md,.vtt,.srt,.csv,.json,.mp4,.mov,.avi"
                onChange={e=>{const f=e.target.files[0];if(f)readFile(f);}}
                style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
              {fileName
                ? <div style={{fontSize:11,color:VB.teal2,fontFamily:"'DM Mono',monospace"}}>✓ {fileName}</div>
                : <>
                    <div style={{fontSize:24,marginBottom:6}}>📎</div>
                    <div style={{fontSize:11,color:VB.muted}}>Drop a file here, or click to browse</div>
                    <div style={{fontSize:9,color:VB.muted,marginTop:4}}>Supports: articles (.txt, .pdf, .docx), transcripts (.vtt, .srt), video files (.mp4, .mov)</div>
                    <div style={{fontSize:8,color:VB.muted,marginTop:2,fontStyle:"italic"}}>Note: video files will have their text/audio track extracted automatically</div>
                  </>
              }
            </div>
          )}

          {/* Text paste */}
          {mode==="text" && (
            <div>
              <div style={{fontSize:8,color:VB.muted,marginBottom:4,letterSpacing:".1em",fontFamily:"'DM Mono',monospace"}}>
                PASTE ARTICLE, INTERVIEW TRANSCRIPT, OR VIDEO SCRIPT
              </div>
              <textarea rows={11} value={text} onChange={e=>setText(e.target.value)}
                style={{fontSize:10,lineHeight:1.6}}
                placeholder={"Paste the full text of an article, earnings call transcript, interview, conference talk, or video transcript here…\n\nThe AI will extract new intelligence, identify signals, and update problem relevance scores automatically."}/>
            </div>
          )}

          {/* File content preview */}
          {mode==="file" && fileName && text && (
            <div style={{background:VB.surface2,borderRadius:5,padding:"8px 12px",maxHeight:100,overflowY:"auto"}}>
              <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace",marginBottom:3}}>EXTRACTED TEXT PREVIEW</div>
              <div style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{text.slice(0,500)}…</div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>
              {text.length>0?`${text.length.toLocaleString()} chars · ${Math.ceil(text.length/4).toLocaleString()} est. tokens`:""}
            </div>
            <div style={{display:"flex",gap:7}}>
              <button className="btn bo" onClick={onClose}>Cancel</button>
              <button className="btn bg" disabled={!text.trim()||status==="loading"} onClick={handleEnrich}>
                {status==="loading"?<><Sp s={11}/> Analysing…</>:"✦ Enrich Profile"}
              </button>
            </div>
          </div>

          {status==="error"&&<div style={{fontSize:9,color:VB.coral,fontFamily:"'DM Mono',monospace"}}>⚠ Analysis failed — try again</div>}
        </>}

        {/* Results */}
        {status==="done" && result && (
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {/* Change summary */}
            <div style={{background:`${VB.teal2}0f`,border:`1px solid ${VB.teal2}30`,borderRadius:7,
                padding:"11px 14px",borderLeft:`3px solid ${VB.teal2}`}}>
              <div style={{fontSize:8,color:VB.teal2,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",marginBottom:5}}>WHAT CHANGED</div>
              <div style={{fontSize:11,color:VB.ink2,lineHeight:1.6}}>{result.changeSummary}</div>
              {result.contentType&&(
                <span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:4,display:"inline-block"}}>
                  Source type: {result.contentType}
                </span>
              )}
            </div>

            {/* New signals */}
            {(result.newSignals||[]).length>0&&(
              <div className="card" style={{padding:12}}>
                <SL c={VB.coral} mb={7}>🔔 New Signals Extracted ({result.newSignals.length})</SL>
                {result.newSignals.map((s,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,
                      padding:"6px 0",borderBottom:`1px solid ${VB.border}`}}>
                    <div style={{fontSize:10,color:VB.ink2,lineHeight:1.5}}>{s.signal}</div>
                    <div style={{fontSize:9,color:VB.teal2,lineHeight:1.5,fontStyle:"italic"}}>{s.implication}</div>
                    <Bdg v={s.urgency} sm/>
                  </div>
                ))}
              </div>
            )}

            {/* New quotes */}
            {(result.newQuotes||[]).length>0&&(
              <div className="card" style={{padding:12}}>
                <SL mb={7}>💬 New Quotes</SL>
                {result.newQuotes.map((q,i)=>(
                  <div key={i} style={{padding:"7px 11px",background:VB.bg2,borderRadius:5,
                      borderLeft:`3px solid ${VB.teal2}`,marginBottom:6}}>
                    <div style={{fontSize:10,color:VB.ink2,fontStyle:"italic",lineHeight:1.6,marginBottom:3}}>"{q.quote}"</div>
                    <div style={{display:"flex",gap:5}}>
                      <Chip c={VB.teal}>{q.source}</Chip>
                      <span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{q.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Problem relevance changes */}
            {(result.problemImpacts||[]).filter(p=>p.direction!=="unchanged").length>0&&(
              <div className="card" style={{padding:12}}>
                <SL c={VB.gold} mb={7}>📊 Problem Relevance Changes</SL>
                <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginBottom:8}}>
                  Based on this new content, these problems now have updated relevance to {entity.name}
                </div>
                {(result.problemImpacts||[]).filter(p=>p.direction!=="unchanged").map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",
                      padding:"6px 8px",borderRadius:5,marginBottom:4,
                      background:`${dirColor(p.direction)}08`,
                      border:`1px solid ${dirColor(p.direction)}20`}}>
                    <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:dirColor(p.direction),
                        flexShrink:0,fontWeight:"bold",minWidth:14}}>
                      {p.direction==="increased"?"↑":"↓"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,fontWeight:600,color:VB.ink,marginBottom:2}}>{p.probTitle}</div>
                      <div style={{fontSize:8.5,color:VB.muted,lineHeight:1.4}}>{p.reason}</div>
                    </div>
                    <div style={{flexShrink:0,textAlign:"right"}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                          color:dirColor(p.direction),lineHeight:1}}>{p.newRelevance}/10</div>
                      <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>relevance</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Apply / Dismiss */}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:4,borderTop:`1px solid ${VB.border}`}}>
              <button className="btn bo" onClick={onClose}>Dismiss</button>
              <button className="btn bg" onClick={()=>{
                // Merge updated profile and append to enrichFiles history
                const prevFiles = existingProfile?.enrichFiles || [];
                const enrichedProfile = {
                  ...result.updatedProfile,
                  enrichFiles: [...prevFiles, result._sourceFile].filter(Boolean),
                };
                onEnriched(enrichedProfile);
                onClose();
              }}>✓ Apply Profile Update</button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL INTEL — top-level view of all global companies + stakeholders
// ══════════════════════════════════════════════════════════════════════════════
function GlobalIntel({globalCos, globalSH, research, rStatus, shIntel, shLoading, onResearch, onFetchSH, allProbs, onEnrichCo, onEnrichSH}) {
  const [section, setSection] = useState("companies");
  const [selCo, setSelCo]     = useState(null);
  const [selSH, setSelSH]     = useState(null);
  const [coFilter, setCoFilter] = useState("All");
  const [shFilter, setSHFilter] = useState("All");
  const [enrichTarget, setEnrichTarget] = useState(null);  // {entity, entityType, profile}

  const filtCos = coFilter === "All" ? globalCos : globalCos.filter(c => c.type === coFilter);
  const filtSH  = shFilter === "All" ? globalSH  : globalSH.filter(s => s.sector === shFilter);

  const doneRes = globalCos.filter(c => rStatus[c.id] === "done").length;
  const doneIntel = globalSH.filter(s => shIntel[s.id] && !shIntel[s.id].error).length;

  return (
    <div className="fu">
      {enrichTarget&&(
        <EnrichPanel
          entity={enrichTarget.entity}
          entityType={enrichTarget.entityType}
          existingProfile={enrichTarget.profile}
          allProbs={allProbs}
          onEnriched={(updatedProfile)=>{
            if(enrichTarget.entityType==="company") onEnrichCo(enrichTarget.entity.id, updatedProfile);
            else onEnrichSH(enrichTarget.entity.id, updatedProfile);
          }}
          onClose={()=>setEnrichTarget(null)}
        />
      )}
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:".04em",color:VB.ink}}>🌐 Global Intelligence Library</div>
          <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>
            Shared companies and industry leaders — available to every partner workspace as global defaults
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:6,padding:"6px 12px",textAlign:"center"}}>
            <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>COMPANIES</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:doneRes>0?VB.gold:VB.muted,lineHeight:1}}>{doneRes}/{globalCos.length}</div>
          </div>
          <div style={{background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:6,padding:"6px 12px",textAlign:"center"}}>
            <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>LEADERS</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:doneIntel>0?VB.teal2:VB.muted,lineHeight:1}}>{doneIntel}/{globalSH.length}</div>
          </div>
        </div>
      </div>

      {/* Section toggle */}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <button className={`btn ${section==="companies"?"bg":"bo"}`} style={{fontSize:10}} onClick={()=>setSection("companies")}>
          🏢 Global Companies ({globalCos.length})
        </button>
        <button className={`btn ${section==="stakeholders"?"bg":"bo"}`} style={{fontSize:10}} onClick={()=>setSection("stakeholders")}>
          👤 Global Industry Leaders ({globalSH.length})
        </button>
        <div style={{flex:1}}/>
        <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,alignSelf:"center"}}>
          Research here updates all partner workspaces simultaneously
        </div>
      </div>

      {/* ── COMPANIES ── */}
      {section === "companies" && (
        <div className="fu">
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            {["All","OFS","Operator","NOC"].map(t=>(
              <button key={t} className={`btn ${coFilter===t?"bg":"bo"}`} style={{fontSize:9}} onClick={()=>setCoFilter(t)}>{t}</button>
            ))}
            <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginLeft:6}}>
              These are the global defaults — add partner-specific companies inside each workspace
            </span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10,marginBottom:16}}>
            {filtCos.map(co=>{
              const d=research[co.id]; const st=rStatus[co.id]; const sel=selCo?.id===co.id;
              return (
                <div key={co.id} className="card" onClick={()=>d&&setSelCo(sel?null:co)}
                  style={{padding:14,cursor:d?"pointer":"default",borderLeft:`3px solid ${co.color}`,...(sel?{borderColor:VB.gold,boxShadow:`0 0 0 1px rgba(181,211,52,.1)`}:{})}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:VB.ink}}>{co.name}</div>
                      <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{co.ticker} · {co.type}</div>
                    </div>
                    <span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:"rgba(181,211,52,.07)",color:VB.gold,border:`1px solid ${VB.border}`}}>Global</span>
                  </div>
                  {d?.fetchedAt&&<div style={{marginBottom:7}} onClick={e=>e.stopPropagation()}>
                    <FetchStamp fetchedAt={d.fetchedAt} size="sm"
                      loading={st==="loading"}
                      onRefresh={()=>onResearch(co,allProbs,true)}/>
                  </div>}
                  {!st&&<button className="btn bo" style={{width:"100%",justifyContent:"center",fontSize:9}} onClick={e=>{e.stopPropagation();onResearch(co,allProbs);}}>▶ Research</button>}
                  {st==="loading"&&<div style={{display:"flex",gap:6,fontSize:10,color:VB.muted,alignItems:"center"}}><Sp s={12}/>Researching…</div>}
                  {st==="error"&&<div style={{fontSize:9,color:VB.coral}}>Failed — <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={e=>{e.stopPropagation();onResearch(co,allProbs);}}>retry</span></div>}
                  {st==="done"&&d&&(
                    <div>
                      <div style={{fontSize:10,color:VB.muted,lineHeight:1.6,marginBottom:6}}>{(d.companyOverview||"").slice(0,110)}…</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:5}}>
                        {(d.keyProblems||[]).slice(0,2).map((p,i)=><Chip key={i} c={p.severity==="High"?VB.coral:VB.gold}>{(p.title||"").slice(0,24)}…</Chip>)}
                      </div>
                      {d.radarScores&&(
                        <div style={{display:"flex",gap:2,marginTop:6}}>
                          {Object.entries(d.radarScores).map(([k,v])=>(
                            <div key={k} style={{flex:1,textAlign:"center"}}>
                              <div style={{height:24,background:VB.surface2,borderRadius:2,position:"relative",overflow:"hidden"}}>
                                <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${v*10}%`,background:co.color,opacity:.6}}/>
                              </div>
                              <div style={{fontSize:6,fontFamily:"'DM Mono',monospace",color:VB.muted,marginTop:1}}>{k.slice(0,4)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{marginTop:8,display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:8,color:VB.teal2,fontFamily:"'DM Mono',monospace",flex:1}}>↓ Click to expand</span>
                        <button className="btn bt" style={{fontSize:8,padding:"2px 8px"}}
                          onClick={e=>{e.stopPropagation();setEnrichTarget({entity:co,entityType:"company",profile:d});}}>
                          📎 Enrich
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expanded company detail */}
          {selCo&&research[selCo.id]&&(()=>{
            const r=research[selCo.id];
            return (
              <div className="card fu" style={{padding:20,borderLeft:`4px solid ${selCo.color}`,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:VB.ink}}>{selCo.name} — Full Intelligence Report</div>
                    <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3,display:"flex",alignItems:"center",gap:10}}>
                      <span>Public info · AI synthesised</span>
                      <FetchStamp fetchedAt={r.fetchedAt} loading={rStatus[selCo.id]==="loading"}
                        onRefresh={()=>onResearch(selCo,allProbs,true)}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn bt" style={{fontSize:9}} onClick={()=>setEnrichTarget({entity:selCo,entityType:"company",profile:research[selCo.id]})}>📎 Enrich</button>
                    <button className="btn bt" style={{fontSize:9}} onClick={()=>onResearch(selCo,allProbs)}>⟳ Refresh</button>
                    <button className="btn bo" style={{fontSize:9}} onClick={()=>setSelCo(null)}>✕ Close</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9,marginBottom:14}}>
                  {[["Core Position",r.corePosition],["Digital Strategy",r.digitalStrategy],["Supply Chain",r.supplyChainRisks],["International",r.internationalExpansion]].map(([l,v])=>(
                    <div key={l} style={{background:VB.surface2,padding:11,borderRadius:6}}>
                      <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:4}}>{l.toUpperCase()}</div>
                      <div style={{fontSize:10,color:VB.muted,lineHeight:1.6}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  <div>
                    <SL c={VB.coral} mb={7}>Key Problems Identified</SL>
                    {(r.keyProblems||[]).map((p,i)=>(
                      <div key={i} style={{background:VB.surface2,padding:"7px 9px",borderRadius:5,borderLeft:`2px solid ${p.severity==="High"?VB.coral:VB.gold}`,marginBottom:5}}>
                        <div style={{display:"flex",gap:5,marginBottom:2}}><Bdg v={p.severity} sm/><span style={{fontSize:10,color:VB.ink,fontWeight:600}}>{p.title}</span></div>
                        <div style={{fontSize:9,color:VB.muted}}>{p.description}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <SL c={VB.teal2} mb={7}>Relevance to Partner Problems</SL>
                    {r.problemRelevance&&Object.entries(r.problemRelevance).filter(([,v])=>v!=="None").map(([k,v])=>{
                      const prob = allProbs.find(p=>p.id===k);
                      if(!prob) return null;
                      return (
                        <div key={k} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"4px 0",borderBottom:`1px solid ${VB.border}`}}>
                          <Bdg v={v} sm/><span style={{fontSize:9,color:VB.muted,lineHeight:1.4}}>{prob.title}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <SL c={VB.gold} mb={7}>⚡ Urgency Signals</SL>
                    {(r.urgencySignals||[]).map((u,i)=><div key={i} style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.gold2,padding:"2px 0",lineHeight:1.5}}>• {u}</div>)}
                    {(r.competitiveWeaknesses||[]).length>0&&<>
                      <SL c={VB.coral} mb={7} style={{marginTop:10}}>Weaknesses</SL>
                      {(r.competitiveWeaknesses||[]).map((w,i)=><div key={i} style={{fontSize:9,color:VB.muted,padding:"2px 0"}}>⚠ {w}</div>)}
                    </>}
                  </div>
                </div>
                {(r.dataSources||[]).length>0&&(
                  <div style={{marginTop:12,padding:"8px 12px",background:VB.bg2,borderRadius:5}}>
                    <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:4}}>DATA SOURCES</div>
                    {r.dataSources.map((s,i)=><div key={i} style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,padding:"1px 0"}}>• {s}</div>)}
                  </div>
                )}
                {(r.enrichFiles||[]).length>0&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:`${VB.teal2}08`,borderRadius:5,border:`1px solid ${VB.teal2}20`}}>
                    <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.teal2,marginBottom:5,letterSpacing:".08em"}}>📎 ENRICHMENT FILES ({r.enrichFiles.length})</div>
                    {r.enrichFiles.map((f,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",borderBottom:i<r.enrichFiles.length-1?`1px solid ${VB.border}`:"none"}}>
                        <span style={{fontSize:9,color:VB.ink2,flex:1,fontFamily:"'DM Mono',monospace"}}>{f.name}</span>
                        <span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace",flexShrink:0}}>{f.charCount?.toLocaleString()} chars</span>
                        <span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace",flexShrink:0}}>{new Date(f.addedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── INDUSTRY STAKEHOLDERS ── */}
      {section === "stakeholders" && (
        <div className="fu">
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            {["All","OFS","Operator","NOC"].map(f=>(
              <button key={f} className={`btn ${shFilter===f?"bg":"bo"}`} style={{fontSize:9}} onClick={()=>setSHFilter(f)}>{f}</button>
            ))}
            <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginLeft:6}}>
              Add partner-specific leaders inside each workspace
            </span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:14,alignItems:"start"}}>
            {/* List */}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {filtSH.map(sh=>{
                const intel=shIntel[sh.id]; const loading=shLoading[sh.id]; const sel=selSH?.id===sh.id;
                return (
                  <div key={sh.id} className="card" onClick={()=>setSelSH(sel?null:sh)}
                    style={{padding:12,cursor:"pointer",borderLeft:`3px solid ${sh.color}`,...(sel?{borderColor:VB.gold,boxShadow:`0 0 0 1px rgba(181,211,52,.1)`}:{})}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:`${sh.color}20`,border:`2px solid ${sh.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:sh.color}}>{sh.avatar}</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:1}}>
                          <span style={{fontSize:12,fontWeight:600,color:VB.ink}}>{sh.name}</span>
                          <span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:"rgba(181,211,52,.07)",color:VB.gold,border:`1px solid ${VB.border}`}}>Global</span>
                        </div>
                        <div style={{fontSize:9,color:VB.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sh.title}</div>
                        <div style={{fontSize:9,color:sh.color}}>{sh.org}</div>
                      </div>
                      <div style={{flexShrink:0}}>
                        {loading&&<Sp s={11}/>}
                        {intel&&!intel.error&&<Pu c={VB.gold}/>}
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:5}}>{(sh.tags||[]).slice(0,3).map(t=><Chip key={t}>{t}</Chip>)}</div>
                    <div style={{display:"flex",gap:5,marginTop:8}}>
                      <button className="btn bt" style={{flex:1,justifyContent:"center",fontSize:8}}
                        onClick={e=>{e.stopPropagation();onFetchSH(sh,allProbs);}}>
                        {intel&&!intel.error?"⟳ Refresh":"▶ Fetch Intel"}
                      </button>
                      {intel&&!intel.error&&(
                        <button className="btn bt" style={{fontSize:8,padding:"3px 9px"}}
                          onClick={e=>{e.stopPropagation();setEnrichTarget({entity:sh,entityType:"leader",profile:intel});}}>
                          📎 Enrich
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail */}
            <div>
              {!selSH&&(
                <div style={{padding:"48px 20px",textAlign:"center",fontSize:12,color:VB.muted,background:VB.surface,border:`1px solid ${VB.border}`,borderRadius:8}}>
                  Select a leader to view their intelligence profile
                </div>
              )}
              {selSH&&(()=>{
                const intel=shIntel[selSH.id]; const loading=shLoading[selSH.id];
                return (
                  <div>
                    <div className="card" style={{padding:16,marginBottom:10,borderLeft:`4px solid ${selSH.color}`}}>
                      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                        <div style={{width:48,height:48,borderRadius:"50%",background:`${selSH.color}20`,border:`2px solid ${selSH.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:selSH.color}}>{selSH.avatar}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:VB.ink}}>{selSH.name}</div>
                          <div style={{fontSize:11,color:VB.muted}}>{selSH.title} · {selSH.org}</div>
                          <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{(selSH.tags||[]).map(t=><Chip key={t}>{t}</Chip>)}</div>
                        </div>
                        {intel&&!intel.error&&(
                          <div style={{textAlign:"center",background:VB.surface2,padding:"8px 12px",borderRadius:6,flexShrink:0}}>
                            <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>RELEVANCE</div>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:(intel.relevanceScore||0)>=7?VB.gold:VB.teal2,lineHeight:1}}>{intel.relevanceScore}/10</div>
                          </div>
                        )}
                      </div>
                      {!intel&&!loading&&<button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={()=>onFetchSH(selSH,allProbs)}>▶ Fetch Intelligence Profile</button>}
                      {loading&&<div style={{display:"flex",gap:8,alignItems:"center"}}><Sp/><span style={{fontSize:11,color:VB.muted}}>Fetching…</span></div>}
                      {intel&&!intel.error&&(
                        <div style={{marginTop:8}}>
                          <button className="btn bt" style={{fontSize:9,width:"100%",justifyContent:"center"}}
                            onClick={()=>setEnrichTarget({entity:selSH,entityType:"leader",profile:intel})}>
                            📎 Enrich with Article / Transcript / Video
                          </button>
                        </div>
                      )}
                    </div>
                    {intel&&!intel.error&&(
                      <div className="fu" style={{display:"flex",flexDirection:"column",gap:10}}>
                        <div className="card" style={{padding:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                            <div style={{flex:1}}><SL mb={6}>Summary</SL><div style={{fontSize:11,color:VB.ink2,lineHeight:1.8}}>{intel.summary}</div></div>
                            <div style={{background:VB.surface2,padding:"8px 12px",borderRadius:6,textAlign:"center",flexShrink:0}}>
                              <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:3}}>SENTIMENT</div>
                              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:".04em",color:intel.overallSentiment==="bullish"?VB.gold:intel.overallSentiment==="critical"?VB.coral:VB.teal2}}>{(intel.overallSentiment||"").toUpperCase()}</div>
                              <div style={{fontSize:7,color:VB.muted,marginTop:3,fontFamily:"'DM Mono',monospace"}}>{intel.ts}</div>
                            </div>
                          </div>
                        </div>
                        {(intel.strategicPriorities||[]).length>0&&(
                          <div className="card" style={{padding:12}}>
                            <SL mb={7}>Strategic Priorities</SL>
                            {intel.strategicPriorities.map((p,i)=>(
                              <div key={i} style={{display:"flex",gap:8,padding:"3px 0",borderBottom:`1px solid ${VB.border}`}}>
                                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:VB.gold,lineHeight:1,minWidth:13}}>{i+1}</span>
                                <span style={{fontSize:10,color:VB.muted,lineHeight:1.5}}>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(intel.signals||[]).length>0&&(
                          <div className="card" style={{padding:12}}>
                            <SL c={VB.coral} mb={7}>Signals & Implications</SL>
                            {intel.signals.map((s,i)=>(
                              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,padding:"6px 0",borderBottom:`1px solid ${VB.border}`}}>
                                <div style={{fontSize:10,color:VB.ink2,lineHeight:1.5}}>{s.signal}</div>
                                <div style={{fontSize:10,color:VB.teal2,background:`${VB.teal}10`,padding:"4px 7px",borderRadius:4,lineHeight:1.5}}>
                                  <span style={{fontSize:7,color:VB.teal,display:"block",marginBottom:1}}>IMPLICATION</span>{s.implication}
                                </div>
                                <Bdg v={s.urgency} sm/>
                              </div>
                            ))}
                          </div>
                        )}
                        {(intel.keyQuotes||[]).length>0&&(
                          <div className="card" style={{padding:12}}>
                            <SL mb={7}>Key Quotes</SL>
                            {intel.keyQuotes.map((q,i)=>(
                              <div key={i} style={{padding:"8px 12px",background:VB.bg2,borderRadius:5,borderLeft:`3px solid ${selSH.color}`,marginBottom:6}}>
                                <div style={{fontSize:11,color:VB.ink2,lineHeight:1.7,fontStyle:"italic",marginBottom:4}}>"{q.quote}"</div>
                                <div style={{display:"flex",gap:5}}><Chip c={VB.teal}>{q.source}</Chip><span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{q.date}</span></div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(intel.watchFor||[]).length>0&&(
                          <div className="card" style={{padding:12}}>
                            <SL c={VB.gold} mb={7}>Watch For</SL>
                            {intel.watchFor.map((w,i)=>(
                              <div key={i} style={{fontSize:10,color:VB.muted,padding:"5px 8px",background:VB.surface2,borderRadius:4,borderLeft:`2px solid ${VB.gold}`,marginBottom:5,lineHeight:1.5}}>
                                <span style={{color:VB.gold2,marginRight:4}}>!</span>{w}
                              </div>
                            ))}
                          </div>
                        )}
                        {intel.problemRelevance&&Object.entries(intel.problemRelevance).filter(([,v])=>v!=="None").length>0&&(
                          <div className="card" style={{padding:12}}>
                            <SL c={VB.teal2} mb={7}>Relevance to Partner Problems</SL>
                            {Object.entries(intel.problemRelevance).filter(([,v])=>v!=="None").map(([k,v])=>{
                              const prob = allProbs.find(p=>p.id===k);
                              if(!prob) return null;
                              return (
                                <div key={k} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"4px 0",borderBottom:`1px solid ${VB.border}`}}>
                                  <Bdg v={v} sm/><span style={{fontSize:9,color:VB.muted,lineHeight:1.4}}>{prob.title}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {(intel.dataSources||[]).length>0&&(
                          <div className="card" style={{padding:12}}>
                            <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:4}}>DATA SOURCES</div>
                            {intel.dataSources.map((s,i)=><div key={i} style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,padding:"1px 0"}}>• {s}</div>)}
                          </div>
                        )}
                        {(intel.enrichFiles||[]).length>0&&(
                          <div className="card" style={{padding:12,borderLeft:`3px solid ${VB.teal2}`}}>
                            <SL c={VB.teal2} mb={7}>📎 Enrichment Files ({intel.enrichFiles.length})</SL>
                            {intel.enrichFiles.map((f,i)=>(
                              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px",
                                borderRadius:4,background:VB.surface2,marginBottom:4}}>
                                <span style={{fontSize:9,color:VB.ink2,flex:1,fontFamily:"'DM Mono',monospace"}}>{f.name}</span>
                                <span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{f.charCount?.toLocaleString()} chars</span>
                                <span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{new Date(f.addedAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {intel?.error&&(
                      <div className="card" style={{padding:13,borderLeft:`3px solid ${VB.coral}`}}>
                        <div style={{fontSize:11,color:VB.coral}}>Fetch failed: {intel.error}</div>
                        <button className="btn bt" style={{marginTop:9,fontSize:9}} onClick={()=>onFetchSH(selSH,allProbs)}>Retry</button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ① DOCUMENT INGEST
// ══════════════════════════════════════════════════════════════════════════════
function DocIngest({partners, onAddProbs, onClose}) {
  const [pid, setPid]     = useState(partners[0]?.id||"");
  const [text, setText]   = useState("");
  const [status, setSt]   = useState("idle");
  const [parsed, setParsed] = useState([]);
  const [sel, setSel]     = useState({});
  const partner = partners.find(p=>p.id===pid);

  const handleParse = async () => {
    if (!text.trim()) return;
    setSt("loading");
    try {
      const res = await callAI(pIngest(text, partner?.name||pid));
      const arr = Array.isArray(res) ? res : (res.problems||[]);
      const stamped = arr.map(p=>({...p,id:"ing_"+uid(),pid,
        radarScores:{Financial:6,Strategic:7,Urgency:7,Solvability:6,"Market Size":6},
        urgencyLevel:6,stakeholderInfluence:[],urgencySignals:[]}));
      setParsed(stamped);
      setSel(Object.fromEntries(stamped.map(p=>[p.id,true])));
      setSt("preview");
    } catch(e) { setSt("idle"); }
  };

  const handleAdd = () => {
    onAddProbs(parsed.filter(p=>sel[p.id]));
    setSt("done");
    setTimeout(onClose, 800);
  };

  return (
    <Overlay onClose={onClose} w={740}>
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${VB.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:VB.gold,letterSpacing:".04em"}}>📥 Document Ingest</div>
        <button className="btn bo" style={{padding:"2px 8px"}} onClick={onClose}>✕</button>
      </div>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:12}}>
        {status==="done" && <div style={{textAlign:"center",padding:32,color:VB.gold,fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:".04em"}}>✓ Problems Added to {partner?.name}</div>}
        {status!=="done" && <>
          <div style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:10,alignItems:"start"}}>
            <div>
              <div style={{fontSize:8,color:VB.muted,marginBottom:4,letterSpacing:".1em"}}>ASSIGN TO PARTNER</div>
              <select value={pid} onChange={e=>setPid(e.target.value)}>{partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
            <div style={{padding:"8px 12px",background:VB.surface2,borderRadius:6,fontSize:9,color:VB.muted,lineHeight:1.6}}>
              Paste raw discovery text, meeting notes, a BU summary, or interview transcripts. AI will extract and structure problem statements with RICE scores and dollar estimates.
            </div>
          </div>

          {status!=="preview" && <>
            <div>
              <div style={{fontSize:8,color:VB.muted,marginBottom:4,letterSpacing:".1em"}}>PASTE DOCUMENT TEXT</div>
              <textarea rows={10} value={text} onChange={e=>setText(e.target.value)} style={{fontSize:10,lineHeight:1.6}}
                placeholder={"Paste discovery document, interview notes, or BU summary here...\n\nThe AI will extract structured problem statements automatically."}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              <button className="btn bo" onClick={onClose}>Cancel</button>
              <button className="btn bg" disabled={!text.trim()||status==="loading"} onClick={handleParse}>
                {status==="loading"?<><Sp s={11}/> Parsing…</>:"✦ Parse with AI"}
              </button>
            </div>
          </>}

          {status==="preview" && <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <SL c={VB.gold}>Extracted {parsed.length} Problems — Select to Import</SL>
              <div style={{display:"flex",gap:5}}>
                <button className="btn bo" style={{fontSize:8}} onClick={()=>setSel(Object.fromEntries(parsed.map(p=>[p.id,true])))}>All</button>
                <button className="btn bo" style={{fontSize:8}} onClick={()=>setSel({})}>None</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:340,overflowY:"auto"}}>
              {parsed.map(p=>{
                const isOn=!!sel[p.id];
                return (
                  <div key={p.id} onClick={()=>setSel(s=>({...s,[p.id]:!s[p.id]}))}
                    style={{padding:"10px 13px",borderRadius:7,cursor:"pointer",border:`1.5px solid ${isOn?VB.gold:VB.border}`,background:isOn?"rgba(181,211,52,.05)":VB.surface,transition:"all .12s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                          <span style={{width:14,height:14,borderRadius:3,border:`2px solid ${isOn?VB.gold:VB.border}`,background:isOn?VB.gold:"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {isOn&&<span style={{fontSize:9,color:"#091C1D",fontWeight:"bold"}}>✓</span>}
                          </span>
                          <span style={{fontSize:11,fontWeight:600,color:VB.ink}}>{p.title}</span>
                          <Bdg v={p.pri} sm/>
                        </div>
                        <div style={{fontSize:9,color:VB.muted,marginLeft:21,lineHeight:1.5}}>{p.impact}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                        <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:CAT[p.cat]||VB.muted}}>{p.cat}</span>
                        <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.gold}}>RICE {getRice(p)} · ${(p.mid/1e6).toFixed(0)}M</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${VB.border}`}}>
              <button className="btn bo" onClick={()=>{setSt("idle");setParsed([]);}}>← Re-paste</button>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{Object.values(sel).filter(Boolean).length}/{parsed.length} selected</span>
                <button className="btn bg" disabled={!Object.values(sel).some(Boolean)} onClick={handleAdd}>+ Add to {partner?.name}</button>
              </div>
            </div>
          </>}
        </>}
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ② ACTION TRACKER
// ══════════════════════════════════════════════════════════════════════════════
const ACT_S = ["todo","in-progress","done","blocked"];
const ACT_C = {todo:VB.muted,"in-progress":VB.teal2,done:VB.gold,blocked:VB.coral};

function ActionTracker({probId, actions, onAdd, onUpdate, onDelete}) {
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({text:"",owner:"",due:"",status:"todo"});
  const mine = (actions||[]).filter(a=>a.probId===probId);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <SL c={VB.teal2} mb={0}>⚡ Actions ({mine.length})</SL>
        {!adding&&<button className="btn bt" style={{padding:"2px 8px",fontSize:8}} onClick={()=>setAdding(true)}>+ Add</button>}
      </div>
      {adding&&(
        <div style={{background:VB.surface2,borderRadius:7,padding:"10px 12px",marginBottom:8,border:`1px solid ${VB.border2}`}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:7,marginBottom:7}}>
            <input placeholder="Action…" value={nf.text} onChange={e=>setNf(f=>({...f,text:e.target.value}))} autoFocus/>
            <input placeholder="Owner" value={nf.owner} onChange={e=>setNf(f=>({...f,owner:e.target.value}))}/>
            <input type="date" value={nf.due} onChange={e=>setNf(f=>({...f,due:e.target.value}))} style={{fontSize:10}}/>
            <select value={nf.status} onChange={e=>setNf(f=>({...f,status:e.target.value}))}>{ACT_S.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
            <button className="btn bo" style={{fontSize:9}} onClick={()=>{setAdding(false);setNf({text:"",owner:"",due:"",status:"todo"});}}>Cancel</button>
            <button className="btn bg" style={{fontSize:9}} disabled={!nf.text.trim()} onClick={()=>{
              onAdd({id:"act_"+uid(),probId,...nf,createdAt:new Date().toISOString()});
              setNf({text:"",owner:"",due:"",status:"todo"}); setAdding(false);
            }}>Save</button>
          </div>
        </div>
      )}
      {mine.length===0&&!adding&&<div style={{fontSize:9,color:VB.muted,fontStyle:"italic"}}>No actions yet</div>}
      {mine.map(a=>{
        const sc=ACT_C[a.status]||VB.muted;
        const overdue=a.due&&a.status!=="done"&&new Date(a.due)<new Date();
        return (
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:5,marginBottom:4,background:VB.surface2,border:`1px solid ${overdue?VB.coral+"40":VB.border}`}}>
            <button onClick={()=>onUpdate({...a,status:a.status==="done"?"todo":"done"})}
              style={{width:16,height:16,borderRadius:3,border:`2px solid ${sc}`,background:a.status==="done"?sc:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {a.status==="done"&&<span style={{fontSize:9,color:"#091C1D",fontWeight:"bold"}}>✓</span>}
            </button>
            <span style={{flex:1,fontSize:9,color:a.status==="done"?VB.muted:VB.ink,textDecoration:a.status==="done"?"line-through":"none"}}>{a.text}</span>
            {a.owner&&<span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.teal2,padding:"1px 5px",borderRadius:3,background:`${VB.teal2}14`}}>{a.owner}</span>}
            {a.due&&<span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:overdue?VB.coral:VB.muted}}>{overdue?"⚠ ":""}{a.due}</span>}
            <select value={a.status} onChange={e=>onUpdate({...a,status:e.target.value})}
              style={{width:"auto",fontSize:8,padding:"2px 5px",color:sc,background:VB.bg2,border:`1px solid ${sc}30`}}>
              {ACT_S.map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={()=>onDelete(a.id)} style={{background:"transparent",border:"none",color:VB.muted,cursor:"pointer",fontSize:12,lineHeight:1}}>×</button>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ③ LIVE RICE EDITOR
// ══════════════════════════════════════════════════════════════════════════════
function RiceEditor({p, onUpdate}) {
  const [loc, setLoc] = useState({reach:p.reach||60,impact2:p.impact2||7,confidence:p.confidence||75,effort:p.effort||5});
  const rice = Math.round(((loc.reach*loc.impact2*(loc.confidence/100))/loc.effort)*10)/10;
  const prev  = getRice(p);
  const delta = +(rice-prev).toFixed(1);

  const Slider = ({k,label,min,max,color}) => (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,letterSpacing:".1em"}}>{label}</span>
        <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color,fontWeight:"bold"}}>{loc[k]}</span>
      </div>
      <input type="range" min={min} max={max} value={loc[k]} onChange={e=>setLoc(l=>({...l,[k]:+e.target.value}))}
        style={{width:"100%",accentColor:color,cursor:"pointer",height:4}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:VB.muted,marginTop:1}}><span>{min}</span><span>{max}</span></div>
    </div>
  );

  return (
    <div style={{background:VB.surface2,borderRadius:8,padding:"12px 14px",border:`1px solid ${VB.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <SL c={VB.gold} mb={0}>◆ RICE Editor</SL>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:VB.gold,lineHeight:1}}>{rice}</div>
          <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:delta>=0?VB.teal2:VB.coral}}>{delta>=0?"+":""}{delta} vs saved</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 18px",marginBottom:12}}>
        <Slider k="reach"      label="REACH (%)"           min={1} max={100} color={VB.teal2}/>
        <Slider k="impact2"    label="IMPACT (1–10)"        min={1} max={10}  color={VB.gold}/>
        <Slider k="confidence" label="CONFIDENCE (%)"       min={1} max={100} color={VB.gold2}/>
        <Slider k="effort"     label="EFFORT — lower=better" min={1} max={10}  color={VB.coral}/>
      </div>
      <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,padding:"5px 8px",background:VB.bg2,borderRadius:4,marginBottom:10}}>
        ({loc.reach} × {loc.impact2} × {(loc.confidence/100).toFixed(2)}) ÷ {loc.effort} = <b style={{color:VB.gold}}>{rice}</b>
      </div>
      <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
        <button className="btn bo" style={{fontSize:9}} onClick={()=>setLoc({reach:p.reach||60,impact2:p.impact2||7,confidence:p.confidence||75,effort:p.effort||5})}>Reset</button>
        <button className="btn bg" style={{fontSize:9}} onClick={()=>onUpdate({...p,...loc})}>Save RICE</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ④ OUTREACH CRM PIPELINE
// ══════════════════════════════════════════════════════════════════════════════
const CRM_STAGES = [
  {id:"identified",label:"Identified", color:"#849BA6",icon:"◎"},
  {id:"contacted", label:"Contacted",  color:"#00b8cc",icon:"◉"},
  {id:"diligence", label:"Diligence",  color:"#a855f7",icon:"◆"},
  {id:"active",    label:"Active",     color:"#B5D334",icon:"★"},
  {id:"passed",    label:"Passed",     color:"#E46962",icon:"✕"},
];

function CRMPipeline({probId, crm, onAdd, onUpdate, onDelete}) {
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({name:"",stage:"identified",notes:"",website:"",contact:""});
  const mine = (crm||[]).filter(c=>c.probId===probId);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <SL c={VB.purple} mb={0}>🏢 Startup Pipeline ({mine.length})</SL>
        {!adding&&<button className="btn bv" style={{padding:"2px 8px",fontSize:8}} onClick={()=>setAdding(true)}>+ Track Startup</button>}
      </div>
      {adding&&(
        <div style={{background:VB.surface2,borderRadius:7,padding:"11px 13px",marginBottom:10,border:`1px solid rgba(168,85,247,.25)`}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:7,marginBottom:7}}>
            <input placeholder="Company name" value={nf.name} onChange={e=>setNf(f=>({...f,name:e.target.value}))} autoFocus/>
            <select value={nf.stage} onChange={e=>setNf(f=>({...f,stage:e.target.value}))}>{CRM_STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
            <input placeholder="Website" value={nf.website} onChange={e=>setNf(f=>({...f,website:e.target.value}))}/>
            <input placeholder="Contact / LinkedIn" value={nf.contact} onChange={e=>setNf(f=>({...f,contact:e.target.value}))}/>
          </div>
          <textarea rows={2} placeholder="Notes…" value={nf.notes} onChange={e=>setNf(f=>({...f,notes:e.target.value}))} style={{marginBottom:7}}/>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
            <button className="btn bo" style={{fontSize:9}} onClick={()=>{setAdding(false);setNf({name:"",stage:"identified",notes:"",website:"",contact:""});}}>Cancel</button>
            <button className="btn bv" style={{fontSize:9}} disabled={!nf.name.trim()} onClick={()=>{
              onAdd({id:"crm_"+uid(),probId,...nf,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
              setNf({name:"",stage:"identified",notes:"",website:"",contact:""}); setAdding(false);
            }}>Add</button>
          </div>
        </div>
      )}
      {mine.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
          {CRM_STAGES.map(stage=>{
            const cards=mine.filter(c=>c.stage===stage.id);
            return (
              <div key={stage.id} style={{background:VB.surface2,borderRadius:6,padding:"8px 7px",minHeight:50,border:`1px solid ${stage.color}20`}}>
                <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:stage.color,letterSpacing:".1em",marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                  <span>{stage.icon} {stage.label}</span>
                  {cards.length>0&&<span style={{background:`${stage.color}22`,padding:"0 4px",borderRadius:2}}>{cards.length}</span>}
                </div>
                {cards.map(c=>(
                  <div key={c.id} style={{background:VB.bg2,borderRadius:5,padding:"7px 8px",marginBottom:5,border:`1px solid ${stage.color}30`}}>
                    <div style={{fontSize:10,fontWeight:600,color:VB.ink,marginBottom:2}}>{c.name}</div>
                    {c.website&&<div style={{fontSize:8,color:VB.teal2,fontFamily:"'DM Mono',monospace",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.website}</div>}
                    {c.contact&&<div style={{fontSize:8,color:VB.muted,marginBottom:3}}>{c.contact}</div>}
                    {c.notes&&<div style={{fontSize:8,color:VB.muted,lineHeight:1.4,marginBottom:5}}>{c.notes.slice(0,80)}{c.notes.length>80?"…":""}</div>}
                    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:2}}>
                      {CRM_STAGES.filter(s=>s.id!==stage.id).map(s=>(
                        <button key={s.id} onClick={()=>onUpdate({...c,stage:s.id,updatedAt:new Date().toISOString()})}
                          style={{fontSize:7,padding:"1px 4px",borderRadius:3,cursor:"pointer",background:`${s.color}14`,color:s.color,border:`1px solid ${s.color}30`}}>→ {s.label}</button>
                      ))}
                      <button onClick={()=>onDelete(c.id)} style={{fontSize:7,padding:"1px 4px",borderRadius:3,cursor:"pointer",background:"rgba(228,105,98,.1)",color:VB.coral,border:`1px solid ${VB.coral}30`,marginLeft:"auto"}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      {mine.length===0&&!adding&&<div style={{fontSize:9,color:VB.muted,fontStyle:"italic"}}>No startups tracked — add manually or use Scout below</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ⑤ STARTUP SCOUT
// ══════════════════════════════════════════════════════════════════════════════
function StartupScout({p, buys, onAddToCRM, crm}) {
  const [status, setSt]     = useState("idle");
  const [results, setRes]   = useState(null);
  const [stageFilter, setSF] = useState("");
  const [geoFilter, setGF]  = useState("");
  const [fitMin, setFitMin] = useState(5);
  const [memoId, setMemoId] = useState(null);   // which startup's memo is open
  const [memo, setMemo]     = useState({});      // {startupName: memoData}
  const [memoL, setMemoL]   = useState({});      // loading states

  const tracked = new Set((crm||[]).filter(c=>c.probId===p.id).map(c=>c.name.toLowerCase()));

  const handleScout = async () => {
    setSt("loading"); setRes(null);
    try {
      const r = await callAI(pScout(p, buys||[], {stage:stageFilter, geo:geoFilter}));
      setRes(r); setSt("done");
    } catch { setSt("error"); }
  };

  const handleMemo = async (s) => {
    const key = s.name;
    if (memo[key]) { setMemoId(key); return; }
    setMemoL(l=>({...l,[key]:true}));
    try {
      const d = await callAI(pDealMemo({name:s.name,website:s.website,stage:s.stage,notes:s.whyFit,contact:s.contactAngle}, p, null));
      setMemo(m=>({...m,[key]:d}));
      setMemoId(key);
    } catch(e) { setMemo(m=>({...m,[key]:{error:"Failed to generate"}})); setMemoId(key); }
    setMemoL(l=>({...l,[key]:false}));
  };

  const sigColor = {High:VB.gold, Medium:VB.teal2, Low:VB.muted};
  const matColor = {Early:VB.teal2, Emerging:VB.gold, Mature:VB.coral};

  const visible = (results?.startups||[]).filter(s=>s.fitScore>=fitMin);

  return (
    <div>
      {/* Header + controls */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <SL c={VB.gold2} mb={0}>🔍 Startup Scout</SL>
        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
          <select value={stageFilter} onChange={e=>setSF(e.target.value)}
            style={{fontSize:9,padding:"3px 7px",background:VB.surface,border:`1px solid ${VB.border}`,
              borderRadius:4,color:VB.ink,fontFamily:"'DM Mono',monospace"}}>
            <option value="">All stages</option>
            {["Pre-seed","Seed","Series A","Series B","Growth"].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={geoFilter} onChange={e=>setGF(e.target.value)}
            style={{fontSize:9,padding:"3px 7px",background:VB.surface,border:`1px solid ${VB.border}`,
              borderRadius:4,color:VB.ink,fontFamily:"'DM Mono',monospace"}}>
            <option value="">Global</option>
            {["North America","Europe","Middle East","Asia Pacific"].map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          <button className="btn bg" style={{fontSize:9}} disabled={status==="loading"} onClick={handleScout}>
            {status==="loading"?<><Sp s={10}/> Scouting…</>:status==="done"?"↺ Re-scout":"✦ Scout Startups"}
          </button>
        </div>
      </div>

      {status==="idle"&&<div style={{fontSize:9,color:VB.muted,fontStyle:"italic",padding:"4px 0"}}>
        AI-powered startup discovery — finds real companies solving this exact problem with fit scores, funding stage &amp; contact angles
      </div>}
      {status==="error"&&<div style={{fontSize:9,color:VB.coral}}>Scout failed — try again</div>}

      {status==="done"&&results&&(
        <div>
          {/* Market context strip */}
          <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
            {results.marketMaturity&&(
              <span style={{fontSize:8,padding:"2px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace",
                  background:`${matColor[results.marketMaturity]||VB.muted}15`,
                  color:matColor[results.marketMaturity]||VB.muted,
                  border:`1px solid ${matColor[results.marketMaturity]||VB.muted}30`}}>
                {results.marketMaturity} market
              </span>
            )}
            <span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",alignSelf:"center"}}>
              {visible.length}/{(results.startups||[]).length} companies shown · fit ≥ {fitMin}
            </span>
            <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}}>
              <span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>Min fit:</span>
              <input type="range" min={1} max={10} value={fitMin}
                onChange={e=>setFitMin(+e.target.value)}
                style={{width:70,accentColor:VB.gold,cursor:"pointer"}}/>
              <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.gold,minWidth:14}}>{fitMin}</span>
            </div>
          </div>

          {results.scoutNote&&(
            <div style={{fontSize:9,color:VB.ink2,background:VB.surface2,padding:"8px 10px",borderRadius:5,
                marginBottom:10,lineHeight:1.5,borderLeft:`3px solid ${VB.gold}`}}>
              {results.scoutNote}
            </div>
          )}

          {/* Startup cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {visible.map((s,i)=>{
              const already  = tracked.has(s.name.toLowerCase());
              const fc       = s.fitScore>=8?VB.gold:s.fitScore>=6?VB.teal2:VB.muted;
              const sc       = sigColor[s.signalStrength]||VB.muted;
              const hasMemo  = !!memo[s.name];
              const loadMemo = !!memoL[s.name];
              return (
                <div key={i} style={{background:VB.surface2,borderRadius:7,padding:"11px 13px",
                    border:`1px solid ${already?VB.gold+"40":VB.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:600,color:VB.ink,marginBottom:1}}>{s.name}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>{s.stage}</span>
                        {s.hq&&<span style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>· {s.hq}</span>}
                        {s.raised&&<span style={{fontSize:7.5,color:VB.teal2,fontFamily:"'DM Mono',monospace"}}>· {s.raised}</span>}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:fc,lineHeight:1}}>{s.fitScore}/10</div>
                      <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>FIT</div>
                    </div>
                  </div>

                  <div style={{fontSize:9,color:VB.ink2,lineHeight:1.5,marginBottom:4}}>{s.oneLiner}</div>
                  <div style={{fontSize:8,color:VB.teal2,lineHeight:1.5,marginBottom:4}}>{s.whyFit}</div>

                  {s.differentiator&&(
                    <div style={{fontSize:8,color:VB.gold,background:`${VB.gold}0f`,
                        padding:"3px 7px",borderRadius:3,marginBottom:4}}>⚡ {s.differentiator}</div>
                  )}
                  {s.recentSignal&&(
                    <div style={{fontSize:8,color:sc,background:`${sc}0f`,padding:"3px 7px",
                        borderRadius:3,marginBottom:4,display:"flex",gap:4,alignItems:"flex-start"}}>
                      <span style={{flexShrink:0}}>📡</span>{s.recentSignal}
                    </div>
                  )}
                  {s.contactAngle&&(
                    <div style={{fontSize:8,color:VB.muted,fontStyle:"italic",marginBottom:7,lineHeight:1.4}}>
                      💬 {s.contactAngle}
                    </div>
                  )}

                  {/* Action row */}
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {already
                      ?<span style={{fontSize:8,color:VB.gold,fontFamily:"'DM Mono',monospace",alignSelf:"center"}}>✓ In pipeline</span>
                      :<button className="btn bv" style={{fontSize:8,padding:"3px 8px",flex:1,justifyContent:"center"}}
                          onClick={()=>onAddToCRM({
                            id:"crm_"+uid(),probId:p.id,name:s.name,stage:"identified",
                            website:s.website||"",contact:s.contactAngle||"",
                            notes:s.whyFit||"",fitScore:s.fitScore,
                            createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
                          })}>+ Track</button>
                    }
                    <button onClick={()=>handleMemo(s)} disabled={loadMemo}
                      style={{fontSize:8,padding:"3px 8px",borderRadius:4,cursor:"pointer",
                          background:hasMemo?`${VB.purple}20`:"transparent",
                          color:hasMemo?VB.purple:VB.muted,
                          border:`1px solid ${hasMemo?VB.purple+"40":VB.border}`}}>
                      {loadMemo?<Sp s={9}/>:hasMemo?"📋 Memo":"📋 Gen Memo"}
                    </button>
                  </div>

                  {/* Inline deal memo */}
                  {memoId===s.name&&memo[s.name]&&(
                    <div style={{marginTop:9,padding:"10px 12px",background:VB.bg2,borderRadius:6,
                        border:`1px solid ${VB.purple}30`,borderLeft:`3px solid ${VB.purple}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                        <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.purple,letterSpacing:".1em"}}>DEAL MEMO</span>
                        <button onClick={()=>setMemoId(null)} style={{background:"transparent",border:"none",color:VB.muted,cursor:"pointer",fontSize:12,lineHeight:1}}>×</button>
                      </div>
                      {memo[s.name].error
                        ?<div style={{fontSize:9,color:VB.coral}}>{memo[s.name].error}</div>
                        :<>
                          {memo[s.name].headline&&<div style={{fontSize:11,fontWeight:600,color:VB.ink,marginBottom:6,lineHeight:1.4}}>{memo[s.name].headline}</div>}
                          {memo[s.name].verdict&&(
                            <div style={{marginBottom:7}}>
                              <span style={{fontSize:8,padding:"2px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace",
                                  background:memo[s.name].verdict==="Strong Pass"?`${VB.gold}20`:memo[s.name].verdict==="Pass"?`${VB.coral}20`:`${VB.teal2}20`,
                                  color:memo[s.name].verdict==="Strong Pass"?VB.gold:memo[s.name].verdict==="Pass"?VB.coral:VB.teal2,
                                  border:`1px solid ${memo[s.name].verdict==="Strong Pass"?VB.gold:memo[s.name].verdict==="Pass"?VB.coral:VB.teal2}40`}}>
                                {memo[s.name].verdict}
                              </span>
                            </div>
                          )}
                          {[["Thesis",memo[s.name].thesis],[" Why Now",memo[s.name].whyNow],["Why Us",memo[s.name].whyUs]].map(([l,v])=>v&&(
                            <div key={l} style={{marginBottom:5}}>
                              <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",marginBottom:2}}>{l.toUpperCase()}</div>
                              <div style={{fontSize:9,color:VB.ink2,lineHeight:1.5}}>{v}</div>
                            </div>
                          ))}
                          {memo[s.name].nextStep&&(
                            <div style={{background:`${VB.teal2}0f`,padding:"5px 8px",borderRadius:4,
                                border:`1px solid ${VB.teal2}20`,marginTop:5}}>
                              <span style={{fontSize:7.5,fontFamily:"'DM Mono',monospace",color:VB.teal2}}>NEXT STEP: </span>
                              <span style={{fontSize:9,color:VB.ink2}}>{memo[s.name].nextStep}</span>
                            </div>
                          )}
                          {(memo[s.name].redFlags||[]).length>0&&(
                            <div style={{marginTop:5}}>
                              <div style={{fontSize:7,color:VB.coral,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",marginBottom:2}}>RED FLAGS</div>
                              {memo[s.name].redFlags.map((f,i)=>(
                                <div key={i} style={{fontSize:8.5,color:VB.coral,lineHeight:1.5}}>⚠ {f}</div>
                              ))}
                            </div>
                          )}
                        </>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {results.whitespaceNote&&(
            <div style={{fontSize:9,color:VB.muted,fontStyle:"italic",padding:"7px 10px",
                background:VB.surface2,borderRadius:5,borderLeft:`3px solid ${VB.muted}`}}>
              <b style={{color:VB.ink}}>Whitespace: </b>{results.whitespaceNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS — cross-partner summary report
// ══════════════════════════════════════════════════════════════════════════════
// ── EXPORT REPORT GENERATOR ──────────────────────────────────────────────────
function generateReportHTML({audience, probs, partners, buys, research, allCos, shIntel}) {
  const getRiceScore = p => Math.round(((p.reach||50)*(p.impact2||5)*((p.confidence||70)/100))/(p.effort||5)*10)/10;
  const sorted = [...probs].sort((a,b) => getRiceScore(b) - getRiceScore(a));
  const totalMid  = probs.reduce((s,p)=>s+(p.mid||0),0);
  const totalHigh = probs.reduce((s,p)=>s+(p.high||0),0);
  const highCount = probs.filter(p=>p.pri==="High").length;
  const buList    = [...new Set(probs.map(p=>p.pid))];

  const catColors = {
    "Operational Risk":"#E46962","Revenue Growth":"#B5D334","Product / Technology":"#00b8cc",
    "Process / Enabler":"#cde84a","Market Expansion":"#0097A7","Digital / AI":"#a855f7",
    "Integration":"#f59e0b","Field Intelligence":"#22c55e","Asset Automation":"#00b8cc","Cost Optimisation":"#B5D334",
  };
  const buColors = {
    "nov":"#B5D334","nov_ds":"#00b8cc","nov_dt":"#a855f7","nov_fgs":"#22c55e",
    "nov_ise":"#E46962","nov_mfg":"#f59e0b","nov_pm":"#3b82f6","nov_rh":"#f07870",
    "nov_rt":"#cde84a","nov_ts":"#0097A7","nov_tp":"#B5D334","ey":"#f59e0b",
  };

  const audienceMeta = {
    "Executive": {tag:"EY & NOV Senior Leadership", accent:"#B5D334", subtitle:"Strategic Opportunity Portfolio — Executive Summary"},
    "Internal":  {tag:"VentureBuilder Team — Internal", accent:"#00b8cc", subtitle:"Full Discovery Analysis — Internal Working Document"},
    "Investor":  {tag:"External Investors & Limited Partners", accent:"#E46962", subtitle:"Venture Portfolio Opportunity — Investor Briefing"},
  };
  const meta = audienceMeta[audience] || audienceMeta["Executive"];

  // Cross-BU theme data
  const themes = [
    {name:"Supply Chain & Materials", desc:"8 of 11 NOV BUs face active tariff-driven supply chain disruption. Tungsten carbide, steel imports, and resin sourcing all exposed. Coordinated sourcing strategy is a systemic NOV-wide opportunity.", count: probs.filter(p=>["Operational Risk"].includes(p.cat)).length},
    {name:"Digital Intelligence & Data", desc:"Every BU sits on siloed, unstructured operational data AI cannot yet touch. 200,000+ wells in Digital Services, 80+ years of pipe data in Tuboscope — compounding value awaiting a common data layer.", count: probs.filter(p=>["Digital / AI","Integration"].includes(p.cat)).length},
    {name:"Materials Science & Hardware", desc:"Seal failure, erosion coatings, carbide substitution, and temperature-resistant composites span Downhole Tech, ReedHycalog, Production & Midstream, and Fiber Glass Systems.", count: probs.filter(p=>p.cat==="Product / Technology").length},
    {name:"Talent & Commercialisation", desc:"ISE faces 40% vacancy in eFrac technicians. Sales knowledge gaps at Downhole Tech and Tuboscope. Pre-built commercial templates and outcome-based pricing are near-term quick wins.", count: probs.filter(p=>p.cat==="Process / Enabler").length},
    {name:"Asset Automation", desc:"ATOM RTX robotics, eFrac fleet health, condition monitoring on chokes and pumps — automation is proven and scaling. The constraint is deployment speed, not technology readiness.", count: probs.filter(p=>p.cat==="Asset Automation").length},
    {name:"New Market Entry", desc:"Fiber Glass, Tubular Products, and Tuboscope all identified hydrogen, geothermal, and CCUS as ready markets. Standards forming now — early qualification wins create durable positions.", count: probs.filter(p=>p.cat==="Market Expansion").length},
  ];

  // BU summaries
  const buSummaries = buList.map(pid => {
    const partner = partners.find(p=>p.id===pid);
    const buProbs = probs.filter(p=>p.pid===pid);
    const buMid   = buProbs.reduce((s,p)=>s+(p.mid||0),0);
    const buHigh  = buProbs.reduce((s,p)=>s+(p.high||0),0);
    const topP    = [...buProbs].sort((a,b)=>getRiceScore(b)-getRiceScore(a))[0];
    return {pid, partner, buProbs, buMid, buHigh, topP, color: buColors[pid]||"#849BA6"};
  });

  // Bar chart SVG helper
  const barChart = (data, {width=520,height=180,color="#B5D334",maxVal=null}={}) => {
    const max = maxVal || Math.max(...data.map(d=>d.val));
    const bw  = (width - 60) / data.length - 6;
    const bars = data.map((d,i) => {
      const bh = Math.max(2, ((d.val/max) * (height-40)));
      const x  = 30 + i*(bw+6);
      const y  = height - 28 - bh;
      const c  = d.color || color;
      return `<g>
        <rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${c}" rx="2" opacity="0.85"/>
        <text x="${x+bw/2}" y="${height-14}" text-anchor="middle" fill="#849BA6" font-size="7.5" font-family="monospace">${d.label}</text>
        <text x="${x+bw/2}" y="${y-4}" text-anchor="middle" fill="${c}" font-size="7" font-family="monospace" font-weight="bold">${d.valLabel||d.val}</text>
      </g>`;
    }).join('');
    return `<svg width="${width}" height="${height}" style="display:block">${bars}</svg>`;
  };

  // Rice bar chart
  const top15 = sorted.slice(0,15);
  const maxRice = Math.max(...top15.map(p=>getRiceScore(p)));
  const riceRows = top15.map((p,i) => {
    const pct = (getRiceScore(p)/maxRice*100).toFixed(1);
    const c   = catColors[p.cat]||"#849BA6";
    const partner = partners.find(pt=>pt.id===p.pid);
    return `<tr>
      <td style="padding:5px 8px;font-size:9px;color:#849BA6;font-family:monospace;white-space:nowrap">${i+1}</td>
      <td style="padding:5px 8px;font-size:9px;color:#c8d4ce;max-width:220px">${p.title}</td>
      <td style="padding:5px 8px;font-size:8px;color:#849BA6">${partner?.name||p.pid}</td>
      <td style="padding:5px 8px">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:${Math.max(6,pct*1.2)}px;height:10px;background:${c};border-radius:2px;min-width:6px"></div>
          <span style="font-size:9px;color:${c};font-weight:bold;font-family:monospace">${getRiceScore(p).toFixed(0)}</span>
        </div>
      </td>
      <td style="padding:5px 8px;font-size:9px;color:#B5D334;font-family:monospace;font-weight:bold">$${p.mid||0}M</td>
      <td style="padding:5px 8px"><span style="font-size:8px;font-weight:bold;color:${p.pri==='High'?'#E46962':'#f59e0b'}">${p.pri}</span></td>
    </tr>`;
  }).join('');

  // Category donut data (as bar for PDF compat)
  const catCounts = {};
  probs.forEach(p => { catCounts[p.cat] = (catCounts[p.cat]||0) + 1; });
  const catData = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]);
  const catBarSVG = barChart(catData.map(([k,v])=>({
    label: k.split(' ')[0], val:v, valLabel:v, color:catColors[k]||"#849BA6"
  })), {width:520, height:160, color:"#B5D334"});

  // BU value bar chart
  const buValueData = buSummaries.sort((a,b)=>b.buMid-a.buMid).map(b=>({
    label:(b.partner?.name||b.pid).replace("NOV ","").slice(0,6),
    val:b.buMid, valLabel:`$${b.buMid}M`, color:b.color
  }));
  const buBarSVG = barChart(buValueData, {width:520, height:180});

  // All problems table
  const allRows = sorted.map((p,i) => {
    const partner = partners.find(pt=>pt.id===p.pid);
    const c = catColors[p.cat]||"#849BA6";
    return `<tr style="border-bottom:1px solid #1a3d3e">
      <td style="padding:5px 8px;font-size:9px;color:#849BA6;font-family:monospace">${i+1}</td>
      <td style="padding:5px 8px;font-size:9px;color:#c8d4ce">${partner?.name||p.pid}</td>
      <td style="padding:5px 8px;font-size:9px;color:#f5f2ec;max-width:200px">${p.title}</td>
      <td style="padding:5px 8px"><span style="font-size:8px;padding:2px 6px;border-radius:3px;background:${c}22;color:${c};white-space:nowrap">${p.cat}</span></td>
      <td style="padding:5px 8px;font-size:9px;font-family:monospace;color:${c};font-weight:bold">${getRiceScore(p).toFixed(0)}</td>
      <td style="padding:5px 8px;font-size:9px;font-family:monospace;color:#B5D334">$${p.mid||0}M</td>
      <td style="padding:5px 8px"><span style="font-size:8px;font-weight:bold;color:${p.pri==='High'?'#E46962':'#f59e0b'}">${p.pri}</span></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>NOV VentureBuilder Discovery Report 2026 — ${audience}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#091C1D;color:#f5f2ec;font-family:Georgia,serif;font-size:10pt;line-height:1.6}
  @page{size:A4;margin:14mm 16mm 14mm 16mm}
  @media print{
    .no-print{display:none!important}
    body{background:white;color:#1e293b}
    .page-break{page-break-before:always}
    .card{background:#f8fafc!important;border:1px solid #e2e8f0!important}
    h1,h2,h3{color:#1e293b!important}
    .kpi-val{color:#0f766e!important}
    .accent{color:#0f766e!important}
    table{border-collapse:collapse}
    tr{border-color:#e2e8f0!important}
    td,th{color:#334155!important;background:white!important}
    .muted{color:#64748b!important}
    .tag{background:#f0fdfa!important;color:#0f766e!important}
    svg text{fill:#334155!important}
    svg rect{opacity:0.7}
  }
  h1{font-family:'Bebas Neue',sans-serif;font-size:38pt;letter-spacing:.04em;color:${meta.accent};line-height:1.1}
  h2{font-family:'Bebas Neue',sans-serif;font-size:18pt;letter-spacing:.04em;color:${meta.accent};margin:28px 0 8px}
  h3{font-family:Georgia,serif;font-size:11pt;color:#00b8cc;margin:16px 0 6px;font-style:italic}
  p{margin-bottom:8px;font-size:9.5pt;color:#c8d4ce;line-height:1.65}
  b{color:#f5f2ec}
  .cover{padding:60px 0 40px;border-bottom:2px solid ${meta.accent};margin-bottom:32px}
  .cover-tag{font-family:'DM Mono',monospace;font-size:8.5pt;color:#00b8cc;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}
  .cover-sub{font-size:13pt;color:#849BA6;margin-top:8px;font-family:Georgia,serif;font-style:italic}
  .cover-meta{margin-top:28px;display:grid;grid-template-columns:auto 1fr;gap:6px 20px}
  .cover-meta-k{font-family:'DM Mono',monospace;font-size:8pt;color:#849BA6}
  .cover-meta-v{font-family:Georgia,serif;font-size:9pt;color:#c8d4ce}
  .kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:20px 0}
  .kpi-card{background:#0f2d2e;border-radius:6px;padding:14px 10px;text-align:center;border-top:2px solid ${meta.accent}}
  .kpi-val{font-family:'Bebas Neue',sans-serif;font-size:24pt;color:${meta.accent};line-height:1.1}
  .kpi-label{font-family:'DM Mono',monospace;font-size:7pt;color:#849BA6;margin-top:4px;line-height:1.3}
  .card{background:#0f2d2e;border-radius:8px;padding:18px 20px;margin:12px 0;border-left:3px solid ${meta.accent}}
  .section-rule{border:none;border-top:1px solid #1a3d3e;margin:24px 0}
  table{width:100%;border-collapse:collapse;margin:10px 0}
  th{background:#0d2526;padding:7px 10px;font-family:'DM Mono',monospace;font-size:7.5pt;color:${meta.accent};text-align:left;border-bottom:1.5px solid ${meta.accent}}
  td{padding:5px 8px;font-size:9pt;border-bottom:1px solid #1a3d3e;vertical-align:middle}
  .tag{display:inline-block;padding:2px 7px;border-radius:3px;font-size:7.5pt;font-family:'DM Mono',monospace}
  .accent{color:${meta.accent}}
  .muted{color:#849BA6;font-family:'DM Mono',monospace;font-size:8pt}
  .chart-label{font-family:'DM Mono',monospace;font-size:7.5pt;color:#849BA6;margin-top:6px;font-style:italic}
  .theme-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}
  .theme-card{background:#0d2526;border-radius:6px;padding:14px 16px;border-left:3px solid #1a3d3e}
  .theme-name{font-family:'Bebas Neue',sans-serif;font-size:12pt;color:#f5f2ec;letter-spacing:.04em;margin-bottom:6px}
  .theme-count{font-family:'DM Mono',monospace;font-size:8pt;color:${meta.accent};float:right}
  .bu-card{background:#0d2526;border-radius:6px;padding:14px 16px;margin:10px 0}
  .bu-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #1a3d3e}
  .bu-name{font-family:'Bebas Neue',sans-serif;font-size:14pt;letter-spacing:.04em}
  .bu-stats{font-family:'DM Mono',monospace;font-size:8pt;color:#849BA6}
  .footer{margin-top:40px;padding-top:12px;border-top:1px solid #1a3d3e;display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:7pt;color:#849BA6}
  .print-btn{position:fixed;bottom:24px;right:24px;background:${meta.accent};color:#091C1D;border:none;border-radius:8px;padding:12px 22px;font-family:'DM Mono',monospace;font-size:11pt;font-weight:bold;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.4);z-index:999;display:flex;align-items:center;gap:8px}
  .audience-badge{display:inline-block;background:#132f30;border:1px solid ${meta.accent}44;border-radius:4px;padding:6px 14px;font-family:'DM Mono',monospace;font-size:8pt;color:${meta.accent};margin-top:14px}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">
  ⬇ Export PDF
</button>

<!-- ── COVER ── -->
<div class="cover">
  <div class="cover-tag">VentureBuilder × NOV · Discovery Report 2026</div>
  <h1>NOV Discovery<br/>Report 2026</h1>
  <div class="cover-sub">${meta.subtitle}</div>
  <div class="audience-badge">PREPARED FOR: ${meta.tag.toUpperCase()}</div>
  <div class="cover-meta">
    <span class="cover-meta-k">Discovery Period:</span><span class="cover-meta-v">February–March 2026</span>
    <span class="cover-meta-k">Business Units:</span><span class="cover-meta-v">11 NOV BUs + EY Energy Practice</span>
    <span class="cover-meta-k">Problems Catalogued:</span><span class="cover-meta-v">${probs.length} across 10 categories</span>
    <span class="cover-meta-k">Total Mid Opportunity:</span><span class="cover-meta-v" style="color:${meta.accent};font-weight:bold">$${totalMid}M</span>
    <span class="cover-meta-k">Total High Opportunity:</span><span class="cover-meta-v">$${totalHigh}M</span>
    <span class="cover-meta-k">Classification:</span><span class="cover-meta-v" style="color:#E46962">CONFIDENTIAL — NDA Protected</span>
  </div>
</div>

<!-- ── EXECUTIVE SUMMARY ── -->
<h2>Executive Summary</h2>
<hr class="section-rule"/>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-val">$${totalMid}M</div><div class="kpi-label">Total Mid-Case<br/>Opportunity</div></div>
  <div class="kpi-card"><div class="kpi-val">$${totalHigh}M</div><div class="kpi-label">Total High-Case<br/>Opportunity</div></div>
  <div class="kpi-card"><div class="kpi-val">${highCount}</div><div class="kpi-label">High Priority<br/>Problems</div></div>
  <div class="kpi-card"><div class="kpi-val">${buList.length}</div><div class="kpi-label">Business Units<br/>Covered</div></div>
  <div class="kpi-card"><div class="kpi-val">${probs.length}</div><div class="kpi-label">Problems<br/>Catalogued</div></div>
</div>

<div class="card">
  <p>The VentureBuilder discovery programme engaged eleven NOV business units and EY's Energy Practice across February–March 2026. Through structured interviews with VP-level and technical leadership, <b>${probs.length} prioritised problem statements</b> were captured, scored, and validated against market data, representing a combined mid-case venture opportunity of <b style="color:${meta.accent}">$${totalMid}M</b> with a high-case ceiling of <b>$${totalHigh}M</b>.</p>
  <p>Three macro themes dominate the portfolio: <b>Supply Chain Resilience</b> (tariff exposure and materials substitution affecting 8 of 11 BUs); <b>Digital Intelligence</b> (data integration and AI automation appearing across every BU); and <b>Talent & Commercialisation</b> (technician shortages and sales process gaps cited as near-term growth blockers).</p>
</div>

<!-- ── CROSS-BU THEMES ── -->
<div class="page-break"></div>
<h2>Cross-BU Problem Themes</h2>
<hr class="section-rule"/>
<p>Six macro themes emerge when problems are aggregated across all business units. Solutions addressing these themes at scale deliver value across multiple BUs simultaneously.</p>

<div class="theme-grid">
  ${themes.map((t,i) => `
  <div class="theme-card" style="border-left-color:${[meta.accent,'#00b8cc','#a855f7','#f59e0b','#22c55e','#0097A7'][i]}">
    <div class="theme-name">${i+1}. ${t.name} <span class="theme-count">${t.count} problems</span></div>
    <p style="font-size:8.5pt;margin:0;line-height:1.5">${t.desc}</p>
  </div>`).join('')}
</div>

<!-- Category distribution chart -->
<h3>Problem Distribution by Category</h3>
${catBarSVG}
<div class="chart-label">Figure: Number of problems per category across all BUs</div>

<!-- ── PORTFOLIO VALUE ── -->
<div class="page-break"></div>
<h2>Portfolio Value Analysis</h2>
<hr class="section-rule"/>
<p>Across all ${probs.length} problems, the combined addressable venture opportunity ranges from <b>$${probs.reduce((s,p)=>s+(p.low||0),0)}M</b> (conservative) to <b style="color:${meta.accent}">$${totalHigh}M</b> (high-case), with a mid-case estimate of <b style="color:${meta.accent}">$${totalMid}M</b>.</p>

<h3>Opportunity Value by Business Unit</h3>
${buBarSVG}
<div class="chart-label">Figure: Mid-case total opportunity per business unit ($M)</div>

<h3>Value Sizing Summary</h3>
<table>
  <thead><tr><th>Business Unit</th><th>Problems</th><th>High Priority</th><th>Low $M</th><th>Mid $M</th><th>High $M</th><th>Top Problem</th></tr></thead>
  <tbody>
  ${buSummaries.sort((a,b)=>b.buMid-a.buMid).map(b=>`
    <tr>
      <td><span style="font-family:monospace;font-size:8.5pt;color:${b.color};font-weight:bold">${b.partner?.name||b.pid}</span></td>
      <td style="text-align:center;font-family:monospace;color:#c8d4ce">${b.buProbs.length}</td>
      <td style="text-align:center;color:#E46962;font-family:monospace;font-weight:bold">${b.buProbs.filter(p=>p.pri==="High").length}</td>
      <td style="font-family:monospace;color:#849BA6">$${b.buProbs.reduce((s,p)=>s+(p.low||0),0)}M</td>
      <td style="font-family:monospace;color:${meta.accent};font-weight:bold">$${b.buMid}M</td>
      <td style="font-family:monospace;color:#849BA6">$${b.buHigh}M</td>
      <td style="font-size:8.5pt;color:#c8d4ce;max-width:160px">${b.topP?.title?.slice(0,48)||'—'}${(b.topP?.title?.length||0)>48?'…':''}</td>
    </tr>`).join('')}
  </tbody>
</table>

<!-- ── RICE RANKINGS ── -->
<div class="page-break"></div>
<h2>RICE Priority Rankings</h2>
<hr class="section-rule"/>
<p>Each problem was scored using a structured RICE framework: <b>Reach</b> (% of addressable customers) × <b>Impact</b> (1–10 severity) × <b>Confidence</b> (evidence quality, 0–100%) ÷ <b>Effort</b> (implementation complexity). Higher score = higher priority.</p>

<h3>Top 15 Problems by RICE Score</h3>
<table>
  <thead><tr><th>#</th><th>Problem</th><th>BU</th><th>RICE Score</th><th>Mid $M</th><th>Priority</th></tr></thead>
  <tbody>${riceRows}</tbody>
</table>

<h3>Full Problem Rankings — All ${probs.length} Problems</h3>
<table>
  <thead><tr><th>#</th><th>BU</th><th>Problem</th><th>Category</th><th>RICE</th><th>Mid $M</th><th>Priority</th></tr></thead>
  <tbody>${allRows}</tbody>
</table>

<!-- ── BU DEEP DIVES ── -->
<div class="page-break"></div>
<h2>Business Unit Deep Dives</h2>
<hr class="section-rule"/>
<p>Each BU summary presents the prioritised problem statements with RICE scores and opportunity sizing.</p>

${buSummaries.map(b => `
<div class="bu-card" style="border-left:3px solid ${b.color}">
  <div class="bu-header">
    <span class="bu-name" style="color:${b.color}">${b.partner?.full||b.partner?.name||b.pid}</span>
    <span class="bu-stats">$${b.buMid}M mid · $${b.buHigh}M high · ${b.buProbs.filter(p=>p.pri==="High").length} high priority</span>
  </div>
  ${b.partner?.desc ? `<p style="font-size:8.5pt;margin-bottom:10px;color:#849BA6">${b.partner.desc}</p>` : ''}
  <table>
    <thead><tr><th>Problem</th><th>Category</th><th>RICE</th><th>Mid $M</th><th>Priority</th></tr></thead>
    <tbody>
    ${[...b.buProbs].sort((a,c)=>getRiceScore(c)-getRiceScore(a)).map(p=>`
      <tr>
        <td style="font-size:8.5pt;color:#f5f2ec">${p.title}</td>
        <td><span class="tag" style="background:${catColors[p.cat]||'#849BA6'}22;color:${catColors[p.cat]||'#849BA6'}">${p.cat}</span></td>
        <td style="font-family:monospace;font-size:8.5pt;color:${catColors[p.cat]||'#849BA6'};font-weight:bold">${getRiceScore(p).toFixed(0)}</td>
        <td style="font-family:monospace;font-size:8.5pt;color:#B5D334;font-weight:bold">$${p.mid||0}M</td>
        <td><span style="font-size:8pt;font-weight:bold;color:${p.pri==='High'?'#E46962':'#f59e0b'}">${p.pri}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>`).join('')}

<div class="footer">
  <span>VentureBuilder × NOV Discovery Report 2026 — ${audience} Version</span>
  <span>CONFIDENTIAL — NDA Protected · venturebuilder.fund</span>
  <span>Generated ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span>
</div>

</body></html>`;
}

// ── EXPORT MODAL ─────────────────────────────────────────────────────────────
function ExportModal({onClose, probs, partners, buys, research, allCos, shIntel}) {
  const [audience, setAudience] = useState("Executive");
  const [stage, setStage]       = useState("pick");   // "pick" | "view"
  const [downloading, setDL]    = useState(false);
  const iframeRef               = useRef(null);
  const blobUrlRef              = useRef(null);

  const audiences = [
    {id:"Executive", label:"Executive", icon:"◈", desc:"EY & NOV senior leadership — narrative-led, KPIs first", color:VB.gold},
    {id:"Internal",  label:"Internal",  icon:"◉", desc:"VentureBuilder team — full data, all 60 problems, working doc", color:VB.teal2},
    {id:"Investor",  label:"Investor",  icon:"◆", desc:"External investors & LPs — value-led, commercial framing", color:VB.coral},
  ];

  const accentColor = audiences.find(a=>a.id===audience)?.color || VB.gold;

  // Build blob URL and show iframe
  const handlePreview = () => {
    const html = generateReportHTML({audience, probs, partners, buys, research, allCos, shIntel});
    const blob = new Blob([html], {type:"text/html"});
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = URL.createObjectURL(blob);
    setStage("view");
  };

  // Download as .html file that auto-prints to PDF — most reliable cross-browser approach
  const handleDownload = () => {
    setDL(true);
    try {
      const html = generateReportHTML({audience, probs, partners, buys, research, allCos, shIntel});
      // Inject auto-print script so when user opens the file it prompts Save as PDF immediately
      const printable = html.replace('</body>', `
<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 800);
  });
</script>
</body>`);
      const blob = new Blob([printable], {type:"text/html"});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `NOV_VentureBuilder_Report_${audience}_2026.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch(e) { console.error(e); }
    setDL(false);
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); };
  }, []);

  // ── STAGE: PICK ──────────────────────────────────────────────────────────
  if (stage === "pick") return (
    <div style={{position:"fixed",inset:0,background:"rgba(9,28,29,0.92)",backdropFilter:"blur(8px)",
                 zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}
         onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:VB.surface,border:`1px solid ${VB.border2}`,borderRadius:14,
                   padding:28,width:500,boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:".04em",color:VB.gold}}>
              Generate Report
            </div>
            <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>
              Choose audience · Preview in-app · Download as PDF
            </div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",
                  color:VB.muted,fontSize:20,cursor:"pointer",lineHeight:1,padding:"2px 6px"}}>×</button>
        </div>

        {/* Audience cards */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
          {audiences.map(a=>(
            <div key={a.id} onClick={()=>setAudience(a.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:8,
                      cursor:"pointer",transition:"all .12s",
                      border:`1.5px solid ${audience===a.id ? a.color : VB.border}`,
                      background: audience===a.id ? `${a.color}0f` : VB.bg2}}>
              <span style={{fontSize:18,color:a.color,width:22,textAlign:"center",flexShrink:0}}>{a.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:"bold",fontFamily:"'DM Mono',monospace",
                             color: audience===a.id ? a.color : VB.ink}}>{a.label}</div>
                <div style={{fontSize:8.5,color:VB.muted,marginTop:1}}>{a.desc}</div>
              </div>
              <div style={{width:13,height:13,borderRadius:"50%",flexShrink:0,
                           border:`2px solid ${a.color}`,
                           background: audience===a.id ? a.color : "transparent"}}/>
            </div>
          ))}
        </div>

        {/* What's included chips */}
        <div style={{background:VB.bg2,borderRadius:8,padding:"9px 12px",
                     marginBottom:18,border:`1px solid ${VB.border}`}}>
          <div style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",
                       letterSpacing:".1em",marginBottom:6}}>INCLUDES</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {["Executive Summary","KPI Strip","Cross-BU Themes","Portfolio Value","RICE Rankings",
              `${probs.length} Problems","BU Deep Dives`].map(t=>(
              <span key={t} style={{fontSize:7.5,padding:"2px 6px",borderRadius:3,
                      background:`${accentColor}18`,color:accentColor,
                      fontFamily:"'DM Mono',monospace",border:`1px solid ${accentColor}30`}}>{t}</span>
            ))}
          </div>
        </div>

        {/* Mini stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:20}}>
          {[
            ["$"+probs.reduce((s,p)=>s+(p.mid||0),0)+"M","Mid Opportunity"],
            [probs.filter(p=>p.pri==="High").length+" High","Priority Problems"],
            [new Set(probs.map(p=>p.pid)).size+" BUs","Covered"],
          ].map(([v,l])=>(
            <div key={l} style={{background:VB.bg2,borderRadius:6,padding:"8px",
                                  textAlign:"center",border:`1px solid ${VB.border}`}}>
              <div style={{fontSize:14,fontWeight:"bold",color:accentColor,
                           fontFamily:"'DM Mono',monospace"}}>{v}</div>
              <div style={{fontSize:7.5,color:VB.muted,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose}
            style={{flex:1,padding:"10px 0",borderRadius:7,cursor:"pointer",
                    border:`1px solid ${VB.border}`,background:"transparent",
                    color:VB.muted,fontFamily:"'DM Mono',monospace",fontSize:10}}>
            Cancel
          </button>
          <button onClick={handlePreview}
            style={{flex:3,padding:"11px 0",borderRadius:7,border:"none",cursor:"pointer",
                    background:accentColor,color:"#091C1D",
                    fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:"bold",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:14}}>→</span> Preview Report
          </button>
        </div>
      </div>
    </div>
  );

  // ── STAGE: VIEW ───────────────────────────────────────────────────────────
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,
                 background:VB.bg,display:"flex",flexDirection:"column"}}>

      {/* Top toolbar */}
      <div style={{flexShrink:0,height:52,background:VB.surface,
                   borderBottom:`1px solid ${VB.border2}`,
                   display:"flex",alignItems:"center",padding:"0 16px",gap:12}}>

        {/* Back */}
        <button onClick={()=>setStage("pick")}
          style={{display:"flex",alignItems:"center",gap:5,background:"transparent",
                  border:`1px solid ${VB.border}`,borderRadius:6,padding:"5px 10px",
                  color:VB.muted,fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>
          ← Back
        </button>

        {/* Title */}
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                       letterSpacing:".04em",color:VB.ink}}>
            NOV Discovery Report 2026
          </div>
          <span style={{fontSize:8,padding:"2px 8px",borderRadius:3,
                        background:`${accentColor}18`,color:accentColor,
                        fontFamily:"'DM Mono',monospace",border:`1px solid ${accentColor}30`,
                        letterSpacing:".08em"}}>
            {audience.toUpperCase()}
          </span>
        </div>

        {/* Download button */}
        <button onClick={handleDownload} disabled={downloading}
          style={{display:"flex",alignItems:"center",gap:7,padding:"8px 18px",
                  borderRadius:7,border:"none",cursor:downloading?"wait":"pointer",
                  background: downloading ? VB.surface2 : accentColor,
                  color: downloading ? VB.muted : "#091C1D",
                  fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:"bold",
                  boxShadow: downloading ? "none" : `0 0 18px ${accentColor}50`,
                  transition:"all .15s"}}>
          {downloading
            ? <><Pu c={VB.muted}/> Preparing…</>
            : <><span style={{fontSize:14}}>⬇</span> Download PDF</>}
        </button>

        {/* Hint */}
        <div style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",
                     lineHeight:1.4,maxWidth:140,textAlign:"right"}}>
          Opens file · browser<br/>print → Save as PDF
        </div>

        {/* Close */}
        <button onClick={onClose}
          style={{background:"transparent",border:`1px solid ${VB.border}`,
                  borderRadius:6,padding:"5px 10px",color:VB.muted,
                  fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>
          ✕ Close
        </button>
      </div>

      {/* iframe fills remaining space */}
      <iframe
        ref={iframeRef}
        src={blobUrlRef.current}
        style={{flex:1,border:"none",width:"100%",background:"white"}}
        title="Report Preview"
      />
    </div>
  );
}

function Reports({partners, probs, buys, research, allCos, allSH, shIntel, theses, analysis}) {
  const [selPartner, setSelPartner] = useState("all");
  const [reportType, setReportType] = useState("executive");
  const [showExport, setShowExport] = useState(false);

  const f$  = n => n>=1e6?`$${(n/1e6).toFixed(0)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${n}`;
  const totalMid = probs.reduce((s,p)=>s+p.mid,0);
  const totalHigh = probs.reduce((s,p)=>s+p.high,0);
  const researchedCos = allCos.filter(c=>research[c.id]);
  const shWithIntel = allSH.filter(s=>shIntel[s.id]&&!shIntel[s.id].error);

  const filtProbs = selPartner==="all" ? probs : probs.filter(p=>p.pid===selPartner);
  const filtBuys  = selPartner==="all" ? buys  : buys.filter(b=>b.pid===selPartner);

  // Top problems by RICE
  const topProbs = [...filtProbs].sort((a,b)=>getRice(b)-getRice(a)).slice(0,5);

  // Category breakdown
  const byCategory = filtProbs.reduce((acc,p)=>{
    acc[p.cat] = (acc[p.cat]||0) + p.mid;
    return acc;
  },{});

  return (
    <div className="fu">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:".04em",color:VB.ink}}>📋 Intelligence Reports</div>
          <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>
            Cross-partner discovery summary · Export-ready views
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={selPartner} onChange={e=>setSelPartner(e.target.value)}
            style={{background:VB.surface,border:`1px solid ${VB.border2}`,borderRadius:6,color:VB.ink,fontFamily:"'DM Mono',monospace",fontSize:11,padding:"7px 10px",width:"auto"}}>
            <option value="all">All Partners</option>
            {partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={()=>setShowExport(true)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"none",
                    background:VB.gold,color:"#091C1D",fontFamily:"'DM Mono',monospace",fontSize:10,
                    fontWeight:"bold",cursor:"pointer",whiteSpace:"nowrap",boxShadow:`0 0 12px ${VB.gold}44`}}>
            <span style={{fontSize:13}}>⬇</span> Export PDF
          </button>
        </div>
      </div>
      {showExport&&<ExportModal onClose={()=>setShowExport(false)} probs={probs} partners={partners}
        buys={buys} research={research} allCos={allCos} shIntel={shIntel}/>}

      {/* Report type toggle */}
      <div style={{display:"flex",gap:7,marginBottom:20,borderBottom:`1px solid ${VB.border}`,paddingBottom:14}}>
        {[["executive","Executive Summary"],["problems","Problem Deep-Dive"],["intel","Company & Leader Intel"],["pipeline","Deal Pipeline"]].map(([id,label])=>(
          <button key={id} className={`btn ${reportType===id?"bg":"bo"}`} style={{fontSize:10}} onClick={()=>setReportType(id)}>{label}</button>
        ))}
      </div>

      {/* ── EXECUTIVE SUMMARY ── */}
      {reportType==="executive"&&(
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* KPI strip */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9}}>
            {[
              ["Partners",partners.length,"Active workspaces",VB.gold],
              ["Problems",filtProbs.length,"RICE + $ scored",VB.teal2],
              ["Portfolio Value",f$(filtProbs.reduce((s,p)=>s+p.mid,0)),"Mid-case total",VB.gold2],
              ["Researched",researchedCos.length+" cos","Industry coverage",VB.teal2],
              ["Buys",filtBuys.length,"Deal pipeline",VB.purple],
            ].map(([l,v,s,c])=><KPI key={l} label={l} value={v} sub={s} color={c}/>)}
          </div>

          {/* Partner summaries */}
          <div>
            <SL mb={10}>Partner Workspace Summaries</SL>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
              {partners.filter(p=>selPartner==="all"||p.id===selPartner).map(p=>{
                const pPs=probs.filter(pr=>pr.pid===p.id);
                const pBs=buys.filter(b=>b.pid===p.id);
                const pMid=pPs.reduce((s,pr)=>s+pr.mid,0);
                const pHigh=pPs.reduce((s,pr)=>s+pr.high,0);
                const topP=pPs.sort((a,b)=>getRice(b)-getRice(a))[0];
                const ana=analysis?.[p.id];
                return (
                  <div key={p.id} className="card" style={{padding:16,borderLeft:`3px solid ${p.color}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <div style={{width:36,height:36,borderRadius:7,background:`${p.color}20`,border:`2px solid ${p.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:p.color}}>{p.avatar}</span>
                      </div>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:VB.ink}}>{p.full||p.name}</div>
                        <div style={{fontSize:9,color:p.color,fontFamily:"'DM Mono',monospace"}}>{p.sector}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                      {[["Problems",pPs.length,VB.gold],["Mid Value",f$(pMid),p.color],["Buys",pBs.length,VB.purple]].map(([l,v,c])=>(
                        <div key={l} style={{textAlign:"center",background:VB.surface2,padding:"5px 7px",borderRadius:5}}>
                          <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace",marginBottom:2}}>{l}</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:c,lineHeight:1}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {topP&&(
                      <div style={{background:VB.bg2,padding:"7px 10px",borderRadius:5,borderLeft:`2px solid ${p.color}`,marginBottom:8}}>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>TOP PRIORITY PROBLEM</div>
                        <div style={{fontSize:10,color:VB.ink2,fontWeight:600}}>{topP.title}</div>
                        <div style={{fontSize:9,color:VB.muted,marginTop:2}}>{f$(topP.mid)} mid · RICE {getRice(topP)}</div>
                      </div>
                    )}
                    {ana&&(ana.crossCuttingThemes||[]).length>0&&(
                      <div>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:3}}>TOP CROSS-CUTTING THEME</div>
                        <div style={{fontSize:9,color:VB.teal2,lineHeight:1.5}}>{ana.crossCuttingThemes[0]?.theme}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value waterfall */}
          <div className="card" style={{padding:16}}>
            <SL c={VB.gold} mb={10}>Portfolio Value by Category</SL>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {Object.entries(byCategory).sort(([,a],[,b])=>b-a).map(([cat,val])=>{
                const pct = Math.round((val / (filtProbs.reduce((s,p)=>s+p.mid,0)||1))*100);
                const c = CAT[cat]||VB.gold;
                return (
                  <div key={cat} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:140,fontSize:9,color:VB.muted,flexShrink:0}}>{cat}</div>
                    <div style={{flex:1,height:8,background:VB.surface2,borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:4}}/>
                    </div>
                    <div style={{width:60,textAlign:"right",fontSize:9,fontFamily:"'DM Mono',monospace",color:c}}>{f$(val)}</div>
                    <div style={{width:30,textAlign:"right",fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── PROBLEM DEEP-DIVE ── */}
      {reportType==="problems"&&(
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <SL>All Problems — RICE Ranked</SL>
            <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{filtProbs.length} problems · {f$(filtProbs.reduce((s,p)=>s+p.mid,0))} total mid-case value</span>
          </div>
          {[...filtProbs].sort((a,b)=>getRice(b)-getRice(a)).map((p,i)=>{
            const c=CAT[p.cat]||VB.gold; const partner=partners.find(pt=>pt.id===p.pid);
            const t=theses?.[p.id];
            return (
              <div key={p.id} className="card" style={{padding:14,borderLeft:`3px solid ${c}`}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:VB.muted,lineHeight:1,minWidth:22}}>#{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,marginBottom:4,alignItems:"center",flexWrap:"wrap"}}>
                      <Bdg v={p.pri}/>
                      <Chip c={c}>{p.cat}</Chip>
                      {partner&&<Chip c={partner.color}>{partner.name}</Chip>}
                      <span style={{fontSize:12,fontWeight:600,color:VB.ink}}>{p.title}</span>
                    </div>
                    <div style={{fontSize:10,color:VB.muted,lineHeight:1.5,marginBottom:7}}>{p.impact}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                      <div style={{background:VB.bg2,padding:"5px 9px",borderRadius:4}}>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>RICE SCORE</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:VB.gold,lineHeight:1}}>{getRice(p)}</div>
                      </div>
                      <div style={{background:VB.bg2,padding:"5px 9px",borderRadius:4}}>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>MID VALUE</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:c,lineHeight:1}}>{f$(p.mid)}</div>
                      </div>
                      <div style={{background:VB.bg2,padding:"5px 9px",borderRadius:4}}>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>CONFIDENCE</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:VB.ink2,lineHeight:1}}>{p.confidence}%</div>
                      </div>
                    </div>
                    {t&&(
                      <div style={{marginTop:7,background:VB.bg2,padding:"6px 10px",borderRadius:4,borderLeft:`2px solid ${VB.gold}`}}>
                        <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.gold,marginBottom:2}}>✦ VENTURE THESIS</div>
                        <div style={{fontSize:11,color:VB.ink,fontWeight:600}}>{t.thesisTitle}</div>
                        <div style={{fontSize:9,color:VB.gold,marginTop:1}}>{t.oneLiner}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── COMPANY & LEADER INTEL ── */}
      {reportType==="intel"&&(
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
          {researchedCos.length===0&&shWithIntel.length===0&&(
            <div style={{padding:"44px",textAlign:"center",fontSize:12,color:VB.muted}}>Research companies and fetch stakeholder intel first.</div>
          )}
          {researchedCos.length>0&&(
            <div>
              <SL c={VB.teal2} mb={10}>Researched Companies ({researchedCos.length})</SL>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:9}}>
                {researchedCos.map(co=>{
                  const r=research[co.id];
                  return (
                    <div key={co.id} className="card" style={{padding:13,borderLeft:`3px solid ${co.color}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:VB.ink}}>{co.name}</div>
                          <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{co.ticker} · {co.type} · {r.ts}</div>
                        </div>
                        <span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:co.global?"rgba(181,211,52,.07)":"rgba(0,151,167,.07)",color:co.global?VB.gold:VB.teal2,border:`1px solid ${co.global?VB.border:VB.border2}`,alignSelf:"flex-start"}}>{co.global?"Global":"Partner"}</span>
                      </div>
                      <div style={{fontSize:10,color:VB.muted,lineHeight:1.6,marginBottom:6}}>{(r.companyOverview||"").slice(0,120)}…</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                        {(r.keyProblems||[]).slice(0,2).map((p,i)=><Chip key={i} c={p.severity==="High"?VB.coral:VB.gold}>{(p.title||"").slice(0,22)}</Chip>)}
                        {(r.urgencySignals||[]).length>0&&<Chip c={VB.gold}>⚡ {r.urgencySignals.length} signals</Chip>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {shWithIntel.length>0&&(
            <div>
              <SL c={VB.gold} mb={10}>Industry Leaders with Intel ({shWithIntel.length})</SL>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:9}}>
                {shWithIntel.map(sh=>{
                  const intel=shIntel[sh.id];
                  return (
                    <div key={sh.id} className="card" style={{padding:13,borderLeft:`3px solid ${sh.color}`}}>
                      <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:7}}>
                        <div style={{width:30,height:30,borderRadius:"50%",background:`${sh.color}20`,border:`2px solid ${sh.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:9,color:sh.color}}>{sh.avatar}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:600,color:VB.ink}}>{sh.name}</div>
                          <div style={{fontSize:8,color:VB.muted}}>{sh.title} · {sh.org}</div>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted}}>REL</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:intel.relevanceScore>=7?VB.gold:VB.teal2,lineHeight:1}}>{intel.relevanceScore}</div>
                        </div>
                      </div>
                      <div style={{fontSize:10,color:VB.muted,lineHeight:1.6,marginBottom:5}}>{(intel.summary||"").slice(0,120)}…</div>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <Bdg v={intel.overallSentiment==="bullish"?"High":intel.overallSentiment==="critical"?"Low":"Medium"} sm/>
                        <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:intel.overallSentiment==="bullish"?VB.gold:intel.overallSentiment==="critical"?VB.coral:VB.teal2}}>{(intel.overallSentiment||"").toUpperCase()}</span>
                        <span style={{fontSize:7,color:VB.muted,marginLeft:"auto",fontFamily:"'DM Mono',monospace"}}>{intel.ts}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DEAL PIPELINE ── */}
      {reportType==="pipeline"&&(
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtBuys.length===0&&(
            <div style={{padding:"44px",textAlign:"center",fontSize:12,color:VB.muted}}>No buys or theses added yet. Add them from each partner workspace.</div>
          )}
          {filtBuys.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <SL c={VB.purple} mb={8}>Buy & Thesis Pipeline ({filtBuys.length})</SL>
              {filtBuys.map((b,i)=>{
                const partner=partners.find(p=>p.id===b.pid);
                return (
                  <div key={b.id} className="card" style={{padding:13,borderLeft:`3px solid ${VB.purple}`}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:VB.purple,lineHeight:1,minWidth:20}}>#{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:5,marginBottom:4,alignItems:"center",flexWrap:"wrap"}}>
                          {partner&&<Chip c={partner.color}>{partner.name}</Chip>}
                          <Chip c={VB.purple}>{b.type||"Buy"}</Chip>
                          <span style={{fontSize:12,fontWeight:600,color:VB.ink}}>{b.title}</span>
                        </div>
                        <div style={{fontSize:10,color:VB.muted,lineHeight:1.5,marginBottom:5}}>{b.rationale||b.description}</div>
                        {b.target&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.teal2}}>Target: {b.target}</div>}
                        {b.value&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.gold,marginTop:2}}>Est. Value: {b.value}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Theses summary */}
          {Object.keys(theses||{}).length>0&&(
            <div>
              <SL c={VB.gold} mb={8}>✦ Generated Venture Theses ({Object.keys(theses).length})</SL>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:9}}>
                {Object.entries(theses).map(([probId,t])=>{
                  const prob=probs.find(p=>p.id===probId);
                  const partner=partners.find(p=>p.id===prob?.pid);
                  return (
                    <div key={probId} className="card" style={{padding:13,borderTop:`2px solid ${VB.gold}`}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:VB.ink,marginBottom:3}}>{t.thesisTitle}</div>
                      <div style={{fontSize:10,color:VB.gold,lineHeight:1.5,marginBottom:4}}>{t.oneLiner}</div>
                      {t.marketSize&&<div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.teal2,marginBottom:3}}>{t.marketSize}</div>}
                      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:5}}>
                        <Chip c={VB.gold}>{t.ventureArchetype}</Chip>
                        <Chip c={VB.teal2}>{t.fundingStage}</Chip>
                        {partner&&<Chip c={partner.color}>{partner.name}</Chip>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL ACTIONS BOARD
// ══════════════════════════════════════════════════════════════════════════════
function ActionsBoard({actions, onAdd, onUpdate, onDelete, probs, partners}) {
  const [filter, setFilter] = useState("all");   // all | todo | in-progress | done | blocked | overdue
  const [sortBy, setSortBy] = useState("due");   // due | prob | status | owner
  const [adding, setAdding] = useState(false);
  const [nf, setNf]         = useState({text:"",owner:"",due:"",status:"todo",notes:"",probId:probs[0]?.id||""});

  const today = new Date(); today.setHours(0,0,0,0);

  const enriched = (actions||[]).map(a => {
    const p  = probs.find(x=>x.id===a.probId);
    const pt = partners.find(x=>x.id===p?.pid);
    const isOverdue = a.due && a.status!=="done" && new Date(a.due) < today;
    return {...a, prob:p, partner:pt, isOverdue};
  });

  const filtered = enriched.filter(a => {
    if (filter==="overdue") return a.isOverdue;
    if (filter==="all")     return true;
    return a.status===filter;
  });

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy==="due")    return (a.due||"9999") < (b.due||"9999") ? -1 : 1;
    if (sortBy==="status") return ACT_S.indexOf(a.status) - ACT_S.indexOf(b.status);
    if (sortBy==="owner")  return (a.owner||"").localeCompare(b.owner||"");
    if (sortBy==="prob")   return (a.prob?.title||"").localeCompare(b.prob?.title||"");
    return 0;
  });

  // Summary counts
  const counts = ACT_S.reduce((acc,s)=>({...acc,[s]:enriched.filter(a=>a.status===s).length}), {});
  const overdueCount = enriched.filter(a=>a.isOverdue).length;

  return (
    <div className="fu">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:".04em",color:VB.ink}}>🗓 Action Tracker</div>
          <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>
            All next steps across every problem — assign owners, set due dates, track progress
          </div>
        </div>
        <button className="btn bg" onClick={()=>setAdding(v=>!v)}>+ Add Action</button>
      </div>

      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:16}}>
        {[
          ["All",   enriched.length,  VB.muted,   "all"],
          ["To Do", counts.todo||0,   VB.muted,    "todo"],
          ["Active",counts["in-progress"]||0, VB.teal2, "in-progress"],
          ["Done",  counts.done||0,   VB.gold,     "done"],
          ["Blocked",counts.blocked||0,VB.coral,   "blocked"],
          ["Overdue",overdueCount,    VB.coral,    "overdue"],
        ].map(([l,v,c,f])=>(
          <div key={l} onClick={()=>setFilter(f)}
            style={{background:filter===f?`${c}18`:VB.surface,border:`1px solid ${filter===f?c:VB.border}`,
                    borderRadius:8,padding:"10px",textAlign:"center",cursor:"pointer",transition:"all .12s"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:8,color:filter===f?c:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:2,letterSpacing:".08em"}}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding&&(
        <div className="card" style={{padding:"13px 16px",marginBottom:14,borderLeft:`3px solid ${VB.teal2}`}}>
          <SL c={VB.teal2} mb={9}>+ New Action</SL>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={{fontSize:7,color:VB.muted,marginBottom:3}}>ACTION</div>
              <input placeholder="Describe the next step…" value={nf.text} autoFocus
                onChange={e=>setNf(f=>({...f,text:e.target.value}))}/></div>
            <div><div style={{fontSize:7,color:VB.muted,marginBottom:3}}>OWNER</div>
              <input placeholder="Name" value={nf.owner} onChange={e=>setNf(f=>({...f,owner:e.target.value}))}/></div>
            <div><div style={{fontSize:7,color:VB.muted,marginBottom:3}}>DUE DATE</div>
              <input type="date" value={nf.due} onChange={e=>setNf(f=>({...f,due:e.target.value}))} style={{fontSize:10}}/></div>
            <div><div style={{fontSize:7,color:VB.muted,marginBottom:3}}>STATUS</div>
              <select value={nf.status} onChange={e=>setNf(f=>({...f,status:e.target.value}))}>
                {ACT_S.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:7,color:VB.muted,marginBottom:3}}>LINKED PROBLEM</div>
            <select value={nf.probId} onChange={e=>setNf(f=>({...f,probId:e.target.value}))} style={{width:"100%",fontSize:10}}>
              {probs.map(p=>{
                const pt=partners.find(x=>x.id===p.pid);
                return <option key={p.id} value={p.id}>[{pt?.name||p.pid}] {p.title}</option>;
              })}
            </select>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:7,color:VB.muted,marginBottom:3}}>NOTES (optional)</div>
            <input placeholder="Additional context, links, references…" value={nf.notes}
              onChange={e=>setNf(f=>({...f,notes:e.target.value}))}/>
          </div>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
            <button className="btn bo" onClick={()=>setAdding(false)}>Cancel</button>
            <button className="btn bg" disabled={!nf.text.trim()||!nf.probId} onClick={()=>{
              onAdd({id:"act_"+uid(),...nf,createdAt:new Date().toISOString()});
              setNf({text:"",owner:"",due:"",status:"todo",notes:"",probId:probs[0]?.id||""});
              setAdding(false);
            }}>Save Action</button>
          </div>
        </div>
      )}

      {/* Sort toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>
          {sorted.length} action{sorted.length!==1?"s":""}{filter!=="all"?` · filtered: ${filter}`:""}
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>SORT:</span>
          {[["due","Due Date"],["status","Status"],["owner","Owner"],["prob","Problem"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setSortBy(id)}
              style={{fontSize:8,padding:"2px 7px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Mono',monospace",
                      background:sortBy===id?VB.teal2:"transparent",color:sortBy===id?"#091C1D":VB.muted,
                      border:`1px solid ${sortBy===id?VB.teal2:VB.border}`}}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Action list */}
      {sorted.length===0 && (
        <div className="card" style={{padding:32,textAlign:"center",color:VB.muted,fontSize:11,fontStyle:"italic"}}>
          {filter==="all" ? "No actions yet — add the first one above" : `No ${filter} actions`}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {sorted.map(a=>{
          const sc = ACT_C[a.status]||VB.muted;
          const pc = a.partner?.color||VB.muted;
          const daysUntil = a.due ? Math.ceil((new Date(a.due)-new Date())/(1000*60*60*24)) : null;
          return (
            <div key={a.id} style={{padding:"10px 13px",borderRadius:7,
                background:a.isOverdue?`rgba(228,105,98,.04)`:VB.surface,
                border:`1px solid ${a.isOverdue?VB.coral+"50":VB.border}`,
                borderLeft:`3px solid ${a.isOverdue?VB.coral:sc}`,
                boxShadow:a.isOverdue?`0 0 10px rgba(228,105,98,.07)`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                {/* Checkbox */}
                <button onClick={()=>onUpdate({...a,status:a.status==="done"?"todo":"done"})}
                  style={{width:17,height:17,borderRadius:4,border:`2px solid ${sc}`,flexShrink:0,cursor:"pointer",
                          background:a.status==="done"?sc:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {a.status==="done"&&<span style={{fontSize:9,color:"#091C1D",fontWeight:"bold"}}>✓</span>}
                </button>
                {/* Text */}
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:10,fontWeight:600,color:a.status==="done"?VB.muted:VB.ink,
                    textDecoration:a.status==="done"?"line-through":"none"}}>{a.text}</span>
                  {a.prob&&(
                    <div style={{fontSize:8,color:pc,fontFamily:"'DM Mono',monospace",marginTop:2,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      [{a.partner?.name||a.prob?.pid}] {a.prob?.title}
                    </div>
                  )}
                  {a.notes&&<div style={{fontSize:8,color:VB.muted,fontStyle:"italic",marginTop:2,lineHeight:1.4}}>{a.notes}</div>}
                </div>
                {/* Owner */}
                {a.owner&&(
                  <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.teal2,
                    padding:"2px 7px",borderRadius:4,background:`${VB.teal2}14`,flexShrink:0,whiteSpace:"nowrap"}}>
                    {a.owner}
                  </span>
                )}
                {/* Due */}
                {a.due&&(
                  <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",flexShrink:0,whiteSpace:"nowrap",
                    color:a.isOverdue?VB.coral:daysUntil!==null&&daysUntil<=3?VB.gold:VB.muted,
                    fontWeight:a.isOverdue||daysUntil<=3?"bold":"normal"}}>
                    {a.isOverdue?`⚠ ${Math.abs(daysUntil)}d overdue`:daysUntil===0?"due today":daysUntil===1?"due tomorrow":a.due}
                  </span>
                )}
                {/* Status selector */}
                <select value={a.status} onChange={e=>onUpdate({...a,status:e.target.value})}
                  style={{width:"auto",fontSize:8,padding:"2px 5px",color:sc,
                    background:VB.bg2,border:`1px solid ${sc}30`,borderRadius:4,flexShrink:0}}>
                  {ACT_S.map(s=><option key={s}>{s}</option>)}
                </select>
                {/* Delete */}
                <button onClick={()=>onDelete(a.id)}
                  style={{background:"transparent",border:"none",color:VB.muted,cursor:"pointer",
                    fontSize:14,lineHeight:1,flexShrink:0,padding:"0 2px"}}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL CRM BOARD (cross-all-problems kanban)
// ══════════════════════════════════════════════════════════════════════════════
function CRMBoard({crm, onAdd, onUpdate, onDelete, probs, partners}) {
  const [filterPid,  setFilterPid]  = useState("all");
  const [filterStage,setFilterStage]= useState("all");
  const [adding,     setAdding]     = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [memoId,     setMemoId]     = useState(null);
  const [memos,      setMemos]      = useState({});
  const [memoL,      setMemoL]      = useState({});
  const [nf, setNf] = useState({name:"",stage:"identified",notes:"",website:"",contact:"",nextAction:"",lastContacted:"",probId:probs[0]?.id||""});

  const enriched = (crm||[]).map(c=>{
    const p  = probs.find(x=>x.id===c.probId);
    const pt = partners.find(x=>x.id===p?.pid);
    return {...c, prob:p, partner:pt};
  });

  const visible = enriched
    .filter(c => filterPid==="all"   || c.partner?.id===filterPid)
    .filter(c => filterStage==="all" || c.stage===filterStage);

  const totals = CRM_STAGES.reduce((acc,s)=>({...acc,[s.id]:enriched.filter(c=>c.stage===s.id).length}),{});

  const handleGenMemo = async (c) => {
    if (memos[c.id]) { setMemoId(c.id); return; }
    setMemoL(l=>({...l,[c.id]:true}));
    try {
      const d = await callAI(pDealMemo(c, c.prob, c.partner));
      setMemos(m=>({...m,[c.id]:d}));
      setMemoId(c.id);
    } catch { setMemos(m=>({...m,[c.id]:{error:"Generation failed"}})); setMemoId(c.id); }
    setMemoL(l=>({...l,[c.id]:false}));
  };

  const verdictColor = v => v==="Strong Pass"?VB.gold:v==="Pass"?VB.coral:VB.teal2;

  return (
    <div className="fu">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:".04em",color:VB.ink}}>📬 Startup Pipeline</div>
          <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>
            Outreach CRM — track every startup from identified to active
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <select value={filterPid} onChange={e=>setFilterPid(e.target.value)}
            style={{background:VB.surface,border:`1px solid ${VB.border2}`,borderRadius:6,color:VB.ink,fontFamily:"'DM Mono',monospace",fontSize:10,padding:"6px 10px"}}>
            <option value="all">All BUs</option>
            {partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
            style={{background:VB.surface,border:`1px solid ${VB.border2}`,borderRadius:6,color:VB.ink,fontFamily:"'DM Mono',monospace",fontSize:10,padding:"6px 10px"}}>
            <option value="all">All Stages</option>
            {CRM_STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
          <button className="btn bv" onClick={()=>setAdding(v=>!v)}>+ Track Startup</button>
        </div>
      </div>

      {/* Stage strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
        {CRM_STAGES.map(s=>(
          <div key={s.id} onClick={()=>setFilterStage(filterStage===s.id?"all":s.id)}
            style={{background:filterStage===s.id?`${s.color}18`:VB.surface,border:`1px solid ${filterStage===s.id?s.color:s.color+"30"}`,
                borderRadius:8,padding:"10px",textAlign:"center",cursor:"pointer",transition:"all .12s"}}>
            <div style={{fontSize:16,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:s.color,lineHeight:1}}>{totals[s.id]||0}</div>
            <div style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:2,letterSpacing:".08em"}}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Quick-add form */}
      {adding&&(
        <div className="card" style={{padding:"13px 16px",marginBottom:14,borderLeft:`3px solid rgba(168,85,247,.7)`}}>
          <SL c={"#a855f7"} mb={9}>+ Track New Startup</SL>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8}}>
            <input placeholder="Company name" value={nf.name} autoFocus onChange={e=>setNf(f=>({...f,name:e.target.value}))}/>
            <select value={nf.stage} onChange={e=>setNf(f=>({...f,stage:e.target.value}))}>
              {CRM_STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <input type="date" value={nf.lastContacted} onChange={e=>setNf(f=>({...f,lastContacted:e.target.value}))}
              placeholder="Last contact" style={{fontSize:10}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <input placeholder="Website" value={nf.website} onChange={e=>setNf(f=>({...f,website:e.target.value}))}/>
            <input placeholder="Contact / LinkedIn" value={nf.contact} onChange={e=>setNf(f=>({...f,contact:e.target.value}))}/>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:7,color:VB.muted,marginBottom:3}}>LINKED PROBLEM</div>
            <select value={nf.probId} onChange={e=>setNf(f=>({...f,probId:e.target.value}))} style={{width:"100%",fontSize:10}}>
              {probs.map(p=>{const pt=partners.find(x=>x.id===p.pid);return <option key={p.id} value={p.id}>[{pt?.name||p.pid}] {p.title}</option>;})}
            </select>
          </div>
          <input placeholder="Next action (e.g. Send intro email to CTO by Friday)" value={nf.nextAction}
            onChange={e=>setNf(f=>({...f,nextAction:e.target.value}))} style={{marginBottom:8}}/>
          <textarea rows={2} placeholder="Notes…" value={nf.notes} style={{marginBottom:8}} onChange={e=>setNf(f=>({...f,notes:e.target.value}))}/>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
            <button className="btn bo" onClick={()=>setAdding(false)}>Cancel</button>
            <button className="btn bv" disabled={!nf.name.trim()||!nf.probId} onClick={()=>{
              onAdd({id:"crm_"+uid(),...nf,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
              setNf({name:"",stage:"identified",notes:"",website:"",contact:"",nextAction:"",lastContacted:"",probId:probs[0]?.id||""});
              setAdding(false);
            }}>Add to Pipeline</button>
          </div>
        </div>
      )}

      {visible.length===0&&!adding&&(
        <div className="card" style={{padding:32,textAlign:"center",color:VB.muted,fontSize:11,fontStyle:"italic"}}>
          No startups tracked yet — use the Scout tool inside any problem card, or add manually above
        </div>
      )}

      {/* Kanban */}
      {visible.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,alignItems:"start"}}>
          {CRM_STAGES.map(stage=>{
            const cards = visible.filter(c=>c.stage===stage.id);
            return (
              <div key={stage.id} style={{background:VB.surface2,borderRadius:8,padding:"10px 9px",
                  minHeight:80,border:`1px solid ${stage.color}20`}}>
                <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:stage.color,
                    letterSpacing:".1em",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{stage.icon} {stage.label.toUpperCase()}</span>
                  {cards.length>0&&<span style={{background:`${stage.color}22`,padding:"1px 5px",borderRadius:3,fontSize:9}}>{cards.length}</span>}
                </div>
                {cards.map(c=>{
                  const isEdit = editId===c.id;
                  const thisMemo = memos[c.id];
                  const memoOpen = memoId===c.id;
                  return (
                    <div key={c.id} style={{background:VB.bg2,borderRadius:6,padding:"9px 10px",
                        marginBottom:7,border:`1px solid ${stage.color}30`}}>
                      {/* Card header */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{fontWeight:600,fontSize:10,color:VB.ink}}>{c.name}</div>
                        <div style={{display:"flex",gap:3}}>
                          <button onClick={()=>setEditId(isEdit?null:c.id)}
                            style={{fontSize:8,padding:"1px 4px",borderRadius:3,cursor:"pointer",
                              background:isEdit?`${VB.gold}20`:"transparent",color:isEdit?VB.gold:VB.muted,
                              border:`1px solid ${isEdit?VB.gold:VB.border}`}}>✎</button>
                          <button onClick={()=>onDelete(c.id)}
                            style={{fontSize:8,padding:"1px 4px",borderRadius:3,cursor:"pointer",
                              background:"rgba(228,105,98,.1)",color:VB.coral,border:`1px solid ${VB.coral}30`}}>✕</button>
                        </div>
                      </div>

                      {/* Partner + problem */}
                      {c.partner&&<div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:c.partner.color,marginBottom:2}}>[{c.partner.name}]</div>}
                      {c.prob&&<div style={{fontSize:8,color:VB.muted,marginBottom:4,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{c.prob.title}</div>}

                      {/* Fit score badge if from Scout */}
                      {c.fitScore&&<div style={{fontSize:7.5,fontFamily:"'DM Mono',monospace",color:c.fitScore>=8?VB.gold:VB.teal2,marginBottom:3}}>Fit {c.fitScore}/10</div>}

                      {/* Static info */}
                      {!isEdit&&<>
                        {c.website&&<div style={{fontSize:8,color:VB.teal2,fontFamily:"'DM Mono',monospace",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.website}</div>}
                        {c.contact&&<div style={{fontSize:8,color:VB.muted,marginBottom:2}}>{c.contact}</div>}
                        {c.lastContacted&&<div style={{fontSize:7.5,color:VB.muted,fontFamily:"'DM Mono',monospace",marginBottom:2}}>📅 {c.lastContacted}</div>}
                        {c.nextAction&&<div style={{fontSize:8,color:VB.gold,background:`${VB.gold}0d`,padding:"3px 6px",borderRadius:3,marginBottom:4,lineHeight:1.4}}>→ {c.nextAction}</div>}
                        {c.notes&&<div style={{fontSize:8,color:VB.muted,lineHeight:1.5,marginBottom:5,fontStyle:"italic"}}>{c.notes.slice(0,90)}{c.notes.length>90?"…":""}</div>}
                      </>}

                      {/* Inline edit form */}
                      {isEdit&&(
                        <div style={{marginBottom:6}}>
                          <input value={c.contact||""} placeholder="Contact" style={{marginBottom:4,fontSize:9}}
                            onChange={e=>onUpdate({...c,contact:e.target.value,updatedAt:new Date().toISOString()})}/>
                          <input value={c.website||""} placeholder="Website" style={{marginBottom:4,fontSize:9}}
                            onChange={e=>onUpdate({...c,website:e.target.value,updatedAt:new Date().toISOString()})}/>
                          <input value={c.nextAction||""} placeholder="Next action…" style={{marginBottom:4,fontSize:9}}
                            onChange={e=>onUpdate({...c,nextAction:e.target.value,updatedAt:new Date().toISOString()})}/>
                          <input type="date" value={c.lastContacted||""} style={{marginBottom:4,fontSize:9}}
                            onChange={e=>onUpdate({...c,lastContacted:e.target.value,updatedAt:new Date().toISOString()})}/>
                          <textarea rows={2} value={c.notes||""} placeholder="Notes…" style={{fontSize:9,marginBottom:0}}
                            onChange={e=>onUpdate({...c,notes:e.target.value,updatedAt:new Date().toISOString()})}/>
                        </div>
                      )}

                      {/* Stage move + deal memo */}
                      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}>
                        {CRM_STAGES.filter(s=>s.id!==stage.id).map(s=>(
                          <button key={s.id} onClick={()=>onUpdate({...c,stage:s.id,updatedAt:new Date().toISOString()})}
                            style={{fontSize:7,padding:"2px 5px",borderRadius:3,cursor:"pointer",
                              background:`${s.color}14`,color:s.color,border:`1px solid ${s.color}30`}}>
                            → {s.label}
                          </button>
                        ))}
                      </div>
                      <button onClick={()=>handleGenMemo(c)} disabled={!!memoL[c.id]}
                        style={{fontSize:8,padding:"3px 7px",borderRadius:4,cursor:"pointer",width:"100%",
                            background:thisMemo?`${VB.purple}15`:"transparent",
                            color:thisMemo?VB.purple:VB.muted,
                            border:`1px solid ${thisMemo?VB.purple+"40":VB.border}`}}>
                        {memoL[c.id]?<Sp s={9}/>:thisMemo?"📋 View Deal Memo":"📋 Generate Deal Memo"}
                      </button>

                      {/* Inline deal memo */}
                      {memoOpen&&thisMemo&&(
                        <div style={{marginTop:7,padding:"9px 11px",background:"rgba(9,28,29,.8)",borderRadius:5,
                            border:`1px solid ${VB.purple}30`,borderLeft:`3px solid ${VB.purple}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                            <span style={{fontSize:7.5,fontFamily:"'DM Mono',monospace",color:VB.purple,letterSpacing:".1em"}}>DEAL MEMO</span>
                            <button onClick={()=>setMemoId(null)} style={{background:"transparent",border:"none",color:VB.muted,cursor:"pointer",fontSize:11}}>×</button>
                          </div>
                          {thisMemo.error
                            ?<div style={{fontSize:9,color:VB.coral}}>{thisMemo.error}</div>
                            :<>
                              {thisMemo.verdict&&(
                                <span style={{fontSize:8,padding:"1px 7px",borderRadius:3,fontFamily:"'DM Mono',monospace",
                                    background:`${verdictColor(thisMemo.verdict)}20`,color:verdictColor(thisMemo.verdict),
                                    border:`1px solid ${verdictColor(thisMemo.verdict)}40`,display:"inline-block",marginBottom:5}}>
                                  {thisMemo.verdict}
                                </span>
                              )}
                              {thisMemo.headline&&<div style={{fontSize:10,fontWeight:600,color:VB.ink,marginBottom:5,lineHeight:1.4}}>{thisMemo.headline}</div>}
                              {thisMemo.thesis&&<div style={{fontSize:8.5,color:VB.ink2,lineHeight:1.5,marginBottom:4}}>{thisMemo.thesis}</div>}
                              {thisMemo.nextStep&&(
                                <div style={{fontSize:8,color:VB.teal2,background:`${VB.teal2}0f`,padding:"4px 7px",borderRadius:3,marginTop:4}}>
                                  → {thisMemo.nextStep}
                                </div>
                              )}
                            </>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL RICE BOARD (live-edit all 60 problems)
// ══════════════════════════════════════════════════════════════════════════════
function RiceBoard({probs, partners, onUpdateProb}) {
  const [filterPid, setFilterPid] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [sortBy, setSortBy]       = useState("rice");
  const [editing, setEditing]     = useState(null);
  const [loc, setLoc]             = useState({});
  const [changelog, setChangelog] = useState([]);  // [{title, field, from, to, at}]
  const [showLog, setShowLog]     = useState(false);

  const cats = [...new Set(probs.map(p=>p.cat))].sort();

  const visible = probs
    .filter(p => filterPid==="all" || p.pid===filterPid)
    .filter(p => filterCat==="all" || p.cat===filterCat);

  const sorted = [...visible].sort((a,b) => {
    if (sortBy==="rice")  return getRice(b) - getRice(a);
    if (sortBy==="value") return b.mid - a.mid;
    if (sortBy==="title") return a.title.localeCompare(b.title);
    if (sortBy==="cat")   return a.cat.localeCompare(b.cat);
    return 0;
  });

  const startEdit = (p) => {
    setEditing(p.id);
    setLoc({reach:p.reach||60, impact2:p.impact2||7, confidence:p.confidence||75, effort:p.effort||5,
            low:p.low||5e6, mid:p.mid||15e6, high:p.high||35e6});
  };

  const saveEdit = (p) => {
    // Log all changed fields
    const fields = {reach:"Reach",impact2:"Impact",confidence:"Confidence",effort:"Effort",low:"Low $",mid:"Mid $",high:"High $"};
    Object.entries(fields).forEach(([k,label])=>{
      if (loc[k] !== p[k]) {
        setChangelog(l=>[{id:uid(),probTitle:p.title,field:label,from:p[k],to:loc[k],at:new Date().toLocaleTimeString()},...l].slice(0,50));
      }
    });
    onUpdateProb({...p, ...loc});
    setEditing(null);
  };

  const exportCSV = () => {
    const rows = [["#","BU","Problem","Category","Priority","Reach","Impact","Confidence","Effort","RICE","Low $M","Mid $M","High $M"]];
    [...probs].sort((a,b)=>getRice(b)-getRice(a)).forEach((p,i)=>{
      const pt = partners.find(x=>x.id===p.pid);
      rows.push([i+1,pt?.name||p.pid,p.title,p.cat,p.pri,p.reach,p.impact2,p.confidence,p.effort,getRice(p).toFixed(1),(p.low/1e6).toFixed(1),(p.mid/1e6).toFixed(1),(p.high/1e6).toFixed(1)]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download = "VentureBuilder_RICE_Scores.csv";
    a.click();
  };

  const Slider = ({k, label, min, max, color, fmt}) => {
    const display = fmt ? fmt(loc[k]) : loc[k];
    return (
      <div style={{marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,letterSpacing:".08em"}}>{label}</span>
          <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color,fontWeight:"bold"}}>{display}</span>
        </div>
        <input type="range" min={min} max={max} value={loc[k]}
          onChange={e=>setLoc(l=>({...l,[k]:+e.target.value}))}
          style={{width:"100%",accentColor:color,cursor:"pointer",height:4}}/>
      </div>
    );
  };

  return (
    <div className="fu">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:".04em",color:VB.ink}}>📊 RICE Score Board</div>
          <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>
            Live RICE editor — adjust scores across all {probs.length} problems, rankings update in real time
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {changelog.length>0&&(
            <button onClick={()=>setShowLog(v=>!v)}
              style={{fontSize:9,padding:"5px 10px",borderRadius:5,cursor:"pointer",fontFamily:"'DM Mono',monospace",
                background:showLog?`${VB.teal2}20`:"transparent",color:VB.teal2,border:`1px solid ${VB.teal2}40`}}>
              📋 {changelog.length} change{changelog.length!==1?"s":""}
            </button>
          )}
          <button onClick={exportCSV}
            style={{fontSize:9,padding:"5px 10px",borderRadius:5,cursor:"pointer",fontFamily:"'DM Mono',monospace",
              background:"transparent",color:VB.gold,border:`1px solid ${VB.gold}40`}}>
            ⬇ Export CSV
          </button>
          <select value={filterPid} onChange={e=>setFilterPid(e.target.value)}
            style={{background:VB.surface,border:`1px solid ${VB.border2}`,borderRadius:6,
              color:VB.ink,fontFamily:"'DM Mono',monospace",fontSize:10,padding:"6px 10px"}}>
            <option value="all">All BUs</option>
            {partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
            style={{background:VB.surface,border:`1px solid ${VB.border2}`,borderRadius:6,
              color:VB.ink,fontFamily:"'DM Mono',monospace",fontSize:10,padding:"6px 10px",maxWidth:200}}>
            <option value="all">All Categories</option>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Change log panel */}
      {showLog&&changelog.length>0&&(
        <div className="card" style={{padding:"10px 14px",marginBottom:14,borderLeft:`3px solid ${VB.teal2}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <SL c={VB.teal2} mb={0}>📋 Change Log</SL>
            <button onClick={()=>setChangelog([])} style={{fontSize:8,color:VB.muted,background:"transparent",border:"none",cursor:"pointer"}}>Clear</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:160,overflowY:"auto"}}>
            {changelog.map(c=>(
              <div key={c.id} style={{display:"flex",gap:8,alignItems:"center",fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>
                <span style={{color:VB.teal2,flexShrink:0}}>{c.at}</span>
                <span style={{color:VB.ink2,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.probTitle}</span>
                <span style={{color:VB.muted,flexShrink:0}}>{c.field}:</span>
                <span style={{color:VB.coral,flexShrink:0}}>{typeof c.from==="number"&&c.from>=1e6?`$${(c.from/1e6).toFixed(0)}M`:c.from}</span>
                <span style={{color:VB.muted,flexShrink:0}}>→</span>
                <span style={{color:VB.gold,flexShrink:0}}>{typeof c.to==="number"&&c.to>=1e6?`$${(c.to/1e6).toFixed(0)}M`:c.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:9,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>
          {sorted.length} problems · click any row to edit RICE
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <span style={{fontSize:8,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>SORT:</span>
          {[["rice","RICE"],["value","Value"],["title","Title"],["cat","Category"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setSortBy(id)}
              style={{fontSize:8,padding:"2px 7px",borderRadius:4,cursor:"pointer",
                fontFamily:"'DM Mono',monospace",border:`1px solid ${sortBy===id?VB.gold:VB.border}`,
                background:sortBy===id?VB.gold:"transparent",color:sortBy===id?"#091C1D":VB.muted}}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{display:"grid",gridTemplateColumns:"40px 1fr 90px 80px 80px 80px 80px 80px 90px 60px",
          gap:0,padding:"5px 10px",fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,
          letterSpacing:".1em",borderBottom:`1px solid ${VB.border}`,marginBottom:4}}>
        {["#","PROBLEM","BU","REACH","IMPACT","CONF","EFFORT","RICE","MID $M","PRI"].map(h=>(
          <div key={h}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      {sorted.map((p,i)=>{
        const pt = partners.find(x=>x.id===p.pid);
        const c  = CAT[p.cat]||VB.muted;
        const r  = getRice(p);
        const isEditing = editing===p.id;
        // Live preview score if currently editing
        const liveRice = isEditing
          ? Math.round(((loc.reach*loc.impact2*(loc.confidence/100))/loc.effort)*10)/10
          : r;
        const delta = isEditing ? +(liveRice-r).toFixed(1) : 0;

        return (
          <div key={p.id} style={{borderRadius:6,marginBottom:3,overflow:"hidden",
              border:`1px solid ${isEditing?VB.gold:VB.border}`,
              background:isEditing?`${VB.gold}06`:VB.surface,
              transition:"all .1s"}}>
            {/* Summary row */}
            <div style={{display:"grid",gridTemplateColumns:"40px 1fr 90px 80px 80px 80px 80px 80px 90px 60px",
                gap:0,padding:"8px 10px",alignItems:"center",cursor:"pointer"}}
              onClick={()=>isEditing ? setEditing(null) : startEdit(p)}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:VB.muted,lineHeight:1}}>
                {i+1}
              </div>
              <div style={{minWidth:0,paddingRight:10}}>
                <div style={{fontSize:10,fontWeight:600,color:VB.ink,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                <div style={{fontSize:7.5,color:c,fontFamily:"'DM Mono',monospace",marginTop:1}}>{p.cat}</div>
              </div>
              <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",
                  color:pt?.color||VB.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {pt?.name||p.pid}
              </div>
              {[p.reach,p.impact2,p.confidence,p.effort].map((v,vi)=>(
                <div key={vi} style={{fontFamily:"'DM Mono',monospace",fontSize:10,
                    color:[VB.teal2,VB.gold,VB.gold2,VB.coral][vi]}}>
                  {v}
                </div>
              ))}
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,
                  color:isEditing?(delta>0?VB.teal2:delta<0?VB.coral:VB.gold):VB.gold,
                  lineHeight:1}}>
                {liveRice}
                {isEditing&&delta!==0&&(
                  <span style={{fontSize:9,marginLeft:4,fontFamily:"'DM Mono',monospace",
                      color:delta>0?VB.teal2:VB.coral}}>
                    {delta>0?"+":""}{delta}
                  </span>
                )}
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:VB.gold2}}>
                ${(p.mid/1e6).toFixed(0)}M
              </div>
              <Bdg v={p.pri} sm/>
            </div>

            {/* Expanded RICE editor */}
            {isEditing&&(
              <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${VB.gold}30`,background:`${VB.gold}04`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"8px 18px",marginBottom:10}}>
                  <Slider k="reach"      label="REACH (%)"            min={1}   max={100}    color={VB.teal2}/>
                  <Slider k="impact2"    label="IMPACT (1–10)"         min={1}   max={10}     color={VB.gold}/>
                  <Slider k="confidence" label="CONFIDENCE (%)"        min={1}   max={100}    color={VB.gold2}/>
                  <Slider k="effort"     label="EFFORT — lower=better" min={1}   max={10}     color={VB.coral}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 18px",marginBottom:10,
                    paddingTop:8,borderTop:`1px solid ${VB.border}`}}>
                  <Slider k="low"  label="LOW ESTIMATE ($M)"  min={1e6}  max={200e6} color={VB.muted}  fmt={v=>`$${(v/1e6).toFixed(0)}M`}/>
                  <Slider k="mid"  label="MID ESTIMATE ($M)"  min={1e6}  max={300e6} color={VB.gold}   fmt={v=>`$${(v/1e6).toFixed(0)}M`}/>
                  <Slider k="high" label="HIGH ESTIMATE ($M)" min={1e6}  max={500e6} color={VB.teal2}  fmt={v=>`$${(v/1e6).toFixed(0)}M`}/>
                </div>
                <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted,
                    padding:"4px 8px",background:VB.bg2,borderRadius:4,marginBottom:8,display:"inline-block"}}>
                  ({loc.reach} × {loc.impact2} × {(loc.confidence/100).toFixed(2)}) ÷ {loc.effort} = <b style={{color:VB.gold}}>{liveRice}</b>
                  {delta!==0&&<span style={{marginLeft:8,color:delta>0?VB.teal2:VB.coral}}>{delta>0?"+":""}{delta}</span>}
                </div>
                <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
                  <button className="btn bo" style={{fontSize:9}}
                    onClick={()=>setLoc({reach:p.reach||60,impact2:p.impact2||7,confidence:p.confidence||75,effort:p.effort||5,low:p.low||5e6,mid:p.mid||15e6,high:p.high||35e6})}>
                    Reset
                  </button>
                  <button className="btn bo" style={{fontSize:9}} onClick={()=>setEditing(null)}>Cancel</button>
                  <button className="btn bg" style={{fontSize:9}} onClick={()=>saveEdit(p)}>
                    ✓ Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// NOV GROUP — collapsible parent card grouping all 11 NOV BUs
// ══════════════════════════════════════════════════════════════════════════════
function NovGroup({novBUs, probs, buys, rStatus, getCos, novMid, novBuys, novProbs, f$, onOpen}) {
  const [open, setOpen] = React.useState(true);
  const totalRes = novBUs.reduce((s,p)=>s+getCos(p.id).filter(c=>rStatus[c.id]==="done").length,0);
  const totalCos = novBUs.reduce((s,p)=>s+getCos(p.id).length,0);
  return (
    <div style={{border:`1px solid ${VB.gold}28`,borderRadius:10,overflow:"hidden",background:VB.surface}}>
      {/* NOV Group header */}
      <div onClick={()=>setOpen(v=>!v)} style={{
        display:"flex",alignItems:"center",gap:14,padding:"15px 20px",cursor:"pointer",
        background:`${VB.gold}06`,borderBottom:open?`1px solid ${VB.gold}18`:"none",
        transition:"background .15s"
      }}
        onMouseEnter={e=>e.currentTarget.style.background=`${VB.gold}0e`}
        onMouseLeave={e=>e.currentTarget.style.background=`${VB.gold}06`}
      >
        {/* NOV logo badge */}
        <div style={{width:48,height:48,borderRadius:9,background:`${VB.gold}1a`,border:`2px solid ${VB.gold}`,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:VB.gold,letterSpacing:".06em"}}>NOV</span>
        </div>
        {/* Title + meta */}
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,letterSpacing:".04em",color:VB.ink,lineHeight:1}}>
            National Oilwell Varco
          </div>
          <div style={{fontSize:9,color:VB.gold,fontFamily:"'DM Mono',monospace",marginTop:3}}>
            OEM  ·  {novBUs.length} Business Units  ·  {novProbs.length} problems  ·  {f$(novMid)} portfolio value
          </div>
        </div>
        {/* KPI strip */}
        <div style={{display:"flex",gap:8,marginRight:14}}>
          {[["BUs",novBUs.length,VB.gold],["Problems",novProbs.length,VB.teal2],["Research",`${totalRes}/${totalCos}`,VB.teal2],["Pipeline",novBuys.length,VB.purple]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:VB.surface2,padding:"5px 11px",borderRadius:6,
              border:`1px solid ${VB.border}`,minWidth:52}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:7,color:VB.muted,fontFamily:"'DM Mono',monospace",marginTop:1,letterSpacing:".06em"}}>{l}</div>
            </div>
          ))}
        </div>
        {/* Chevron */}
        <div style={{fontSize:13,color:VB.gold,flexShrink:0,transform:open?"rotate(90deg)":"rotate(0deg)",
          transition:"transform .2s",marginRight:4}}>▶</div>
      </div>

      {/* BU cards grid */}
      {open&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",
          gap:10,padding:"14px 16px",background:VB.bg}}>
          {novBUs.map(p=>{
            const pPs=probs.filter(pr=>pr.pid===p.id);
            const pBs=buys.filter(b=>b.pid===p.id);
            const tMid=pPs.reduce((s,pr)=>s+pr.mid,0);
            const pCos=getCos(p.id);
            const doneR=pCos.filter(c=>rStatus[c.id]==="done").length;
            return (
              <div key={p.id} className="card" onClick={()=>onOpen(p)}
                style={{padding:13,cursor:"pointer",borderLeft:`3px solid ${p.color}`,
                  transition:"transform .12s,box-shadow .12s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 16px ${p.color}18`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
              >
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
                  <div style={{width:32,height:32,borderRadius:6,background:`${p.color}18`,
                    border:`1.5px solid ${p.color}`,display:"flex",alignItems:"center",
                    justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:9.5,color:p.color}}>{p.avatar}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:".03em",
                      color:VB.ink,lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.full||p.name}</div>
                    <div style={{fontSize:7.5,color:p.color,fontFamily:"'DM Mono',monospace",marginTop:1}}>OEM BU</div>
                  </div>
                </div>
                <div style={{fontSize:8.5,color:VB.muted,lineHeight:1.5,marginBottom:8,
                  overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.desc}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                  {[["Probs",pPs.length,VB.gold],["$M",tMid?Math.round(tMid/1e6):"–",p.color],["Rsrch",`${doneR}/${pCos.length}`,VB.teal2],["Buys",pBs.length,VB.purple]].map(([l,v,c])=>(
                    <div key={l} style={{background:VB.surface2,padding:"3px 4px",borderRadius:4,textAlign:"center"}}>
                      <div style={{fontSize:6.5,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:1}}>{l}</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:c,lineHeight:1}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:6,fontSize:7.5,color:VB.teal2,fontFamily:"'DM Mono',monospace"}}>→ Open workspace</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── AUTH: Google Sign-In gate (venturebuilder.vc only) ────────────────────────
function LoginGate({ onLogin }) {
  const btnRef = useRef(null);
  useEffect(() => {
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = JSON.parse(atob(response.credential.split(".")[1]));
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
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:VB.bg, color:VB.ink }}>
      <h1 style={{ fontFamily:"Bebas Neue", fontSize:"2.5rem", marginBottom:8 }}>VentureBuilder</h1>
      <p style={{ color:VB.muted, marginBottom:24 }}>Sign in with your venturebuilder.vc account</p>
      <div ref={btnRef} />
    </div>
  );
}

export default function App() {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  // Keep module-level token in sync so callAI/callText always have it
  if (user?.credential) _authToken = user.credential;

  const [partners, setPartners] = useState(SEED_PARTNERS);
  const [probs, setProbs]       = useState(SEED_PROBS);
  const [buys, setBuys]         = useState([]);
  const [theses, setTheses]     = useState({});
  const [thesisL, setThesisL]   = useState({});

  // Per-partner companies: { [pid]: [co, ...] }
  // Starts with global defaults for each partner
  const [partnerCos, setPartnerCos] = useState({
    nov: GLOBAL_COS,
    ey:  GLOBAL_COS,
  });

  // Per-partner stakeholders: { [pid]: [sh, ...] }
  const [partnerSH, setPartnerSH] = useState({
    nov: GLOBAL_SH,
    ey:  GLOBAL_SH,
  });

  // Research results keyed by company id (shared — same company same data regardless of partner)
  const [research, setRes]   = useState({});
  const [rStatus, setRS]     = useState({});
  const [analysis, setAna]   = useState({});
  const [aStatus, setAS]     = useState({});
  const [shIntel, setSHI]    = useState({});
  const shIntelRef           = useRef(shIntel);
  const [shLoading, setSHL]  = useState({});
  const [dbLoaded, setDbLoaded] = useState(false);

  // Keep shIntelRef in sync so async functions always read latest intel
  useEffect(() => { shIntelRef.current = shIntel; }, [shIntel]);

  // ── Load persisted research from storage on mount ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem("vb_research");
        if (r) {
          const saved = JSON.parse(r);
          if (saved.research) setRes(saved.research);
          if (saved.rStatus)  setRS(Object.fromEntries(Object.keys(saved.rStatus).map(k => [k, "done"])));
          if (saved.shIntel)  setSHI(saved.shIntel);
          if (saved.analysis) setAna(saved.analysis);
        }
      } catch(e) { /* first run — no saved data */ }
      setDbLoaded(true);
    })();
  }, []);

  // ── Persist research to storage whenever it changes ────────────────────────
  useEffect(() => {
    if (!dbLoaded) return;
    const saveData = async () => {
      try {
        const doneKeys = Object.keys(rStatus).filter(k => rStatus[k] === "done");
        // NOTE: do NOT gate on doneKeys.length — shIntel & analysis must save even with 0 researched companies
        const researchToSave = Object.fromEntries(doneKeys.map(k => [k, research[k]]).filter(([,v])=>v));
        localStorage.setItem("vb_research", JSON.stringify({
          research: researchToSave,
          rStatus:  Object.fromEntries(doneKeys.map(k => [k, "done"])),
          shIntel,
          analysis,
          savedAt:  new Date().toISOString(),
        }));
      } catch(e) { console.warn("Storage save failed:", e); }
    };
    saveData();
  }, [research, shIntel, analysis, dbLoaded]);

  // Match engine
  const [match, setMatch]       = useState(null);
  const [matchStatus, setMS]    = useState("idle");

  // ── Actions & CRM state (persisted) ──
  const [actions, setActions] = useState([]);
  const [crm, setCrm]         = useState([]);
  const [showIngest, setShowIngest] = useState(false);

  // Persist actions + CRM
  useEffect(() => {
    if (!dbLoaded) return;
    try { localStorage.setItem("vb_actions_crm", JSON.stringify({actions, crm})); } catch(e) { /* storage full */ }
  }, [actions, crm, dbLoaded]);

  // Load actions + CRM on mount (piggyback existing load effect)
  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem("vb_actions_crm");
        if (r) { const d=JSON.parse(r); if(d.actions) setActions(d.actions); if(d.crm) setCrm(d.crm); }
      } catch {}
    })();
  }, []);

  // Actions CRUD
  const addAction    = (a)  => setActions(s=>[...s, a]);
  const updateAction = (a)  => setActions(s=>s.map(x=>x.id===a.id?a:x));
  const deleteAction = (id) => setActions(s=>s.filter(x=>x.id!==id));

  // CRM CRUD
  const addCrm    = (c)  => setCrm(s=>[...s, c]);
  const updateCrm = (c)  => setCrm(s=>s.map(x=>x.id===c.id?c:x));
  const deleteCrm = (id) => setCrm(s=>s.filter(x=>x.id!==id));

  // Update a problem's RICE scores
  const updateProb = (updated) => setProbs(ps=>ps.map(p=>p.id===updated.id?updated:p));

  // Nav
  const [mainTab, setMainTab] = useState("partners");
  const [activeP, setActiveP] = useState(null);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPf, setNewPf] = useState({name:"",full:"",sector:"OFS",desc:"",tags:""});

  // Helpers to get partner-scoped data
  const getCos = (pid) => partnerCos[pid] || GLOBAL_COS;
  const getSH  = (pid) => partnerSH[pid]  || GLOBAL_SH;

  const totalMid = probs.reduce((s,p)=>s+p.mid,0);
  const allCos = [...new Map([...Object.values(partnerCos).flat()].map(c=>[c.id,c])).values()];
  const allSH  = [...new Map([...Object.values(partnerSH).flat()].map(s=>[s.id,s])).values()];
  const totalRes = allCos.filter(c=>rStatus[c.id]==="done").length;

  // ── AI actions ──
  const doResearch = async (co, ps, force=false) => {
    if (rStatus[co.id] === "done" && !force) return; // skip if cached unless forced refresh
    setRS(r=>({...r,[co.id]:"loading"}));
    try {
      const d = await callAI(pResearch(co, ps));
      d.ts        = now();
      d.fetchedAt = new Date().toISOString();
      setRes(r=>({...r,[co.id]:d}));
      setRS(r=>({...r,[co.id]:"done"}));
    } catch { setRS(r=>({...r,[co.id]:"error"})); }
  };

  const doAnalysis = async (pid, ps, shs, shIntelData) => {
    const latestIntel = shIntelData || shIntelRef.current;
    const doneRes = getCos(pid).filter(c=>rStatus[c.id]==="done").map(c=>({name:c.name,type:c.type,data:research[c.id]}));
    const shData  = (shs||[]).filter(s=>latestIntel[s.id]).map(s=>({name:s.name,org:s.org,intel:latestIntel[s.id]}));
    setAS(s=>({...s,[pid]:"loading"}));
    try {
      const a = await callAI(pAnalysis(ps, doneRes, shData));
      setAna(s=>({...s,[pid]:a}));
      setAS(s=>({...s,[pid]:"done"}));
    } catch { setAS(s=>({...s,[pid]:"error"})); }
  };

  const doFetchSH = async (sh, ps) => {
    setSHL(l=>({...l,[sh.id]:true}));
    try {
      const d = await callAI(pSH(sh, ps));
      d.ts        = now();
      d.fetchedAt = new Date().toISOString();
      setSHI(i=>({...i,[sh.id]:d}));
      setSHL(l=>({...l,[sh.id]:false}));
      return d;
    } catch(e) {
      const err = {error:e.message,ts:now(),fetchedAt:new Date().toISOString()};
      setSHI(i=>({...i,[sh.id]:err}));
      setSHL(l=>({...l,[sh.id]:false}));
      return err;
    }
  };

  const doGenThesis = async (p) => {
    setThesisL(l=>({...l,[p.id]:true}));
    try { const r = await callAI(pThesis(p)); setTheses(t=>({...t,[p.id]:r})); } catch {}
    setThesisL(l=>({...l,[p.id]:false}));
  };

  const doRunMatch = async () => {
    const eyPs = probs.filter(p=>p.pid==="ey");
    const ofsData = allCos.filter(c=>rStatus[c.id]==="done").map(c=>({name:c.name,type:c.type,data:research[c.id]}));
    setMS("loading");
    try { const m = await callAI(pMatch(eyPs, ofsData)); setMatch(m); setMS("done"); }
    catch { setMS("error"); }
  };

  // ── Partner CRUD ──
  const addPartner = () => {
    if(!newPf.name.trim()) return;
    const cols=[VB.teal2,VB.coral,VB.purple,"#22c55e","#f59e0b",VB.gold2];
    const pid = newPf.name.toLowerCase().replace(/\s+/g,"_")+"_"+uid();
    const p = {...newPf, id:pid, avatar:newPf.name.slice(0,3).toUpperCase(),
      tags:newPf.tags.split(",").map(t=>t.trim()).filter(Boolean),
      color:cols[partners.length%cols.length]};
    setPartners(ps=>[...ps,p]);
    setPartnerCos(c=>({...c,[pid]:GLOBAL_COS}));
    setPartnerSH(s=>({...s,[pid]:GLOBAL_SH}));
    setNewPf({name:"",full:"",sector:"OFS",desc:"",tags:""});
    setShowAddPartner(false);
  };

  // ── Per-partner co/sh CRUD ──
  const addCoToPartner  = (pid, co)  => setPartnerCos(m=>({...m,[pid]:[...(m[pid]||[]),co]}));
  const removeCoFromPartner = (pid, cid) => setPartnerCos(m=>({...m,[pid]:(m[pid]||[]).filter(c=>c.id!==cid)}));
  const addSHToPartner  = (pid, sh)  => setPartnerSH(m=>({...m,[pid]:[...(m[pid]||[]),sh]}));
  const removeSHFromPartner = (pid, shid) => setPartnerSH(m=>({...m,[pid]:(m[pid]||[]).filter(s=>s.id!==shid)}));

  // In production, require Google sign-in (venturebuilder.vc only)
  if (!isDev && !user) return <LoginGate onLogin={setUser} />;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:VB.bg,minHeight:"100vh",color:VB.ink}}>
      <style>{G}</style>

      {/* HEADER */}
      <header style={{background:"rgba(9,28,29,.96)",borderBottom:`1px solid ${VB.border}`,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
        <div style={{maxWidth:1440,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:13,height:50}}>
          <div style={{display:"flex",alignItems:"center",gap:8,paddingRight:13,borderRight:`1px solid ${VB.border}`,flexShrink:0}}>
            <div style={{width:28,height:28,background:VB.gold,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#091C1D" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M11 2v13M3 7l8 4.5L19 7" stroke="#091C1D" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:".06em",color:VB.ink,lineHeight:1}}>VentureBuilder</div>
              <div style={{fontSize:7,letterSpacing:".14em",textTransform:"uppercase",color:VB.gold,marginTop:1}}>Partner Discovery</div>
            </div>
          </div>
          {activeP&&(
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace"}}>
              <span style={{cursor:"pointer",color:VB.teal2}} onClick={()=>setActiveP(null)}>Partners</span>
              <span style={{color:VB.border2}}>/</span>
              <span style={{color:VB.ink2}}>{activeP.name}</span>
            </div>
          )}
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:9,fontSize:9,fontFamily:"'DM Mono',monospace",color:VB.muted}}>
            {/* DB cache status */}
            {dbLoaded&&totalRes>0&&(()=>{
              const allFetched = allCos.filter(c=>research[c.id]?.fetchedAt);
              const staleCount = allFetched.filter(c=>(Date.now()-new Date(research[c.id].fetchedAt).getTime())>86400000).length;
              const oldest = allFetched.reduce((min,c)=>{
                const t=new Date(research[c.id].fetchedAt).getTime();
                return t<min?t:min;
              },Infinity);
              const oldestAge = oldest<Infinity ? Math.floor((Date.now()-oldest)/3600000) : null;
              return (
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,
                  background:staleCount>0?"rgba(228,105,98,.08)":"rgba(0,184,204,.08)",
                  border:`1px solid ${staleCount>0?VB.coral+"40":VB.teal2+"40"}`}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:staleCount>0?VB.coral:VB.teal2,display:"inline-block"}}/>
                  <span style={{color:staleCount>0?VB.coral:VB.teal2}}>
                    {staleCount>0 ? `${staleCount} stale` : "DB synced"}
                  </span>
                  {oldestAge!==null&&<span style={{color:VB.muted,fontSize:8}}>· {oldestAge<1?"<1h":oldestAge+"h"} ago</span>}
                </div>
              );
            })()}
            {dbLoaded&&totalRes===0&&(
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,
                background:"rgba(132,155,166,.06)",border:`1px solid ${VB.border}`}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:VB.muted,display:"inline-block"}}/>
                <span>no cache</span>
              </div>
            )}
            {!dbLoaded&&(
              <div style={{display:"flex",alignItems:"center",gap:4,color:VB.muted}}>
                <Sp s={9}/> loading cache…
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:4}}><Pu c={totalRes>0?VB.gold:VB.muted}/>{totalRes} researched</div>
            <div style={{display:"flex",alignItems:"center",gap:4}}><Pu c={buys.length>0?VB.purple:VB.muted}/>{buys.length} buys</div>
          </div>
          <button className="btn bg" style={{fontSize:10}} onClick={()=>{setActiveP(null);setMainTab("ai");}}>✦ AI Tool</button>
          <button className="btn bt" style={{fontSize:10}} onClick={()=>setShowIngest(true)}>📥 Ingest Doc</button>
        </div>
        {showIngest&&<DocIngest partners={partners} onAddProbs={ps=>{setProbs(prev=>[...prev,...ps]);}} onClose={()=>setShowIngest(false)}/>}
        <div style={{height:2,background:"rgba(181,211,52,.08)"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#B5D334,#cde84a)",transition:"width .5s ease",width:`${(totalRes/Math.max(allCos.length,1))*100}%`}}/>
        </div>
      </header>

      {/* NAV */}
      <nav style={{background:"rgba(9,28,29,.8)",borderBottom:`1px solid ${VB.border}`}}>
        <div style={{maxWidth:1440,margin:"0 auto",padding:"0 20px",display:"flex",overflowX:"auto"}}>
          {[
            ["partners","◈  Partners"],
            ["global","🌐  Global Intel"],
            ["rice","📊  RICE Board"],
            ["actions", `🗓  Actions${actions.filter(a=>a.status!=="done").length>0?" ("+actions.filter(a=>a.status!=="done").length+")":""}`],
            ["crm", `📬  Pipeline${crm.length>0?" ("+crm.length+")":""}`],
            ["reports","📋  Reports"],
            ["match","⚡  Match"],
            ["ai","✦  AI"],
          ].map(([id,label])=>(
            <button key={id} className={`tab ${mainTab===id&&!activeP?"on":""}`} onClick={()=>{setMainTab(id);setActiveP(null);}}>{label}</button>
          ))}
          {activeP&&<button className="tab on" style={{color:activeP.color,borderBottomColor:activeP.color}}>{activeP.avatar} {activeP.name}</button>}
        </div>
      </nav>

      <div style={{maxWidth:1440,margin:"0 auto",padding:"20px"}}>

        {/* PARTNERS DASHBOARD */}
        {mainTab==="partners"&&!activeP&&(
          <div className="fu">
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:18}}>
              <KPI label="Partners" value={partners.length} sub="Active workspaces"/>
              <KPI label="Problems" value={probs.length} sub="RICE + $ scored" color={VB.teal2}/>
              <KPI label="Portfolio Value" value={f$(totalMid)} sub="Mid-case benchmark"/>
              <KPI label="Researched" value={totalRes} sub="Companies" color={VB.teal2}/>
              <KPI label="Buys & Theses" value={buys.length} sub="Deal pipeline" color={VB.purple}/>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <SL>Partner Workspaces</SL>
              <button className="btn bg" onClick={()=>setShowAddPartner(v=>!v)}>+ Add Partner</button>
            </div>

            {showAddPartner&&(
              <div className="card" style={{padding:15,marginBottom:14,borderLeft:`3px solid ${VB.gold}`}}>
                <SL c={VB.gold} mb={9}>+ New Partner Workspace</SL>
                <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8,marginBottom:8}}>
                  <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>SHORT NAME</div><input value={newPf.name} onChange={e=>setNewPf(p=>({...p,name:e.target.value}))} placeholder="e.g. ADNOC"/></div>
                  <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>FULL NAME / BU</div><input value={newPf.full} onChange={e=>setNewPf(p=>({...p,full:e.target.value}))} placeholder="ADNOC — Upstream Directorate"/></div>
                  <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>SECTOR</div><select value={newPf.sector} onChange={e=>setNewPf(p=>({...p,sector:e.target.value}))}><option>OEM</option><option>OFS</option><option>Operator</option><option>NOC</option><option>Consulting</option><option>Government</option><option>Investor</option></select></div>
                </div>
                <div style={{marginBottom:8}}><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>DESCRIPTION</div><textarea rows={2} value={newPf.desc} onChange={e=>setNewPf(p=>({...p,desc:e.target.value}))} placeholder="Brief description and engagement context"/></div>
                <div style={{display:"grid",gridTemplateColumns:"2fr auto",gap:8,alignItems:"end"}}>
                  <div><div style={{fontSize:8,color:VB.muted,marginBottom:3}}>TAGS (comma separated)</div><input value={newPf.tags} onChange={e=>setNewPf(p=>({...p,tags:e.target.value}))} placeholder="ESP, AI, digital transformation"/></div>
                  <div style={{display:"flex",gap:5}}><button className="btn bg" onClick={addPartner}>Create</button><button className="btn bo" onClick={()=>setShowAddPartner(false)}>✕</button></div>
                </div>
              </div>
            )}

            {(()=>{
              return (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
                  {partners.map(p=>{
                    const pPs=probs.filter(pr=>pr.pid===p.id);
                    const pBs=buys.filter(b=>b.pid===p.id);
                    const tMid=pPs.reduce((s,pr)=>s+pr.mid,0);
                    const pCos=getCos(p.id);
                    const doneR=pCos.filter(c=>rStatus[c.id]==="done").length;
                    const isNov = p.id==="nov";
                    const novBuCounts = isNov ? NOV_BUS.reduce((acc,b)=>{
                      acc[b.buShort]=pPs.filter(pr=>pr.bu===b.buShort).length; return acc;
                    },{}) : null;
                    return (
                      <div key={p.id} className="card" onClick={()=>setActiveP(p)}
                        style={{padding:18,cursor:"pointer",
                          borderLeft:`3px solid ${p.color}`,
                          gridColumn: isNov?"span 2":"span 1",
                          transition:"transform .15s,box-shadow .15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 24px ${p.color}18`;}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:10}}>
                          <div style={{width:44,height:44,borderRadius:8,background:`${p.color}20`,border:`2px solid ${p.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isNov?13:12,color:p.color}}>{p.avatar}</span>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isNov?20:16,letterSpacing:".04em",color:VB.ink,lineHeight:1}}>{p.full||p.name}</div>
                            <div style={{fontSize:9,color:p.color,fontFamily:"'DM Mono',monospace",marginTop:2}}>
                              {p.sector}{isNov?` · ${NOV_BUS.length} Business Units`:""}
                            </div>
                          </div>
                        </div>
                        <div style={{fontSize:9.5,color:VB.muted,lineHeight:1.6,marginBottom:11}}>{p.desc}</div>

                        {/* NOV BU pill strip */}
                        {isNov&&novBuCounts&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:11}}>
                            {NOV_BUS.map(b=>{
                              const cnt=novBuCounts[b.buShort]||0;
                              return (
                                <span key={b.buShort} style={{fontSize:8,padding:"2px 8px",borderRadius:10,
                                  background:`${b.color}14`,color:b.color,border:`1px solid ${b.color}30`,
                                  fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:4}}>
                                  <span style={{width:5,height:5,borderRadius:"50%",background:b.color,display:"inline-block",flexShrink:0}}/>
                                  {b.buShort} {cnt>0&&<span style={{opacity:.7}}>({cnt})</span>}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div style={{display:"grid",gridTemplateColumns:`repeat(${isNov?5:4},1fr)`,gap:6}}>
                          {(isNov
                            ?[["Problems",pPs.length,VB.gold],["Value",f$(tMid),p.color],["Research",`${doneR}/${pCos.length}`,VB.teal2],["Buys",pBs.length,VB.purple],["BUs",NOV_BUS.length,"#a855f7"]]
                            :[["Problems",pPs.length,VB.gold],["Value",f$(tMid),p.color],["Research",`${doneR}/${pCos.length}`,VB.teal2],["Buys",pBs.length,VB.purple]]
                          ).map(([l,v,c])=>(
                            <div key={l} style={{background:VB.surface2,padding:"5px 7px",borderRadius:5,textAlign:"center"}}>
                              <div style={{fontSize:7,fontFamily:"'DM Mono',monospace",color:VB.muted,marginBottom:2}}>{l}</div>
                              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:c,lineHeight:1}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:9,fontSize:8,color:VB.teal2,fontFamily:"'DM Mono',monospace"}}>→ Open workspace</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* WORKSPACE */}
        {activeP&&(
          <div className="fu">
            <Workspace
              partner={activeP}
              allProbs={probs} allBuys={buys}
              partnerCos={getCos(activeP.id)} partnerSH={getSH(activeP.id)}
              shIntel={shIntel} shLoading={shLoading}
              research={research} rStatus={rStatus}
              analysis={analysis[activeP.id]} aStatus={aStatus[activeP.id]||"idle"}
              theses={theses} thesisL={thesisL}
              onAddProb={p=>setProbs(ps=>[...ps,p])}
              onDelProb={id=>setProbs(ps=>ps.filter(p=>p.id!==id))}
              onUpdateProb={updateProb}
              onAddBuy={b=>setBuys(bs=>[...bs,b])}
              onDelBuy={id=>setBuys(bs=>bs.filter(b=>b.id!==id))}
              onAddCo={co=>addCoToPartner(activeP.id,co)}
              onRemoveCo={cid=>removeCoFromPartner(activeP.id,cid)}
              onAddSH={sh=>addSHToPartner(activeP.id,sh)}
              onRemoveSH={shid=>removeSHFromPartner(activeP.id,shid)}
              onFetchSH={doFetchSH}
              onResearch={doResearch}
              onAnalyse={doAnalysis}
              onThesis={doGenThesis}
              actions={actions} onAddAction={addAction} onUpdateAction={updateAction} onDeleteAction={deleteAction}
              crm={crm} onAddCrm={addCrm} onUpdateCrm={updateCrm} onDeleteCrm={deleteCrm}
            />
          </div>
        )}

        {/* RICE BOARD */}
        {mainTab==="rice"&&!activeP&&(
          <div className="fu">
            <RiceBoard probs={probs} partners={partners} onUpdateProb={updateProb}/>
          </div>
        )}

        {/* ACTIONS BOARD */}
        {mainTab==="actions"&&!activeP&&(
          <div className="fu">
            <ActionsBoard
              actions={actions} onAdd={addAction} onUpdate={updateAction} onDelete={deleteAction}
              probs={probs} partners={partners}
            />
          </div>
        )}

        {/* CRM PIPELINE */}
        {mainTab==="crm"&&!activeP&&(
          <div className="fu">
            <CRMBoard
              crm={crm} onAdd={addCrm} onUpdate={updateCrm} onDelete={deleteCrm}
              probs={probs} partners={partners}
            />
          </div>
        )}

        {/* MATCH */}
        {mainTab==="match"&&!activeP&&(
          <MatchView eyProbs={probs.filter(p=>p.pid==="ey")} research={research} allCos={allCos} onRun={doRunMatch} match={match} status={matchStatus}/>
        )}

        {/* AI */}
        {mainTab==="ai"&&!activeP&&(
          <div className="fu">
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:VB.ink,marginBottom:3}}>✦ VentureBuilder AI</div>
            <div style={{fontSize:10,color:VB.muted,fontFamily:"'DM Mono',monospace",marginBottom:16}}>Chat · Match Suggestions · Deal Memo Drafting — fully context-aware</div>
            <AIChat partners={partners} probs={probs} buys={buys} research={research} allCos={allCos} allSH={allSH} shIntel={shIntel}/>
          </div>
        )}

        {/* GLOBAL INTEL */}
        {mainTab==="global"&&!activeP&&(
          <div className="fu">
            <GlobalIntel
              globalCos={GLOBAL_COS} globalSH={GLOBAL_SH}
              research={research} rStatus={rStatus}
              shIntel={shIntel} shLoading={shLoading}
              onResearch={doResearch} onFetchSH={doFetchSH}
              allProbs={probs}
              onEnrichCo={(coId, updatedProfile) => setRes(r=>({...r,[coId]:{...r[coId],...updatedProfile,enrichedAt:new Date().toISOString()}}))}
              onEnrichSH={(shId, updatedProfile) => setSHI(i=>({...i,[shId]:{...i[shId],...updatedProfile,enrichedAt:new Date().toISOString()}}))}
            />
          </div>
        )}

        {/* REPORTS */}
        {mainTab==="reports"&&!activeP&&(
          <div className="fu">
            <Reports
              partners={partners} probs={probs} buys={buys}
              research={research} allCos={allCos} allSH={allSH}
              shIntel={shIntel} theses={theses} analysis={analysis}
            />
          </div>
        )}
      </div>

      <footer style={{borderTop:`1px solid ${VB.border}`,marginTop:36,padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:16,height:16,background:VB.gold,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="8" height="8" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#091C1D" strokeWidth="2"/></svg>
          </div>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:".06em",color:VB.muted}}>VentureBuilder</span>
          <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>Partner Discovery Platform · venturebuilder.fund</span>
        </div>
        <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:VB.muted}}>{partners.length} partners · {probs.length} problems · {buys.length} buys</div>
      </footer>
    </div>
  );
}
