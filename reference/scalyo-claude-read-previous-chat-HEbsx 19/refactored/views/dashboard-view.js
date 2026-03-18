/**
 * Scalyo - DashboardView
 * Extracted from app.html (lines 3566-4955)
 */

import { T } from '../shared/i18n-wrapper.js';


const DashboardView = ({
  company: co,
  accounts,
  roadmap: rm,
  wellbeing: wb,
  role,
  lang="fr",
  currency="EUR",
  onNavigate
}) => {
  const items = parseItems(rm?.items);
  const team = parseItems(wb?.team);
  const alerts = parseItems(wb?.alerts);
  const critical = accounts.filter(a => a.risk === "critical");
  const arr_risk = critical.reduce((s, a) => s + (a.mrr || 0) * 12, 0);
  const avgHealth = accounts.length ? Math.round(accounts.reduce((s, a) => s + (a.health || 70), 0) / accounts.length) : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      padding: "26px 30px",
      maxWidth: 1100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      letterSpacing: "-0.6px",
      marginBottom: 5
    }
  }, lang==="en" ? "Overview 👋" : lang==="kr" ? "개요 👋" : "Vue d'ensemble 👋"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 13
    }
  }, co.name, " · ", todayFR(lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: planColor(co.plan)
  }, co.plan), /*#__PURE__*/React.createElement(Tag, {
    color: role === "manager" ? C.purple : C.blue
  }, role === "manager" ? (T("csManager",lang)) : "CSM"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 12,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: T("portfolioARR",lang),
    value: fmtARR(accounts.reduce((s, a) => s + (a.mrr || 0), 0), currency),
    icon: "💰",
    color: C.teal,
    sub: lang==="en"?`${accounts.length} active accounts`:lang==="kr"?`${accounts.length}개 활성 계정`:`${accounts.length} comptes actifs`
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: T("avgHealth",lang),
    value: `${avgHealth}/100`,
    icon: "💚",
    color: avgHealth >= 70 ? C.green : avgHealth >= 40 ? C.amber : C.red,
    sub: avgHealth >= 70 ? (T("healthyPortfolio",lang)) : avgHealth >= 40 ? (T("monitorClosely",lang)) : (T("actionRequired",lang))
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: T("criticalAccounts",lang),
    value: critical.length,
    icon: "🚨",
    color: critical.length === 0 ? C.green : C.red,
    trend: critical.length === 0 ? "up" : "down",
    sub: critical.length > 0 ? `${fmtARR((arr_risk||0)/12, currency)} ARR ${T("atRisk",lang)}` : (T("noRisk",lang))
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Roadmap "+(lang==="en" ? "90D" : lang==="kr" ? "90일" : "90J"),
    value: `${rm?.progress || 0}%`,
    icon: "🗺",
    color: C.teal,
    sub: `${items.filter(i => i.done).length}/${items.length} ${T("steps",lang)}`
  })), critical.length > 0 && /*#__PURE__*/React.createElement(Card, {
    danger: true,
    style: {
      marginBottom: 18,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "🚨"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: C.red
    }
  }, critical.length, " ", lang==="kr"?`계정 위험 상태 — 즉시 조치 필요`:lang==="en"?`account${critical.length>1?"s":""} at critical risk — immediate action required`:critical.length > 1 ? T("dashRiskN",lang) : T("dashRisk1",lang))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate("portfolio"),
    className: "btn-base",
    style: {
      fontSize: 12,
      padding: "6px 16px",
      borderRadius: 20,
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      color: C.red
    }
  }, T("viewPortfolio",lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, critical.slice(0, 3).map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(235,87,87,0.06)",
      borderRadius: 12,
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: a.name,
    size: 32,
    color: C.red
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, a.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, Array.isArray(a.issues) && a.issues[0] ? a.issues[0] : lang==="en" ? "Account in critical situation" : lang==="kr" ? "위기 상황 계정" : "Compte en situation critique"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: C.red
    }
  }, fmtARR(a.mrr || 0, currency)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, lang==="en" ? "Renewal " : lang==="kr" ? "갱신 " : "Renouvellement ", a.renewal || "N/A")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    glow: true,
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      marginBottom: 2
    }
  }, lang==="en" ? "🗺️ 90-Day Roadmap" : lang==="kr" ? "🗺️ 90일 로드맵" : "\uD83D\uDDFA Roadmap 90J"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, rm?.phase || "Phase 1")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 900,
      color: C.teal,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, rm?.progress || 0, "%")), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate("tasks"),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "5px 12px",
      borderRadius: 20,
      background: C.tealBg,
      border: `1px solid ${C.tealBorder}`,
      color: C.teal
    }
  }, lang==="en" ? "Manage →" : lang==="kr" ? "관리 →" : "G\xE9rer \u2192"))), /*#__PURE__*/React.createElement(HealthBar, {
    val: rm?.progress || 0
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, items.slice(0, 4).map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: item.id || i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 11px",
      borderRadius: 9,
      background: C.surface
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      flexShrink: 0
    }
  }, item.done ? "✅" : "⬜"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      flex: 1,
      color: item.done ? C.muted : C.text,
      textDecoration: item.done ? "line-through" : "none"
    }
  }, item.label), !item.done && item.due === "Urgent" && /*#__PURE__*/React.createElement(Tag, {
    color: C.red,
    size: "xs"
  }, "Urgent"))), items.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted,
      textAlign: "center",
      padding: 8
    }
  }, T("dashNoSteps",lang)))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15
    }
  }, lang==="en" ? "💚 Team Wellbeing" : lang==="kr" ? "💚 팀 웰빙" : T("dashWellbeing",lang)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate("wellbeing"),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "5px 12px",
      borderRadius: 20,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted
    }
  }, lang==="kr"?"상세 →":lang==="en"?"Detail →":"Détail →")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      background: C.surface,
      borderRadius: 11,
      padding: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 900,
      fontFamily: "'JetBrains Mono',monospace",
      color: (wb?.score || 70) >= 70 ? C.green : (wb?.score || 70) >= 50 ? C.amber : C.red
    }
  }, wb?.score || 70), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginTop: 2
    }
  }, lang==="kr"?"점수 /100":"Score /100")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      background: C.surface,
      borderRadius: 11,
      padding: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: {
        low: C.green,
        moderate: C.amber,
        high: C.red
      }[wb?.burnout || "moderate"]
    }
  }, {
    low: lang==="en" ? "Low 🟢" : lang==="kr" ? "낮음 🟢" : "Faible 🟢",
    moderate: lang==="en" ? "Moderate 🟡" : lang==="kr" ? "보통 🟡" : T("dashRiskMod",lang),
    high: lang==="en" ? "High 🔴" : lang==="kr" ? "높음 🔴" : T("dashRiskHigh",lang)
  }[wb?.burnout || "moderate"]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginTop: 2
    }
  }, lang==="en" ? "Burnout Risk" : lang==="kr" ? "번아웃 위험" : "Risque burnout"))), team.slice(0, 3).map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: m.name || "?",
    size: 28,
    color: (m.charge || 70) > 85 ? C.red : (m.charge || 70) > 70 ? C.amber : C.teal
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: 120
    }
  }, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: (m.charge || 70) > 85 ? C.red : (m.charge || 70) > 70 ? C.amber : C.green,
      flexShrink: 0
    }
  }, m.charge || 70, "%")), /*#__PURE__*/React.createElement(HealthBar, {
    val: 100 - (m.charge || 70),
    size: "sm"
  })))), team.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: C.muted,
      textAlign: "center",
      padding: "8px 0"
    }
  }, lang==="en" ? "No team members" : lang==="kr" ? "팀 구성원 없음" : "Aucun membre d''\xE9quipe"))),
  role === "manager" && accounts.length > 0 && (() => {
    const csmsTeam = [...new Set(accounts.map(a=>a.csm).filter(Boolean))];
    if (csmsTeam.length < 2) return null;
    const csmStats = csmsTeam.map(csm => {
      const acc = accounts.filter(a=>a.csm===csm);
      const arr = acc.reduce((s,a)=>s+(a.mrr||0)*12,0);
      const health = Math.round(acc.reduce((s,a)=>s+(a.health||70),0)/acc.length);
      const crit = acc.filter(a=>a.risk==='critical').length;
      return {csm, count:acc.length, arr, health, crit};
    });
    return /*#__PURE__*/React.createElement("div",{style:{marginTop:20}},
      /*#__PURE__*/React.createElement("h3",{style:{fontSize:15,fontWeight:800,marginBottom:12,letterSpacing:"-0.3px"}},
        lang==="en" ? "👥 CSM team view" : lang==="kr" ? "👥 CSM 팀 보기" : T("dashTeamView",lang)
      ),
      /*#__PURE__*/React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}},
        csmStats.map(s=>/*#__PURE__*/React.createElement("div",{
          key:s.csm,
          style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"14px 16px"}
        },
          /*#__PURE__*/React.createElement("div",{style:{fontWeight:800,fontSize:13,marginBottom:8,color:C.text}},s.csm),
          /*#__PURE__*/React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5}},
            /*#__PURE__*/React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12}},
              /*#__PURE__*/React.createElement("span",{style:{color:C.muted}},lang==="en" ? "💼 Accounts" : lang==="kr" ? "💼 계정" : "💼 Comptes"),
              /*#__PURE__*/React.createElement("span",{style:{fontWeight:700}},s.count)
            ),
            /*#__PURE__*/React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12}},
              /*#__PURE__*/React.createElement("span",{style:{color:C.muted}},"💰 ARR"),
              /*#__PURE__*/React.createElement("span",{style:{fontWeight:700,color:C.teal}},fmtARR((s.arr||0)/12, currency))
            ),
            /*#__PURE__*/React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12}},
              /*#__PURE__*/React.createElement("span",{style:{color:C.muted}},lang==="kr"?"💚 건강":"💚 Health"),
              /*#__PURE__*/React.createElement("span",{style:{fontWeight:700,color:s.health>=70?C.green:s.health>=40?C.amber:C.red}},`${s.health}/100`)
            ),
            s.crit > 0 && /*#__PURE__*/React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12}},
              /*#__PURE__*/React.createElement("span",{style:{color:C.muted}},lang==="en" ? "🚨 Critical" : lang==="kr" ? "🚨 위험" : "🚨 Critiques"),
              /*#__PURE__*/React.createElement("span",{style:{fontWeight:700,color:C.red}},s.crit)
            )
          )
        ))
      )
    );
  })()
);
};

// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// PORTFOLIO VIEW v5 — portefeuille vivant + actions todo
// ══════════════════════════════════════════════════

// ── AccountTodoPanel : todo list par compte (standard + libre)
const TODO_STANDARD = [{
  id: "call",
  icon: "📞",
  label: lang==="en" ? "Follow-up call" : lang==="kr" ? "후속 통화" : "Appel de suivi"
}, {
  id: "meeting",
  icon: "📅",
  label: lang==="en" ? "Meeting" : lang==="kr" ? "미팅" : "RDV Meeting"
}, {
  id: "email",
  icon: "✉️",
  label: lang==="en" ? "Send email" : lang==="kr" ? "이메일 전송" : "Email à envoyer"
}, {
  id: "qbr",
  icon: "📊",
  label: lang==="en" ? "Prepare QBR" : lang==="kr" ? "QBR 준비" : "Préparer QBR"
}, {
  id: "renewal",
  icon: "🔄",
  label: lang==="en" ? "Renewal follow-up" : lang==="kr" ? "갱신 후속 관리" : "Suivi renouvellement"
}, {
  id: "health",
  icon: "💚",
  label: lang==="kr"?"건강 점수 확인":lang==="en"?"Check health score":"Vérifier le score santé"
}];
const AccountTodoPanel = ({
  account: acc,
  onClose,
  onSave,
  lang="fr",
  companyId=null
}) => {
  const initTodos = () => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem(`scalyo_todos_${acc.id}`) || "[]");
      } catch {
        return [];
      }
    })();
    return saved.length ? saved : TODO_STANDARD.map(t => ({
      ...t,
      done: false,
      date: "",
      note: "",
      custom: false
    }));
  };
  const [todos, setTodos] = useState(initTodos);
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");

  // Chargement Supabase au montage
  useEffect(()=>{
    if(!companyId||!acc?.id) return;
    TodoDB.load(companyId, acc.id).then(saved=>{
      if(saved&&saved.length) setTodos(saved);
    });
  },[companyId, acc?.id]);

  const save = newTodos => {
    setTodos(newTodos);
    TodoDB.save(companyId, acc.id, newTodos);
    if (onSave) onSave(newTodos);
  };
  const toggle = id => save(todos.map(t => t.id === id ? {
    ...t,
    done: !t.done
  } : t));
  const updateDate = (id, v) => save(todos.map(t => t.id === id ? {
    ...t,
    date: v
  } : t));
  const updateNote = (id, v) => save(todos.map(t => t.id === id ? {
    ...t,
    note: v
  } : t));
  const removeTodo = id => save(todos.filter(t => t.id !== id));
  const addCustom = () => {
    if (!newTask.trim()) return;
    const t = {
      id: `c${Date.now()}`,
      icon: "✏️",
      label: newTask.trim(),
      done: false,
      date: newDate,
      note: "",
      custom: true
    };
    save([...todos, t]);
    setNewTask("");
    setNewDate("");
  };
  const done = todos.filter(t => t.done).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 900,
      fontSize: 16
    }
  }, acc.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, done, "/", todos.length, lang==="en" ? " tasks · " : lang==="kr" ? " 업무 · " : " t\xE2ches \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: riskColor(acc.risk)
    }
  }, riskLabel(acc.risk, lang)))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 20,
      cursor: "pointer",
      padding: 4
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: ".08em",
      marginBottom: 8
    }
  }, lang==="kr"?"기본 액션":lang==="en"?"Standard actions":"Actions standard"), todos.filter(t => !t.custom).map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      marginBottom: 7,
      background: t.done ? C.greenBg : C.surface,
      border: `1px solid ${t.done ? C.greenBorder : C.border}`,
      borderRadius: 12,
      padding: "10px 12px",
      transition: "all .15s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => toggle(t.id),
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      cursor: "pointer",
      flexShrink: 0,
      background: t.done ? C.green : "transparent",
      border: `2px solid ${t.done ? C.green : C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all .15s"
    }
  }, t.done && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: 900
    }
  }, "\u2713")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      flex: 1,
      color: t.done ? C.muted : C.text,
      textDecoration: t.done ? "line-through" : "none"
    }
  }, t.icon, " ", t.label), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: t.date || "",
    onChange: e => updateDate(t.id, e.target.value),
    style: {
      fontSize: 11,
      background: "transparent",
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: "3px 7px",
      color: t.date ? C.amber : C.faint,
      cursor: "pointer"
    }
  })), /*#__PURE__*/React.createElement("input", {
    value: t.note || "",
    onChange: e => updateNote(t.id, e.target.value),
    placeholder: lang==="kr"?"메모 (상황, 세부사항...)":lang==="en"?"Note (context, details...)":"Note libre (contexte, détail...)",
    style: {
      marginTop: 6,
      width: "100%",
      background: "transparent",
      border: "none",
      borderBottom: `1px solid ${C.border}`,
      padding: "4px 2px",
      color: C.muted,
      fontSize: 12,
      outline: "none"
    }
  })))), todos.filter(t => t.custom).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: ".08em",
      marginBottom: 8
    }
  }, lang==="kr"?"맞춤 업무":lang==="en"?"Custom tasks":"Tâches personnalisées"), todos.filter(t => t.custom).map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      marginBottom: 7,
      background: t.done ? C.greenBg : C.tealBg,
      border: `1px solid ${t.done ? C.greenBorder : C.tealBorder}`,
      borderRadius: 12,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => toggle(t.id),
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      cursor: "pointer",
      flexShrink: 0,
      background: t.done ? C.green : "transparent",
      border: `2px solid ${t.done ? C.green : C.teal}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, t.done && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: 900
    }
  }, "\u2713")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      flex: 1,
      color: t.done ? C.muted : C.text,
      textDecoration: t.done ? "line-through" : "none"
    }
  }, t.icon, " ", t.label), t.date && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.amber
    }
  }, t.date), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeTodo(t.id),
    style: {
      background: "none",
      border: "none",
      color: C.faint,
      cursor: "pointer",
      fontSize: 14,
      lineHeight: 1
    },
    onMouseEnter: e => e.currentTarget.style.color = C.red,
    onMouseLeave: e => e.currentTarget.style.color = C.faint
  }, "\u2715")), /*#__PURE__*/React.createElement("input", {
    value: t.note || "",
    onChange: e => updateNote(t.id, e.target.value),
    placeholder: lang==="kr"?"메모...":lang==="en"?"Note...":"Note...",
    style: {
      marginTop: 6,
      width: "100%",
      background: "transparent",
      border: "none",
      borderBottom: `1px solid ${C.border}`,
      padding: "4px 2px",
      color: C.muted,
      fontSize: 12,
      outline: "none"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: newTask,
    onChange: e => setNewTask(e.target.value),
    onKeyDown: e => e.key === "Enter" && addCustom(),
    placeholder: lang==="en" ? "+ Add a free task..." : lang==="kr" ? "+ 자유 업무 추가..." : T("addFreeTask",lang),
    style: {
      flex: 1,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 9,
      padding: "9px 12px",
      color: C.text,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: newDate,
    onChange: e => setNewDate(e.target.value),
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 9,
      padding: "9px 10px",
      color: C.muted,
      fontSize: 12,
      width: 140
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addCustom,
    className: "btn-base",
    style: {
      padding: "9px 14px",
      borderRadius: 9,
      background: C.teal,
      color: "#FFFFFF",
      fontSize: 13
    }
  }, "+")));
};

// ── AddAccountModal : ajout manuel d'un compte
const AddAccountModal = ({
  onClose,
  onAdd,
  companyId,
  lang="fr"
}) => {
  const DRAFT_KEY = "scalyo_draft_add_account";
  const [form, setForm] = useState(() => {
    try { const d = localStorage.getItem(DRAFT_KEY); if (d) return JSON.parse(d); } catch(e) {}
    return {name:"",csm:"",mrr:"",industry:"",renewal:"",health:"70",risk:"low"};
  });
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch(e) {} }, [form]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = (k, v) => {
    const h = parseInt(k === "health" ? v : form.health) || 70;
    setForm(p => ({
      ...p,
      [k]: v,
      risk: h >= 70 ? "low" : h >= 40 ? "medium" : "critical"
    }));
  };
  const save = async () => {
    if (!form.name.trim()) {
      setErr(T("accountNameRequired",lang));
      return;
    }
    setSaving(true);
    const payload = {
      company_id: companyId,
      name: form.name.trim(),
      csm: form.csm || "",
      mrr: parseFloat(form.mrr) || 0,
      industry: form.industry || "",
      renewal: form.renewal || "",
      health: parseInt(form.health) || 70,
      risk: form.risk,
      usage: 70,
      issues: []
    };
    const {
      error
    } = await db.from("accounts").insert(payload);
    setSaving(false);
    if (error) {
      setErr(T("errUnexpected",lang).replace(T('tryAgain', lang), "") + error.message);
      return;
    }
    try { localStorage.removeItem(DRAFT_KEY); } catch(e) {}
    onAdd();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 28px 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18,
      fontWeight: 900
    }
  }, lang==="en" ? "➕ New account" : lang==="kr" ? "➕ 새 계정" : T("newAccount",lang)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 22,
      cursor: "pointer"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 28px 28px"
    }
  }, err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      borderRadius: 9,
      padding: "9px 12px",
      fontSize: 12,
      color: C.red,
      marginBottom: 12
    }
  }, err), /*#__PURE__*/React.createElement(Field, {
    label: lang==="en" ? "Account name" : lang==="kr" ? "계정명" : T("accNameLabel",lang),
    value: form.name,
    onChange: v => f("name", v),
    placeholder: lang==="kr"?"예: TechPilot SaaS":lang==="en"?"E.g.: TechPilot SaaS":"Ex : TechPilot SaaS",
    required: true,
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: lang==="kr"?"담당 CSM":lang==="en"?"Assigned CSM":"CSM assigné",
    value: form.csm,
    onChange: v => f("csm", v),
    placeholder: lang==="kr"?"이름":lang==="en"?"First Last":"Prénom Nom"
  }), /*#__PURE__*/React.createElement("div", {style:{marginBottom:0}},
    React.createElement("label", {style:{fontSize:11,fontWeight:700,color:C.muted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}},
      lang==="en" ? "Industry" : lang==="kr" ? "산업" : "Secteur"
    ),
    React.createElement("select", {
      value: form.industry,
      onChange: e => f("industry", e.target.value),
      style:{width:"100%",padding:"9px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:form.industry?C.text:C.muted,fontSize:13,cursor:"pointer",outline:"none"}
    },
      React.createElement("option", {value:""}, lang==="en"?"Select...":lang==="kr"?"선택...":"Choisir..."),
      ...(lang==="en"?[
        "SaaS","ERP / Enterprise Software","FinTech","HealthTech","EdTech",
        "Manufacturing / Industry","Retail / E-commerce","Logistics",
        "Professional Services","Real Estate","Media / Content","Other"
      ]:lang==="kr"?[
        "SaaS","ERP / 기업 소프트웨어","핀테크","헬스테크","에듀테크",
        "제조업 / 산업","유통 / 이커머스","물류",
        "전문 서비스","부동산","미디어 / 콘텐츠","기타"
      ]:[
        "SaaS","ERP / Logiciel d'entreprise","FinTech","HealthTech","EdTech",
        "Industrie / Manufacturing","Retail / E-commerce","Logistique",
        "Services Professionnels","Immobilier","Médias / Contenu","Autre"
      ]).map(v=>React.createElement("option",{key:v,value:v},v))
    )
  )), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: `MRR (${(CURRENCIES[currency]||CURRENCIES.EUR).symbol}/${lang==="kr"?"월":lang==="en"?"month":"mois"})`,
    value: form.mrr,
    onChange: v => f("mrr", v),
    placeholder: "3500"
  }), /*#__PURE__*/React.createElement(Field, {
    label: lang==="kr"?"건강 점수 (0-100)":lang==="en"?"Health Score (0-100)":"Health Score (0-100)",
    value: form.health,
    onChange: v => f("health", v),
    placeholder: "70"
  })), /*#__PURE__*/React.createElement(Field, {
    label: lang==="en" ? "Renewal date" : lang==="kr" ? "갱신일" : "Date de renouvellement",
    value: form.renewal,
    onChange: v => f("renewal", v),
    placeholder: lang==="kr"?"D+90, 2025-06-30...":lang==="en"?"D+90, 2025-06-30...":"J+90, 2025-06-30..."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "btn-base",
    style: {
      flex: 1,
      padding: "12px",
      borderRadius: 12,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted,
      fontSize: 13
    }
  }, T("cancel",lang)), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    disabled: saving,
    className: "btn-base",
    style: {
      flex: 2,
      padding: "12px",
      borderRadius: 12,
      fontSize: 13,
      background: C.teal,
      color: "#FFFFFF"
    }
  }, saving ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: 14,
    color: "#FFFFFF"
  }), T("addingAcc",lang)) : (T("createAcc",lang)))))));
};

// ── AccountDetailPanel
const AccountDetailPanel = ({
  account: sel,
  onClose,
  onDelete,
  onEdit,
  lang="fr",
  currency="EUR",
  companyId=null
}) => {
  const [tab, setTab] = useState("overview");
  if (!sel) return null;
  const issues = Array.isArray(sel.issues) ? sel.issues : [];
  return /*#__PURE__*/React.createElement("div", {
    className: "side-panel",
    style: {
      width: 400,
      borderLeft: `1px solid ${C.border}`,
      overflow: "auto",
      background: C.bg1,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      background: C.bg1,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: sel.name,
    size: 42,
    color: riskColor(sel.risk)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, sel.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, sel.industry || "—", " \xB7 ", sel.csm || (lang==="en"?"Unassigned":(lang==="en" ? "Unassigned" : lang==="kr" ? "미배정" : T("unassigned",lang)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexShrink: 0
    }
  }, onEdit && /*#__PURE__*/React.createElement("button", {
    onClick: () => onEdit(sel),
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      cursor: "pointer",
      fontSize: 16,
      padding: 4
    },
    title: lang==="en"?"Edit":lang==="kr"?"수정":T("edit",lang)
  }, "\u270F\uFE0F"), onDelete && /*#__PURE__*/React.createElement("button", {
    onClick: () => onDelete(sel.id),
    style: {
      background: "none",
      border: "none",
      color: C.faint,
      cursor: "pointer",
      fontSize: 16,
      padding: 4
    },
    title: lang==="en" ? "Delete" : lang==="kr" ? "삭제" : T("delete",lang),
    onMouseEnter: e => e.currentTarget.style.color = C.red,
    onMouseLeave: e => e.currentTarget.style.color = C.faint
  }, "\uD83D\uDDD1"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 20,
      cursor: "pointer",
      padding: 4
    }
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-bar",
    style: {
      margin: "14px 0"
    }
  }, lang==="en"?[["overview","📊 Overview"],["todo","✅ Tasks"],["edit","✏️ Edit"]]:lang==="kr"?[["overview","📊 개요"],["todo","✅ 작업"],["edit","✏️ 편집"]]:[["overview",T("apercu",lang)],["todo","✅ Actions"],["edit",T("editBtn",lang)]].map(([t, l]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: `tab-item${tab === t ? " active" : ""}`,
    onClick: () => setTab(t),
    style: {
      flex: 1,
      textAlign: "center",
      fontSize: 12
    }
  }, l))), tab === "overview" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      borderRadius: 12,
      padding: 12,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: C.teal,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, fmtMRR(sel.mrr || 0, currency)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginTop: 2
    }
  }, "MRR")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      borderRadius: 12,
      padding: 12,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, sel.health || 70), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginTop: 2
    }
  }, lang==="kr"?"건강":"Health")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      borderRadius: 12,
      padding: 12,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(RiskPill, {
    r: sel.risk,
    lang: lang
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginTop: 5
    }
  }, lang==="kr"?"상태":lang==="en"?"Status":"Statut"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: C.muted,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", null, lang==="kr"?"건강 점수":"Health Score"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: C.text
    }
  }, sel.health || 70, "/100")), /*#__PURE__*/React.createElement(HealthBar, {
    val: sel.health || 70
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      fontSize: 12,
      color: C.muted,
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 14px",
      background: C.surface,
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, lang==="en" ? "Renewal" : lang==="kr" ? "갱신" : "Renouvellement"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: (sel.renewal || "").includes("−") ? C.red : C.green
    }
  }, sel.renewal || "N/A")), issues.length > 0 && /*#__PURE__*/React.createElement(Card, {
    danger: true,
    style: {
      marginBottom: 12,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13,
      color: C.red,
      marginBottom: 8
    }
  }, lang==="kr"?"⚠ 경고 신호":lang==="en"?"⚠ Alert signals":"⚠ Signaux d'alerte"), issues.map((issue, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 8,
      padding: "5px 0",
      fontSize: 12,
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.red,
      flexShrink: 0
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", null, issue))))), tab === "todo" && /*#__PURE__*/React.createElement(AccountTodoPanel, {
    account: sel,
    onClose: onClose,
    lang: lang,
    companyId: companyId
  }), tab === "edit" && /*#__PURE__*/React.createElement(EditAccountPanel, {
    account: sel,
    lang: lang,
    onClose: onClose,
    onSaved: () => {
      onClose();
      if (onEdit) onEdit(null);
    }
  })));
};

// ── EditAccountPanel inline
const EditAccountPanel = ({
  account: acc,
  onClose,
  onSaved,
  lang="fr"
}) => {
  const EDIT_KEY = "scalyo_draft_edit_" + acc.id;
  const [form, setForm] = useState(() => {
    try { const d = localStorage.getItem(EDIT_KEY); if (d) return JSON.parse(d); } catch(e) {}
    return {name:acc.name||"",csm:acc.csm||"",mrr:String(acc.mrr||""),industry:acc.industry||"",renewal:acc.renewal||"",health:String(acc.health||70)};
  });
  useEffect(() => { try { localStorage.setItem(EDIT_KEY, JSON.stringify(form)); } catch(e) {} }, [form]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const save = async () => {
    if (!form.name.trim()) {
      setErr(T("nameRequired",lang));
      return;
    }
    setSaving(true);
    const h = parseInt(form.health) || 70;
    const payload = {
      name: form.name.trim(),
      csm: form.csm,
      mrr: parseFloat(form.mrr) || 0,
      industry: form.industry,
      renewal: form.renewal,
      health: h,
      risk: h >= 70 ? "low" : h >= 40 ? "medium" : "critical"
    };
    const {
      error
    } = await db.from("accounts").update(payload).eq("id", acc.id);
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    try { localStorage.removeItem(EDIT_KEY); } catch(e) {}
    if (onSaved) onSaved();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 4,
      paddingBottom: 20
    }
  }, err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      borderRadius: 9,
      padding: "8px 12px",
      fontSize: 12,
      color: C.red,
      marginBottom: 10
    }
  }, err), /*#__PURE__*/React.createElement(Field, {
    label: lang==="en" ? "Account name" : lang==="kr" ? "계정명" : T("accNameLabel",lang),
    value: form.name,
    onChange: v => setForm(p => ({
      ...p,
      name: v
    })),
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "CSM",
    value: form.csm,
    onChange: v => setForm(p => ({
      ...p,
      csm: v
    }))
  }), /*#__PURE__*/React.createElement(Field, {
    label: lang==="en" ? "Industry" : lang==="kr" ? "산업" : "Secteur",
    value: form.industry,
    onChange: v => setForm(p => ({
      ...p,
      industry: v
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "MRR (€)",
    value: form.mrr,
    onChange: v => setForm(p => ({
      ...p,
      mrr: v
    }))
  }), /*#__PURE__*/React.createElement(Field, {
    label: lang==="kr"?"건강 (0-100)":"Health (0-100)",
    value: form.health,
    onChange: v => setForm(p => ({
      ...p,
      health: v
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: lang==="en" ? "Renewal" : lang==="kr" ? "갱신" : "Renouvellement",
    value: form.renewal,
    onChange: v => setForm(p => ({
      ...p,
      renewal: v
    }))
  }), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    disabled: saving,
    className: "btn-base",
    style: {
      width: "100%",
      padding: "11px",
      borderRadius: 12,
      fontSize: 13,
      background: C.teal,
      color: "#FFFFFF"
    }
  }, saving ? (T("saving",lang)) : (T("saveAcc",lang))));
};


export default DashboardView;
