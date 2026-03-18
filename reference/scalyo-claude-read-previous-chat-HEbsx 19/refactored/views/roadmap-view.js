/**
 * Scalyo - RoadmapView
 * Extracted from app.html (lines 3345-3566)
 */

import { T } from '../shared/i18n-wrapper.js';


const RoadmapView = ({
  roadmap: rm,
  updateRoadmap,
  lang="fr"
}) => {
  const _PRIO = (l) => l==="en" ? {high:"High",medium:"Medium",low:"Low"} : l==="kr" ? {high:"높음",medium:"보통",low:"낮음"} : {high:"Haute",medium:"Moyenne",low:"Faible"};
  const PRIO_LBL = _PRIO(lang);
  const items = parseItems(rm?.items);
  const doneCount = items.filter(i => i.done).length;
  const progress = items.length > 0 ? Math.round(doneCount / items.length * 100) : (rm?.progress || 0);
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [prioFilter, setPrioFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPhase, setNewPhase] = useState(1);
  const [newPrio, setNewPrio] = useState("medium");
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const phases = [...new Set(items.map(i => i.phase).filter(Boolean))].sort();
  const prios = [...new Set(items.map(i => i.prio).filter(Boolean))];

  const filtered = items.filter(i => {
    if (phaseFilter !== "all" && String(i.phase) !== String(phaseFilter)) return false;
    if (prioFilter !== "all" && i.prio !== prioFilter) return false;
    if (statusFilter === "done" && !i.done) return false;
    if (statusFilter === "todo" && i.done) return false;
    return true;
  });

  const toggleItem = (itemId) => {
    const newItems = items.map(it => it.id === itemId ? {...it, done: !it.done} : it);
    const newProgress = newItems.length > 0 ? Math.round(newItems.filter(i=>i.done).length / newItems.length * 100) : 0;
    updateRoadmap({...rm, items: newItems, progress: newProgress});
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    const newItem = { id: "r_" + Date.now(), phase: newPhase, label: newLabel.trim(), done: false, due: newDue.trim() || undefined, prio: newPrio };
    const newItems = [...items, newItem];
    const newProgress = newItems.length > 0 ? Math.round(newItems.filter(i=>i.done).length / newItems.length * 100) : 0;
    updateRoadmap({...rm, items: newItems, progress: newProgress});
    setNewLabel(""); setNewDue(""); setShowAddForm(false);
  };

  const deleteItem = (itemId) => {
    const newItems = items.filter(it => it.id !== itemId);
    const newProgress = newItems.length > 0 ? Math.round(newItems.filter(i=>i.done).length / newItems.length * 100) : 0;
    updateRoadmap({...rm, items: newItems, progress: newProgress});
  };

  const saveEdit = (itemId) => {
    if (!editLabel.trim()) return;
    const newItems = items.map(it => it.id === itemId ? {...it, label: editLabel.trim()} : it);
    updateRoadmap({...rm, items: newItems});
    setEditingId(null); setEditLabel("");
  };

  const prioColor = (p) => p === "high" ? (C.red || "#EF4444") : p === "medium" ? (C.amber || "#F59E0B") : (C.green || "#10B981");
  const chipStyle = (active) => ({
    fontSize: 11, padding: "4px 11px", borderRadius: 20, cursor: "pointer", border: "none",
    background: active ? C.tealBg : C.surface,
    border: `1px solid ${active ? C.tealBorder : C.border}`,
    color: active ? C.teal : C.muted, fontWeight: active ? 700 : 500, transition: "all .12s"
  });

  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {padding: "24px 28px", height: "100%", overflowY: "auto"}
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
      /*#__PURE__*/React.createElement("h1", {
        style: {fontSize: 22, fontWeight: 900, letterSpacing: "-.5px"}
      }, "\uD83D\uDDFA\uFE0F ", lang==="en" ? "Roadmap 90D" : lang==="kr" ? "로드맵 90일" : "Roadmap 90J"),
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowAddForm(!showAddForm),
        className: "btn-base",
        style: { fontSize: 12, padding: "7px 16px", borderRadius: 20, background: C.tealBg, border: `1px solid ${C.tealBorder}`, color: C.teal, fontWeight: 700 }
      }, T("rmAddItem", lang))
    ),
    /*#__PURE__*/React.createElement("p", {
      style: {fontSize: 13, color: C.muted, marginBottom: 16}
    }, rm?.phase || "Phase 1 — Launch"),

    /* Add form */
    showAddForm && /*#__PURE__*/React.createElement(Card, { style: { padding: 16, marginBottom: 16 } },
      /*#__PURE__*/React.createElement("input", {
        value: newLabel, onChange: e => setNewLabel(e.target.value),
        placeholder: T("rmNewItemLabel", lang),
        style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, marginBottom: 10 },
        onKeyDown: e => { if (e.key === "Enter") addItem(); }
      }),
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } },
        /*#__PURE__*/React.createElement("input", {
          value: newDue, onChange: e => setNewDue(e.target.value),
          placeholder: T("rmNewItemDue", lang),
          style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 12, width: 140 }
        }),
        /*#__PURE__*/React.createElement("select", {
          value: newPhase, onChange: e => setNewPhase(Number(e.target.value)),
          style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 12 }
        }, [1,2,3].map(p => /*#__PURE__*/React.createElement("option", { key: p, value: p }, T("rmPhase", lang) + " " + p))),
        /*#__PURE__*/React.createElement("select", {
          value: newPrio, onChange: e => setNewPrio(e.target.value),
          style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 12 }
        }, ["high","medium","low"].map(p => /*#__PURE__*/React.createElement("option", { key: p, value: p }, PRIO_LBL[p]))),
        /*#__PURE__*/React.createElement("button", {
          onClick: addItem,
          className: "btn-base",
          style: { fontSize: 12, padding: "7px 16px", borderRadius: 8, background: C.teal, color: "#FFFFFF", fontWeight: 700 }
        }, T("add", lang))
      )
    ),

    /* Filters bar */
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" } },
      /* Phase filter */
      /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: C.muted, fontWeight: 700 } }, T("rmFilterPhase", lang) + ":"),
      /*#__PURE__*/React.createElement("button", { onClick: () => setPhaseFilter("all"), className: "btn-base", style: chipStyle(phaseFilter === "all") }, T("rmAllPhases", lang)),
      phases.map(p => /*#__PURE__*/React.createElement("button", { key: p, onClick: () => setPhaseFilter(String(p)), className: "btn-base", style: chipStyle(phaseFilter === String(p)) }, "P" + p)),
      /*#__PURE__*/React.createElement("span", { style: { width: 1, height: 16, background: C.border, margin: "0 4px" } }),
      /* Priority filter */
      /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: C.muted, fontWeight: 700 } }, T("rmFilterPrio", lang) + ":"),
      /*#__PURE__*/React.createElement("button", { onClick: () => setPrioFilter("all"), className: "btn-base", style: chipStyle(prioFilter === "all") }, T("rmAllPrio", lang)),
      ["high","medium","low"].map(p => /*#__PURE__*/React.createElement("button", { key: p, onClick: () => setPrioFilter(p), className: "btn-base", style: chipStyle(prioFilter === p) }, PRIO_LBL[p])),
      /*#__PURE__*/React.createElement("span", { style: { width: 1, height: 16, background: C.border, margin: "0 4px" } }),
      /* Status filter */
      /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: C.muted, fontWeight: 700 } }, T("rmFilterStatus", lang) + ":"),
      /*#__PURE__*/React.createElement("button", { onClick: () => setStatusFilter("all"), className: "btn-base", style: chipStyle(statusFilter === "all") }, T("rmAllStatus", lang)),
      /*#__PURE__*/React.createElement("button", { onClick: () => setStatusFilter("todo"), className: "btn-base", style: chipStyle(statusFilter === "todo") }, T("rmTodo", lang)),
      /*#__PURE__*/React.createElement("button", { onClick: () => setStatusFilter("done"), className: "btn-base", style: chipStyle(statusFilter === "done") }, T("rmDone", lang))
    ),

    /* Progress bar */
    /*#__PURE__*/React.createElement("div", {
      style: {marginBottom: 20}
    },
      /*#__PURE__*/React.createElement("div", {
        style: {display:"flex", justifyContent:"space-between", marginBottom: 6}
      },
        /*#__PURE__*/React.createElement("span", {style:{fontSize:13,color:C.muted}},
          lang==="en" ? "Progress" : lang==="kr" ? "진행률" : "Progression"
        ),
        /*#__PURE__*/React.createElement("span", {style:{fontSize:13,fontWeight:700}}, progress, "%")
      ),
      /*#__PURE__*/React.createElement(HealthBar, {val: progress})
    ),

    /* Items list */
    /*#__PURE__*/React.createElement("div", {
      style: {display:"flex", flexDirection:"column", gap: 8}
    },
      filtered.length === 0
        ? /*#__PURE__*/React.createElement("p", {style:{color:C.muted,fontSize:13}},
            lang==="en" ? "No items match filters." : lang==="kr" ? "필터와 일치하는 항목이 없습니다." : "Aucun élément ne correspond aux filtres."
          )
        : filtered.map((item, i) => /*#__PURE__*/React.createElement("div", {
            key: item.id || i,
            style: {
              display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              borderRadius:8, background:C.surface,
              border:`1px solid ${C.border}`, opacity: item.done ? 0.6 : 1,
              transition: "all .12s"
            }
          },
            /*#__PURE__*/React.createElement("span", {
              style:{fontSize:16,flexShrink:0,cursor:"pointer"},
              onClick: () => toggleItem(item.id)
            },
              item.done ? "✅" : "⬜"
            ),
            editingId === item.id
              ? /*#__PURE__*/React.createElement("input", {
                  value: editLabel, onChange: e => setEditLabel(e.target.value),
                  onKeyDown: e => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditingId(null); },
                  autoFocus: true,
                  style: { flex: 1, background: C.bg2 || C.surface, border: `1px solid ${C.tealBorder}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 13 }
                })
              : /*#__PURE__*/React.createElement("span", {
                  style:{fontSize:13,flex:1,color:item.done?C.muted:C.text,
                         textDecoration:item.done?"line-through":"none"}
                }, item.label),
            item.prio && /*#__PURE__*/React.createElement("span", {
              style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:6,
                     background:prioColor(item.prio)+"22",color:prioColor(item.prio),flexShrink:0}
            }, PRIO_LBL[item.prio] || item.prio),
            item.phase && /*#__PURE__*/React.createElement("span", {
              style:{fontSize:10,color:C.muted,flexShrink:0,fontWeight:600}
            }, "P"+item.phase),
            item.due && /*#__PURE__*/React.createElement("span", {
              style:{fontSize:11,color:C.muted,flexShrink:0}
            }, item.due),
            /* Action buttons */
            /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 4, flexShrink: 0 } },
              editingId === item.id
                ? /*#__PURE__*/React.createElement("button", {
                    onClick: () => saveEdit(item.id),
                    className: "btn-base",
                    style: { fontSize: 11, padding: "3px 8px", borderRadius: 6, background: C.tealBg, border: `1px solid ${C.tealBorder}`, color: C.teal }
                  }, "✓")
                : /*#__PURE__*/React.createElement("button", {
                    onClick: () => { setEditingId(item.id); setEditLabel(item.label); },
                    className: "btn-base",
                    title: T("rmEditItem", lang),
                    style: { fontSize: 12, padding: "3px 6px", borderRadius: 6, background: "none", border: "none", color: C.muted, cursor: "pointer" }
                  }, "\u270F\uFE0F"),
              /*#__PURE__*/React.createElement("button", {
                onClick: () => deleteItem(item.id),
                className: "btn-base",
                title: T("rmDeleteItem", lang),
                style: { fontSize: 12, padding: "3px 6px", borderRadius: 6, background: "none", border: "none", color: C.muted, cursor: "pointer" }
              }, "\uD83D\uDDD1")
            )
          ))
    )
  );
};



export default RoadmapView;
