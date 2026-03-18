/**
 * Scalyo - SettingsView
 * Extracted from app.html (lines 13003-13727)
 */

import { T } from '../shared/i18n-wrapper.js';


const SettingsView = ({
  company, role, userEmail, onUpgrade, onCompanyUpdate,
  theme="dark", lang="fr",
  currency="EUR", onCurrency=()=>{},
  onTheme=()=>{}, onLang=()=>{}
}) => {
  const [tab, setTab] = React.useState("profile");
  const [profileName, setProfileName] = React.useState(userEmail?.split("@")[0] || "");
  const [companyName, setCompanyName] = React.useState(company?.name || "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "SUPPRIMER" && deleteConfirm !== "DELETE") return;
    if (!window.confirm(T("deleteAccountFinal", lang))) return;
    setDeleting(true);
    try {
      if (company?.id) {
        await db.from("accounts").delete().eq("company_id", company.id);
        await db.from("roadmap").delete().eq("company_id", company.id);
        await db.from("wellbeing").delete().eq("company_id", company.id);
        await db.from("companies").delete().eq("id", company.id);
      }
      ["scalyo_role","scalyo_theme","scalyo_lang","scalyo_api","scalyo_currency","scalyo_pending","scalyo_screen","scalyo_plan","scalyo_coach_messages","scalyo_wb_messages","scalyo_pf_filter","scalyo_pf_search","scalyo_pf_csm","scalyo_kpi_period","scalyo_draft_add_account","scalyo_draft_import"].forEach(k=>{
        try{localStorage.removeItem(k);}catch(e){}
      });
      // Nettoyer aussi les drafts d'édition par compte
      try { Object.keys(localStorage).filter(k=>k.startsWith("scalyo_draft_edit_")).forEach(k=>localStorage.removeItem(k)); } catch(e) {}
      await db.auth.signOut();
    } catch(e) {
      console.error("Delete account error:", e);
      alert(T("deleteError", lang));
    }
    setDeleting(false);
  };
  const [notifs, setNotifs] = React.useState({
    churnAlerts: true,
    weeklyReport: true,
    teamWellbeing: true,
    renewalAlerts: true
  });
  const tabs = role === "manager" ? [["profile", T("tabProfile",lang)], ["team", T("tabTeam",lang)], ["billing", T("tabBilling",lang)], ["notifs", T("tabNotifs",lang)], ["apparence", T("tabAppearance",lang)], ["danger", "⚠️ "+T("deleteAccount",lang)]] : [["profile", T("tabProfile",lang)], ["notifs", T("tabNotifs",lang)], ["apparence", T("tabAppearance",lang)], ["danger", "⚠️ "+T("deleteAccount",lang)]];
  const saveProfile = async () => {
    setSaving(true);
    try {
      if (db && company?.id) {
        const { error } = await db.from("companies").update({
          name: companyName.trim()
        }).eq("id", company.id);
        if (error) { console.error("saveProfile error:", error.message); }
        if (onCompanyUpdate) onCompanyUpdate({
          ...company,
          name: companyName.trim()
        });
      }
    } catch(e) { console.error("saveProfile exception:", e); }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      padding: "26px 30px",
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      marginBottom: 4
    }
  }, T("settingsTitle",lang)), /*#__PURE__*/React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 13,
      marginBottom: 24
    }
  }, T("settingsDesc",lang)), /*#__PURE__*/React.createElement("div", {
    className: "tab-bar",
    style: {
      marginBottom: 26
    }
  }, tabs.map(([t, l]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: `tab-item${tab === t ? " active" : ""}`,
    onClick: () => setTab(t)
  }, l))), tab === "apparence" && /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {display:"flex",flexDirection:"column",gap:18}
  },
  /*#__PURE__*/React.createElement(Card, {style:{padding:24}},
    /*#__PURE__*/React.createElement("h3",{style:{fontSize:15,fontWeight:800,marginBottom:20}},T("appearanceTitle",lang)),
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${C.border}`}},
      /*#__PURE__*/React.createElement("div",null,
        /*#__PURE__*/React.createElement("div",{style:{fontSize:14,fontWeight:700,marginBottom:2}},T("darkMode",lang)),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:12,color:C.muted}},T("themeDesc",lang))
      ),
      /*#__PURE__*/React.createElement("div",{
        onClick:()=>onTheme(theme==="dark"?"light":"dark"),
        style:{width:46,height:26,borderRadius:6,cursor:"pointer",transition:"background .2s",background:theme==="dark"?C.teal:C.surface,position:"relative",border:`1px solid ${theme==="dark"?C.tealBorder:C.border}`}
      },/*#__PURE__*/React.createElement("div",{style:{position:"absolute",top:3,transition:"left .2s",left:theme==="dark"?22:3,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(45,42,38,0.08)"}}))
    ),
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0"}},
      /*#__PURE__*/React.createElement("div",null,
        /*#__PURE__*/React.createElement("div",{style:{fontSize:14,fontWeight:700,marginBottom:2}},T("langLabel",lang)),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:12,color:C.muted}},"Français / English / 한국어")
      ),
      /*#__PURE__*/React.createElement("div",{style:{display:"flex",gap:6}},
        ["fr","en","kr"].map(l=>/*#__PURE__*/React.createElement("div",{
          key:l,onClick:()=>onLang(l),
          style:{padding:"6px 16px",borderRadius:16,fontSize:12,fontWeight:700,cursor:"pointer",
            background:lang===l?C.tealBg:C.surface,
            border:`1px solid ${lang===l?C.tealBorder:C.border}`,
            color:lang===l?C.teal:C.muted,transition:"all .15s"}
        },l==="fr"?"🇫🇷 FR":l==="kr"?"🇰🇷 KR":"🇬🇧 EN"))
      )
    ),
  /*#__PURE__*/React.createElement(Card,{style:{padding:24}},
    /*#__PURE__*/React.createElement("h3",{style:{fontSize:15,fontWeight:800,marginBottom:16}},T("currencyLabel",lang)),
    /*#__PURE__*/React.createElement("select",{
      value:currency,onChange:e=>onCurrency(e.target.value),
      style:{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:13,cursor:"pointer",outline:"none"}
    },Object.entries(CURRENCIES).map(([code,{name}])=>
      /*#__PURE__*/React.createElement("option",{key:code,value:code},`${name} (${code})`)
    ))
  ),
  ),
  /*#__PURE__*/React.createElement(Card,{style:{padding:20,display:"flex",alignItems:"center",gap:14}},
    /*#__PURE__*/React.createElement("div",{style:{width:10,height:10,borderRadius:"50%",background:C.green,flexShrink:0,boxShadow:"0 0 8px rgba(74,222,128,.5)"}}),
    /*#__PURE__*/React.createElement("div",null,
      /*#__PURE__*/React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.text,marginBottom:2}},
        lang==="en" ? "AI features active" : lang==="kr" ? "AI 기능 활성화" : "Fonctions IA actives"
      ),
      /*#__PURE__*/React.createElement("div",{style:{fontSize:12,color:C.muted}},
        lang==="en"
          ?"CS Coach and Nova Wellbeing are powered by DeepSeek — no configuration needed."
          :lang==="kr"
          ?"CS 코치와 Nova 웰빙은 DeepSeek으로 구동됩니다 — 별도 설정이 필요 없습니다."
          :"Le Coach CS et Nova Bien-être sont propulsés par DeepSeek — aucune configuration requise."
      )
    )
  )
), tab === "profile" && /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      marginBottom: 20
    }
  }, T("accountInfo",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Field, {
    label: T("displayName",lang),
    value: profileName,
    onChange: setProfileName,
    placeholder: T("namePlaceholder",lang)
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
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    value: userEmail || "",
    readOnly: true,
    style: {
      width: "100%",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "11px 14px",
      color: C.muted,
      fontSize: 14,
      cursor: "not-allowed"
    }
  }))), /*#__PURE__*/React.createElement(Field, {
    label: T("companyNameLabel",lang),
    value: companyName,
    onChange: setCompanyName,
    placeholder: T("companyPlaceholder",lang)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: saveProfile,
    disabled: saving,
    className: "btn-base",
    style: {
      padding: "10px 24px",
      borderRadius: 12,
      fontSize: 13,
      background: C.teal,
      color: "#FFFFFF"
    }
  }, saving ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: 14,
    color: "#FFFFFF"
  }), T("saving",lang)) : (T("save",lang))), saved && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: C.green
    }
  }, "✅ "+T("savedBang",lang)))), tab === "team" && role === "manager" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 26,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 800
    }
  }, T("teamSectionTitle",lang)), /*#__PURE__*/React.createElement(Tag, {
    color: planColor(company?.plan),
    size: "sm"
  }, company?.plan)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px",
      background: C.surface,
      borderRadius: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted,
      textAlign: "center",
      lineHeight: 1.6
    }
  }, T("teamUpgradeMsg",lang))), company?.plan !== "Starter" ? /*#__PURE__*/React.createElement("button", {
    className: "btn-base",
    style: {
      width: "100%",
      padding: "11px",
      borderRadius: 12,
      fontSize: 13,
      background: C.tealBg,
      border: `1px solid ${C.tealBorder}`,
      color: C.teal
    }
  }, T("inviteCSM",lang)) : /*#__PURE__*/React.createElement("button", {
    onClick: onUpgrade,
    className: "btn-base",
    style: {
      width: "100%",
      padding: "11px",
      borderRadius: 12,
      fontSize: 13,
      background: C.teal,
      color: "#FFFFFF"
    }
  }, T("upgradeToGrowth",lang)))), tab === "billing" && role === "manager" && /*#__PURE__*/React.createElement("div", null,
  /* ── Trial days countdown banner ── */
  (() => {
    const createdAt = company?.created_at;
    const TRIAL_DAYS = 14;
    if (!createdAt) return null;
    const startDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now - startDate;
    const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, TRIAL_DAYS - daysPassed);
    const expired = daysLeft <= 0;
    const pct = Math.min(100, Math.round((daysPassed / TRIAL_DAYS) * 100));
    return /*#__PURE__*/React.createElement(Card, { style: { padding: 18, marginBottom: 14, background: expired ? (C.redBg || "rgba(239,68,68,0.06)") : C.tealBg, border: `1.5px solid ${expired ? (C.redBorder || "rgba(239,68,68,0.2)") : C.tealBorder}` } },
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
        /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 20 } }, expired ? "⏰" : "🎁"),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 14, fontWeight: 800 } }, T("trialBanner", lang))
        ),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 28, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: expired ? (C.red || "#EF4444") : C.teal } },
          expired ? "0" : daysLeft
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 13, color: expired ? (C.red || "#EF4444") : C.text, fontWeight: 600, marginBottom: 8 } },
        expired ? T("trialExpired", lang) : `${daysLeft} ${T("trialDaysLeft", lang)}`
      ),
      /*#__PURE__*/React.createElement("div", { style: { height: 6, borderRadius: 3, background: C.surface, overflow: "hidden" } },
        /*#__PURE__*/React.createElement("div", { style: { height: "100%", width: pct + "%", borderRadius: 3, background: expired ? (C.red || "#EF4444") : C.teal, transition: "width .4s ease" } })
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: C.muted } },
        /*#__PURE__*/React.createElement("span", null, lang==="en" ? "Day " + daysPassed : lang==="kr" ? daysPassed + "일차" : "Jour " + daysPassed),
        /*#__PURE__*/React.createElement("span", null, lang==="en" ? TRIAL_DAYS + " days total" : lang==="kr" ? "총 " + TRIAL_DAYS + "일" : TRIAL_DAYS + " jours au total")
      )
    );
  })(),
  /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 22,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 800
    }
  }, T("currentSubscription",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: planColor(company?.plan)
  }, company?.plan), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: C.green
    },
    className: "pulse"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.green
    }
  }, T("activeBadge",lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 12
    }
  }, [{
    name: "Starter",
    price: "97€",
    period: T("perMonth",lang),
    link: STRIPE.starter,
    highlight: company?.plan === "Starter"
  }, {
    name: "Growth",
    price: "297€",
    period: T("perMonth",lang),
    link: STRIPE.growth,
    highlight: company?.plan === "Growth"
  }, {
    name: "Elite",
    price: "697€",
    period: T("perMonth",lang),
    link: STRIPE.elite,
    highlight: company?.plan === "Elite"
  }].map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      background: p.highlight ? C.tealBg : C.surface,
      border: `2px solid ${p.highlight ? C.tealBorder : C.border}`,
      borderRadius: 16,
      padding: 18,
      textAlign: "center",
      position: "relative"
    }
  }, p.highlight && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -10,
      left: "50%",
      transform: "translateX(-50%)",
      background: C.teal,
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: 800,
      padding: "3px 10px",
      borderRadius: 20,
      whiteSpace: "nowrap"
    }
  }, T("currentPlanBadge",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      marginBottom: 6
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      fontFamily: "'JetBrains Mono',monospace",
      color: p.highlight ? C.teal : C.text,
      marginBottom: 2
    }
  }, p.price), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginBottom: 14
    }
  }, p.period), !p.highlight ? /*#__PURE__*/React.createElement("a", {
    href: p.link,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: async () => {
      try { localStorage.setItem("scalyo_plan", p.name); } catch(e) {}
      if (company?.id) { try { await db.from("companies").update({plan:p.name}).eq("id",company.id); } catch(e) {} }
      if (onCompanyUpdate) onCompanyUpdate({...company, plan:p.name});
    },
    style: {
      display: "block",
      padding: "8px",
      borderRadius: 9,
      fontSize: 12,
      fontWeight: 700,
      textDecoration: "none",
      background: C.teal,
      color: "#FFFFFF"
    }
  }, T("switchToPlan",lang), p.name) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px",
      borderRadius: 9,
      fontSize: 12,
      fontWeight: 700,
      background: C.surface,
      color: C.muted,
      border: `1px solid ${C.border}`
    }
  }, T("activePlan",lang)))))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      lineHeight: 1.7
    }
  }, T("billingInfo",lang)))), tab === "notifs" && /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      marginBottom: 20
    }
  }, T("notifTitle",lang)), (lang==="en"||lang==="kr" ? [["churnAlerts", T("churnAlertLabel",lang), T("churnAlertDesc",lang)], ["weeklyReport", T("weeklyReportLabel",lang), T("weeklyReportDesc",lang)], ["teamWellbeing", T("wellbeingAlertLabel",lang), T("wellbeingAlertDesc",lang)], ["renewalAlerts", T("renewalAlertLabel",lang), T("renewalAlertDesc",lang)]] : [["churnAlerts", T("churnAlertLabel",lang), T("churnAlertDesc",lang)], ["weeklyReport", T("weeklyReportLabel",lang), T("weeklyReportDesc",lang)], ["teamWellbeing", T("wellbeingAlertLabel",lang), T("wellbeingAlertDesc",lang)], ["renewalAlerts", T("renewalAlertLabel",lang), T("renewalAlertDesc",lang)]]).map(([key, label, desc]) => /*#__PURE__*/React.createElement("div", {
    key: key,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, desc)), /*#__PURE__*/React.createElement("div", {
    onClick: () => setNotifs(n => ({
      ...n,
      [key]: !n[key]
    })),
    style: {
      width: 46,
      height: 26,
      borderRadius: 13,
      cursor: "pointer",
      transition: "background .2s",
      background: notifs[key] ? C.teal : C.surface,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 3,
      transition: "left .2s",
      left: notifs[key] ? 22 : 3,
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(45,42,38,0.08)"
    }
  })))))
  , tab === "danger" && /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {display:"flex", flexDirection:"column", gap:18}
  },
    /*#__PURE__*/React.createElement(Card, {style:{padding:24, border:`1px solid ${C.redBorder}`, background:C.redBg}},
      /*#__PURE__*/React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, marginBottom:14}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:24}}, "\u26A0\uFE0F"),
        /*#__PURE__*/React.createElement("h3", {style:{fontSize:17, fontWeight:900, color:C.red}},
          T("deleteAccount",lang))
      ),
      /*#__PURE__*/React.createElement("p", {style:{fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.7, maxWidth:500}},
        T("deleteAccountDesc",lang)),
      /*#__PURE__*/React.createElement("div", {style:{marginBottom:18}},
        /*#__PURE__*/React.createElement("label", {style:{fontSize:11, fontWeight:700, color:C.red, textTransform:"uppercase", display:"block", marginBottom:8, letterSpacing:".08em"}},
          T("confirmDelete",lang)),
        /*#__PURE__*/React.createElement("input", {
          value: deleteConfirm,
          onChange: e=>setDeleteConfirm(e.target.value),
          placeholder: T("typeDelete",lang),
          style: {width:"100%", padding:"12px 14px", background:theme==="light"?"#FFF5F5":"rgba(235,87,87,0.05)", border:`2px solid ${C.redBorder}`, borderRadius:8, color:C.red, fontSize:14, fontWeight:600, boxSizing:"border-box", letterSpacing:".5px"}
        })
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:"flex", gap:12, alignItems:"center"}},
        /*#__PURE__*/React.createElement("button", {
          onClick: ()=>{ setDeleteConfirm(""); setTab("profile"); },
          className: "btn-base",
          style: {padding:"11px 24px", borderRadius:8, fontSize:13, fontWeight:700,
            background:C.surface, border:`1px solid ${C.border}`, color:C.text, cursor:"pointer"}
        }, lang==="en"?"Cancel":lang==="kr"?"\uCDE8\uC18C":T("cancel",lang)),
        /*#__PURE__*/React.createElement("button", {
          onClick: handleDeleteAccount,
          disabled: deleting || (deleteConfirm !== "SUPPRIMER" && deleteConfirm !== "DELETE"),
          className: "btn-base",
          style: {padding:"11px 24px", borderRadius:8, fontSize:13, fontWeight:700,
            cursor:(deleteConfirm==="SUPPRIMER"||deleteConfirm==="DELETE")?"pointer":"not-allowed",
            background:(deleteConfirm==="SUPPRIMER"||deleteConfirm==="DELETE")?C.red:"rgba(235,87,87,0.15)",
            color:"#fff", border:"none",
            opacity:(deleteConfirm==="SUPPRIMER"||deleteConfirm==="DELETE")?1:0.4,
            display:"flex", alignItems:"center", gap:8}
        }, deleting ? /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement(Spinner, {size:14, color:"#fff"}), " ", lang==="en"?"Deleting...":lang==="kr"?"\uC0AD\uC81C \uC911...":"Suppression..."
        ) : /*#__PURE__*/React.createElement(React.Fragment, null,
          "\uD83D\uDDD1\uFE0F ", T("deleteAccountBtn",lang)
        ))
      )
    )
  ));
};


// ══════════════════════════════════════════════════
// TIPS VIEW
// ══════════════════════════════════════════════════

const MANAGER_TIPS_EN = [
  {cat:"🎯 CSM Onboarding",tips:[
    {q:"How to structure a new CSM's onboarding?",a:"1. Prepare an onboarding kit (docs, tools, access). 2. Assign a mentor CSM for the first 2 weeks. 3. Schedule shadow calls on key accounts. 4. Set progressive goals: partial portfolio D+15, full D+60. 5. Weekly 1:1 for the first 3 months."},
    {q:"Which KPIs to track for a CSM on probation?",a:"Focus on process adoption (weekly calls held, CRM filled), first client interactions (satisfaction), and tool mastery (roadmap, QBR templates). Not on churn yet — too early."},
    {q:"How to accelerate skill development?",a:"Weekly 30-min sessions on a real scenario. Review one QBR per week. Share playbooks. Peer reviews of important emails. Celebrate wins publicly within the team."}
  ]},
  {cat:"📊 Performance Management",tips:[
    {q:"How to set balanced CS objectives?",a:"OKR framework adapted for CS: 1 retention objective (rate), 1 growth objective (expansion ARR), 1 satisfaction objective (NPS/CSAT). Break down by CSM weighted by portfolio complexity. Review quarterly."},
    {q:"How to prevent CSM burnout?",a:"Monitor workload (>30 accounts = risk). Identify early signals (CRM note quality, meeting cancellations, tone in Slack). Proactively rebalance portfolios. Create decompression rituals (informal weekly debrief)."},
    {q:T("sq1",lang),a:"40-min structure: 10 min free (mood, blockers), 20 min pipeline (at-risk accounts, ongoing upsells), 10 min development (skill of the month, objective). Document actions. Alternate in-person / remote."}
  ]},
  {cat:"👥 Team Dynamics",tips:[
    {q:"How to create a knowledge-sharing culture in the CS team?",a:"Weekly 30-min team sync: 1 win, 1 challenge, 1 learning. Collaborative playbook library. Peer mentoring program. Team bonuses on collective goals (not just individual)."},
    {q:"How to manage an underperforming CSM?",a:"1. Diagnose first: skill or motivation issue? 2. 60-day improvement plan with clear milestones. 3. Intensified support (co-listening calls, immediate feedback). 4. Decision at D+60: continue, reposition, or separate."}
  ]},
  {cat:"💡 Strategy & Growth",tips:[
    {q:"How to demonstrate CS value to the executive team?",a:"Finance language: ARR protected by CS, expansion/churn ratio, NRR (Net Revenue Retention). Calculate cost of churn vs. cost of CS. Benchmark: healthy SaaS targets NRR > 110%."},
    {q:"How to scale the CS team efficiently?",a:"Optimal CSM/account ratio: 1 CSM for 20-40 SMB accounts or 10-15 Enterprise accounts. Automate low-touch (email nurturing, auto onboarding). Create segments: Digital-first, Mid-touch, High-touch. Hire when churn rate exceeds 5%."}
  ]}
];

const CSM_TIPS_EN = [
  {cat:"🤝 Collaborate Without Hierarchy",tips:[
    {q:"How to influence without formal authority?",a:"Credibility is built before you need it. 1. Master your domain (expertise = social capital). 2. Bring solutions, not problems. 3. Also advance others' topics. 4. Communicate transparently about your accounts."},
    {q:"How to handle a conflict with a colleague CSM?",a:"DESC method: Describe (facts, not interpretation), Express (impact on you), Specify (what you want), Consequence (what will change). In a 1:1, not in a meeting. If stuck, escalate quickly to the manager."},
    {q:"How to avoid overlaps and scope conflicts?",a:"Team rituals: weekly sync of 'hot' accounts, each CSM shares 3 key signals. Mandatory CRM updates. Documented handover in case of transfer. Tacit agreement: help colleagues' accounts when absent, always with their consent."}
  ]},
  {cat:"📈 Contribute Beyond Your Scope",tips:[
    {q:"How to contribute to CS process improvement?",a:"Keep a 'friction log': note what regularly blocks your clients. At month-end, synthesize and propose 1 concrete improvement. The best ideas come from the field — value them in team meetings."},
    {q:"How to become a reference in the team?",a:"Specialize in 1-2 verticals (B2B SaaS, Retail, etc.) or skills (data, complex onboarding). Share your learnings in meetings. Answer juniors' questions. Reference = available + competent + generous."}
  ]},
  {cat:"🧠 Mindset & Wellbeing",tips:[
    {q:"How to manage overload without alerting the manager?",a:"Prioritize by urgency/impact: make a list, categorize. Delegate administrative tasks (if possible). Block 2h/day of deep work. And talk to your manager — good managers prefer to know early rather than late."},
    {q:"How to avoid professional burnout in CS?",a:"Identify your top 3 energy drains (difficult clients, useless meetings, heavy CRM) and your top 3 motivation sources. Build a typical week that preserves balance. CS is intense — the best are also those who know how to protect themselves."}
  ]}
]

const MANAGER_TIPS_KR = [
  {cat:"🎯 CSM 온보딩",tips:[
    {q:"새 CSM 온보딩을 어떻게 구성하나요?",a:"1. 온보딩 키트 준비 (문서, 도구, 접근권). 2. 첫 2주 멘토 CSM 배정. 3. 주요 계정 섀도 콜 예약. 4. 점진적 목표 설정: D+15 부분 포트폴리오, D+60 전체. 5. 첫 3개월 주간 1:1."},
    {q:"수습 중 CSM을 위한 KPI는 무엇인가요?",a:"D+30: 100% 계정 파악, 첫 미팅 완료. D+60: 100% 헬스 스코어 최신화, 위험 계정 파악. D+90: 100% QBR 실행, 기여 NPS > 7. 첫 3개월: 이탈 0."}
  ]},
  {cat:"📊 성과 관리",tips:[
    {q:"저성과 CSM을 어떻게 관리하나요?",a:"원인 파악: 과부하? 기술 부족? 동기 부족? 공동 PIP 계획 수립. 주간 1:1로 구체적 피드백 제공. 명확한 단계별 기대치 설정. 45-60일 후 진행 상황 평가."},
    {q:"CSM 번아웃을 어떻게 예방하나요?",a:"업무량 지표 모니터링: CSM당 계정 수 (권장 25-30). 주간 체크인에서 피로 신호 파악. 명확한 피크 우선순위. 월간 팀 미팅에서 번아웃 정상화."}
  ]},
  {cat:"👥 팀 다이나믹스",tips:[
    {q:"CS팀에서 공유 문화를 어떻게 만드나요?",a:"주간 30분 팀 동기화: 성공 1개, 도전 1개, 학습 1개. 공동 플레이북 라이브러리. 동료 멘토링 프로그램. 개인이 아닌 집단 목표 팀 보너스."},
    {q:"CS팀에서 계층 없이 어떻게 협업하나요?",a:"공동 계정 소유권 시스템. 협업 성공 사례 가시화. 프로젝트별 순환 리더십. 소그룹 작업 세션."}
  ]},
  {cat:"💡 전략 및 성장",tips:[
    {q:"경영진에 CS 가치를 어떻게 증명하나요?",a:"ARR 유지, 확장 MRR, NPS를 비즈니스 언어로. 이탈 방지를 비용 절감으로 계량화. 분기마다 경영진에 CS 임팩트 발표."},
    {q:"CS 프로세스 개선에 어떻게 기여하나요?",a:"반복되는 문제를 체계적으로 문서화. 분기별 팀과 솔루션 검토. 제안을 ROI 추정과 함께 제안."}
  ]}
];

const CSM_TIPS_KR = [
  {cat:"🤝 위계 없이 협업하기",tips:[
    {q:"공식적인 권한 없이 어떻게 영향을 미치나요?",a:"설득력 있는 데이터 활용. 다른 팀에게 wins 가시화. 비공식 관계 구축. 도움 요청 전에 먼저 제공."},
    {q:"중복 및 범위 갈등을 어떻게 피하나요?",a:"모든 공유 계정에 대해 책임 명확화. 분기마다 팀과 함께 범위 검토. RACI 매트릭스 만들기."}
  ]},
  {cat:"🧠 멘탈 건강 및 웰빙",tips:[
    {q:"매니저에게 알리지 않고 과부하를 관리하는 방법?",a:"업무량을 눈에 보이게: 계정 수, 진행 중인 작업. 명확하고 팩트 기반으로 요청하기. 우선순위를 바꾸는 것이지 포기가 아님. 매니저는 지원자, 장애물이 아님."},
    {q:"내 능력이 의심스러울 때 어떻게 하나요?",a:"목록 만들기: 지난 6개월 내 성공 사례. 멘토 또는 동료에게 피드백 요청. 임포스터 증후군은 정상 — 능력과 자신감은 별개."}
  ]},
  {cat:"📈 범위를 넘어 기여하기",tips:[
    {q:"역량 개발을 어떻게 가속화하나요?",a:"다른 CSM의 콜 섀도잉. 매달 CS 온라인 교육 1개. 팀이나 매니저에게 학습 공유. CS 커뮤니티에 참여."},
    {q:"팀에서 어떻게 기준이 되나요?",a:"케이스 스터디와 성공 사례 작성. 미팅에서 문제 해결 제안. 최선의 방법 공유에 솔선수범."}
  ]},
  {cat:"💡 전략 및 성장",tips:[
    {q:"균형 잡힌 CS 목표를 어떻게 설정하나요?",a:"SMART 목표: 구체적, 측정 가능, 달성 가능, 관련성, 기한 설정. 포트폴리오 규모를 고려한 현실적 NPS 목표. 분기별 검토."},
    {q:"CS팀에서 새 CSM 온보딩을 어떻게 구성하나요?",a:"사전 준비: 계정 브리핑 패키지. 첫 주: 플랫폼 + 내부 도구 교육. 2주차: 주요 계정 미팅 섀도잉. 매주 1:1로 질문 디브리핑."}
  ]}
];;

const MANAGER_TIPS = lang==="en" ? [
  {cat:"🎯 CSM Onboarding",tips:[
    {q:"How to structure a new CSM onboarding?",a:"1. Prepare an onboarding kit (docs, tools, access). 2. Assign a mentor CSM for the first 2 weeks. 3. Plan shadow calls on key accounts. 4. Set progressive goals: partial portfolio D+15, full D+60. 5. Weekly check-in for 3 months."},
    {q:"Which KPIs to track for a CSM on probation?",a:"Focus on process adoption (calls done, CRM filled), first client interactions (satisfaction), and tool mastery (roadmap, QBR templates). Not churn yet — too early."},
    {q:"How to accelerate skill development?",a:"Weekly 30-min sessions on a real scenario. Review one QBR per week. Share playbooks. Peer reviews of important emails. Celebrate successes publicly."}
  ]},
  {cat:"📊 Performance management",tips:[
    {q:"How to set balanced CS objectives?",a:"CS OKR framework: 1 retention goal (rate), 1 growth goal (expansion ARR), 1 satisfaction goal (NPS/CSAT). Divide by CSM with weighting per portfolio complexity. Review every quarter."},
    {q:"How to prevent CSM burnout?",a:"Monitor workload (>30 accounts = risk). Identify early signals (CRM quality, meeting cancellations, Slack tone). Rebalance portfolios proactively. Create decompression rituals (informal weekly debrief)."},
    {q:"How to run an effective CS 1-on-1?",a:"40-min structure: 10 min open (mood, blockers), 20 min pipeline (at-risk accounts, upsells), 10 min development (skill, objective). Document actions. Alternate in-person/remote."}
  ]},
  {cat:"👥 Team dynamics",tips:[
    {q:"How to create a sharing culture in CS?",a:"Weekly 30-min team sync: 1 win, 1 challenge, 1 learning. Collaborative playbook library. Peer mentoring. Team bonus on collective goals."},
    {q:"How to manage an underperforming CSM?",a:"1. Diagnose first: skill or motivation? 2. 60-day plan with clear milestones. 3. Intensive support (co-listening, immediate feedback). 4. Decision at D+60: continue, reposition, or separate."}
  ]},
  {cat:T("settingsStrategy",lang),tips:[
    {q:"How to demonstrate CS value to executives?",a:"Finance language: ARR protected by CS, expansion/churn ratio, NRR. Calculate churn cost vs CS cost. Benchmark: healthy SaaS targets NRR > 110%."},
    {q:"How to scale the CS team effectively?",a:"Optimal CSM/account ratio: 1 per 20-40 SMB accounts or 10-15 Enterprise. Automate low-touch. Create segments: Digital-first, Mid-touch, High-touch. Hire when churn exceeds 5%."}
  ]}
] : lang==="kr" ? [
  {cat:"🎯 CSM 온보딩",tips:[
    {q:"신규 CSM 온보딩을 어떻게 구조화할까요?",a:"1. 온보딩 킷 준비 (문서, 도구, 접근). 2. 처음 2주간 멘토 CSM 배정. 3. 핵심 계정 섀도 콜 계획. 4. 점진적 목표: D+15 부분 포트폴리오, D+60 전체 포트폴리오. 5. 첫 3개월 주간 체크인."},
    {q:"수습 CSM을 위해 어떤 KPI를 추적해야 하나요?",a:"프로세스 도입 (통화 완료, CRM 작성), 첫 고객 상호작용 (만족도), 도구 숙달 (로드맵, QBR 템플릿)에 집중하세요. 이탈은 아직 — 너무 이릅니다."},
    {q:"역량 개발을 어떻게 가속화할까요?",a:"실제 시나리오로 주 1회 30분 세션. 주당 QBR 1개 리뷰. 플레이북 공유. 중요 이메일 피어 리뷰. 팀 내 성공을 공개적으로 축하하세요."}
  ]},
  {cat:"📊 성과 관리",tips:[
    {q:"균형 잡힌 CS 목표를 어떻게 설정할까요?",a:"CS OKR 프레임워크: 유지 목표 1개 (비율), 성장 목표 1개 (확장 ARR), 만족도 목표 1개 (NPS/CSAT). 포트폴리오 복잡성에 따라 CSM별 분배. 분기별 검토."},
    {q:"CSM 번아웃을 어떻게 예방할까요?",a:"업무량 모니터링 (>30개 계정 = 위험). 조기 신호 파악 (CRM 품질, 미팅 취소, Slack 어조). 포트폴리오 사전적 재조정. 감압 루틴 만들기 (비공식 주간 디브리프)."},
    {q:"효과적인 CS 1-on-1을 어떻게 진행할까요?",a:"40분 구조: 10분 자유 (기분, 장애물), 20분 파이프라인 (위험 계정, 업셀), 10분 개발 (스킬, 목표). 액션 문서화. 대면/원격 교차 진행."}
  ]},
  {cat:"👥 팀 다이나믹",tips:[
    {q:"CS 팀에서 공유 문화를 어떻게 만들까요?",a:"주 1회 30분 팀 싱크: 1 성과, 1 과제, 1 배운 점. 협업 플레이북 라이브러리. 피어 멘토링. 집단 목표에 팀 보너스."},
    {q:"저성과 CSM을 어떻게 관리할까요?",a:"1. 먼저 진단: 역량 문제인가, 동기 문제인가? 2. 명확한 이정표가 있는 60일 개선 계획. 3. 강화 지원 (공동 청취, 즉각 피드백). 4. D+60에 결정: 계속, 재배치, 또는 분리."}
  ]},
  {cat:T("settingsStrategy",lang),tips:[
    {q:"임원진에게 CS 가치를 어떻게 증명할까요?",a:"재무 언어: CS가 보호한 ARR, 확장/이탈 비율, NRR. 이탈 비용 대비 CS 비용 계산. 벤치마크: 건강한 SaaS는 NRR > 110% 목표."},
    {q:"CS 팀을 어떻게 효과적으로 확장할까요?",a:"최적 CSM/계정 비율: SMB 20~40개 또는 Enterprise 10~15개. 로우터치 자동화. 세그먼트 생성: 디지털 퍼스트, 미드터치, 하이터치. 이탈률 5% 초과 시 채용."}
  ]}
] : [
  {cat:"🎯 Onboarding CSM",tips:[
    {q:"Comment structurer l’intégration d’un nouveau CSM ?",a:"1. Préparez un kit d’onboarding (docs, outils, accès). 2. Assignez un CSM mentor les 2 premières semaines. 3. Planifiez des shadow calls sur les comptes clés. 4. Fixez des objectifs progressifs : portfolio partiel J+15, full J+60. 5. Point hebdo les 3 premiers mois."},
    {q:"Quels KPIs suivre pour un CSM en probation ?",a:"Focus sur l’adoption du processus (appels hebdos tenus, CRM rempli), les premières interactions client (satisfaction), et la maîtrise des outils (roadmap, templates QBR). Pas encore sur le churn — trop tôt."},
    {q:"Comment accélérer la montée en compétences ?",a:"Sessions hebdos de 30 min sur un scénario réel. Revue d’un QBR par semaine. Partage de playbooks. Pair reviews des emails importants. Valorisez les succès publiquement dans l’équipe."}
  ]},
  {cat:"📊 Pilotage de la performance",tips:[
    {q:"Comment fixer des objectifs CS équilibrés ?",a:"Framework OKR adapté CS : 1 objectif rétention (taux), 1 objectif croissance (expansion ARR), 1 objectif satisfaction (NPS/CSAT). Divisez par CSM avec pondération selon la complexité du portfolio. Révisez chaque trimestre."},
    {q:"Comment prévenir le burn-out de mes CSM ?",a:"Surveillez la charge (>30 comptes = risque). Identifiez les signaux précoces (qualité des notes CRM, annulations de réunions, ton dans Slack). Rééquilibrez les portfolios proactivement. Créez des rituels de décompression (débrief hebdo informel)."},
    {q:"Comment mener un 1-on-1 CS efficace ?",a:"Structure 40 min : 10 min libre (humeur, blocages), 20 min pipeline (comptes à risque, upsells en cours), 10 min développement (skill du mois, objectif). Documentez les actions. Alternez présentiel / distanciel."}
  ]},
  {cat:"👥 Dynamique d’équipe",tips:[
    {q:"Comment créer une culture de partage dans l’équipe CS ?",a:"Weekly team sync de 30 min : 1 win, 1 défi, 1 learning. Bibliothèque de playbooks collaborative. Programme de mentorat pair. Bonus équipe sur objectifs collectifs (pas seulement individuels)."},
    {q:"Comment gérer un CSM sous-performant ?",a:"1. Diagnostiquer d’abord : compétence ou motivation ? 2. Plan d’amélioration sur 60 jours avec jalons clairs. 3. Accompagnement renforcé (calls en co-écoute, feedback immédiat). 4. Décision à J+60 : continuer, repositionner, ou séparer."}
  ]},
  {cat:T("settingsStrategy",lang),tips:[
    {q:"Comment démontrer la valeur du CS au COMEX ?",a:"Langage finance : ARR protégé par le CS, ratio expansion/churn, NRR (Net Revenue Retention). Calculez le coût d’un churn vs coût du CS. Benchmarkez : SaaS sains ciblent NRR > 110%."},
    {q:"Comment scaler l’équipe CS efficacement ?",a:"Ratio CSM/compte optimal : 1 CSM pour 20-40 comptes SMB ou 10-15 comptes Enterprise. Automatisez les low-touch (email nurturing, onboarding auto). Créez des segments : Digital-first, Mid-touch, High-touch. Recrutez quand le taux de churn dépasse 5%."}
  ]}
];

const CSM_TIPS = [
  {cat:lang==="en" ? "🤝 Collaborate without hierarchy" : lang==="kr" ? "🤝 위계 없이 협업하기" : T("settingsCollab",lang),tips:[
    {q:lang==="en" ? "How to influence without formal authority?" : lang==="kr" ? "공식 권한 없이 영향력을 발휘하는 방법?" : "Comment influencer sans autorité formée ?",a:"La crédibilité se construit avant d’en avoir besoin. 1. Maîtrisez votre domaine (expertise = capital social). 2. Apportez des solutions, pas des problèmes. 3. Faites avancer les sujets des autres aussi. 4. Communiquez en transparence sur vos comptes."},
    {q:lang==="en" ? "How to handle a conflict with a CSM colleague?" : lang==="kr" ? "CSM 동료와의 갈등을 처리하는 방법?" : "Comment gérer un conflit avec un collègue CSM ?",a:"Méthode DESC : Décrire (faits, pas interprétation), Exprimer (impact sur vous), Spécifier (ce que vous souhaitez), Conséquence (ce qui changera). En 1-on-1, pas en réunion. Si bloqué, éscalade rapide vers le manager."},
    {q:lang==="en" ? "How to avoid overlaps and scope conflicts?" : lang==="kr" ? "중복과 범위 충돌을 피하는 방법?" : "Comment éviter les doublons et conflits de périmètre ?",a:"Rituels équipe : weekly sync des comptes « chauds », chaque CSM partage 3 signaux clés. CRM à jour oblige. Handover documenté en cas de transfer. Accord tacite : on aide les comptes des collègues si absent, toujours avec leur accord."}
  ]},
  {cat:lang==="en" ? "📈 Contribute beyond your scope" : lang==="kr" ? "📈 범위 이상으로 기여하기" : T("settingsContrib",lang),tips:[
    {q:lang==="en" ? "How to contribute to CS process improvement?" : lang==="kr" ? "CS 프로세스 개선에 기여하는 방법?" : "Comment contribuer à l’amélioration des process CS ?",a:lang==="en" ? "Keep a friction log: note what regularly blocks your clients. At month-end, propose 1 concrete improvement. The best ideas come from the field." : lang==="kr" ? "마찰 로그를 유지하세요: 고객을 정기적으로 막는 것을 기록하세요. 월말에 구체적인 개선안 1개를 제안하세요." : "Tenez un « log des frictions » : notez ce qui bloque vos clients régulièrement. En fin de mois, synthétisez et proposez 1 amélioration concrète. Les meilleures idées viennent du terrain."},
    {q:lang==="en" ? "How to become a reference in your team?" : lang==="kr" ? "팀에서 레퍼런스가 되는 방법?" : "Comment devenir une référence dans l’équipe ?",a:lang==="en" ? "Specialize in 1-2 verticals (SaaS B2B, Retail) or skills (data, complex onboarding). Share your learnings in meetings. Answer junior questions. Reference = available + competent + generous." : lang==="kr" ? "1-2개 분야(SaaS B2B, 리테일) 또는 기술(데이터, 복잡한 온보딩)에 특화하세요. 회의에서 학습 내용을 공유하세요." : "Spécialisez-vous sur 1-2 verticales (SaaS B2B, Retail, etc.) ou compétences (data, onboarding complexe). Partagez vos apprentissages en réunion. Répondez aux questions des junior. Référence = disponible + compétent + généreux."}
  ]},
  {cat:lang==="en" ? "🧠 Mental health & wellbeing" : lang==="kr" ? "🧠 정신 건강 & 웰빙" : T("settingsMental",lang),tips:[
    {q:lang==="en" ? "How to manage overload without alarming your manager?" : lang==="kr" ? "매니저를 걱정시키지 않고 과부하를 관리하는 방법?" : "Comment gérer la surcharge sans alerter le manager ?",a:"Priorisez en urgence/impact : faites une liste, catégorisez. Déléguez les tâches administratives (si possible). Blocquez 2h/jour de travail profond. Et parlez-en à votre manager — les bons managers préfèrent savoir tôt que trop tard."},
    {q:lang==="en" ? "How to avoid professional burnout in CS?" : lang==="kr" ? "CS에서 번아웃을 피하는 방법?" : "Comment éviter l’épuisement professionnel en CS ?",a:lang==="en" ? "Identify your top 3 energy drains (difficult clients, useless meetings, heavy CRM) and top 3 motivation sources. Build a sustainable weekly rhythm. The best CSMs also know how to protect themselves." : lang==="kr" ? "에너지를 소모하는 상위 3가지(어려운 고객, 불필요한 회의, 무거운 CRM)와 동기 부여 원천 3가지를 파악하세요. 지속 가능한 주간 리듬을 만드세요." : "Identifiez vos 3 draineurs d’énergie top (clients difficiles, réunions inutiles, CRM lourd) et vos 3 sources de motivation. Construisez une semaine type qui préserve l’équilibre."}
  ]}
];



export default SettingsView;
