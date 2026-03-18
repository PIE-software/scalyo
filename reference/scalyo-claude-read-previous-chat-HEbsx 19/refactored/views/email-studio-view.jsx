/**
 * Scalyo - EmailStudioView
 * Extracted from app.html (lines 9460-9685)
 */

import { T } from '../shared/i18n-wrapper.js';


const EmailStudioView = ({
  plan, lang="fr"
}) => {
  const [activeCat, setActiveCat] = useState("all");
  const tplSet = lang==="en" ? EMAIL_TEMPLATES_EN : lang==="kr" ? EMAIL_TEMPLATES_KR : EMAIL_TEMPLATES;
  const [selected, setSelected] = useState(tplSet[0]);
  const [copied, setCopied] = useState(false);
  const [editSubject, setEditSubject] = useState(selected.subject);
  const [editBody, setEditBody] = useState(selected.body);
  useEffect(() => {
    const s = lang==="en" ? EMAIL_TEMPLATES_EN : lang==="kr" ? EMAIL_TEMPLATES_KR : EMAIL_TEMPLATES;
    setSelected(s[0]); setEditSubject(s[0].subject); setEditBody(s[0].body);
    setActiveCat("all"); setCopied(false);
  }, [lang]);
  const cats = ["all", ...[...new Set(tplSet.map(t => t.cat))]];
  const filtered = activeCat === "all" ? tplSet : tplSet.filter(t => t.cat === activeCat);
  const selectTemplate = t => {
    setSelected(t);
    setEditSubject(t.subject);
    setEditBody(t.body);
    setCopied(false);
  };
  const copy = () => {
    const text = `${lang==="en" ? "Subject" : lang==="kr" ? "제목" : "Objet"} : ${editSubject}\n\n${editBody}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
      width: 260,
      borderRight: `1px solid ${C.border}`,
      overflow: "auto",
      padding: "20px 14px",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 14
    }
  }, "\u2709\uFE0F Email Studio"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 5,
      marginBottom: 14
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setActiveCat(c),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "4px 11px",
      borderRadius: 20,
      background: activeCat === c ? C.tealBg : C.surface,
      border: `1px solid ${activeCat === c ? C.tealBorder : C.border}`,
      color: activeCat === c ? C.teal : C.muted
    }
  }, c === "all" ? (lang==="en" ? "All" : lang==="kr" ? "전체" : T("all",lang)) : c))), filtered.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    onClick: () => selectTemplate(t),
    className: "row-item",
    style: {
      padding: "11px 12px",
      borderRadius: 11,
      marginBottom: 5,
      background: selected?.id === t.id ? C.tealBg : undefined,
      border: `1px solid ${selected?.id === t.id ? C.tealBorder : "transparent"}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".06em",
      marginBottom: 3
    }
  }, t.cat), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: selected?.id === t.id ? C.teal : C.text
    }
  }, t.title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "24px 28px",
      overflow: "auto"
    }
  }, selected ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 4
    }
  }, selected.title), /*#__PURE__*/React.createElement(Tag, {
    color: C.teal,
    size: "xs"
  }, selected.cat)), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    className: "btn-base",
    style: {
      padding: "10px 22px",
      borderRadius: 12,
      fontSize: 13,
      background: copied ? C.greenBg : C.tealBg,
      border: `1px solid ${copied ? C.greenBorder : C.tealBorder}`,
      color: copied ? C.green : C.teal
    }
  }, copied ? (lang==="en" ? "✅ Copied!" : lang==="kr" ? "✅ 복사됨!" : T("copied",lang)) : (lang==="en" ? "📋 Copy email" : lang==="kr" ? "📋 이메일 복사" : "📋 Copier l'email"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      display: "block",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, lang==="en" ? "Subject" : lang==="kr" ? "제목" : "Objet"), /*#__PURE__*/React.createElement("input", {
    value: editSubject,
    onChange: e => setEditSubject(e.target.value),
    style: {
      width: "100%",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "11px 14px",
      color: C.text,
      fontSize: 14
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      display: "block",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, lang==="en" ? "Message body" : lang==="kr" ? "메시지 본문" : "Corps du message"), /*#__PURE__*/React.createElement("textarea", {
    value: editBody,
    onChange: e => setEditBody(e.target.value),
    rows: 18,
    style: {
      width: "100%",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "14px",
      color: C.text,
      fontSize: 13,
      fontFamily: "'JetBrains Mono',monospace",
      resize: "vertical",
      lineHeight: 1.7
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: "12px 16px",
      background: C.amberBg,
      border: `1px solid ${C.amberBorder}`,
      borderRadius: 12,
      fontSize: 12,
      color: C.amber
    }
  }, lang==="en" ? "💡 Replace the elements in brackets [XXX] with your specific data before sending." : lang==="kr" ? "💡 전송 전에 [XXX]를 실제 데이터로 교체하세요." : "💡 Remplacez les éléments entre crochets [XXX] par vos données spécifiques avant d'envoyer.")) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "\u2709\uFE0F",
    title: "S\xE9lectionnez un template",
    desc: lang==="en" ? "Choose an email template from the list on the left." : lang==="kr" ? "왼쪽 목록에서 이메일 템플릿을 선택하세요." : "Choisissez un modèle d'email dans la liste à gauche."
  })));
};

// ══════════════════════════════════════════════════
// COACH IA VIEW
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// KPI VIEW — Saisie mensuelle & rapport COPIL
// ══════════════════════════════════════════════════
const KpiField = ({label, k, unit, goalKey, placeholder, kpis, goals, draft, upd, commitUpd, lang}) => {
  const val = draft[k] !== undefined ? draft[k] : (kpis[k] || "");
  return React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:4}},
    React.createElement("label", {style:{fontSize:11,color:C.muted}}, label),
    React.createElement("div", {style:{display:"flex",gap:6,alignItems:"center"}},
      React.createElement("input", {
        type:"number", value:val,
        onChange: e => upd(k, e.target.value),
        onBlur: () => commitUpd(k),
        onKeyDown: e => { if(e.key==="Enter"||e.key==="Tab") commitUpd(k); },
        placeholder: placeholder||"0", min:0,
        style:{flex:1,background:C.surface,border:"1px solid "+C.border,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:16,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",MozAppearance:"textfield",WebkitAppearance:"none",outline:"none"}
      }),
      unit && React.createElement("span",{style:{fontSize:11,color:C.muted,flexShrink:0}},unit)
    ),
    goalKey && goals[goalKey]>0 && React.createElement("div",{style:{fontSize:10,color:kpis[k]>=goals[goalKey]?C.green:C.amber}},
      lang==="kr"?"목표: ":lang==="en"?"Target: ":"Obj: ", goals[goalKey], unit, " · ",
      kpis[k]>=goals[goalKey]?"✓":("⚠ "+Math.round(kpis[k]/goals[goalKey]*100)+"% "+(lang==="kr"?"달성":lang==="en"?"reached":"atteint"))
    )
  );
};

