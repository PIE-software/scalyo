/**
 * Scalyo - QuotesView
 * Extracted from app.html (lines 13779-14041)
 */

import { T } from '../shared/i18n-wrapper.js';


const QuotesView = ({lang="fr", currency="EUR", companyId}) => {
  const STATUSES = ["draft","sent","won","lost"];
  const statusLabel = s => T("quote"+s.charAt(0).toUpperCase()+s.slice(1), lang);
  const statusColor = s => s==="won"?C.green:s==="lost"?C.red:s==="sent"?C.blue:C.muted;
  const statusBg = s => s==="won"?C.greenBg:s==="lost"?C.redBg:s==="sent"?C.blueBg:C.surface;
  const statusBorder = s => s==="won"?C.greenBorder:s==="lost"?C.redBorder:s==="sent"?"rgba(35,131,226,0.18)":C.border;
  const storageKey = "scalyo_quotes_"+(companyId||"local");
  const loadQuotes = () => { try{return JSON.parse(localStorage.getItem(storageKey))||[];}catch(e){return [];} };
  const [quotes, setQuotes] = useState(loadQuotes);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({title:"",client:"",amount:"",status:"draft",date:new Date().toISOString().slice(0,10),notes:""});
  const save = (list) => { setQuotes(list); try{localStorage.setItem(storageKey,JSON.stringify(list));}catch(e){} };
  const filtered = filter==="all"?quotes:quotes.filter(q=>q.status===filter);
  const totalWon = quotes.filter(q=>q.status==="won").reduce((s,q)=>s+parseFloat(q.amount||0),0);
  const convRate = quotes.length?Math.round(quotes.filter(q=>q.status==="won").length/quotes.length*100):0;
  const fmtAmount = v => {const n=parseFloat(v||0);const c=CURRENCIES[currency]||CURRENCIES.EUR;return c.position==="before"?c.symbol+n.toLocaleString():n.toLocaleString()+c.symbol;};
  const openNew = () => { setEditId(null); setForm({title:"",client:"",amount:"",status:"draft",date:new Date().toISOString().slice(0,10),notes:""}); setShowForm(true); };
  const openEdit = q => { setEditId(q.id); setForm({title:q.title,client:q.client,amount:String(q.amount),status:q.status,date:q.date,notes:q.notes||""}); setShowForm(true); };
  const duplicate = q => { const nq={...q,id:Date.now(),title:q.title+" ("+T("quoteDuplicate",lang)+")",status:"draft",date:new Date().toISOString().slice(0,10)}; save([nq,...quotes]); };
  const submit = () => {
    if(!form.title.trim()||!form.client.trim()) return;
    if(editId){save(quotes.map(q=>q.id===editId?{...q,...form,amount:parseFloat(form.amount||0)}:q));}
    else{save([{id:Date.now(),...form,amount:parseFloat(form.amount||0)},...quotes]);}
    setShowForm(false);
  };
  const remove = id => save(quotes.filter(q=>q.id!==id));
  return /*#__PURE__*/React.createElement("div",{className:"fade-in",style:{padding:"24px 28px",maxWidth:960}},
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}},
      /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12}},
        /*#__PURE__*/React.createElement("div",{style:{width:40,height:40,borderRadius:6,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},"📄"),
        /*#__PURE__*/React.createElement("div",null,
          /*#__PURE__*/React.createElement("h2",{style:{fontSize:20,fontWeight:900,letterSpacing:"-.4px"}},T("quotes",lang)),
          /*#__PURE__*/React.createElement("p",{style:{fontSize:12,color:C.muted}},quotes.length+" "+(T('quotes', lang)))
        )
      ),
      /*#__PURE__*/React.createElement("button",{className:"btn-base",onClick:openNew,style:{background:C.teal,color:"#fff",padding:"10px 20px",borderRadius:6,fontSize:13,fontWeight:700}},T("addQuote",lang))
    ),
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}},
      /*#__PURE__*/React.createElement("div",{style:{padding:"12px 18px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,flex:1,minWidth:140}},
        /*#__PURE__*/React.createElement("div",{style:{fontSize:11,color:C.muted,fontWeight:600,marginBottom:4}},T("quoteTotalWon",lang)),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:22,fontWeight:800,color:C.green}},fmtAmount(totalWon))
      ),
      /*#__PURE__*/React.createElement("div",{style:{padding:"12px 18px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,flex:1,minWidth:140}},
        /*#__PURE__*/React.createElement("div",{style:{fontSize:11,color:C.muted,fontWeight:600,marginBottom:4}},T("quoteConversion",lang)),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:22,fontWeight:800,color:C.teal}},convRate+"%")
      )
    ),
    /*#__PURE__*/React.createElement("div",{style:{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}},
      ["all",...STATUSES].map(s=>/*#__PURE__*/React.createElement("button",{key:s,className:"btn-base",onClick:()=>setFilter(s),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,background:filter===s?C.tealBg:"transparent",color:filter===s?C.teal:C.muted,border:`1px solid ${filter===s?C.tealBorder:C.border}`}},s==="all"?T("quoteAll",lang):statusLabel(s)))
    ),
    filtered.length===0&&/*#__PURE__*/React.createElement("div",{style:{textAlign:"center",padding:"60px 0",color:C.muted}},T("noQuotes",lang)),
    filtered.map(q=>/*#__PURE__*/React.createElement("div",{key:q.id,className:"row-item",style:{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:6,border:`1px solid ${C.border}`,marginBottom:8,background:C.bg1}},
      /*#__PURE__*/React.createElement("div",{style:{flex:1,minWidth:0}},
        /*#__PURE__*/React.createElement("div",{style:{fontSize:14,fontWeight:700,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},q.title),
        /*#__PURE__*/React.createElement("div",{style:{fontSize:12,color:C.muted}},q.client+" · "+q.date)
      ),
      /*#__PURE__*/React.createElement("div",{style:{fontSize:15,fontWeight:700,whiteSpace:"nowrap"}},fmtAmount(q.amount)),
      /*#__PURE__*/React.createElement("div",{style:{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:statusBg(q.status),color:statusColor(q.status),border:`1px solid ${statusBorder(q.status)}`}},statusLabel(q.status)),
      /*#__PURE__*/React.createElement("div",{style:{display:"flex",gap:6}},
        /*#__PURE__*/React.createElement("button",{className:"btn-base",onClick:()=>openEdit(q),style:{padding:"4px 10px",borderRadius:6,fontSize:11,background:C.surface,color:C.text,border:`1px solid ${C.border}`}},T("edit",lang)),
        /*#__PURE__*/React.createElement("button",{className:"btn-base",onClick:()=>duplicate(q),style:{padding:"4px 10px",borderRadius:6,fontSize:11,background:C.surface,color:C.text,border:`1px solid ${C.border}`}},"⧉"),
        /*#__PURE__*/React.createElement("button",{className:"btn-base",onClick:()=>remove(q.id),style:{padding:"4px 10px",borderRadius:6,fontSize:11,background:C.redBg,color:C.red,border:`1px solid ${C.redBorder}`}},"×")
      )
    )),
    showForm&&/*#__PURE__*/React.createElement("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)setShowForm(false);}},
      /*#__PURE__*/React.createElement("div",{className:"modal-box",style:{maxWidth:480,padding:28}},
        /*#__PURE__*/React.createElement("h3",{style:{fontSize:16,fontWeight:800,marginBottom:20}},editId?T("edit",lang):T("addQuote",lang)),
        [["title",T("quoteTitle",lang),"text"],["client",T("quoteClient",lang),"text"],["amount",T("quoteAmount",lang),"number"],["date",T("quoteDate",lang),"date"]].map(([k,l,t])=>
          /*#__PURE__*/React.createElement("div",{key:k,style:{marginBottom:14}},
            /*#__PURE__*/React.createElement("label",{style:{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}},l),
            /*#__PURE__*/React.createElement("input",{type:t,value:form[k],onChange:e=>setForm({...form,[k]:e.target.value}),style:{width:"100%",padding:"10px 14px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:13}})
          )
        ),
        /*#__PURE__*/React.createElement("div",{style:{marginBottom:14}},
          /*#__PURE__*/React.createElement("label",{style:{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}},T("quoteStatus",lang)),
          /*#__PURE__*/React.createElement("select",{value:form.status,onChange:e=>setForm({...form,status:e.target.value}),style:{width:"100%",padding:"10px 14px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:13}},
            STATUSES.map(s=>/*#__PURE__*/React.createElement("option",{key:s,value:s},statusLabel(s)))
          )
        ),
        /*#__PURE__*/React.createElement("div",{style:{marginBottom:20}},
          /*#__PURE__*/React.createElement("label",{style:{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}},T("quoteNotes",lang)),
          /*#__PURE__*/React.createElement("textarea",{value:form.notes,onChange:e=>setForm({...form,notes:e.target.value}),rows:3,style:{width:"100%",padding:"10px 14px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:13,resize:"vertical"}})
        ),
        /*#__PURE__*/React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"}},
          /*#__PURE__*/React.createElement("button",{className:"btn-base",onClick:()=>setShowForm(false),style:{padding:"10px 20px",borderRadius:6,fontSize:13,background:C.surface,color:C.text,border:`1px solid ${C.border}`}},T("cancel",lang)),
          /*#__PURE__*/React.createElement("button",{className:"btn-base",onClick:submit,style:{padding:"10px 20px",borderRadius:6,fontSize:13,background:C.teal,color:"#fff",fontWeight:700}},editId?T("update",lang):T("create",lang))
        )
      )
    )
  );
};
// ══════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════
const NAV_MANAGER = (lang) => [{
  id: "dashboard",
  label: T("dashboard",lang),
  icon: "📊"
}, {
  id: "portfolio",
  label: T("portfolio",lang),
  icon: "💼"
}, {
  id: "roadmap",
  label: lang==="en" ? "Roadmap 90D" : lang==="kr" ? "로드맵 90일" : "Roadmap 90J",
  icon: "🗺️"
}, {
  id: "tasks",
  label: T("tasks",lang),
  icon: "🎯"
}, {
  id: "planning",
  label: T("planning",lang),
  icon: "📅"
}, {
  id: "kpi",
  label: T("kpi",lang),
  icon: "📈"
}, {
  id: "wellbeing",
  label: T("wellbeing",lang),
  icon: "💚"
}, {
  id: "coach",
  label: T("coach",lang),
  icon: "🤖"
}, {
  id: "tips",
  label: T("tips",lang),
  icon: "🎓"
}, {
  id: "resources",
  label: T("resources",lang),
  icon: "📚"
}, {
  id: "quotes",
  label: T("quotes",lang),
  icon: "📄"
}, {
  id: "email",
  label: T("email",lang),
  icon: "✉️"
}];
const NAV_CSM = (lang) => [{
  id: "dashboard",
  label: T("dashboard",lang),
  icon: "📊"
}, {
  id: "portfolio",
  label: T("myCsm",lang),
  icon: "💼"
}, {
  id: "roadmap",
  label: lang==="en" ? "Roadmap 90D" : lang==="kr" ? "로드맵 90일" : "Roadmap 90J",
  icon: "🗺️"
}, {
  id: "tasks",
  label: T("tasks",lang),
  icon: "🎯"
}, {
  id: "planning",
  label: T("planning",lang),
  icon: "📅"
}, {
  id: "kpi",
  label: T("kpi",lang),
  icon: "📈"
}, {
  id: "wellbeing",
  label: T("wellbeing",lang),
  icon: "💚"
}, {
  id: "coach",
  label: T("coach",lang),
  icon: "🤖"
}, {
  id: "tips",
  label: T("tips",lang),
  icon: "🎓"
}, {
  id: "quotes",
  label: T("quotes",lang),
  icon: "📄"
}];

// ── COACHING REMINDER BANNER (Elite Manager only, 1 fois/mois)
const CoachingReminderBanner = ({lang="fr", onClose}) => /*#__PURE__*/React.createElement("div", {
  style:{
    background:"rgba(139,92,246,.1)",
    border:"1px solid rgba(139,92,246,.3)",
    borderRadius:6,
    padding:"12px 16px",
    margin:"0 0 14px 0",
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between",
    gap:12,
    fontSize:13
  }
},
  /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,flex:1}},
    /*#__PURE__*/React.createElement("span",{style:{fontSize:18}},"📅"),
    /*#__PURE__*/React.createElement("div",null,
      /*#__PURE__*/React.createElement("div",{style:{fontWeight:700,color:"#9B6BDF",marginBottom:2}},
        lang==="en" ? "Your monthly coaching session is available!" : lang==="kr" ? "월간 코칭 세션을 이용할 수 있습니다!" : T("tipsCoaching",lang)
      ),
      /*#__PURE__*/React.createElement("div",{style:{color:"#C4B5FD",fontSize:12}},
        lang==="en" ? "1h with your dedicated CS consultant — included in your Elite plan." : lang==="kr" ? "전담 CS 컨설턴트와 1시간 — Elite 플랜 포함." : T("tipsEliteDesc",lang)
      )
    )
  ),
  /*#__PURE__*/React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,flexShrink:0}},
    /*#__PURE__*/React.createElement("a",{
      href:"https://calendly.com/stratimaagency/session-coaching-mensuelle",
      target:"_blank",
      rel:"noopener noreferrer",
      onClick: onClose,
      style:{
        padding:"7px 14px",background:"#7C3AED",color:"#fff",
        borderRadius:7,fontWeight:700,fontSize:12,textDecoration:"none",whiteSpace:"nowrap"
      }
    }, lang==="en" ? "Book now →" : lang==="kr" ? "지금 예약 →" : T("tipsBook",lang)),
    /*#__PURE__*/React.createElement("button",{
      onClick:onClose,
      style:{
        background:"none",border:"none",color:"#9B6BDF",cursor:"pointer",
        fontSize:18,lineHeight:1,padding:"0 2px"
      }
    },"×")
  )
);

const SyncWarningBanner = ({lang="fr", onDismiss}) => /*#__PURE__*/React.createElement("div", {
  style:{
    background:"rgba(251,191,36,.08)",
    border:"1px solid rgba(251,191,36,.2)",
    borderRadius:6,
    padding:"10px 16px",
    margin:"0 0 16px 0",
    display:"flex",
    alignItems:"center",
    gap:10,
    fontSize:13,
    color:"#FCD34D"
  }
},
  /*#__PURE__*/React.createElement("span",{style:{fontSize:16}},"⚠️"),
  /*#__PURE__*/React.createElement("span",{style:{flex:1}},
    lang==="en"
      ? "Your data is saved locally only. Contact support if this persists."
      : lang==="kr"
      ? "데이터가 로컬에만 저장되어 있습니다. 문제가 지속되면 지원팀에 문의하세요."
      : "Vos données sont sauvegardées localement uniquement. Contactez le support si ce problème persiste."
  ),
  /*#__PURE__*/React.createElement("button",{
    onClick: onDismiss,
    style:{background:"none",border:"none",color:"#FCD34D",cursor:"pointer",fontSize:16,padding:"0 4px",opacity:0.7,lineHeight:1}
  },"×")
);



export default QuotesView;
