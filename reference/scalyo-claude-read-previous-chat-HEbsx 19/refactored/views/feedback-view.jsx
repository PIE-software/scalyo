/**
 * Scalyo - FeedbackView
 * Extracted from app.html (lines 14041-14206)
 */

import { T } from '../shared/i18n-wrapper.js';


const FeedbackView = ({lang="fr"}) => {
  const [step, setStep] = React.useState("form"); // form | success
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [category, setCategory] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const categories = lang === "kr"
    ? ["🐛 버그", "💡 기능 요청", "🎨 UX/디자인", "⚡ 성능", "💬 기타"]
    : lang === "en"
    ? ["🐛 Bug", "💡 Feature request", "🎨 UX/Design", "⚡ Performance", "💬 Other"]
    : ["🐛 Bug", T("fbFeature",lang), "🎨 UX/Design", "⚡ Performance", "💬 Autre"];

  const submit = async () => {
    if (!rating || !category || !message.trim()) return;
    setSending(true);
    const body = encodeURIComponent(
      "Feedback Alphatest Scalyo\n\n" +
      "Note: " + rating + "/5\n" +
      T("fbCatLabel",lang) + category + "\n" +
      "Message: " + message + "\n" +
      (email ? "Email: " + email : "")
    );
    window.open("mailto:info@scalyo.app?subject=Feedback%20Alphatest%20Scalyo&body=" + body);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setStep("success");
  };

  if (step === "success") return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",gap:16,padding:40}
  },
    /*#__PURE__*/React.createElement("div", {style:{fontSize:56}}, "✅"),
    /*#__PURE__*/React.createElement("h2", {style:{fontSize:22,fontWeight:800,color:C.text}}, lang==="en" ? "Feedback sent!" : lang==="kr" ? "피드백 전송됨!" : T("fbSent",lang)),
    /*#__PURE__*/React.createElement("p", {style:{fontSize:14,color:C.muted,maxWidth:360,lineHeight:1.6}},
      T('fbThanks', lang)),
    /*#__PURE__*/React.createElement("button", {
      className:"btn btn-primary",
      onClick:()=>{setStep("form");setRating(0);setCategory("");setMessage("");setEmail("");}
    }, lang==="en" ? "Send another feedback" : lang==="kr" ? "추가 피드백 보내기" : T("fbSendAnother",lang))
  );

  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {maxWidth:560,margin:"0 auto",padding:"32px 24px",width:"100%"}
  },
    // Header
    /*#__PURE__*/React.createElement("div", {style:{marginBottom:32}},
      /*#__PURE__*/React.createElement("div", {style:{display:"flex",alignItems:"center",gap:10,marginBottom:8}},
        /*#__PURE__*/React.createElement("span", {style:{fontSize:22}}, "📣"),
        /*#__PURE__*/React.createElement("h2", {style:{fontSize:20,fontWeight:800,color:C.text}},
          lang==="en" ? "Alpha Feedback" : lang==="kr" ? "알파 피드백" : "Feedback Alphatest"
        )
      ),
      /*#__PURE__*/React.createElement("p", {style:{fontSize:14,color:C.muted,lineHeight:1.6}},
        lang==="en"
          ?"Your feedback directly shapes the product. Every report is read personally."
          :lang==="kr"
          ?"피드백이 제품을 직접 개선합니다. 모든 리포트는 직접 읽힙니다."
          :"Votre retour façonne directement le produit. Chaque signalement est lu personnellement."
      )
    ),

    // Rating
    /*#__PURE__*/React.createElement("div", {style:{marginBottom:24}},
      /*#__PURE__*/React.createElement("label", {style:{display:"block",fontSize:12,fontWeight:700,letterSpacing:".06em",color:C.muted,textTransform:"uppercase",marginBottom:12}},
        lang==="en" ? "Overall experience *" : lang==="kr" ? "전반적인 경험 *" : T("fbGlobal",lang)
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:"flex",gap:8}},
        [1,2,3,4,5].map(n => /*#__PURE__*/React.createElement("button", {
          key:n,
          onClick:()=>setRating(n),
          onMouseEnter:()=>setHover(n),
          onMouseLeave:()=>setHover(0),
          style:{
            width:44,height:44,borderRadius:6,border:"1px solid",
            borderColor:(hover||rating)>=n?C.tealBorder:C.border,
            background:(hover||rating)>=n?C.tealBg:"transparent",
            color:(hover||rating)>=n?C.teal:C.muted,
            fontSize:20,cursor:"pointer",transition:".15s",display:"flex",alignItems:"center",justifyContent:"center"
          }
        }, ["😤","😕","😐","😊","🤩"][n-1]))
      ),
      rating > 0 && /*#__PURE__*/React.createElement("p", {style:{fontSize:12,color:C.teal,marginTop:8}},
        ["",T("fbBad",lang),T("fbImprove",lang),"😐 Correct","😊 Bien","🤩 Excellent !"][rating]
      )
    ),

    // Category
    /*#__PURE__*/React.createElement("div", {style:{marginBottom:24}},
      /*#__PURE__*/React.createElement("label", {style:{display:"block",fontSize:12,fontWeight:700,letterSpacing:".06em",color:C.muted,textTransform:"uppercase",marginBottom:12}},
        lang==="en" ? "Category *" : lang==="kr" ? "카테고리 *" : T("fbCat",lang)
      ),
      /*#__PURE__*/React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:8}},
        categories.map(cat => /*#__PURE__*/React.createElement("button", {
          key:cat,
          onClick:()=>setCategory(cat),
          style:{
            padding:"8px 14px",borderRadius:16,border:"1px solid",
            borderColor:category===cat?C.tealBorder:C.border,
            background:category===cat?C.tealBg:"transparent",
            color:category===cat?C.teal:C.muted,
            fontSize:13,cursor:"pointer",transition:".15s"
          }
        }, cat))
      )
    ),

    // Message
    /*#__PURE__*/React.createElement("div", {style:{marginBottom:20}},
      /*#__PURE__*/React.createElement("label", {style:{display:"block",fontSize:12,fontWeight:700,letterSpacing:".06em",color:C.muted,textTransform:"uppercase",marginBottom:8}},
        lang==="en" ? "Your feedback *" : lang==="kr" ? "피드백 *" : "Votre retour *"
      ),
      /*#__PURE__*/React.createElement("textarea", {
        value:message,
        onChange:e=>setMessage(e.target.value),
        placeholder:lang==="en" ? "Describe what happened, what you expected, or what you'd like to see..." : lang==="kr" ? "무슨 일이 있었는지, 기대했던 것, 또는 바라는 것을 설명해주세요..." : "Décrivez ce qui s'est passé, ce que vous attendiez, ou ce que vous aimeriez voir...",
        rows:4,
        style:{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.6}
      })
    ),

    // Email
    /*#__PURE__*/React.createElement("div", {style:{marginBottom:28}},
      /*#__PURE__*/React.createElement("label", {style:{display:"block",fontSize:12,fontWeight:700,letterSpacing:".06em",color:C.muted,textTransform:"uppercase",marginBottom:8}},
        lang==="en" ? "Your email (optional — to follow up)" : lang==="kr" ? "이메일 (선택 — 후속 연락용)" : "Votre email (optionnel — pour suivi)"
      ),
      /*#__PURE__*/React.createElement("input", {
        type:"email",
        value:email,
        onChange:e=>setEmail(e.target.value),
        placeholder:"you@company.io",
        style:{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"}
      })
    ),

    // Submit
    /*#__PURE__*/React.createElement("button", {
      className:"btn btn-primary",
      onClick:submit,
      disabled:!rating||!category||!message.trim()||sending,
      style:{width:"100%",opacity:(!rating||!category||!message.trim())?0.5:1}
    }, sending
      ? (lang==="en" ? "Sending..." : lang==="kr" ? "전송 중..." : "Envoi...")
      : (lang==="en" ? "Send feedback →" : lang==="kr" ? "피드백 보내기 →" : T("fbSend",lang))
    ),

    // Note
    /*#__PURE__*/React.createElement("p", {style:{fontSize:12,color:C.muted,textAlign:"center",marginTop:16,lineHeight:1.5}},
      lang==="en"
        ?"💌 Every feedback is read by Lidia, the founder. Average response time: 24h."
        :lang==="kr"
        ?"💌 모든 피드백은 창업자 Lidia가 직접 읽습니다. 평균 응답 시간: 24시간."
        :"💌 Chaque feedback est lu par Lidia, la fondatrice. Délai de réponse moyen : 24h."
    )
  );
};
