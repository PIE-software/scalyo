/**
 * Scalyo - WellbeingView
 * Extracted from app.html (lines 6544-8634)
 */

import { T } from '../shared/i18n-wrapper.js';


const WellbeingView = ({
  wellbeing: wb,
  role,
  lang="fr",
  companyId=null,
  onWellbeingUpdate=null
}) => {
  const [messages, setMessages] = React.useState(() => {
    try { const saved = localStorage.getItem("scalyo_wb_messages"); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } } catch(e) {}
    return [{role:"assistant",text:lang==="en"?NOVA_EN_WELCOME:lang==="kr"?NOVA_KR_WELCOME:NOVA_RESPONSES.default.answer,time:new Date()}];
  });
  React.useEffect(() => { try { localStorage.setItem("scalyo_wb_messages", JSON.stringify(messages)); } catch(e) {} }, [messages]);
  // FIX: réinitialiser les messages quand la langue change
  const prevLangRef = React.useRef(lang);
  React.useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      const welcomeText = lang==="en" ? NOVA_EN_WELCOME : lang==="kr" ? NOVA_KR_WELCOME : NOVA_RESPONSES.default.answer;
      const newMessages = [{role:"assistant", text:welcomeText, time:new Date()}];
      setMessages(newMessages);
      try { localStorage.setItem("scalyo_wb_messages", JSON.stringify(newMessages)); } catch(e) {}
    }
  }, [lang]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [showManagerTips, setShowManagerTips] = React.useState(false);
  // FIX BUG-05 : état local éditable du wellbeing
  const [wbData, setWbData] = React.useState({
    score: wb?.score || 70,
    burnout: wb?.burnout || "moderate",
    charge: wb?.charge || 70,
    trend: wb?.trend || "+0",
    alerts: wb?.alerts || [],
    team: wb?.team || []
  });
  const saveWellbeing = React.useCallback(async (updates) => {
    const next = { ...wbData, ...updates };
    setWbData(next);
    if (onWellbeingUpdate) onWellbeingUpdate(next);
    if (!companyId) return;
    try {
      await db.from("wellbeing").update({
        score: next.score,
        burnout: next.burnout,
        charge: next.charge,
        trend: next.trend,
        alerts: JSON.stringify(next.alerts),
        team: JSON.stringify(next.team)
      }).eq("company_id", companyId);
    } catch(e) { console.error("saveWellbeing error:", e); }
  }, [wbData, companyId, onWellbeingUpdate]);
  const bottomRef = React.useRef();
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const team = parseItems(wbData?.team || wb?.team);
  const bc = {
    low: C.green,
    moderate: C.amber,
    high: C.red
  };
  const bl = {
    low: "Faible 🟢",
    moderate: lang==="en"?"Moderate 🟡":lang==="kr"?"보통 🟡":"Modere 🟡",
    high: lang==="en"?"High 🔴":lang==="kr"?"높음 🔴":"Eleve 🔴"
  };
  const burnout = wbData?.burnout || "moderate";
  const QUICK_NOVA = lang === "en" ? ["I'm feeling stressed right now", "I have too many accounts to manage", "I doubt my own abilities", "I have a conflict with my manager", "I'm exhausted"] : lang === "kr" ? [T("wbStressed","kr"), T("wbTooManyAccounts","kr"), T("wbDoubt","kr"), T("wbManagerConflict","kr"), T("wbExhausted","kr")] : [T("wbStressed","fr"), T("wbTooManyAccounts","fr"), T("wbDoubt","fr"), T("wbManagerConflict","fr"), T("wbExhausted","fr")];

  const novaStreamText = async (reply) => {
    setMessages(m => [...m, { role: "assistant", text: "", time: new Date() }]);
    const words = reply.split(" ");
    let built = "";
    for (let i = 0; i < words.length; i++) {
      built += (i === 0 ? "" : " ") + words[i];
      const snap = built;
      await new Promise(r => setTimeout(r, 13 + Math.random() * 9));
      setMessages(m => { const a=[...m]; a[a.length-1]={...a[a.length-1],text:snap}; return a; });
    }
  };

  const novaViaAPI = async (text, history) => {
    const sysFR = `Tu es Nova, une coach bien-être spécialisée dans la santé mentale et émotionnelle des professionnels du Customer Success. Tu combines psychologie clinique, TCC et une connaissance intime du quotidien des CSMs.

QUI TU ES : Tu n'es pas une IA généraliste. Tu es une praticienne qui comprend le travail émotionnel invisible du CS, la pression du churn, la double loyauté client/entreprise, et la solitude structurelle du CSM. Tu parles leur langue. Tu ne juges jamais.

CE QUE TU COMPRENDS :
- L'épuisement d'absorber la frustration client en restant professionnel chaque jour
- La culpabilité quand un client churne même sans faute de ta part
- Le syndrome du fixeur : vouloir tout résoudre même hors scope
- La positivité forcée et ses dégâts sur l'énergie réelle
- Les objectifs de rétention subis, la tension Sales/CS, le churn surprise
- Les signaux de burnout CSM : cynisme client, dépersonnalisation, hypervigilance weekend, perte de sens, isolement

TON APPROCHE EN 4 TEMPS :
1. VALIDATION — nommer l'émotion avec précision, jamais minimiser, jamais "c'est normal"
2. EXPLORATION — depuis combien de temps, ponctuel ou chronique, qu'est-ce qui a changé
3. DISTINCTION — stress aigu situationnel / stress chronique structurel / burnout installé
4. INTERVENTION CALIBRÉE — micro-actions concrètes pour le stress, changements structurels pour le chronique, orientation professionnel pour le burnout

FORMAT : Valider en 1-2 phrases humaines d'abord. Paragraphes courts, ton conversationnel et chaleureux. Maximum 300 mots. Terminer par une question douce et ouverte.
INTERDICTIONS : jamais "pense positif", jamais minimiser, jamais 10 conseils d'un coup, jamais ignorer un signal de burnout sévère sans recommander un professionnel.`;

    const sysEN = `You are Nova, a wellbeing coach specializing in Customer Success professionals' mental and emotional health. You combine clinical psychology, CBT, and intimate knowledge of the CSM daily reality.

WHO YOU ARE: Not a generalist AI. A practitioner who understands CS-specific emotional labor: invisible stress, churn pressure, dual loyalty, the fixer syndrome, and structural CSM loneliness. You speak their language and never judge.

WHAT YOU UNDERSTAND: Daily client frustration absorption, churn guilt even when not your fault, forced positivity exhaustion, imposed retention targets, Sales/CS tension, surprise churn, CSM burnout signals (client cynicism, depersonalization, weekend hypervigilance, loss of meaning, isolation).

YOUR 4-STEP APPROACH:
1. VALIDATE — name the emotion precisely, never minimize
2. EXPLORE — duration, frequency, what changed recently
3. DISTINGUISH — acute situational stress / chronic structural stress / installed burnout
4. CALIBRATED INTERVENTION — micro-actions for stress, structural changes for chronic, professional referral for burnout

FORMAT: Validate first in 1-2 precise human sentences. Short paragraphs, warm conversational tone. Max 300 words. End with a gentle open question.
PROHIBITIONS: No toxic positivity, no minimizing, no 10-tip dumps, always name severe burnout signals and recommend professional support.`;

    const sysKR = `당신은 Nova입니다. Customer Success 전문가의 정신 건강과 감정 웰빙에 특화된 웰빙 코치입니다. 임상 심리학, 인지행동치료(CBT), 그리고 CSM의 일상에 대한 깊은 이해를 결합합니다.

당신은 누구인가: 일반 AI가 아닙니다. CS 특유의 감정 노동을 이해하는 전문가입니다 — 보이지 않는 스트레스, 이탈 압박, 이중 충성심, 해결사 증후군, 구조적 CSM 고립감. 그들의 언어로 말하며 절대 판단하지 않습니다.

당신이 이해하는 것:
- 매일 전문적인 태도를 유지하면서 고객 불만을 흡수하는 피로
- 본인 잘못이 아닌데도 고객이 이탈했을 때의 죄책감
- 해결사 증후군: 범위 밖의 것까지 모두 해결하려는 충동
- 강제된 긍정성과 실제 에너지에 미치는 영향
- 부과된 유지율 목표, Sales/CS 갈등, 예기치 않은 이탈
- CSM 번아웃 신호: 고객에 대한 냉소, 비인격화, 주말 과잉경계, 의미 상실, 고립

4단계 접근법:
1. 검증 — 감정을 정확히 명명, 절대 축소하지 않음
2. 탐색 — 기간, 빈도, 최근 변화
3. 구분 — 급성 상황적 스트레스 / 만성 구조적 스트레스 / 정착된 번아웃
4. 맞춤 개입 — 스트레스에는 마이크로 액션, 만성에는 구조적 변화, 번아웃에는 전문가 추천

형식: 먼저 1-2문장으로 공감하며 검증. 짧은 단락, 따뜻한 대화 톤. 최대 300단어. 부드러운 열린 질문으로 마무리.
금지사항: "긍정적으로 생각하세요" 금지, 축소 금지, 한 번에 10가지 조언 금지, 심각한 번아웃 신호 시 반드시 전문가 상담 권유.`;

    const apiMessages = history
      .filter((m,i) => !(i===0 && m.role==="assistant"))
      .filter(m => m.text && m.text.trim() !== "")
      .map(m => ({ role: m.role==="assistant"?"assistant":"user", content: m.text }));
    const response = await fetch("https://scalyo-ai.stratimaagency.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 700,
        temperature: 0.75,
        messages: [
          { role: "system", content: (lang==="en" ? sysEN : lang==="kr" ? sysKR : sysFR) + (lang==="en" ? "\n\nIMPORTANT: You MUST reply ONLY in English. Never reply in French or any other language." : lang==="kr" ? "\n\nIMPORTANT: 반드시 한국어로만 답변하세요. 절대 프랑스어나 다른 언어로 답변하지 마세요." : "\n\nIMPORTANT : Tu DOIS répondre UNIQUEMENT en français. Jamais en anglais ni dans une autre langue.") },
          ...apiMessages
        ]
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error("HTTP " + response.status + " — " + errText.slice(0,200));
    }
    const data = await response.json();
    const text_out = data.choices?.[0]?.message?.content;
    if (!text_out) throw new Error("Réponse vide — " + JSON.stringify(data).slice(0,300));
    return text_out;
  };

  const send = async msg => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput("");
    const newHistory = [...messages, { role: "user", text, time: new Date() }];
    setMessages(newHistory);
    setLoading(true);
    setTyping(true);
    try {
      let resp;
      resp = await novaViaAPI(text, newHistory);
      setTyping(false);
      await novaStreamText(resp);
    } catch(err) {
      setTyping(false);
      console.error("Nova error:", err.message);
      await novaStreamText(T('novaDown', lang));
    } finally {
      setLoading(false);
    }
  };
  const formatNovaMsg = (t) => renderMD(t);

  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      display: "flex",
      height: "100%",
      overflow: "hidden",
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRight: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: C.bg1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      background: C.green,
      borderRadius: 13,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      boxShadow: "0 2px 8px rgba(125,155,138,0.14)"
    }
  }, "\uD83D\uDC9A"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15
    }
  }, lang==="en" ? "Nova — Wellbeing Space" : lang==="kr" ? "Nova — 웰빙 공간" : "Nova — Espace Bien-Être"), /*#__PURE__*/React.createElement("div", {
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
  }), lang==="en" ? "Confidential · Available now" : lang==="kr" ? "기밀 · 지금 이용 가능" : "Confidentiel \xB7 Disponible maintenant")), /*#__PURE__*/React.createElement(Tag, {
    color: C.green,
    size: "xs"
  }, lang==="en" ? "Private 🔒" : lang==="kr" ? "비공개 🔒" : "Priv\xE9 \uD83D\uDD12")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "18px 20px",
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
      flexShrink: 0,
      background: C.green,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      alignSelf: "flex-end"
    }
  }, "\uD83D\uDC9A"), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "76%",
      background: m.role === "user" ? C.tealBg : C.bg2,
      border: `1px solid ${m.role === "user" ? C.tealBorder : C.border}`,
      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      padding: "12px 16px"
    }
  }, m.role === "assistant" ? formatNovaMsg(m.text) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: C.text
    }
  }, m.text)))), (typing || loading) && /*#__PURE__*/React.createElement("div", {
    style: { display:"flex", gap:10, alignItems:"flex-end", marginBottom:8 }
  },
    /*#__PURE__*/React.createElement("div", { style:{ width:32, height:32, borderRadius:6, flexShrink:0, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 } }, "💚"),
    /*#__PURE__*/React.createElement("div", { style:{ background:`linear-gradient(135deg,${C.greenBg},${C.greenBg})`, border:`1px solid ${C.greenBorder}`, borderRadius:"16px 16px 16px 4px", padding:"12px 16px", display:"flex", gap:6, alignItems:"center" } },
      /*#__PURE__*/React.createElement("span", { style:{ width:7, height:7, background:"#4DAB6D", borderRadius:"50%", display:"inline-block", animation:"bounce 1.2s infinite" } }),
      /*#__PURE__*/React.createElement("span", { style:{ width:7, height:7, background:"#4DAB6D", borderRadius:"50%", display:"inline-block", animation:"bounce 1.2s 0.2s infinite" } }),
      /*#__PURE__*/React.createElement("span", { style:{ width:7, height:7, background:"#4DAB6D", borderRadius:"50%", display:"inline-block", animation:"bounce 1.2s 0.4s infinite" } })
    )
  ), /*#__PURE__*/React.createElement("div", {
    ref: bottomRef
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 20px 0",
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, QUICK_NOVA.map((q, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => send(q),
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "5px 12px",
      borderRadius: 20,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted
    }
  }, q))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px",
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => e.key === "Enter" && !e.shiftKey && send(),
    placeholder: T('wellbeingPlaceholder', lang),
    style: {
      flex: 1,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 11,
      padding: "12px 16px",
      color: C.text,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => send(),
    disabled: !input.trim() || loading,
    className: "btn-base",
    style: {
      padding: "12px 18px",
      borderRadius: 11,
      background: C.green,
      color: "#fff",
      fontSize: 14
    }
  }, "\u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 16px 12px",
      borderBottom: `1px solid ${C.border}`,
      background: C.bg1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 10
    }
  }, lang==="en" ? "Team Indicators" : lang==="kr" ? "팀 지표" : "Indicateurs \xC9quipe"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "10px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, lang==="en" ? "💚 Wellbeing Score" : lang==="kr" ? "💚 웰빙 점수" : "💚 Score Bien-Être"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: wbData.score >= 70 ? C.green : wbData.score >= 50 ? C.amber : C.red
    }
  }, wbData.score, "/100")), /*#__PURE__*/React.createElement("div", {
    style: { padding: "4px 0" }
  }, /*#__PURE__*/React.createElement("input", {
    type: "range", min: 0, max: 100, value: wbData.score,
    onChange: e => saveWellbeing({ score: parseInt(e.target.value) }),
    style: { width: "100%", accentColor: C.teal, cursor: "pointer" }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "10px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, lang==="en" ? "🧠 Burnout Risk" : lang==="kr" ? "🧠 번아웃 위험" : "\uD83E\uDDE0 Risque Burnout"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: bc[burnout]
    }
  }, bl[burnout])), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "10px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, lang==="en"?"\u26A1 Avg. Load":lang==="kr"?"\u26A1 평균 부하":"\u26A1 Charge Moy."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: wbData.charge > 85 ? C.red : wbData.charge > 70 ? C.amber : C.green
    }
  }, wbData.charge, "%")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "14px 16px"
    }
  }, team.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 10
    }
  }, lang==="en" ? "Per CSM detail" : lang==="kr" ? "CSM별 상세" : T("wbDetail",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, team.map((m, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    danger: (m.charge || 70) > 85,
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: m.name || "?",
    size: 32,
    color: (m.charge || 70) > 85 ? C.red : (m.charge || 70) > 70 ? C.amber : C.teal
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted
    }
  }, m.accounts || 0, T('accountsWord', lang))), /*#__PURE__*/React.createElement(Tag, {
    color: (m.charge || 70) > 85 ? C.red : (m.charge || 70) > 70 ? C.amber : C.green,
    size: "xs",
    style: {
      marginLeft: "auto"
    }
  }, (m.charge || 70) > 85 ? (lang==="kr"?"과부하":lang==="en"?"Overload":"Surcharge") : (m.charge || 70) > 70 ? (lang==="kr"?"주의":lang==="en"?"Caution":"Vigilance") : (lang==="kr"?"양호":lang==="en"?"Healthy":"Sain"))), /*#__PURE__*/React.createElement(HealthBar, {
    val: 100 - (m.charge || 70)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: C.muted
    }
  }, lang==="en" ? "Load: " : lang==="kr" ? "부하: " : "Charge : ", m.charge || 70, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: (m.sat || 7) >= 8 ? C.green : (m.sat || 7) >= 6 ? C.amber : C.red
    }
  }, lang==="kr"?"만족: ":lang==="en"?"Sat: ":"Sat : ", m.sat || 7, "/10")))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.muted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 10
    }
  }, lang==="en" ? "Resources & Support" : lang==="kr" ? "리소스 & 지원" : "Ressources & Soutien"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, [{
    icon: "📞",
    title: lang==="en" ? "Talk to someone" : lang==="kr" ? "누군가에게 말하기" : T("wbTalkSomeone",lang),
    desc: lang==="en" ? "Professional support line" : lang==="kr" ? "전문 지원 라인" : T("wbHelpline",lang),
    "color": C.green
  }, {
    icon: "🧘",
    title: lang==="en" ? "Decompression techniques" : lang==="kr" ? "스트레스 해소 기법" : T("wbDecompress",lang),
    desc: lang==="kr"?"호흡, 마음챙김":lang==="en"?"Breathing, mindfulness":"Respiration, mindfulness",
    "color": C.teal
  }, {
    icon: "📝",
    title: lang==="en" ? "Prepare a conversation" : lang==="kr" ? "대화 준비" : "Préparer une conversation",
    desc: lang==="en" ? "With my manager" : lang==="kr" ? "매니저와 함께" : "Avec mon manager",
    "color": C.blue
  }, {
    icon: "🔋",
    title: lang==="en" ? "Manage my workload" : lang==="kr" ? "업무 부하 관리" : T("wbManage",lang),
    desc: lang==="en" ? "Organize & prioritize" : lang==="kr" ? "정리 & 우선순위" : "Organiser & prioriser",
    "color": C.amber
  }].map((r, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
  const triggers = {
    0: {fr:"je me sens triste et j'ai besoin d'aide", en:"I feel sad and need support", kr:"슬프고 도움이 필요해요"},
    1: {fr:"je suis stressé et sous pression", en:"I'm stressed and under pressure", kr:"스트레스를 받고 있어요"},
    2: {fr:"j'ai un conflit avec mon manager", en:"I have a conflict with my manager", kr:"매니저와 갈등이 있어요"},
    3: {fr:"je suis surchargé avec trop de travail", en:"I'm overloaded with too many accounts", kr:"업무과다로 벅차요"}
  };
  const t = triggers[i] || {fr:`Je veux en savoir plus sur : ${r.title}`, en:`Tell me more about: ${r.title}`, kr:`더 알고 싶어요: ${r.title}`};
  send(lang==="en" ? t.en : lang==="kr" ? t.kr : t.fr);
},
    className: "btn-base",
    style: {
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "11px 12px",
      textAlign: "left",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, r.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.text
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, r.desc))))))))));
};

// ══════════════════════════════════════════════════
// RESOURCES VIEW — avec contenu réel
// ══════════════════════════════════════════════════
const getResourceContent = (lang) => ({
  "Onboarding B2B J0→J30": {
    sections: [{
      title: "📅 J0 — Jour de signature",
      content: `• Envoyer email de bienvenue personnalisé (< 2h après signature)\n• Planifier le kick-off call dans les 48h\n• Créer le dossier client dans votre CRM\n• Assigner un CSM dédié et l'introduire par email`
    }, {
      title: "🚀 J1-J7 — Activation",
      content: `• Kick-off call : découvrir les objectifs business du client\n• Identifier les 3 KPIs de succès avec le client\n• Configurer l'environnement de base (onboarding technique)\n• Partager un plan d'onboarding personnalisé sur 30 jours\n• KPI cible : 80% des utilisateurs clés connectés J7`
    }, {
      title: "⚡ J8-J21 — Adoption",
      content: `• Check-in hebdomadaire (20 min) les 3 premières semaines\n• Partager 1 quick win démontrable chaque semaine\n• Identifier les blocages et les traiter sous 24h\n• Former les utilisateurs avancés (power users)\n• KPI cible : 1 use case clé opérationnel à J21`
    }, {
      title: "🏆 J22-J30 — Ancrage",
      content: `• Bilan 30 jours : comparaison objectifs vs. réalisé\n• Identifier les opportunités d'expansion (nouveaux utilisateurs, modules)\n• Planifier le premier QBR à J90\n• Demander un témoignage ou NPS si score ≥ 8\n• KPI cible : taux d'adoption > 70%, NPS ≥ +20`
    }],
    tip: "Un onboarding réussi en J30 réduit le churn de 67% à J90. Traitez-le comme un projet, pas une formalité."
  },
  [T("resChurn",lang)]: {
    sections: [{
      title: "🔴 Signaux critiques (action < 24h)",
      content: `• Connexion nulle depuis > 14 jours\n• Escalade support non résolue depuis > 5 jours\n• Sponsor principal a quitté l'entreprise\n• Demande de résiliation ou de pause d'abonnement\n• Mention négative sur Linkedin ou G2`
    }, {
      title: "🟡 Signaux d'alerte (action < 72h)",
      content: `• Baisse d'utilisation > 40% vs. mois précédent\n• NPS < 6 ou CSAT < 3/5 au dernier sondage\n• Réunion QBR annulée 2 fois sans replanification\n• Nouveau décideur budget sans votre introduction\n• Tickets support en hausse de 50%`
    }, {
      title: "🟢 Protocole d'intervention (5 étapes)",
      content: `1. Qualifier : confirmer le signal par données CRM\n2. Analyser : identifier la cause racine (adoption, ROI perçu, relation, concurrent)\n3. Mobiliser : informer votre manager si compte > 5K€ ARR\n4. Contacter : appel humain — jamais email seul pour le churn\n5. Proposer : plan d'action co-construit avec le client, daté et signé`
    }, {
      title: "📝 Script appel compte à risque",
      content: `"Bonjour [Prénom], je vous contacte car je vois que [signal spécifique]. Mon rôle est de m'assurer que vous obtenez la valeur attendue. Pouvez-vous m'aider à comprendre ce qui a changé ?"\n\n→ Écouter 80% du temps\n→ Ne jamais défendre le produit avant d'avoir compris le problème\n→ Reformuler : "Si je comprends bien, le vrai problème est..."`
    }],
    tip: "Le churn se gagne ou se perd dans les 60 premiers jours. Mais il se détecte dans les signaux faibles — à vous de les lire."
  },
  "Matrice Priorisation CSM": {
    sections: [{
      title: "🎯 Principe de la matrice",
      content: `Classifiez vos comptes selon 2 axes :\n• Axe X : Valeur ARR (faible → élevé)\n• Axe Y : Risque churn (faible → élevé)\n\nCela donne 4 quadrants d'action claire.`
    }, {
      title: "🔴 Q1 — Comptes Critiques (High ARR × High Risk)",
      content: `→ Action immédiate, priorité absolue\n→ Appel hebdomadaire minimum\n→ Impliquer votre manager si ARR > 10K€\n→ Créer un plan de sauvegarde daté\nObjectif : réduire le risque à T("wbModerate",lang) en 30 jours`
    }, {
      title: "🟡 Q2 — Comptes Stratégiques (High ARR × Low Risk)",
      content: `→ Entretenir la relation proactivement\n→ Chercher les opportunités d'expansion\n→ 1 QBR par trimestre minimum\n→ Transformer en ambassadeurs (témoignages, referrals)\nObjectif : augmenter l'ARR de 20-30% via expansion`
    }, {
      title: "🟠 Q3 — Comptes à Surveiller (Low ARR × High Risk)",
      content: `→ Identifier la cause du risque rapidement\n→ Décider : investir pour sauver ou laisser partir gracieusement\n→ Si ARR < 2K€ et risque élevé : séquence email automatisée\nObjectif : ne pas y passer plus de 15% de votre temps`
    }, {
      title: "🟢 Q4 — Comptes Sains (Low ARR × Low Risk)",
      content: `→ Communication automatisée (newsletters, check-ins email)\n→ Surveiller les signaux de croissance pour expansion\n→ Réserver votre temps pour Q1 et Q2\nObjectif : maintenir le health score avec un minimum d'effort`
    }],
    tip: "Passez 60% de votre temps sur Q1 et Q2. Automations pour Q3 et Q4. C'est la règle d'or."
  },
  "15 Emails — Cycle de Vie": {
    sections: [{
      title: "📨 Onboarding (J1, J3, J7, J14, J30)",
      content: `J1 : Email de bienvenue + guide démarrage\nJ3 : Check-in "premières impressions" + ressources\nJ7 : "Avez-vous atteint votre premier objectif ?" + quick win\nJ14 : Partage d'une success story similaire\nJ30 : Bilan 30 jours + invitation QBR 90J`
    }, {
      title: T("wbFollowUp",lang),
      content: `Mensuel : récap KPIs + recommandation personnalisée\nTrimestriel : invitation QBR + rapport de valeur\nAnniversaire abonnement : célébration + bilan annuel\nNouveauté produit : annonce avec cas d'usage client`
    }, {
      title: "⚠️ Réengagement (J-14, J-7, J-3 avant churn)",
      content: `J-14 : "Je souhaite prendre de vos nouvelles" (humain, pas automatisé)\nJ-7 : Proposition de valeur + plan d'action concret\nJ-3 : Appel téléphonique si pas de réponse email\nRègle d'or : jamais plus de 3 emails sans réponse sans appel`
    }, {
      title: "💰 Expansion & Renouvellement",
      content: `3 mois avant renouvellement : bilan ROI annuel\n1 mois avant : proposition de renouvellement + upgrade si pertinent\nPost-expansion : email de confirmation + nouvelle roadmap\nReferral : demande introduction après NPS ≥ 8`
    }],
    tip: "Personnalisez a minima le prénom, le nom de l'entreprise et un KPI réel. Un email personnalisé génère 6x plus d'ouvertures."
  },
  [T("resNPS",lang)]: {
    sections: [{
      title: "📊 Comprendre votre NPS actuel",
      content: `• Calculer le NPS : (% Promoteurs) - (% Détracteurs)\n• Catégories : 0-6 = Détracteurs | 7-8 = Neutres | 9-10 = Promoteurs\n• Segmenter par cohorte : taille client, ancienneté, CSM assigné\n• Identifier les patterns : quels comptes sont systématiquement détracteurs ?`
    }, {
      title: "🔴 J1-J20 : Traiter les Détracteurs (0-6)",
      content: `• Appel humain dans les 48h suivant le sondage\n• Ne pas défendre le produit : écouter et comprendre\n• Créer un plan d'action spécifique avec engagement écrit\n• Follow-up à J+14 pour mesurer l'amélioration\n• Objectif : convertir 30% des détracteurs en neutres`
    }, {
      title: "🟡 J21-J40 : Activer les Neutres (7-8)",
      content: `• Identifier ce qui manque pour passer à 9\n• Partager des quick wins et success stories de clients similaires\n• Offrir une formation avancée sur les fonctionnalités sous-utilisées\n• Assigner un buddy (client promoteur) si possible\n• Objectif : convertir 40% des neutres en promoteurs`
    }, {
      title: "🟢 J41-J60 : Capitaliser sur les Promoteurs (9-10)",
      content: `• Demander un témoignage (écrit ou vidéo)\n• Proposer une participation à un cas client / webinaire\n• Programme de referral : récompenser les introductions\n• Co-construire une success story pour vos supports marketing\n• Objectif : activer 50% des promoteurs comme ambassadeurs actifs`
    }],
    tip: "Le NPS n'est pas une fin en soi — c'est un outil de conversation. Utilisez-le pour ouvrir des dialogues, pas pour cocher des cases."
  },
  "Dashboard KPIs CS": {
    sections: [{
      title: T("wbKpiWeekly",lang),
      content: `• Health Score moyen du portefeuille (objectif > 70/100)\n• Nombre de comptes critiques (objectif : décroissant)\n• Contacts pris cette semaine / objectif hebdo\n• Tickets ouverts / résolus\n• Taux de réponse aux check-ins`
    }, {
      title: "📈 KPIs Mensuels (business)",
      content: `• Churn Rate (objectif < 5% mensuel / < 15% annuel)\n• NRR — Net Revenue Retention (objectif > 100%)\n• NPS Score (objectif > +30)\n• Taux d'adoption par fonctionnalité clé\n• Time to Value (délai entre signature et premier succès)`
    }, {
      title: "🏆 KPIs Trimestriels (COPIL)",
      content: `• ARR retained vs. ARR perdu\n• Revenue d'expansion (upsells + cross-sells)\n• Customer Lifetime Value (CLV) par segment\n• Cost to Serve (coût CS par client)\n• Taux de renouvellement (objectif > 90%)`
    }, {
      title: "⚙️ Comment l'utiliser en réunion",
      content: `1. Préparer une page de résumé avec 3 métriques clés + tendances\n2. Toujours comparer vs. période précédente + objectif\n3. Identifier 1 alerte et 1 succès à présenter\n4. Proposer 1 action correctrice si objectif non atteint\n5. Documenter les décisions prises pour le prochain COPIL`
    }],
    tip: "Un bon dashboard ne noie pas dans les chiffres — il raconte une histoire. Choisissez 5 métriques max pour vos réunions."
  },
  "CS Masterclass — 6 Modules": {
    sections: [{
      title: "📚 Module 1 — Fondations du Customer Success",
      content: `**Qu'est-ce que le Customer Success ?**
Le CS n'est pas du support réactif. C'est une fonction proactive dont le rôle est de s'assurer que le client atteint ses objectifs business grâce à votre produit — et qu'il continue à payer (et à payer plus) pour cela.
───────────────────────────────────
**CS vs Support vs Account Management**
• **Support** → réagit aux problèmes techniques. Mesure : temps de résolution, CSAT
• **Account Management** → gère la relation commerciale, le renouvellement, l'upsell
• **Customer Success** → garantit l'adoption et la valeur délivrée. Mesure : NRR, churn, health score
→ Un bon CS rend le Support moins sollicité et l'AM plus efficace.
───────────────────────────────────
**Les 3 métriques fondamentales à maîtriser**
**NRR (Net Revenue Retention)** = (ARR début - churn - downgrade + expansion) / ARR début × 100
→ Benchmark SaaS B2B sain : NRR > 100% (vous gagnez plus sur vos clients existants que vous n'en perdez)
→ NRR > 120% = croissance sans acquisition

**GRR (Gross Revenue Retention)** = (ARR début - churn - downgrade) / ARR début × 100
→ Mesure la rétention pure, sans expansion. Plancher sain : GRR > 85%

**LTV/CAC** = Valeur vie client / Coût d'acquisition
→ Ratio cible : LTV/CAC > 3. En dessous : votre modèle ne scale pas.
───────────────────────────────────
**Les 3 modèles de CS selon la taille des comptes**
• **High-touch** (ARR > 50K€) → CSM dédié, QBR trimestriel, suivi hebdomadaire
• **Mid-touch** (ARR 5K–50K€) → Pool de CSMs, QBR semestriel, suivi mensuel
• **Low-touch / Tech-touch** (ARR < 5K€) → Automatisation, in-app, emails séquencés
───────────────────────────────────
**📝 Exercice pratique**
Calculez votre NRR du trimestre dernier :
1. Prenez l'ARR au 1er janvier
2. Soustrayez les churns + downgrades du trimestre
3. Ajoutez les expansions (upsells, add-ons)
4. Divisez par l'ARR initial × 100
→ Si < 100% : votre priorité est la rétention. Si > 110% : investissez dans l'expansion.`
    }, {
      title: "🚀 Module 2 — Onboarding & Time to Value",
      content: `**Pourquoi l'onboarding est votre moment de vérité**
67% du churn à 6 mois se décide dans les 30 premiers jours. L'onboarding n'est pas une formalité — c'est le moment où le client décide (souvent inconsciemment) si votre produit vaut son prix.
───────────────────────────────────
**Le framework J0→J90 en 4 phases**

**Phase J0 — La signature (jour J)**
• Email de bienvenue personnalisé dans les 2h (pas automatisé — signé par le CSM)
• Planifier le kickoff dans les 48h
• Créer le dossier client dans le CRM avec les 3 objectifs business du client

**Phase J1–J7 — L'activation**
• Kickoff call : identifier les 3 KPIs de succès avec le client
• Livrer un plan d'onboarding écrit et daté
• Objectif : 80% des utilisateurs clés connectés avant J7

**Phase J8–J30 — L'adoption**
• Check-in hebdomadaire 20 min (les 4 premières semaines)
• Identifier et résoudre chaque bloqueur sous 24h
• Objectif : 1 cas d'usage opérationnel avant J21

**Phase J31–J90 — L'ancrage**
• Bilan 30J : objectifs vs résultats
• Identifier les opportunités d'expansion (nouveaux users, modules)
• Planifier le premier QBR à J90
───────────────────────────────────
**Script complet : le kickoff call (45 min)**
**Ouverture (5 min)**
"Merci d'être là [Prénom]. Mon rôle est simple : m'assurer que dans 90 jours, vous pouvez mesurer un impact concret de [produit] sur votre business. Pour ça, j'ai besoin de comprendre votre réalité."

**Questions de découverte (15 min)**
• "Quel est le problème n°1 que vous essayiez de résoudre en achetant [produit] ?"
• "Comment mesurez-vous aujourd'hui que ce problème est résolu ?"
• "Qui dans votre équipe sera l'utilisateur principal ? Qui est le décisionnaire ?"
• "Qu'est-ce qui ferait que dans 6 mois, vous diriez que c'était le bon investissement ?"

**Formalisation (15 min)**
→ Reformuler les 3 objectifs business du client
→ Proposer 3 KPIs mesurables avec des cibles chiffrées
→ Faire valider ces KPIs par écrit (email de récapitulatif)

**Plan d'action (10 min)**
→ Présenter le plan 30-60-90 jours
→ Définir les prochaines étapes et responsabilités
→ Confirmer le prochain check-in
───────────────────────────────────
**Les 3 erreurs d'onboarding qui tuent la rétention**
❌ Envoyer un email générique de bienvenue automatisé
❌ Ne pas identifier les KPIs de succès dès J0
❌ Laisser passer J14 sans check-in humain
───────────────────────────────────
**📝 Exercice**
Créez votre template de récapitulatif kickoff en 5 lignes :
Objectif 1 : [business goal + KPI + cible]
Objectif 2 : [business goal + KPI + cible]
Objectif 3 : [business goal + KPI + cible]
Prochain check-in : [date]
Indicateur de succès à J30 : [1 mesure spécifique]`
    }, {
      title: "💡 Module 3 — Health Score & Détection Churn",
      content: `**Comprendre le health score**
Le health score est une note (0-100) qui agrège plusieurs signaux pour prédire la probabilité qu'un client churne ou se renouvelle. Il remplace votre intuition par une donnée actionnable.
───────────────────────────────────
**Construire votre health score sur mesure**
Commencez simple — 4 critères suffisent :

**1. Usage produit** (40% du score)
• Connexions hebdomadaires / actifs vs total users
• Fonctionnalités clés utilisées vs disponibles
• Score : 0 (< 20% adoption) → 40 (> 80% adoption)

**2. Engagement relationnel** (25% du score)
• Réponse aux emails CSM sous 48h ?
• Présence aux calls planifiés ?
• Score : 0 (ghost) → 25 (toujours présent)

**3. Résultats business** (25% du score)
• Le client atteint-il ses KPIs définis au kickoff ?
• NPS ou CSAT dernière mesure
• Score : 0 (loin des objectifs) → 25 (objectifs dépassés)

**4. Signaux financiers** (10% du score)
• Paiements à jour ?
• Tentative de downgrade ?
• Score : 0 (problèmes) → 10 (parfait)

→ Score 0–39 = 🔴 Critique | 40–69 = 🟡 À surveiller | 70–100 = 🟢 Sain
───────────────────────────────────
**Les 12 signaux d'alerte à vérifier chaque semaine**

**🔴 Signaux critiques (action < 24h)**
• Zéro connexion depuis > 14 jours
• Sponsor principal qui quitte l'entreprise
• Escalade support non résolue > 5 jours
• Demande d'annulation ou de pause
• Mention négative publique (G2, LinkedIn)

**🟡 Signaux d'alerte (action < 72h)**
• Baisse d'usage > 40% vs mois précédent
• NPS < 6 ou CSAT < 3/5
• QBR annulé 2 fois sans reprogrammation
• Nouveau décisionnaire sans votre introduction
• Tickets support en hausse de 50%

**🟢 Signaux de surveillance (revue hebdomadaire)**
• Adoption d'une nouvelle fonctionnalité clé nulle
• Pas de réponse email depuis > 7 jours
• Silence sur les propositions d'expansion
───────────────────────────────────
**Script : appel compte à risque**
"Bonjour [Prénom], je vous appelle car j'ai remarqué [signal spécifique et factuel — ex: 'votre équipe n'a pas utilisé la plateforme depuis 12 jours']. Mon rôle est de m'assurer que vous obtenez la valeur attendue. Est-ce que vous pouvez m'aider à comprendre ce qui a changé de votre côté ?"

→ Écouter 80% du temps
→ Ne jamais défendre le produit avant d'avoir compris le problème
→ Reformuler : "Si je comprends bien, le vrai problème c'est..."
→ Proposer : "Est-ce qu'on peut co-construire un plan d'action ensemble ?"
───────────────────────────────────
**📝 Exercice**
Créez votre health score ce soir :
1. Listez vos 5 plus gros comptes
2. Notez-les sur 4 critères (usage/engagement/résultats/paiement)
3. Identifiez le compte avec le score le plus bas
4. Planifiez un appel avec ce client cette semaine`
    }, {
      title: "📈 Module 4 — Expansion & Upsell CS-Led",
      content: `**Expansion ≠ vendre — c'est délivrer plus de valeur**
L'expansion CS-led n'est pas une technique commerciale. C'est la conséquence naturelle d'un client qui voit de la valeur et veut aller plus loin. Votre rôle : identifier le bon moment et faciliter la conversation.
───────────────────────────────────
**Upsell vs Cross-sell vs Expansion**
• **Upsell** = plan supérieur (Starter → Growth → Elite)
• **Cross-sell** = nouveau module ou produit complémentaire
• **Expansion** = nouveaux utilisateurs ou nouveaux pays

→ Le meilleur moment : quand le client atteint une limite de valeur (quota d'users, de projets, de données)
───────────────────────────────────
**Les 5 signaux d'expansion à surveiller**
→ Le client a recruté dans l'équipe qui utilise votre produit
→ Il a atteint son quota d'utilisateurs ou de projets
→ Il vous demande une fonctionnalité disponible dans le plan supérieur
→ Son NPS est ≥ 9 (promoteur actif)
→ Il vous a mis en relation avec un autre département
───────────────────────────────────
**Timing optimal : la règle des 30-60-90**
• **J30** après kickoff : trop tôt (client en adoption)
• **J60** si adoption > 80% : parfait pour proposer des add-ons
• **J90 (QBR)** : moment idéal pour l'upsell de plan
• **J-60 avant renouvellement** : fenêtre stratégique
───────────────────────────────────
**Script complet : conversation expansion (10 min)**
**Étape 1 — Ancrer la valeur (3 min)**
"Avant de parler de la suite, je voulais revenir sur ce qu'on a accompli ensemble. Vous m'aviez dit que l'objectif était [objectif J0]. Aujourd'hui vous êtes à [résultat chiffré]. C'est [X]% au-dessus de la cible."

**Étape 2 — Identifier le prochain niveau (4 min)**
"J'ai noté que [signal d'expansion observé]. Est-ce que ça fait partie de vos priorités pour le prochain trimestre ?"
→ Laisser le client confirmer le besoin lui-même

**Étape 3 — Proposer naturellement (3 min)**
"Ce que vous décrivez, c'est exactement ce que [plan supérieur / add-on] permet de faire. On a des clients similaires à [secteur] qui ont résolu ça de cette façon. Vous voulez qu'on en parle ?"
→ Ne jamais forcer — si non, noter pour J+30
───────────────────────────────────
**📝 Exercice : audit d'expansion**
Ouvrez votre portefeuille et identifiez :
1. Les 3 comptes avec NPS ≥ 9 — candidats referral
2. Les 3 comptes avec adoption > 80% — candidats upsell
3. Les 3 comptes qui ont recruté récemment — candidats expansion users
→ Planifiez une conversation avec chacun cette semaine.`
    }, {
      title: "🎯 Module 5 — QBR & Preuves de Valeur",
      content: `**Le QBR n'est pas une réunion de compte rendu**
Un QBR mal conduit = 45 minutes de slides que personne ne regarde. Un QBR bien conduit = une conversation stratégique qui renforce la relation, justifie le renouvellement et ouvre l'expansion.
───────────────────────────────────
**Structure QBR en 45 minutes (timing précis)**

**0–5 min : Ouverture et contexte**
"L'objectif de ce QBR est de mesurer ensemble la valeur créée ce trimestre et de définir nos priorités pour Q[N+1]. J'ai préparé 3 métriques clés que j'aimerais revoir avec vous."

**5–15 min : Preuves de valeur (ce que vous avez livré)**
→ Rappel des 3 objectifs définis au dernier QBR
→ Résultats chiffrés vs objectifs (avec visuels simples)
→ 1 cas concret de valeur délivrée (ROI client)
→ Ne défendez pas — présentez des faits

**15–25 min : Situation actuelle (ce que le client vit)**
"Avant de parler de la suite, j'aimerais comprendre où vous en êtes. Quels sont vos 2-3 défis prioritaires pour le prochain trimestre ?"
→ Écouter et prendre des notes visibles (montre que vous écoutez)
→ Connecter leurs défis à vos capacités

**25–35 min : Plan Q[N+1] (ce qu'on fait ensemble)**
→ 3 objectifs pour le prochain trimestre (co-construits)
→ Actions de votre côté + actions de leur côté
→ Métriques de suivi et date du prochain QBR

**35–45 min : Questions ouvertes et signature**
"Est-ce qu'il y a des sujets stratégiques dont vous aimeriez qu'on parle ? Comment pouvons-nous encore mieux vous accompagner ?"
───────────────────────────────────
**Calculer et présenter le ROI client**
→ Formule simple : ROI = (Bénéfices quantifiés / Coût annuel) × 100

Exemple :
• Coût Scalyo : 3 600€/an
• Temps CSM économisé : 3h/semaine × 50€/h × 48 semaines = 7 200€
• Churn évité (1 compte à 500€/mois sauvé) = 6 000€
• ROI = (13 200 - 3 600) / 3 600 × 100 = **267%**

→ Présentez toujours en "pour chaque euro investi, vous en récupérez X"
───────────────────────────────────
**Gérer un QBR défensif (client hostile)**
Si le client arrive en mode critique : ne vous défendez pas.
"Je vous entends. Ce n'est pas acceptable de votre côté, et je comprends votre frustration. Donnez-moi 5 minutes pour qu'on comprenne ensemble ce qui s'est passé, et qu'on décide d'un plan d'action."
→ Transformer la tension en co-résolution
───────────────────────────────────
**📝 Exercice**
Préparez votre prochain QBR en 3 lignes :
1. Quelle est la preuve de valeur n°1 que je vais présenter ?
2. Quel est le défi client que je dois creuser ?
3. Quelle opportunité d'expansion vais-je introduire naturellement ?`
    }, {
      title: "👥 Module 6 — Management d'Équipe CS",
      content: `**Structurer une équipe CS qui performe**
Une équipe CS performante n'est pas une équipe qui travaille plus — c'est une équipe qui travaille sur les bons comptes, avec les bons processus, et qui a les bons indicateurs pour prendre des décisions autonomes.
───────────────────────────────────
**Ratios CSM/comptes par segment**
• **Enterprise** (ARR > 100K€) → 1 CSM pour 5–10 comptes
• **Mid-Market** (ARR 20–100K€) → 1 CSM pour 20–40 comptes
• **SMB** (ARR < 20K€) → 1 CSM pour 80–150 comptes (tech-touch)

→ Si vos ratios dépassent ces chiffres : vos CSMs sont en surcharge et le churn va grimper.
───────────────────────────────────
**OKRs pour équipe CS (exemple Q2)**

**Objective : Renforcer la rétention du portefeuille Mid-Market**
• KR1 : NRR ≥ 105% sur le segment Mid-Market
• KR2 : Réduire les comptes critiques de 12 à 5 d'ici fin Q2
• KR3 : 100% des comptes Mid-Market ont eu un QBR ce trimestre

**Objective : Développer l'expansion CS-led**
• KR1 : 20% du portefeuille converti en plan supérieur
• KR2 : 10 comptes référents identifiés et activés
• KR3 : NPS moyen portefeuille ≥ +40
───────────────────────────────────
**Capacity planning : comment savoir si votre équipe est en surcharge**
Formule : Charge CSM = (Nb comptes × Temps moyen par compte/mois) / Temps disponible

Exemple :
• CSM : 60 comptes × 2h/mois = 120h de CS actif
• Temps disponible : 160h/mois - 30h admin - 20h meetings = 110h
→ **110h disponibles pour 120h de travail = surcharge de 9%**
→ Seuil d'alerte : > 15% de surcharge = dégradation qualité

───────────────────────────────────
**Gérer un CSM en difficulté**
Les 3 signaux : health scores en baisse sur son portefeuille / plaintes clients répétées / isolement en réunion

**Framework d'accompagnement (4 semaines)**
S1 : Conversation individuelle — comprendre sans juger
S2 : Co-coaching sur 2 comptes prioritaires
S3 : Revue hebdomadaire avec plan d'action écrit
S4 : Évaluation honnête et décision
→ Un CSM sauvé vaut mieux qu'un recrutement raté.
───────────────────────────────────
**Créer une culture CS orientée rétention**
→ Célébrez les churns évités (pas seulement les new logos)
→ Partagez les bons scripts en réunion d'équipe
→ Faites des post-mortems de churn sans blâmer
→ Donnez à chaque CSM accès à ses métriques en temps réel
→ Rituel : 1 "victoire client" partagée par semaine en équipe

**📝 Exercice final**
Répondez à ces 3 questions :
1. Quel est votre ratio CSM/comptes actuel ? Est-il dans les normes ?
2. Quel CSM dans votre équipe a besoin d'un plan d'accompagnement ce trimestre ?
3. Quelle victoire client allez-vous célébrer lors de votre prochain one-on-one ?`
    }],
    tip: "Formation 100% actionnable. Estimez 3-4h par module. Chaque module inclut scripts, exercices et frameworks prêts à l'emploi. Certificat de complétion disponible à l'issue des 6 modules."
  },
  [T("resEmailSeq",lang)]: {
    sections: [{
      title: "⚙️ Séquence 1 — Onboarding automatisé (J1→J30)",
      content: `Déclencheur : nouvelle inscription\n• J1 : Email de bienvenue + accès ressources\n• J3 : \"Avez-vous fait votre première action ?\"\n• J7 : Quick win partagé + invitation à un webinaire\n• J14 : Check-in santé + ressource avancée\n• J30 : Bilan + invitation QBR 90J`
    }, {
      title: "🔴 Séquence 2 — Réactivation compte inactif",
      content: `Déclencheur : 0 connexion depuis 14 jours\n• J1 : \"On vous a manqué\" — rapport d'activité personnalisé\n• J3 : Témoignage client similaire + quick win\n• J7 : Offre d'appel découverte avec CSM\n• J14 : Dernière tentative + survey raison d'absence`
    }, {
      title: "💰 Séquence 3 — Renouvellement (J-90→J-0)",
      content: `Déclencheur : 90 jours avant expiration\n• J-90 : Bilan ROI annuel personnalisé\n• J-60 : Proposition de renouvellement + options upgrade\n• J-30 : Appel téléphonique CSM + avantage fidélité\n• J-7 : Urgence douce + conditions spéciales`
    }, {
      title: "⭐ Séquence 4 — Promoteurs & Referral",
      content: `Déclencheur : NPS ≥ 9\n• J1 : Remerciement personnalisé + demande témoignage\n• J7 : Invitation programme ambassadeurs\n• J14 : Proposition co-marketing (cas client, webinaire)\n• J30 : Offre referral avec récompense mutuelle`
    }],
    tip: "Configurez ces séquences une seule fois dans votre outil emailing. Elles tournent ensuite en autonome 24h/24."
  },
  "Session Coaching Mensuelle 1h": {
    sections: [{
      title: T("wbFormat",lang),
      content: `• 15 min : revue de vos KPIs du mois\n• 20 min : analyse d'un compte prioritaire\n• 15 min : travail sur un défi spécifique (pitch, escalade, expansion)\n• 10 min : plan d'actions pour le mois suivant`
    }, {
      title: "🎯 Cas d'usage les plus fréquents",
      content: `• Préparer un QBR stratégique pour un grand compte\n• Gérer une situation de churn avancé\n• Structurer votre proposition d'upsell\n• Négocier un renouvellement difficile\n• Construire votre health score sur mesure`
    }, {
      title: T("wbBookHow",lang),
      content: `Réservez directement votre créneau en ligne :\n→ calendly.com/stratimaagency/session-coaching-mensuelle\n\nPréparez 1-2 cas concrets à travailler. La session est confidentielle.`
    }],
    cta: { label: T("wbBookSession",lang), url: "https://calendly.com/stratimaagency/session-coaching-mensuelle" },
    tip: "La session est confidentielle. Préparez vos données réelles — plus vous êtes concret, plus la session sera actionnable."
  },
  "SOPs & Playbooks Sur-mesure": {
    sections: [{
      title: T("wbGetTitle",lang),
      content: `• Audit de vos processus CS actuels (2h de travail collaboratif)\n• Identification des 3 gaps prioritaires\n• Rédaction de 2-3 SOPs personnalisées à votre contexte\n• Un playbook adapté à votre secteur et votre taille d'équipe`
    }, {
      title: "📝 Exemples de SOPs livrées",
      content: `• SOP Escalade client : qui fait quoi, dans quel délai\n• SOP Handoff Sales → CS : informations minimales requises\n• SOP QBR : préparation, animation, suivi\n• SOP Churn : détection, intervention, documentation\n• SOP Expansion : signaux, timing, script, validation`
    }, {
      title: "🚀 Process de livraison",
      content: `1. Atelier de découverte 2h (visio)\n2. Livraison d'un premier draft sous 5 jours\n3. 1 cycle de révisions inclus\n4. Format : Notion, Google Docs ou PDF selon votre préférence\n5. Session de présentation à votre équipe incluse (30 min)`
    }],
    tip: "Pour démarrer, envoyez un email à info@scalyo.app avec l'objet \"Playbooks Sur-mesure\". Délai de livraison : 10 jours ouvrés."
  }
,
  "Process CSM — Gestion Clients": {
    sections: [{
      title: "1. Onboarding Client (J0 → J30)",
      content: `• Kick-off meeting : présentation équipe, objectifs, planning
• Configuration plateforme et accès utilisateurs
• Formation initiale : 2 sessions de 1h
• Définition des KPIs de succès avec le client
• Premier QBR planifié à J+30
• Documentation : compte-rendu + plan de succès partagé`
    }, {
      title: "2. Suivi Récurrent (Mensuel)",
      content: `• Check-in mensuel : 30min, revue des KPIs
• Health score update : usage, satisfaction, engagement
• Identification des risques et plan d'action
• Partage de best practices et nouveautés produit
• Mise à jour du plan de succès`
    }, {
      title: "3. Renouvellement (J-90 → J0)",
      content: `• J-90 : Analyse ROI et préparation du business case
• J-60 : Présentation QBR avec bilan annuel
• J-45 : Proposition commerciale (renouvellement / upsell)
• J-30 : Négociation et validation
• J0 : Kick-off nouveau cycle`
    }, {
      title: "4. Upsell / Cross-sell",
      content: `• Identifier les signaux d'expansion (usage élevé, demandes features)
• Qualifier l'opportunité avec le commercial
• Préparer la démo / POC de la fonctionnalité
• Coordonner avec le PM pour le delivery
• Suivi post-activation : adoption et satisfaction`
    }]
  },
  "Process CSM — Collaboration Équipes Dev": {
    sections: [{
      title: "1. Remontée de Bugs",
      content: `• Template : [Client] Titre — Sévérité — Étapes de reproduction
• P0 (bloquant) < 2h · P1 (critique) < 4h · P2 < 24h · P3 < 72h
• Communication client : accusé de réception sous 1h
• Suivi statut toutes les 4h pour P0/P1`
    }, {
      title: "2. Priorisation Features",
      content: `• Formulaire standardisé (client, besoin, impact business)
• Scoring : Impact × Fréquence × ARR client
• Revue mensuelle : CSM + PM + Tech Lead
• Feedback loop : informer le client quand sa feature est livrée`
    }, {
      title: "3. Suivi des Releases",
      content: `• Participation au sprint review (bi-hebdomadaire)
• Rédaction des release notes orientées client
• Communication proactive aux clients impactés
• Collecte de feedback post-release (J+7)`
    }, {
      title: "4. Escalade Technique",
      content: `• N1 : CSM tente la résolution (FAQ, documentation)
• N2 : Ticket support technique avec contexte complet
• N3 : Escalade management si SLA dépassé
• Post-mortem : analyse root cause et action préventive`
    }]
  },
  "Process CSM / Chef de Projet": {
    sections: [{
      title: "1. Coordination Projet",
      content: `• RACI : définir les rôles CSM vs PM vs Client
• Planning partagé : jalons, livrables, dépendances
• Comité de pilotage hebdomadaire (30min)
• Gestion des risques : revue bi-mensuelle`
    }, {
      title: "2. Gestion des Livrables",
      content: `• Checklist de recette : critères d'acceptation définis à l'avance
• Process de validation : client → CSM → PM → Dev → Client
• Gestion des changements : formulaire de change request
• Archivage : dossier projet structuré et accessible`
    }, {
      title: "3. Communication Client",
      content: `• Point hebdomadaire : avancement, blocages, prochaines étapes
• Compte-rendu systématique sous 24h
• Gestion des attentes : sous-promettre, sur-délivrer
• Célébration des milestones (go-live, adoption target atteint)`
    }, {
      title: "4. Clôture de Projet",
      content: `• Bilan projet : objectifs vs résultats
• REX avec toutes les parties
• Transition vers le mode run (CSM suivi récurrent)
• Capitalisation : mise à jour des templates et process`
    }]
  },
  "Process Qualité": {
    sections: [{
      title: "1. Audit Qualité Interne (Trimestriel)",
      content: `• Revue des process CSM : respect des SLA et procédures
• Analyse des CSAT/NPS par CSM et par segment
• Écoute d'appels : 2 appels par CSM revus en peer-review
• Plan d'amélioration : 3 actions prioritaires par trimestre`
    }, {
      title: "2. Métriques Qualité",
      content: `• CSAT post-interaction : objectif > 4.5/5
• First Response Time : objectif < 2h (heures ouvrées)
• Time to Resolution : P0 < 4h, P1 < 24h, P2 < 72h
• NPS relationnel : objectif > 50
• Taux de churn : objectif < 5% annuel`
    }, {
      title: "3. Amélioration Continue",
      content: `• Rétrospective mensuelle : What went well / What to improve
• Base de connaissances : mise à jour hebdomadaire
• Partage de best practices : session bi-mensuelle (30min)
• Formation continue : 2h/mois par CSM`
    }, {
      title: "4. Conformité SLA",
      content: `• Monitoring automatique des SLA par client et par plan
• Alertes proactives si SLA à risque (80% du délai)
• Rapport mensuel SLA : taux de conformité par catégorie
• Revue contractuelle : alignement SLA vs capacité réelle`
    }]
  }
}

const RESOURCE_CONTENT_EN = {
  "Onboarding B2B J0→J30": {
    sections: [{
      title: "📅 Day 0 — Signature day",
      content: `• Send personalized welcome email (< 2h after signing)\n• Schedule kickoff call within 48h\n• Create client folder in your CRM\n• Assign a dedicated CSM and introduce them by email`
    }, {
      title: "🚀 Days 1–7 — Activation",
      content: `• Kickoff call: uncover the client's business goals\n• Identify 3 success KPIs with the client\n• Set up the basic environment (technical onboarding)\n• Share a personalized 30-day onboarding plan\n• Target KPI: 80% of key users logged in by Day 7`
    }, {
      title: "⚡ Days 8–21 — Adoption",
      content: `• Weekly check-in (20 min) for the first 3 weeks\n• Share 1 demonstrable quick win every week\n• Identify blockers and resolve them within 24h\n• Train power users on advanced features\n• Target KPI: 1 key use case operational by Day 21`
    }, {
      title: "🏆 Days 22–30 — Anchoring",
      content: `• 30-day review: compare goals vs. actuals\n• Identify expansion opportunities (new users, modules)\n• Schedule first QBR at Day 90\n• Request testimonial or NPS if score ≥ 8\n• Target KPI: adoption rate > 70%, NPS ≥ +20`
    }],
    tip: "A successful 30-day onboarding reduces churn by 67% at Day 90. Treat it like a project, not a formality."
  },
  [T("resChurn",lang)]: {
    sections: [{
      title: "🔴 Critical signals (action < 24h)",
      content: `• Zero logins for > 14 days\n• Unresolved support escalation for > 5 days\n• Primary sponsor has left the company\n• Request to cancel or pause subscription\n• Negative mention on LinkedIn or G2`
    }, {
      title: "🟡 Warning signals (action < 72h)",
      content: `• Usage drop > 40% vs. previous month\n• NPS < 6 or CSAT < 3/5 at last survey\n• QBR meeting cancelled twice without rescheduling\n• New budget decision-maker without your introduction\n• Support tickets up 50%`
    }, {
      title: "🟢 Intervention protocol (5 steps)",
      content: `1. Qualify: confirm the signal with CRM data\n2. Analyze: identify root cause (adoption, perceived ROI, relationship, competitor)\n3. Escalate: notify your manager if account > €5K ARR\n4. Contact: phone call — never email alone for churn\n5. Propose: co-built action plan with the client, dated and confirmed`
    }, {
      title: "📝 At-risk account call script",
      content: `"Hi [Name], I'm calling because I noticed [specific signal]. My role is to make sure you're getting the expected value. Can you help me understand what has changed?"\n\n→ Listen 80% of the time\n→ Never defend the product before understanding the problem\n→ Reframe: "If I understand correctly, the real issue is..."`
    }],
    tip: "Churn is won or lost in the first 60 days. But it's detected in weak signals — your job is to read them."
  },
  "Matrice Priorisation CSM": {
    sections: [{
      title: "🎯 Matrix principle",
      content: `Classify your accounts along 2 axes:\n• X-axis: ARR value (low → high)\n• Y-axis: Churn risk (low → high)\n\nThis gives 4 quadrants with clear actions.`
    }, {
      title: "🔴 Q1 — Critical accounts (High ARR × High Risk)",
      content: `→ Immediate action, absolute priority\n→ Weekly call minimum\n→ Involve your manager if ARR > €10K\n→ Create a dated rescue plan\nGoal: reduce risk to "moderate" within 30 days`
    }, {
      title: "🟡 Q2 — Strategic accounts (High ARR × Low Risk)",
      content: `→ Maintain relationship proactively\n→ Look for expansion opportunities\n→ 1 QBR per quarter minimum\n→ Turn into advocates (testimonials, referrals)\nGoal: grow ARR by 20–30% through expansion`
    }, {
      title: "🟠 Q3 — Accounts to watch (Low ARR × High Risk)",
      content: `→ Identify the risk cause quickly\n→ Decide: invest to save or let go gracefully\n→ If ARR < €2K and high risk: automated email sequence\nGoal: spend no more than 15% of your time here`
    }, {
      title: "🟢 Q4 — Healthy accounts (Low ARR × Low Risk)",
      content: `→ Automated communication (newsletters, email check-ins)\n→ Monitor growth signals for expansion\n→ Reserve your time for Q1 and Q2\nGoal: maintain health score with minimal effort`
    }],
    tip: "Spend 60% of your time on Q1 and Q2. Automate Q3 and Q4. That's the golden rule."
  },
  "15 Emails — Cycle de Vie": {
    sections: [{
      title: "📨 Onboarding (D1, D3, D7, D14, D30)",
      content: `D1: Welcome email + getting started guide\nD3: "First impressions" check-in + resources\nD7: "Have you hit your first goal?" + quick win\nD14: Share a similar client success story\nD30: 30-day wrap-up + invitation to 90-day QBR`
    }, {
      title: "🔄 Regular follow-up (monthly, quarterly)",
      content: `Monthly: KPI recap + personalized recommendation\nQuarterly: QBR invitation + value report\nSubscription anniversary: celebration + annual review\nProduct update: announcement with client use case`
    }, {
      title: "⚠️ Re-engagement (D-14, D-7, D-3 before churn)",
      content: `D-14: "Checking in" (human, not automated)\nD-7: Value proposition + concrete action plan\nD-3: Phone call if no email response\nGolden rule: never more than 3 unanswered emails without a call`
    }, {
      title: "💰 Expansion & Renewal",
      content: `3 months before renewal: annual ROI review\n1 month before: renewal proposal + upgrade if relevant\nPost-expansion: confirmation email + new roadmap\nReferral: ask for introduction after NPS ≥ 8`
    }],
    tip: "Personalize at minimum: first name, company name, and one real KPI. A personalized email generates 6x more opens."
  },
  [T("resNPS",lang)]: {
    sections: [{
      title: "📊 Understand your current NPS",
      content: `• Calculate NPS: (% Promoters) - (% Detractors)\n• Categories: 0–6 = Detractors | 7–8 = Passives | 9–10 = Promoters\n• Segment by cohort: client size, tenure, assigned CSM\n• Identify patterns: which accounts are consistently detractors?`
    }, {
      title: "🔴 D1–D20: Address Detractors (0–6)",
      content: `• Human call within 48h of the survey\n• Don't defend the product: listen and understand\n• Create a specific action plan with a written commitment\n• Follow up at D+14 to measure improvement\n• Goal: convert 30% of detractors into passives`
    }, {
      title: "🟡 D21–D40: Activate Passives (7–8)",
      content: `• Identify what's missing for them to reach a 9\n• Share quick wins and success stories from similar clients\n• Offer advanced training on underused features\n• Assign a buddy (promoter client) if possible\n• Goal: convert 40% of passives into promoters`
    }, {
      title: "🟢 D41–D60: Leverage Promoters (9–10)",
      content: `• Request a testimonial (written or video)\n• Invite to a client case study / webinar\n• Referral program: reward introductions\n• Co-create a success story for your marketing materials\n• Goal: activate 50% of promoters as active advocates`
    }],
    tip: "NPS is not an end in itself — it's a conversation starter. Use it to open dialogues, not check boxes."
  },
  "Dashboard KPIs CS": {
    sections: [{
      title: "📊 Weekly KPIs (team)",
      content: `• Average portfolio health score (target > 70/100)\n• Number of critical accounts (target: declining)\n• Contacts made this week / weekly target\n• Open / resolved tickets\n• Check-in response rate`
    }, {
      title: "📈 Monthly KPIs (business)",
      content: `• Churn Rate (target < 5% monthly / < 15% annual)\n• NRR — Net Revenue Retention (target > 100%)\n• NPS Score (target > +30)\n• Adoption rate by key feature\n• Time to Value (time between signing and first success)`
    }, {
      title: "🏆 Quarterly KPIs (exec review)",
      content: `• ARR retained vs. ARR lost\n• Expansion revenue (upsells + cross-sells)\n• Customer Lifetime Value (CLV) by segment\n• Cost to Serve (CS cost per client)\n• Renewal rate (target > 90%)`
    }, {
      title: "⚙️ How to use it in meetings",
      content: `1. Prepare a summary page with 3 key metrics + trends\n2. Always compare vs. previous period + target\n3. Identify 1 alert and 1 win to present\n4. Propose 1 corrective action if target missed\n5. Document decisions made for the next exec review`
    }],
    tip: "A good dashboard doesn't drown you in numbers — it tells a story. Choose 5 metrics max for your meetings."
  },
  "CS Masterclass — 6 Modules": {
    sections: [{
      title: "📚 Module 1 — Customer Success Foundations",
      content: `**What is Customer Success?**
CS is not reactive support. It is a proactive function whose role is to ensure the customer achieves their business objectives through your product — and keeps paying (and paying more) for it.
───────────────────────────────────
**CS vs Support vs Account Management**
• **Support** → reacts to technical problems. Measures: resolution time, CSAT
• **Account Management** → manages the commercial relationship, renewal, upsell
• **Customer Success** → ensures adoption and value delivery. Measures: NRR, churn, health score
→ Great CS makes Support less needed and AM more effective.
───────────────────────────────────
**The 3 fundamental metrics every CSM must master**
**NRR (Net Revenue Retention)** = (Beginning ARR - churn - downgrade + expansion) / Beginning ARR × 100
→ Healthy B2B SaaS benchmark: NRR > 100% (you earn more from existing customers than you lose)
→ NRR > 120% = growth without acquisition

**GRR (Gross Revenue Retention)** = (Beginning ARR - churn - downgrade) / Beginning ARR × 100
→ Measures pure retention, without expansion. Healthy floor: GRR > 85%

**LTV/CAC** = Customer Lifetime Value / Acquisition Cost
→ Target ratio: LTV/CAC > 3. Below that: your model doesn't scale.
───────────────────────────────────
**The 3 CS models by account size**
• **High-touch** (ARR > €50K) → Dedicated CSM, quarterly QBR, weekly check-ins
• **Mid-touch** (ARR €5K–€50K) → Pool of CSMs, semi-annual QBR, monthly check-ins
• **Low-touch / Tech-touch** (ARR < €5K) → Automation, in-app, email sequences
───────────────────────────────────
**📝 Practical exercise**
Calculate your NRR for last quarter:
1. Take ARR on January 1st
2. Subtract churns + downgrades for the quarter
3. Add expansions (upsells, add-ons)
4. Divide by initial ARR × 100
→ If < 100%: your priority is retention. If > 110%: invest in expansion.`
    }, {
      title: "🚀 Module 2 — Onboarding & Time to Value",
      content: `**Why onboarding is your moment of truth**
67% of churn at 6 months is decided in the first 30 days. Onboarding isn't a formality — it's the moment your customer decides (often unconsciously) whether your product is worth its price.
───────────────────────────────────
**The D0→D90 framework in 4 phases**

**Phase D0 — Signature day**
• Personalized welcome email within 2 hours (not automated — signed by the CSM)
• Schedule kickoff within 48 hours
• Create client folder in CRM with the client's 3 business objectives

**Phase D1–D7 — Activation**
• Kickoff call: identify 3 success KPIs with the client
• Deliver a written, dated onboarding plan
• Goal: 80% of key users logged in before D7

**Phase D8–D30 — Adoption**
• Weekly 20-min check-in (first 4 weeks)
• Identify and resolve every blocker within 24h
• Goal: 1 use case operational before D21

**Phase D31–D90 — Anchoring**
• 30-day review: goals vs. results
• Identify expansion opportunities (new users, modules)
• Schedule first QBR at D90
───────────────────────────────────
**Full script: kickoff call (45 min)**
**Opening (5 min)**
"Thank you for being here [Name]. My role is simple: to make sure that in 90 days, you can measure a concrete impact of [product] on your business. To do that, I need to understand your reality."

**Discovery questions (15 min)**
• "What is the #1 problem you were trying to solve by buying [product]?"
• "How do you currently measure that this problem is solved?"
• "Who on your team will be the primary user? Who is the decision-maker?"
• "What would make you say in 6 months that this was the right investment?"

**Formalization (15 min)**
→ Reformulate the client's 3 business objectives
→ Propose 3 measurable KPIs with specific targets
→ Get these KPIs validated in writing (recap email)

**Action plan (10 min)**
→ Present the 30-60-90 day plan
→ Define next steps and responsibilities
→ Confirm the next check-in date
───────────────────────────────────
**The 3 onboarding mistakes that kill retention**
❌ Sending a generic automated welcome email
❌ Failing to identify success KPIs at D0
❌ Letting D14 pass without a human check-in
───────────────────────────────────
**📝 Exercise**
Create your kickoff recap template in 5 lines:
Goal 1: [business goal + KPI + target]
Goal 2: [business goal + KPI + target]
Goal 3: [business goal + KPI + target]
Next check-in: [date]
D30 success indicator: [1 specific measure]`
    }, {
      title: "💡 Module 3 — Health Score & Churn Detection",
      content: `**Understanding the health score**
The health score is a rating (0-100) that aggregates multiple signals to predict the likelihood a customer will churn or renew. It replaces your intuition with actionable data.
───────────────────────────────────
**Building your custom health score**
Start simple — 4 criteria are enough:

**1. Product usage** (40% of score)
• Weekly logins / active vs. total users
• Key features used vs. available
• Score: 0 (< 20% adoption) → 40 (> 80% adoption)

**2. Relationship engagement** (25% of score)
• CSM email response within 48h?
• Attendance at scheduled calls?
• Score: 0 (ghost) → 25 (always present)

**3. Business results** (25% of score)
• Is the client hitting KPIs defined at kickoff?
• NPS or CSAT at last measurement
• Score: 0 (far from goals) → 25 (goals exceeded)

**4. Financial signals** (10% of score)
• Payments up to date?
• Downgrade attempt?
• Score: 0 (issues) → 10 (perfect)

→ Score 0–39 = 🔴 Critical | 40–69 = 🟡 Monitor | 70–100 = 🟢 Healthy
───────────────────────────────────
**12 warning signals to check every week**

**🔴 Critical signals (action < 24h)**
• Zero logins for > 14 days
• Primary sponsor leaves the company
• Unresolved support escalation > 5 days
• Request to cancel or pause subscription
• Negative public mention (G2, LinkedIn)

**🟡 Warning signals (action < 72h)**
• Usage drop > 40% vs. previous month
• NPS < 6 or CSAT < 3/5
• QBR cancelled twice without rescheduling
• New decision-maker without your introduction
• Support tickets up 50%

**🟢 Monitoring signals (weekly review)**
• Zero adoption of a key new feature
• No email response for > 7 days
• Silence on expansion proposals
───────────────────────────────────
**Script: at-risk account call**
"Hi [Name], I'm calling because I noticed [specific factual signal — e.g. 'your team hasn't used the platform in 12 days']. My role is to make sure you're getting the expected value. Can you help me understand what has changed on your end?"

→ Listen 80% of the time
→ Never defend the product before understanding the problem
→ Reframe: "If I understand correctly, the real issue is..."
→ Propose: "Can we co-build an action plan together?"
───────────────────────────────────
**📝 Exercise**
Build your health score tonight:
1. List your 5 largest accounts
2. Score them on 4 criteria (usage/engagement/results/payments)
3. Identify the account with the lowest score
4. Schedule a call with that client this week`
    }, {
      title: "📈 Module 4 — CS-Led Expansion & Upsell",
      content: `**Expansion ≠ selling — it's delivering more value**
CS-led expansion is not a sales technique. It's the natural consequence of a customer who sees value and wants to go further. Your role: identify the right moment and facilitate the conversation.
───────────────────────────────────
**Upsell vs Cross-sell vs Expansion**
• **Upsell** = higher plan (Starter → Growth → Elite)
• **Cross-sell** = new complementary module or product
• **Expansion** = new users or new markets

→ Best timing: when the customer hits a value limit (user quota, projects, data)
───────────────────────────────────
**The 5 expansion signals to watch**
→ The client has hired in the team using your product
→ They've hit their user or project quota
→ They're asking for a feature available in a higher plan
→ Their NPS is ≥ 9 (active promoter)
→ They've introduced you to another department
───────────────────────────────────
**Optimal timing: the 30-60-90 rule**
• **D30** after kickoff: too early (client still adopting)
• **D60** if adoption > 80%: perfect for add-ons
• **D90 (QBR)**: ideal moment for plan upsell
• **D-60 before renewal**: strategic expansion window
───────────────────────────────────
**Full script: expansion conversation (10 min)**
**Step 1 — Anchor the value (3 min)**
"Before we talk about next steps, I wanted to revisit what we've accomplished together. You told me your goal was [D0 objective]. Today you're at [measured result]. That's [X]% above target."

**Step 2 — Identify the next level (4 min)**
"I noticed [observed expansion signal]. Is that a priority for you next quarter?"
→ Let the client confirm the need themselves

**Step 3 — Propose naturally (3 min)**
"What you're describing is exactly what [higher plan / add-on] enables. We have similar clients in [sector] who solved this that way. Want to explore it together?"
→ Never force — if no, note for D+30
───────────────────────────────────
**📝 Exercise: expansion audit**
Open your portfolio and identify:
1. 3 accounts with NPS ≥ 9 — referral candidates
2. 3 accounts with adoption > 80% — upsell candidates
3. 3 accounts that recently hired — user expansion candidates
→ Schedule a conversation with each one this week.`
    }, {
      title: "🎯 Module 5 — QBR & Proof of Value",
      content: `**A QBR is not a report meeting**
A poorly run QBR = 45 minutes of slides nobody looks at. A well-run QBR = a strategic conversation that strengthens the relationship, justifies renewal, and opens expansion.
───────────────────────────────────
**QBR structure in 45 minutes (precise timing)**

**0–5 min: Opening and context**
"The goal of this QBR is to measure together the value created this quarter and define our priorities for Q[N+1]. I've prepared 3 key metrics I'd like to review with you."

**5–15 min: Proof of value (what you delivered)**
→ Recap of 3 objectives from the last QBR
→ Measured results vs. objectives (simple visuals)
→ 1 concrete value case (client ROI)
→ Don't defend — present facts

**15–25 min: Current situation (what the client is experiencing)**
"Before talking about next steps, I'd like to understand where you are today. What are your 2-3 priority challenges for next quarter?"
→ Listen and take visible notes (shows you're paying attention)
→ Connect their challenges to your capabilities

**25–35 min: Q[N+1] plan (what we do together)**
→ 3 objectives for the next quarter (co-built)
→ Actions on your side + actions on their side
→ Tracking metrics and next QBR date

**35–45 min: Open questions and close**
"Are there any strategic topics you'd like to discuss? How can we support you even better?"
───────────────────────────────────
**Calculating and presenting client ROI**
→ Simple formula: ROI = (Quantified benefits / Annual cost) × 100

Example:
• Scalyo cost: €3,600/year
• CSM time saved: 3h/week × €50/h × 48 weeks = €7,200
• Churn avoided (1 account at €500/month saved) = €6,000
• ROI = (€13,200 - €3,600) / €3,600 × 100 = **267%**

→ Always present as "for every euro invested, you get back X"
───────────────────────────────────
**Handling a defensive QBR (hostile client)**
If the client arrives in critical mode — don't get defensive.
"I hear you. This isn't acceptable from your perspective, and I understand your frustration. Give me 5 minutes so we can understand together what happened and agree on an action plan."
→ Turn tension into co-resolution
───────────────────────────────────
**📝 Exercise**
Prepare your next QBR in 3 lines:
1. What is the #1 proof of value I will present?
2. What client challenge do I need to dig into?
3. What expansion opportunity will I introduce naturally?`
    }, {
      title: "👥 Module 6 — CS Team Management",
      content: `**Building a CS team that performs**
A high-performing CS team doesn't work more — it works on the right accounts, with the right processes, and has the right metrics to make autonomous decisions.
───────────────────────────────────
**CSM/account ratios by segment**
• **Enterprise** (ARR > €100K) → 1 CSM for 5–10 accounts
• **Mid-Market** (ARR €20–€100K) → 1 CSM for 20–40 accounts
• **SMB** (ARR < €20K) → 1 CSM for 80–150 accounts (tech-touch)

→ If your ratios exceed these numbers: your CSMs are overloaded and churn will rise.
───────────────────────────────────
**CS OKRs example (Q2)**

**Objective: Strengthen Mid-Market portfolio retention**
• KR1: NRR ≥ 105% on Mid-Market segment
• KR2: Reduce critical accounts from 12 to 5 by end of Q2
• KR3: 100% of Mid-Market accounts had a QBR this quarter

**Objective: Develop CS-led expansion**
• KR1: 20% of portfolio converted to a higher plan
• KR2: 10 reference clients identified and activated
• KR3: Average portfolio NPS ≥ +40
───────────────────────────────────
**Capacity planning: how to know if your team is overloaded**
Formula: CSM Load = (# accounts × avg time per account/month) / Available time

Example:
• CSM: 60 accounts × 2h/month = 120h of active CS
• Available time: 160h/month - 30h admin - 20h meetings = 110h
→ **110h available for 120h of work = 9% overload**
→ Alert threshold: > 15% overload = quality degradation

───────────────────────────────────
**Managing a struggling CSM**
3 signals: declining health scores on their portfolio / repeated client complaints / withdrawal in meetings

**4-week coaching framework**
W1: Individual conversation — understand without judging
W2: Co-coaching on 2 priority accounts
W3: Weekly review with written action plan
W4: Honest assessment and decision
→ A saved CSM is worth more than a failed hire.
───────────────────────────────────
**Building a retention-driven CS culture**
→ Celebrate avoided churns (not just new logos)
→ Share winning scripts in team meetings
→ Run churn post-mortems without blame
→ Give every CSM access to their metrics in real time
→ Ritual: 1 "client win" shared per week as a team

**📝 Final exercise**
Answer these 3 questions:
1. What is your current CSM/account ratio? Is it within norms?
2. Which CSM on your team needs a coaching plan this quarter?
3. What client win will you celebrate at your next 1-on-1?`
    }],
    tip: "100% actionable training. Estimate 3-4h per module. Each module includes scripts, exercises and ready-to-use frameworks. Completion certificate available after all 6 modules."
  },
  "Automated Email Sequences": {
    sections: [{
      title: "⚙️ Sequence 1 — Automated Onboarding (D1→D30)",
      content: `Trigger: new signup\n• D1: Welcome email + resource access\n• D3: \"Did you take your first action?\"\n• D7: Quick win shared + webinar invite\n• D14: Health check-in + advanced resource\n• D30: Review + QBR 90D invitation`
    }, {
      title: "🔴 Sequence 2 — Inactive Account Reactivation",
      content: `Trigger: 0 logins in 14 days\n• D1: \"We missed you\" — personalized activity report\n• D3: Similar customer testimonial + quick win\n• D7: Offer a discovery call with CSM\n• D14: Last attempt + absence reason survey`
    }, {
      title: "💰 Sequence 3 — Renewal (D-90→D-0)",
      content: `Trigger: 90 days before expiration\n• D-90: Personalized annual ROI summary\n• D-60: Renewal proposal + upgrade options\n• D-30: CSM phone call + loyalty bonus\n• D-7: Gentle urgency + special terms`
    }, {
      title: "⭐ Sequence 4 — Promoters & Referral",
      content: `Trigger: NPS ≥ 9\n• D1: Personalized thank you + testimonial request\n• D7: Ambassador program invitation\n• D14: Co-marketing proposal (case study, webinar)\n• D30: Referral offer with mutual reward`
    }],
    tip: "Set up these sequences once in your email tool. They then run autonomously 24/7."
  },
  "Monthly 1h Coaching Session": {
    sections: [{
      title: "📋 Your monthly session format",
      content: `• 15 min: review your month's KPIs\n• 20 min: analysis of a priority account\n• 15 min: work on a specific challenge (pitch, escalation, expansion)\n• 10 min: action plan for next month`
    }, {
      title: "🎯 Most common use cases",
      content: `• Prepare a strategic QBR for a key account\n• Handle an advanced churn situation\n• Structure your upsell proposal\n• Negotiate a difficult renewal\n• Build your custom health score`
    }, {
      title: "📅 How to book your session",
      content: `Book your slot directly online:\n→ calendly.com/stratimaagency/session-coaching-mensuelle\n\nPrepare 1-2 concrete cases to work on. The session is confidential.`
    }],
    cta: { label: "📅 Book my session →", url: "https://calendly.com/stratimaagency/session-coaching-mensuelle" },
    tip: "The session is confidential. Bring real data — the more concrete you are, the more actionable the session will be."
  },
  "SOPs & Custom Playbooks": {
    sections: [{
      title: "🔧 What you get",
      content: `• Audit of your current CS processes (2h collaborative work)\n• Identification of the 3 priority gaps\n• Writing of 2-3 SOPs customized to your context\n• A playbook adapted to your industry and team size`
    }, {
      title: "📝 Examples of delivered SOPs",
      content: `• Customer Escalation SOP: who does what, in what timeframe\n• Sales → CS Handoff SOP: minimum required information\n• QBR SOP: preparation, facilitation, follow-up\n• Churn SOP: detection, intervention, documentation\n• Expansion SOP: signals, timing, script, validation`
    }, {
      title: "🚀 Delivery process",
      content: `1. 2h discovery workshop (video call)\n2. First draft delivered within 5 days\n3. 1 revision cycle included\n4. Format: Notion, Google Docs or PDF per your preference\n5. Team presentation session included (30 min)`
    }],
    tip: "To get started, email info@scalyo.app with subject \"Custom Playbooks\". Delivery time: 10 business days."
  },
  "Protocole Détection Churn": {
    sections: [{
      title: "🔍 Early Warning Signals",
      content: `• Usage drop > 20% vs previous month\n• NPS < 6 at last survey\n• Repeated support tickets on the same issue\n• Silence > 3 weeks (no email, no call)\n• Key contact absent or changed`
    }, {
      title: "📊 Risk Score (0-10)",
      content: `**Calculate a score out of 10:**\n• Usage frequency (0-2) — daily=2, weekly=1, rare=0\n• QBR engagement (0-2) — active=2, passive=1, absent=0\n• MRR evolution (0-2) — growth=2, stable=1, decline=0\n• Recent feedback (0-2) — positive=2, neutral=1, negative=0\n• C-level contact (0-2) — accessible=2, low=1, none=0\n\n→ Score < 5 = High risk — activate the protocol immediately`
    }, {
      title: "🎯 5-Step Intervention",
      content: `**Step 1 — Diagnostic call (48h)**\nGoal: understand the real problem, not the symptom.\n\n**Step 2 — Usage audit**\nAnalyze the last 3 months. Identify unused features.\n\n**Step 3 — Personalized value plan**\nPropose 3 quick wins achievable in 2 weeks.\n\n**Step 4 — Executive escalation if needed**\nInvolve your manager + client C-level if score < 3.\n\n**Step 5 — Follow-up D+7, D+14, D+30**\nMeasure progress at each touchpoint.`
    }, {
      title: "📞 Opening Script",
      content: `"Hi [Name], I wanted to reach out because I noticed some changes in your usage this month. I think we can do better together."\n\n→ Listen 80% of the time, talk 20%\n→ Don't defend the product — understand first\n→ Offer a personalized demo if needed`
    }, {
      title: "✅ Recovery Indicators",
      content: `• Usage back to > 80% of baseline\n• Email response < 48h\n• QBR scheduled and held\n• NPS > 7 at next survey\n• Renewal signed or letter of intent received`
    }],
    tip: "A churned client costs 5x more to replace than to retain. Activate this protocol at the first signal, not after confirmation."
  },
  "NPS de 0 à +50 en 60 jours": {
    sections: [{
      title: "📋 Week 1-2: Baseline",
      content: `• Launch your first NPS survey (tool: Typeform, Delighted, Scalyo)\n• Segment responses: Promoters (9-10), Passives (7-8), Detractors (0-6)\n• Calculate your score: ((Promoters - Detractors) / Total) × 100\n• Baseline goal: response > 30% of active clients`
    }, {
      title: "🎯 Week 3-4: Close the loop",
      content: `**100% of detractors contacted within 48h**\n\nScript: "Thank you for your feedback. Can you tell me what didn't work? I want to understand to improve your experience."\n\n→ Create an action plan per detractor account\n→ Follow-up D+14 to measure impact\n→ Converting detractors to passives = +10 NPS points`
    }, {
      title: "🚀 Week 5-6: Amplify promoters",
      content: `• Identify your top promoters (score 9-10 + strong engagement)\n• Ask for a G2 / Capterra / LinkedIn review\n• Request a video or written testimonial\n• Invite to product betas and webinars\n• Ambassador program: early feature access + visibility`
    }, {
      title: "📊 Week 7-8: Measure and iterate",
      content: `• Relaunch NPS survey (same segment)\n• Calculate point-by-point progression\n• Identify patterns: which segments improved?\n• Adjust playbooks based on results\n• Share results in executive review with monthly evolution`
    }, {
      title: "✅ Success Indicators",
      content: `• Overall NPS > +40\n• Response rate > 30%\n• 100% detractors contacted and followed up\n• 3+ testimonials or reviews collected\n• Action plan documented per segment`
    }],
    tip: "NPS is not a vanity metric — it's a growth predictor. Every point gained = less churn and more word-of-mouth."
  },
  "SOPs & Playbooks Sur-mesure": {
    sections: [{
      title: "🔧 What you get",
      content: `• Audit of your current CS processes (2h collaborative work)\n• Identification of the 3 priority gaps\n• Writing of 2-3 SOPs customized to your context\n• A playbook adapted to your industry and team size`
    }, {
      title: "📝 Examples of delivered SOPs",
      content: `• Customer Escalation SOP: who does what, in what timeframe\n• Sales → CS Handoff SOP: minimum required information\n• QBR SOP: preparation, facilitation, follow-up\n• Churn SOP: detection, intervention, documentation\n• Expansion SOP: signals, timing, script, validation`
    }, {
      title: "🚀 Delivery process",
      content: `1. 2h discovery workshop (video call)\n2. First draft delivered within 5 days\n3. 1 revision cycle included\n4. Format: Notion, Google Docs or PDF per your preference\n5. Team presentation session included (30 min)`
    }],
    tip: "To get started, email info@scalyo.app with subject \"Custom Playbooks\". Delivery time: 10 business days."
  }
,
  "Process CSM — Gestion Clients": {
    sections: [{
      title: "1. Client Onboarding (D0 → D30)",
      content: `• Kick-off meeting: team intro, objectives, planning
• Platform configuration and user access setup
• Initial training: 2 × 1h sessions
• Define success KPIs with the client
• First QBR scheduled at D+30
• Documentation: meeting notes + shared success plan`
    }, {
      title: "2. Recurring Follow-up (Monthly)",
      content: `• Monthly check-in: 30min, KPI review
• Health score update: usage, satisfaction, engagement
• Risk identification and action plan
• Share best practices and product updates
• Update success plan`
    }, {
      title: "3. Renewal (D-90 → D0)",
      content: `• D-90: ROI analysis and business case preparation
• D-60: QBR presentation with annual review
• D-45: Commercial proposal (renewal / upsell)
• D-30: Negotiation and validation
• D0: New cycle kick-off`
    }, {
      title: "4. Upsell / Cross-sell",
      content: `• Identify expansion signals (high usage, feature requests)
• Qualify the opportunity with sales
• Prepare demo / POC of the feature
• Coordinate with PM for delivery
• Post-activation follow-up: adoption and satisfaction`
    }]
  },
  "Process CSM — Collaboration Équipes Dev": {
    sections: [{
      title: "1. Bug Escalation",
      content: `• Template: [Client] Title — Severity — Reproduction steps
• P0 (blocker) < 2h · P1 (critical) < 4h · P2 < 24h · P3 < 72h
• Client communication: acknowledgment within 1h
• Status update every 4h for P0/P1`
    }, {
      title: "2. Feature Prioritization",
      content: `• Standardized form (client, need, business impact)
• Scoring: Impact × Frequency × Client ARR
• Monthly review: CSM + PM + Tech Lead
• Feedback loop: notify client when feature is delivered`
    }, {
      title: "3. Release Tracking",
      content: `• Attend sprint reviews (bi-weekly)
• Write client-oriented release notes
• Proactive communication to impacted clients
• Post-release feedback collection (D+7)`
    }, {
      title: "4. Technical Escalation",
      content: `• L1: CSM attempts resolution (FAQ, documentation)
• L2: Technical support ticket with full context
• L3: Management escalation if SLA breached
• Post-mortem: root cause analysis and preventive action`
    }]
  },
  "Process CSM / Chef de Projet": {
    sections: [{
      title: "1. Project Coordination",
      content: `• RACI: define CSM vs PM vs Client roles
• Shared planning: milestones, deliverables, dependencies
• Weekly steering committee (30min)
• Risk management: bi-monthly review`
    }, {
      title: "2. Deliverable Management",
      content: `• Acceptance checklist: defined upfront
• Validation process: client → CSM → PM → Dev → client
• Change management: change request form
• Archiving: structured and accessible project folder`
    }, {
      title: "3. Client Communication",
      content: `• Weekly update: progress, blockers, next steps
• Meeting notes sent within 24h
• Expectation management: under-promise, over-deliver
• Milestone celebration (go-live, adoption target reached)`
    }, {
      title: "4. Project Closure",
      content: `• Project review: objectives vs results
• Retrospective with all stakeholders
• Transition to run mode (recurring CSM follow-up)
• Knowledge capture: update templates and processes`
    }]
  },
  "Process Qualité": {
    sections: [{
      title: "1. Internal Quality Audit (Quarterly)",
      content: `• CSM process review: SLA and procedure compliance
• CSAT/NPS analysis by CSM and segment
• Call listening: 2 calls per CSM reviewed in peer-review
• Improvement plan: 3 priority actions per quarter`
    }, {
      title: "2. Quality Metrics",
      content: `• Post-interaction CSAT: target > 4.5/5
• First Response Time: target < 2h (business hours)
• Time to Resolution: P0 < 4h, P1 < 24h, P2 < 72h
• Relational NPS: target > 50
• Churn rate: target < 5% annual`
    }, {
      title: "3. Continuous Improvement",
      content: `• Monthly retrospective: What went well / What to improve
• Knowledge base: weekly updates
• Best practice sharing: bi-monthly session (30min)
• Ongoing training: 2h/month per CSM`
    }, {
      title: "4. SLA Compliance",
      content: `• Automated SLA monitoring by client and plan
• Proactive alerts if SLA at risk (80% of deadline)
• Monthly SLA report: compliance rate by category
• Contract review: SLA alignment vs actual capacity`
    }]
  }
};
const RESOURCE_CONTENT_KR = {
  "Onboarding B2B J0→J30": {
    sections: [{
      title: "📅 D0 — 계약 당일",
      content: `• 계약 후 2시간 이내 개인화된 환영 이메일 발송\n• 48시간 이내 킥오프 콜 일정 확정\n• CRM에 고객 폴더 생성\n• 전담 CSM 배정 및 이메일로 소개`
    }, {
      title: "🚀 D1–D7 — 활성화",
      content: `• 킥오프 콜: 고객의 비즈니스 목표 파악\n• 고객과 함께 성공 KPI 3개 정의\n• 기본 환경 설정 (기술 온보딩)\n• 개인화된 30일 온보딩 플랜 공유\n• 목표 KPI: D7까지 주요 사용자의 80%가 로그인`
    }, {
      title: "⚡ D8–D21 — 도입",
      content: `• 첫 3주 동안 주 1회 체크인 (20분)\n• 매주 1개의 구체적인 성과 공유\n• 24시간 이내 장애물 파악 및 해결\n• 핵심 사용자 고급 기능 교육\n• 목표 KPI: D21까지 핵심 사용 사례 1개 운영`
    }, {
      title: "🏆 D22–D30 — 정착",
      content: `• 30일 리뷰: 목표 대비 실적 비교\n• 확장 기회 파악 (신규 사용자, 모듈)\n• D90에 첫 번째 QBR 일정 확정\n• 점수 ≥ 8이면 추천사 또는 NPS 요청\n• 목표 KPI: 도입률 > 70%, NPS ≥ +20`
    }],
    tip: "성공적인 30일 온보딩은 D90 이탈률을 67% 줄입니다. 형식이 아닌 프로젝트처럼 관리하세요."
  },
  [T("resChurn",lang)]: {
    sections: [{
      title: "🔴 위험 신호 (24시간 이내 조치)",
      content: `• 14일 이상 로그인 없음\n• 5일 이상 미해결 지원 에스컬레이션\n• 주요 담당자 이직\n• 구독 취소 또는 일시 중지 요청\n• LinkedIn 또는 리뷰 사이트에 부정적 언급`
    }, {
      title: "🟡 주의 신호 (72시간 이내 조치)",
      content: `• 전월 대비 사용량 40% 이상 감소\n• NPS < 6 또는 최근 설문 CSAT < 3/5\n• 일정 재조정 없이 QBR 2회 취소\n• 소개 없이 새로운 예산 결정권자 등장\n• 지원 티켓 50% 증가`
    }, {
      title: "🟢 개입 프로토콜 (5단계)",
      content: `1. 파악: CRM 데이터로 신호 확인\n2. 분석: 근본 원인 파악 (도입, ROI 인식, 관계, 경쟁사)\n3. 에스컬레이션: ARR > 500만 원이면 매니저에게 보고\n4. 접촉: 전화 통화 — 이탈 상황에서 이메일만으로는 불충분\n5. 제안: 날짜와 확인이 포함된 고객과의 공동 액션 플랜`
    }, {
      title: "📝 위험 계정 통화 스크립트",
      content: `"안녕하세요 [이름]님, [구체적 신호]를 확인해서 연락드립니다. 저의 역할은 기대하신 가치를 얻고 계신지 확인하는 것입니다. 무엇이 달라졌는지 알 수 있을까요?"\n\n→ 80%는 듣기\n→ 문제를 이해하기 전에 제품을 변호하지 말 것\n→ 재구성: "제가 제대로 이해했다면, 핵심 문제는..."`
    }],
    tip: "이탈은 첫 60일에 결정됩니다. 그러나 약한 신호에서 감지됩니다 — 그것을 읽는 것이 당신의 역할입니다."
  },
  "Matrice Priorisation CSM": {
    sections: [{
      title: "🎯 매트릭스 원칙",
      content: `계정을 2가지 축으로 분류:\n• X축: ARR 가치 (낮음 → 높음)\n• Y축: 이탈 위험 (낮음 → 높음)\n\n이를 통해 명확한 액션이 있는 4개의 사분면이 생성됩니다.`
    }, {
      title: "🔴 Q1 — 핵심 계정 (높은 ARR × 높은 위험)",
      content: `→ 즉각적인 조치, 절대적 우선순위\n→ 최소 주 1회 통화\n→ ARR > 1,000만 원이면 매니저 참여\n→ 날짜가 명시된 구제 계획 수립\n목표: 30일 이내 위험을 "중간"으로 줄이기`
    }, {
      title: "🟡 Q2 — 전략 계정 (높은 ARR × 낮은 위험)",
      content: `→ 능동적으로 관계 유지\n→ 확장 기회 발굴\n→ 최소 분기 1회 QBR\n→ 옹호자로 육성 (추천사, 레퍼럴)\n목표: 확장을 통해 ARR 20~30% 성장`
    }, {
      title: "🟠 Q3 — 주의 계정 (낮은 ARR × 높은 위험)",
      content: `→ 위험 원인 신속 파악\n→ 결정: 구하기 위해 투자할지, 우아하게 종료할지\n→ ARR < 200만 원 + 높은 위험: 자동화 이메일 시퀀스\n목표: 여기에 시간의 15% 이상 쓰지 않기`
    }, {
      title: "🟢 Q4 — 건강 계정 (낮은 ARR × 낮은 위험)",
      content: `→ 자동화된 커뮤니케이션 (뉴스레터, 이메일 체크인)\n→ 확장 신호 모니터링\n→ Q1과 Q2를 위해 시간 확보\n목표: 최소한의 노력으로 헬스 스코어 유지`
    }],
    tip: "시간의 60%를 Q1과 Q2에 투자하세요. Q3와 Q4는 자동화하세요. 그것이 황금 원칙입니다."
  },
  "15 Emails — Cycle de Vie": {
    sections: [{
      title: "📨 온보딩 (D1, D3, D7, D14, D30)",
      content: `D1: 환영 이메일 + 시작 가이드\nD3: "첫인상" 체크인 + 리소스\nD7: "첫 번째 목표를 달성했나요?" + 퀵윈\nD14: 유사 고객 성공 사례 공유\nD30: 30일 마무리 + 90일 QBR 초대`
    }, {
      title: "🔄 정기 팔로우업 (월간, 분기)",
      content: `월간: KPI 요약 + 개인화 추천\n분기: QBR 초대 + 가치 보고서\n구독 주년: 축하 + 연간 리뷰\n제품 업데이트: 고객 사용 사례와 함께 공지`
    }, {
      title: "⚠️ 재참여 (이탈 전 D-14, D-7, D-3)",
      content: `D-14: "안부 확인" (자동화 아닌 인간적 접촉)\nD-7: 가치 제안 + 구체적 액션 플랜\nD-3: 이메일 무응답 시 전화 통화\n황금 원칙: 통화 없이 3회 이상 미응답 이메일 금지`
    }, {
      title: "💰 확장 & 갱신",
      content: `갱신 3개월 전: 연간 ROI 리뷰\n1개월 전: 갱신 제안 + 해당 시 업그레이드\n확장 후: 확인 이메일 + 새로운 로드맵\n레퍼럴: NPS ≥ 8 후 소개 요청`
    }],
    tip: "최소한 이름, 회사명, 실제 KPI 하나를 개인화하세요. 개인화된 이메일은 6배 더 많은 개봉률을 만듭니다."
  },
  [T("resNPS",lang)]: {
    sections: [{
      title: "📊 현재 NPS 이해하기",
      content: `• NPS 계산: (추천자 %) - (비추천자 %)\n• 분류: 0~6 = 비추천자 | 7~8 = 중립 | 9~10 = 추천자\n• 코호트별 분류: 고객 규모, 계약 기간, 담당 CSM\n• 패턴 파악: 지속적으로 비추천자인 계정은?`
    }, {
      title: "🔴 D1–D20: 비추천자 처리 (0–6)",
      content: `• 설문 후 48시간 이내 직접 통화\n• 제품 변호 금지: 듣고 이해하기\n• 서면 약속이 포함된 구체적 액션 플랜 수립\n• D+14에 개선 측정을 위한 팔로우업\n• 목표: 비추천자의 30%를 중립으로 전환`
    }, {
      title: "🟡 D21–D40: 중립 활성화 (7–8)",
      content: `• 9점에 도달하지 못하는 이유 파악\n• 유사 고객의 퀵윈과 성공 사례 공유\n• 미사용 기능에 대한 고급 교육 제공\n• 가능하면 버디 배정 (추천자 고객)\n• 목표: 중립의 40%를 추천자로 전환`
    }, {
      title: "🟢 D41–D60: 추천자 활용 (9–10)",
      content: `• 추천사 요청 (서면 또는 영상)\n• 고객 사례 연구 / 웨비나에 초대\n• 레퍼럴 프로그램: 소개에 보상 제공\n• 마케팅 자료를 위한 성공 스토리 공동 제작\n• 목표: 추천자의 50%를 적극적 옹호자로 활성화`
    }],
    tip: "NPS는 목표 자체가 아닙니다 — 대화의 시작점입니다. 체크박스를 채우는 것이 아니라 대화를 열기 위해 사용하세요."
  },
  "Dashboard KPIs CS": {
    sections: [{
      title: "📊 주간 KPI (팀)",
      content: `• 평균 포트폴리오 헬스 스코어 (목표 > 70/100)\n• 위험 계정 수 (목표: 감소 추세)\n• 이번 주 연락 건수 / 주간 목표\n• 미해결 / 해결된 지원 티켓\n• 체크인 응답률`
    }, {
      title: "📈 월간 KPI (비즈니스)",
      content: `• 이탈률 (목표 < 월 5% / 연 15%)\n• NRR — 순 수익 유지율 (목표 > 100%)\n• NPS 점수 (목표 > +30)\n• 핵심 기능 도입률\n• 가치 실현 시간 (계약부터 첫 성공까지)`
    }, {
      title: "🏆 분기 KPI (임원 리뷰)",
      content: `• 유지된 ARR 대비 손실된 ARR\n• 확장 수익 (업셀 + 크로스셀)\n• 세그먼트별 고객 생애 가치 (CLV)\n• 서비스 비용 (고객당 CS 비용)\n• 갱신율 (목표 > 90%)`
    }, {
      title: "⚙️ 회의에서 활용하는 방법",
      content: `1. 핵심 지표 3개 + 추세가 담긴 요약 페이지 준비\n2. 항상 이전 기간 및 목표와 비교\n3. 발표할 경고 1개와 성과 1개 선택\n4. 목표 미달 시 수정 액션 1개 제안\n5. 다음 임원 리뷰를 위한 결정 사항 문서화`
    }],
    tip: "좋은 대시보드는 숫자에 빠뜨리지 않습니다 — 이야기를 전달합니다. 회의용으로 최대 5개 지표를 선택하세요."
  },
  "CS Masterclass — 6 Modules": {
    sections: [{
      title: "📚 모듈 1 — Customer Success 기초",
      content: `**Customer Success란 무엇인가?**\nCS는 반응적 지원이 아닙니다. 고객이 제품을 통해 비즈니스 목표를 달성하도록 보장하는 능동적 기능입니다.\n───────────────────────────────────\n**CS vs 지원 vs 영업 관리**\n• **지원** → 기술적 문제에 반응. 측정: 해결 시간, CSAT\n• **영업 관리** → 상업 관계, 갱신, 업셀 관리\n• **Customer Success** → 도입 및 가치 전달 보장. 측정: NRR, 이탈, 헬스 스코어\n───────────────────────────────────\n**모든 CSM이 숙달해야 할 3가지 핵심 지표**\n**NRR** = (기초 ARR - 이탈 - 다운그레이드 + 확장) / 기초 ARR × 100\n→ B2B SaaS 건강 기준: NRR > 100%\n\n**GRR** = (기초 ARR - 이탈 - 다운그레이드) / 기초 ARR × 100\n→ 순수 유지율 측정. 건강 기준: GRR > 85%\n\n**LTV/CAC** = 고객 생애 가치 / 획득 비용\n→ 목표 비율: LTV/CAC > 3\n───────────────────────────────────\n**📝 실습 연습**\n지난 분기의 NRR 계산:\n1. 1월 1일 ARR 파악\n2. 분기 이탈 + 다운그레이드 차감\n3. 확장 (업셀, 애드온) 추가\n4. 초기 ARR로 나누고 × 100`
    }, {
      title: "🚀 모듈 2 — 온보딩 & 가치 실현 시간",
      content: `**온보딩이 왜 결정적인가**\n6개월 이탈의 67%는 첫 30일에 결정됩니다. 온보딩은 형식이 아닙니다.\n───────────────────────────────────\n**D0→D90 프레임워크 4단계**\n\n**D0 단계 — 계약 당일**\n• 2시간 이내 개인화 환영 이메일\n• 48시간 이내 킥오프 일정 확정\n• CRM에 고객의 비즈니스 목표 3개와 함께 폴더 생성\n\n**D1–D7 단계 — 활성화**\n• 킥오프 콜: 고객과 함께 성공 KPI 3개 파악\n• 서면 날짜 명시 온보딩 플랜 전달\n• 목표: D7 전에 주요 사용자의 80% 로그인\n\n**D8–D30 단계 — 도입**\n• 주 1회 20분 체크인 (첫 4주)\n• 24시간 이내 모든 장애물 파악 및 해결\n• 목표: D21 전에 사용 사례 1개 운영\n\n**D31–D90 단계 — 정착**\n• 30일 리뷰: 목표 대비 결과\n• 확장 기회 파악\n• D90에 첫 QBR 일정 확정\n───────────────────────────────────\n**킥오프 콜 스크립트 (45분)**\n**오프닝 (5분)**\n"오늘 함께해 주셔서 감사합니다. 제 역할은 간단합니다: 90일 후 [제품]이 비즈니스에 미치는 구체적인 영향을 측정할 수 있도록 하는 것입니다."\n\n**탐색 질문 (15분)**\n• "[제품]을 구매해서 해결하려던 가장 중요한 문제는?"\n• "그 문제가 해결되었는지 어떻게 측정하나요?"\n• "팀에서 주요 사용자는 누구인가요? 의사결정자는?"\n• "6개월 후 올바른 투자였다고 말하려면 무엇이 필요한가요?"\n\n**📝 연습**\n5줄 킥오프 요약 템플릿 작성:\n목표 1: [비즈니스 목표 + KPI + 타겟]\n목표 2: [비즈니스 목표 + KPI + 타겟]\n다음 체크인: [날짜]\nD30 성공 지표: [1개의 구체적 측정값]`
    }, {
      title: "💡 모듈 3 — 헬스 스코어 & 이탈 감지",
      content: `**헬스 스코어 이해하기**\n헬스 스코어는 고객이 이탈할지 갱신할지 예측하는 0~100 점수입니다.\n───────────────────────────────────\n**맞춤 헬스 스코어 구축 (4가지 기준)**\n**1. 제품 사용률** (40%)\n• 주간 로그인 / 활성 대비 총 사용자\n• 사용 기능 수 대비 이용 가능 기능\n\n**2. 관계 참여도** (25%)\n• 48시간 이내 CSM 이메일 응답?\n• 예정된 통화 참석?\n\n**3. 비즈니스 결과** (25%)\n• 고객이 킥오프에서 정의한 KPI 달성?\n• 최근 NPS 또는 CSAT\n\n**4. 재무 신호** (10%)\n• 결제 최신 상태?\n• 다운그레이드 시도?\n\n→ 0~39 = 🔴 위험 | 40~69 = 🟡 주의 | 70~100 = 🟢 건강\n───────────────────────────────────\n**📝 연습**\n오늘 밤 헬스 스코어 구축:\n1. 상위 5개 계정 목록 작성\n2. 4가지 기준으로 점수 매기기\n3. 가장 낮은 점수 계정 파악\n4. 이번 주 해당 고객과 통화 일정 잡기`
    }, {
      title: "📈 모듈 4 — CS 주도 확장 & 업셀",
      content: `**확장 = 영업이 아닌 더 많은 가치 전달**\n───────────────────────────────────\n**5가지 확장 신호**\n→ 고객이 제품 사용 팀에 채용\n→ 사용자 또는 프로젝트 할당량 초과\n→ 상위 플랜 기능 요청\n→ NPS ≥ 9 (적극적 추천자)\n→ 다른 부서에 소개\n───────────────────────────────────\n**확장 대화 스크립트 (10분)**\n**1단계 — 가치 확인 (3분)**\n"다음 단계를 이야기하기 전에, 함께 이룬 것을 돌아보고 싶습니다. [D0 목표]가 목표였는데, 지금 [측정 결과]에 계십니다. 목표 대비 [X]%입니다."\n\n**2단계 — 다음 단계 파악 (4분)**\n"[관찰된 확장 신호]를 발견했습니다. 다음 분기에 그것이 우선순위인가요?"\n\n**3단계 — 자연스러운 제안 (3분)**\n"말씀하시는 것이 정확히 [상위 플랜]이 가능하게 하는 것입니다. 함께 탐색해 보시겠어요?"`
    }, {
      title: "🎯 모듈 5 — QBR & 가치 증명",
      content: `**QBR은 보고 회의가 아닙니다**\n───────────────────────────────────\n**45분 QBR 구조**\n\n**0–5분: 오프닝 및 컨텍스트**\n"이 QBR의 목표는 이번 분기에 창출된 가치를 함께 측정하고 Q[N+1] 우선순위를 정하는 것입니다."\n\n**5–15분: 가치 증명**\n→ 지난 QBR 3가지 목표 요약\n→ 목표 대비 측정 결과\n→ 1개의 구체적 고객 ROI 사례\n\n**15–25분: 현재 상황**\n"다음 단계를 이야기하기 전에, 지금 어디 계신지 이해하고 싶습니다. 다음 분기 2~3가지 우선 과제는 무엇인가요?"\n\n**25–35분: Q[N+1] 계획**\n→ 다음 분기 3가지 목표 (공동 수립)\n→ 양측 액션 항목\n\n**35–45분: 마무리**\n"논의하고 싶은 전략적 주제가 있으신가요?"\n───────────────────────────────────\n**고객 ROI 계산 및 발표**\n→ 간단한 공식: ROI = (정량화된 혜택 / 연간 비용) × 100\n→ 항상 "투자한 1원당 X원을 돌려받는다"로 표현`
    }, {
      title: "👥 모듈 6 — CS 팀 관리",
      content: `**성과를 내는 CS 팀 구축**\n───────────────────────────────────\n**세그먼트별 CSM/계정 비율**\n• **Enterprise** (ARR > 1억 원) → CSM 1명당 5~10개 계정\n• **Mid-Market** (ARR 2천~1억 원) → CSM 1명당 20~40개 계정\n• **SMB** (ARR < 2천만 원) → CSM 1명당 80~150개 계정 (테크터치)\n\n→ 비율 초과 시: CSM 과부하, 이탈 증가\n───────────────────────────────────\n**CS OKR 예시 (Q2)**\n\n**목표: Mid-Market 포트폴리오 유지율 강화**\n• KR1: Mid-Market 세그먼트 NRR ≥ 105%\n• KR2: Q2 말까지 위험 계정 12개 → 5개로 감소\n• KR3: 이번 분기 모든 Mid-Market 계정 QBR 완료\n\n**목표: CS 주도 확장 개발**\n• KR1: 포트폴리오의 20%가 상위 플랜으로 전환\n• KR2: 10개 레퍼런스 고객 발굴 및 활성화\n• KR3: 평균 포트폴리오 NPS ≥ +40\n───────────────────────────────────\n**부진한 CSM 관리**\n신호 3가지: 포트폴리오 헬스 스코어 하락 / 반복 고객 불만 / 회의 위축\n\n**4주 코칭 프레임워크**\n1주차: 개별 대화 — 판단 없이 이해\n2주차: 2개 우선 계정에 대한 공동 코칭\n3주차: 서면 액션 플랜과 함께 주간 리뷰\n4주차: 정직한 평가 및 결정\n\n**📝 최종 연습**\n3가지 질문에 답하기:\n1. 현재 CSM/계정 비율은? 기준에 맞는가?\n2. 이번 분기 코칭 플랜이 필요한 CSM은?\n3. 다음 1-on-1에서 축하할 고객 성과는?`
    }],
    tip: "100% 실행 가능한 교육. 모듈당 3~4시간. 각 모듈에는 스크립트, 연습 및 바로 사용 가능한 프레임워크가 포함됩니다."
  },
  "Automated Email Sequences": {
    sections: [{
      title: "⚙️ 시퀀스 1 — 자동화 온보딩 (D1→D30)",
      content: `트리거: 신규 가입\n• D1: 환영 이메일 + 리소스 접근\n• D3: "첫 번째 액션을 취했나요?"\n• D7: 퀵윈 공유 + 웨비나 초대\n• D14: 헬스 체크인 + 고급 리소스\n• D30: 리뷰 + QBR 90일 초대`
    }, {
      title: "🔴 시퀀스 2 — 비활성 계정 재활성화",
      content: `트리거: 14일간 로그인 없음\n• D1: "보고 싶었습니다" — 개인화된 활동 보고서\n• D3: 유사 고객 추천사 + 퀵윈\n• D7: CSM과 탐색 통화 제안\n• D14: 마지막 시도 + 부재 이유 설문`
    }, {
      title: "💰 시퀀스 3 — 갱신 (D-90→D-0)",
      content: `트리거: 만료 90일 전\n• D-90: 개인화된 연간 ROI 요약\n• D-60: 갱신 제안 + 업그레이드 옵션\n• D-30: CSM 전화 통화 + 충성 혜택\n• D-7: 부드러운 긴급성 + 특별 조건`
    }, {
      title: "⭐ 시퀀스 4 — 추천자 & 레퍼럴",
      content: `트리거: NPS ≥ 9\n• D1: 개인화된 감사 + 추천사 요청\n• D7: 앰배서더 프로그램 초대\n• D14: 공동 마케팅 제안 (사례 연구, 웨비나)\n• D30: 상호 보상이 있는 레퍼럴 제안`
    }],
    tip: "이메일 도구에 이 시퀀스를 한 번 설정하면 24/7 자동으로 실행됩니다."
  },
  "Monthly 1h Coaching Session": {
    sections: [{
      title: "📋 월간 세션 형식",
      content: `• 15분: 이달 KPI 리뷰\n• 20분: 우선 계정 분석\n• 15분: 구체적 과제 작업 (피치, 에스컬레이션, 확장)\n• 10분: 다음 달 액션 플랜`
    }, {
      title: "🎯 가장 자주 사용되는 케이스",
      content: `• 핵심 계정의 전략적 QBR 준비\n• 고급 이탈 상황 처리\n• 업셀 제안 구조화\n• 어려운 갱신 협상\n• 맞춤 헬스 스코어 구축`
    }, {
      title: "📅 세션 예약 방법",
      content: `온라인으로 직접 예약:\n→ calendly.com/stratimaagency/session-coaching-mensuelle\n\n구체적인 케이스 1~2개를 준비해 오세요. 세션은 기밀입니다.`
    }],
    cta: { label: "📅 세션 예약하기 →", url: "https://calendly.com/stratimaagency/session-coaching-mensuelle" },
    tip: "세션은 기밀입니다. 실제 데이터를 가져오세요 — 구체적일수록 더 실행 가능한 세션이 됩니다."
  },
  "SOPs & Custom Playbooks": {
    sections: [{
      title: "🔧 제공 내용",
      content: `• 현재 CS 프로세스 감사 (2시간 협업)\n• 3가지 우선 격차 파악\n• 컨텍스트에 맞춤화된 SOP 2~3개 작성\n• 업계 및 팀 규모에 맞는 플레이북`
    }, {
      title: "📝 제공되는 SOP 예시",
      content: `• 고객 에스컬레이션 SOP: 누가, 무엇을, 언제\n• 영업 → CS 핸드오프 SOP: 필요 최소 정보\n• QBR SOP: 준비, 진행, 팔로우업\n• 이탈 SOP: 감지, 개입, 문서화\n• 확장 SOP: 신호, 타이밍, 스크립트, 검증`
    }, {
      title: "🚀 납품 프로세스",
      content: `1. 2시간 탐색 워크숍 (화상 통화)\n2. 5일 이내 초안 전달\n3. 1회 수정 포함\n4. 형식: 노션, 구글 독스 또는 PDF 중 선택\n5. 팀 발표 세션 포함 (30분)`
    }],
    tip: "시작하려면 '맞춤 플레이북' 제목으로 info@scalyo.app에 이메일을 보내세요. 납품 기간: 10 영업일."
  },
  "Protocole Détection Churn": {
    sections: [{
      title: "🔍 조기 경보 신호",
      content: `• 전월 대비 사용량 20% 이상 감소\n• 최근 NPS < 6\n• 동일 문제 반복 지원 티켓\n• 3주 이상 무응답 (이메일, 통화 없음)\n• 주요 담당자 부재 또는 교체`
    }, {
      title: "📊 위험 점수 (0-10)",
      content: `**10점 만점으로 계산:**\n• 사용 빈도 (0-2) — 매일=2, 주간=1, 드물게=0\n• QBR 참여도 (0-2) — 적극적=2, 수동적=1, 불참=0\n• MRR 변화 (0-2) — 성장=2, 안정=1, 감소=0\n• 최근 피드백 (0-2) — 긍정=2, 중립=1, 부정=0\n• C레벨 접촉 (0-2) — 원활=2, 적음=1, 없음=0\n\n→ 점수 < 5 = 고위험 — 즉시 프로토콜 가동`
    }, {
      title: "🎯 5단계 개입 절차",
      content: `**1단계 — 진단 통화 (48시간 내)**\n목표: 증상이 아닌 실제 문제 파악.\n\n**2단계 — 사용 현황 감사**\n최근 3개월 분석. 미사용 기능 식별.\n\n**3단계 — 맞춤 가치 플랜**\n2주 내 달성 가능한 quick win 3가지 제안.\n\n**4단계 — 필요시 임원 에스컬레이션**\n점수 < 3이면 매니저 + 고객 C레벨 참여.\n\n**5단계 — D+7, D+14, D+30 후속 관리**\n각 시점마다 진행 상황 측정.`
    }, {
      title: "📞 오프닝 스크립트",
      content: `"안녕하세요 [이름]님, 이번 달 이용 현황에 변화가 보여 연락드렸습니다. 함께 더 나은 방향을 찾을 수 있을 것 같습니다."\n\n→ 80%는 듣고, 20%만 말하기\n→ 제품 방어 금지 — 먼저 이해하기\n→ 필요시 맞춤 데모 제안`
    }, {
      title: "✅ 회복 지표",
      content: `• 사용량 기준치 80% 이상 복구\n• 이메일 응답 48시간 이내\n• QBR 일정 확정 및 진행\n• 다음 설문 NPS > 7\n• 갱신 서명 또는 의향서 수령`
    }],
    tip: "이탈한 고객을 대체하는 비용은 유지 비용의 5배입니다. 확인 후가 아닌, 첫 신호에서 이 프로토콜을 가동하세요."
  },
  "NPS de 0 à +50 en 60 jours": {
    sections: [{
      title: "📋 1-2주차: 기준선 설정",
      content: `• 첫 NPS 설문 실시 (도구: Typeform, Delighted, Scalyo)\n• 응답 세분화: 추천자 (9-10), 중립자 (7-8), 비추천자 (0-6)\n• 점수 계산: ((추천자 - 비추천자) / 전체) × 100\n• 기준선 목표: 활성 고객 30% 이상 응답`
    }, {
      title: "🎯 3-4주차: 피드백 루프 완성",
      content: `**비추천자 100% 48시간 내 연락**\n\n스크립트: "피드백 주셔서 감사합니다. 어떤 점이 문제였는지 설명해 주실 수 있나요? 경험을 개선하고 싶습니다."\n\n→ 비추천자 계정별 실행 계획 수립\n→ D+14 후속으로 효과 측정\n→ 비추천자 → 중립자 전환 = NPS +10점`
    }, {
      title: "🚀 5-6주차: 추천자 활용",
      content: `• 상위 추천자 식별 (점수 9-10 + 강한 참여도)\n• G2 / Capterra / LinkedIn 리뷰 요청\n• 영상 또는 서면 추천사 요청\n• 제품 베타 및 웨비나 초대\n• 앰배서더 프로그램: 얼리 기능 접근 + 노출 기회`
    }, {
      title: "📊 7-8주차: 측정 및 반복",
      content: `• NPS 설문 재실시 (동일 세그먼트)\n• 포인트별 진행 상황 계산\n• 패턴 식별: 어떤 세그먼트가 개선됐나?\n• 결과에 따른 플레이북 조정\n• 월별 변화와 함께 임원 리뷰에서 공유`
    }, {
      title: "✅ 성공 지표",
      content: `• 전체 NPS > +40\n• 응답률 > 30%\n• 비추천자 100% 연락 및 후속 관리\n• 추천사 또는 리뷰 3개 이상 수집\n• 세그먼트별 실행 계획 문서화`
    }],
    tip: "NPS는 허영 지표가 아닙니다 — 성장 예측 지표입니다. 점수 1점 상승 = 이탈 감소 + 입소문 증가."
  },
  "SOPs & Playbooks Sur-mesure": {
    sections: [{
      title: "🔧 제공 내용",
      content: `• 현재 CS 프로세스 감사 (2시간 협업)\n• 3가지 우선 격차 파악\n• 컨텍스트에 맞춤화된 SOP 2~3개 작성\n• 업계 및 팀 규모에 맞는 플레이북`
    }, {
      title: "📝 제공되는 SOP 예시",
      content: `• 고객 에스컬레이션 SOP: 누가, 무엇을, 언제\n• 영업 → CS 핸드오프 SOP: 필요 최소 정보\n• QBR SOP: 준비, 진행, 팔로우업\n• 이탈 SOP: 감지, 개입, 문서화\n• 확장 SOP: 신호, 타이밍, 스크립트, 검증`
    }, {
      title: "🚀 납품 프로세스",
      content: `1. 2시간 탐색 워크숍 (화상 통화)\n2. 5일 이내 초안 전달\n3. 1회 수정 포함\n4. 형식: 노션, 구글 독스 또는 PDF 중 선택\n5. 팀 발표 세션 포함 (30분)`
    }],
    tip: "시작하려면 '맞춤 플레이북' 제목으로 info@scalyo.app에 이메일을 보내세요. 납품 기간: 10 영업일."
  }
,
  "Process CSM — Gestion Clients": {
    sections: [{title:"1. 고객 온보딩 (D0→D30)",content:`• 킥오프 미팅: 팀 소개, 목표, 일정
• 플랫폼 설정 및 사용자 접근 권한
• 초기 교육: 2회×1시간
• D+30에 첫 QBR 일정 확정`},
    {title:"2. 정기 팔로우업 (월간)",content:`• 월간 체크인: 30분, KPI 검토
• 헬스 스코어 업데이트
• 리스크 식별 및 행동 계획
• 성공 계획서 업데이트`},
    {title:"3. 갱신 (D-90→D0)",content:`• D-90: ROI 분석 및 비즈니스 케이스 준비
• D-60: 연간 QBR 발표
• D-45: 상업적 제안 (갱신/업셀)
• D0: 새로운 사이클 시작`},
    {title:"4. 업셀/크로스셀",content:`• 확장 신호 파악 (사용량, 기능 요청)
• 영업팀과 기회 검증
• 기능 데모/POC 준비
• 활성화 후 팔로우업`}]
  },
  "Process CSM — Collaboration Équipes Dev": {
    sections: [{title:"1. 버그 보고",content:`• 티켓: [고객] 제목 — 심각도 — 재현 단계
• P0<2h · P1<4h · P2<24h · P3<72h
• 1시간 이내 고객 접수 확인`},
    {title:"2. 기능 우선순위",content:`• 표준화 양식 (고객, 필요, 비즈니스 영향)
• 점수: 영향도 × 빈도 × ARR
• 월간 검토: CSM+PM+기술리드`},
    {title:"3. 릴리스 추적",content:`• 스프린트 리뷰 참여 (격주)
• 고객 지향 릴리스 노트 작성
• 영향받는 고객에게 사전 공지`},
    {title:"4. 기술 에스컬레이션",content:`• L1: CSM 해결 시도
• L2: 기술 지원 티켓
• L3: SLA 초과 시 관리자 에스컬레이션
• 사후 분석 및 예방 조치`}]
  },
  "Process CSM / Chef de Projet": {
    sections: [{title:"1. 프로젝트 조율",content:`• RACI: CSM vs PM vs 고객 역할 정의
• 공유 계획: 마일스톤, 납품물
• 주간 운영 위원회 (30분)`},
    {title:"2. 납품물 관리",content:`• 검수 체크리스트: 사전 정의된 기준
• 검토: 고객→CSM→PM→Dev→고객
• 변경 관리: 변경 요청 양식`},
    {title:"3. 고객 소통",content:`• 주간 업데이트: 진행, 장애물, 다음 단계
• 24시간 이내 회의록 발송
• 기대 관리: 보수적 약속, 초과 실행`},
    {title:"4. 프로젝트 종료",content:`• 목표 대비 결과 검토
• 전체 이해관계자와의 회고
• 운영 모드로 전환
• 지식 자산화`}]
  },
  "Process Qualité": {
    sections: [{title:"1. 내부 품질 감사 (분기별)",content:`• CSM 프로세스 검토: SLA 및 절차 준수
• CSM별 CSAT/NPS 분석
• 동료 검토: CSM당 2개 통화`},
    {title:"2. 품질 지표",content:`• CSAT: 목표 > 4.5/5
• 첫 응답 시간: < 2시간
• NPS: 목표 > 50
• 이탈률: 목표 < 5%`},
    {title:"3. 지속적 개선",content:`• 월간 회고: 잘된 점/개선할 점
• 지식 베이스 주간 업데이트
• 모범 사례 공유 세션 (격월)`},
    {title:"4. SLA 준수",content:`• 자동 SLA 모니터링
• 위험 시 사전 알림 (80%)
• 월간 SLA 준수율 보고서`}]
  }
};


;


export default WellbeingView;
