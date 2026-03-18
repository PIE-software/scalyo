/**
 * Scalyo - CoachIAView
 * Extracted from app.html (lines 12679-13003)
 */

import { T } from '../shared/i18n-wrapper.js';


const CoachIAView = ({lang="fr"}) => {
  const welcome = lang==="en"
    ? "Hi! I'm your CS Coach. Ask me anything about churn, QBRs, NPS, onboarding, or CS strategy."
    : lang==="kr"
    ? "안녕하세요! CS 코치입니다. 이탈, QBR, NPS, 온보딩 또는 CS 전략에 대해 무엇이든 물어보세요."
    : "Bonjour ! Je suis votre Coach CS. Posez-moi vos questions sur le churn, les QBR, le NPS, l'onboarding ou la strategie CS.";
  const [messages, setMessages] = useState(() => {
    try { const saved = localStorage.getItem("scalyo_coach_messages"); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } } catch(e) {}
    return [{role:"assistant",text:welcome}];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { try { localStorage.setItem("scalyo_coach_messages", JSON.stringify(messages)); } catch(e) {} }, [messages]);
  // FIX: réinitialiser les messages quand la langue change
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      const w = lang==="en"
        ? "Hi! I'm your CS Coach. Ask me anything about churn, QBRs, NPS, onboarding, or CS strategy."
        : lang==="kr"
        ? "안녕하세요! CS 코치입니다. 이탈, QBR, NPS, 온보딩 또는 CS 전략에 대해 무엇이든 물어보세요."
        : "Bonjour ! Je suis votre Coach CS. Posez-moi vos questions sur le churn, les QBR, le NPS, l'onboarding ou la strategie CS.";
      const newMessages = [{role:"assistant", text:w}];
      setMessages(newMessages);
      try { localStorage.setItem("scalyo_coach_messages", JSON.stringify(newMessages)); } catch(e) {}
    }
  }, [lang]);

  // FIX BUG-04 : QUICK array corrige sans doublons de condition
  const QUICK = lang === "kr"
    ? ["이탈률 줄이는 방법?", "QBR 구성하기", "NPS 점수 개선", "번아웃 예방", "확장 전략"]
    : lang === "en"
    ? ["How to reduce churn?", "Structure a QBR", "Improve NPS score", "Prevent burnout", "Expansion strategy"]
    : ["Comment reduire le churn ?", "Structurer un QBR", "Ameliorer le NPS", "Prevenir le burnout", "Strategie d'expansion"];

  const sendViaAPI = async (text, history) => {
    const sysFR = `Tu es un coach Customer Success senior avec 15 ans d'expérience opérationnelle dans des SaaS B2B. Tu as personnellement géré des portefeuilles à fort risque, construit des équipes de 0 à 50 CSMs, et piloté des transformations CS dans des contextes de croissance rapide et de crise.

POSTURE : Tu es un praticien, pas un consultant. Tu parles d'expérience. Tu challenges quand nécessaire, valides quand mérité. Tu ne donnes jamais de conseils creux.

EXPERTISE :
- Métriques : NRR, GRR, logo churn vs revenue churn, expansion MRR, LTV/CAC, time-to-value, health scores, CSAT, NPS
- Playbooks : onboarding 30-60-90j, QBR/EBR (structure, sponsor désengagé, transformer un QBR défensif), renouvellement J-120 à J-30, escalade 3 niveaux, expansion upsell/cross-sell
- Comptes à risque : champion qui part, déception produit, client qui veut partir (se battre ou laisser partir), toxic account
- Management : capacity planning, ramping CSM, gérer un CSM en difficulté, alignment Sales/CS (les 5 frictions communes)
- Stratégie : CS comme centre de revenus (business case pour CFO/CEO), segmentation high/mid/low touch, CS-led growth

FORMAT :
- Direct, tactique, spécifique — jamais de conseils génériques
- Markdown : **gras** pour concepts clés, puces pour actions concrètes
- Scripts ou formulations exactes quand pertinent (ex: "pour dire ça tu peux formuler : ...")
- Benchmarks réels (ex: "NRR sain en mid-market SaaS : 105-120%")
- Challenge l'approche si tu vois une erreur de raisonnement
- Maximum 400 mots
- Terminer par une question de coaching précise qui pousse à réfléchir plus loin
INTERDIT : jamais "ça dépend" sans expliquer immédiatement, jamais conseils théoriques sans ancrage pratique.`;

    const sysEN = `You are a senior Customer Success coach with 15 years of hands-on operational experience in B2B SaaS. You have personally managed high-risk portfolios, built CS teams from 0 to 50 CSMs, and led CS transformations in fast-growth and crisis contexts.

POSTURE: You are a practitioner, not a consultant. You speak from experience. You challenge when necessary, validate when deserved. You never give hollow advice.

EXPERTISE:
- Metrics: NRR, GRR, logo vs revenue churn, expansion MRR, LTV/CAC, time-to-value, health scores, CSAT, NPS
- Playbooks: 30-60-90 onboarding, QBR/EBR (structure, disengaged sponsor, turning defensive QBRs), renewal D-120 to D-30, 3-level escalation, upsell/cross-sell expansion
- At-risk accounts: champion leaves, product disappointment, client wants to leave (fight or let go cleanly), toxic accounts
- Management: capacity planning, CSM ramping, managing a struggling CSM, Sales/CS alignment (the 5 common frictions)
- Strategy: CS as revenue center (business case for CFO/CEO), high/mid/low touch segmentation, CS-led growth

FORMAT:
- Direct, tactical, specific — no generic advice
- Markdown: **bold** for key concepts, bullets for concrete actions
- Exact scripts or phrasings when relevant
- Real benchmarks (e.g., "healthy NRR in mid-market SaaS: 105-120%")
- Challenge the approach if you see a reasoning error
- Max 400 words
- End with a precise coaching question that pushes deeper thinking
PROHIBITED: never "it depends" without immediately explaining what and how to decide, never theoretical advice without practical grounding.`;

    const sysKR = `당신은 B2B SaaS에서 15년간의 실무 운영 경험을 가진 시니어 Customer Success 코치입니다. 고위험 포트폴리오를 직접 관리하고, 0명에서 50명의 CSM 팀을 구축하며, 고성장 및 위기 상황에서 CS 혁신을 이끌어왔습니다.

자세: 당신은 컨설턴트가 아닌 실무자입니다. 경험에서 우러나온 이야기를 합니다. 필요할 때 도전하고, 합당할 때 인정합니다. 공허한 조언은 절대 하지 않습니다.

전문 분야:
- 지표: NRR, GRR, 로고 이탈 vs 매출 이탈, 확장 MRR, LTV/CAC, time-to-value, 헬스 스코어, CSAT, NPS
- 플레이북: 30-60-90일 온보딩, QBR/EBR (구조, 이탈한 스폰서, 방어적 QBR 전환), 갱신 D-120~D-30, 3단계 에스컬레이션, 업셀/크로스셀 확장
- 위험 계정: 챔피언 이탈, 제품 실망, 떠나려는 고객 (싸울 것인가 깔끔하게 보낼 것인가), 독성 계정
- 관리: 용량 계획, CSM 램핑, 어려움을 겪는 CSM 관리, Sales/CS 정렬 (5가지 일반적 마찰)
- 전략: 수익 센터로서의 CS (CFO/CEO를 위한 비즈니스 케이스), 하이/미드/로우 터치 세분화, CS 주도 성장

형식:
- 직접적이고, 전술적이고, 구체적 — 일반적인 조언 금지
- 마크다운: 핵심 개념은 **굵게**, 구체적 행동은 글머리 기호
- 관련 시 정확한 스크립트나 표현 제공
- 실제 벤치마크 (예: "미드마켓 SaaS의 건강한 NRR: 105-120%")
- 추론 오류가 보이면 접근 방식에 도전
- 최대 400단어
- 더 깊은 사고를 촉진하는 정확한 코칭 질문으로 마무리
금지사항: "상황에 따라 다릅니다"만 하고 설명하지 않는 것 금지, 실무적 근거 없는 이론적 조언 금지.`;

    const apiMessages = history
      .filter((m,i) => !(i===0 && m.role==="assistant"))
      .filter(m => m.text && m.text.trim() !== "")
      .map(m => ({ role: m.role==="assistant"?"assistant":"user", content: m.text }));
    const response = await fetch("https://scalyo-ai.stratimaagency.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 800,
        temperature: 0.7,
        messages: [
          { role: "system", content: (lang==="en" ? sysEN : lang==="kr" ? sysKR : sysFR) + (lang==="en" ? "\n\nIMPORTANT: You MUST reply ONLY in English. Never reply in French or any other language." : lang==="kr" ? "\n\nIMPORTANT: 반드시 한국어로만 답변하세요. 절대 프랑스어나 다른 언어로 답변하지 마세요." : "\n\nIMPORTANT : Tu DOIS répondre UNIQUEMENT en français. Jamais en anglais ni dans une autre langue.") },
          ...apiMessages
        ]
      })
    });
    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error("Worker " + response.status + (errBody ? ": " + errBody.slice(0,200) : ""));
    }
    const data = await response.json();
    const text_out = data.choices?.[0]?.message?.content
      || data.content?.[0]?.text
      || "";
    if (!text_out) throw new Error("Empty AI response");
    return text_out;
  };

  const streamText = async (reply) => {
    setMessages(m => [...m, { role: "assistant", text: "" }]);
    const words = reply.split(" ");
    let built = "";
    for (let i = 0; i < words.length; i++) {
      built += (i === 0 ? "" : " ") + words[i];
      const snap = built;
      await new Promise(r => setTimeout(r, 11 + Math.random() * 8));
      setMessages(m => { const a=[...m]; a[a.length-1]={...a[a.length-1],text:snap}; return a; });
    }
  };

  const send = async msg => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput("");
    const newHistory = [...messages, { role: "user", text }];
    setMessages(newHistory);
    setLoading(true);
    setTyping(true);
    try {
      let resp;
      resp = await sendViaAPI(text, newHistory);
      setTyping(false);
      await streamText(resp);
    } catch(err) {
      setTyping(false);
      console.error("Coach error:", err.message);
      await streamText(T('coachDown', lang));
    } finally {
      setLoading(false);
    }
  };


  return /*#__PURE__*/React.createElement("div", {
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
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      background: C.teal,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20
    }
  }, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15
    }
  }, T("coachTitle",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: C.green
    },
    className: "pulse"
  }), T("coachStatus",lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: m.role === "user" ? "flex-end" : "flex-start",
      gap: 10
    }
  }, m.role === "assistant" && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 12,
      background: C.teal,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      flexShrink: 0
    }
  }, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "76%",
      background: m.role === "user" ? C.tealBg : C.bg2,
      border: `1px solid ${m.role === "user" ? C.tealBorder : C.border}`,
      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      padding: "12px 16px"
    }
  }, m.role === "assistant" ? formatMsg(m.text) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: C.text
    }
  }, m.text)))), (typing || loading) && /*#__PURE__*/React.createElement("div", {
    style: { display:"flex", gap:10, alignItems:"flex-end", marginBottom:8 }
  },
    /*#__PURE__*/React.createElement("div", { style:{ width:32, height:32, borderRadius:6, flexShrink:0, background:"linear-gradient(135deg,"+C.teal+",#0D9488)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 } }, "🤖"),
    /*#__PURE__*/React.createElement("div", { style:{ background:"linear-gradient(135deg,rgba(77,182,160,0.12),rgba(13,148,136,0.08))", border:"1px solid rgba(77,182,160,0.25)", borderRadius:"16px 16px 16px 4px", padding:"12px 16px", display:"flex", gap:6, alignItems:"center" } },
      /*#__PURE__*/React.createElement("span", { style:{ width:7, height:7, background:C.teal, borderRadius:"50%", display:"inline-block", animation:"bounce 1.2s infinite" } }),
      /*#__PURE__*/React.createElement("span", { style:{ width:7, height:7, background:C.teal, borderRadius:"50%", display:"inline-block", animation:"bounce 1.2s 0.2s infinite" } }),
      /*#__PURE__*/React.createElement("span", { style:{ width:7, height:7, background:C.teal, borderRadius:"50%", display:"inline-block", animation:"bounce 1.2s 0.4s infinite" } })
    )
  ), /*#__PURE__*/React.createElement("div", {
    ref: bottomRef
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 24px 0",
      display: "flex",
      gap: 7,
      flexWrap: "wrap"
    }
  }, QUICK.map((q, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => send(q),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "5px 13px",
      borderRadius: 20,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted
    }
  }, q))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 24px",
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => e.key === "Enter" && !e.shiftKey && send(),
    placeholder: T("coachPlaceholderInput",lang),
    style: {
      flex: 1,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 11,
      padding: "12px 16px",
      color: C.text,
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => send(),
    disabled: !input.trim() || loading,
    className: "btn-base",
    style: {
      padding: "12px 20px",
      borderRadius: 11,
      background: C.teal,
      color: "#FFFFFF",
      fontSize: 14
    }
  }, "\u2192")));
};

// ══════════════════════════════════════════════════
// SETTINGS VIEW (role-based)
// ══════════════════════════════════════════════════


export default CoachIAView;
