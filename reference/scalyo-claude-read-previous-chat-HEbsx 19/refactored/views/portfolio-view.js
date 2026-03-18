/**
 * Scalyo - PortfolioView
 * Extracted from app.html (lines 4955-5552)
 */

import { T } from '../shared/i18n-wrapper.js';

// Simple UI components
const Avatar = ({ name }) => React.createElement("div", {
  style: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: C.teal,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700
  }
}, (name || "?").charAt(0).toUpperCase());

const RiskPill = ({ risk, lang }) => React.createElement("span", {
  style: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    background: riskColor(risk) + "22",
    color: riskColor(risk),
    border: `1px solid ${riskColor(risk)}44`
  }
}, riskLabel(risk, lang));

const EmptyState = ({ icon, title, desc, action }) => React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    textAlign: "center"
  }
},
  React.createElement("div", { style: { fontSize: 48, marginBottom: 16 } }, icon),
  React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, marginBottom: 8 } }, title),
  React.createElement("p", { style: { color: C.muted, marginBottom: 20 } }, desc),
  action
);

const AccountDetailPanel = ({ account, onClose }) => React.createElement("div", {
  style: {
    position: "fixed",
    right: 0,
    top: 0,
    bottom: 0,
    width: 400,
    background: C.bg1,
    borderLeft: `1px solid ${C.border}`,
    padding: 20,
    overflowY: "auto",
    zIndex: 100
  }
},
  React.createElement("button", { onClick: onClose, style: { marginBottom: 16 } }, "← Close"),
  React.createElement("h2", null, account?.name || "Account Details")
);

const AddAccountModal = ({ onClose }) => React.createElement("div", {
  onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
  style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }
},
  React.createElement("div", {
    style: {
      background: C.bg1,
      borderRadius: 12,
      padding: 30,
      maxWidth: 500,
      width: "90%"
    }
  },
    React.createElement("h2", { style: { marginBottom: 20 } }, "Add Account"),
    React.createElement("button", { onClick: onClose }, "Close")
  )
);

const ImportModal = ({ onClose }) => React.createElement("div", {
  onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
  style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }
},
  React.createElement("div", {
    style: {
      background: C.bg1,
      borderRadius: 12,
      padding: 30,
      maxWidth: 500,
      width: "90%"
    }
  },
    React.createElement("h2", { style: { marginBottom: 20 } }, "Import Accounts"),
    React.createElement("button", { onClick: onClose }, "Close")
  )
);

const PortfolioView = ({
  accounts,
  companyId,
  onRefresh,
  role,
  lang="fr",
  currency="EUR",
  session,
  plan="Starter"
}) => {
  const MAX_ACCOUNTS = plan === "Starter" ? 5 : Infinity;
  const atLimit = plan === "Starter" && accounts.length >= MAX_ACCOUNTS;
  const [selected, setSelected] = React.useState(null);
  const [filter, _setFilter] = React.useState(() => { try { return localStorage.getItem("scalyo_pf_filter") || "all"; } catch(e) { return "all"; } });
  const setFilter = (v) => { _setFilter(v); try { localStorage.setItem("scalyo_pf_filter", v); } catch(e) {} };
  const [search, _setSearch] = React.useState(() => { try { return localStorage.getItem("scalyo_pf_search") || ""; } catch(e) { return ""; } });
  const setSearch = (v) => { _setSearch(v); try { localStorage.setItem("scalyo_pf_search", v); } catch(e) {} };
  const [csmFilter, _setCsmFilter] = React.useState(() => { try { return localStorage.getItem("scalyo_pf_csm") || "all"; } catch(e) { return "all"; } });
  const setCsmFilter = (v) => { _setCsmFilter(v); try { localStorage.setItem("scalyo_pf_csm", v); } catch(e) {} };
  const csms = ["all",...[...new Set(accounts.map(a=>a.csm).filter(Boolean))].sort()];
  const [showImport, setShowImport] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const [importMsg, setImportMsg] = React.useState("");
  const sel = selected !== null ? accounts.find(a => a.id === selected) : null;
  const filtered = accounts.filter(a => {
    const matchFilter = filter === "all" || a.risk === filter;
    const matchCsm = csmFilter === "all" || a.csm === csmFilter;
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.csm?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchCsm && matchSearch;
  });
  const counts = {
    all: accounts.length,
    critical: accounts.filter(a => a.risk === "critical").length,
    medium: accounts.filter(a => a.risk === "medium").length,
    low: accounts.filter(a => a.risk === "low").length
  };
  const handleImportDone = (total, ok) => {
    setShowImport(false);
    setImportMsg(lang==="en"?`✅ ${ok}/${total} accounts imported successfully`:lang==="kr"?`✅ ${ok}/${total}개 계정 가져오기 완료`:`✅ ${ok}/${total} comptes importés avec succès`);
    onRefresh();
    setTimeout(() => setImportMsg(""), 5000);
  };
  const handleDelete = async id => {
    if (!window.confirm(lang==="en" ? "Remove this account from portfolio?" : lang==="kr" ? "이 계정을 포트폴리오에서 삭제할까요?" : T("confirmDelete",lang))) return;
    const { error } = await db.from("accounts").delete().eq("id", id);
    if (error) { alert(lang==="en" ? "Delete failed: " + error.message : lang==="kr" ? "삭제 실패: " + error.message : "Suppression echouee : " + error.message); return; }
    // FIX BUG-03 : nettoyer les todos orphelins (Supabase + localStorage)
    // FIX BUG-07b : try/catch pour éviter état incohérent silencieux
    try { await TodoDB.remove(companyId, id); } catch(e) { console.warn("TodoDB.remove failed:", e); }
    if (selected === id) setSelected(null);
    onRefresh();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      display: "flex",
      height: "100%",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: sel ? 340 : undefined,
      flex: sel ? undefined : 1,
      borderRight: `1px solid ${C.border}`,
      overflow: "auto",
      padding: "20px 16px",
      flexShrink: 0,
      minWidth: 290
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      fontWeight: 900,
      letterSpacing: "-0.5px"
    }
  }, lang==="en" ? "💼 Portfolio" : lang==="kr" ? "💼 포트폴리오" : "💼 Portefeuille"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => { if(atLimit){ alert(lang==="en"?"Your Starter plan allows up to 5 accounts. Upgrade to Growth to add more.":lang==="kr"?"Starter 플랜은 최대 5개 계정을 지원합니다. Growth로 업그레이드하세요.":"Votre plan Starter est limité à 5 comptes. Passez au plan Growth pour en ajouter davantage."); return; } setShowAdd(true); },
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "6px 13px",
      borderRadius: 20,
      background: C.greenBg,
      border: `1px solid ${C.greenBorder}`,
      color: C.green
    }
  }, lang==="en"?"+ Add":lang==="kr"?"+ 추가":"+ Ajouter"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowImport(true),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "6px 13px",
      borderRadius: 20,
      background: C.tealBg,
      border: `1px solid ${C.tealBorder}`,
      color: C.teal
    }
  }, "\u2B06 "+(lang==="kr"?"가져오기":T("import",lang))))), importMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10,
      padding: "9px 12px",
      background: C.greenBg,
      border: `1px solid ${C.greenBorder}`,
      borderRadius: 9,
      fontSize: 12,
      color: C.green
    }
  }, importMsg), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: lang==="en" ? "🔍 Search account or CSM..." : lang==="kr" ? "🔍 계정 또는 CSM 검색..." : T("searchAccount",lang),
    style: {
      width: "100%",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "9px 12px",
      color: C.text,
      fontSize: 13,
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, lang==="en"?[["all","All"],["critical","Critical"],["medium","Watch"],["low","Healthy"]]:lang==="kr"?[["all","전체"],["critical","위험"],["medium","주의"],["low","정상"]]:[["all",T("all",lang)],["critical","Critiques"],["medium","Vigilance"],["low","Sains"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setFilter(v),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "4px 11px",
      borderRadius: 20,
      background: filter === v ? C.tealBg : C.surface,
      border: `1px solid ${filter === v ? C.tealBorder : C.border}`,
      color: filter === v ? C.teal : C.muted
    }
  }, l, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 3,
      opacity: .7
    }
  }, counts[v])))),
  /* CSM filter dropdown */
  csms.length > 2 && /*#__PURE__*/React.createElement("div", { style: { marginBottom: 12, display: "flex", alignItems: "center", gap: 8 } },
    /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: C.muted, fontWeight: 700 } }, T("csmFilterLabel", lang) + ":"),
    /*#__PURE__*/React.createElement("select", {
      value: csmFilter,
      onChange: e => setCsmFilter(e.target.value),
      style: {
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "5px 10px", color: C.text, fontSize: 12, cursor: "pointer"
      }
    }, csms.map(c => /*#__PURE__*/React.createElement("option", { key: c, value: c },
      c === "all" ? (lang==="en" ? "All CSMs" : lang==="kr" ? "모든 CSM" : T("allCsm", lang)) : c
    )))
  ),
  filtered.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "\uD83D\uDCED",
    title: lang==="en" ? "No accounts" : lang==="kr" ? "계정 없음" : T("noAccount",lang),
    desc: accounts.length === 0 ? (lang==="en" ? "Add or import your portfolio." : lang==="kr" ? "포트폴리오를 추가하거나 가져오세요." : T("portfolioEmpty",lang)) : (lang==="en" ? "No matching accounts." : lang==="kr" ? "일치하는 계정이 없습니다." : T("noAccountMatch",lang)),
    action: lang==="en" ? "+ Add account" : lang==="kr" ? "+ 계정 추가" : T("addAccount",lang),
    onAction: () => setShowAdd(true)
  }) : filtered.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "row-item",
    onClick: () => setSelected(selected === a.id ? null : a.id),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 10px",
      borderRadius: 11,
      marginBottom: 4,
      background: selected === a.id ? C.tealBg : undefined,
      border: `1px solid ${selected === a.id ? C.tealBorder : "transparent"}`,
      transition: "all .12s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: a.name,
    size: 34,
    color: riskColor(a.risk)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, a.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, a.csm || (lang==="en"?"Unassigned":(lang==="en" ? "Unassigned" : lang==="kr" ? "미배정" : T("unassigned",lang))), " \xB7 ", fmtMRR(a.mrr || 0, currency)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 4,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(RiskPill, {
    r: a.risk,
    lang: lang
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted
    }
  }, lang==="kr"?"점수 ":"Score ", a.health || 70))))), sel && /*#__PURE__*/React.createElement(AccountDetailPanel, {
    account: sel,
    lang: lang,
    currency: currency,
    companyId: companyId,
    onClose: () => setSelected(null),
    onDelete: handleDelete,
    onEdit: () => {
      onRefresh();
      setSelected(null);
    }
  }), showImport && /*#__PURE__*/React.createElement(ImportModal, {
    onClose: () => setShowImport(false),
    onImport: handleImportDone,
    companyId: companyId
  }), showAdd && /*#__PURE__*/React.createElement(AddAccountModal, {
    onClose: () => setShowAdd(false),
    companyId: companyId,
    lang: lang,
    onAdd: () => {
      setShowAdd(false);
      onRefresh();
    }
  }));
};

// ROADMAP VIEW
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// ROADMAP VIEW v5 — 90J structurée par phases + guidance
// ══════════════════════════════════════════════════

const getRoadmapTemplate = (lang) => [{
  id: "r01",
  phase: 1,
  label: lang==="en" ? T("goalP1",lang) : lang==="kr" ? "100% 계정 매핑 및 헬스 스코어 측정" : T("goalP1",lang),
  done: false,
  due: "J1-J10",
  prio: "high"
}, {
  id: "r02",
  phase: 1,
  label: lang==="en" ? "Identify the 3 critical-risk accounts and open a remediation plan" : lang==="kr" ? "3개의 위험 계정을 파악하고 개선 계획 수립" : "Identifier les 3 comptes à risque critique et ouvrir un plan de remédiation",
  done: false,
  due: "J1-J10",
  prio: "high"
}, {
  id: "r03",
  phase: 1,
  label: lang==="en" ? "Set team KPIs and quarterly objectives" : lang==="kr" ? "팀 KPI 및 분기 목표 설정" : T("goalP3",lang),
  done: false,
  due: "J1-J15",
  prio: "high"
}, {
  id: "r04",
  phase: 1,
  label: lang==="en" ? "Build a standard onboarding playbook" : lang==="kr" ? "표준 온보딩 플레이북 구축" : T("goalP9",lang),
  done: false,
  due: "J10-J20",
  prio: "medium"
}, {
  id: "r05",
  phase: 1,
  label: lang==="en" ? "Set up weekly check-ins for each CSM" : lang==="kr" ? "각 CSM에 주간 체크인 설정" : T("goalP10",lang),
  done: false,
  due: "J7-J14",
  prio: "medium"
}, {
  id: "r06",
  phase: 2,
  label: lang==="en" ? "Launch QBRs for the 5 highest-ARR accounts" : lang==="kr" ? "ARR 상위 5개 계정에 QBR 시작" : T("goalP4",lang),
  done: false,
  due: "J30-J45",
  prio: "high"
}, {
  id: "r07",
  phase: 2,
  label: lang==="en" ? "Create a shared CS team dashboard" : lang==="kr" ? "CS팀 공유 대시보드 생성" : T("goalP5",lang),
  done: false,
  due: "J30-J40",
  prio: "medium"
}, {
  id: "r08",
  phase: 2,
  label: lang==="en" ? "Identify 3 expansion opportunities in the portfolio" : lang==="kr" ? "포트폴리오에서 3개의 확장 기회 파악" : T("goalP2",lang),
  done: false,
  due: "J40-J60",
  prio: "medium"
}, {
  id: "r09",
  phase: 2,
  label: lang==="en" ? "Train the team on managing difficult accounts" : lang==="kr" ? "어려운 계정 관리에 대한 팀 교육" : T("goalP6",lang),
  done: false,
  due: "J45-J60",
  prio: "low"
}, {
  id: "r10",
  phase: 3,
  label: lang==="en" ? "Measure NPS and close the loop with detractors" : lang==="kr" ? "NPS 측정 및 비추천 고객과의 루프 마무리" : T("goalP7",lang),
  done: false,
  due: "J60-J75",
  prio: "high"
}, {
  id: "r11",
  phase: 3,
  label: lang==="en" ? "Present quarterly results to leadership" : lang==="kr" ? "경영진에게 분기 결과 발표" : T("goalP8",lang),
  done: false,
  due: "J80-J90",
  prio: "high"
}, {
  id: "r12",
  phase: 3,
  label: lang==="en" ? "Prepare next quarter renewals (D-90)" : lang==="kr" ? "다음 분기 갱신 준비 (D-90)" : "Préparer les renouvellements du prochain trimestre (J−90)",
  done: false,
  due: "J75-J90",
  prio: "medium"
}];
const PRIO_COLORS = {
  high: C => C.red,
  medium: C => C.amber,
  low: C => C.green
};
const getPrioLabelsFR = (lang) => ({ high: T("priorityHigh",lang), medium: T("priorityMed",lang), low: T("priorityLow",lang) });
const PRIO_LABELS_EN = { high: "High priority", medium: "Medium priority", low: "Low priority" };
const PRIO_LABELS_KR = { high: "높은 우선순위", medium: "보통 우선순위", low: "낮은 우선순위" };
const PRIO_LABELS = (lang) => lang==="en" ? PRIO_LABELS_EN : lang==="kr" ? PRIO_LABELS_KR : getPrioLabelsFR(lang);
// ══════════════════════════════════════════════════
// TASK BOARD — Matrice Eisenhower + Kanban flexible
// ══════════════════════════════════════════════════

const TASK_COLORS = [
  {id:"red",   hex:"#EF4444", label:"🔴 Critique",  labelEn:"🔴 Critical",   labelKr:"🔴 긴급"},
  {id:"orange",hex:"#F97316", label:"🟠 Prioritaire",labelEn:"🟠 Priority",  labelKr:"🟠 우선"},
  {id:"yellow",hex:"#EAB308", label:"🟡 À planifier",labelEn:"🟡 Plan it",   labelKr:"🟡 계획"},
  {id:"teal",  hex:"#4DB6A0", label:"🟢 En cours",  labelEn:"🟢 Ongoing",    labelKr:"🟢 진행 중"},
  {id:"blue",  hex:"#3B82F6", label:"🔵 Réflexion", labelEn:"🔵 Thinking",   labelKr:"🔵 검토 중"},
  {id:"purple",hex:"#9B6BDF", label:"🟣 Déléguer",  labelEn:"🟣 Delegate",   labelKr:"🟣 위임"},
];

const QUAD = {
  q1:{
    id:"q1",icon:"🔥",
    label:"Faire maintenant",labelEn:"Do it now",labelKr:"지금 당장",
    sub:"Urgent + Important",subEn:"Urgent + Important",subKr:"긴급 + 중요",
    bg:"rgba(239,68,68,0.06)",border:"rgba(239,68,68,0.2)",accent:"#EF4444"
  },
  q2:{
    id:"q2",icon:"🎯",
    label:"Planifier",labelEn:"Schedule it",labelKr:"계획하기",
    sub:"Important + Pas urgent",subEn:"Important + Not urgent",subKr:"중요 + 긴급하지 않음",
    bg:"rgba(59,130,246,0.06)",border:"rgba(59,130,246,0.2)",accent:"#3B82F6"
  },
  q3:{
    id:"q3",icon:"📤",
    label:"Déléguer",labelEn:"Delegate",labelKr:"위임하기",
    sub:"Urgent + Pas important",subEn:"Urgent + Not important",subKr:"긴급 + 중요하지 않음",
    bg:"rgba(245,158,11,0.06)",border:"rgba(245,158,11,0.2)",accent:"#E8A838"
  },
  q4:{
    id:"q4",icon:"🗑️",
    label:"Éliminer",labelEn:"Drop it",labelKr:"제거하기",
    sub:"Ni urgent ni important",subEn:"Neither urgent nor important",subKr:"긴급하지도 중요하지도 않음",
    bg:"rgba(100,116,139,0.06)",border:"rgba(100,116,139,0.18)",accent:"#64748B"
  }
};

const getTasksFromLS = ()=>{
  try{
    const raw=localStorage.getItem("scalyo_tasks");
    return raw?JSON.parse(raw):[];
  }catch(e){return [];}
};
const saveTasksToLS = tasks=>{
  try{localStorage.setItem("scalyo_tasks",JSON.stringify(tasks));}catch(e){}
};

const TaskCard = ({task, lang, onMove, onDelete, onToggle, onEdit, quadCount})=>{
  const col = TASK_COLORS.find(c=>c.id===task.color)||TASK_COLORS[0];
  const [hover,setHover]=React.useState(false);
  const quads=Object.keys(QUAD).filter(q=>q!==task.quadrant);
  const isOverdue = task.dueDate && new Date(task.dueDate)<new Date() && !task.done;
  return React.createElement("div",{
    style:{
      background:hover?C.surfaceHi:C.surface,
      border:`1px solid ${hover?col.hex+"55":C.border}`,
      borderLeft:`3px solid ${col.hex}`,
      borderRadius:6,padding:"11px 13px",marginBottom:8,
      transition:"all .15s ease",cursor:"pointer",position:"relative",
      opacity:task.done?0.55:1
    },
    onMouseEnter:()=>setHover(true),
    onMouseLeave:()=>setHover(false)
  },
    React.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:8}},
      React.createElement("div",{
        onClick:()=>onToggle(task.id),
        style:{
          width:16,height:16,borderRadius:4,flexShrink:0,marginTop:2,cursor:"pointer",
          border:`2px solid ${task.done?col.hex:C.border}`,
          background:task.done?col.hex:"transparent",
          display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"
        }
      }, task.done&&React.createElement("span",{style:{fontSize:9,color:"#fff"}},"✓")),
      React.createElement("div",{style:{flex:1,minWidth:0}},
        React.createElement("div",{style:{
          fontSize:13,fontWeight:task.done?400:600,
          color:task.done?C.muted:C.text,
          textDecoration:task.done?"line-through":"none",
          marginBottom:task.note?3:0,
          wordBreak:"break-word"
        }},task.title),
        task.note&&React.createElement("div",{style:{fontSize:11,color:C.muted,lineHeight:1.4}},task.note)
      )
    ),
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,gap:6}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},
        React.createElement("span",{style:{
          fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:6,
          background:col.hex+"22",color:col.hex
        }},lang==="en"?col.labelEn:lang==="kr"?(col.labelKr||col.label):col.label),
        isOverdue&&React.createElement("span",{style:{
          fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:6,
          background:"rgba(239,68,68,0.12)",color:"#EF4444"
        }},T("overdue",lang)),
        task.dueDate&&!isOverdue&&React.createElement("span",{style:{fontSize:10,color:C.muted}},
          new Date(task.dueDate).toLocaleDateString(T("locale",lang),{month:"short",day:"numeric"})
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:4}},
        React.createElement("button",{
          onClick:e=>{e.stopPropagation();onEdit(task);},
          style:{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.muted,padding:"2px 4px",borderRadius:4,transition:"color .12s"},
          title:T("edit",lang),
          onMouseEnter:e=>e.target.style.color=C.teal,
          onMouseLeave:e=>e.target.style.color=C.muted
        },"✏️"),
        React.createElement("button",{
          onClick:e=>{e.stopPropagation();onDelete(task.id);},
          style:{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.muted,padding:"2px 4px",borderRadius:4,transition:"color .12s"},
          title:T("delete",lang),
          onMouseEnter:e=>e.target.style.color=C.red,
          onMouseLeave:e=>e.target.style.color=C.muted
        },"🗑"),
        React.createElement("select",{
          onChange:e=>{if(e.target.value)onMove(task.id,e.target.value);},
          value:"",
          style:{
            fontSize:10,border:`1px solid ${C.border}`,borderRadius:6,
            background:C.bg2,color:C.muted,padding:"2px 4px",cursor:"pointer"
          },
          title:T("moveTask",lang),
          onClick:e=>e.stopPropagation()
        },
          React.createElement("option",{value:""},T("moveBtn",lang)),
          quads.map(q=>React.createElement("option",{key:q,value:q},QUAD[q].icon+" "+(lang==="en"?QUAD[q].labelEn:lang==="kr"?QUAD[q].labelKr||QUAD[q].label:QUAD[q].label)))
        )
      )
    )
  );
};

const AddTaskModal = ({onClose,onAdd,lang,editTask,accounts=[]})=>{
  const [title,setTitle]=React.useState(editTask?.title||"");
  const [note,setNote]=React.useState(editTask?.note||"");
  const [color,setColor]=React.useState(editTask?.color||"teal");
  const [quadrant,setQuadrant]=React.useState(editTask?.quadrant||"q1");
  const [dueDate,setDueDate]=React.useState(editTask?.dueDate||"");
  const [account,setAccount]=React.useState(editTask?.account||"");
  const isEdit=!!editTask;
  const inputStyle={
    width:"100%",background:C.bg2,border:`1px solid ${C.border}`,
    borderRadius:6,padding:"10px 13px",color:C.text,fontSize:13,marginBottom:12
  };
  return React.createElement("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose();}},
    React.createElement("div",{className:"modal-box",style:{maxWidth:480,padding:28}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("h3",{style:{fontSize:16,fontWeight:800}},isEdit?(T("editTask",lang)):(T("newTask",lang))),
        React.createElement("button",{onClick:onClose,style:{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.muted}},"×")
      ),
      React.createElement("input",{
        value:title,onChange:e=>setTitle(e.target.value),
        placeholder:T("taskTitle",lang),
        style:{...inputStyle,fontWeight:600,fontSize:14}
      }),
      React.createElement("textarea",{
        value:note,onChange:e=>setNote(e.target.value),
        placeholder:T("taskNote",lang),
        rows:2,style:{...inputStyle,resize:"vertical"}
      }),
      React.createElement("div",{style:{marginBottom:14}},
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}},T("taskColor",lang)),
        React.createElement("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
          TASK_COLORS.map(col=>React.createElement("button",{
            key:col.id,
            onClick:()=>setColor(col.id),
            style:{
              padding:"5px 11px",borderRadius:16,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
              background:color===col.id?col.hex+"33":"transparent",
              color:color===col.id?col.hex:C.muted,
              border:`1.5px solid ${color===col.id?col.hex:C.border}`,
              transition:"all .12s"
            }
          },lang==="en"?col.labelEn:lang==="kr"?(col.labelKr||col.label):col.label))
        )
      ),
      React.createElement("div",{style:{marginBottom:14}},
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}},T("taskQuadrant",lang)),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}},
          Object.values(QUAD).map(q=>React.createElement("button",{
            key:q.id,
            onClick:()=>setQuadrant(q.id),
            style:{
              padding:"8px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",
              border:`1.5px solid ${quadrant===q.id?q.accent:C.border}`,
              background:quadrant===q.id?q.bg:"transparent",
              color:quadrant===q.id?q.accent:C.muted,
              textAlign:"left",transition:"all .12s",lineHeight:1.3
            }
          },
            q.icon+" "+(lang==="en"?q.labelEn:lang==="kr"?q.labelKr||q.label:q.label),
            React.createElement("div",{style:{fontSize:9,opacity:.7}},(lang==="en"?q.subEn:lang==="kr"?q.subKr||q.subEn:q.sub))
          ))
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:10,marginBottom:16}},
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5}},T("taskDue",lang)),
          React.createElement("input",{type:"date",value:dueDate,onChange:e=>setDueDate(e.target.value),style:{...inputStyle,marginBottom:0}})
        ),
        accounts.length>0&&React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5}},(T("taskAccount",lang))),
          React.createElement("select",{value:account,onChange:e=>setAccount(e.target.value),style:{...inputStyle,marginBottom:0}},
            React.createElement("option",{value:""},T("taskNone",lang)),
            accounts.map(a=>React.createElement("option",{key:a.id,value:a.name},a.name))
          )
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement("button",{
          onClick:onClose,
          style:{flex:1,padding:"12px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,color:C.muted,fontSize:13,cursor:"pointer",fontWeight:600}
        },T("cancel",lang)),
        React.createElement("button",{
          disabled:!title.trim(),
          onClick:()=>{
            if(!title.trim())return;
            onAdd({id:editTask?.id||Date.now().toString(),title:title.trim(),note:note.trim(),color,quadrant,dueDate,account,done:editTask?.done||false,createdAt:editTask?.createdAt||new Date().toISOString()});
            onClose();
          },
          style:{
            flex:2,padding:"12px",borderRadius:6,fontSize:13,fontWeight:800,cursor:"pointer",border:"none",
            background:!title.trim()?C.surface:C.teal,
            color:!title.trim()?C.muted:"#FFFFFF",transition:"all .15s"
          }
        },isEdit?(T("update",lang)):(T("taskAdd",lang)))
      )
    )
  );
};



export default PortfolioView;
