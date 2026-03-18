/**
 * Scalyo - TipsView
 * Extracted from app.html (lines 13727-13779)
 */

import { T } from '../shared/i18n-wrapper.js';

// Tips data constants
const MANAGER_TIPS_EN = [
  {cat:"🎯 CSM Onboarding",tips:[
    {q:"How to structure a new CSM's onboarding?",a:"1. Prepare an onboarding kit (docs, tools, access). 2. Assign a mentor CSM for the first 2 weeks. 3. Schedule shadow calls on key accounts. 4. Set progressive goals: partial portfolio D+15, full D+60. 5. Weekly 1:1 for the first 3 months."},
    {q:"Which KPIs to track for a CSM on probation?",a:"Focus on process adoption (weekly calls held, CRM filled), first client interactions (satisfaction), and tool mastery (roadmap, QBR templates). Not on churn yet — too early."},
    {q:"How to accelerate skill development?",a:"Weekly 30-min sessions on a real scenario. Review one QBR per week. Share playbooks. Peer reviews of important emails. Celebrate wins publicly within the team."}
  ]},
  {cat:"📊 Performance Management",tips:[
    {q:"How to set balanced CS objectives?",a:"OKR framework adapted for CS: 1 retention objective (rate), 1 growth objective (expansion ARR), 1 satisfaction objective (NPS/CSAT). Break down by CSM weighted by portfolio complexity. Review quarterly."},
    {q:"How to prevent CSM burnout?",a:"Monitor workload (>30 accounts = risk). Identify early signals (CRM note quality, meeting cancellations, tone in Slack). Proactively rebalance portfolios. Create decompression rituals (informal weekly debrief)."}
  ]},
  {cat:"👥 Team Dynamics",tips:[
    {q:"How to create a knowledge-sharing culture in the CS team?",a:"Weekly 30-min team sync: 1 win, 1 challenge, 1 learning. Collaborative playbook library. Peer mentoring program. Team bonuses on collective goals (not just individual)."},
    {q:"How to manage an underperforming CSM?",a:"1. Diagnose first: skill or motivation issue? 2. 60-day improvement plan with clear milestones. 3. Intensified support (co-listening calls, immediate feedback). 4. Decision at D+60: continue, reposition, or separate."}
  ]}
];

const CSM_TIPS_EN = [
  {cat:"🤝 Collaborate Without Hierarchy",tips:[
    {q:"How to influence without formal authority?",a:"Credibility is built before you need it. 1. Master your domain (expertise = social capital). 2. Bring solutions, not problems. 3. Also advance others' topics. 4. Communicate transparently about your accounts."},
    {q:"How to handle a conflict with a colleague CSM?",a:"DESC method: Describe (facts, not interpretation), Express (impact on you), Specify (what you want), Consequence (what will change). In a 1:1, not in a meeting. If stuck, escalate quickly to the manager."}
  ]},
  {cat:"📈 Contribute Beyond Your Scope",tips:[
    {q:"How to contribute to CS process improvement?",a:"Keep a 'friction log': note what regularly blocks your clients. At month-end, synthesize and propose 1 concrete improvement. The best ideas come from the field — value them in team meetings."},
    {q:"How to become a reference in the team?",a:"Specialize in 1-2 verticals (B2B SaaS, Retail, etc.) or skills (data, complex onboarding). Share your learnings in meetings. Answer juniors' questions. Reference = available + competent + generous."}
  ]}
];

const MANAGER_TIPS_KR = [
  {cat:"🎯 CSM 온보딩",tips:[
    {q:"새 CSM 온보딩을 어떻게 구성하나요?",a:"1. 온보딩 키트 준비 (문서, 도구, 접근권). 2. 첫 2주 멘토 CSM 배정. 3. 주요 계정 섀도 콜 예약. 4. 점진적 목표 설정: D+15 부분 포트폴리오, D+60 전체. 5. 첫 3개월 주간 1:1."}
  ]},
  {cat:"📊 성과 관리",tips:[
    {q:"저성과 CSM을 어떻게 관리하나요?",a:"원인 파악: 과부하? 기술 부족? 동기 부족? 공동 PIP 계획 수립. 주간 1:1로 구체적 피드백 제공. 명확한 단계별 기대치 설정. 45-60일 후 진행 상황 평가."}
  ]}
];

const CSM_TIPS_KR = [
  {cat:"🤝 위계 없이 협업하기",tips:[
    {q:"공식적인 권한 없이 어떻게 영향을 미치나요?",a:"설득력 있는 데이터 활용. 다른 팀에게 wins 가시화. 비공식 관계 구축. 도움 요청 전에 먼저 제공."}
  ]}
];

const MANAGER_TIPS = [
  {cat:"🎯 Onboarding CSM",tips:[
    {q:"Comment structurer l'intégration d'un nouveau CSM ?",a:"1. Préparez un kit d'onboarding (docs, outils, accès). 2. Assignez un CSM mentor les 2 premières semaines. 3. Planifiez des shadow calls sur les comptes clés. 4. Fixez des objectifs progressifs : portfolio partiel J+15, full J+60. 5. Point hebdo les 3 premiers mois."}
  ]}
];

const CSM_TIPS = [
  {cat:"🤝 Collaborer sans hiérarchie",tips:[
    {q:"Comment influencer sans autorité formelle ?",a:"La crédibilité se construit avant d'en avoir besoin. 1. Maîtrisez votre domaine (expertise = capital social). 2. Apportez des solutions, pas des problèmes. 3. Faites avancer les sujets des autres aussi. 4. Communiquez en transparence sur vos comptes."}
  ]}
];

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


export default TipsView;
