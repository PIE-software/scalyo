/**
 * Scalyo - PlanningView
 * Extracted from app.html (lines 5906-6544)
 */

import { T } from '../shared/i18n-wrapper.js';


const PlanningView=({lang="fr",accounts=[],companyId=null})=>{
  const [events,setEvents]=useState(()=>getEventsFromLS());
  const [view,setView]=useState("week");
  const [today]=useState(new Date());
  const [currentDate,setCurrentDate]=useState(new Date());
  const [showAddEvent,setShowAddEvent]=useState(false);
  const [selectedDate,setSelectedDate]=useState(null);
  const [editEvent,setEditEvent]=useState(null);

  // Chargement Supabase au montage
  useEffect(()=>{
    if(!companyId) return;
    EventDB.load(companyId).then(evs=>{ if(evs&&evs.length) setEvents(evs); });
  },[companyId]);

  const saveEvents=evs=>{ saveEventsToLS(evs); setEvents(evs); EventDB.save(companyId, evs); };

  // ── Week helpers
  const startOfWeek=d=>{const dt=new Date(d);const day=dt.getDay();dt.setDate(dt.getDate()-day+1);dt.setHours(0,0,0,0);return dt;};
  const weekDays=Array.from({length:7},(_,i)=>{const d=new Date(startOfWeek(currentDate));d.setDate(d.getDate()+i);return d;});
  const hours=Array.from({length:13},(_,i)=>i+8); // 8h→20h

  // ── Month helpers
  const year=currentDate.getFullYear(),month=currentDate.getMonth();
  const firstDay=new Date(year,month,1);
  const lastDay=new Date(year,month+1,0);
  const startPad=(firstDay.getDay()||7)-1;
  const monthDays=Array.from({length:startPad+lastDay.getDate()},(_,i)=>{
    if(i<startPad)return null;
    return new Date(year,month,i-startPad+1);
  });

  const getEventsForDay=d=>{
    if(!d)return[];
    const ds=d.toISOString().slice(0,10);
    return events.filter(e=>e.date===ds);
  };

  const prevPeriod=()=>{
    const d=new Date(currentDate);
    if(view==="week")d.setDate(d.getDate()-7);
    else d.setMonth(d.getMonth()-1);
    setCurrentDate(d);
  };
  const nextPeriod=()=>{
    const d=new Date(currentDate);
    if(view==="week")d.setDate(d.getDate()+7);
    else d.setMonth(d.getMonth()+1);
    setCurrentDate(d);
  };
  const goToday=()=>setCurrentDate(new Date());

  const monthNames=lang==="en"
    ?["January","February","March","April","May","June","July","August","September","October","November","December"]
    :lang==="kr"
    ?["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]
    :[T("monthJan",lang),T("monthFeb",lang),T("monthMar",lang),T("monthApr",lang),T("monthMay",lang),T("monthJun",lang),T("monthJul",lang),T("monthAug",lang),T("monthSep",lang),T("monthOct",lang),T("monthNov",lang),T("monthDec",lang)]
  const dayNames=lang==="en"?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:lang==="kr"?["월","화","수","목","금","토","일"]:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  const headerTitle=view==="week"
    ?`${weekDays[0].getDate()} – ${weekDays[6].getDate()} ${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`
    :`${monthNames[month]} ${year}`;

  const isToday=d=>d&&d.toDateString()===today.toDateString();
  const isCurrentMonth=d=>d&&d.getMonth()===month;

  return React.createElement("div",{className:"fade-in",style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}},
    // Header bar
    React.createElement("div",{style:{
      display:"flex",justifyContent:"space-between",alignItems:"center",
      padding:"20px 28px 14px",flexShrink:0,borderBottom:`1px solid ${C.border}`
    }},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:14}},
        React.createElement("h1",{style:{fontSize:20,fontWeight:900,letterSpacing:"-.4px"}},"📅 "+T("planning",lang)),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4}},
          React.createElement("button",{onClick:prevPeriod,style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,width:28,height:28,cursor:"pointer",color:C.text,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}},"‹"),
          React.createElement("span",{style:{fontSize:13,fontWeight:700,minWidth:180,textAlign:"center"}},headerTitle),
          React.createElement("button",{onClick:nextPeriod,style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,width:28,height:28,cursor:"pointer",color:C.text,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}},"›")
        ),
        React.createElement("button",{onClick:goToday,style:{fontSize:11,padding:"5px 12px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontWeight:600}},T("today",lang))
      ),
      React.createElement("div",{style:{display:"flex",gap:8,alignItems:"center"}},
        // View toggle
        React.createElement("div",{className:"tab-bar",style:{padding:3}},
          [["week",T("week",lang)],["month",T("month",lang)]].map(([v,l])=>React.createElement("button",{
            key:v,onClick:()=>setView(v),
            className:`tab-item${view===v?" active":""}`,style:{padding:"4px 12px",fontSize:11}
          },l))
        ),
        React.createElement("button",{
          onClick:()=>exportICS(events),
          style:{display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:9,border:`1px solid ${C.border}`,background:C.surface,color:C.text,cursor:"pointer",fontSize:11,fontWeight:600}
        },"⬇ Export .ics"),
        React.createElement("button",{
          onClick:()=>{setSelectedDate(today.toISOString().slice(0,10));setEditEvent(null);setShowAddEvent(true);},
          style:{padding:"6px 14px",borderRadius:9,background:C.teal,color:"#FFFFFF",border:"none",cursor:"pointer",fontSize:11,fontWeight:800}
        },"+ "+(T("event",lang)))
      )
    ),
    // Calendar body
    React.createElement("div",{style:{flex:1,overflow:"auto",padding:"0 28px 20px"}},
      view==="week"
        ? // WEEK VIEW
          React.createElement("div",{style:{marginTop:16}},
            // Day headers
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",gap:0,marginBottom:0}},
              React.createElement("div",null),
              weekDays.map((d,i)=>React.createElement("div",{key:i,style:{
                textAlign:"center",padding:"8px 4px",borderBottom:`1px solid ${C.border}`,
                background:isToday(d)?C.tealBg:"transparent",borderRadius:isToday(d)?"8px 8px 0 0":"0"
              }},
                React.createElement("div",{style:{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase"}},(dayNames[i])),
                React.createElement("div",{style:{
                  fontSize:20,fontWeight:900,
                  color:isToday(d)?C.teal:C.text,
                  width:36,height:36,borderRadius:"50%",margin:"2px auto",
                  background:isToday(d)?C.tealBg:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"
                }},d.getDate())
              ))
            ),
            // Time slots
            hours.map(h=>React.createElement("div",{key:h,style:{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",borderBottom:`1px solid ${C.border}`}},
              React.createElement("div",{style:{fontSize:10,color:C.muted,padding:"6px 8px 0 0",textAlign:"right",paddingTop:4}}),
              weekDays.map((d,i)=>{
                const dayEvs=getEventsForDay(d).filter(e=>{
                  const eh=parseInt(e.time?.split(":")?.[0]||"9");
                  return eh===h;
                });
                const isT=isToday(d);
                return React.createElement("div",{
                  key:i,
                  onClick:()=>{setSelectedDate(d.toISOString().slice(0,10));setEditEvent(null);setShowAddEvent(true);},
                  style:{
                    minHeight:50,padding:"2px 3px",
                    borderLeft:`1px solid ${C.border}`,
                    background:isT?"rgba(77,182,160,0.02)":"transparent",
                    cursor:"pointer",transition:"background .12s",position:"relative"
                  },
                  onMouseEnter:e=>e.currentTarget.style.background=C.tealBg,
                  onMouseLeave:e=>e.currentTarget.style.background=isT?"rgba(77,182,160,0.02)":"transparent"
                },
                  h===8&&React.createElement("div",{style:{fontSize:9,color:C.muted,padding:"2px 0"}}),
                  dayEvs.map(ev=>{
                    const evCol=EVENT_COLORS.find(c=>c.id===ev.color)||EVENT_COLORS[0];
                    return React.createElement("div",{
                      key:ev.id,
                      onClick:e=>{e.stopPropagation();setEditEvent(ev);setShowAddEvent(true);},
                      style:{
                        background:evCol.hex+"22",border:`1px solid ${evCol.hex}55`,
                        borderLeft:`3px solid ${evCol.hex}`,borderRadius:5,
                        padding:"3px 6px",fontSize:10,fontWeight:600,color:evCol.hex,
                        marginBottom:2,cursor:"pointer",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"
                      }
                    },ev.time?" "+ev.time+" ":" ",ev.title)
                  })
                );
              })
            ))
          )
        : // MONTH VIEW
          React.createElement("div",{style:{marginTop:16}},
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}},
              dayNames.map(d=>React.createElement("div",{key:d,style:{textAlign:"center",fontSize:10,fontWeight:700,color:C.muted,padding:"6px 0",textTransform:"uppercase"}},(d)))
            ),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}},
              monthDays.map((d,i)=>{
                if(!d)return React.createElement("div",{key:"pad"+i});
                const dayEvs=getEventsForDay(d);
                const isT=isToday(d);
                const isCM=isCurrentMonth(d);
                return React.createElement("div",{
                  key:i,
                  onClick:()=>{setSelectedDate(d.toISOString().slice(0,10));setEditEvent(null);setShowAddEvent(true);},
                  style:{
                    minHeight:80,padding:"6px",border:`1px solid ${isT?C.tealBorder:C.border}`,
                    borderRadius:8,background:isT?C.tealBg:C.surface,
                    opacity:isCM?1:.4,cursor:"pointer",transition:"all .12s"
                  },
                  onMouseEnter:e=>e.currentTarget.style.borderColor=C.tealBorder,
                  onMouseLeave:e=>e.currentTarget.style.borderColor=isT?C.tealBorder:C.border
                },
                  React.createElement("div",{style:{
                    fontSize:13,fontWeight:isT?900:500,
                    color:isT?C.teal:C.text,marginBottom:3
                  }},d.getDate()),
                  dayEvs.slice(0,3).map(ev=>{
                    const evCol=EVENT_COLORS.find(c=>c.id===ev.color)||EVENT_COLORS[0];
                    return React.createElement("div",{
                      key:ev.id,
                      onClick:e=>{e.stopPropagation();setEditEvent(ev);setShowAddEvent(true);},
                      style:{
                        fontSize:9.5,fontWeight:600,color:evCol.hex,
                        background:evCol.hex+"18",borderRadius:3,
                        padding:"1px 5px",marginBottom:2,
                        overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"
                      }
                    },ev.title)
                  }),
                  dayEvs.length>3&&React.createElement("div",{style:{fontSize:9,color:C.muted}},`+${dayEvs.length-3} ${T("more",lang)}`)
                );
              })
            )
          )
    ),
    // Add/Edit Event Modal
    showAddEvent&&React.createElement(AddEventModal,{
      lang,accounts,
      editEvent:editEvent||null,
      defaultDate:selectedDate||today.toISOString().slice(0,10),
      onClose:()=>{setShowAddEvent(false);setEditEvent(null);},
      onSave:ev=>{
        const existing=events.findIndex(e=>e.id===ev.id);
        if(existing>=0){const n=[...events];n[existing]=ev;saveEvents(n);}
        else saveEvents([...events,ev]);
        // modal stays open to show calendar sync buttons
      },
      onDelete:id=>{saveEvents(events.filter(e=>e.id!==id));setShowAddEvent(false);setEditEvent(null);}
    }),
  );
};

const AddEventModal=({lang,accounts,editEvent,defaultDate,onClose,onSave,onDelete})=>{
  const [title,setTitle]=useState(editEvent?.title||"");
  const [date,setDate]=useState(editEvent?.date||defaultDate||"");
  const [time,setTime]=useState(editEvent?.time||"09:00");
  const [endTime,setEndTime]=useState(editEvent?.endTime||"10:00");
  const [color,setColor]=useState(editEvent?.color||"teal");
  const [note,setNote]=useState(editEvent?.note||"");
  const [account,setAccount]=useState(editEvent?.account||"");
  const [saved,setSaved]=useState(null);
  const isEdit=!!editEvent;
  const S={width:"100%",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 13px",color:C.text,fontSize:13,marginBottom:12};

  const handleSave=()=>{
    if(!title.trim()||!date)return;
    const ev={id:editEvent?.id||Date.now().toString(),title:title.trim(),date,time,endTime,color,note,account,createdAt:editEvent?.createdAt||new Date().toISOString()};
    onSave(ev); setSaved(ev);
  };

  if(saved) return React.createElement("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose();}},
    React.createElement("div",{className:"modal-box",style:{maxWidth:400,padding:28}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:20}},
        React.createElement("div",{style:{fontSize:36,marginBottom:8}},"✅"),
        React.createElement("h3",{style:{fontSize:16,fontWeight:800,marginBottom:4}},T("savedBang",lang)),
        React.createElement("p",{style:{fontSize:12,color:C.muted}},T("addToCalendar",lang))
      ),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8,marginBottom:16}},
        React.createElement("a",{href:buildGoogleLink(saved),target:"_blank",rel:"noopener",
          style:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"12px",borderRadius:6,textDecoration:"none",fontWeight:700,fontSize:13,background:"rgba(234,67,53,0.1)",border:"1px solid rgba(234,67,53,0.2)",color:"#EA4335",cursor:"pointer"}
        },"🔴 "+(T("addToGoogle",lang))),
        React.createElement("a",{href:buildOutlookLink(saved),target:"_blank",rel:"noopener",
          style:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"12px",borderRadius:6,textDecoration:"none",fontWeight:700,fontSize:13,background:"rgba(0,120,212,0.1)",border:"1px solid rgba(0,120,212,0.2)",color:"#0078D4",cursor:"pointer"}
        },"🔵 "+(T("addToOutlook",lang))),
        React.createElement("button",{onClick:()=>exportICS([saved],`${saved.title.replace(/[^a-z0-9]/gi,"_")}.ics`),
          style:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"12px",borderRadius:6,fontWeight:700,fontSize:13,cursor:"pointer",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",color:"#4DAB6D"}
        },"🍎 "+(T("exportIcs",lang)))
      ),
      React.createElement("button",{onClick:onClose,
        style:{width:"100%",padding:"10px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:13,fontWeight:600}
      },T("close",lang))
    )
  );

  return React.createElement("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose();}},
    React.createElement("div",{className:"modal-box",style:{maxWidth:440,padding:26}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}},
        React.createElement("h3",{style:{fontSize:15,fontWeight:800}},isEdit?(T("editEvent",lang)):(T("newEvent",lang))),
        React.createElement("button",{onClick:onClose,style:{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.muted}},"×")
      ),
      React.createElement("input",{value:title,onChange:e=>setTitle(e.target.value),placeholder:T("eventTitle",lang),style:{...S,fontWeight:600}}),
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:12}},
        React.createElement("div",{style:{flex:1.5}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}},"Date"),
          React.createElement("input",{type:"date",value:date,onChange:e=>setDate(e.target.value),style:{...S,marginBottom:0}})
        ),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}},T("startTime",lang)),
          React.createElement("input",{type:"time",value:time,onChange:e=>setTime(e.target.value),style:{...S,marginBottom:0}})
        ),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}},T("endTime",lang)),
          React.createElement("input",{type:"time",value:endTime,onChange:e=>setEndTime(e.target.value),style:{...S,marginBottom:0}})
        )
      ),
      React.createElement("div",{style:{marginBottom:12}},
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}},T("eventColor",lang)),
        React.createElement("div",{style:{display:"flex",gap:6}},
          EVENT_COLORS.map(clr=>React.createElement("button",{key:clr.id,onClick:()=>setColor(clr.id),
            style:{width:24,height:24,borderRadius:"50%",background:clr.hex,border:`2px solid ${color===clr.id?"#fff":clr.hex}`,cursor:"pointer",outline:color===clr.id?`2px solid ${clr.hex}`:"none",outlineOffset:2}
          }))
        )
      ),
      accounts.length>0&&React.createElement("select",{value:account,onChange:e=>setAccount(e.target.value),style:S},
        React.createElement("option",{value:""},T("noAccount",lang)),
        accounts.map(a=>React.createElement("option",{key:a.id,value:a.name},a.name))
      ),
      React.createElement("textarea",{value:note,onChange:e=>setNote(e.target.value),placeholder:"Notes...",rows:2,style:{...S,resize:"vertical"}}),
      React.createElement("div",{style:{display:"flex",gap:8}},
        isEdit&&React.createElement("button",{onClick:()=>onDelete(editEvent.id),
          style:{padding:"10px 14px",borderRadius:6,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#EF4444",cursor:"pointer",fontSize:12,fontWeight:700}
        },"🗑"),
        React.createElement("button",{onClick:onClose,style:{flex:1,padding:"11px",borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:13,fontWeight:600}},T("cancel",lang)),
        React.createElement("button",{disabled:!title.trim()||!date,onClick:handleSave,
          style:{flex:2,padding:"11px",borderRadius:6,fontSize:13,fontWeight:800,cursor:"pointer",border:"none",
            background:!title.trim()||!date?C.surface:C.teal,
            color:!title.trim()||!date?C.muted:"#FFFFFF"}
        },isEdit?(T("update",lang)):(T("taskAdd",lang)))
      )
    )
  );
};

const NOVA_RESPONSES = {
  // ── STRESS / SURCHARGE
  stress: {
    trigger: ["stress", "stressé", "stressée", "pression", "sous pression", "tendu", "tendue", "anxieux", "anxieuse", "angoisse", "anxiété", "inquiet", "inquiète", "peur", "stressed", "pressure", "anxious", "anxiety", "overwhelmed", "nervous", "worried", "tense", "스트레스", "불안", "긴장", "압박", "걱정", "초조"],
    level: "moderate",
    answer: `Je t'entends. Le stress dans un rôle CS est réel — vous êtes souvent au carrefour entre les attentes clients et les contraintes internes, c'est une position épuisante.

Quelques choses qui aident vraiment :

• **Identifier la source** : Est-ce un client spécifique ? Un volume trop élevé ? Des objectifs flous ?
• **Externaliser la charge mentale** : Écrire ce qui te préoccupe (même juste sur papier) réduit l'emprise du stress.
• **Reprendre le contrôle** : Identifie 1 action concrète que tu peux faire aujourd'hui sur le problème principal.

→ Si cette pression dure depuis plus de 2 semaines, il peut être utile d'en parler à ton manager. Je peux t'aider à préparer cette conversation si tu veux.

Comment tu te sens par rapport à ça en ce moment ?`
  },
  // ── FATIGUE / ÉPUISEMENT
  fatigue: {
    trigger: ["fatigue", "fatigué", "fatiguée", "épuisé", "épuisée", "épuisement", "vidé", "vidée", "plus d'énergie", "énergie", "dormant", "sommeil", "dormir mal", "nuits", "tired", "exhausted", "drained", "burnout", "no energy", "depleted", "피곤", "피로", "지쳤", "탈진", "번아웃", "소진"],
    level: "moderate",
    answer: `L'épuisement dans le Customer Success est très fréquent, et souvent invisible — parce que vous continuez à "performez" même quand vous êtes à plat.

Ce que tu ressens est légitime. Quelques pistes :

• **Évaluer ta charge réelle** : Combien de comptes gères-tu ? Y en a-t-il qui absorbent 80% de ton énergie ?
• **Protéger ton énergie** : Bloquer 2h par semaine sans réunions ni messages urgents. Pas négociable.
• **Signaler avant la rupture** : Attendre d'être vraiment à bout pour en parler est trop tard — et tu n'as pas à gérer ça seul(e).

→ Est-ce que tu as un manager ou une personne de confiance à qui tu pourrais en parler ? Je peux t'aider à formuler ce que tu ressens de façon constructive.`
  },
  // ── CONFLIT / RELATION DIFFICILE
  conflit: {
    trigger: ["conflit", "conflits", "dispute", "dispute", "mal avec", "problème avec", "manager", "collègue", "relation", "mésentente", "tension", "difficile avec", "conflict", "argument", "issue with", "difficult colleague", "fight", "갈등", "충돌", "싸움", "불화", "마찰"],
    level: "moderate",
    answer: `Les conflits au travail — avec un manager ou un collègue — sont parmi les sources de souffrance les plus lourdes. Merci de faire confiance à ce que tu ressens.

Quelques réflexions :

• **Nommer sans accuser** : "Je me sens mis(e) de côté quand..." est plus utile que "Tu fais toujours..."
• **Chercher à comprendre** : Parfois un conflit cache une incompréhension sur les rôles ou les attentes.
• **Décider ce qui est tolérable** : Tout conflit ne mérite pas d'être résolu — certains méritent d'être nommés, puis mis à distance.

→ Si tu veux, dis-moi plus sur la situation. Je peux t'aider à préparer une conversation difficile, ou simplement être là pour écouter.`
  },
  // ── DÉMOTIVATION / ENNUI
  motivation: {
    trigger: ["démotivé", "démotivée", "plus envie", "ennui", "ennuyeux", "sans sens", "inutile", "à quoi ça sert", "perdu", "perdue", "j'aime plus", "plus passionné", "passionné", "unmotivated", "bored", "no motivation", "meaningless", "lost my drive", "의욕없", "무기력", "지루", "열정없", "재미없"],
    level: "mild",
    answer: `La perte de sens dans son travail, c'est souvent discret au début — et puis un jour on réalise qu'on fait les gestes sans vraiment y être.

C'est important que tu le nommes.

• **Distinguer la fatigue du désengagement** : Parfois on pense ne plus aimer son travail, alors qu'on est juste épuisé.
• **Retrouver une ancre** : Qu'est-ce qui t'avait attiré dans le Customer Success au départ ? Est-ce encore là ?
• **Créer un projet** : Même petit. Un process à améliorer, un client à transformer en success story.

→ La démotivation prolongée mérite attention. Si ça dure depuis plusieurs semaines, en parler avec ton manager ou un professionnel peut vraiment aider.

Qu'est-ce qui a changé récemment pour toi ?`
  },
  // ── SYNDROME DE L'IMPOSTEUR
  imposteur: {
    trigger: ["imposteur", "imposture", "légitime", "légitime", "pas légitime", "je ne mérite", "pas à ma place", "pas compétent", "pas compétente", "pas capable", "doute", "je doute", "nul", "nulle", "impostor", "imposter", "don't deserve", "not good enough", "fraud", "자격없", "능력없", "가면증후군", "부족해", "사기꾼"],
    level: "mild",
    answer: `Le syndrome de l'imposteur touche énormément de professionnels CS — et paradoxalement, souvent les plus consciencieux. Le fait que tu te poses ces questions est souvent le signe que tu t'investis vraiment.

Quelques réalités :

• **Tu es là pour une raison** : Personne ne garde quelqu'un dans un rôle CS sans résultats — même imparfaits.
• **L'erreur fait partie du métier** : Un bon CSM n'est pas quelqu'un qui ne se trompe jamais, c'est quelqu'un qui sait récupérer.
• **Compare-toi à toi d'il y a 6 mois**, pas aux autres — tu verras une progression réelle.

→ Est-ce qu'il y a un événement spécifique qui a déclenché ce sentiment ? Parfois mettre le doigt dessus change tout.`
  },
  // ── PLEURS / TRISTESSE PROFONDE
  tristesse: {
    trigger: ["pleurs", "pleurer", "pleurer", "je pleure", "larmes", "triste", "tristesse", "malheureux", "malheureuse", "déprimé", "déprimée", "dépression", "vide", "vide intérieur", "rien ne va", "sad", "crying", "tears", "unhappy", "depressed", "down", "low", "슬프", "우울", "눈물", "절망", "공허"],
    level: "high",
    answer: `Merci de me faire confiance avec ça. Ce que tu ressens est réel, et ce n'est pas anodin.

Pleurer ou se sentir profondément triste, surtout au travail, peut être le signe que quelque chose de plus profond a besoin d'attention.

**Ce que je te suggère maintenant :**

1. **Ne reste pas seul(e) avec ça** — parle à quelqu'un aujourd'hui, même juste un message à un proche.
2. **Tu peux consulter un professionnel** : Un psychologue ou un médecin peut t'aider à comprendre et traverser ça.
3. **Si ton employeur propose un EAP** (programme d'aide aux employés), c'est confidentiel et gratuit.

→ **Si tu es en France** : tu peux contacter le 3114 (numéro national de prévention du suicide, disponible 24h/24) ou ton médecin traitant.
→ **En Belgique** : Centre de Prévention du Suicide — 0800 32 123
→ **En Suisse** : La Main Tendue — 143

Veux-tu que je t'aide à formuler comment en parler à ton manager ou à un proche ?`
  },
  // ── CRISE / PENSÉES SOMBRES
  crise: {
    trigger: ["mourir", "mort", "en finir", "plus envie de vivre", "suicide", "me tuer", "disparaître", "disparaître", "ne plus exister", "en finir", "kill myself", "end it", "don't want to live", "no point", "give up on life", "죽고싶", "사라지고싶", "자살", "포기"],
    level: "crisis",
    answer: `Je t'entends, et ce que tu partages me touche profondément.

**Tu n'es pas seul(e), et de l'aide existe maintenant.**

📞 **France — 3114** (numéro national, gratuit, 24h/24, 7j/7)
📞 **Belgique — 0800 32 123** (Centre de Prévention du Suicide)
📞 **Suisse — 143** (La Main Tendue)
📞 **Canada — 1-866-APPELLE** (1-866-277-3553)

Ces lignes sont confidentielles. Des professionnels formés sont là pour toi, sans jugement.

Si tu es en danger immédiat, appelle le **15 (SAMU)** ou le **112**.

Je suis là si tu veux continuer à parler.`
  },
  // ── CHARGE DE TRAVAIL / TROP DE COMPTES
  surcharge: {
    trigger: ["trop de comptes", "portefeuille plein", "trop de travail", "surchargé", "surchargée", "débordé", "débordée", "trop de tâches", "plus la tête", "pas le temps", "submergé", "submergée", "overloaded", "too many accounts", "too much work", "swamped", "업무과다", "너무많아", "감당못해", "벅차"],
    level: "moderate",
    answer: `La surcharge dans un rôle CS est souvent structurelle — pas personnelle. Ce n'est pas toi qui es moins bon(ne), c'est le ratio comptes/CSM qui n'est parfois pas tenable.

Ce que tu peux faire concrètement :

• **Catégoriser tes comptes** : Lesquels demandent 80% de ton temps ? Sont-ils les plus stratégiques ?
• **Signaler avec des données** : Dire "j'ai trop de travail" est moins impactant que "je gère 42 comptes, la norme du secteur est 25-30".
• **Proposer une solution** : Une redistribution, une priorisation, ou un support sur les comptes à risque.

→ Veux-tu qu'on prépare ensemble comment présenter ça à ton manager de façon constructive ?`
  },
  // ── RELATION CLIENT DIFFICILE
  client_difficile: {
    trigger: ["client difficile", "client agressif", "client hostile", "client me crie", "client toxique", "mauvais client", "client irrespectueux", "maltraite", "insulte", "agressif", "difficult client", "angry client", "hostile client", "client screaming", "어려운고객", "까다로운고객", "불만고객"],
    level: "moderate",
    answer: `Les clients difficiles font partie du métier — mais ça ne veut pas dire qu'il faut tout accepter.

**Quelques principes :**

• **Une chose normale peut devenir du harcèlement** : Si un client te manque régulièrement de respect, c'est un problème à remonter, pas à absorber.
• **Documenter** : Garde des traces des échanges problématiques. Ça protège et ça aide à cadrer la situation avec ton manager.
• **Poser des limites** : "Je comprends votre frustration, je suis là pour vous aider. Mais je ne peux pas continuer cet échange si le ton reste celui-ci."

→ As-tu pu en parler avec ton manager ? Il peut (et doit) intervenir si la situation dépasse ce qui est acceptable.

Tu veux qu'on réfléchisse ensemble à comment gérer ça ?`
  },
  // ── DEFAULT
  default: {
    answer: `Bonjour, je suis **Nova** 💚

Je suis ton espace confidentiel pour parler de ce que tu vis au travail — sans jugement, sans que ça remonte automatiquement.

Je peux t'accompagner sur :

• 😤 **Stress & pression** au quotidien
• 😴 **Fatigue & épuisement** professionnel
• 💬 **Conflits** avec manager ou collègues
• 😔 **Démotivation** ou perte de sens
• 🤔 **Syndrome de l'imposteur**
• 😢 **Tristesse** ou moments difficiles
• 📦 **Surcharge** de travail

Tout ce que tu partages ici reste entre nous. Je peux aussi t'aider à préparer une conversation avec ton manager si tu veux aborder quelque chose de difficile.

**Comment tu vas, vraiment ?**`
  },
  augmentation: {
    trigger: ["augmentation","salaire","revalorisation","promotion","négociation salariale","raise","salary","rémunération","bonus","prime","sous-payé","sous-payée", "연봉", "월급", "급여", "임금인상", "승진"],
    level: "moderate",
    answer: `**Demander une augmentation en CS**

**Avant la conversation**
• Chiffrez votre impact : ARR géré, taux de renouvellement, NPS, comptes sauvés
• Benchmarkez le marché : Glassdoor, LinkedIn Salary
• Timing idéal : après un succès visible, lors d'un 1:1

**Le script**
→ "Sur les 12 derniers mois, j'ai géré X d'ARR avec Y% de renouvellement"
→ "Je souhaite revoir ma rémunération à hauteur de X"
→ Ne justifiez jamais avec vos besoins personnels

**Si le manager hésite** → Demandez les critères, proposez une revue à 3 mois

→ Quel est votre contexte ? Je peux vous aider à préparer votre argumentaire.`
  },
  manager_conflit: {
    trigger: ["conflit avec","désaccord","incompréhension manager","tension avec manager","boss difficile","chef difficile", "conflict with manager", "disagree with boss", "bad manager", "management", "상사갈등", "매니저갈등", "팀장"],
    level: "moderate",
    answer: `**Désaccord avec son manager**

**Avant d'escalader**
• Clarifiez votre objectif : comprendre, changer une décision, exprimer ?
• Attendez 24h — les conversations à chaud sont rarement productives

**La conversation productive**
→ "Je voudrais comprendre la logique derrière cette décision"
→ Présentez votre perspective avec l'impact client
→ Proposez une alternative plutôt que de rejeter

→ Quelle est la situation concrète avec votre manager ?`
  },
  motivation_perte: {
    trigger: ["motivation","démotivé","démotivée","plus envie","ennui","monotonie","routine","sens","passion","reconnaissance", "unmotivated", "bored", "no drive", "monotonous", "repetitive", "동기부여", "방향잃"],
    level: "moderate",
    answer: `**Retrouver la motivation en CS**

• Identifiez UN client dont vous êtes fier — recontactez-le
• Écrivez ce que ce rôle vous a appris cette année
• Parlez à votre manager : "Comment puis-je avoir plus d'impact ?"

**Question de fond**
→ Est-ce le rôle qui ne convient plus, ou l'environnement actuel ?

→ Qu'est-ce qui vous manque le plus ?`
  },
  fatigue_chron: {
    trigger: ["fatigué","fatiguée","pas dormi","récupérer","recharge","vacances congé","not sleeping","can't sleep","need rest","recharge","vacation","chronic fatigue","run down", "만성피로", "항상피곤", "매일힘들"],
    level: "moderate",
    answer: `**Fatigue chronique : récupérer vraiment**

→ Soir : coupure numérique 1h avant de dormir
→ Weekend : demi-journée sans penser au travail
→ En congé : déconnexion totale

**Si ça dure plus de 2 semaines** → Consultez un médecin

→ Depuis combien de temps vous vous sentez ainsi ?`
  }
};
const getNovaResponse = (msg, lang) => {
  const lower = msg.toLowerCase();
  if (NOVA_RESPONSES.crise.trigger.some(t => lower.includes(t))) {
    return lang==="kr"
      ? "당신의 말을 듣고 있어요. 지금 느끼는 감정은 중요해요.\n\n**오늘 믿을 수 있는 사람에게 연락해주세요.** 매니저, 친구, 또는 상담사. 혼자 짊어질 필요 없어요.\n\n→ 여기 있을게요. 더 이야기해줘요."
      : lang==="en"
      ? "I hear you. What you are feeling matters right now.\n\n**Please reach out to someone you trust today.** A manager, friend, or therapist. You don't have to carry this alone.\n\n\u2192 I'm here to listen. Tell me more."
      : NOVA_RESPONSES.crise.answer;
  }
  if (NOVA_RESPONSES.tristesse.trigger.some(t => lower.includes(t))) {
    return lang==="kr"
      ? "이해해요. 괜찮지 않아도 괜찮아요.\n\n**느끼는 것은 진짜예요.** CS 일은 감정적으로 힘들 수 있어요.\n\n→ 이 감정을 촉발한 것이 무엇인지 이야기해볼까요?"
      : lang==="en"
      ? "I hear you. It's okay to not be okay.\n\n**What you're feeling is valid.** CS work can be emotionally draining.\n\n\u2192 Would it help to talk about what triggered this?"
      : NOVA_RESPONSES.tristesse.answer;
  }
  const EN_MAP = {
    stress: "**Managing CS stress starts with awareness.**\n\n**Immediate reset (5 min):**\n\u2022 Close Slack/email for 10 minutes\n\u2022 Write down 3 things you can act on today\n\u2022 Say no to one non-priority request\n\n**This week:**\n\u2022 Block 2 focus sessions daily\n\u2022 Identify your top stress trigger\n\u2022 Talk to your manager about workload\n\n\u2192 What's weighing on you most right now?",
    fatigue: "**CS fatigue requires active recovery.**\n\n**Today:**\n\u2022 Protect your lunch break — no screens\n\u2022 Brain dump everything pending\n\u2022 Identify one task to delegate or drop\n\n**This week:**\n\u2022 Audit your account list\n\u2022 Set hard end-of-day boundaries\n\u2022 Build small recovery rituals\n\n\u2192 What's draining your energy most?",
    conflit: "**Conflict in CS is normal. Here's how to navigate it.**\n\n**With a client:**\n\u2022 Listen first, respond second\n\u2022 Acknowledge frustration before solving\n\u2022 Propose a clear next step with a date\n\n**With a colleague:**\n\u2022 Separate person from problem\n\u2022 Find shared goals\n\u2022 Involve manager early if needed\n\n\u2192 Tell me more about what's happening.",
    motivation: "**Motivation dips are normal. Here's how to rebuild.**\n\n**Quick wins today:**\n\u2022 Send one proactive value message to a client\n\u2022 Celebrate a recent win — write it down\n\u2022 Reconnect with why you chose CS\n\n**Bigger picture:**\n\u2022 Are your goals clear?\n\u2022 Are you learning?\n\u2022 Do you feel recognized?\n\n\u2192 What made you feel most energized in CS before?",
    imposteur: "**Impostor syndrome hits CS pros hard. You're not alone.**\n\n**Reality check:**\n\u2022 Your clients trust you — that's earned\n\u2022 Your instincts about accounts are reliable\n\u2022 Everyone doubts themselves; the difference is acting anyway\n\n**Practice:**\n\u2022 Write 3 real wins from the past month\n\u2022 Ask a colleague for genuine feedback\n\u2022 Speak up in the next meeting\n\n\u2192 What situation triggered this feeling?",
    surcharge: "**Overload is a signal, not a permanent state.**\n\n**Right now:**\n\u2022 List everything on your plate\n\u2022 Mark the 3 truly urgent items\n\u2022 Push or delegate everything else\n\n**This week:**\n\u2022 Block your calendar for deep work\n\u2022 Have an honest talk with your manager\n\u2022 Systematize recurring tasks\n\n\u2192 What's piling up most right now?",
    client_difficile: "**Difficult clients are part of CS. Here's a framework.**\n\n**In the moment:**\n\u2022 Stay calm — their frustration isn't personal\n\u2022 Paraphrase their concern before responding\n\u2022 Never promise what you can't deliver\n\n**Strategically:**\n\u2022 Document every interaction\n\u2022 Flag early to your manager\n\u2022 Set clear boundaries on response time\n\n\u2192 What's the situation with this client?",
    tristesse:       "**Thank you for trusting me with this.** What you're feeling is real.\n\nFeeling deeply sad at work can be a sign that something deeper needs attention.\n\n**Right now:**\n1. **Don't stay alone with this** — reach out to someone today, even just a text to someone close.\n2. **Consider talking to a professional** — a psychologist or doctor can help.\n3. **If your employer has an EAP**, use it — it's confidential.\n\n→ Can you talk to someone you trust today?",
    crise:           "**I hear you, and what you're sharing matters deeply.**\n\n**You are not alone. Help is available right now.**\n\n📞 **USA — 988** (Suicide & Crisis Lifeline, free, 24/7)\n📞 **UK — 116 123** (Samaritans, free, 24/7)\n📞 **Canada — 1-833-456-4566** (Crisis Services Canada)\n📞 **Australia — 13 11 14** (Lifeline)\n\nThese lines are confidential. Trained professionals are here for you, without judgment.\n\nIf you are in immediate danger, call emergency services.\n\nI'm here with you. 💚",
    default:         "Hi, I'm **Nova** 💚\n\nThis is your confidential space to talk about what you're going through at work — no judgment, no automatic reporting.\n\nI'm here to support you with:\n\n• 😤 **Stress & pressure** day to day\n• 😴 **Fatigue & burnout**\n• 💬 **Conflicts** with managers or colleagues\n• 😔 **Demotivation** or loss of purpose\n• 🤔 **Impostor syndrome**\n• 😢 **Sadness** or difficult moments\n• 📦 **Work overload**\n\nEverything you share stays between us. I'm listening. 💙",
    augmentation:    "**Asking for a raise in CS**\n\n**Before the conversation:**\n• Quantify your impact: ARR managed, renewal rate, NPS, accounts saved\n• Research market rates: Glassdoor, LinkedIn Salary\n• Best timing: after a visible success, during a 1-on-1\n\n**The script:**\n→ \"Over the past 12 months, I managed [X] ARR with [Y]% renewal\"\n→ \"I'd like to revise my compensation to [X]\"\n→ Never justify with personal needs\n\n**If your manager hesitates** → Ask for criteria and a review date\n\n→ Want me to help you prepare the exact script?",
    manager_conflit: "**Disagreement with your manager**\n\n**Before escalating:**\n• Clarify your goal: understand, change a decision, or express yourself?\n• Wait 24h — conversations when emotions are high are rarely productive\n\n**The productive conversation:**\n→ \"I'd like to understand the reasoning behind this decision\"\n→ Present your perspective with client impact data\n→ Propose an alternative rather than just rejecting\n\n→ What's the specific situation with your manager?",
    motivation_perte: "**Finding motivation again in CS**\n\n• Identify ONE client you're proud of — reach out to them today\n• Write down what this role has taught you this year\n• Talk to your manager: \"How can I have more impact?\"\n\n**The deeper question:**\n→ Is it the role that no longer fits, or the current environment?\n\n→ What do you miss most about CS?",
    fatigue_chron:   "**Chronic fatigue: actually recovering**\n\n→ Evening: digital cutoff 1h before bed\n→ Weekend: half a day without thinking about work\n→ On vacation: full disconnection\n\n**If it lasts more than 2 weeks** → See a doctor — this is serious\n\n→ How long have you been feeling this way?"
  };
  for (const [key, val] of Object.entries(NOVA_RESPONSES)) {
    if (key === "default" || key === "crise" || key === "tristesse") continue;
    if (val.trigger && val.trigger.some(t => lower.includes(t))) {
      const KR_MAP = {
      stress:        "**CS 스트레스 관리는 인식에서 시작해요.**\n\n**즉각 리셋 (5분):**\n• Slack/이메일 10분 닫기\n• 지금 머릿속에 있는 것 3가지 적기\n• 호흡 집중하기\n\n→ 무엇이 가장 무겁게 느껴지나요?",
      fatigue:       "**CS 피로는 회복이 필요해요.**\n\n• 점심시간 지키기 — 화면 없이\n• 오늘 해야 할 것 전부 써내기\n• 딱 하나만 깊게 집중하기\n\n→ 에너지를 가장 빼앗는 게 무엇인지 말해줄 수 있어요?",
      conflit:       "**갈등은 CS에서 자연스러워요.**\n\n• 먼저 듣고, 그다음 답하기\n• 비난 대신 '나 전달법' 쓰기\n• 모든 갈등이 해결될 필요는 없어요\n\n→ 어떤 상황인지 더 이야기해줄 수 있어요?",
      motivation:    "**의욕 저하는 정상이에요.**\n\n• 고객에게 가치 있는 메시지 하나 보내기\n• 최근 잘한 일 3가지 적기\n• 이 일을 시작하게 한 것 떠올리기\n\n→ 최근에 무언가 바뀐 게 있나요?",
      imposteur:     "**가면 증후군은 CS 전문가에게 흔해요.**\n\n• 고객이 당신을 신뢰하는 건 실력이에요\n• 당신의 직관을 믿어보세요\n• 완벽한 CSM은 없어요\n\n→ 이 감정을 촉발한 사건이 있나요?",
      surcharge:     "**과부하는 신호예요, 영구 상태가 아니에요.**\n\n• 해야 할 것 전부 나열하기\n• 진짜 긴급한 것 3개 표시\n• '거절'할 수 있는 것 1개 찾기\n\n→ 매니저에게 어떻게 전달할지 함께 준비해볼까요?",
      client_difficile: "**어려운 고객은 CS의 일부예요.**\n\n• 침착하게 — 그들의 불만은 당신에 대한 것이 아니에요\n• '도와드리겠습니다'로 시작하기\n• 한계를 명확히 말하기\n\n→ 어떤 상황인지 말해줄 수 있어요?"
    ,
      tristesse:       "이렇게 털어놓아 줘서 고마워요. 느끼는 것은 진짜예요.\n\n직장에서 깊은 슬픔을 느끼는 건 더 깊은 무언가가 주의를 필요로 한다는 신호일 수 있어요.\n\n**지금 당장:**\n• 혼자 있지 마세요 — 오늘 누군가에게 연락하세요.\n• 전문가와 이야기해보세요 — 상담사나 의사가 도울 수 있어요.\n• 회사 EAP가 있다면 이용해보세요 — 비밀 보장이에요.\n\n→ 오늘 믿을 수 있는 사람과 이야기할 수 있어요?",
      crise:           "당신의 말을 듣고 있어요.\n\n**혼자가 아니에요. 지금 바로 도움을 받을 수 있어요.**\n\n📞 **한국 — 1393** (자살예방상담전화, 무료, 24시간)\n📞 **한국 — 1577-0199** (정신건강 위기상담)\n📞 **한국 — 1388** (청소년 위기상담)\n\n이 전화는 비밀이 보장돼요. 훈련된 전문가들이 판단 없이 기다려요.\n\n즉각적인 위험에 처해 있다면 **112** 또는 **119**에 전화하세요.\n\n여기 함께 있을게요. 💚",
      default:         "안녕하세요, 저는 **Nova** 💚예요.\n\n이곳은 직장에서 겪는 일들을 편하게 이야기할 수 있는 비밀 공간이에요.\n\n함께 나눌 수 있는 것들:\n\n• 😤 **스트레스 & 압박** 일상적인 것들\n• 😴 **피로 & 번아웃** 직장에서\n• 💬 **갈등** 매니저나 동료와\n• 😔 **의욕 저하** 또는 목적을 잃은 느낌\n• 🤔 **가면 증후군**\n• 😢 **슬픔** 또는 힘든 순간들\n• 📦 **업무 과중**\n\n여기서 나누는 모든 것은 우리 사이에 있어요. 듣고 있어요. 💙",
      augmentation:    "**CS에서 연봉 협상하기**\n\n**대화 전 준비:**\n• 성과 정량화: 관리한 ARR, 갱신율, NPS, 구한 계정 수\n• 시장 조사: 잡플래닛, LinkedIn 급여 정보\n• 최적 타이밍: 눈에 띄는 성과 후, 1-on-1 미팅 시\n\n**스크립트:**\n→ \"지난 12개월 동안 [X] ARR을 [Y]% 갱신율로 관리했습니다\"\n→ \"제 보상을 [X]로 재검토하고 싶습니다\"\n→ 개인적 필요를 이유로 들지 마세요\n\n**매니저가 망설인다면** → 기준을 물어보고 재검토 날짜 제안\n\n→ 상황에 맞는 정확한 스크립트 준비를 도와드릴까요?",
      manager_conflit: "**매니저와의 의견 충돌**\n\n**에스컬레이션 전:**\n• 목적 명확화: 이해, 결정 변경, 아니면 표현?\n• 24시간 기다리기 — 감정이 고조된 대화는 거의 생산적이지 않아요\n\n**생산적인 대화:**\n→ \"이 결정 뒤에 있는 논리를 이해하고 싶어요\"\n→ 고객 임팩트 데이터로 자신의 관점 제시\n→ 거부하기보다 대안 제안\n\n→ 매니저와의 구체적인 상황이 어떤가요?",
      motivation_perte: "**CS에서 다시 동기 찾기**\n\n• 자랑스러운 고객 한 명을 찾아 오늘 연락해보세요\n• 이 역할이 올해 가르쳐준 것들을 적어보세요\n• 매니저에게: \"어떻게 하면 더 큰 임팩트를 낼 수 있을까요?\"\n\n**더 깊은 질문:**\n→ 더 이상 맞지 않는 게 역할인가요, 아니면 현재 환경인가요?\n\n→ CS에서 가장 그리운 것이 무엇인가요?",
      fatigue_chron:   "**만성 피로: 진짜로 회복하기**\n\n→ 저녁: 잠들기 1시간 전 디지털 차단\n→ 주말: 일 생각 없이 반나절 보내기\n→ 휴가: 완전한 단절\n\n**2주 이상 지속된다면** → 의사에게 상담받으세요\n\n→ 이런 느낌이 얼마나 됐나요?" 
    };
      return lang==="kr" ? (KR_MAP[key] || EN_MAP[key] || val.answer) : lang==="en" ? (EN_MAP[key] || val.answer) : val.answer;
    }
  }
  return lang==="kr"
    ? "감사해요, 이야기해줘서요. 💚\n\n**여기 있을게요.** CS 일은 정말 힘들 수 있어요.\n\n무슨 일이 있었는지 더 이야기해줄 수 있어요?"
    : lang==="en"
    ? "Thank you for sharing that with me.\n\n**I'm here for you.** CS work is demanding mentally and emotionally.\n\nTell me more about what you're going through."
    : "Merci de partager ca avec moi. Je t'ecoute.\n\n**Je suis la pour toi.** Le metier de CS est exigeant.\n\nDis-moi ce qui se passe, et on va traverser ca ensemble.";
};

const renderMD = (text) => {
  const parseInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    if(parts.length===1) return str;
    return parts.map((p,j)=>{
      if(p.startsWith("**")&&p.endsWith("**")&&p.length>4)
        return React.createElement("strong",{key:j,style:{color:C.teal,fontWeight:700}},p.slice(2,-2));
      return p;
    });
  };
  const lines=(text||"").split("\n");
  const els=lines.map((line,i)=>{
    const t=line.trim();
    if(!t) return React.createElement("div",{key:i,style:{height:6}});
    if(/^\*\*[^*].+[^*]\*\*$/.test(t)||/^\*\*\S+\*\*$/.test(t))
      return React.createElement("div",{key:i,style:{fontWeight:800,fontSize:13,margin:"8px 0 3px",color:C.teal}},t.replace(/\*\*/g,""));
    if(t.startsWith("→"))
      return React.createElement("div",{key:i,style:{paddingLeft:12,fontSize:12,margin:"3px 0",color:C.muted,fontStyle:"italic"}},parseInline(t));
    if(/^\d+\.\s/.test(t))
      return React.createElement("div",{key:i,style:{paddingLeft:12,fontSize:13,margin:"4px 0",lineHeight:1.6}},parseInline(t));
    if(t.startsWith("•")||t.startsWith("-")){
      const txt=t.startsWith("•")?t.slice(1).trim():t.slice(1).trim();
      return React.createElement("div",{key:i,style:{paddingLeft:16,fontSize:13,margin:"3px 0",lineHeight:1.6,display:"flex",gap:6}},
        React.createElement("span",{style:{color:C.teal,flexShrink:0}},"•"),
        React.createElement("span",null,parseInline(txt))
      );
    }
    if(t.startsWith("*")&&t.endsWith("*")&&!t.startsWith("**"))
      return React.createElement("div",{key:i,style:{fontStyle:"italic",color:C.muted,fontSize:12,margin:"3px 0"}},t.replace(/\*/g,""));
    return React.createElement("div",{key:i,style:{fontSize:13,margin:"3px 0",lineHeight:1.7}},parseInline(t));
  });
  return React.createElement(React.Fragment,null,...els);
};

const NOVA_EN_WELCOME = "Hi, I'm **Nova** 💚\n\nThis is your confidential space to talk about what you're going through at work — no judgment, no automatic escalation.\n\nI can support you with:\n\n\u2022 \uD83D\uDE24 **Stress & pressure** day to day\n\u2022 \uD83D\uDE34 **Fatigue & burnout** at work\n\u2022 \uD83D\uDCAC **Conflicts** with your manager or colleagues\n\u2022 \uD83D\uDE14 **Demotivation** or loss of purpose\n\u2022 \uD83E\uDD14 **Impostor syndrome**\n\u2022 \uD83D\uDE22 **Sadness** or difficult moments\n\u2022 \uD83D\uDCE6 **Overload**\n\nEverything you share stays between us. I can also help you prepare a conversation with your manager.\n\n**How are you, really?**";
const NOVA_KR_WELCOME = "안녕하세요, 저는 **Nova** 💚예요\n\n이곳은 직장에서 겪고 있는 일들을 편하게 이야기할 수 있는 안전한 공간이에요. 판단 없이, 비밀이 보장되는 곳이에요.\n\n오늘 기분이 어때요? 무엇이든 이야기해 주세요. 🌿";


export default PlanningView;
