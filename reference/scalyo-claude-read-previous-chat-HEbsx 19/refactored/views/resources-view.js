/**
 * Scalyo - ResourcesView
 * Extracted from app.html (lines 8634-9460)
 */

import { T } from '../shared/i18n-wrapper.js';


const ResourcesView = ({
  plan, lang="fr",
  role="manager",
  onUpgrade
}) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const categories = lang==="en" ? ["all", "Playbook", "Template", "Guide", "Training", "Coaching", "Process"] : lang==="kr" ? ["all", "Playbook", "Template", "가이드", "교육", "코칭", "프로세스"] : ["all", "Playbook", "Template", "Guide", "Formation", "Coaching", "Process"];
  const items = [{
    emoji: "🚀",
    type: "Playbook",
    color: C.teal,
    key: "Onboarding B2B J0→J30", title: lang==="en" ? "B2B Onboarding D0→D30" : lang==="kr" ? "B2B 온보딩 D0→D30" : "Onboarding B2B J0→J30",
    desc: lang==="en" ? "Maximize activation from day one. Full structure + KPIs." : lang==="kr" ? "첫날부터 활성화를 극대화하세요. 완전한 구조 + KPI." : "Maximisez l'activation dès la première semaine. Structure complète + KPIs.",
    locked: false
  }, {
    emoji: "🛡",
    type: "Playbook",
    color: C.purple,
    key: "Protocole Détection Churn", title: T('resChurn', lang),
    desc: lang==="en" ? "Early warning signals and 5-step intervention procedure." : lang==="kr" ? "조기 경보 신호와 5단계 개입 절차." : T("resDesc4",lang),
    locked: false
  }, {
    emoji: "📊",
    type: "Template",
    color: C.blue,
    key: "Matrice Priorisation CSM", title: lang==="en"?"CSM Prioritization Matrix":lang==="kr"?"CSM 우선순위 매트릭스":"Matrice Priorisation CSM",
    desc: lang==="en" ? "Classify accounts by value × risk. Fast decisions." : lang==="kr" ? "가치 × 위험으로 계정 분류. 빠른 의사결정." : T("resDesc3",lang),
    locked: false
  }, {
    emoji: "✉️",
    type: "Template",
    color: C.amber,
    key: "15 Emails — Cycle de Vie", title: lang==="en"?"15 Emails — Client Lifecycle":lang==="kr"?"이메일 15개 — 고객 생애주기":"15 Emails — Cycle de Vie",
    desc: lang==="en" ? "Templates for each stage: activation, follow-up, QBR, renewal." : lang==="kr" ? "각 단계별 템플릿: 활성화, 후속 관리, QBR, 갱신." : "Templates pour chaque étape : activation, suivi, QBR, renouvellement.",
    locked: false
  }, {
    emoji: "⭐",
    type: "Guide",
    color: C.green,
    key: "NPS de 0 à +50 en 60 jours", title: T('resNPS', lang),
    desc: lang==="en" ? "Complete framework with steps, scripts and tracking metrics." : lang==="kr" ? "단계, 스크립트, 추적 지표가 포함된 완전한 프레임워크." : T("resDesc1",lang),
    locked: false
  }, {
    emoji: "📈",
    type: "Template",
    color: C.teal,
    key: "Dashboard KPIs CS", title: lang==="en"?"CS KPIs Dashboard":lang==="kr"?"CS KPI 대시보드":"Dashboard KPIs CS",
    desc: lang==="en" ? "Essential metrics for your weekly team tracking." : lang==="kr" ? "팀 주간 추적을 위한 핵심 지표." : T("resDesc2",lang),
    locked: false
  }, {
    emoji: "🎓",
    type: "Formation",
    color: C.purple,
    key: "CS Masterclass — 6 Modules", title: lang==="en" ? "CS Masterclass — 6 Modules" : lang==="kr" ? "CS 마스터클래스 — 6개 모듈" : "CS Masterclass — 6 Modules",
    desc: lang==="en"?"Certified CS training. For managers and CSMs.":lang==="kr"?"CS 인증 교육. 매니저와 CSM을 위한 과정.":"Formation certifiante 100% francophone. Manager et CSM.",
    locked: plan === "Starter"
  }, {
    emoji: "🤖",
    type: "Template",
    color: C.blue,
    key: "Automated Email Sequences", title: lang==="en" ? "Automated Email Sequences" : lang==="kr" ? "자동화 이메일 시퀀스" : T("resEmailSeq",lang),
    desc: lang==="en" ? "Workflows triggered on key lifecycle events." : lang==="kr" ? "주요 라이프사이클 이벤트에서 트리거되는 워크플로우." : "Workflows déclenchés sur les événements clés du cycle de vie.",
    locked: plan === "Starter"
  }, {
    emoji: "📞",
    type: lang==="en" ? "Coaching" : lang==="kr" ? "코칭" : "Coaching",
    color: C.amber,
    key: "Monthly 1h Coaching Session",
    title: lang==="en"?"Monthly 1h Coaching Session":lang==="kr"?"월간 1시간 코칭 세션":"Session Coaching Mensuelle 1h",
    desc: lang==="en" ? "1h with your dedicated CS consultant. Personalized follow-up." : lang==="kr" ? "전담 CS 컨설턴트와 1시간. 맞춤 후속 관리." : T("resConsult",lang),
    locked: plan !== "Elite",
    managerOnly: true
  }, {
    emoji: "⚙️",
    type: "Playbook",
    color: C.green,
    key: "SOPs & Playbooks Sur-mesure", title: lang==="en" ? "SOPs & Custom Playbooks" : lang==="kr" ? "SOP & 맞춤 플레이북" : "SOPs & Playbooks Sur-mesure",
    desc: lang==="en" ? T("resDesc1",lang) : lang==="kr" ? "팀과 고객을 위한 완전 맞춤 프로세스." : "Processus entièrement customisés pour votre équipe et vos clients.",
    locked: plan !== "Elite"
  }, {
    emoji:"🤝", type:"Process", color:C.teal,
    key:"Process CSM — Gestion Clients",
    title:lang==="en"?"CSM Process — Client Management":lang==="kr"?"CSM 프로세스 — 고객 관리":"Process CSM — Gestion Clients",
    desc:lang==="en"?"Templates and workflows for the client lifecycle: onboarding, follow-up, renewal, upsell.":lang==="kr"?"고객 생애주기 관리를 위한 템플릿 및 워크플로우.":"Templates et workflows pour la gestion du cycle de vie client.",
    locked:false
  }, {
    emoji:"⚙️", type:"Process", color:C.blue,
    key:"Process CSM — Collaboration Équipes Dev",
    title:lang==="en"?"CSM Process — Dev Team Collaboration":lang==="kr"?"CSM 프로세스 — 개발팀 협업":"Process CSM — Collaboration Équipes Dev",
    desc:lang==="en"?"CSM/Dev workflows: bug escalation, feature prioritization, releases, client feedback.":lang==="kr"?"CSM/개발팀 협업 워크플로우.":"Workflows CSM/Dev : remontée bugs, priorisation features, releases.",
    locked:false
  }, {
    emoji:"📐", type:"Process", color:C.purple,
    key:"Process CSM / Chef de Projet",
    title:lang==="en"?"CSM / Project Manager Process":lang==="kr"?"CSM / 프로젝트 매니저 프로세스":"Process CSM / Chef de Projet",
    desc:lang==="en"?"CSM/PM framework: project coordination, deliverables, client communication, escalation.":lang==="kr"?"CSM/PM 프레임워크: 프로젝트 조율, 납품물, 소통.":"Cadre CSM/PM : coordination projets, livrables, communication client.",
    locked:false
  }, {
    emoji:"✅", type:"Process", color:C.green,
    key:"Process Qualité",
    title:lang==="en"?"Quality Process":lang==="kr"?"품질 프로세스":"Process Qualité",
    desc:lang==="en"?"CS quality standards: internal audits, satisfaction metrics, continuous improvement, SLA.":lang==="kr"?"CS 품질 기준: 내부 감사, 만족도, 개선, SLA.":"Standards qualité CS : audits internes, métriques satisfaction, amélioration continue.",
    locked:false
  }].filter(r => role === "manager" || !r.managerOnly);
  const filtered = activeCategory === "all" ? items : items.filter(r => r.type === activeCategory);
  const RC = lang==="en" ? RESOURCE_CONTENT_EN : lang==="kr" ? RESOURCE_CONTENT_KR : RESOURCE_CONTENT;
  const rKey = selectedResource?.key || selectedResource?.title;
  const content = selectedResource ? (RC[rKey] || RESOURCE_CONTENT[rKey]) : null;
  if (selectedResource && content) return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSelectedResource(null),
    className: "btn-base",
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 12,
      color: C.muted,
      cursor: "pointer"
    }
  }, lang==="en" ? "← Back" : lang==="kr" ? "← 뒤로" : T("resBack",lang)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26
    }
  }, selectedResource.emoji), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 900,
      fontSize: 16
    }
  }, selectedResource.title), /*#__PURE__*/React.createElement(Tag, {
    color: selectedResource.color,
    size: "xs"
  }, selectedResource.type))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "24px 30px",
      maxWidth: 820
    }
  }, content.sections.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 10,
      borderLeft: `3px solid ${C.teal}`,
      paddingLeft: 12
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "16px 18px"
    }
  }, s.content.split("\n").map((line, j) => {
    if (!line) return /*#__PURE__*/React.createElement("div", {key:j, style:{height:6}});
    const isCallout = line.startsWith("→ ") || line.startsWith("⚡ ") || line.startsWith("✅ ") || line.startsWith("❌ ");
    const isSeparator = line.startsWith("───");
    if (isSeparator) return /*#__PURE__*/React.createElement("div", {key:j, style:{borderTop:`1px solid ${C.border}`,margin:"10px 0"}});
    // Parse **bold** inline
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((p, pi) => p.startsWith("**") && p.endsWith("**")
      ? /*#__PURE__*/React.createElement("strong", {key:pi, style:{color:C.teal, fontWeight:800}}, p.slice(2,-2))
      : p);
    return /*#__PURE__*/React.createElement("div", {
      key: j,
      style: {
        fontSize: 13,
        lineHeight: 1.85,
        color: isCallout ? C.teal : C.text,
        background: isCallout ? C.tealBg : "transparent",
        borderRadius: isCallout ? 6 : 0,
        padding: isCallout ? "4px 10px" : "0",
        margin: isCallout ? "3px 0" : "0",
        fontWeight: isCallout ? 600 : 400
      }
    }, rendered);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.tealBg,
      border: `1px solid ${C.tealBorder}`,
      borderRadius: 12,
      padding: "16px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.teal,
      marginBottom: 6
    }
  }, lang==="en" ? "💡 Scalyo Tip" : lang==="kr" ? "💡 Scalyo 팁" : "💡 Conseil Stratima"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.text,
      lineHeight: 1.6
    }
  }, content.tip))), content.cta && /*#__PURE__*/React.createElement("a", {
    href: content.cta.url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: "inline-block",
      margin: "16px 0",
      padding: "12px 24px",
      background: C.teal,
      color: "#fff",
      borderRadius: 12,
      fontWeight: 700,
      fontSize: 14,
      textDecoration: "none"
    }
  }, content.cta.label)));
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      padding: "26px 30px",
      height: "100%",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      marginBottom: 4
    }
  }, lang==="en"?"📚 Resources & Tools":lang==="kr"?"📚 리소스 & 도구":"\uD83D\uDCDA Ressources & Outils"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 13
    }
  }, lang==="en"?"Templates, playbooks and guides — Plan ":lang==="kr"?"템플릿, 플레이북, 가이드 — ":"Templates, playbooks et guides \u2014 Plan ", plan))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 20,
      flexWrap: "wrap"
    }
  }, categories.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setActiveCategory(c),
    className: "btn-base",
    style: {
      fontSize: 12,
      padding: "5px 14px",
      borderRadius: 20,
      background: activeCategory === c ? C.tealBg : C.surface,
      border: `1px solid ${activeCategory === c ? C.tealBorder : C.border}`,
      color: activeCategory === c ? C.teal : C.muted
    }
  }, c === "all" ? (lang==="en" ? "All" : lang==="kr" ? "전체" : T("all",lang)) : c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
      gap: 12
    }
  }, filtered.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: r.locked ? onUpgrade : () => setSelectedResource(r),
    className: "card-lift",
    style: {
      background: r.locked ? C.faint : C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20,
      opacity: r.locked ? .65 : 1,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden"
    }
  }, r.locked && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(45,42,38,0.40)",
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backdropFilter: "blur(3px)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28
    }
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.amber,
      fontWeight: 700
    }
  }, plan === "Starter" ? (lang==="en"?"Growth plan required":lang==="kr"?"Growth 플랜 필요":"Plan Growth requis") : (lang==="en"?"Elite plan required":lang==="kr"?"Elite 플랜 필요":"Plan Elite requis")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, lang==="en" ? "Click to see plans" : lang==="kr" ? "플랜 보기" : T("tipsCTA",lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 30
    }
  }, r.emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: r.color,
    size: "xs"
  }, r.type), r.locked && /*#__PURE__*/React.createElement(Tag, {
    color: C.amber,
    size: "xs"
  }, "Premium"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      marginBottom: 6
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      lineHeight: 1.6,
      marginBottom: 14
    }
  }, r.desc), !r.locked && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: (lang==="en"||lang==="kr"?RESOURCE_CONTENT_EN:RESOURCE_CONTENT)[r.key||r.title]||RESOURCE_CONTENT[r.key||r.title] ? C.teal : C.muted,
      fontWeight: 700
    }
  }, (lang==="en"?RESOURCE_CONTENT_EN:RESOURCE_CONTENT)[r.key||r.title]||RESOURCE_CONTENT[r.key||r.title] ? (lang==="en" ? "→ Read full content" : lang==="kr" ? "→ 전체 내용 읽기" : "→ Lire le contenu complet") : (lang==="en" ? "→ Access now" : lang==="kr" ? "→ 지금 접속" : T("resAccess",lang)))))));
};

// ══════════════════════════════════════════════════
// EMAIL STUDIO VIEW
// ══════════════════════════════════════════════════
const EMAIL_TEMPLATES = [{
  id: "onboarding_j1",
  cat: "Onboarding",
  title: "Bienvenue & premiers pas",
  subject: T("resEmailWelcome",lang),
  body: `Bonjour [Prénom],

Bienvenue chez [Entreprise] ! Je suis [Votre prénom], votre Customer Success Manager dédié.

Je suis là pour vous accompagner et m'assurer que vous tirez le maximum de valeur de notre solution.

Pour commencer dans les meilleures conditions, voici vos 3 premières actions :

→ Étape 1 : Complétez votre profil et invitez votre équipe
→ Étape 2 : Planifiez votre session d'onboarding (lien ci-dessous)
→ Étape 3 : Rejoignez notre communauté d'utilisateurs

📅 Je vous propose un appel de démarrage de 30 min cette semaine.
Choisissez le créneau qui vous convient : [Lien Calendly]

En attendant, n'hésitez pas à me contacter pour toute question.

Bien cordialement,
[Votre prénom]
Customer Success Manager`
}, {
  id: "qbr_invite",
  cat: "QBR",
  title: "Invitation QBR trimestriel",
  subject: T("resEmailQBR",lang),
  body: `Bonjour [Prénom],

Le prochain trimestre approche et c'est le bon moment pour faire un point stratégique sur vos résultats.

Je vous propose notre Revue Trimestrielle (QBR) pour :

📊 Analyser vos KPIs et les comparer à vos objectifs
🎯 Valider les priorités du prochain trimestre  
💡 Identifier de nouvelles opportunités de valeur
🔮 Aligner votre roadmap avec nos évolutions produit

Durée : 45 minutes · Format : Visio ou présentiel selon votre préférence

📅 Créneaux disponibles : [Semaine du XX au XX]
Réservez directement : [Lien Calendly]

Ce rendez-vous est stratégique pour maximiser votre ROI. Je prépare un rapport personnalisé en amont.

À très bientôt,
[Votre prénom]`
}, {
  id: "health_check",
  cat: lang==="kr"?"팔로우업":lang==="en"?"Follow-up":"Suivi",
  title: T("resHealth",lang),
  subject: T("resEmailDash",lang),
  body: `Bonjour [Prénom],

Voici votre récapitulatif mensuel pour [Mois].

📈 Vos indicateurs clés :
• Taux d'adoption : [XX]% (objectif : [YY]%)
• Utilisateurs actifs : [N] sur [Total]
• Tickets résolus : [N] · Temps moyen : [X]h

⚡ Points d'attention ce mois :
→ [Point 1]
→ [Point 2]

✅ Succès à célébrer :
→ [Réalisation]

💡 Ma recommandation pour le mois prochain :
[Conseil personnalisé]

Avez-vous des questions ou des besoins particuliers ? Je suis disponible pour un appel rapide.

Bonne lecture,
[Votre prénom]`
}, {
  id: "churn_alert",
  cat: lang==="kr"?"위험":lang==="en"?"Risk":"Risque",
  title: T("resRisk",lang),
  subject: T("resEmailCheck",lang),
  body: `Bonjour [Prénom],

J'ai remarqué que l'utilisation de la plateforme a diminué ces dernières semaines. En tant que votre CSM, il est important pour moi de comprendre si vous rencontrez des difficultés.

Mon objectif est simple : m'assurer que vous obtenez la valeur attendue.

Quelques questions rapides :
• Rencontrez-vous des obstacles techniques ou d'usage ?
• Vos besoins ont-ils évolué depuis notre dernier échange ?
• Y a-t-il des fonctionnalités que vous n'utilisez pas encore et qui pourraient vous aider ?

Je vous propose un appel de 20 minutes cette semaine pour faire le point.
Choisissez un créneau : [Lien]

Votre succès est ma priorité.

[Votre prénom]`
}, {
  id: "renewal",
  cat: lang==="kr"?"갱신":lang==="en"?"Renewal":"Renouvellement",
  title: "갱신 준비",
  subject: lang==="kr"?"귀하의 구독 — [N]일 후 갱신":lang==="en"?"Your subscription — renewal in [N] days":"Votre abonnement — renouvellement dans [N] jours",
  body: `Bonjour [Prénom],

Votre abonnement arrive à renouvellement le [Date]. Je souhaitais vous contacter en amont pour préparer cette étape ensemble.

Cette année avec [Produit], voici ce que vous avez accompli :

🏆 Résultats clés :
• [Métrique 1]
• [Métrique 2]
• [ROI estimé]

💼 Ce que nous avons prévu pour la prochaine période :
• [Nouveauté 1]
• [Nouveauté 2]

Je souhaite m'assurer que les conditions de renouvellement correspondent à vos besoins actuels. Souhaitez-vous en discuter lors d'un appel rapide ?

📅 Réservez 30 minutes : [Lien Calendly]

Bien à vous,
[Votre prénom]`
}, {
  id: "expansion",
  cat: "Expansion",
  title: "확장 기회",
  subject: T("resUpgradeTip",lang),
  body: `Bonjour [Prénom],

Au vu de votre utilisation et des résultats que vous obtenez avec [Produit], j'ai identifié une opportunité qui pourrait vous apporter encore plus de valeur.

[Description de l'opportunité d'expansion]

Pourquoi maintenant ?
• Votre équipe est mature sur les fonctionnalités actuelles
• Cette évolution correspond à votre prochain objectif [Objectif]
• Nous avons des clients similaires qui ont obtenu [Résultat]

Cette expansion représente un investissement de [Montant]/mois, pour un ROI estimé à [ROI].

Seriez-vous disponible pour en discuter ?
📅 [Lien Calendly]

[Votre prénom]`
}];

const EMAIL_TEMPLATES_EN = [{
  id: "onboarding_j1",
  cat: "Onboarding",
  title: "Welcome & first steps",
  subject: "Welcome to [Company] — your getting started guide",
  body: `Hi [First Name],

Welcome to [Company]! I'm [Your Name], your dedicated Customer Success Manager.

I'm here to make sure you get the maximum value from our solution, as quickly as possible.

Here are your 3 first steps to get started on the right foot:

→ Step 1: Complete your profile and invite your team
→ Step 2: Schedule your onboarding session (link below)
→ Step 3: Join our user community

📅 I'd love to connect for a 30-min kickoff call this week.
Pick a time that works for you: [Calendly Link]

In the meantime, feel free to reply to this email with any questions.

Best,
[Your Name]
Customer Success Manager`
}, {
  id: "qbr_invite",
  cat: "QBR",
  title: "Quarterly Business Review invitation",
  subject: "QBR Q[N] — Your quarterly success review",
  body: `Hi [First Name],

The new quarter is approaching — it's the perfect time for a strategic check-in on your results.

I'd like to schedule our Quarterly Business Review (QBR) to:

📊 Review your KPIs against your goals
🎯 Align priorities for the next quarter
💡 Identify new value opportunities
🔮 Align your roadmap with our product updates

Duration: 45 minutes · Format: Video or in-person, your preference

📅 Available slots: [Week of XX to XX]
Book directly: [Calendly Link]

This meeting is strategic for maximizing your ROI. I'll prepare a personalized report in advance.

See you soon,
[Your Name]`
}, {
  id: "health_check",
  cat: "Follow-up",
  title: "Monthly health check",
  subject: "📊 Your [Month] dashboard — key highlights",
  body: `Hi [First Name],

Here's your monthly summary for [Month].

📈 Key metrics:
• Adoption rate: [XX]% (target: [YY]%)
• Active users: [N] out of [Total]
• Support tickets resolved: [N] · Avg. time: [X]h

⚡ This month's focus points:
→ [Point 1]
→ [Point 2]

✅ Wins to celebrate:
→ [Achievement]

💡 My recommendation for next month:
[Personalized advice]

Any questions or specific needs? I'm available for a quick call.

Best,
[Your Name]`
}, {
  id: "churn_alert",
  cat: "Risk",
  title: "At-risk account re-engagement",
  subject: "📞 Checking in — [Company]",
  body: `Hi [First Name],

I noticed that platform usage has decreased over the past few weeks. As your CSM, I want to make sure you're getting the value you expected.

My goal is simple: ensure you're achieving the outcomes we planned together.

A few quick questions:
• Are you running into any technical or usage challenges?
• Have your needs changed since we last spoke?
• Are there features you haven't explored yet that could help?

I'd love to connect for a 20-minute call this week to catch up.
Pick a slot: [Link]

Your success is my priority.

[Your Name]`
}, {
  id: "renewal",
  cat: "Renewal",
  title: "Renewal preparation",
  subject: "Your subscription — renewal in [N] days",
  body: `Hi [First Name],

Your subscription renews on [Date]. I wanted to reach out ahead of time so we can prepare this next step together.

Here's what you've accomplished with [Product] this year:

🏆 Key results:
• [Metric 1]
• [Metric 2]
• [Estimated ROI]

💼 What's coming in the next period:
• [New feature 1]
• [New feature 2]

I want to make sure the renewal terms reflect your current needs. Would you like to discuss this on a quick call?

📅 Book 30 minutes: [Calendly Link]

Best,
[Your Name]`
}, {
  id: "expansion",
  cat: "Expansion",
  title: "Expansion opportunity",
  subject: "💡 An opportunity to go even further",
  body: `Hi [First Name],

Looking at your usage and the results you're achieving with [Product], I've identified an opportunity that could create even more value for your team.

[Description of the expansion opportunity]

Why now?
• Your team is fully up to speed on current features
• This upgrade aligns with your next milestone: [Goal]
• Similar clients have achieved [Result]

This expansion represents an investment of [Amount]/month, with an estimated ROI of [ROI].

Would you be open to a conversation?
📅 [Calendly Link]

[Your Name]`
}];

const EMAIL_TEMPLATES_KR = [{
  id: "onboarding_j1",
  cat: "온보딩",
  title: "환영 & 첫 걸음",
  subject: "환영합니다, [이름]님 — 시작 가이드",
  body: `안녕하세요 [이름]님,

[회사]에 오신 것을 환영합니다! 저는 [담당자 이름]입니다, 전담 Customer Success Manager입니다.

저는 귀하께서 우리 솔루션으로 최대한의 가치를 최대한 빠르게 얻을 수 있도록 돕기 위해 여기 있습니다.

올바른 시작을 위한 첫 3가지 단계:

→ 1단계: 프로필을 완성하고 팀원을 초대하세요
→ 2단계: 온보딩 세션을 예약하세요 (아래 링크)
→ 3단계: 사용자 커뮤니티에 참여하세요

📅 이번 주 30분 킥오프 콜을 원합니다.
편리한 시간을 선택해 주세요: [캘린들리 링크]

궁금한 점이 있으시면 언제든 연락해 주세요.

감사합니다,
[담당자 이름]
Customer Success Manager`
}, {
  id: "qbr_invite",
  cat: "QBR",
  title: "분기 비즈니스 리뷰 초대",
  subject: "QBR Q[N] — 분기 성과 리뷰",
  body: `안녕하세요 [이름]님,

새 분기가 다가오고 있습니다 — 결과에 대한 전략적 체크인을 할 좋은 시간입니다.

분기별 비즈니스 리뷰(QBR)를 제안드립니다:

📊 목표 대비 KPI 리뷰
🎯 다음 분기 우선순위 정렬
💡 새로운 가치 기회 파악
🔮 제품 업데이트와 로드맵 정렬

소요 시간: 45분 · 형식: 화상 또는 대면 (선택)

📅 가능한 일정: [XX~XX 주]
직접 예약: [캘린들리 링크]

이 미팅은 ROI를 극대화하는 데 전략적입니다. 개인화된 보고서를 미리 준비하겠습니다.

곧 뵙겠습니다,
[담당자 이름]`
}, {
  id: "health_check",
  cat: "팔로우업",
  title: "월간 헬스 체크",
  subject: "📊 [월]의 대시보드 — 주요 내용",
  body: `안녕하세요 [이름]님,

[월]의 월간 요약입니다.

📈 핵심 지표:
• 도입률: [XX]% (목표: [YY]%)
• 활성 사용자: [총]명 중 [N]명
• 해결된 지원 티켓: [N]건 · 평균 시간: [X]시간

⚡ 이번 달 주의 사항:
→ [포인트 1]
→ [포인트 2]

✅ 축하할 성과:
→ [성과]

💡 다음 달 추천사항:
[개인화 조언]

질문이나 특정 요청이 있으시면 빠른 통화를 위해 언제든 연락 주세요.

감사합니다,
[담당자 이름]`
}, {
  id: "churn_alert",
  cat: "위험",
  title: "위험 계정 재참여",
  subject: "📞 안부 확인 — [회사]",
  body: `안녕하세요 [이름]님,

지난 몇 주간 플랫폼 사용이 감소했음을 확인했습니다. 담당 CSM으로서 기대하신 가치를 얻고 계신지 확인하고 싶습니다.

제 목표는 간단합니다: 함께 계획한 성과를 달성하고 계신지 확인하는 것입니다.

빠른 몇 가지 질문:
• 기술적 또는 사용상 어려움이 있으신가요?
• 마지막 대화 이후 필요가 변경되었나요?
• 아직 탐색하지 않은 도움이 될 수 있는 기능이 있나요?

이번 주 20분 통화를 제안드립니다.
시간을 선택해 주세요: [링크]

귀하의 성공이 저의 최우선입니다.

[담당자 이름]`
}, {
  id: "renewal",
  cat: "갱신",
  title: "갱신 준비",
  subject: "귀하의 구독 — [N]일 후 갱신",
  body: `안녕하세요 [이름]님,

구독이 [날짜]에 갱신됩니다. 이 다음 단계를 함께 준비하기 위해 미리 연락드립니다.

올해 [제품]으로 달성하신 것들:

🏆 주요 결과:
• [지표 1]
• [지표 2]
• [예상 ROI]

💼 다음 기간에 예정된 것들:
• [새 기능 1]
• [새 기능 2]

갱신 조건이 현재 필요에 맞는지 확인하고 싶습니다. 빠른 통화로 논의하시겠어요?

📅 30분 예약: [캘린들리 링크]

감사합니다,
[담당자 이름]`
}, {
  id: "expansion",
  cat: "확장",
  title: "확장 기회",
  subject: "💡 더 나아갈 기회",
  body: `안녕하세요 [이름]님,

[제품]으로 귀하의 사용 현황과 달성하신 결과를 보면, 팀에 더 많은 가치를 창출할 수 있는 기회를 발견했습니다.

[확장 기회 설명]

왜 지금인가요?
• 팀이 현재 기능에 완전히 익숙해졌습니다
• 이 업그레이드는 다음 목표와 일치합니다: [목표]
• 유사한 고객들이 [결과]를 달성했습니다

이 확장은 월 [금액]의 투자이며, 예상 ROI는 [ROI]입니다.

대화를 나눌 의향이 있으신가요?
📅 [캘린들리 링크]

[담당자 이름]`
}];



export default ResourcesView;
