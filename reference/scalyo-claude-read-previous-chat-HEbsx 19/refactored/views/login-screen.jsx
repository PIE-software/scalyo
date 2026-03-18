/**
 * Scalyo - LoginScreen
 * Extracted from app.html (lines 1971-3345)
 */

import { T } from '../shared/i18n-wrapper.js';


const LoginScreen = ({
  onLogin, lang="fr"
}) => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("manager");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const reset = () => {
    setErr("");
    setInfo("");
  };
  const handleLogin = async () => {
    if (!email.trim() || !pass) {
      setErr(T("errEmailPass",lang));
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const {
        data,
        error
      } = await db.auth.signInWithPassword({
        email: email.trim(),
        password: pass
      });
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setErr(T("errConfirm",lang));
        } else {
          setErr(T("errInvalidCreds",lang));
        }
        setLoading(false);
        return;
      }
      // Handle pending profile (post-email-confirmation flow)
      const pending = localStorage.getItem("scalyo_pending");
      if (pending && data.session) {
        try {
          const p = JSON.parse(pending);
          if (p.userId === data.session.user.id) {
            await createUserProfile(data.session.user.id, p.company, p.role);
            localStorage.removeItem("scalyo_pending");
          }
        } catch (e) {
          console.warn("Pending profile:", e);
        }
      }
      onLogin(data.session, role);
    } catch (e) {
      setErr(T("errNetwork",lang));
      setLoading(false);
    }
  };
  const createUserProfile = async (userId, companyName, userRole) => {
    const {
      error: ce
    } = await db.from("companies").insert({
      auth_user_id: userId,
      name: companyName.trim(),
      plan: "Starter",
      logo: companyName.trim()[0].toUpperCase(),
      color: C.teal
    });
    if (ce) {
      console.warn("company insert:", ce.message);
      return;
    }
    const {
      data: comp
    } = await db.from("companies").select("id").eq("auth_user_id", userId).single();
    if (comp) {
      await Promise.all([db.from("roadmap").insert({
        company_id: comp.id,
        phase: "Phase 1 — Launch",
        progress: 0,
        items: []
      }), db.from("wellbeing").insert({
        company_id: comp.id,
        score: 70,
        trend: "+0",
        burnout: "none",
        charge: 70,
        alerts: [],
        team: []
      })]);
    }
  };
  const handleSignup = async () => {
    if (!email.trim() || !pass || !company.trim()) {
      setErr(T("errAllFields",lang));
      return;
    }
    if (pass.length < 8) {
      setErr(T("errPassLength",lang));
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const {
        data,
        error
      } = await db.auth.signUp({
        email: email.trim(),
        password: pass
      });
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const userId = data.user?.id;
      if (!userId) {
        setErr(T("errCreation",lang));
        setLoading(false);
        return;
      }

      // Try immediate login
      const {
        data: ld,
        error: le
      } = await db.auth.signInWithPassword({
        email: email.trim(),
        password: pass
      });
      if (le) {
        // Email confirmation required
        localStorage.setItem("scalyo_pending", JSON.stringify({
          userId,
          company: company.trim(),
          role
        }));
        setInfo(T("confirmSent",lang)); localStorage.setItem("scalyo_signup_pending", "1");
        setTab("login");
        setLoading(false);
        return;
      }
      if (!ld.session) {
        setInfo(T("accountCreated",lang));
        setTab("login");
        setLoading(false);
        return;
      }
      await createUserProfile(userId, company.trim(), role);
      onLogin(ld.session, role);
      setLoading(false);
    } catch (e) {
      setErr(T("errUnexpected",lang));
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in",
    style: {
      minHeight: "100vh",
      background: `radial-gradient(ellipse 90% 60% at 50% -5%,rgba(77,182,160,0.06) 0%,transparent 70%),${C.bg}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      background: C.teal,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24,
      boxShadow: "none"
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 34,
      fontWeight: 900,
      letterSpacing: "-1.5px"
    }
  }, "scal", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.teal
    }
  }, "yo"))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 14,
      marginBottom: 32
    }
  }, lang==="en" ? "Your Customer Success platform" : lang==="kr" ? "Customer Success 플랫폼" : "Votre plateforme Customer Success francophone"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg1,
      border: `1px solid ${C.border}`,
      borderRadius: 22,
      padding: 36,
      width: "100%",
      maxWidth: 440,
      boxShadow: "0 4px 20px rgba(45,42,38,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-bar",
    style: {
      marginBottom: 28
    }
  }, [["login", lang==="en" ? "Sign in" : lang==="kr" ? "로그인" : T("switchToLogin",lang)], ["signup", lang==="en" ? "Create an account" : lang==="kr" ? "계정 생성" : T("switchToRegister",lang)]].map(([t, l]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: `tab-item${tab === t ? " active" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => {
      setTab(t);
      reset();
    }
  }, l))), info && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.greenBg,
      border: `1px solid ${C.greenBorder}`,
      borderRadius: 12,
      padding: "11px 14px",
      fontSize: 13,
      color: C.green,
      marginBottom: 16,
      lineHeight: 1.5
    }
  }, info), tab === "login" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      fontWeight: 900,
      marginBottom: 4
    }
  }, lang==="en" ? "Welcome back 👋" : lang==="kr" ? "다시 오셨네요 👋" : "Bon retour \uD83D\uDC4B"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 22
    }
  }, lang==="en" ? "Access your Scalyo workspace" : lang==="kr" ? "Scalyo 워크스페이스에 접속하세요" : T("loginTitle",lang)), /*#__PURE__*/React.createElement(Field, {
    label: T("emailPro",lang),
    value: email,
    onChange: setEmail,
    type: "email",
    placeholder: lang==="en" ? "you@your-company.com" : lang==="kr" ? "you@your-company.com" : T("emailPlaceholderLogin",lang),
    onEnter: handleLogin,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      display: "block",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, lang==="kr"?"비밀번호 *":lang==="en"?"Password *":"Mot de passe *"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: pass,
    onChange: e => setPass(e.target.value),
    onKeyDown: e => e.key === "Enter" && handleLogin(),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    type: showPass ? "text" : "password",
    style: {
      width: "100%",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "11px 48px 11px 14px",
      color: C.text,
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowPass(!showPass),
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: C.muted,
      cursor: "pointer",
      fontSize: 15,
      padding: 4
    }
  }, showPass ? "🙈" : "👁"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      display: "block",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, lang==="en" ? "Your role" : lang==="kr" ? "역할" : "Votre rôle"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, [["manager", "👔 Manager CS"], ["csm", "🎯 CSM"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setRole(v),
    className: "btn-base",
    style: {
      padding: "10px",
      borderRadius: 12,
      fontSize: 13,
      background: role === v ? C.tealBg : C.surface,
      border: `1px solid ${role === v ? C.tealBorder : C.border}`,
      color: role === v ? C.teal : C.muted
    }
  }, l)))), err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      borderRadius: 12,
      padding: "11px 14px",
      fontSize: 13,
      color: C.red,
      marginBottom: 14
    }
  }, err), /*#__PURE__*/React.createElement("button", {
    onClick: handleLogin,
    disabled: loading,
    className: "btn-base",
    style: {
      width: "100%",
      padding: "14px",
      borderRadius: 11,
      fontSize: 15,
      background: C.teal,
      color: "#FFFFFF",
      boxShadow: "none"
    }
  }, loading ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: 16,
    color: "#FFFFFF"
  }), lang==="en" ? "Signing in..." : lang==="kr" ? "로그인 중..." : "Connexion...") : lang==="en" ? "Access my workspace →" : lang==="kr" ? "내 워크스페이스 접속 →" : T("loginBtn",lang))), tab === "signup" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      fontWeight: 900,
      marginBottom: 4
    }
  }, lang==="en" ? "Create your workspace" : lang==="kr" ? "워크스페이스 생성" : "Créer votre espace"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 22
    }
  }, lang==="kr"?"30초 만에 Scalyo 설정하기":lang==="en"?"Set up Scalyo in 30 seconds":"Configurez Scalyo en 30 secondes"), /*#__PURE__*/React.createElement(Field, {
    label: lang==="en" ? "Your company name" : lang==="kr" ? "회사명" : T("companyPlaceholder",lang),
    value: company,
    onChange: setCompany,
    placeholder: lang==="kr"?"예: TechPilot SaaS":lang==="en"?"E.g.: TechPilot SaaS":"Ex : TechPilot SaaS",
    onEnter: handleSignup,
    required: true
  }), /*#__PURE__*/React.createElement(Field, {
    label: T("emailPro",lang),
    value: email,
    onChange: setEmail,
    type: "email",
    placeholder: lang==="en" ? "you@your-company.com" : lang==="kr" ? "you@your-company.com" : T("emailPlaceholderLogin",lang),
    onEnter: handleSignup,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      display: "block",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, lang==="kr"?"비밀번호 *":lang==="en"?"Password *":"Mot de passe *"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: pass,
    onChange: e => setPass(e.target.value),
    onKeyDown: e => e.key === "Enter" && handleSignup(),
    placeholder: lang==="kr"?"최소 8자":lang==="en"?"8 characters minimum":"8 caractères minimum",
    type: showPass ? "text" : "password",
    style: {
      width: "100%",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "11px 48px 11px 14px",
      color: C.text,
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowPass(!showPass),
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: C.muted,
      cursor: "pointer",
      fontSize: 15,
      padding: 4
    }
  }, showPass ? "🙈" : "👁"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      display: "block",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, lang==="en" ? "Your role" : lang==="kr" ? "역할" : "Votre rôle"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, [["manager", "👔 Manager CS"], ["csm", "🎯 CSM"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setRole(v),
    className: "btn-base",
    style: {
      padding: "10px",
      borderRadius: 12,
      fontSize: 13,
      background: role === v ? C.tealBg : C.surface,
      border: `1px solid ${role === v ? C.tealBorder : C.border}`,
      color: role === v ? C.teal : C.muted
    }
  }, l)))), err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      borderRadius: 12,
      padding: "11px 14px",
      fontSize: 13,
      color: C.red,
      marginBottom: 14
    }
  }, err), /*#__PURE__*/React.createElement("button", {
    onClick: handleSignup,
    disabled: loading,
    className: "btn-base",
    style: {
      width: "100%",
      padding: "14px",
      borderRadius: 11,
      fontSize: 15,
      background: C.teal,
      color: "#FFFFFF",
      boxShadow: "none"
    }
  }, loading ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: 16,
    color: "#FFFFFF"
  }), lang==="en" ? "Creating..." : lang==="kr" ? "생성 중..." : T("creating",lang)) : lang==="en" ? "Create my Scalyo workspace →" : lang==="kr" ? "내 Scalyo 워크스페이스 생성 →" : T("registerBtn",lang)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: C.faint,
      textAlign: "center",
      marginTop: 14,
      lineHeight: 1.6
    }
  }, lang==="en" ? "By creating an account you agree to our Terms." : lang==="kr" ? "계정을 생성하면 이용약관에 동의하는 것입니다." : T("termsAccept",lang), lang!=="en"&&/*#__PURE__*/React.createElement("br", null), lang!=="en"&&lang==="en" ? "No credit card required." : lang==="kr" ? "신용카드 불필요." : T("noCB",lang)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      textAlign: "center",
      fontSize: 12,
      color: C.faint
    }
  }, "\uD83D\uDD12 Donn\xE9es s\xE9curis\xE9es \xB7 RGPD \xB7 H\xE9berg\xE9 en Europe (Ireland)"));
};

// ══════════════════════════════════════════════════
// UPGRADE MODAL
// ══════════════════════════════════════════════════
const UpgradeModal = ({
  onClose,
  currentPlan = "Starter",
  companyId = null,
  onPlanChanged = null
}) => {
  const handleUpgrade = async (planName) => {
    // Mettre à jour le plan immédiatement dans localStorage
    try { localStorage.setItem("scalyo_plan", planName); } catch(e) {}
    // Mettre à jour dans Supabase si on a un company ID
    if (companyId) {
      try { await db.from("companies").update({ plan: planName }).eq("id", companyId); } catch(e) { console.error("Plan update error:", e); }
    }
    // Notifier le parent pour mise à jour du state React
    if (onPlanChanged) onPlanChanged(planName);
  };
  const plans = [{
    id: "starter",
    name: "Starter",
    price: "97€",
    period: T("perMonth",lang),
    users: "1 CSM",
    highlight: false,
    features: lang==="kr"?[T("upgrade5Acc",lang),"대시보드 & 로드맵","기본 CS 리소스",T("emailPro",lang)]:lang==="en"?[T("upgrade5Acc",lang),"Dashboard & roadmap","Basic CS resources",T("emailPro",lang)]:[T("upgrade5Acc",lang),T("upgradeDashboard",lang),"Ressources CS de base","Support email"],
    link: STRIPE.starter,
    current: currentPlan === "Starter"
  }, {
    id: "growth",
    name: "Growth",
    price: "297€",
    period: T("perMonth",lang),
    users: "5 CSMs",
    highlight: true,
    features: lang==="kr"?["무제한 계정","팀 웰빙",T("email",lang),"AI 코치","CSV/Excel 가져오기","우선 지원"]:lang==="en"?["Unlimited accounts","Team wellbeing",T("email",lang),"AI Coach","CSV/Excel Import","Priority support"]:[T("upgradeUnlimitedAcc",lang),T("upgradeWellbeing",lang),T("email",lang),"Coach IA","Import CSV/Excel","Support prioritaire"],
    link: STRIPE.growth,
    current: currentPlan === "Growth"
  }, {
    id: "elite",
    name: "Elite",
    price: "697€",
    period: T("perMonth",lang),
    users: lang==="en" ? "Unlimited CSMs" : lang==="kr" ? "무제한 CSM" : T("upgradeUnlimitedCSM",lang),
    highlight: false,
    features: lang==="kr"?["Growth 전체 포함","맞춤 플레이북","월간 코칭 세션","전담 온보딩","SLA 99.9%","24/7 지원"]:lang==="en"?["Everything in Growth","Custom playbooks","Monthly coaching session","Dedicated onboarding","99.9% SLA","7/7 support"]:["Tout Growth inclus","Playbooks sur-mesure","Session coaching mensuelle",T("upgradeOnboarding",lang),"SLA 99.9%","Support 7j/7"],
    link: STRIPE.elite,
    current: currentPlan === "Elite"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: 700,
      padding: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      marginBottom: 4
    }
  }, lang==="en" ? "Choose your plan" : lang==="kr" ? "플랜 선택" : T("upgradeTitle",lang)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, lang==="en"?lang==="en" ? T("upgradeTagline",lang) : lang==="kr" ? "성과를 내는 CS팀, 떠나지 않는 고객." : T("upgradeTagline",lang):lang==="en" ? T("upgradeTagline",lang) : lang==="kr" ? "성과를 내는 CS팀, 떠나지 않는 고객." : T("upgradeTagline",lang))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 22,
      cursor: "pointer",
      padding: 4,
      lineHeight: 1
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 14
    }
  }, plans.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      background: p.highlight ? C.tealBg : C.surface,
      border: `2px solid ${p.highlight ? C.tealBorder : p.current ? C.border : "transparent"}`,
      borderRadius: 16,
      padding: 22,
      position: "relative",
      boxShadow: p.highlight ? `0 0 0 1px ${C.tealBorder}` : undefined
    }
  }, p.highlight && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -10,
      left: "50%",
      transform: "translateX(-50%)",
      background: C.teal,
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: 800,
      padding: "3px 12px",
      borderRadius: 20,
      whiteSpace: "nowrap"
    }
  }, lang==="kr"?"⭐ 추천":lang==="en"?"⭐ RECOMMENDED":"⭐ RECOMMANDÉ"), p.current && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -10,
      right: 14,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted,
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: 20
    }
  }, T("currentPlanBadge",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      marginBottom: 4
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 2,
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 900,
      color: p.highlight ? C.teal : C.text,
      fontFamily: "'JetBrains Mono',monospace"
    }
  }, p.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, p.period)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginBottom: 16
    }
  }, p.users), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      marginBottom: 20
    }
  }, p.features.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: p.highlight ? C.teal : C.green,
      flexShrink: 0
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, f)))), !p.current ? /*#__PURE__*/React.createElement("a", {
    href: p.link,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => handleUpgrade(p.name),
    style: {
      display: "block",
      textAlign: "center",
      padding: "10px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 700,
      textDecoration: "none",
      background: p.highlight ? C.teal : C.surfaceHi,
      color: p.highlight ? "#FFFFFF" : C.text,
      border: p.highlight ? "none" : `1px solid ${C.border}`
    }
  }, lang==="kr"?"선택 ":lang==="en"?"Choose ":"Choisir ", p.name, " \u2192") : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "10px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 700,
      background: C.surface,
      color: C.muted,
      border: `1px solid ${C.border}`
    }
  }, T("activePlan",lang))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: C.faint,
      textAlign: "center",
      marginTop: 18,
      lineHeight: 1.6
    }
  }, lang==="en" ? "Cancel anytime · Secure billing via Stripe · Data hosted in Europe" : lang==="kr" ? "언제든지 취소 · Stripe 보안 결제 · 유럽 데이터 호스팅" : "Annulation à tout moment · Facturation sécurisée via Stripe · Données hébergées en Europe")));
};

// ══════════════════════════════════════════════════
// IMPORT MODAL v5 — édition libre + prévisualisation éditable
// ══════════════════════════════════════════════════
const ImportModal = ({
  onClose,
  onImport,
  companyId
}) => {
  const IMPORT_DRAFT_KEY = "scalyo_draft_import";
  const [step, setStep] = useState(() => { try { const d = JSON.parse(localStorage.getItem(IMPORT_DRAFT_KEY)); return d?.step || "upload"; } catch(e) { return "upload"; } });
  const [rawRows, setRawRows] = useState(() => { try { const d = JSON.parse(localStorage.getItem(IMPORT_DRAFT_KEY)); return d?.rawRows || []; } catch(e) { return []; } });
  const [headers, setHeaders] = useState(() => { try { const d = JSON.parse(localStorage.getItem(IMPORT_DRAFT_KEY)); return d?.headers || []; } catch(e) { return []; } });
  const [mapping, setMapping] = useState(() => { try { const d = JSON.parse(localStorage.getItem(IMPORT_DRAFT_KEY)); return d?.mapping || {}; } catch(e) { return {}; } });
  const [editableRows, setEditableRows] = useState(() => { try { const d = JSON.parse(localStorage.getItem(IMPORT_DRAFT_KEY)); return d?.editableRows || []; } catch(e) { return []; } });
  const [importing, setImporting] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (step !== "upload") { try { localStorage.setItem(IMPORT_DRAFT_KEY, JSON.stringify({step,rawRows,headers,mapping,editableRows})); } catch(e) {} } }, [step,rawRows,headers,mapping,editableRows]);
  const SCALYO_FIELDS = [{
    key: "name",
    label: lang==="en" ? "Account name" : lang==="kr" ? "계정명" : T("accNameLabel",lang),
    required: true
  }, {
    key: "csm",
    label: "CSM",
    required: false
  }, {
    key: "mrr",
    label: lang==="kr"?"MRR (€/월)":lang==="en"?"MRR (€/month)":"MRR (€/mois)",
    required: false
  }, {
    key: "industry",
    label: lang==="en" ? "Industry" : lang==="kr" ? "산업" : "Secteur",
    required: false
  }, {
    key: "renewal",
    label: lang==="en" ? "Renewal" : lang==="kr" ? "갱신" : "Renouvellement",
    required: false
  }, {
    key: "health",
    label: lang==="kr"?"건강 점수":lang==="en"?"Health Score":"Score de Santé",
    required: false
  }];
  const autoMap = hdrs => {
    const m = {};
    const normalize = s => s?.toLowerCase().replace(/[^a-z0-9]/g, "");
    const aliases = {
      name: ["nom", lang==="en" ? "account" : lang==="kr" ? "계정" : "compte", "client", "name", "company", "entreprise"],
      csm: ["csm", "gestionnaire", "responsable", "owner"],
      mrr: ["mrr", "revenu", "revenue", "montant", "mois", "monthly"],
      industry: ["secteur", "industry", "industrie", "domaine", "type"],
      renewal: ["renouvellement", "renewal", "contrat", "echeance", "date"],
      health: ["health", "sante", "score", "healthscore"]
    };
    hdrs.forEach(h => {
      const hn = normalize(h);
      for (const [field, aliasList] of Object.entries(aliases)) {
        if (!m[field] && aliasList.some(a => hn.includes(a))) {
          m[field] = h;
          break;
        }
      }
    });
    return m;
  };
  const handleFile = async file => {
    setErr("");
    try {
      // Lazy load xlsx + PapaParse uniquement à la première utilisation
      if (!window.XLSX) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      if (!window.Papa) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      let rows = [];
      if (file.name.match(/\.xlsx?$/i)) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: ""
        });
      } else {
        const text = await file.text();
        const result = Papa.parse(text, {
          header: false,
          skipEmptyLines: true
        });
        rows = result.data;
      }
      if (!rows.length) {
        setErr(T("fileEmpty",lang));
        return;
      }
      const hdrs = rows[0].map(h => String(h || "").trim());
      const data = rows.slice(1).filter(r => r.some(c => String(c).trim()));
      setHeaders(hdrs);
      setRawRows(data);
      setMapping(autoMap(hdrs));
      setStep("map");
    } catch (e) {
      setErr(T("fileError",lang) + e.message);
    }
  };
  const buildEditable = () => {
    const rows = rawRows.slice(0, 50).map((row, i) => {
      const entry = {
        _id: i
      };
      SCALYO_FIELDS.forEach(({
        key
      }) => {
        const col = mapping[key];
        const colIdx = col ? headers.indexOf(col) : -1;
        entry[key] = colIdx >= 0 ? String(row[colIdx] || "").trim() : "";
      });
      return entry;
    });
    setEditableRows(rows);
    setStep("preview");
  };
  const updateCell = (rowId, field, value) => {
    setEditableRows(prev => prev.map(r => r._id === rowId ? {
      ...r,
      [field]: value
    } : r));
  };
  const addEmptyRow = () => {
    const newRow = {
      _id: Date.now()
    };
    SCALYO_FIELDS.forEach(({
      key
    }) => {
      newRow[key] = "";
    });
    setEditableRows(prev => [...prev, newRow]);
  };
  const removeRow = id => {
    setEditableRows(prev => prev.filter(r => r._id !== id));
  };
  const doImport = async () => {
    const valid = editableRows.filter(r => r.name?.trim());
    if (!valid.length) {
      setErr(T("atLeastOneAccount",lang));
      return;
    }
    setImporting(true);
    let ok = 0;
    for (const row of valid) {
      const payload = {
        company_id: companyId,
        name: row.name.trim(),
        csm: row.csm || "",
        mrr: parseFloat(String(row.mrr).replace(/[^\d.]/g, "")) || 0,
        industry: row.industry || "",
        renewal: row.renewal || "",
        health: parseInt(row.health) || 70,
        risk: parseInt(row.health) >= 70 ? "low" : parseInt(row.health) >= 40 ? "medium" : "critical",
        usage: 70,
        issues: []
      };
      const {
        error
      } = await db.from("accounts").insert(payload);
      if (!error) ok++;
    }
    setImporting(false);
    try { localStorage.removeItem(IMPORT_DRAFT_KEY); } catch(e) {}
    onImport(valid.length, ok);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: step === "preview" ? 920 : 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 28px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 3
    }
  }, step === "upload" ? (lang==="en" ? "⬆ Import a portfolio" : lang==="kr" ? "⬆ 포트폴리오 가져오기" : T("importPortfolio",lang)) : step === "map" ? (lang==="en" ? "🔗 Column mapping" : lang==="kr" ? "🔗 컬럼 매핑" : T("colMapping",lang)) : step === "preview" ? lang==="en" ? "✏️ Review & edit before import" : lang==="kr" ? "✏️ 가져오기 전 검토 및 수정" : T("importVerify",lang) : lang==="en" ? "✅ Import complete" : lang==="kr" ? "✅ 가져오기 완료" : T("importDone",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 6
    }
  }, ["upload", "map", "preview"].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      fontSize: 10,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: step === s ? C.teal : ["upload", "map", "preview"].indexOf(step) > i ? C.green : C.surface,
      color: step === s || ["upload", "map", "preview"].indexOf(step) > i ? "#FFFFFF" : C.muted
    }
  }, ["upload", "map", "preview"].indexOf(step) > i ? "✓" : i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: step === s ? C.teal : C.muted
    }
  }, s === "upload" ? (lang==="en" ? "File" : lang==="kr" ? "파일" : "Fichier") : s === "map" ? "Mapping" : (lang==="en" ? "Edit" : lang==="kr" ? "수정" : "Édition")), i < 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 1,
      background: C.border
    }
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 22,
      cursor: "pointer",
      lineHeight: 1
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 28px 28px"
    }
  }, err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 13,
      color: C.red,
      marginBottom: 14
    }
  }, err), step === "upload" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    onDragOver: e => {
      e.preventDefault();
      e.currentTarget.style.borderColor = C.teal;
    },
    onDragLeave: e => {
      e.currentTarget.style.borderColor = C.border;
    },
    onDrop: e => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
      e.currentTarget.style.borderColor = C.border;
    },
    style: {
      border: `2px dashed ${C.border}`,
      borderRadius: 16,
      padding: "48px 24px",
      textAlign: "center",
      cursor: "pointer",
      transition: "border-color .2s",
      marginBottom: 16
    },
    onClick: () => document.getElementById("imp-file-v5").click()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 44,
      marginBottom: 12
    }
  }, "\uD83D\uDCC2"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      marginBottom: 6
    }
  }, lang==="en" ? "Drop your file here" : lang==="kr" ? "파일을 여기에 드롭하세요" : T("dragFile",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 14
    }
  }, lang==="en" ? "Excel (.xlsx/.xls) or CSV · 50 rows max" : lang==="kr" ? "Excel (.xlsx/.xls) 또는 CSV · 최대 50행" : "Excel (.xlsx/.xls) ou CSV · 50 lignes max"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      padding: "8px 20px",
      borderRadius: 12,
      background: C.tealBg,
      border: `1px solid ${C.tealBorder}`,
      color: C.teal,
      cursor: "pointer"
    }
  }, lang==="kr"?"찾아보기 →":lang==="en"?"Browse →":"Parcourir →"), /*#__PURE__*/React.createElement("input", {
    id: "imp-file-v5",
    type: "file",
    accept: ".xlsx,.xls,.csv",
    style: {
      display: "none"
    },
    onChange: e => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted,
      fontSize: 13
    }
  }, "\u2014 ou \u2014")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setEditableRows([{
        _id: 0,
        name: "",
        csm: "",
        mrr: "",
        industry: "",
        renewal: "",
        health: ""
      }]);
      setStep("preview");
    },
    className: "btn-base",
    style: {
      width: "100%",
      padding: "12px",
      borderRadius: 11,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.text,
      fontSize: 13,
      fontWeight: 700
    }
  }, lang==="en" ? "➕ Add accounts manually" : lang==="kr" ? "➕ 계정 수동 추가" : "➕ Ajouter des comptes manuellement")), step === "map" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 18
    }
  }, T("mapColumnsDesc",lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 20
    }
  }, SCALYO_FIELDS.map(({
    key,
    label,
    required
  }) => /*#__PURE__*/React.createElement("div", {
    key: key,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.red,
      marginLeft: 2
    }
  }, "*")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.faint,
      fontSize: 16
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("select", {
    value: mapping[key] || "",
    onChange: e => setMapping(m => ({
      ...m,
      [key]: e.target.value || undefined
    })),
    style: {
      background: C.surface,
      border: `1px solid ${mapping[key] ? C.tealBorder : C.border}`,
      borderRadius: 12,
      padding: "9px 12px",
      color: mapping[key] ? C.teal : C.muted,
      fontSize: 13,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Laisser vide \u2014"), headers.map(h => /*#__PURE__*/React.createElement("option", {
    key: h,
    value: h
  }, h)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setStep("upload"),
    className: "btn-base",
    style: {
      flex: 1,
      padding: "12px",
      borderRadius: 12,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted,
      fontSize: 13
    }
  }, lang==="en" ? "← Back" : lang==="kr" ? "← 뒤로" : T("resBack",lang)), /*#__PURE__*/React.createElement("button", {
    onClick: buildEditable,
    className: "btn-base",
    style: {
      flex: 2,
      padding: "12px",
      borderRadius: 12,
      background: C.teal,
      color: "#FFFFFF",
      fontSize: 13
    }
  }, lang==="kr"?"미리보기 & 편집 →":lang==="en"?"Preview & edit →":"Prévisualiser & éditer →"))), step === "preview" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, editableRows.length, lang==="kr"?" 계정":lang==="en"?(" account"+(editableRows.length>1?"s":"")):" compte"+(editableRows.length>1?"s":""), " \u2014 ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.text
    }
  }, lang==="en" ? "you can edit everything freely" : lang==="kr" ? "모든 것을 자유롭게 편집할 수 있습니다" : "vous pouvez tout éditer librement"), ""), /*#__PURE__*/React.createElement("button", {
    onClick: addEmptyRow,
    className: "btn-base",
    style: {
      fontSize: 11,
      padding: "6px 14px",
      borderRadius: 20,
      background: C.tealBg,
      border: `1px solid ${C.tealBorder}`,
      color: C.teal,
      flexShrink: 0
    }
  }, lang==="en" ? "+ Add a row" : lang==="kr" ? "+ 행 추가" : T("addLine",lang))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "auto",
      maxHeight: 380,
      borderRadius: 12,
      border: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: C.bg2,
      position: "sticky",
      top: 0,
      zIndex: 2
    }
  }, SCALYO_FIELDS.map(({
    key,
    label
  }) => /*#__PURE__*/React.createElement("th", {
    key: key,
    style: {
      padding: "10px 10px",
      textAlign: "left",
      fontWeight: 700,
      color: C.muted,
      whiteSpace: "nowrap",
      borderBottom: `1px solid ${C.border}`
    }
  }, label)), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "10px 6px",
      width: 32,
      borderBottom: `1px solid ${C.border}`
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, editableRows.map((row, ri) => /*#__PURE__*/React.createElement("tr", {
    key: row._id,
    style: {
      background: ri % 2 === 0 ? C.bg1 : C.bg2,
      borderBottom: `1px solid ${C.border}`
    }
  }, SCALYO_FIELDS.map(({
    key
  }) => /*#__PURE__*/React.createElement("td", {
    key: key,
    style: {
      padding: "4px 6px"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: row[key] || "",
    onChange: e => updateCell(row._id, key, e.target.value),
    placeholder: key === "health" ? "0-100" : key === "mrr" ? "ex: 3500" : "",
    style: {
      width: "100%",
      background: "transparent",
      border: "1px solid transparent",
      borderRadius: 6,
      padding: "6px 8px",
      color: C.text,
      fontSize: 12,
      transition: "border-color .12s"
    },
    onFocus: e => e.target.style.borderColor = C.tealBorder,
    onBlur: e => e.target.style.borderColor = "transparent"
  }))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "4px 6px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => removeRow(row._id),
    style: {
      background: "none",
      border: "none",
      color: C.faint,
      cursor: "pointer",
      fontSize: 14,
      lineHeight: 1,
      padding: 2,
      transition: "color .12s"
    },
    onMouseEnter: e => e.currentTarget.style.color = C.red,
    onMouseLeave: e => e.currentTarget.style.color = C.faint
  }, "\u2715"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: "10px 14px",
      background: C.amberBg,
      border: `1px solid ${C.amberBorder}`,
      borderRadius: 12,
      fontSize: 12,
      color: C.amber
    }
  }, lang==="en" ? "💡 Click any cell to edit freely. Health Score 0-100 (≥70 = Healthy, ≥40 = Watch, <40 = Critical)." : lang==="kr" ? "💡 셀을 클릭하여 자유롭게 편집하세요. 헬스 스코어 0-100 (≥70 = 건강, ≥40 = 주의, <40 = 위험)." : "💡 Cliquez sur n'importe quelle cellule pour la modifier librement. Health Score de 0 à 100 (≥70 = Sain, ≥40 = Vigilance, <40 = Critique)."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 16
    }
  }, rawRows.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setStep("map"),
    className: "btn-base",
    style: {
      flex: 1,
      padding: "12px",
      borderRadius: 12,
      background: C.surface,
      border: `1px solid ${C.border}`,
      color: C.muted,
      fontSize: 13
    }
  }, "\u2190 Mapping"), /*#__PURE__*/React.createElement("button", {
    onClick: doImport,
    disabled: importing || editableRows.filter(r => r.name?.trim()).length === 0,
    className: "btn-base",
    style: {
      flex: 2,
      padding: "12px",
      borderRadius: 11,
      fontSize: 13,
      background: C.teal,
      color: "#FFFFFF"
    }
  }, importing ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: 14,
    color: "#FFFFFF"
  }), lang==="en" ? "Importing..." : lang==="kr" ? "가져오는 중..." : "Import en cours...") : `⬆ Importer ${editableRows.filter(r => r.name?.trim()).length} compte${editableRows.filter(r => r.name?.trim()).length > 1 ? "s" : ""} →`))))));
};

// ══════════════════════════════════════════════════
// DASHBOARD VIEW
// ══════════════════════════════════════════════════
