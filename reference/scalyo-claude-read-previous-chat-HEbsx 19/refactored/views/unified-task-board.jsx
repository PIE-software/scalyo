/**
 * Scalyo - UnifiedTaskBoard
 * Extracted from app.html (lines 5817-5906)
 */

const UnifiedTaskBoard = ({accounts=[], role="csm", lang="fr", companyId=null}) => {
  // État partagé des tâches entre Kanban et Eisenhower
  const [tasks, setTasks] = useState(() => getTasksFromLS());
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("scalyo_taskboard_tab") || "kanban"; } catch(e) { return "kanban"; }
  });

  // Chargement Supabase au montage
  useEffect(() => {
    if (!companyId) return;
    TaskDB.load(companyId).then(t => { if (t && t.length) setTasks(t); });
  }, [companyId]);

  const save = t => { setTasks(t); TaskDB.save(companyId, t); };
  const addTask = task => {
    const existing = tasks.findIndex(t => t.id === task.id);
    if (existing >= 0) { const n = [...tasks]; n[existing] = task; save(n); }
    else save([...tasks, task]);
  };
  const deleteTask = id => save(tasks.filter(t => t.id !== id));
  const toggleTask = id => save(tasks.map(t => t.id === id ? {...t, done: !t.done} : t));
  const moveTask = (id, quad) => save(tasks.map(t => t.id === id ? {...t, quadrant: quad} : t));

  const switchTab = (tab) => { setActiveTab(tab); try { localStorage.setItem("scalyo_taskboard_tab", tab); } catch(e){} };
  const tabs = [
    {key:"kanban", label:T("kanbanView",lang), icon:"\u{1F4CB}"},
    {key:"eisenhower", label:T("eisenhowerView",lang), icon:"\u{1F3AF}"}
  ];
  return React.createElement("div", {className:"fade-in", style:{padding:0,height:"100%",overflow:"auto"}},
    React.createElement("div", {style:{display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"20px 20px 0",marginBottom:0}},
      React.createElement("div", {style:{display:"flex",gap:2,background:C.surface,borderRadius:10,padding:3,border:"1px solid "+C.border}},
        tabs.map(function(tab) { return React.createElement("button", {
          key:tab.key,
          onClick:function(){switchTab(tab.key);},
          style:{
            padding:"6px 16px",borderRadius:8,fontSize:13,fontWeight:activeTab===tab.key?700:500,
            border:"none",cursor:"pointer",transition:"all .15s",
            background:activeTab===tab.key?C.bg:"transparent",
            color:activeTab===tab.key?C.text:C.muted,
            boxShadow:activeTab===tab.key?"0 1px 3px rgba(45,42,38,0.06)":"none"
          }
        }, tab.icon," ",tab.label); })
      )
    ),
    activeTab === "kanban"
      ? React.createElement(KanbanBoardView, {accounts:accounts, lang:lang, tasks:tasks, onUpdate:save, onAdd:addTask})
      : React.createElement(TaskBoardView, {accounts:accounts, role:role, lang:lang, companyId:companyId, sharedTasks:tasks, onSharedSave:save, onSharedAdd:addTask, onSharedDelete:deleteTask, onSharedToggle:toggleTask, onSharedMove:moveTask})
  );
};


// ══════════════════════════════════════════════════
// PLANNING VIEW — Calendrier + Sync Google/Outlook
// ══════════════════════════════════════════════════

const EVENT_COLORS=[
  {id:"teal",hex:"#4DB6A0"},{id:"blue",hex:"#3B82F6"},
  {id:"purple",hex:"#9B6BDF"},{id:"green",hex:"#4DAB6D"},
  {id:"amber",hex:"#E8A838"},{id:"red",hex:"#EB5757"}
];

const getEventsFromLS=()=>{try{const r=localStorage.getItem("scalyo_events");return r?JSON.parse(r):[];}catch(e){return [];}};
const saveEventsToLS=evs=>{try{localStorage.setItem("scalyo_events",JSON.stringify(evs));}catch(e){}};

const toICSDate=(dateStr,timeStr)=>{if(!dateStr)return"";const d=new Date(`${dateStr}T${timeStr||"00:00"}:00`);return d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";};
const buildGoogleLink=ev=>{const start=toICSDate(ev.date,ev.time);const end=toICSDate(ev.date,ev.endTime||ev.time);const p=new URLSearchParams({action:"TEMPLATE",text:ev.title,dates:`${start}/${end}`,details:[ev.note,ev.account?`Client: ${ev.account}`:""].filter(Boolean).join("\n")});return`https://www.google.com/calendar/render?${p.toString()}`;};
const buildOutlookLink=ev=>{const start=`${ev.date}T${ev.time||"09:00"}:00`;const end=`${ev.date}T${ev.endTime||ev.time||"10:00"}:00`;const p=new URLSearchParams({path:"/calendar/action/compose",rru:"addevent",subject:ev.title,startdt:start,enddt:end,body:[ev.note,ev.account?`Client: ${ev.account}`:""].filter(Boolean).join("\n")});return`https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;};
const exportICS=(evs,filename)=>{
  filename=filename||"scalyo-planning.ics";
  const dtFmt=(ds,ts)=>{if(!ds)return"";const[y,m,d]=ds.split("-");const[h,mi]=(ts||"09:00").split(":");return y+m+d+"T"+h+mi+"00";};
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Scalyo//FR","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  evs.forEach(function(ev){
    lines.push("BEGIN:VEVENT");
    lines.push("UID:"+ev.id+"@scalyo");
    lines.push("DTSTAMP:"+dtFmt(new Date().toISOString().slice(0,10),"00:00"));
    lines.push("DTSTART:"+dtFmt(ev.date,ev.time));
    lines.push("DTEND:"+dtFmt(ev.date,ev.endTime||ev.time));
    lines.push("SUMMARY:"+ev.title);
    if(ev.note)lines.push("DESCRIPTION:"+ev.note.replace(/\n/g,"\\n"));
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

