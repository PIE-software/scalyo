/**
 * Scalyo - TipsView
 * Extracted from app.html (lines 13727-13779)
 */

const TipsView = ({role="csm", lang="fr"}) => {
  const [section, setSection] = React.useState(role==="manager"?"manager":"csm");
  const [search, setSearch] = React.useState("");
  const [openIdx, setOpenIdx] = React.useState(null);
  const tips = section==="manager" ? (lang==="en" ? MANAGER_TIPS_EN : lang==="kr" ? MANAGER_TIPS_KR : MANAGER_TIPS) : (lang==="en" ? CSM_TIPS_EN : lang==="kr" ? CSM_TIPS_KR : CSM_TIPS);
  const filtered = search
    ? tips.map(c=>({...c,tips:c.tips.filter(t=>t.q.toLowerCase().includes(search.toLowerCase())||t.a.toLowerCase().includes(search.toLowerCase()))})).filter(c=>c.tips.length>0)
    : tips;
  return /*#__PURE__*/React.createElement("div", {
    className:"fade-in", style:{padding:"24px 28px",maxWidth:820}
  },
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:6}},
      /*#__PURE__*/React.createElement("div",{style:{width:40,height:40,borderRadius:6,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},"🎓"),
      /*#__PURE__*/React.createElement("div",null,
        /*#__PURE__*/React.createElement("h2",{style:{fontSize:20,fontWeight:900,letterSpacing:"-.4px"}},T("tipsTitle",lang)),
        /*#__PURE__*/React.createElement("p",{style:{fontSize:12,color:C.muted}},T("tipsDesc",lang))
      )
    ),
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",gap:6,marginBottom:18,marginTop:16}},
      [["manager","🧠 "+(T("managerTips",lang))],["csm","🤝 "+(T("csmTips",lang))]].map(([s,l])=>/*#__PURE__*/React.createElement("button",{
        key:s,className:`btn ${section===s?"btn-primary":"btn-secondary"}`,
        onClick:()=>setSection(s)
      },l))
    ),
    /*#__PURE__*/React.createElement("input",{
      placeholder:T("searchTips",lang),
      value:search,onChange:e=>setSearch(e.target.value),
      style:{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 16px",color:C.text,fontSize:13,marginBottom:20,outline:"none"}
    }),
    filtered.length===0&&/*#__PURE__*/React.createElement("div",{style:{textAlign:"center",padding:"40px 0",color:C.muted}},T("noResults",lang)),
    filtered.map((cat,ci)=>/*#__PURE__*/React.createElement("div",{key:ci,style:{marginBottom:20}},
      /*#__PURE__*/React.createElement("div",{style:{fontSize:13,fontWeight:800,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:".5px",fontSize:11}},cat.cat),
      cat.tips.map((tip,ti)=>{
        const idx = `${ci}-${ti}`;
        const isOpen = openIdx===idx;
        return /*#__PURE__*/React.createElement("div",{
          key:ti,className:`tip-card${isOpen?" open":""}`,
          onClick:()=>setOpenIdx(isOpen?null:idx)
        },
          /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}},
            /*#__PURE__*/React.createElement("div",{style:{fontSize:13,fontWeight:700,lineHeight:1.5,flex:1}},tip.q),
            /*#__PURE__*/React.createElement("div",{style:{fontSize:14,color:C.teal,flexShrink:0,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}},"▾")
          ),
          isOpen&&/*#__PURE__*/React.createElement("div",{style:{fontSize:13,lineHeight:1.7,color:C.muted,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}},tip.a)
        );
      })
    ))
  );
};
// ══════════════════════════════════════════════════
// QUOTES / DEVIS
// ══════════════════════════════════════════════════
