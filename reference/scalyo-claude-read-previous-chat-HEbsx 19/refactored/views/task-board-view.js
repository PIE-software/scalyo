/**
 * Scalyo - TaskBoardView
 * Extracted from app.html (lines 5635-5817)
 */

import { T } from '../shared/i18n-wrapper.js';


const TaskBoardView = ({accounts=[], role="csm", lang="fr", companyId=null, sharedTasks, onSharedSave, onSharedAdd, onSharedDelete, onSharedToggle, onSharedMove})=>{
  // Si tâches partagées depuis UnifiedTaskBoard, les utiliser ; sinon, état local (standalone)
  const [localTasks,setLocalTasks]=useState(()=>getTasksFromLS());
  const tasks = sharedTasks || localTasks;
  const [showAdd,setShowAdd]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [filter,setFilter]=useState("all");
  const [aiTip,setAiTip]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [defaultQuad,setDefaultQuad]=useState("q1");

  // Chargement Supabase au montage (seulement en mode standalone)
  useEffect(()=>{
    if(sharedTasks || !companyId) return;
    TaskDB.load(companyId).then(t=>{ if(t&&t.length) setLocalTasks(t); });
  },[companyId, sharedTasks]);

  const save=t=>{ if(onSharedSave) onSharedSave(t); else { setLocalTasks(t); TaskDB.save(companyId, t); } };
  const addTask=task=>{ if(onSharedAdd) onSharedAdd(task); else { const existing=tasks.findIndex(t=>t.id===task.id); if(existing>=0){const n=[...tasks];n[existing]=task;save(n);} else save([...tasks,task]); }};
  const deleteTask=id=>{ if(onSharedDelete) onSharedDelete(id); else save(tasks.filter(t=>t.id!==id)); };
  const toggleTask=id=>{ if(onSharedToggle) onSharedToggle(id); else save(tasks.map(t=>t.id===id?{...t,done:!t.done}:t)); };
  const moveTask=(id,quad)=>{ if(onSharedMove) onSharedMove(id,quad); else save(tasks.map(t=>t.id===id?{...t,quadrant:quad}:t)); };

  const filtered=filter==="all"?tasks:filter==="done"?tasks.filter(t=>t.done):tasks.filter(t=>t.color===filter&&!t.done);
  const todo=filtered.filter(t=>!t.done);
  const done=filtered.filter(t=>t.done);

  const getAiTip = () => {
    const tips = lang === "en" || lang === "kr" ? [
      T("taskTip2",lang),
      "A proactive check-in before renewal reduces churn by 40%.",
      T("taskTip3",lang),
      "EBR preparation: gather 3 wins + 1 challenge per account.",
      "Segment your at-risk accounts: intent-to-churn vs. passive-risk.",
      T("taskTip1",lang),
      "Set up automated health alerts to catch drops early.",
      "One personalized email beats five generic follow-ups."
    ] : [
      T("taskTip2",lang),
      lang==="kr"?"갱신 전 사전 체크인은 이탈률을 40% 줄여줍니다.":lang==="en"?"A proactive check-in before renewal reduces churn by 40%.":"Un check-in proactif avant renouvellement réduit le churn de 40%.",
      T("taskTip3",lang),
      T("taskTip4",lang),
      T("taskTip5",lang),
      T("taskTip1",lang),
      lang==="kr"?"자동 헬스 스코어 알림을 설정하세요.":lang==="en"?"Set up automatic health score alerts.":"Configurez des alertes health score automatiques.",
      lang==="kr"?"개인화된 이메일 한 통이 일반 후속 메일 5통보다 낫습니다.":lang==="en"?"One personalized email beats five generic follow-ups.":"Un email personnalisé vaut mieux que 5 relances génériques."
    ];
    setAiTip(tips[Math.floor(Math.random() * tips.length)]);
  };


  const stats={
    total:tasks.filter(t=>!t.done).length,
    q1:tasks.filter(t=>t.quadrant==="q1"&&!t.done).length,
    done:tasks.filter(t=>t.done).length,
    overdue:tasks.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()&&!t.done).length
  };

  return React.createElement("div",{className:"fade-in",style:{padding:"24px 28px",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}},
    // Header
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexShrink:0}},
      React.createElement("div",null,
        React.createElement("h1",{style:{fontSize:22,fontWeight:900,letterSpacing:"-.5px",marginBottom:3}},"🎯 "+T("tasks",lang)),
        React.createElement("p",{style:{fontSize:12,color:C.muted}},
          lang==="kr"?`${stats.total} 활성 · ${stats.done} 완료${stats.overdue>0?" · ⚠ "+stats.overdue+" 지연":""}`:lang==="en"?`${stats.total} active · ${stats.done} done${stats.overdue>0?" · ⚠ "+stats.overdue+" overdue":""}`:` ${stats.total} en cours · ${stats.done} terminées${stats.overdue>0?" · ⚠ "+stats.overdue+" en retard":""}`
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:8,alignItems:"center"}},
        React.createElement("button",{
          onClick:getAiTip,disabled:aiLoading,
          style:{
            display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:6,
            border:`1px solid ${C.tealBorder}`,background:C.tealBg,color:C.teal,
            fontSize:12,fontWeight:700,cursor:aiLoading?"not-allowed":"pointer",opacity:aiLoading?.7:1
          }
        },aiLoading?"⏳ ...":"✨ "+(T("taskAI",lang))),
        React.createElement("button",{
          onClick:()=>{setDefaultQuad("q1");setEditTask(null);setShowAdd(true);},
          style:{
            display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:6,
            background:C.teal,color:"#FFFFFF",
            fontSize:12,fontWeight:800,border:"none",cursor:"pointer"
          }
        },"+ "+(T("newTask",lang)))
      )
    ),
    // AI tip banner
    aiTip&&React.createElement("div",{style:{
      background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.22)",
      borderRadius:6,padding:"12px 16px",marginBottom:14,fontSize:12.5,
      color:C.text,lineHeight:1.7,flexShrink:0,position:"relative"
    }},
      React.createElement("span",{style:{fontWeight:800,color:"#9B6BDF"}},"✨ Coach IA  "),
      aiTip,
      React.createElement("button",{
        onClick:()=>setAiTip(""),
        style:{position:"absolute",top:8,right:10,background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16}
      },"×")
    ),
    // Filters
    React.createElement("div",{style:{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",flexShrink:0}},
      [["all",T("taskAll",lang)],["done",T("taskDone",lang)],
       ...TASK_COLORS.map(c=>[c.id,lang==="en"?c.labelEn:lang==="kr"?c.labelKr||c.labelEn:c.label])
      ].map(([val,lbl])=>React.createElement("button",{
        key:val,
        onClick:()=>setFilter(val),
        style:{
          padding:"4px 12px",borderRadius:16,fontSize:11,fontWeight:600,cursor:"pointer",
          border:`1px solid ${filter===val?C.tealBorder:C.border}`,
          background:filter===val?C.tealBg:C.surface,
          color:filter===val?C.teal:C.muted,transition:"all .12s"
        }
      },lbl))
    ),
    // Matrix Grid
    React.createElement("div",{style:{flex:1,overflow:"auto"}},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,minHeight:400}},
        Object.values(QUAD).map(q=>{
          const qTasks=filtered.filter(t=>t.quadrant===q.id&&!t.done);
          const qDone=filtered.filter(t=>t.quadrant===q.id&&t.done);
          return React.createElement("div",{
            key:q.id,
            style:{
              background:q.bg,border:`1.5px solid ${q.border}`,borderRadius:8,
              padding:"14px",display:"flex",flexDirection:"column",minHeight:180
            }
          },
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:6,color:q.accent}},
                  q.icon," ",lang==="en"?q.labelEn:lang==="kr"?q.labelKr||q.label:q.label,
                  React.createElement("span",{style:{
                    fontSize:10,background:q.accent+"22",color:q.accent,
                    borderRadius:6,padding:"1px 7px",fontWeight:700
                  }},qTasks.length)
                ),
                React.createElement("div",{style:{fontSize:10,color:C.muted,marginTop:1}},lang==="en"?q.subEn:lang==="kr"?q.subKr||q.subEn:q.sub)
              ),
              React.createElement("button",{
                onClick:()=>{setDefaultQuad(q.id);setEditTask(null);setShowAdd(true);},
                style:{
                  width:24,height:24,borderRadius:7,border:`1px solid ${q.border}`,
                  background:q.bg,color:q.accent,cursor:"pointer",fontSize:16,
                  display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0
                }
              },"+")
            ),
            React.createElement("div",{style:{flex:1}},
              qTasks.length===0&&React.createElement("div",{style:{
                textAlign:"center",padding:"20px 10px",color:C.muted,fontSize:11,
                border:`1px dashed ${q.border}`,borderRadius:10
              }},T("taskDrop",lang)),
              qTasks.map(t=>React.createElement(TaskCard,{
                key:t.id,task:t,lang,
                onMove:moveTask,onDelete:deleteTask,onToggle:toggleTask,
                onEdit:task=>{setEditTask(task);setShowAdd(true);}
              })),
              qDone.length>0&&React.createElement("div",{style:{marginTop:8,opacity:.6}},
                React.createElement("div",{style:{fontSize:10,color:C.muted,marginBottom:5}},lang==="en"?`${qDone.length} done`:lang==="kr"?`${qDone.length}개 완료`:`${qDone.length} terminée(s)`),
                qDone.map(t=>React.createElement(TaskCard,{
                  key:t.id,task:t,lang,
                  onMove:moveTask,onDelete:deleteTask,onToggle:toggleTask,
                  onEdit:task=>{setEditTask(task);setShowAdd(true);}
                }))
              )
            )
          );
        })
      )
    ),
    showAdd&&React.createElement(AddTaskModal,{
      lang,accounts,
      editTask:editTask?{...editTask}:editTask||{quadrant:defaultQuad},
      onClose:()=>{setShowAdd(false);setEditTask(null);},
      onAdd:task=>{addTask(task);setShowAdd(false);setEditTask(null);}
    })
  );
};

// ══════════════════════════════════════════════════
// UNIFIED TASK BOARD — Kanban + Eisenhower tabs
// ══════════════════════════════════════════════════


export default TaskBoardView;
