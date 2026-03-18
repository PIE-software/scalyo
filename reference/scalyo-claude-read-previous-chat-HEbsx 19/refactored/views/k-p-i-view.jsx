/**
 * Scalyo - KPIView
 * Extracted from app.html (lines 9685-12679)
 */

const KPIView = ({
  accounts,
  role="csm",
  lang="fr",
  companyId=null
}) => {
  const csms = [...new Set(accounts.map(a=>a.csm).filter(Boolean))].sort();
  const [csmFilter, setCsmFilter] = React.useState("all");
  const filteredAccounts = csmFilter==="all"?accounts:accounts.filter(a=>a.csm===csmFilter);
  const now = new Date();
  const [period, _setPeriod] = React.useState(() => { try { const s = localStorage.getItem("scalyo_kpi_period"); if (s) return s; } catch(e) {} return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; });
  const setPeriod = (v) => { _setPeriod(v); try { localStorage.setItem("scalyo_kpi_period", v); } catch(e) {} };
  const [tab, setTab] = React.useState("revenue");
  const [saved, setSaved] = React.useState(false);

  // ── PERSISTANCE : Custom KPIs — chargement initial depuis localStorage
  const [customKpis, setCustomKpis] = React.useState(() => {
    try {
      const stored = localStorage.getItem("scalyo_custom_kpis");
      return stored ? JSON.parse(stored) : [];
    } catch(e) { return []; }
  });
  const [showKpiForm, setShowKpiForm] = React.useState(false);
  const [editKpiIdx, setEditKpiIdx] = React.useState(null);
  const [kpiForm, setKpiForm] = React.useState({name:"",unit:"",type:"number",goal:"",color:"#4DB6A0",value:"",description:""});

  // ── PERSISTANCE : KPIs standards par période
  const [kpiHistory, setKpiHistory] = React.useState(() => {
    try { const s=localStorage.getItem("scalyo_kpi_history"); return s?JSON.parse(s):{}; } catch(e){return{};}
  });

  // ── ALERTES : calcul des KPIs en alerte
  const [alertsDismissed, setAlertsDismissed] = React.useState(() => {
    try { const s=localStorage.getItem("scalyo_alerts_dismissed"); return s?JSON.parse(s):[]; } catch(e){return[];}
  });
  const [showAlertBanner, setShowAlertBanner] = React.useState(true);

  // ── Import Data state
  const [importedData, setImportedData] = React.useState(null);
  const [importFileName, setImportFileName] = React.useState("");
  const [importError, setImportError] = React.useState("");
  const [importLoading, setImportLoading] = React.useState(false);
  const [selectedChartType, setSelectedChartType] = React.useState("auto");
  const [selectedColumns, setSelectedColumns] = React.useState([]);
  const [dragOver, setDragOver] = React.useState(false);

  // ── COMPARAISON N vs N-1 : état
  const [compareFile, setCompareFile] = React.useState(null);
  const [compareFileName, setCompareFileName] = React.useState("");
  const [compareLoading, setCompareLoading] = React.useState(false);
  const [showCompare, setShowCompare] = React.useState(false);
  const [kpis, setKpis] = React.useState(() => {
    try {
      const s = localStorage.getItem("scalyo_kpis_"+period);
      return s ? JSON.parse(s) : {mrr:0,newClients:0,churned:0,expansionRevenue:0,nps:0,npsResponses:0,csat:0,avgTimeToValue:0,renewalRate:0,openTickets:0,resolvedTickets:0,avgResolutionTime:0};
    } catch(e) {
      return {mrr:0,newClients:0,churned:0,expansionRevenue:0,nps:0,npsResponses:0,csat:0,avgTimeToValue:0,renewalRate:0,openTickets:0,resolvedTickets:0,avgResolutionTime:0};
    }
  });
  const [goals, setGoals] = React.useState(() => {
    try { const s=localStorage.getItem("scalyo_goals"); return s?JSON.parse(s):{mrr:0,churned:0,nps:40,renewalRate:85,csat:8,nrr:100,resolvedTickets:0}; } catch(e){return {mrr:0,churned:0,nps:40,renewalRate:85,csat:8,resolvedTickets:0};}
  });
  const [draft,setDraft]=React.useState({});
  const [draftG,setDraftG]=React.useState({});
  const upd=(k,v)=>setDraft(p=>({...p,[k]:v}));
  const updG=(k,v)=>setDraftG(p=>({...p,[k]:v}));
  const commitUpd=(k)=>{const v=draft[k];if(v===undefined)return;setKpis(p=>({...p,[k]:parseFloat(v)||0}));setDraft(p=>{const n={...p};delete n[k];return n;});};
  const commitUpdG=(k)=>{const v=draftG[k];if(v===undefined)return;setGoals(p=>({...p,[k]:parseFloat(v)||0}));setDraftG(p=>{const n={...p};delete n[k];return n;});};
  const getVal=(k)=>draft[k]!==undefined?draft[k]:(kpis[k]||"");
  const getValG=(k)=>draftG[k]!==undefined?draftG[k]:(goals[k]||"");

  // ── Charger KPIs quand la période change (FIX BUG-01 : skip first render, loadAll gère le montage)
  const periodMountRef = React.useRef(true);
  React.useEffect(()=>{
    if(periodMountRef.current) { periodMountRef.current = false; return; }
    const fromLS=()=>{ try{const s=localStorage.getItem("scalyo_kpis_"+period);if(s)setKpis(JSON.parse(s));else setKpis({mrr:0,newClients:0,churned:0,expansionRevenue:0,nps:0,npsResponses:0,csat:0,avgTimeToValue:0,renewalRate:0,openTickets:0,resolvedTickets:0,avgResolutionTime:0});}catch(e){} };
    fromLS();
    if(companyId){ db.from("kpi_data").select("kpis").eq("company_id",companyId).eq("period",period).maybeSingle().then(({data})=>{ if(data?.kpis) setKpis(k=>({...k,...data.kpis})); }); }
  },[period]); // eslint-disable-line

  // ── ALERTES ENGINE : calcul des alertes actives
  const activeAlerts = React.useMemo(()=>{
    const alerts=[];
    // KPIs standards
    if(goals.nps>0&&kpis.nps>0&&kpis.nps<goals.nps){alerts.push({id:"nps",level:kpis.nps<goals.nps*0.7?"critical":"warning",kpi:"NPS",current:kpis.nps,goal:goals.nps,msg:lang==="kr"?`NPS ${kpis.nps} — 목표 ${goals.nps} 미달`:lang==="en"?`NPS ${kpis.nps} below target ${goals.nps}`:`NPS ${kpis.nps} sous objectif ${goals.nps}`,icon:"⭐"});}
    if(goals.renewalRate>0&&kpis.renewalRate>0&&kpis.renewalRate<goals.renewalRate){alerts.push({id:"renewal",level:kpis.renewalRate<goals.renewalRate-15?"critical":"warning",kpi:lang==="kr"?"갱신률":lang==="en"?"Renewal Rate":"Taux Renouvellement",current:kpis.renewalRate+"%",goal:goals.renewalRate+"%",msg:lang==="kr"?`갱신률 ${kpis.renewalRate}% — 목표 ${goals.renewalRate}% 미달`:lang==="en"?`Renewal rate ${kpis.renewalRate}% below target ${goals.renewalRate}%`:`Renouvellement ${kpis.renewalRate}% sous objectif ${goals.renewalRate}%`,icon:"🔄"});}
    if(goals.csat>0&&kpis.csat>0&&kpis.csat<goals.csat){alerts.push({id:"csat",level:kpis.csat<goals.csat-2?"critical":"warning",kpi:"CSAT",current:kpis.csat+"/10",goal:goals.csat+"/10",msg:lang==="kr"?`CSAT ${kpis.csat}/10 — 목표 ${goals.csat}/10 미달`:lang==="en"?`CSAT ${kpis.csat}/10 below target ${goals.csat}/10`:`CSAT ${kpis.csat}/10 sous objectif ${goals.csat}/10`,icon:"😊"});}
    if(goals.mrr>0&&kpis.mrr>0&&kpis.mrr<goals.mrr){alerts.push({id:"mrr",level:kpis.mrr<goals.mrr*0.8?"critical":"warning",kpi:"MRR",current:kpis.mrr.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")+"€",goal:goals.mrr.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")+"€",msg:lang==="kr"?`MRR ${kpis.mrr.toLocaleString("ko-KR")}€ — 목표 ${goals.mrr.toLocaleString("ko-KR")}€ 미달`:lang==="en"?`MRR ${kpis.mrr.toLocaleString()}€ below target ${goals.mrr.toLocaleString()}€`:`MRR ${kpis.mrr.toLocaleString("fr-FR")}€ sous objectif ${goals.mrr.toLocaleString("fr-FR")}€`,icon:"💰"});}
    if(goals.nrr>0&&kpis.nrr>0&&kpis.nrr<goals.nrr){alerts.push({id:"nrr",level:kpis.nrr<80?"critical":"warning",kpi:"NRR",current:kpis.nrr+"%",goal:goals.nrr+"%",msg:lang==="kr"?`NRR ${kpis.nrr}% — 목표 ${goals.nrr}% 미달${kpis.nrr<80?" (위험 — 즉시 조치 필요)":""}`:lang==="en"?`NRR ${kpis.nrr}% below target ${goals.nrr}%${kpis.nrr<80?" — critical, immediate action required":""}`:`NRR ${kpis.nrr}% sous l'objectif ${goals.nrr}%${kpis.nrr<80?" — critique, action immédiate requise":""}`})}
if(goals.churned>0&&kpis.churned>goals.churned){alerts.push({id:"churn",level:"critical",kpi:"Churn",current:kpis.churned,goal:goals.churned,msg:lang==="kr"?`${kpis.churned}개 이탈 — 임계값 ${goals.churned} 초과`:lang==="en"?`${kpis.churned} churned clients exceed max ${goals.churned}`:`${kpis.churned} churns dépassent le seuil max ${goals.churned}`,icon:"📉"});}
    // KPIs custom
    customKpis.forEach(k=>{
      if(k.goal>0&&k.value>0&&k.value<k.goal){
        const pct=k.value/k.goal*100;
        alerts.push({id:"custom_"+k.id,level:pct<70?"critical":"warning",kpi:k.name,current:k.value+(k.unit?" "+k.unit:""),goal:k.goal+(k.unit?" "+k.unit:""),msg:(lang==="kr"?`${k.name}: ${k.value} — 목표 ${k.goal} 미달`:lang==="en"?`${k.name}: ${k.value} below target ${k.goal}`:`${k.name} : ${k.value} sous objectif ${k.goal}`)+(k.unit?" "+k.unit:""),icon:"🎯",color:k.color});
      }
    });
    return alerts.filter(a=>!alertsDismissed.includes(a.id));
  },[kpis,goals,customKpis,alertsDismissed,lang]);

  // ── MAPPING IMPORT → KPIs standards
  const kpiMappingKeys = {
    mrr:["mrr","monthly recurring revenue","revenu mensuel","arr/12"],
    nps:["nps","net promoter","promoter score"],
    csat:["csat","satisfaction","customer satisfaction","score satisfaction"],
    renewalRate:["renewal","renouvellement","taux renouvellement","renewal rate"],
    churned:["churn","churned","churners","résiliations"],
    newClients:["new clients","nouveaux clients","acquisitions","new accounts"],
    expansionRevenue:["expansion","upsell","upgrade revenue","expansion revenue"],
    avgResolutionTime:["resolution time","délai résolution","avg resolution","temps résolution"],
  };
  const detectKpiMapping = (cols) => {
    const maps={};
    cols.filter(c=>c.type==="number").forEach(col=>{
      const nameLow=col.name.toLowerCase();
      Object.entries(kpiMappingKeys).forEach(([kpiKey,keywords])=>{
        if(keywords.some(kw=>nameLow.includes(kw))) maps[kpiKey]=col.name;
      });
    });
    return maps;
  };
  const [kpiMapping, setKpiMapping] = React.useState({});
  const [mappingApplied, setMappingApplied] = React.useState(false);

  // File import processor
  const detectColType = (values) => {
    const nonEmpty = values.filter(v=>v!=null&&String(v).trim()!=="");
    if(nonEmpty.length===0) return "string";
    const numCount = nonEmpty.filter(v=>!isNaN(parseFloat(v))&&isFinite(v)).length;
    if(numCount/nonEmpty.length>0.8) return "number";
    const datePatterns = [/^\d{4}-\d{2}-\d{2}$/,/^\d{2}\/\d{2}\/\d{4}$/,/^\d{2}\/\d{4}$/,/^(jan|fév|mar|avr|mai|jun|jul|aoû|sep|oct|nov|déc|feb|apr|aug|oct)/i,/^Q\d\s\d{4}/i];
    const dateCount = nonEmpty.filter(v=>datePatterns.some(p=>p.test(String(v).trim()))).length;
    if(dateCount/nonEmpty.length>0.6) return "date";
    return "string";
  };

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if(lines.length<2) return null;
    const sep = (lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?";":",";    const parseLine = (line) => {
      const result=[]; let cur="",inQ=false;
      for(let ch of line){if(ch==='"'){inQ=!inQ;}else if((ch===","||ch===";")&&!inQ){result.push(cur.trim());cur="";}else{cur+=ch;}}
      result.push(cur.trim());
      return result;
    };
    const delimChar = (lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?";":","
    const headers = parseLine(lines[0]).map(h=>h.replace(/^"|"$/g,"").trim());
    const rows = lines.slice(1).filter(l=>l.trim()).map(l=>{
      const vals=parseLine(l).map(v=>v.replace(/^"|"$/g,"").trim());
      const obj={};
      headers.forEach((h,i)=>{obj[h]=vals[i]!=null?vals[i]:"";});
      return obj;
    });
    const cols = headers.map(h=>({name:h,type:detectColType(rows.map(r=>r[h]))}));
    // convert numeric cols
    rows.forEach(r=>cols.forEach(c=>{if(c.type==="number")r[c.name]=parseFloat(r[c.name])||0;}));
    return {cols,rows};
  };

  const processFile = (file) => {
    setImportError("");setImportLoading(true);setImportFileName(file.name);
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const reader = new FileReader();
    if(isExcel) {
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result,{type:"array"});
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws,{defval:""});
          if(!json||json.length===0){setImportError(lang==="en" ? "Empty file or unreadable" : lang==="kr" ? "빈 파일이거나 읽을 수 없음" : "Fichier vide ou illisible");setImportLoading(false);return;}
          const headers = Object.keys(json[0]);
          const cols = headers.map(h=>({name:h,type:detectColType(json.map(r=>r[h]))}));
          cols.forEach(c=>{if(c.type==="number")json.forEach(r=>{r[c.name]=parseFloat(r[c.name])||0;});});
          const data={cols,rows:json};
          setImportedData(data);
          setSelectedColumns(cols.filter(c=>c.type==="number").slice(0,3).map(c=>c.name));
          const mapping=detectKpiMapping(cols);
          setKpiMapping(mapping);setMappingApplied(false);
        } catch(err){setImportError(lang==="en" ? "Error reading Excel file" : lang==="kr" ? "Excel 파일 읽기 오류" : T("fileReadErrorXLSX",lang));}
        setImportLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        try {
          const result = parseCSV(e.target.result);
          if(!result){setImportError(lang==="en" ? "Unreadable CSV" : lang==="kr" ? "읽을 수 없는 CSV" : "CSV illisible");setImportLoading(false);return;}
          setImportedData(result);
          setSelectedColumns(result.cols.filter(c=>c.type==="number").slice(0,3).map(c=>c.name));
          const mapping=detectKpiMapping(result.cols);
          setKpiMapping(mapping);setMappingApplied(false);
        } catch(err){setImportError(lang==="en" ? "Error reading CSV" : lang==="kr" ? "CSV 읽기 오류" : T("fileReadErrorCSV",lang));}
        setImportLoading(false);
      };
      reader.readAsText(file,"UTF-8");
    }
  };

  // ── Chargement Supabase au montage (FIX BUG-01 : plus de race condition)
  // On charge une seule fois tous les KPIs au montage, puis period par period ensuite
  const kpiInitializedRef = React.useRef(false);
  React.useEffect(()=>{
    if(!companyId) return;
    KpiDB.loadAll(companyId).then(data=>{
      if(!data) return;
      if(data.goals) setGoals(g=>({...g,...data.goals}));
      if(data.customKpis&&data.customKpis.length) setCustomKpis(data.customKpis);
      if(data.history) setKpiHistory(data.history);
      // Charger la période courante depuis le résultat loadAll (pas un 2e appel)
      if(data.monthly&&data.monthly[period]) setKpis(k=>({...k,...data.monthly[period]}));
      kpiInitializedRef.current = true;
    });
  },[companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save custom KPIs à chaque changement
  React.useEffect(()=>{
    try { localStorage.setItem("scalyo_custom_kpis", JSON.stringify(customKpis)); } catch(e){}
    if(companyId) KpiDB.saveCustom(companyId, customKpis, kpiHistory);
  },[customKpis]); // eslint-disable-line

  // ── Auto-save goals à chaque changement
  React.useEffect(()=>{
    try { localStorage.setItem("scalyo_goals", JSON.stringify(goals)); } catch(e){}
    if(companyId) KpiDB.saveGoals(companyId, goals);
  },[goals]); // eslint-disable-line

  const save = () => {
    // Supabase + localStorage
    try { localStorage.setItem("scalyo_kpis_"+period, JSON.stringify(kpis)); } catch(e){}
    if(companyId) KpiDB.saveMonthly(companyId, period, kpis, goals);
    // Historique
    setKpiHistory(prev => {
      const updated = {...prev, [period]: {...kpis}};
      try { localStorage.setItem("scalyo_kpi_history", JSON.stringify(updated)); } catch(e){}
      if(companyId) KpiDB.saveCustom(companyId, customKpis, updated);
      return updated;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const totalClients = accounts?.length || 0;
  const churnRate = kpis.churned > 0 && totalClients > 0 ? (kpis.churned / (totalClients + kpis.churned) * 100).toFixed(1) : 0;
  const nrr = kpis.mrr > 0 ? ((kpis.mrr + kpis.expansionRevenue - kpis.churned * (kpis.mrr / Math.max(totalClients, 1))) / Math.max(kpis.mrr, 1) * 100).toFixed(0) : 100;
  const ticketResRate = kpis.openTickets + kpis.resolvedTickets > 0 ? (kpis.resolvedTickets / (kpis.openTickets + kpis.resolvedTickets) * 100).toFixed(0) : 0;

  // ── SVG Gauge
  const Gauge = ({
    val,
    max,
    color,
    label,
    unit = ""
  }) => {
    const pct = Math.min(Math.max(val, 0) / Math.max(max, 1), 1);
    const angle = pct * 180;
    const r = 36,
      cx = 50,
      cy = 48;
    const toXY = deg => ({
      x: cx + r * Math.cos((deg - 180) * Math.PI / 180),
      y: cy + r * Math.sin((deg - 180) * Math.PI / 180)
    });
    const ep = toXY(angle);
    const large = angle > 180 ? 1 : 0;
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 64",
      style: {
        width: "100%",
        height: 80
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`,
      fill: "none",
      stroke: C.border,
      strokeWidth: 7
    }), pct > 0.01 && /*#__PURE__*/React.createElement("path", {
      d: `M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${ep.x} ${ep.y}`,
      fill: "none",
      stroke: color,
      strokeWidth: 7,
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("text", {
      x: cx,
      y: cy - 3,
      textAnchor: "middle",
      fontSize: 13,
      fontWeight: "bold",
      fill: color
    }, val, unit), /*#__PURE__*/React.createElement("text", {
      x: cx,
      y: cy + 10,
      textAnchor: "middle",
      fontSize: 6,
      fill: C.muted
    }, label));
  };

  // ── SVG Bar chart
  const BarChart = ({
    data,
    h = 100
  }) => {
    const max = Math.max(...data.map(d => d.v), 1);
    const W = 100 / data.length;
    const isEmpty = data.every(d => !d.v || d.v === 0);
    if (isEmpty) return /*#__PURE__*/React.createElement("div", {
      style: {
        height: h + 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: C.surface,
        borderRadius: 8
      }
    },
      /*#__PURE__*/React.createElement("span", {style:{fontSize:22}}, "📊"),
      /*#__PURE__*/React.createElement("span", {style:{fontSize:11,color:C.muted,textAlign:"center"}},
        lang==="en" ? "No data yet — enter your KPIs above" : lang==="kr" ? "데이터 없음 — 위에 KPI를 입력하세요" : T("kpiEmpty",lang)
      )
    );
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 100 ${h}`,
      style: {
        width: "100%",
        height: h + 10
      },
      preserveAspectRatio: "none"
    }, data.map((d, i) => {
      const bh = d.v / max * (h - 18);
      const x = i * W + W * 0.18;
      const bw = W * 0.64;
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("rect", {
        x: x,
        y: h - 18 - bh,
        width: bw,
        height: Math.max(bh, 1),
        rx: 2,
        fill: d.hi ? C.teal : "rgba(77,182,160,0.22)",
        opacity: 0.95
      }), /*#__PURE__*/React.createElement("text", {
        x: x + bw / 2,
        y: h - 5,
        textAnchor: "middle",
        fontSize: 5.5,
        fill: C.muted
      }, d.l), d.v > 0 && /*#__PURE__*/React.createElement("text", {
        x: x + bw / 2,
        y: h - 21 - bh,
        textAnchor: "middle",
        fontSize: 5.5,
        fill: d.hi ? C.teal : C.muted,
        fontWeight: "bold"
      }, d.v));
    }));
  };
  const ProgressRow = ({
    label,
    val,
    goal,
    unit = "",
    inverse = false
  }) => {
    const pct = goal > 0 ? Math.min(val / goal * 100, 100) : 0;
    const ok = inverse ? val <= goal : val >= goal;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: ok ? C.green : C.amber
      }
    }, val, unit, " / ", goal, unit)), /*#__PURE__*/React.createElement(HealthBar, {
      val: inverse ? Math.max(0, 100 - pct) : pct
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: ok ? C.green : C.amber,
        marginTop: 3,
        textAlign: "right"
      }
    }, ok ? lang==="en" ? "✓ Goal reached" : lang==="kr" ? "✓ 목표 달성" : "✓ Objectif atteint" : lang==="en" ? "⚠ Below target" : lang==="kr" ? "⚠ 목표 미달" : "⚠ En dessous de l'objectif"));
  };

  const TABS = [{
    id: "revenue",
    label: lang==="en" ? "💰 Revenue" : lang==="kr" ? "💰 수익" : "💰 Revenus",
    badge: activeAlerts.filter(a=>a.id==="mrr"||a.id==="churn").length||null
  }, {
    id: "satisfaction",
    label: lang==="en" ? "⭐ Satisfaction" : lang==="kr" ? "⭐ 만족도" : "⭐ Satisfaction",
    badge: activeAlerts.filter(a=>a.id==="nps"||a.id==="csat"||a.id==="renewal").length||null
  }, {
    id: "operations",
    label: lang==="en" ? "⚙️ Operations" : lang==="kr" ? "⚙️ 운영" : T("kpiOps",lang)
  }, {
    id: "custom",
    label: lang==="en" ? "🎯 My KPIs" : lang==="kr" ? "🎯 내 KPI" : "🎯 Mes KPIs",
    badge: customKpis.length>0?customKpis.length:null,
    alertBadge: activeAlerts.filter(a=>a.id.startsWith("custom_")).length||null
  }, {
    id: "import",
    label: lang==="en" ? "📥 Import" : lang==="kr" ? "📥 가져오기" : "📥 Import",
    badge: Object.keys(kpiMapping).length>0&&!mappingApplied?Object.keys(kpiMapping).length:null,
    badgeColor: "amber"
  }, {
    id: "copil",
    label: lang==="en" ? "📄 Report" : lang==="kr" ? "📄 보고서" : "📄 COPIL"
  }];
  const periodLabel = (() => {
    const [y, m] = period.split("-");
    const months = lang==="en" ? ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] : ["","Jan",lang==="en" ? "Feb" : lang==="kr" ? "2월" : "Fév","Mar","Avr",T("monthMay",lang),"Jun","Jul",lang==="en" ? "Aug" : lang==="kr" ? "8월" : "Aoû","Sep","Oct","Nov",lang==="en" ? "Dec" : lang==="kr" ? "12월" : "Déc"];
    return `${months[parseInt(m)]} ${y}`;
  })();
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      padding: "22px 28px",
      height: "100%",
      overflowY: "auto",
      maxWidth: 980
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      marginBottom: 3
    }
  }, "\uD83D\uDCCA KPIs Customer Success"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 13
    }
  }, lang==="en" ? "Monthly entry · Reporting · COPIL prep" : lang==="kr" ? "월간 입력 · 리포팅 · COPIL 준비" : "Saisie mensuelle \xB7 Reporting \xB7 Pr\xE9paration COPIL")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "month",
    value: period,
    onChange: e => setPeriod(e.target.value),
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "8px 12px",
      color: C.text,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    className: "btn-base",
    style: {
      padding: "9px 22px",
      borderRadius: 9,
      fontWeight: 800,
      fontSize: 13,
      background: saved ? C.green : C.teal,
      color: "#FFFFFF",
      transition: "all 0.2s"
    }
  }, saved ? (T("saved",lang)) : (T("save",lang))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: lang==="en" ? "Total Accounts" : lang==="kr" ? "총 계정" : "Total Comptes",
    value: totalClients,
    icon: "\uD83D\uDCBC",
    color: C.teal
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: lang==="en" ? "Churn Rate" : lang==="kr" ? "이탈률" : "Taux de Churn",
    value: `${churnRate}%`,
    icon: "\uD83D\uDCC9",
    color: churnRate > 5 ? C.red : churnRate > 2 ? C.amber : C.green,
    sub: lang==="en" ? (churnRate > 5 ? "⚠ High" : churnRate > 2 ? "Watch" : "Healthy") : lang==="kr" ? (churnRate > 5 ? "⚠ 높음" : churnRate > 2 ? "주의" : "정상") : (churnRate > 5 ? T("kpiHigh",lang) : churnRate > 2 ? "À surveiller" : "Sain")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "NRR",
    value: `${nrr}%`,
    icon: "\uD83D\uDCC8",
    color: nrr >= 100 ? C.green : nrr >= 90 ? C.amber : C.red,
    sub: nrr >= 100 ? (lang==="kr" ? "순 확장" : lang==="en" ? "Net Expansion" : "Expansion nette") : (lang==="kr" ? "수축" : lang==="en" ? "Contraction" : "Contraction")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "NPS",
    value: kpis.nps || "—",
    icon: "\u2B50",
    color: kpis.nps >= 50 ? C.green : kpis.nps >= 30 ? C.amber : kpis.nps > 0 ? C.red : C.muted
  })),
  /* ── ALERTES BANNER ── */
  activeAlerts.length > 0 && showAlertBanner && React.createElement("div", {
    style:{background:"rgba(235,87,87,0.08)",border:"1px solid rgba(235,87,87,0.25)",borderRadius:8,padding:"12px 16px",marginBottom:16,animation:"fadeIn .3s ease"}
  },
    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
      React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
        React.createElement("span", {style:{fontSize:16}}, "🚨"),
        React.createElement("span", {style:{fontSize:13,fontWeight:800,color:C.red}},
          activeAlerts.length+" "+(lang==="en"?`KPI${activeAlerts.length>1?"s":""} below target`:lang==="kr"?`KPI${activeAlerts.length>1?"s":""} 목표 미달`:`KPI${activeAlerts.length>1?"s":""} sous objectif`)
        )
      ),
      React.createElement("button", {
        onClick:()=>setShowAlertBanner(false),
        style:{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:"2px 6px"}
      }, "✕")
    ),
    React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:6}},
      activeAlerts.map((alert,ai)=>
        React.createElement("div", {
          key:alert.id,
          style:{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(235,87,87,0.06)",borderRadius:9,padding:"8px 12px",gap:10}
        },
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,flex:1}},
            React.createElement("span", {style:{fontSize:14,flexShrink:0}}, alert.icon),
            React.createElement("div", null,
              React.createElement("div", {style:{fontSize:12,fontWeight:800,color:C.text}}, alert.kpi),
              React.createElement("div", {style:{fontSize:11,color:C.muted}}, alert.msg)
            )
          ),
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,flexShrink:0}},
            React.createElement("span", {
              style:{fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:16,
                background:alert.level==="critical"?"rgba(235,87,87,0.2)":"rgba(245,158,11,0.15)",
                color:alert.level==="critical"?C.red:C.amber}
            }, alert.level==="critical"?"⚠ CRITIQUE":"→ Attention"),
            React.createElement("span", {style:{fontSize:12,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:C.red}}, alert.current),
            React.createElement("span", {style:{fontSize:10,color:C.muted}}, "/"),
            React.createElement("span", {style:{fontSize:12,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.green}}, alert.goal),
            React.createElement("button", {
              onClick:()=>setAlertsDismissed(p=>{const n=[...p,alert.id];try{localStorage.setItem("scalyo_alerts_dismissed",JSON.stringify(n));}catch(e){}return n;}),
              style:{background:"none",border:"none",cursor:"pointer",color:C.faint,fontSize:12,padding:"2px 4px",flexShrink:0}
            }, "✕")
          )
        )
      )
    )
  ),
  role==="manager" && csms.length>2 && /*#__PURE__*/React.createElement("div", {className:"csm-filter-bar",style:{marginBottom:16}},
    csms.length > 6
      ? /*#__PURE__*/React.createElement("select",{
          value:csmFilter,
          onChange:e=>setCsmFilter(e.target.value),
          style:{padding:"6px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer",maxWidth:"100%",width:"auto"}
        }, csms.map(csm=>/*#__PURE__*/React.createElement("option",{key:csm,value:csm},
          csm==="all"?(lang==="en"?"👥 All CSMs":lang==="kr"?"👥 전체 CSM":"👥 Tous les CSMs"):csm
        )))
      : csms.map(csm=>/*#__PURE__*/React.createElement("div",{
          key:csm,
          className:`csm-chip${csmFilter===csm?" active":""}`,
          onClick:()=>setCsmFilter(csm)
        },csm==="all"?(lang==="en" ? "👥 All" : lang==="kr" ? "👥 전체" : "👥 Tous"):csm))
  ),
  /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      borderBottom: `1px solid ${C.border}`,
      marginBottom: 18
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setTab(t.id),
    className: "btn-base",
    style: {
      padding: "9px 14px",
      borderRadius: "8px 8px 0 0",
      fontSize: 12,
      fontWeight: 700,
      background: tab === t.id ? C.tealBg : "transparent",
      color: tab === t.id ? C.teal : C.muted,
      borderBottom: tab === t.id ? `2px solid ${C.teal}` : "2px solid transparent",
      display:"flex",alignItems:"center",gap:6
    }
  },
    t.label,
    t.alertBadge>0 && React.createElement("span",{style:{background:C.red,color:"#fff",borderRadius:16,fontSize:9,fontWeight:900,padding:"2px 6px",lineHeight:1}}, t.alertBadge),
    t.badge>0 && React.createElement("span",{style:{background:t.badgeColor==="amber"?C.amber:C.teal,color:"#FFFFFF",borderRadius:16,fontSize:9,fontWeight:900,padding:"2px 6px",lineHeight:1}}, t.badge)
  ))), tab === "revenue" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  },
  kpis.mrr === 0 && kpis.expansionRevenue === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(77,182,160,0.06)",
      border: `1px solid ${C.tealBorder}`,
      borderRadius: 12,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 13
    }
  },
    /*#__PURE__*/React.createElement("span", {style:{fontSize:18}}, "💡"),
    /*#__PURE__*/React.createElement("span", {style:{color:C.text}},
      lang==="en"
        ? "Start by entering your KPIs in the form below — charts will update automatically."
        : lang==="kr"
        ? "KPI를 아래 양식에 입력하세요 — 차트가 자동으로 업데이트됩니다."
        : "Commencez par saisir vos KPIs dans le formulaire ci-dessous — les graphiques se mettront à jour automatiquement."
    )
  ),
  /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 14
    }
  }, lang==="en" ? "Revenue Entry" : lang==="kr" ? "수익 입력" : "Saisie Revenus"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(KpiField, {
    label: "MRR (\u20AC)",
    k: "mrr",
    unit: "\u20AC",
    goalKey: "mrr"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "Expansion Revenue (\u20AC)" : lang==="kr" ? "확장 매출 (\u20AC)" : "Revenu d'expansion (\u20AC)",
    k: "expansionRevenue",
    unit: "\u20AC"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "New clients" : lang==="kr" ? "신규 고객" : T("kpiNewClients",lang),
    k: "newClients"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "Churned clients" : lang==="kr" ? "이탈 고객" : "Clients churned",
    k: "churned",
    goalKey: "churned"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 12
    }
  }, lang==="en" ? "Monthly targets" : lang==="kr" ? "월간 목표" : "Objectifs du mois"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, [{
    label: lang==="en" ? "MRR Target (€)" : lang==="kr" ? "MRR 목표 (€)" : "MRR Objectif (€)",
    k: "mrr",
    unit: "€"
  }, {
    label: lang==="en" ? "Max Churn" : lang==="kr" ? "최대 이탈" : "Churn Max",
    k: "churned"
  }].map(g => /*#__PURE__*/React.createElement("div", {
    key: g.k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginBottom: 4
    }
  }, g.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: getValG(g.k),
    onChange: e=>updG(g.k,e.target.value),
    onBlur: ()=>commitUpdG(g.k),
    onKeyDown: e=>{if(e.key==="Enter"||e.key==="Tab")commitUpdG(g.k);},
    placeholder: "0",
    style: {
      flex: 1,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 7,
      padding: "7px 9px",
      color: C.text,
      fontSize: 13
    }
  }), g.unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, g.unit))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 10
    }
  }, T("kpiRevChart",lang)+" — ", periodLabel), /*#__PURE__*/React.createElement(BarChart, {
    h: 110,
    data: [{
      l: "MRR",
      v: kpis.mrr,
      hi: true
    }, {
      l: lang==="kr"?"확장":lang==="en"?"Expansion":"Expansion",
      v: kpis.expansionRevenue,
      hi: false
    }, {
      l: lang==="en" ? "Target" : lang==="kr" ? "목표" : "Objectif",
      v: goals.mrr,
      hi: false
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 12
    }
  }, T("kpiMetrics",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, [{
    label: lang==="en" ? "Churn Rate" : lang==="kr" ? "이탈률" : "Taux de Churn",
    val: `${churnRate}%`,
    color: churnRate > 5 ? C.red : churnRate > 2 ? C.amber : C.green
  }, {
    label: lang==="kr"?"NRR (순수익유지율)":lang==="en"?"NRR (Net Revenue Retention)":"NRR (Rétention Nette de Revenus)",
    val: `${nrr}%`,
    color: nrr >= 100 ? C.green : nrr >= 90 ? C.amber : C.red
  }, {
    label: lang==="en" ? "MRR Expansion" : lang==="kr" ? "MRR 확장" : "MRR Expansion",
    val: `${kpis.expansionRevenue > 0 ? (kpis.expansionRevenue / Math.max(kpis.mrr, 1) * 100).toFixed(1) : 0}%`,
    color: C.teal
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: C.surface,
      borderRadius: 8,
      padding: "9px 12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, m.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: m.color,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, m.val)))))))), tab === "satisfaction" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 14
    }
  }, lang==="en" ? "Satisfaction Entry" : lang==="kr" ? "만족도 입력" : "Saisie Satisfaction"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "NPS score" : lang==="kr" ? "NPS 점수" : T("kpiNPS",lang),
    k: "nps",
    goalKey: "nps"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="kr"?"NPS 응답 수":lang==="en"?"NPS responses":"Nb. réponses NPS",
    k: "npsResponses"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="kr"?"CSAT (0-10)":"CSAT (0-10)",
    k: "csat",
    goalKey: "csat"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "Renewal rate %" : lang==="kr" ? "갱신율 %" : "Taux renouvellement %",
    k: "renewalRate",
    unit: "%",
    goalKey: "renewalRate"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 12
    }
  }, lang==="en" ? "Satisfaction targets" : lang==="kr" ? "만족도 목표" : "Objectifs satisfaction"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, [{
    label: lang==="en" ? "NPS Target" : lang==="kr" ? "NPS 목표" : "NPS cible",
    k: "nps"
  }, {
    label: lang==="en" ? "CSAT Target (/10)" : lang==="kr" ? "CSAT 목표 (/10)" : "CSAT cible (/10)",
    k: "csat"
  }, {
    label: lang==="en" ? "Renewal %" : lang==="kr" ? "갱신율 %" : "Renouvellement %",
    k: "renewalRate",
    unit: "%"
  }].map(g => /*#__PURE__*/React.createElement("div", {
    key: g.k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginBottom: 4
    }
  }, g.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: getValG(g.k),
    onChange: e=>updG(g.k,e.target.value),
    onBlur: ()=>commitUpdG(g.k),
    onKeyDown: e=>{if(e.key==="Enter"||e.key==="Tab")commitUpdG(g.k);},
    placeholder: "0",
    style: {
      flex: 1,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 7,
      padding: "7px 9px",
      color: C.text,
      fontSize: 13
    }
  }), g.unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, g.unit))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 10
    }
  }, T("kpiGauges",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Gauge, {
    val: kpis.nps,
    max: 100,
    color: kpis.nps >= 50 ? C.green : kpis.nps >= 30 ? C.amber : C.red,
    label: "NPS"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Gauge, {
    val: kpis.csat,
    max: 10,
    color: kpis.csat >= 8 ? C.green : kpis.csat >= 6 ? C.amber : C.red,
    label: "CSAT",
    unit: "/10"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Gauge, {
    val: kpis.renewalRate,
    max: 100,
    color: kpis.renewalRate >= 85 ? C.green : kpis.renewalRate >= 70 ? C.amber : C.red,
    label: lang==="en" ? "Renewal" : lang==="kr" ? "갱신" : "Renouvellement",
    unit: "%"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Gauge, {
    val: churnRate,
    max: 15,
    color: churnRate <= 2 ? C.green : churnRate <= 5 ? C.amber : C.red,
    label: lang==="kr"?"이탈률":"Churn Rate",
    unit: "%"
  })))), goals.nps > 0 && /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 12
    }
  }, T("kpiProgress",lang)), goals.nps > 0 && /*#__PURE__*/React.createElement(ProgressRow, {
    label: "NPS",
    val: kpis.nps,
    goal: goals.nps
  }), goals.csat > 0 && /*#__PURE__*/React.createElement(ProgressRow, {
    label: "CSAT (/10)",
    val: kpis.csat,
    goal: goals.csat,
    unit: "/10"
  }), goals.renewalRate > 0 && /*#__PURE__*/React.createElement(ProgressRow, {
    label: lang==="en" ? "Renewal" : lang==="kr" ? "갱신" : "Renouvellement",
    val: kpis.renewalRate,
    goal: goals.renewalRate,
    unit: "%"
  })))), tab === "operations" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 14
    }
  }, lang==="en" ? "Operations Entry" : lang==="kr" ? "운영 입력" : "Saisie Op\xE9rations"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "Open tickets" : lang==="kr" ? "오픈 티켓" : "Tickets ouverts",
    k: "openTickets"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="kr"?"해결된 티켓":lang==="en"?"Resolved tickets":"Tickets résolus",
    k: "resolvedTickets",
    goalKey: "resolvedTickets"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="kr"?"해결 시간 (h)":lang==="en"?"Resolution time (h)":"Délai résolution (h)",
    k: "avgResolutionTime",
    unit: "h"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang}), /*#__PURE__*/React.createElement(KpiField, {
    label: lang==="en" ? "Time to Value (d)" : lang==="kr" ? "가치 실현 시간 (일)" : "Time to Value (j)",
    k: "avgTimeToValue",
    unit: "j"
  , kpis:kpis, goals:goals, draft:draft, upd:upd, commitUpd:commitUpd, lang:lang})))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 12
    }
  }, T("kpiOpsMetrics",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, [{
    label: lang==="en" ? "Ticket resolution rate" : lang==="kr" ? "티켓 해결율" : T("kpiResolutionRate",lang),
    val: `${ticketResRate}%`,
    color: ticketResRate >= 80 ? C.green : ticketResRate >= 60 ? C.amber : C.red
  }, {
    label: lang==="en" ? "Average resolution time" : lang==="kr" ? "평균 해결 시간" : T("kpiResolutionAvg",lang),
    val: `${kpis.avgResolutionTime}h`,
    color: kpis.avgResolutionTime > 48 ? C.red : kpis.avgResolutionTime > 24 ? C.amber : C.green
  }, {
    label: lang==="en" ? "Avg Time to Value" : lang==="kr" ? "평균 가치 실현 시간" : "Time to Value moyen",
    val: `${kpis.avgTimeToValue} ${lang==="kr"?"일":lang==="en"?"days":"jours"}`,
    color: kpis.avgTimeToValue > 30 ? C.red : kpis.avgTimeToValue > 14 ? C.amber : C.green
  }, {
    label: lang==="en" ? "Critical accounts" : lang==="kr" ? "위험 계정" : "Comptes critiques",
    val: accounts?.filter(a => a.risk === "critical").length || 0,
    color: (accounts?.filter(a => a.risk === "critical").length || 0) > 0 ? C.red : C.green
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: C.surface,
      borderRadius: 8,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, m.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: m.color,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, m.val))))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 10
    }
  }, lang==="kr"?"티켓 — ":lang==="en"?"Tickets — ":"Tickets — ", periodLabel), /*#__PURE__*/React.createElement(BarChart, {
    h: 90,
    data: [{
      l: lang==="kr"?"오픈":lang==="en"?"Open":"Ouverts",
      v: kpis.openTickets,
      hi: false
    }, {
      l: lang==="en" ? "Resolved" : lang==="kr" ? "해결됨" : "Résolus",
      v: kpis.resolvedTickets,
      hi: true
    }]
  })))), tab === "custom" && React.createElement("div", {className:"fade-in"},
    /* ─── CUSTOM KPIs TAB ─── */
    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}},
      React.createElement("div", null,
        React.createElement("div", {style:{fontSize:15,fontWeight:900,letterSpacing:"-.3px"}}, lang==="en" ? "🎯 My Custom KPIs" : lang==="kr" ? "🎯 내 맞춤 KPI" : T("kpiCustomTitle",lang)),
        React.createElement("div", {style:{fontSize:12,color:C.muted,marginTop:2}}, lang==="en" ? "Create and track your own performance indicators" : lang==="kr" ? "나만의 성과 지표 생성 및 추적" : "Créez et suivez vos propres indicateurs de performance")
      ),
      React.createElement("button", {
        onClick:()=>{setKpiForm({name:"",unit:"",type:"number",goal:"",color:"#4DB6A0",value:"",description:""});setEditKpiIdx(null);setShowKpiForm(true);},
        className:"btn-base",
        style:{padding:"9px 18px",borderRadius:6,fontWeight:800,fontSize:13,background:C.teal,color:"#FFFFFF",display:"flex",alignItems:"center",gap:7}
      }, "＋ ", lang==="en" ? "New KPI" : lang==="kr" ? "새 KPI" : T("kpiNewTitle",lang))
    ),
    /* ── KPI Creation Form ── */
    showKpiForm && React.createElement("div", {className:"kpi-custom-form fade-in",style:{marginBottom:20}},
      React.createElement("div", {style:{fontSize:13,fontWeight:800,marginBottom:14,color:C.teal}}, editKpiIdx!==null?(lang==="en" ? "✏️ Edit KPI" : lang==="kr" ? "✏️ KPI 수정" : T("kpiEditBtn",lang)):(lang==="en" ? "➕ Create a KPI" : lang==="kr" ? "➕ KPI 생성" : T("kpiNewBtn",lang))),
      React.createElement("div", {className:"kpi-form-grid",style:{marginBottom:12}},
        React.createElement("div", {className:"kpi-form-field"},
          React.createElement("label", null, lang==="en" ? "KPI Name" : lang==="kr" ? "KPI 명" : "Nom du KPI"),
          React.createElement("input", {type:"text",placeholder:lang==="en" ? "Ex: Activation Rate" : lang==="kr" ? "예: 활성화율" : "Ex: Taux d'Activation",value:kpiForm.name,onChange:e=>setKpiForm(p=>({...p,name:e.target.value}))})
        ),
        React.createElement("div", {className:"kpi-form-field"},
          React.createElement("label", null, lang==="en" ? "Unit" : lang==="kr" ? "단위" : T("unit",lang)),
          React.createElement("input", {type:"text",placeholder:lang==="kr"?"%, €, pts, 일...":lang==="en"?"%, €, pts, days...":"%, €, pts, jours...",value:kpiForm.unit,onChange:e=>setKpiForm(p=>({...p,unit:e.target.value}))})
        ),
        React.createElement("div", {className:"kpi-form-field"},
          React.createElement("label", null, lang==="en" ? "Current Value" : lang==="kr" ? "현재 값" : "Valeur Actuelle"),
          React.createElement("input", {type:"number",placeholder:"0",value:kpiForm.value,onChange:e=>setKpiForm(p=>({...p,value:e.target.value}))})
        ),
        React.createElement("div", {className:"kpi-form-field"},
          React.createElement("label", null, lang==="en" ? "Target / Goal" : lang==="kr" ? "목표 / 목적" : "Objectif / Cible"),
          React.createElement("input", {type:"number",placeholder:"0",value:kpiForm.goal,onChange:e=>setKpiForm(p=>({...p,goal:e.target.value}))})
        ),
        React.createElement("div", {className:"kpi-form-field"},
          React.createElement("label", null, lang==="en" ? "Format" : lang==="kr" ? "형식" : "Format"),
          React.createElement("select", {value:kpiForm.type,onChange:e=>setKpiForm(p=>({...p,type:e.target.value}))},
            React.createElement("option", {value:"number"}, lang==="en" ? "Number" : lang==="kr" ? "숫자" : "Nombre"),
            React.createElement("option", {value:"percent"}, lang==="kr"?"백분율 (%)":lang==="en"?"Percentage (%)":"Pourcentage (%)"),
            React.createElement("option", {value:"currency"}, lang==="en" ? "Currency (€)" : lang==="kr" ? "통화 (€)" : T("kpiMonetary",lang)),
            React.createElement("option", {value:"score"}, lang==="kr"?"점수 (0-10)":lang==="en"?"Score (0-10)":"Score (0-10)"),
            React.createElement("option", {value:"days"}, lang==="en" ? "Duration (days)" : lang==="kr" ? "기간 (일)" : T("kpiDuration",lang))
          )
        ),
        React.createElement("div", {className:"kpi-form-field"},
          React.createElement("label", null, lang==="en" ? "Description (optional)" : lang==="kr" ? "설명 (선택)" : "Description (optionnel)"),
          React.createElement("input", {type:"text",placeholder:lang==="en" ? "What does this KPI measure?" : lang==="kr" ? "이 KPI는 무엇을 측정하나요?" : "Que mesure ce KPI ?",value:kpiForm.description,onChange:e=>setKpiForm(p=>({...p,description:e.target.value}))})
        )
      ),
      React.createElement("div", null,
        React.createElement("label", {style:{display:"block",fontSize:11,fontWeight:700,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:".6px"}}, lang==="en" ? "Color" : lang==="kr" ? "색상" : "Couleur"),
        React.createElement("div", {className:"color-picker-row"},
          ["#4DB6A0","#529CCA","#4DAB6D","#E8A838","#EB5757","#9B6BDF","#FB923C","#EC4899","#60A5FA","#FACC15"].map(col=>
            React.createElement("div", {key:col,className:`color-dot${kpiForm.color===col?" active":""}`,style:{background:col},onClick:()=>setKpiForm(p=>({...p,color:col}))})
          )
        )
      ),
      React.createElement("div", {style:{display:"flex",gap:10,marginTop:16}},
        React.createElement("button", {
          onClick:()=>{
            if(!kpiForm.name.trim()) return;
            const entry={...kpiForm,id:Date.now(),value:parseFloat(kpiForm.value)||0,goal:parseFloat(kpiForm.goal)||0,history:[{period:period,value:parseFloat(kpiForm.value)||0}]};
            if(editKpiIdx!==null){setCustomKpis(p=>{const n=[...p];n[editKpiIdx]=entry;return n;});}
            else{setCustomKpis(p=>[...p,entry]);}
            setShowKpiForm(false);setEditKpiIdx(null);
          },
          className:"btn-base",
          style:{padding:"9px 22px",borderRadius:9,fontWeight:800,fontSize:13,background:C.teal,color:"#FFFFFF"}
        }, editKpiIdx!==null?(lang==="en" ? "Update" : lang==="kr" ? "업데이트" : T("update",lang)):(lang==="en" ? "Create KPI" : lang==="kr" ? "KPI 생성" : T("kpiCreateBtn",lang))),
        React.createElement("button", {
          onClick:()=>{setShowKpiForm(false);setEditKpiIdx(null);},
          className:"btn-base btn-secondary",
          style:{padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:13,background:C.surface,border:`1px solid ${C.border}`,color:C.text}
        }, lang==="en" ? "Cancel" : lang==="kr" ? "취소" : T("cancel",lang))
      )
    ),
    /* ── Custom KPI Cards Grid ── */
    customKpis.length === 0 && !showKpiForm && React.createElement("div", {style:{textAlign:"center",padding:"48px 20px",background:C.surface,borderRadius:8,border:`1px dashed ${C.border}`}},
      React.createElement("div", {style:{fontSize:40,marginBottom:12}}, "🎯"),
      React.createElement("div", {style:{fontSize:15,fontWeight:800,marginBottom:6}}, lang==="en" ? "No custom KPIs yet" : lang==="kr" ? "맞춤 KPI 없음" : T("kpiNoCustom",lang)),
      React.createElement("div", {style:{fontSize:13,color:C.muted,marginBottom:18}}, lang==="en" ? T("kpiCustomDesc",lang) : lang==="kr" ? "팀, 고객 또는 목표에 맞는 KPI를 생성하세요." : T("kpiCustomDesc",lang)),
      React.createElement("button", {
        onClick:()=>setShowKpiForm(true),
        className:"btn-base",
        style:{padding:"10px 22px",borderRadius:6,fontWeight:800,fontSize:13,background:C.teal,color:"#FFFFFF"}
      }, "＋ ", lang==="en" ? "Create my first KPI" : lang==="kr" ? "첫 번째 KPI 생성" : "Créer mon premier KPI")
    ),
    customKpis.length > 0 && React.createElement("div", {style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}},
      customKpis.map((kpi,idx)=>{
        const pct=kpi.goal>0?Math.min(kpi.value/kpi.goal*100,100):null;
        const ok=pct===null?null:(kpi.value>=kpi.goal);
        const fmtVal=(v)=>{
          if(kpi.type==="currency") return v.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")+" €";
          if(kpi.type==="percent") return v+"%";
          if(kpi.type==="score") return v+"/10";
          if(kpi.type==="days") return v+(lang==="kr"?" 일":lang==="en"?" days":" jours");
          return v+(kpi.unit?" "+kpi.unit:"");
        };
        return React.createElement("div", {key:kpi.id,className:"kpi-custom-card"},
          React.createElement("div", {className:"accent-bar",style:{background:kpi.color}}),
          React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}},
            React.createElement("div", {style:{fontSize:12,fontWeight:700,color:C.muted,lineHeight:1.3,paddingRight:8}}, kpi.name),
            React.createElement("div", {style:{display:"flex",gap:6}},
              React.createElement("button", {onClick:()=>{setKpiForm({...kpi,value:String(kpi.value),goal:String(kpi.goal)});setEditKpiIdx(idx);setShowKpiForm(true);},style:{background:"none",border:"none",cursor:"pointer",fontSize:13,opacity:.5,padding:2}}, "✏️"),
              React.createElement("button", {onClick:()=>setCustomKpis(p=>p.filter((_,i)=>i!==idx)),style:{background:"none",border:"none",cursor:"pointer",fontSize:13,opacity:.5,padding:2}}, "🗑️")
            )
          ),
          React.createElement("div", {style:{fontSize:28,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:kpi.color,marginBottom:6}}, fmtVal(kpi.value)),
          kpi.description && React.createElement("div", {style:{fontSize:11,color:C.muted,marginBottom:8}}, kpi.description),
          kpi.goal>0 && React.createElement("div", {style:{marginBottom:8}},
            React.createElement("div", {style:{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:4}},
              React.createElement("span", null, lang==="en" ? "Progress" : lang==="kr" ? "진행률" : "Progression"),
              React.createElement("span", {style:{fontWeight:800,color:ok?C.green:C.amber}}, Math.round(pct)+"%")
            ),
            React.createElement("div", {style:{height:5,borderRadius:5,background:C.surface,overflow:"hidden"}},
              React.createElement("div", {style:{height:"100%",borderRadius:5,width:pct+"%",background:ok?C.green:kpi.color,transition:"width .4s ease"}})
            ),
            React.createElement("div", {style:{fontSize:10,color:C.muted,marginTop:3,textAlign:"right"}},
              lang==="en" ? "Target: " : lang==="kr" ? "목표: " : "Obj : ", fmtVal(kpi.goal)
            )
          ),
          /* Update value inline */
          React.createElement("div", {style:{display:"flex",gap:6,marginTop:8}},
            React.createElement("input", {
              type:"number",
              placeholder:lang==="en" ? "Update value" : lang==="kr" ? "값 업데이트" : T("update",lang),
              style:{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 10px",color:C.text,fontSize:12,fontFamily:"'JetBrains Mono',monospace"},
              onKeyDown:e=>{
                if(e.key==="Enter"&&e.target.value!==""){
                  const nv=parseFloat(e.target.value);
                  setCustomKpis(p=>{const n=[...p];n[idx]={...n[idx],value:nv,history:[...(n[idx].history||[]),{period:period,value:nv}]};return n;});
                  e.target.value="";
                }
              }
            }),
            React.createElement("span", {style:{fontSize:10,color:C.faint,alignSelf:"center",flexShrink:0}}, "↵")
          )
        );
      })
    ),
    /* ── Mini trend chart for custom KPIs ── */
    customKpis.length > 0 && React.createElement("div", {style:{marginTop:20}},
      React.createElement("div", {style:{fontSize:13,fontWeight:800,marginBottom:12}}, lang==="en" ? "📈 Trend Overview" : lang==="kr" ? "📈 추세 개요" : "📈 Vue Tendances"),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}},
        customKpis.filter(k=>k.history&&k.history.length>=2).map(kpi=>
          React.createElement("div", {key:"trend-"+kpi.id,className:"chart-container"},
            React.createElement("div", {style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8}}, kpi.name),
            React.createElement("svg", {viewBox:"0 0 200 60",style:{width:"100%",height:60}},
              (() => {
                const pts=kpi.history.slice(-8);
                const maxV=Math.max(...pts.map(p=>p.value),1);
                const minV=Math.min(...pts.map(p=>p.value),0);
                const range=maxV-minV||1;
                const W=200/Math.max(pts.length-1,1);
                const pathD=pts.map((p,i)=>{
                  const x=i*W;
                  const y=50-(p.value-minV)/range*40;
                  return (i===0?"M":"L")+x.toFixed(1)+","+y.toFixed(1);
                }).join(" ");
                return React.createElement(React.Fragment, null,
                  React.createElement("path", {d:pathD,fill:"none",stroke:kpi.color,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}),
                  pts.map((p,i)=>React.createElement("circle", {key:i,cx:i*W,cy:50-(p.value-minV)/range*40,r:3,fill:kpi.color}))
                );
              })()
            )
          )
        )
      )
    )
  ), tab === "import" && React.createElement("div", {className:"fade-in"},
    /* ─── IMPORT DATA TAB ─── */
    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}},
      React.createElement("div", null,
        React.createElement("div", {style:{fontSize:15,fontWeight:900,letterSpacing:"-.3px"}}, lang==="en" ? "📥 Import & Analyze Data" : lang==="kr" ? "📥 데이터 가져오기 및 분석" : T("kpiImport",lang)),
        React.createElement("div", {style:{fontSize:12,color:C.muted,marginTop:2}}, lang==="en" ? "Import any CSV or Excel file — Scalyo analyzes and visualizes your data automatically" : lang==="kr" ? "CSV 또는 Excel 파일 가져오기 — Scalyo가 자동으로 분석 및 시각화합니다" : "Importez n'importe quel fichier CSV ou Excel — Scalyo analyse et visualise vos données automatiquement")
      ),
      importedData && React.createElement("button", {
        onClick:()=>{setImportedData(null);setImportFileName("");setSelectedColumns([]);},
        className:"btn-base",
        style:{padding:"8px 16px",borderRadius:9,fontWeight:700,fontSize:12,background:C.redBg,border:`1px solid ${C.redBorder}`,color:C.red}
      }, "✕ ", lang==="en" ? "Clear" : lang==="kr" ? "지우기" : "Effacer")
    ),
    /* ── Drop Zone ── */
    !importedData && React.createElement("div", {
      className:`import-drop-zone${dragOver?" drag-over":""}`,
      onDragOver:e=>{e.preventDefault();setDragOver(true);},
      onDragLeave:()=>setDragOver(false),
      onDrop:e=>{
        e.preventDefault();setDragOver(false);
        const f=e.dataTransfer.files[0];
        if(f) processFile(f);
      },
      onClick:()=>document.getElementById("kpi-file-input").click()
    },
      React.createElement("input", {type:"file",id:"kpi-file-input",accept:".csv,.xlsx,.xls",onChange:e=>{if(e.target.files[0])processFile(e.target.files[0]);}}),
      importLoading
        ? React.createElement("div", null,
            React.createElement("div", {style:{fontSize:28,marginBottom:8}}, "⏳"),
            React.createElement("div", {style:{fontSize:14,fontWeight:700}}, lang==="en" ? "Analyzing..." : lang==="kr" ? "분석 중..." : "Analyse en cours...")
          )
        : React.createElement("div", null,
            React.createElement("div", {style:{fontSize:42,marginBottom:10}}, "📂"),
            React.createElement("div", {style:{fontSize:15,fontWeight:800,marginBottom:4}}, lang==="en"?"Drop your file here":lang==="kr"?"파일을 여기에 드래그하세요":T("dropFile",lang)),
            React.createElement("div", {style:{fontSize:12,color:C.muted,marginBottom:12}}, lang==="en" ? "Supported formats: CSV, Excel (.xlsx, .xls)" : lang==="kr" ? "지원 형식: CSV, Excel (.xlsx, .xls)" : T("formats",lang)),
            React.createElement("button", {
              className:"btn-base",
              style:{padding:"9px 22px",borderRadius:6,fontWeight:800,fontSize:13,background:C.teal,color:"#FFFFFF"}
            }, lang==="en" ? "Browse file" : lang==="kr" ? "파일 찾기" : T("upload",lang))
          ),
      importError && React.createElement("div", {style:{marginTop:12,fontSize:12,color:C.red}}, "⚠ "+importError)
    ),
    /* ── Analysis Result ── */
    importedData && React.createElement("div", null,
      /* File info banner */
      React.createElement("div", {style:{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:6,marginBottom:16}},
        React.createElement("span", {style:{fontSize:20}}, "✅"),
        React.createElement("div", null,
          React.createElement("div", {style:{fontSize:13,fontWeight:800,color:C.green}}, importFileName),
          React.createElement("div", {style:{fontSize:11,color:C.muted}}, importedData.rows.length+" "+(lang==="en" ? "rows · " : lang==="kr" ? "행 · " : "lignes · ")+importedData.cols.length+" "+(lang==="en" ? "columns" : lang==="kr" ? "컬럼" : "colonnes"))
        )
      ),
      /* ── MAPPING KPIs AUTO-DETECT ── */
      Object.keys(kpiMapping).length > 0 && React.createElement("div", {
        style:{background:C.amberBg,border:`1px solid ${C.amberBorder}`,borderRadius:6,padding:"14px 16px",marginBottom:16}
      },
        React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
            React.createElement("span", null, "🔗"),
            React.createElement("span", {style:{fontSize:13,fontWeight:800,color:C.amber}},
              lang==="en" ? "KPI Mapping detected — auto-assign?" : lang==="kr" ? "KPI 매핑 감지됨 — 자동 할당?" : "Mapping KPIs détecté — auto-remplir ?"
            )
          ),
          mappingApplied && React.createElement("span", {style:{fontSize:11,fontWeight:800,color:C.green}}, "✓ "+(lang==="en" ? "Applied" : lang==="kr" ? "적용됨" : T("kpiApplied",lang)))
        ),
        React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}},
          Object.entries(kpiMapping).map(([kpiKey,colName])=>{
            const kpiLabels={mrr:"MRR",nps:"NPS",csat:"CSAT",renewalRate:lang==="en" ? "Renewal Rate" : lang==="kr" ? "갱신율" : "Taux Renouvellement",churned:lang==="en" ? "Churned" : lang==="kr" ? "이탈" : "Churns",newClients:lang==="en" ? "New Clients" : lang==="kr" ? "신규 고객" : T("kpiNewClients",lang),expansionRevenue:"Expansion Revenue",avgResolutionTime:lang==="en" ? "Avg Resolution" : lang==="kr" ? "평균 해결" : T("kpiResolution",lang)};
            const sampleVal = importedData.rows[0]?.[colName];
            return React.createElement("div", {key:kpiKey,style:{display:"flex",alignItems:"center",gap:6,background:C.surface,borderRadius:8,padding:"6px 10px",fontSize:11,border:`1px solid ${C.amberBorder}`}},
              React.createElement("span", {style:{color:C.muted}}, colName),
              React.createElement("span", {style:{color:C.amber}}, "→"),
              React.createElement("span", {style:{fontWeight:800,color:C.text}}, kpiLabels[kpiKey]||kpiKey),
              sampleVal!=null&&React.createElement("span", {style:{color:C.muted,marginLeft:2}}, "(ex: "+String(sampleVal)+")")
            );
          })
        ),
        React.createElement("div", {style:{display:"flex",gap:8}},
          React.createElement("button", {
            onClick:()=>{
              // Appliquer le mapping : prendre la dernière ligne (ou la moyenne pour NPS/CSAT)
              const lastRow = importedData.rows[importedData.rows.length-1];
              const updates={};
              Object.entries(kpiMapping).forEach(([kpiKey,colName])=>{
                const val=parseFloat(lastRow?.[colName])||0;
                if(val>0) updates[kpiKey]=val;
              });
              setKpis(p=>({...p,...updates}));
              setMappingApplied(true);
            },
            className:"btn-base",
            style:{padding:"8px 18px",borderRadius:9,fontWeight:800,fontSize:12,background:C.amber,color:"#FFFFFF"}
          }, lang==="en" ? "Apply mapping (last row)" : lang==="kr" ? "매핑 적용 (마지막 행)" : T("kpiApply",lang)),
          React.createElement("button", {
            onClick:()=>{
              // Appliquer la moyenne
              const updates={};
              Object.entries(kpiMapping).forEach(([kpiKey,colName])=>{
                const vals=importedData.rows.map(r=>parseFloat(r[colName])||0).filter(v=>v>0);
                if(vals.length>0) updates[kpiKey]=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
              });
              setKpis(p=>({...p,...updates}));
              setMappingApplied(true);
            },
            className:"btn-base",
            style:{padding:"8px 18px",borderRadius:9,fontWeight:800,fontSize:12,background:C.surface,border:`1px solid ${C.amberBorder}`,color:C.amber}
          }, lang==="en" ? "Apply mapping (average)" : lang==="kr" ? "매핑 적용 (평균)" : "Appliquer (moyenne)")
        )
      ),
      /* ── COMPARAISON N vs N-1 ── */
      React.createElement("div", {style:{marginBottom:16}},
        React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
          React.createElement("div", {style:{fontSize:12,fontWeight:700,color:C.muted}}, lang==="en" ? "📊 COMPARE WITH PERIOD N-1" : lang==="kr" ? "📊 N-1 기간과 비교" : "📊 COMPARER AVEC PÉRIODE N-1"),
          !compareFile && React.createElement("button", {
            onClick:()=>document.getElementById("kpi-compare-input").click(),
            className:"btn-base",
            style:{padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:11,background:C.surface,border:`1px solid ${C.border}`,color:C.muted}
          }, "＋ "+(lang==="en" ? "Import N-1 file" : lang==="kr" ? "N-1 파일 가져오기" : "Importer fichier N-1")),
          compareFile && React.createElement("button", {onClick:()=>{setCompareFile(null);setCompareFileName("");setShowCompare(false);},style:{background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.muted}}, "✕ "+(lang==="en" ? "Remove" : lang==="kr" ? "제거" : "Retirer"))
        ),
        React.createElement("input", {type:"file",id:"kpi-compare-input",accept:".csv,.xlsx,.xls",style:{display:"none"},onChange:e=>{
          const f=e.target.files[0];
          if(!f)return;
          setCompareFileName(f.name);setCompareLoading(true);
          const isXls=/\.(xlsx|xls)$/i.test(f.name);
          const reader=new FileReader();
          if(isXls){reader.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:"array"});const ws=wb.Sheets[wb.SheetNames[0]];const json=XLSX.utils.sheet_to_json(ws,{defval:""});const headers=Object.keys(json[0]||{});const cols=headers.map(h=>({name:h,type:detectColType(json.map(r=>r[h]))}));cols.forEach(c=>{if(c.type==="number")json.forEach(r=>{r[c.name]=parseFloat(r[c.name])||0;});});setCompareFile({cols,rows:json});setShowCompare(true);}catch(e){}setCompareLoading(false);};reader.readAsArrayBuffer(f);}
          else{reader.onload=ev=>{try{const r=parseCSV(ev.target.result);if(r){setCompareFile(r);setShowCompare(true);}}catch(e){}setCompareLoading(false);};reader.readAsText(f,"UTF-8");}
        }}),
        compareLoading && React.createElement("div", {style:{fontSize:12,color:C.muted,padding:"8px 0"}}, "⏳ "+(lang==="en" ? "Loading..." : lang==="kr" ? "로딩 중..." : "Chargement...")),
        showCompare && compareFile && (() => {
          const numColsCurr = importedData.cols.filter(c=>c.type==="number");
          const commonCols = numColsCurr.filter(c=>compareFile.cols.some(cc=>cc.name===c.name&&cc.type==="number"));
          if(commonCols.length===0) return React.createElement("div",{style:{fontSize:12,color:C.amber,padding:"8px 0"}}, lang==="en" ? "⚠ No common numeric columns found" : lang==="kr" ? "⚠ 공통 숫자 컬럼을 찾을 수 없음" : T("kpiNoNumeric",lang));
          return React.createElement("div", {className:"chart-container",style:{marginTop:8}},
            React.createElement("div", {style:{fontSize:12,fontWeight:800,marginBottom:10,color:C.text}},
              "📊 "+(lang==="en" ? "N vs N-1 Comparison" : lang==="kr" ? "N vs N-1 비교" : "Comparaison N vs N-1"),
              React.createElement("span", {style:{fontSize:10,color:C.muted,marginLeft:8}}, importFileName+" vs "+compareFileName)
            ),
            React.createElement("div", {style:{overflowX:"auto"}},
              React.createElement("table", {className:"analysis-table"},
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    React.createElement("th", null, lang==="en" ? "KPI" : lang==="kr" ? "KPI" : "KPI"),
                    React.createElement("th", null, lang==="en" ? "Period N (current)" : lang==="kr" ? "기간 N (현재)" : T("kpiPeriodN",lang)),
                    React.createElement("th", null, lang==="en" ? "Period N-1" : lang==="kr" ? "기간 N-1" : T("kpiPeriodN1",lang)),
                    React.createElement("th", null, lang==="en" ? "Δ Variation" : lang==="kr" ? "Δ 변동" : "Δ Variation"),
                    React.createElement("th", null, lang==="en" ? "Trend" : lang==="kr" ? "추세" : "Tendance")
                  )
                ),
                React.createElement("tbody", null,
                  commonCols.slice(0,8).map((col,ci)=>{
                    const CHART_COLORS2=["#4DB6A0","#529CCA","#E8A838","#9B6BDF","#EB5757","#4DAB6D"];
                    const valsCurr=importedData.rows.map(r=>parseFloat(r[col.name])||0);
                    const valsPrev=compareFile.rows.map(r=>parseFloat(r[col.name])||0);
                    const avgCurr=valsCurr.length>0?valsCurr.reduce((a,b)=>a+b,0)/valsCurr.length:0;
                    const avgPrev=valsPrev.length>0?valsPrev.reduce((a,b)=>a+b,0)/valsPrev.length:0;
                    const delta=avgPrev>0?(avgCurr-avgPrev)/avgPrev*100:0;
                    const isUp=delta>1,isDown=delta<-1;
                    return React.createElement("tr", {key:ci},
                      React.createElement("td", {style:{color:CHART_COLORS2[ci%CHART_COLORS2.length],fontWeight:800}}, col.name),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace",fontWeight:800}}, avgCurr.toFixed(1)),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace",color:C.muted}}, avgPrev.toFixed(1)),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:isUp?C.green:isDown?C.red:C.amber}},
                        (delta>0?"+":"")+delta.toFixed(1)+"%"
                      ),
                      React.createElement("td", {style:{fontSize:16}}, isUp?"📈":isDown?"📉":"➡️")
                    );
                  })
                )
              )
            )
          );
        })()
      ),
      /* Detected columns summary */
      React.createElement("div", {style:{marginBottom:16}},
        React.createElement("div", {style:{fontSize:12,fontWeight:700,color:C.muted,marginBottom:8}}, lang==="en" ? "DETECTED COLUMNS" : lang==="kr" ? "감지된 컬럼" : "COLONNES DÉTECTÉES"),
        React.createElement("div", {style:{display:"flex",gap:6,flexWrap:"wrap"}},
          importedData.cols.map((col,i)=>
            React.createElement("div", {
              key:i,
              className:"import-col-badge",
              style:{cursor:"pointer",background:selectedColumns.includes(col.name)?C.tealBg:"",borderColor:selectedColumns.includes(col.name)?C.teal:C.border,color:selectedColumns.includes(col.name)?C.teal:C.muted},
              onClick:()=>setSelectedColumns(p=>p.includes(col.name)?p.filter(c=>c!==col.name):[...p,col.name])
            },
              React.createElement("span", null, col.type==="date"?"📅":col.type==="number"?"🔢":"🔤"),
              React.createElement("span", null, col.name),
              React.createElement("span", {style:{opacity:.5}}, col.type)
            )
          )
        ),
        React.createElement("div", {style:{fontSize:10,color:C.muted,marginTop:5}}, lang==="en" ? "Click columns to include in charts" : lang==="kr" ? "차트에 포함할 컬럼을 클릭하세요" : T("kpiChartHint",lang))
      ),
      /* Chart type selector */
      React.createElement("div", {style:{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}},
        [
          {id:"auto",label:lang==="en" ? "🤖 Auto" : lang==="kr" ? "🤖 자동" : "🤖 Auto"},
          {id:"line",label:lang==="en" ? "📈 Line" : lang==="kr" ? "📈 선형" : "📈 Courbe"},
          {id:"bar",label:lang==="en" ? "📊 Bar" : lang==="kr" ? "📊 막대" : "📊 Barres"},
          {id:"area",label:lang==="en" ? "🌊 Area" : lang==="kr" ? "🌊 영역" : "🌊 Aire"}
        ].map(ct=>
          React.createElement("button", {
            key:ct.id,
            className:`chart-type-btn${selectedChartType===ct.id?" active":""}`,
            onClick:()=>setSelectedChartType(ct.id)
          }, ct.label)
        )
      ),
      /* Auto-generated charts */
      (() => {
        const numCols = importedData.cols.filter(c=>c.type==="number");
        const dateCols = importedData.cols.filter(c=>c.type==="date");
        const strCols = importedData.cols.filter(c=>c.type==="string");
        const activeCols = selectedColumns.length > 0
          ? importedData.cols.filter(c=>selectedColumns.includes(c.name)&&c.type==="number")
          : numCols.slice(0,3);
        const labelCol = selectedColumns.length > 0
          ? importedData.cols.find(c=>selectedColumns.includes(c.name)&&(c.type==="date"||c.type==="string"))
          : (dateCols[0]||strCols[0]);
        const chartMode = selectedChartType==="auto" ? (dateCols.length>0?"line":"bar") : selectedChartType;
        if(activeCols.length===0) return React.createElement("div", {style:{textAlign:"center",padding:24,color:C.muted}}, lang==="en" ? "Select numeric columns to display charts" : lang==="kr" ? "차트 표시를 위한 숫자 컬럼 선택" : T("kpiNumericHint",lang));
        const CHART_COLORS=["#4DB6A0","#529CCA","#E8A838","#9B6BDF","#EB5757","#4DAB6D","#FB923C"];
        const rows = importedData.rows.slice(0,50);
        const labels = labelCol ? rows.map(r=>String(r[labelCol.name]||"").slice(0,10)) : rows.map((_,i)=>String(i+1));
        const maxVal = Math.max(...activeCols.flatMap(c=>rows.map(r=>parseFloat(r[c.name])||0)),1);
        const svgH=160,svgW=600,pad={l:40,r:20,t:20,b:40};
        const chartW=svgW-pad.l-pad.r, chartH=svgH-pad.t-pad.b;
        const nRows=rows.length, barW=chartMode==="bar"?chartW/nRows*0.7/activeCols.length:0;
        return React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:14}},
          /* Main SVG Chart */
          React.createElement("div", {className:"chart-container"},
            React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
              React.createElement("div", {style:{fontSize:12,fontWeight:800}}, lang==="en" ? "Chart View" : lang==="kr" ? "차트 보기" : "Vue Graphique"),
              React.createElement("div", {style:{display:"flex",gap:10,flexWrap:"wrap"}},
                activeCols.map((c,ci)=>React.createElement("div", {key:ci,style:{display:"flex",alignItems:"center",gap:4,fontSize:11}},
                  React.createElement("div", {style:{width:10,height:10,borderRadius:2,background:CHART_COLORS[ci%CHART_COLORS.length]}}),
                  React.createElement("span", {style:{color:C.muted}}, c.name)
                ))
              )
            ),
            React.createElement("div", {style:{overflowX:"auto"}},
              React.createElement("svg", {viewBox:`0 0 ${svgW} ${svgH}`,style:{width:"100%",minWidth:300,height:svgH}},
                /* Grid lines */
                [0,.25,.5,.75,1].map((f,i)=>
                  React.createElement("line", {key:i,x1:pad.l,x2:svgW-pad.r,y1:pad.t+chartH*(1-f),y2:pad.t+chartH*(1-f),stroke:C.border,strokeWidth:1})
                ),
                /* Y axis labels */
                [0,.5,1].map((f,i)=>
                  React.createElement("text", {key:i,x:pad.l-4,y:pad.t+chartH*(1-f)+4,textAnchor:"end",fontSize:8,fill:C.muted}, Math.round(maxVal*f))
                ),
                /* Data */
                activeCols.map((col,ci)=>{
                  const color=CHART_COLORS[ci%CHART_COLORS.length];
                  const vals=rows.map(r=>parseFloat(r[col.name])||0);
                  if(chartMode==="line"||chartMode==="area") {
                    const pts=vals.map((v,i)=>({
                      x:pad.l+i*(chartW/(nRows-1||1)),
                      y:pad.t+chartH*(1-v/maxVal)
                    }));
                    const pathD=pts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ");
                    const areaD=pathD+" L"+pts[pts.length-1].x.toFixed(1)+","+(pad.t+chartH)+" L"+pad.l+","+(pad.t+chartH)+" Z";
                    return React.createElement("g", {key:ci},
                      chartMode==="area"&&React.createElement("path", {d:areaD,fill:color,opacity:.12}),
                      React.createElement("path", {d:pathD,fill:"none",stroke:color,strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}),
                      pts.map((p,i)=>React.createElement("circle", {key:i,cx:p.x,cy:p.y,r:2.5,fill:color}))
                    );
                  } else {
                    const groupW=chartW/nRows;
                    return React.createElement("g", {key:ci},
                      vals.map((v,i)=>{
                        const bh=v/maxVal*chartH;
                        const x=pad.l+i*groupW+ci*(groupW*0.7/activeCols.length)+(groupW*0.15);
                        return React.createElement("rect", {key:i,x:x,y:pad.t+chartH-bh,width:Math.max(barW,2),height:Math.max(bh,1),rx:2,fill:color,opacity:.9});
                      })
                    );
                  }
                }),
                /* X axis labels — show every Nth */
                (() => {
                  const step=Math.ceil(nRows/8);
                  return labels.filter((_,i)=>i%step===0||i===nRows-1).map((l,i)=>{
                    const idx=i*step>nRows-1?nRows-1:i*step;
                    return React.createElement("text", {key:i,x:pad.l+idx*(chartW/(nRows-1||1)),y:svgH-4,textAnchor:"middle",fontSize:7.5,fill:C.muted}, l);
                  });
                })()
              )
            )
          ),
          /* Summary stats table */
          React.createElement("div", {className:"chart-container"},
            React.createElement("div", {style:{fontSize:12,fontWeight:800,marginBottom:10}}, lang==="en" ? "📊 Statistical Analysis" : lang==="kr" ? "📊 통계 분석" : "📊 Analyse Statistique"),
            React.createElement("div", {style:{overflowX:"auto"}},
              React.createElement("table", {className:"analysis-table"},
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    React.createElement("th", null, lang==="en"?"Column":lang==="kr"?"컬럼":"Colonne"),
                    React.createElement("th", null, lang==="en" ? "Min" : lang==="kr" ? "최소" : "Min"),
                    React.createElement("th", null, lang==="en" ? "Max" : lang==="kr" ? "최대" : "Max"),
                    React.createElement("th", null, lang==="en" ? "Average" : lang==="kr" ? "평균" : "Moyenne"),
                    React.createElement("th", null, lang==="en" ? "Total" : lang==="kr" ? "합계" : "Total"),
                    React.createElement("th", null, lang==="en" ? "Trend" : lang==="kr" ? "추세" : "Tendance")
                  )
                ),
                React.createElement("tbody", null,
                  activeCols.map((col,ci)=>{
                    const vals=rows.map(r=>parseFloat(r[col.name])||0);
                    const mn=Math.min(...vals),mx=Math.max(...vals);
                    const avg=(vals.reduce((a,b)=>a+b,0)/vals.length);
                    const total=vals.reduce((a,b)=>a+b,0);
                    const trendVal=vals.length>2?(vals[vals.length-1]-vals[0])/Math.abs(vals[0]||1)*100:0;
                    const trendClass=trendVal>2?"trend-up":trendVal<-2?"trend-down":"trend-flat";
                    const trendLabel=trendVal>2?"↑ +"+(trendVal.toFixed(1))+"%":trendVal<-2?"↓ "+(trendVal.toFixed(1))+"%":(lang==="kr"?"→ 안정":"→ Stable");
                    return React.createElement("tr", {key:ci},
                      React.createElement("td", {style:{color:CHART_COLORS[ci%CHART_COLORS.length],fontWeight:800}}, col.name),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace"}}, mn.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace"}}, mx.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace"}}, avg.toFixed(2)),
                      React.createElement("td", {style:{fontFamily:"'JetBrains Mono',monospace"}}, total.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")),
                      React.createElement("td", {className:trendClass,fontWeight:800}, trendLabel)
                    );
                  })
                )
              )
            )
          ),
          /* Top 5 rows preview */
          React.createElement("div", {className:"chart-container"},
            React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
              React.createElement("div", {style:{fontSize:12,fontWeight:800}}, lang==="en" ? "📋 Data Preview (first 10 rows)" : lang==="kr" ? "📋 데이터 미리보기 (상위 10행)" : "📋 Aperçu des données (10 premières lignes)"),
              React.createElement("span", {style:{fontSize:11,color:C.muted}}, importedData.rows.length+" "+(lang==="en" ? "total rows" : lang==="kr" ? "총 행" : "lignes au total"))
            ),
            React.createElement("div", {style:{overflowX:"auto"}},
              React.createElement("table", {className:"analysis-table"},
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    importedData.cols.map((c,i)=>React.createElement("th", {key:i}, c.name))
                  )
                ),
                React.createElement("tbody", null,
                  importedData.rows.slice(0,10).map((row,ri)=>
                    React.createElement("tr", {key:ri},
                      importedData.cols.map((c,ci)=>React.createElement("td", {key:ci,style:{fontFamily:c.type==="number"?"'JetBrains Mono',monospace":"inherit"}}, String(row[c.name]!=null?row[c.name]:"—")))
                    )
                  )
                )
              )
            )
          )
        );
      })()
    )
  ), tab === "copil" && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700
    }
  }, /*#__PURE__*/React.createElement(Card, {
    glow: true,
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      letterSpacing: "-0.3px"
    }
  }, lang==="en" ? "COPIL Report — Customer Success" : lang==="kr" ? "COPIL 보고서 — Customer Success" : "Rapport COPIL \u2014 Customer Success"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginTop: 3
    }
  }, lang==="kr"?"기간 : ":lang==="en"?"Period: ":"Période : ", periodLabel)), /*#__PURE__*/React.createElement(Tag, {
    color: C.teal,
    size: "xs"
  }, lang==="kr"?"발표 준비 완료":lang==="en"?"Ready to present":"Prêt à présenter")), [{
    title: lang==="kr"?"💰 매출 성과":lang==="en"?"💰 Revenue Performance":"💰 Performance Revenus",
    items: [{
      label: "MRR",
      val: `${kpis.mrr.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")} €`,
      obj: goals.mrr > 0 ? lang==="kr"?`목표: ${goals.mrr.toLocaleString("ko-KR")} €`:lang==="en"?`Target: ${goals.mrr.toLocaleString("en-US")} €`:`Objectif : ${goals.mrr.toLocaleString("fr-FR")} €` : ""
    }, {
      label: lang==="en" ? "Churn Rate" : lang==="kr" ? "이탈률" : "Taux de Churn",
      val: `${churnRate}%`,
      status: lang==="en" ? (churnRate > 5 ? "⚠ High" : churnRate > 2 ? "→ Moderate" : "✓ Healthy") : (churnRate > 5 ? T("kpiHigh",lang) : churnRate > 2 ? lang==="en" ? "→ Moderate" : lang==="kr" ? "→ 보통" : T("kpiMod",lang) : "✓ Sain")
    }, {
      label: "NRR",
      val: `${nrr}%`,
      status: nrr >= 100 ? (lang==="kr" ? "✓ 순 확장" : lang==="en" ? "✓ Net Expansion" : "✓ Expansion nette") : nrr >= 90 ? (lang==="kr" ? "→ 안정" : lang==="en" ? "→ Stable" : "→ Stable") : (lang==="kr" ? "⚠ 수축" : lang==="en" ? "⚠ Contraction" : "⚠ Contraction")
    }, {
      label: lang==="en" ? "Expansion Revenue" : lang==="kr" ? "확장 매출" : "Revenu d'expansion",
      val: `${kpis.expansionRevenue.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")} €`
    }]
  }, {
    title: lang==="kr"?"⭐ 고객 만족도":lang==="en"?"⭐ Customer Satisfaction":"⭐ Satisfaction Client",
    items: [{
      label: "NPS",
      val: kpis.nps || "—",
      obj: goals.nps > 0 ? lang==="kr"?`목표: ${goals.nps}`:lang==="en"?`Target: ${goals.nps}`:`Objectif : ${goals.nps}` : "",
      status: kpis.nps >= 50 ? (lang==="kr"?"✓ 우수":"✓ Excellent") : kpis.nps >= 30 ? (lang==="kr" ? "→ 좋음" : lang==="en" ? "→ Good" : "→ Bon") : (lang==="kr" ? "⚠ 개선 필요" : lang==="en" ? "⚠ To improve" : T("kpiWarn",lang))
    }, {
      label: "CSAT",
      val: `${kpis.csat || "—"}/10`,
      status: kpis.csat >= 8 ? (lang==="kr"?"✓ 우수":"✓ Excellent") : kpis.csat >= 6 ? (lang==="kr" ? "→ 양호" : lang==="en" ? "→ OK" : "→ Correct") : (lang==="kr" ? "⚠ 개선 필요" : lang==="en" ? "⚠ To improve" : T("kpiWarn",lang))
    }, {
      label: lang==="en"?"Renewal Rate":lang==="kr"?"갱신률":"Taux de Renouvellement",
      val: `${kpis.renewalRate}%`,
      status: kpis.renewalRate >= 85 ? (lang==="kr" ? "✓ 좋음" : lang==="en" ? "✓ Good" : "✓ Bon") : kpis.renewalRate >= 70 ? (lang==="kr"?"→ 적정":"→ Acceptable") : (lang==="kr" ? "⚠ 개선 필요" : lang==="en" ? "⚠ To improve" : T("kpiWarn",lang))
    }]
  }, {
    title: lang==="kr"?"💼 포트폴리오":lang==="en"?"💼 Portfolio":"💼 Portefeuille",
    items: [{
      label: lang==="en" ? "Total accounts" : lang==="kr" ? "총 계정" : T("kpiTotalAccounts",lang),
      val: totalClients
    }, {
      label: lang==="en" ? "New clients" : lang==="kr" ? "신규 고객" : T("kpiNewClients",lang),
      val: kpis.newClients
    }, {
      label: lang==="en" ? "Churned clients" : lang==="kr" ? "이탈 고객" : "Clients churned",
      val: kpis.churned
    }, {
      label: lang==="en" ? "Critical accounts" : lang==="kr" ? "위험 계정" : "Comptes critiques",
      val: accounts?.filter(a => a.risk === "critical").length || 0,
      status: (accounts?.filter(a => a.risk === "critical").length || 0) > 0 ? (lang==="en" ? "⚠ Warning" : lang==="kr" ? "⚠ 주의" : "⚠ Attention") : "✓ OK"
    }]
  }, {
    title: lang==="kr"?"⚙️ 운영 성과":T("kpiOpsPerf",lang),
    items: [{
      label: lang==="en" ? "Resolved tickets" : lang==="kr" ? "해결된 티켓" : T("kpiTicketsResolved",lang),
      val: `${kpis.resolvedTickets} / ${kpis.openTickets + kpis.resolvedTickets}`,
      status: lang==="en"?`${ticketResRate}% resolved`:lang==="kr"?`${ticketResRate}% 해결됨`:`${ticketResRate}% résolution`
    }, {
      label: lang==="en" ? "Average resolution time" : lang==="kr" ? "평균 해결 시간" : T("kpiResolutionAvg",lang),
      val: `${kpis.avgResolutionTime}h`,
      status: kpis.avgResolutionTime > 48 ? (lang==="kr"?"⚠ 길다":"⚠ Long") : kpis.avgResolutionTime > 0 ? "✓ OK" : "—"
    }, {
      label: lang==="en" ? "Avg Time to Value" : lang==="kr" ? "평균 가치 실현 시간" : "Time to Value moyen",
      val: `${kpis.avgTimeToValue} ${lang==="kr"?"일":lang==="en"?"days":"jours"}`
    }]
  }].map((section, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: C.teal,
      marginBottom: 10,
      paddingBottom: 6,
      borderBottom: `1px solid ${C.border}`
    }
  }, section.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, section.items.map((item, ii) => /*#__PURE__*/React.createElement("div", {
    key: ii,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 13,
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, item.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, item.obj && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.faint
    }
  }, item.obj), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      color: C.text,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, item.val), item.status && /*#__PURE__*/React.createElement(Tag, {
    color: item.status.startsWith("✓") ? C.green : item.status.startsWith("⚠") ? C.red : C.amber,
    size: "xs"
  }, item.status))))))),
  /* ── SECTION KPIs PERSONNALISÉS DANS LE COPIL ── */
  customKpis.length > 0 && React.createElement("div", {style:{marginBottom:20}},
    React.createElement("div", {style:{fontSize:13,fontWeight:800,color:C.purple,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${C.border}`}},
      lang==="en" ? "🎯 Custom KPIs" : lang==="kr" ? "🎯 맞춤 KPI" : T("kpiCustomTitle",lang)
    ),
    React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:6}},
      customKpis.map((k,ki)=>{
        const fmtV=(v)=>{
          if(k.type==="currency") return v.toLocaleString(lang==="kr"?"ko-KR":lang==="en"?"en-US":"fr-FR")+" €";
          if(k.type==="percent") return v+"%";
          if(k.type==="score") return v+"/10";
          if(k.type==="days") return v+(lang==="kr"?" 일":lang==="en"?" days":" jours");
          return v+(k.unit?" "+k.unit:"");
        };
        const ok=k.goal>0?k.value>=k.goal:null;
        const pct=k.goal>0?Math.round(k.value/k.goal*100):null;
        return React.createElement("div", {key:ki,style:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,padding:"4px 0"}},
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
            React.createElement("div", {style:{width:8,height:8,borderRadius:50,background:k.color,flexShrink:0}}),
            React.createElement("span", {style:{color:C.muted}}, k.name)
          ),
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:10}},
            k.goal>0&&React.createElement("span", {style:{fontSize:11,color:C.faint}}, (lang==="kr"?"목표: ":lang==="en"?"Target: ":"Obj: ")+fmtV(k.goal)),
            React.createElement("span", {style:{fontWeight:800,color:k.color,fontFamily:"'JetBrains Mono',monospace"}}, fmtV(k.value)),
            ok!==null&&React.createElement(Tag, {
              color:ok?C.green:pct>70?C.amber:C.red,size:"xs"
            }, ok?"✓ OK":("⚠ "+pct+"%"))
          )
        );
      })
    )
  ),
  /* ── SECTION ALERTES ACTIVES DANS LE COPIL ── */
  activeAlerts.length > 0 && React.createElement("div", {style:{marginBottom:20}},
    React.createElement("div", {style:{fontSize:13,fontWeight:800,color:C.red,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${C.border}`}},
      "🚨 "+(lang==="en" ? "Active Alerts" : lang==="kr" ? "활성 알림" : "Alertes Actives")+" ("+activeAlerts.length+")"
    ),
    React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:4}},
      activeAlerts.map((al,ali)=>
        React.createElement("div", {key:ali,style:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"6px 10px",background:al.level==="critical"?"rgba(235,87,87,0.08)":"rgba(245,158,11,0.07)",borderRadius:8}},
          React.createElement("span", null, al.icon," ",al.msg),
          React.createElement("span", {style:{fontWeight:800,color:al.level==="critical"?C.red:C.amber,fontSize:10}},
            al.level==="critical"?(lang==="kr"?"⚠ 위험":lang==="en"?"⚠ CRITICAL":"⚠ CRITIQUE"):(lang==="kr"?"→ 주의":lang==="en"?"→ Warning":"→ Attention")
          )
        )
      )
    )
  )
  )));
};
const CS_COACH_RESPONSES = {
  churn: {
    trigger: ["churn", "churner", "partir", "résilier", "résilier", "perte", "perdre", "quitter", "cancel", "cancellation", "losing client", "leave", "at risk", "risk account", "prevent churn"],
    answer: `**Stratégie anti-churn — Framework d'intervention**\n\n1. **Détection précoce (J−60)** : Mettre en place des alertes sur 3 signaux clés :\n   • Baisse usage > 30% sur 2 semaines\n   • Silence email > 10 jours\n   • NPS < 6 à la dernière mesure\n\n2. **Triage du risque** :\n   • Risque faible → email de vérification + rapport d'usage\n   • Risque moyen → appel CSM dans les 5 jours\n   • Risque élevé → escalade manager + plan de remédiation\n\n3. **Appel d'urgence** : Préparez 3 questions ouvertes sur la valeur perçue, pas sur le produit.\n\n4. **Plan de sauvetage** : Objectif SMART sur 30 jours, sponsor identifié, point hebdo.\n\nVoulez-vous que je vous aide à rédiger le script pour l'appel d'urgence ?`
  },
  onboarding: {
    trigger: ["onboarding", "accueil", "démarrage", "activation", "nouveau client", "new client", "getting started", "kickoff", "first steps", "onboard"],
    answer: `**Framework Onboarding B2B — J0 à J60**\n\n**J0 → J7 (Activation)** :\n• Email de bienvenue < 2h après signature\n• Appel kick-off dans les 48h\n• Configuration de base + 1er quick win identifié\n\n**J8 → J30 (Adoption)** :\n• Formation utilisateurs clés (2h max, enregistrée)\n• Définir 3 KPIs de succès avec le client\n• Check-in hebdomadaire (30 min)\n\n**J31 → J60 (Expansion)** :\n• Premier rapport d'usage partagé\n• NPS check informel\n• Identification des utilisateurs champions\n• Présentation roadmap produit\n\n**Métriques d'activation à surveiller** :\n→ Taux de connexion J7 : objectif > 70%\n→ Features activées J30 : objectif > 3\n→ Score d'adoption J60 : objectif > 65/100`
  },
  nps: {
    trigger: ["nps", "satisfaction", "score", "promoteur", "détracteur", "promoter", "detractor", "passive", "survey", "improve nps", "net promoter"],
    answer: `**Améliorer son NPS — Plan d'action 60 jours**\n\n**Pourquoi votre NPS stagne ?**\nLes 3 causes les plus fréquentes :\n1. Écart entre valeur promise et valeur perçue\n2. Points de friction non résolus (onboarding, support)\n3. Manque de contact proactif entre les moments clés\n\n**Plan 60 jours** :\n\n*Semaines 1-2* : Fermer la boucle avec vos détracteurs (score 0-6)\n→ Appel personnalisé, plan d'action documenté, suivi 2 semaines\n\n*Semaines 3-4* : Activer vos passifs (score 7-8)\n→ Partager des ressources ciblées, inviter à un événement\n\n*Semaines 5-6* : Transformer les promoteurs en ambassadeurs\n→ Programme de référencement, témoignage, cas client\n\n**Quick win** : Un NPS collecté toutes les 90 jours est insuffisant. Passez au NPS transactionnel sur les moments clés (post-onboarding, post-support, J180).`
  },
  qbr: {
    trigger: ["qbr", "bilan", "trimestriel", "revue", "compte-rendu", "réunion", "quarterly", "business review", "meeting", "qbr structure", "exec review"],
    answer: `**Structure QBR B2B — Revue Trimestrielle**\n\n**Durée recommandée** : 45 minutes\n\n**Agenda type** :\n\n1. **Résultats du trimestre** (10 min)\n   • KPIs vs objectifs définis ensemble\n   • Comparaison avec le trimestre précédent\n   • ROI calculé et chiffré\n\n2. **Points d'attention & actions menées** (10 min)\n   • Ce qui a bien fonctionné\n   • Les obstacles rencontrés et comment ils ont été résolus\n\n3. **Objectifs trimestre suivant** (15 min)\n   • 2-3 objectifs SMART co-définis\n   • Ressources nécessaires côté client\n   • Jalons de suivi intermédiaires\n\n4. **Roadmap & innovations** (5 min)\n   • Nouvelles features disponibles pertinentes\n   • Beta ou early access si applicable\n\n5. **Questions ouvertes** (5 min)\n   → "Qu'est-ce que vous attendez encore de nous ?" est la question à ne pas manquer.\n\n**Erreur fréquente** : Faire un QBR axé sur le produit plutôt que sur les résultats business du client.`
  },
  burnout: {
    trigger: ["burnout", "épuisement", "stress", "surcharge", "charge", "bien-être", "fatigue", "wellbeing", "team stress", "overload", "exhaustion", "csm burnout", "team health"],
    answer: `**Prévention du burnout CSM — Signaux & actions**\n\n**Signaux d'alerte précoce** :\n• Satisfaction < 6/10 lors des check-ins\n• Augmentation des erreurs ou des délais\n• Diminution de la communication proactive\n• Comptes critiques > 30% du portefeuille\n\n**Actions de prévention** :\n\n*Pour le manager* :\n→ Check-in mensuel individuel focalisé sur le ressenti, pas les KPIs\n→ Redistribution proactive des comptes critiques avant surcharge\n→ Célébrer les victoires, même petites\n→ Former à la gestion des clients difficiles (rôle-play)\n\n*Pour le CSM* :\n→ Bloquer 2h/semaine de travail en profondeur (no meetings)\n→ Batching des urgences : 2 créneaux/jour de 30 min\n→ Documenter les comptes complexes pour réduire la charge mentale\n→ Communiquer proactivement les surcharges à son manager\n\n**Indicateur clé** : Un taux de charge > 80% maintenu > 4 semaines est un signal d'alerte critique.`
  },
  expansion: {
    trigger: ["expansion", "upsell", "upgrade", "cross-sell", "développer", "croissance", "arriver", "grow account", "expand", "upsell strategy", "upgrade client", "cross sell"],
    answer: `**Stratégie d'expansion client — PACT Framework**\n\n**P — Patience** : N'abordez l'expansion qu'une fois l'adoption prouvée (score > 70/100, NPS ≥ 7)\n\n**A — Ancrage valeur** : Calculez et montrez le ROI concret AVANT de parler d'upgrade\n   → "Vous avez économisé X h/mois = Y€ de valeur créée"\n\n**C — Contexte business** : L'expansion doit répondre à un besoin émergent identifié, pas à vos objectifs de vente\n\n**T — Timing** : Les 3 meilleurs moments pour l'expansion :\n   1. Après un succès notable (quick win)\n   2. Avant un renouvellement (J−90)\n   3. Lors d'un changement organisationnel chez le client\n\n**Script d'amorçage** :\n*"Je vois que vous utilisez [Feature X] de façon intensive. Avez-vous pensé à [Feature Y] qui ferait exactement la même chose pour [équipe Z] ?"*\n\n**Piège à éviter** : Proposer l'expansion lors d'un compte en difficulté. Stabilisez d'abord, développez ensuite.`
  },
  default: {
    answer: `**Bonjour ! Je suis votre Coach CS. 💚**\n\nJe peux vous aider sur :\n\n• **Anti-churn** : Protocoles, scripts, plans de remédiation\n• **Onboarding** : Structure J0→J60, KPIs d'activation\n• **NPS** : Amélioration du score, fermeture de boucle\n• **QBR** : Structure, agenda, questions clés\n• **Expansion** : Identification des opportunités, timing\n• **Bien-être équipe** : Prévention burnout, charge de travail\n\nPosez-moi une question spécifique sur votre situation CS et je vous fournirai des conseils actionnables.`
  }
};

const CS_COACH_RESPONSES_EN = {
  churn: {
    answer: `**Anti-Churn Strategy — Intervention Framework**

1. **Early detection (D−60)**: Set up alerts on 3 key signals:
   • Usage drop > 30% over 2 weeks
   • Email silence > 10 days
   • NPS < 6 at last measurement

2. **Risk triage**:
   • Low risk → usage report + check-in email
   • Medium risk → CSM call within 5 days
   • High risk → manager escalation + rescue plan

3. **Emergency call**: Prepare 3 open-ended questions about perceived value — not about the product.

4. **Rescue plan**: SMART goal over 30 days, sponsor identified, weekly touchpoint.

Would you like me to help you draft the emergency call script?`
  },
  onboarding: {
    answer: `**B2B Onboarding Framework — Day 0 to Day 60**

**D0 → D7 (Activation)**:
• Welcome email < 2h after signing
• Kickoff call within 48h
• Basic setup + first quick win identified

**D8 → D30 (Adoption)**:
• Train key users (2h max, recorded)
• Define 3 success KPIs with the client
• Weekly check-in (30 min)

**D31 → D60 (Expansion)**:
• First usage report shared
• Informal NPS check
• Champion users identified
• Product roadmap presented

**Activation metrics to watch**:
→ Login rate D7: target > 70%
→ Features activated D30: target > 3
→ Adoption score D60: target > 65/100`
  },
  nps: {
    answer: `**Improving NPS — 60-day Action Plan**

**Why is your NPS stagnating?**
The 3 most common causes:
1. Gap between promised value and perceived value
2. Unresolved friction points (onboarding, support)
3. Lack of proactive contact between key moments

**60-day plan**:

*Weeks 1–2*: Close the loop with your detractors (score 0–6)
→ Personalized call, documented action plan, 2-week follow-up

*Weeks 3–4*: Activate your passives (score 7–8)
→ Share targeted resources, invite to an event

*Weeks 5–6*: Turn promoters into advocates
→ Referral program, testimonial, client case study

**Quick win**: Collecting NPS every 90 days is not enough. Switch to transactional NPS at key moments (post-onboarding, post-support, D180).`
  },
  qbr: {
    answer: `**B2B QBR Structure — Quarterly Business Review**

**Recommended duration**: 45 minutes

**Agenda**:

1. **Quarter results** (10 min)
   • KPIs vs. jointly defined goals
   • Comparison with previous quarter
   • Calculated and quantified ROI

2. **Key points & actions taken** (10 min)
   • What worked well
   • Obstacles encountered and how they were resolved

3. **Next quarter goals** (15 min)
   • 2–3 SMART goals co-defined
   • Resources needed on the client side
   • Intermediate milestones

4. **Roadmap & innovations** (5 min)
   • Relevant new features available
   • Beta or early access if applicable

5. **Open questions** (5 min)
   → "What are you still waiting for from us?" — the question you must not miss.

**Common mistake**: Running a product-focused QBR instead of focusing on the client's business results.`
  },
  burnout: {
    answer: `**CSM Burnout Prevention — Signals & Actions**

**Early warning signals**:
• Satisfaction < 6/10 during check-ins
• Increase in errors or delays
• Decrease in proactive communication
• Critical accounts > 30% of portfolio

**Prevention actions**:

*For the manager*:
→ Monthly 1:1 focused on feelings, not KPIs
→ Proactive account redistribution before overload hits
→ Celebrate wins, even small ones
→ Train on handling difficult clients (role-play)

*For the CSM*:
→ Block 2h/week for deep work (no meetings)
→ Batch urgent tasks: 2 × 30-min slots per day
→ Document complex accounts to reduce mental load
→ Proactively flag overload to your manager

**Key indicator**: A workload rate > 80% sustained for > 4 weeks is a critical warning signal.`
  },
  expansion: {
    answer: `**Client Expansion Strategy — PACT Framework**

**P — Patience**: Only approach expansion once adoption is proven (score > 70/100, NPS ≥ 7)

**A — Anchor value**: Calculate and show concrete ROI BEFORE talking about an upgrade
   → "You've saved X hours/month = €Y in value created"

**C — Business context**: Expansion must address an emerging need identified, not your sales targets

**T — Timing**: The 3 best moments for expansion:
   1. After a notable success (quick win)
   2. Before renewal (D−90)
   3. During an organizational change at the client

**Opening script**:
*"I see you're using [Feature X] intensively. Have you thought about [Feature Y] which would do the same thing for [Team Z]?"*

**Pitfall to avoid**: Proposing expansion while the account is struggling. Stabilize first, expand later.`
  },
  default: {
    answer: `**Hello! I'm your CS Coach. 💚**

I can help you with:

• **Anti-churn**: Protocols, scripts, rescue plans
• **Onboarding**: D0→D60 structure, activation KPIs
• **NPS**: Score improvement, closing the loop
• **QBR**: Structure, agenda, key questions
• **Expansion**: Opportunity identification, timing
• **Team wellbeing**: Burnout prevention, workload management

Ask me a specific question about your CS situation and I'll provide actionable advice.`
  }
};

const COACH_KB = [
  {
    triggers: ["churn","churner","résiliation","résilier","attrition","perdre client","client parti","client perdu","départ client","désabonnement"],
    answer: `**Réduire le churn : framework en 4 étapes**

**1. Identifier les signaux d'alerte précoce**
→ Usage en baisse >20% sur 3 semaines
→ Absence aux EBR/QBR consécutifs
→ Changement de champion/interlocuteur
→ Tickets support en hausse sans résolution

**2. Agir AVANT la période de renouvellement**
→ Lancer un Save Plan à J-90 minimum
→ Meeting exécutif pour recadrer la valeur
→ Quick Win visible en moins de 2 semaines

**3. Structurer l'analyse post-churn**
→ Exit interview systématique (taux de réponse : >60% si contacté en 48h)
→ Catégoriser : prix / produit / service / champion parti

**4. Les métriques clés à suivre**
→ Net Revenue Retention (NRR) > 100% = bonne santé
→ Gross Revenue Retention (GRR) > 85% pour le SaaS
→ Time to First Value (TTFV) < 30 jours

**Quelle partie veux-tu approfondir ?**`
  },
  {
    triggers: ["qbr","ebr","business review","revue","quarterly","copil","réunion stratégique","bilan trimestriel"],
    answer: `**Structure QBR/EBR haute impact — 60 minutes**

**Slide 1 — Rappel des objectifs (5 min)**
→ Rappeler les engagements pris au dernier QBR
→ Contexte : évolution de leur business depuis

**Slide 2 — Valeur délivrée (15 min)**
→ ROI mesurable (économies, temps gagné, revenus)
→ Métriques clés vs. baseline à l'onboarding
→ Témoignage/success story interne si possible

**Slide 3 — Santé du compte (10 min)**
→ Health score et évolution
→ Adoption : fonctionnalités utilisées vs. disponibles
→ Tickets résolus, délais, satisfaction

**Slide 4 — Axes d'amélioration (10 min)**
→ Ce qui n'a pas fonctionné (soyez honnêtes — ça renforce la confiance)
→ Plan correctif déjà en cours

**Slide 5 — Plan Q+1 (15 min)**
→ 3 objectifs maximum, mesurables
→ Propriétaires identifiés des deux côtés
→ Prochaine milestone à 30 jours

**Slide 6 — Opportunités (5 min)**
→ Expansion naturelle si compte sain (upsell, nouveaux cas d'usage)

💡 **Tips** : Envoyer l'agenda 5 jours avant. Inviter un sponsor exécutif côté client. Enregistrer avec accord.`
  },
  {
    triggers: ["nps","satisfaction","csat","score","promoteur","détracteur","enquête","survey"],
    answer: `**Améliorer le NPS : méthode Close the Loop**

**Comprendre d'abord**
→ NPS < 30 : urgence, problème systémique
→ NPS 30-50 : marge de progression, travailler les passifs
→ NPS > 50 : capitaliser sur les promoteurs

**Actions par segment**
🔴 **Détracteurs (0-6)** — Contacter dans les 24h
→ Call personnalisé par le CSM ou manager
→ Écouter sans défendre
→ Plan d'action écrit avec engagement de délai

🟡 **Passifs (7-8)** — Convertir en promoteurs
→ Identifier le "gap" entre attente et réalité
→ Quick Win personnalisé
→ Formation sur fonctionnalités sous-utilisées

🟢 **Promoteurs (9-10)** — Activer comme ambassadeurs
→ Programme de référencement
→ Case study / témoignage
→ Accès anticipé aux nouvelles fonctionnalités

**Quand envoyer ?**
→ Après onboarding (J+30)
→ Après chaque QBR
→ Pulse trimestriel (pas plus fréquent)

**Quel est ton NPS actuel ?**`
  },
  {
    triggers: ["onboarding","intégration","démarrage","nouveau client","kick-off","kickoff","lancement"],
    answer: `**Onboarding CS haute performance : le modèle en 3 phases**

**Phase 1 — Quick Wins (J0-J30)**
→ Kick-off dans les 72h après signature
→ Définir 1 use case prioritaire (pas 5)
→ Objectif : 1 victoire visible et mesurable avant J30
→ Success metric : "Time to First Value" < 30 jours

**Phase 2 — Adoption (J30-J90)**
→ Formation des utilisateurs finaux (pas que le champion)
→ Intégrations clés configurées
→ Processus internes du client adaptés à l'outil
→ Check-in hebdomadaire J30-J60, bimensuel J60-J90

**Phase 3 — Expansion (J90+)**
→ Premier QBR : valeur prouvée vs. objectifs
→ Identifier nouveaux cas d'usage
→ Présenter la roadmap produit
→ Transition "onboarding" → "partenariat"

**Templates essentiels**
✅ Welcome email séquencé (J0, J3, J7, J14, J30)
✅ Checklist onboarding partagée (Notion ou Scalyo)
✅ Scorecard de progression hebdomadaire

**Quel aspect de l'onboarding veux-tu optimiser ?**`
  },
  {
    triggers: ["health","santé","score santé","health score","rouge","orange","vert","risque","compte à risque"],
    answer: `**Health Score : construire un modèle fiable**

**Les 4 dimensions clés**

📊 **Usage (40% du score)**
→ Fréquence de connexion
→ Fonctionnalités clés utilisées
→ Nombre d'utilisateurs actifs / licences payées

💬 **Engagement (25% du score)**
→ Réponse aux emails/calls CSM
→ Présence aux QBR
→ Champion accessible ou changé récemment

🎯 **Outcomes (25% du score)**
→ Objectifs atteints vs. définis à l'onboarding
→ ROI mesurable documenté

💳 **Santé contractuelle (10% du score)**
→ Renouvellement > 90 jours = vert
→ Renouvellement < 30 jours = rouge
→ Paiements en retard = signal d'alarme

**Seuils recommandés**
🟢 Vert : 70-100 → mode expansion
🟡 Orange : 40-69 → intervention proactive
🔴 Rouge : 0-39 → save plan immédiat

**Cadence de mise à jour**
→ Usage : automatique (intégration produit)
→ Engagement : hebdomadaire par CSM
→ Review complète : mensuelle en équipe

**Sur combien de comptes tu travailles actuellement ?**`
  },
  {
    triggers: ["expansion","upsell","cross-sell","upgrade","revenus","arr","mrr","croissance","revenue"],
    answer: `**Stratégie d'expansion : transformer les clients en moteur de croissance**

**Le principe : NRR > 100%**
Chaque euro de churn doit être compensé par l'expansion. Objectif NRR 110-130% pour un SaaS B2B sain.

**3 leviers d'expansion**

🔼 **Upsell (plan supérieur)**
→ Déclencher quand l'usage atteint 80% des limites du plan actuel
→ ROI de la mise à niveau doit être évident et chiffré
→ Ne jamais proposer avant d'avoir prouvé la valeur

➡️ **Cross-sell (modules complémentaires)**
→ Identifier les processus adjacents non couverts
→ Timing : après 6 mois d'usage actif minimum
→ Partir d'un problème réel, pas d'un catalogue

👥 **Expansion siège / licences**
→ Tracker l'adoption par département
→ Identifier les power users qui peuvent devenir champions internes
→ Business case pour le service acheteur

**Le signal parfait pour proposer**
→ Client a atteint ses objectifs initiaux ✅
→ NPS ≥ 8 ✅
→ Champion engagé et visible ✅
→ Renouvellement > 6 mois ✅

**Quel est le profil de tes comptes actuellement ?**`
  },
  {
    triggers: ["playbook","processus","template","procédure","standardiser","automatiser","workflow"],
    answer: `**Playbooks CS : les 5 indispensables**

**1. Playbook Onboarding**
→ De la signature au premier succès client
→ Étapes, propriétaires, délais, livrables

**2. Playbook At-Risk / Save Plan**
→ Déclencheurs d'activation (health score rouge, silence > 14j)
→ Escalade : CSM → Manager → C-Level
→ Sortie de crise : 30/60/90 jours

**3. Playbook QBR/EBR**
→ Préparation (J-7 : agenda, data, slides)
→ Conduite de réunion
→ Suivi (J+1 : recap, J+30 : revue d'avancement)

**4. Playbook Expansion**
→ Critères de qualification
→ Conversation valeur → proposition commerciale
→ Handoff avec l'équipe Sales

**5. Playbook Offboarding**
→ Exit interview
→ Analyse cause racine
→ Feedback produit

**Structure d'un bon playbook**
→ Déclencheur clair (quand l'activer ?)
→ Actions séquentielles (qui fait quoi ?)
→ Ressources (templates, emails, scripts)
→ Métriques de succès

**Tu veux qu'on construise un de ces playbooks ensemble ?**`
  },
  {
    triggers: ["burnout","épuisement professionnel","burn-out","craquer","à bout","plus tenir","fond du trou","déprimé","dépression","surcharge mentale","overload"],
    answer: `**Burnout dans le CS : reconnaître et agir**

**Les 3 phases du burnout**
🟡 **Phase 1 — Fatigue chronique**
→ Épuisement persistant malgré le repos
→ Procrastination inhabituelle
→ Irritabilité, difficultés de concentration

🟠 **Phase 2 — Détachement**
→ Cynisme envers les clients ou collègues
→ Sentiment d'inefficacité
→ Absentéisme ponctuel

🔴 **Phase 3 — Effondrement**
→ Incapacité à travailler
→ Symptômes physiques (insomnies, maux de tête)
→ Intervention médicale nécessaire

**Actions immédiates si tu te reconnais**
1. **Nommer** : Dire à voix haute "je suis en burnout" retire une partie de la charge
2. **Réduire la charge** : Identifier les 3 tâches les moins critiques à déléguer ou reporter
3. **En parler** : Manager, RH, médecin du travail — ne pas rester seul(e)
4. **Protéger le sommeil** : C'est la base de la récupération

**Pour les managers**
→ Score bien-être < 5/10 pendant 2 semaines = alerte rouge
→ Réduire le portefeuille de 20% temporairement
→ Proposer un congé de récupération, pas juste "du courage"

**Signal important** : Le burnout n'est pas une faiblesse. C'est une réponse physiologique normale à une surcharge prolongée.

Tu veux qu'on explore ce que tu ressens en ce moment ? 💚`
  },
  {
    triggers: ["équipe","team","csm","manager","lead","leadership","organiser","répartition","charge","portefeuille"],
    answer: `**Structurer une équipe CS performante**

**Ratios de couverture (benchmarks SaaS)**
→ CSM Enterprise : 10-15 comptes max
→ CSM Mid-Market : 30-50 comptes
→ CSM SMB avec outils d'automatisation : 100-200 comptes
→ Ratio ARR/CSM : 1-2M€ en mid-market, 3-5M€ en enterprise

**Segmentation recommandée**
→ Tier 1 (top 20% ARR) : CSM dédié, touchpoints fréquents
→ Tier 2 (mid) : CSM partagé, approche semi-automatisée
→ Tier 3 (long tail) : digital-first, self-service, automation

**Métriques d'équipe à monitorer**
→ NRR par CSM
→ Taux de churn par portefeuille
→ NPS moyen des comptes gérés
→ Taux de QBR réalisés vs. planifiés
→ Temps de réponse moyen

**Réunions d'équipe essentielles**
→ Daily standup (15 min) : comptes à risque
→ Weekly review (45 min) : pipeline renouvellements
→ Monthly : analyse NRR, playbooks, best practices

**Quel est la taille de ton équipe actuellement ?**`
  },
  {
    triggers: ["bonjour","salut","hello","bonsoir","coucou","aide","besoin","comment","aidez"],
    answer: `Bonjour ! Je suis votre Coach CS expert. Je peux vous aider sur :

**📉 Réduction du churn** — Signaux, save plans, stratégies
**📊 QBR/EBR** — Structure, contenu, best practices
**😊 NPS & Satisfaction** — Mesure, amélioration, close the loop
**🚀 Onboarding** — Framework, templates, Time to Value
**💚 Health Score** — Modèle, seuils, actions
**📈 Expansion** — Upsell, cross-sell, NRR > 100%
**📋 Playbooks** — Standardiser vos processus CS
**👥 Équipe CS** — Organisation, ratios, métriques

Posez votre question ou cliquez sur un sujet ci-dessous !`
  }
,
  {
    triggers:["présentation","presentation","slides","pitch","deck","powerpoint","support visuel","préparer une présentation","aide présentation"],
    answer:`**Préparer une présentation CS percutante**

**Structure recommandée (45 min)**

• **Accroche** : commence par un chiffre clé ou une réalité terrain
• **Contexte & objectifs** : rappel de la situation, ce qu'on a accompli
• **Résultats chiffrés** : KPIs vs objectifs, ROI calculé, 1 success story
• **Points d'attention** : honnêteté = confiance + plan d'action avec délais
• **Roadmap & prochaines étapes** : 2-3 objectifs SMART co-construits
• **Closing** : terminer par "Qu'est-ce qui vous freinerait à atteindre cet objectif ?"

**💡 Erreurs fréquentes**
• Trop de slides (max 10-12)
• Parler produit plutôt que résultats business
• Pas adapter au niveau de l'audience (ops vs C-level)

Pour quel type de présentation ? (QBR, onboarding, interne, COPIL...)`
  },
  {
    triggers:["augmentation","salaire","négociation salariale","revalorisation","promotion","demander une augmentation","sous-payé","sous-payée"],
    answer:`**Demander une augmentation — Stratégie CS**

**1. Chiffre ton impact** (indispensable)
• MRR ou ARR géré
• Taux de rétention vs objectif
• Comptes sauvés, upsells générés, NPS amélioré

**2. Benchmarke le marché**
→ Glassdoor, LinkedIn Salary, Welcome to the Jungle
→ CS Analyst/Manager France : 35-55k€ selon expérience et taille de portefeuille

**3. Timing idéal**
• Après une victoire récente (client sauvé, gros renouvellement)
• Entretien annuel ou mi-année
• Jamais en période de tension dans l'équipe

**Script d'ouverture**
→ "Ces 12 derniers mois, j'ai géré X clients pour Y€ MRR avec Z% de rétention. Je souhaite qu'on parle de ma rémunération pour refléter cet impact."

Veux-tu qu'on prépare ensemble ton argumentaire personnalisé ?`
  },
  {
    triggers: ["qbr","ebr","business review","revue trimestrielle","quarterly","copil","réunion stratégique","bilan trimestriel"],
    answer: `**QBR/EBR efficace : préparer et animer**

**Structure 5 blocs (60 min)**
1. Rappel des objectifs initiaux (5 min)
2. Résultats business du client (15 min)
3. Valeur délivrée en ROI chiffré (15 min)
4. Challenges ouverts + plan d'action (15 min)
5. Objectifs du prochain trimestre (10 min)

**Ce qui fait une QBR mémorable**
→ Commencer par une surprise positive
→ Un moment de vérité honnête sur ce qui n'a pas marché
→ 2-3 actions concrètes avec propriétaire et date

→ Quel est votre prochain EBR ?`
  },
  {
    triggers: ["health score","santé compte","compte risque","à risque","compte rouge","compte orange","scoring client"],
    answer: `**Health Score CS : construire et utiliser**

**4 dimensions** : Usage (35%), Engagement (25%), Sentiment (20%), Business fit (20%)

**Seuils** :
→ Rouge (<40) : intervention immédiate
→ Orange (40-70) : plan d'action sous 2 semaines
→ Vert (>70) : mode expansion

→ Quel compte vous préoccupe ?`
  },
  {
    triggers: ["expansion","upsell","cross sell","upgrade","développer compte","monter en gamme"],
    answer: `**Expansion CS : convertir la valeur en revenus**

**Le bon timing**
• Client a atteint ses objectifs initiaux
• Usage au maximum du plan actuel

**Ouvrir la conversation**
→ "J'ai remarqué que vous utilisez X à 90% — comment gérez-vous la partie encore manuelle ?"
→ Laissez le client identifier lui-même le gap

→ Quel compte a le potentiel ?`
  },
  {
    triggers: ["playbook","processus cs","standardiser","documenter process","runbook","workflow client"],
    answer: `**Construire un playbook CS efficace**

**5 playbooks fondamentaux** : Onboarding, QBR/EBR, Save Play, Expansion, Offboarding

→ Prenez votre meilleur process intuitif
→ Documentez en 30 min
→ Faites tester par un collègue
→ Affinez sur 2-3 cycles

→ Quel playbook souhaitez-vous construire ?`
  },
  {
    triggers: ["client difficile","client agressif","client exigeant","plainte client","insatisfait","mécontent client"],
    answer: `**Gérer un client difficile**

• Ne répondez jamais dans le feu de l'émotion
• Par téléphone : laissez-les parler complètement
• Validez : "Je comprends votre frustration, c'est légitime"
• Reformulez : "Si je comprends bien, votre principale préoccupation est..."

→ Si irrespectueux : impliquez votre manager — ce n'est pas un échec

→ Quelle est la situation avec ce client ?`
  }
];

const COACH_KB_EN = [
  {
    triggers: ["churn","churner","attrition","losing client","lost client","client left","cancellation","cancel"],
    answer: `**Reducing churn: 4-step framework**

**1. Identify early warning signals**
→ Usage drop >20% over 3 weeks
→ Missing consecutive EBRs/QBRs
→ Change in champion/main contact
→ Rising support tickets without resolution

**2. Act BEFORE the renewal period**
→ Launch a Save Plan at D-90 minimum
→ Executive meeting to realign on value
→ Visible Quick Win in less than 2 weeks

**3. Structure your post-churn analysis**
→ Systematic exit interview (>60% response rate if contacted within 48h)
→ Categorize: price / product / service / champion left

**4. Key metrics to track**
→ Net Revenue Retention (NRR) > 100% = healthy
→ Gross Revenue Retention (GRR) > 85% for SaaS
→ Time to First Value (TTFV) < 30 days

**Which part would you like to go deeper on?**`
  },
  {
    triggers: ["qbr","ebr","business review","quarterly","quarterly review","strategic meeting","quarterly debrief"],
    answer: `**High-impact QBR/EBR structure — 60 minutes**

**Slide 1 — Objective recap (5 min)**
→ Revisit commitments from last QBR
→ Context: how has their business evolved since?

**Slide 2 — Value delivered (15 min)**
→ Measurable ROI (savings, time gained, revenue)
→ Key metrics vs. baseline at onboarding
→ Internal testimonial or success story if possible

**Slide 3 — Account health (10 min)**
→ Health score and trend
→ Adoption: features used vs. available
→ Tickets resolved, SLAs, satisfaction

**Slide 4 — Areas for improvement (10 min)**
→ What didn't work (honesty builds trust)
→ Corrective plan already in progress

**Slide 5 — Q+1 plan (15 min)**
→ Max 3 measurable objectives
→ Owners identified on both sides
→ Next milestone in 30 days

**Slide 6 — Opportunities (5 min)**
→ Natural expansion if account is healthy

💡 **Tips**: Send the agenda 5 days before. Invite an executive sponsor from the client side. Record with consent.`
  },
  {
    triggers: ["nps","satisfaction","csat","score","promoter","detractor","survey","feedback"],
    answer: `**Improving NPS: Close the Loop method**

**Understand first**
→ NPS < 30: urgent, systemic problem
→ NPS 30-50: room for improvement, work on passives
→ NPS > 50: capitalize on promoters

**Actions by segment**
🔴 **Detractors (0-6)** — Contact within 24h
→ Personal call from CSM or manager
→ Listen without defending
→ Written action plan with committed timeline

🟡 **Passives (7-8)** — Convert to promoters
→ Identify the gap between expectation and reality
→ Personalized Quick Win
→ Training on underused features

🟢 **Promoters (9-10)** — Activate as ambassadors
→ Referral program
→ Case study / testimonial
→ Early access to new features

**When to send?**
→ After onboarding (D+30)
→ After each QBR
→ Quarterly pulse (no more frequently)

**What is your current NPS?**`
  },
  {
    triggers: ["onboarding","integration","new client","kick-off","kickoff","launch","getting started"],
    answer: `**High-performance CS onboarding: the 3-phase model**

**Phase 1 — Quick Wins (D0-D30)**
→ Kick-off within 72h of signature
→ Define 1 priority use case (not 5)
→ Goal: 1 visible, measurable win before D30
→ Success metric: Time to First Value < 30 days

**Phase 2 — Adoption (D30-D90)**
→ End-user training (not just the champion)
→ Key integrations configured
→ Client's internal processes adapted to the tool
→ Weekly check-in D30-D60, bi-weekly D60-D90

**Phase 3 — Expansion (D90+)**
→ First QBR: proven value vs. objectives
→ Identify new use cases
→ Present product roadmap
→ Transition from "onboarding" to "partnership"

**Essential templates**
✅ Sequenced welcome emails (D0, D3, D7, D14, D30)
✅ Shared onboarding checklist (Notion or Scalyo)
✅ Weekly progress scorecard

**Which aspect of onboarding do you want to optimize?**`
  },
  {
    triggers: ["health","health score","red","orange","green","risk","at-risk","account risk"],
    answer: `**Health Score: building a reliable model**

**The 4 key dimensions**

📊 **Usage (40% of score)**
→ Login frequency
→ Key features used
→ Active users / paid licenses

💬 **Engagement (25% of score)**
→ Response to CSM emails/calls
→ QBR attendance
→ Champion accessible or recently changed

🎯 **Outcomes (25% of score)**
→ Goals achieved vs. defined at onboarding
→ Measurable documented ROI

💳 **Contractual health (10% of score)**
→ Renewal > 90 days = green
→ Renewal < 30 days = red
→ Late payments = alarm signal

**Recommended thresholds**
🟢 Green: 70-100 → expansion mode
🟡 Orange: 40-69 → proactive intervention
🔴 Red: 0-39 → immediate save plan

**How many accounts are you currently managing?**`
  },
  {
    triggers: ["expansion","upsell","cross-sell","upgrade","revenue","arr","mrr","growth"],
    answer: `**Expansion strategy: turning clients into a growth engine**

**The principle: NRR > 100%**
Every euro of churn must be compensated by expansion. Target NRR 110-130% for a healthy B2B SaaS.

**3 expansion levers**

🔼 **Upsell (higher plan)**
→ Trigger when usage reaches 80% of current plan limits
→ ROI of the upgrade must be obvious and quantified
→ Never propose before proving value

➡️ **Cross-sell (additional modules)**
→ Identify adjacent uncovered processes
→ Timing: after 6 months of active use minimum
→ Start from a real problem, not a catalogue

👥 **Seat/license expansion**
→ Track adoption by department
→ Identify power users who can become internal champions
→ Business case for the procurement team

**The perfect signal to propose**
→ Client has achieved initial goals ✅
→ NPS ≥ 8 ✅
→ Champion engaged and visible ✅
→ Renewal > 6 months ✅

**What does your current account profile look like?**`
  },
  {
    triggers: ["playbook","process","template","procedure","standardize","automate","workflow"],
    answer: `**CS Playbooks: the 5 essentials**

**1. Onboarding Playbook**
→ From signature to first customer success
→ Steps, owners, timelines, deliverables

**2. At-Risk / Save Plan Playbook**
→ Activation triggers (red health score, silence > 14d)
→ Escalation: CSM → Manager → C-Level
→ Recovery: 30/60/90 days

**3. QBR/EBR Playbook**
→ Preparation (D-7: agenda, data, slides)
→ Meeting facilitation
→ Follow-up (D+1: recap, D+30: progress review)

**4. Expansion Playbook**
→ Qualification criteria
→ Value conversation → commercial proposal
→ Handoff with Sales team

**5. Offboarding Playbook**
→ Exit interview
→ Root cause analysis
→ Product feedback

**Structure of a good playbook**
→ Clear trigger (when to activate?)
→ Sequential actions (who does what?)
→ Resources (templates, emails, scripts)
→ Success metrics

**Want to build one of these playbooks together?**`
  },
  {
    triggers: ["burnout","exhaustion","burn-out","cracking","overwhelmed","overload","mental health","wellbeing","stressed"],
    answer: `**Burnout in CS: recognize and act**

**The 3 phases of burnout**
🟡 **Phase 1 — Chronic fatigue**
→ Persistent exhaustion despite rest
→ Unusual procrastination
→ Irritability, difficulty concentrating

🟠 **Phase 2 — Detachment**
→ Cynicism toward clients or colleagues
→ Feeling of ineffectiveness
→ Occasional absenteeism

🔴 **Phase 3 — Collapse**
→ Inability to work
→ Physical symptoms (insomnia, headaches)
→ Medical intervention needed

**Immediate actions if you recognize yourself**
1. **Name it**: Saying "I'm burning out" out loud removes part of the burden
2. **Reduce load**: Identify the 3 least critical tasks to delegate or postpone
3. **Talk about it**: Manager, HR, occupational doctor — don't stay alone
4. **Protect sleep**: This is the foundation of recovery

**For managers**
→ Wellbeing score < 5/10 for 2 weeks = red alert
→ Temporarily reduce portfolio by 20%
→ Offer recovery leave, not just "courage"

**Important signal**: Burnout is not a weakness. It's a normal physiological response to prolonged overload.

Would you like to explore what you're feeling right now? 💚`
  },
  {
    triggers: ["team","csm","manager","lead","leadership","organize","distribution","workload","portfolio"],
    answer: `**Building a high-performance CS team**

**Coverage ratios (SaaS benchmarks)**
→ Enterprise CSM: 10-15 accounts max
→ Mid-Market CSM: 30-50 accounts
→ SMB CSM with automation tools: 100-200 accounts
→ ARR/CSM ratio: €1-2M in mid-market, €3-5M in enterprise

**Recommended segmentation**
→ Tier 1 (top 20% ARR): dedicated CSM, frequent touchpoints
→ Tier 2 (mid): shared CSM, semi-automated approach
→ Tier 3 (long tail): digital-first, self-service, automation

**Team metrics to monitor**
→ NRR per CSM
→ Churn rate per portfolio
→ Average NPS of managed accounts
→ QBR completion rate vs. planned
→ Average response time

**Essential team meetings**
→ Daily standup (15 min): at-risk accounts
→ Weekly review (45 min): renewal pipeline
→ Monthly: NRR analysis, playbooks, best practices

**What is the size of your team currently?**`
  },
  {
    triggers: ["hello","hi","hey","help","need","how","assist","good morning","good afternoon"],
    answer: `Hello! I'm your expert CS Coach. I can help you with:

**📉 Churn reduction** — Signals, save plans, strategies
**📊 QBR/EBR** — Structure, content, best practices
**😊 NPS & Satisfaction** — Measurement, improvement, close the loop
**🚀 Onboarding** — Framework, templates, Time to Value
**💚 Health Score** — Model, thresholds, actions
**📈 Expansion** — Upsell, cross-sell, NRR > 100%
**📋 Playbooks** — Standardize your CS processes
**👥 CS Team** — Organization, ratios, metrics

Ask your question or click a topic below!`
  }
];

const CS_COACH_RESPONSES_KR = {
  churn: {
    answer: `**이탈 방지 전략 — 개입 프레임워크**

1. **조기 감지 (D-60)**: 3가지 핵심 신호에 알림 설정:
   • 2주간 사용량 30% 이상 감소
   • 이메일 무응답 10일 이상
   • 최근 NPS 6 미만

2. **리스크 분류**:
   • 낮은 리스크 → 사용량 리포트 + 확인 이메일
   • 중간 리스크 → 5일 내 CSM 전화
   • 높은 리스크 → 매니저 에스컬레이션 + 구제 계획

3. **긴급 통화**: 제품이 아닌, 인지된 가치에 대한 개방형 질문 3개 준비

4. **구제 계획**: 30일 SMART 목표, 스폰서 확인, 주간 터치포인트

긴급 통화 스크립트 작성을 도와드릴까요?`
  },
  onboarding: {
    answer: `**B2B 온보딩 프레임워크 — D0~D60**

**D0 → D7 (활성화)**:
• 계약 후 2시간 내 환영 이메일
• 48시간 내 킥오프 콜
• 기본 설정 + 첫 번째 퀵윈 확인

**D8 → D30 (도입)**:
• 핵심 사용자 교육 (최대 2시간, 녹화)
• 고객과 성공 KPI 3개 정의
• 주간 체크인 (30분)

**D31 → D60 (확장)**:
• 첫 사용량 리포트 공유
• 비공식 NPS 확인
• 챔피언 사용자 파악
• 제품 로드맵 프레젠테이션

**모니터링 활성화 지표**:
→ D7 로그인률: 목표 > 70%
→ D30 활성화 기능: 목표 > 3개
→ D60 도입 점수: 목표 > 65/100`
  },
  nps: {
    answer: `**NPS 개선 — 60일 실행 계획**

**NPS가 정체되는 이유는?**
가장 흔한 3가지 원인:
1. 약속된 가치와 인지된 가치 간의 격차
2. 해결되지 않은 마찰점 (온보딩, 지원)
3. 핵심 순간 사이 사전적 연락 부족

**60일 계획**:

*1~2주차*: 비추천 고객 대응 (점수 0-6)
→ 개인화된 통화, 문서화된 실행 계획, 2주 후 후속 조치

*3~4주차*: 중립 고객 활성화 (점수 7-8)
→ 맞춤 리소스 공유, 이벤트 초대

*5~6주차*: 추천 고객을 옹호자로 전환
→ 추천 프로그램, 후기, 고객 사례 연구

**퀵윈**: 90일마다 NPS 수집으로는 부족합니다. 핵심 순간(온보딩 후, 지원 후, D180)에 거래 NPS로 전환하세요.`
  },
  qbr: {
    answer: `**B2B QBR 구조 — 분기별 비즈니스 리뷰**

**권장 시간**: 45분

**어젠다**:

1. **분기 실적** (10분)
   • 공동 정의된 목표 대비 KPI
   • 이전 분기와 비교
   • 계산 및 정량화된 ROI

2. **핵심 사항 & 조치** (10분)
   • 잘 된 것
   • 발생한 장애와 해결 방법

3. **다음 분기 목표** (15분)
   • 공동 정의된 2~3개 SMART 목표
   • 고객 측 필요 리소스
   • 중간 마일스톤

4. **로드맵 & 혁신** (5분)
   • 관련 새 기능 소개
   • 베타 또는 얼리 액세스

5. **자유 질문** (5분)
   → "아직 저희에게 기대하시는 것이 있으신가요?" — 놓치면 안 되는 질문

**흔한 실수**: 고객의 비즈니스 성과가 아닌 제품 중심으로 QBR을 진행하는 것.`
  },
  burnout: {
    answer: `**CSM 번아웃 예방 — 신호 & 조치**

**초기 경고 신호**:
• 체크인 시 만족도 < 6/10
• 실수나 지연 증가
• 사전적 커뮤니케이션 감소
• 위험 계정 > 포트폴리오의 30%

**예방 조치**:

*매니저 측*:
→ KPI가 아닌 감정에 초점을 맞춘 월간 1:1
→ 과부하 전 사전적 계정 재배분
→ 작은 성과도 축하하기
→ 어려운 고객 대응 교육 (롤플레이)

*CSM 측*:
→ 주 2시간 딥워크 블록 (미팅 없음)
→ 긴급 업무 배치: 하루 2 × 30분 슬롯
→ 복잡한 계정 문서화로 정신적 부담 경감
→ 과부하를 매니저에게 사전 보고

**핵심 지표**: 80% 이상의 업무량이 4주 이상 지속되면 위험 신호입니다.`
  },
  expansion: {
    answer: `**고객 확장 전략 — PACT 프레임워크**

**P — 인내(Patience)**: 도입이 입증된 후에만 확장 접근 (점수 > 70/100, NPS ≥ 7)

**A — 가치 앵커(Anchor)**: 업그레이드 이야기 전에 구체적인 ROI를 계산하고 보여주기
   → "월 X시간 절약 = €Y 가치 창출"

**C — 비즈니스 맥락(Context)**: 확장은 판매 목표가 아닌 파악된 신규 니즈를 해결해야 함

**T — 타이밍(Timing)**: 확장 최적 3가지 순간:
   1. 눈에 띄는 성공 후 (퀵윈)
   2. 갱신 전 (D-90)
   3. 고객사 조직 변화 시

**오프닝 스크립트**:
*"[기능 X]를 집중적으로 사용하고 계시네요. [팀 Z]에도 같은 효과를 줄 [기능 Y]를 고려해 보셨나요?"*

**피해야 할 함정**: 계정이 어려울 때 확장을 제안하는 것. 먼저 안정화, 그 다음 확장.`
  },
  default: {
    answer: `**안녕하세요! CS 코치입니다. 💚**

도움을 드릴 수 있는 분야:

• **이탈 방지**: 프로토콜, 스크립트, 구제 계획
• **온보딩**: D0→D60 구조, 활성화 KPI
• **NPS**: 점수 개선, 피드백 루프 닫기
• **QBR**: 구조, 어젠다, 핵심 질문
• **확장**: 기회 파악, 타이밍
• **팀 웰빙**: 번아웃 예방, 업무량 관리

CS 상황에 대한 구체적인 질문을 해주시면 실행 가능한 조언을 드리겠습니다.`
  }
};

const getCoachResponseKR = (msg) => {
  const lower = msg.toLowerCase();
  // Check EN knowledge base (same triggers work for Korean input)
  for (const item of COACH_KB_EN) {
    if (item.triggers.some(t => lower.includes(t))) {
      // Return Korean version from CS_COACH_RESPONSES_KR if matching key exists
      const matchKey = Object.keys(CS_COACH_RESPONSES_KR).find(k => k !== "default" && CS_COACH_RESPONSES[k]?.trigger?.some(t => item.triggers.includes(t)));
      if (matchKey) return CS_COACH_RESPONSES_KR[matchKey].answer;
      return item.answer; // Fallback to EN knowledge base
    }
  }
  // Korean triggers
  const KR_TRIGGERS = {
    churn: ["이탈", "해지", "떠나", "취소", "잃", "churn", "cancel"],
    onboarding: ["온보딩", "시작", "활성화", "신규 고객", "onboarding", "kickoff"],
    nps: ["nps", "만족도", "추천", "점수", "satisfaction"],
    qbr: ["qbr", "분기", "리뷰", "quarterly"],
    burnout: ["번아웃", "피로", "스트레스", "burnout", "과로"],
    expansion: ["확장", "업셀", "업그레이드", "expansion", "upsell"]
  };
  for (const [key, triggers] of Object.entries(KR_TRIGGERS)) {
    if (triggers.some(t => lower.includes(t))) return CS_COACH_RESPONSES_KR[key].answer;
  }
  // Also check FR/EN triggers
  for (const [key, val] of Object.entries(CS_COACH_RESPONSES)) {
    if (key === "default") continue;
    if (val.trigger && val.trigger.some(t => lower.includes(t)) && CS_COACH_RESPONSES_KR[key]) return CS_COACH_RESPONSES_KR[key].answer;
  }
  return CS_COACH_RESPONSES_KR.default.answer;
};

const getCoachResponseEN = (msg) => {
  const lower = msg.toLowerCase();
  for (const item of COACH_KB_EN) {
    if (item.triggers.some(t => lower.includes(t))) return item.answer;
  }
  for (const [key, val] of Object.entries(CS_COACH_RESPONSES_EN)) {
    if (key === "default") continue;
    if (val.answer && key !== "default") {
      const triggers = CS_COACH_RESPONSES[key]?.trigger || [];
      if (triggers.some(t => lower.includes(t))) return val.answer;
    }
  }
  return CS_COACH_RESPONSES_EN.default.answer;
};

const getCoachResponsense = (msg, lang) => {
  if (lang === "en") return getCoachResponseEN(msg);
  if (lang === "kr") return getCoachResponseKR(msg);
  const lower = msg.toLowerCase();
  // Check COACH_KB (richer answers) first
  for (const item of COACH_KB) {
    if (item.triggers.some(t => lower.includes(t))) return item.answer;
  }
  // Then CS_COACH_RESPONSES
  for (const [key, val] of Object.entries(CS_COACH_RESPONSES)) {
    if (key === "default") continue;
    if (val.trigger && val.trigger.some(t => lower.includes(t))) return val.answer;
  }
  return CS_COACH_RESPONSES.default.answer;
};
const formatMsg = (t) => renderMD(t);

