"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Github,
  Menu,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import AuthForm from "./AuthForm";
import AppControls from "./AppControls";

const MONEDIN_IMG = `${import.meta.env.BASE_URL}monedin.png`;

const landingCopy = {
  es: {
    how: "Cómo funciona", open: "Código abierto", login: "Iniciar sesión", create: "Crear cuenta",
    kicker: "Finanzas personales, sin complicaciones", titleA: "Tu dinero necesita un ", titleB: "rumbo", titleC: ", no otra tabla.",
    intro: "Planifica tu mes, registra lo que gastas y descubre cuánto puedes ahorrar. Todo en una experiencia sencilla que sí apetece usar.", demo: "Probar la demo", createMine: "Crear mi cuenta", free: "Gratis", noCard: "Sin tarjeta",
    good: "¡Buen trabajo!", ahead: "Este mes vas por delante de tu meta.", available: "DISPONIBLE ESTE MES", month: "Julio", income: "Ingresos", expenses: "Gastos", saving: "Ahorro", budgetUsed: "Presupuesto usado",
    kinder: "UNA FORMA MÁS AMABLE DE ORGANIZARTE", minute: "para actualizar tu semana", openFree: "gratuito y abierto", onePlace: "para todo tu mes",
    real: "HECHO PARA LA VIDA REAL", less: "Menos tiempo apuntando.", clarity: "Más claridad para decidir.", loose: "Rumbo convierte números sueltos en respuestas fáciles de entender.",
    benefits: [
      [BarChart3, "Entiende tu mes de un vistazo", "Ingresos, gastos y ahorro explicados con claridad, sin pelearte con una hoja de cálculo."],
      [MousePointer2, "Actualiza todo en segundos", "Registra un movimiento y Rumbo recalcula automáticamente tu presupuesto y tus objetivos."],
      [ShieldCheck, "Tus números siguen siendo tuyos", "Tu cuenta se sincroniza de forma segura y el proyecto permanece abierto y transparente."],
    ],
    public: "Construido en público", personal: "Una herramienta personal.", everyone: "Un proyecto de todos.", openText: "Rumbo nació para resolver un problema cotidiano y crece como proyecto de código libre. Puedes usarlo, estudiar cómo funciona y aportar nuevas ideas.", appOpen: "Una app abierta para entender\ntu dinero sin complicarte.", monthly: "Presupuesto mensual", weekly: "Gastos semanales", goals: "Metas de ahorro",
    today: "EMPIEZA HOY", lighter: "Tu próximo mes puede sentirse mucho más ligero.", finalText: "Crea tu cuenta gratis o explora primero la demo con datos ficticios.", interactive: "Ver demo interactiva", sync: "Tus datos se sincronizan entre ordenador y móvil.", earth: "Finanzas personales con los pies en la tierra.", project: "Proyecto abierto · 2026", welcome: "Qué bueno verte", continue: "Entra para continuar con tu presupuesto.",
  },
  en: {
    how: "How it works", open: "Open source", login: "Sign in", create: "Create account",
    kicker: "Personal finance, made simple", titleA: "Your money needs a ", titleB: "direction", titleC: ", not another spreadsheet.",
    intro: "Plan your month, record your spending and discover how much you can save. All in a simple experience you'll actually enjoy using.", demo: "Try the demo", createMine: "Create my account", free: "Free", noCard: "No card required",
    good: "Great job!", ahead: "You are ahead of your goal this month.", available: "AVAILABLE THIS MONTH", month: "July", income: "Income", expenses: "Expenses", saving: "Savings", budgetUsed: "Budget used",
    kinder: "A KINDER WAY TO GET ORGANISED", minute: "to update your week", openFree: "free and open", onePlace: "for your whole month",
    real: "BUILT FOR REAL LIFE", less: "Less time entering numbers.", clarity: "More clarity to decide.", loose: "Rumbo turns scattered numbers into answers that are easy to understand.",
    benefits: [
      [BarChart3, "Understand your month at a glance", "Income, spending and savings explained clearly, without wrestling with a spreadsheet."],
      [MousePointer2, "Update everything in seconds", "Add a transaction and Rumbo automatically recalculates your budget and goals."],
      [ShieldCheck, "Your numbers stay yours", "Your account syncs securely while the project remains open and transparent."],
    ],
    public: "Built in public", personal: "A personal tool.", everyone: "A project for everyone.", openText: "Rumbo was born to solve an everyday problem and grows as an open-source project. Use it, learn how it works and contribute new ideas.", appOpen: "An open app to understand\nyour money without the hassle.", monthly: "Monthly budget", weekly: "Weekly spending", goals: "Savings goals",
    today: "START TODAY", lighter: "Your next month can feel much lighter.", finalText: "Create your free account or explore the demo first with sample data.", interactive: "View interactive demo", sync: "Your data syncs across desktop and mobile.", earth: "Personal finance grounded in real life.", project: "Open project · 2026", welcome: "Good to see you", continue: "Sign in to continue with your budget.",
  },
};

export default function Landing({ onDemo, onAccount, user = null, settings }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const c = landingCopy[settings.language];
  const authenticated = Boolean(user);
  const accountLabel = settings.language === "en" ? "My dashboard" : "Mi panel";
  const openLabel = settings.language === "en" ? "Open Rumbo" : "Abrir Rumbo";

  const abrirRegistro = () => {
    setMenuAbierto(false);
    if (authenticated) {
      onAccount?.();
      return;
    }
    document.getElementById("empezar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-v2">
      <header className="landing-nav">
        <a className="landing-brand" href="#inicio" aria-label="Rumbo, inicio">
          <span className="landing-brand-mark"><img src={MONEDIN_IMG} alt="" /></span>
          <span>Rumbo</span>
        </a>

        <nav className={menuAbierto ? "landing-links abierto" : "landing-links"}>
          <a href="#como-funciona" onClick={() => setMenuAbierto(false)}>{c.how}</a>
          <a href="#codigo-abierto" onClick={() => setMenuAbierto(false)}>{c.open}</a>
          <button className="landing-link-button" onClick={() => authenticated ? onAccount?.() : setModalAbierto(true)}>{authenticated ? accountLabel : c.login}</button>
          <button className="landing-nav-cta" onClick={abrirRegistro}>{authenticated ? openLabel : c.create}</button>
        </nav>

        <AppControls {...settings} />

        <button className="landing-menu" onClick={() => setMenuAbierto((v) => !v)} aria-label="Abrir menú">
          {menuAbierto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section className="landing-hero" id="inicio">
          <div className="landing-orb landing-orb-a" />
          <div className="landing-orb landing-orb-b" />
          <div className="landing-hero-copy">
            <div className="landing-kicker"><Sparkles size={14} /> {c.kicker}</div>
            <h1>{c.titleA}<em>{c.titleB}</em>{c.titleC}</h1>
            <p>{c.intro}</p>
            <div className="landing-actions">
              <button className="landing-primary" onClick={onDemo}>
                {c.demo} <ArrowRight size={17} />
              </button>
              <button className="landing-secondary" onClick={abrirRegistro}>{authenticated ? accountLabel : c.createMine}</button>
            </div>
            <div className="landing-trust">
              <span><CheckCircle2 size={15} /> {c.free}</span>
              <span><CheckCircle2 size={15} /> {c.open}</span>
              <span><CheckCircle2 size={15} /> {c.noCard}</span>
            </div>
          </div>

          <div className="landing-product-wrap" aria-label="Vista previa del panel de Rumbo">
            <div className="landing-float-note">
              <img src={MONEDIN_IMG} alt="Monedín" />
              <span><b>{c.good}</b> {c.ahead}</span>
            </div>
            <div className="landing-product">
              <div className="product-top">
                <div>
                  <span className="product-eyebrow">{c.available}</span>
                  <strong>€1.284,50</strong>
                </div>
                <span className="product-chip">{c.month}</span>
              </div>
              <div className="product-stats">
                <div><span>{c.income}</span><b className="positive">+ €2.640</b></div>
                <div><span>{c.expenses}</span><b>− €1.355,50</b></div>
                <div><span>{c.saving}</span><b>€420</b></div>
              </div>
              <div className="product-chart">
                {[48, 62, 43, 79, 58, 88, 72, 96].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} className={i === 7 ? "actual" : ""} />
                ))}
              </div>
              <div className="product-budget">
                <span>{c.budgetUsed}</span><b>68%</b>
                <div><i /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-proof">
          <span>{c.kinder}</span>
          <div><b>1 {settings.language === "es" ? "minuto" : "minute"}</b> {c.minute}</div>
          <div><b>100%</b> {c.openFree}</div>
          <div><b>1 {settings.language === "es" ? "lugar" : "place"}</b> {c.onePlace}</div>
        </section>

        <section className="landing-section" id="como-funciona">
          <div className="landing-section-heading">
            <span>{c.real}</span>
            <h2>{c.less}<br />{c.clarity}</h2>
            <p>{c.loose}</p>
          </div>
          <div className="landing-benefits">
            {c.benefits.map(([Icono, titulo, texto], i) => (
              <article key={titulo}>
                <div className="benefit-number">0{i + 1}</div>
                <span className="benefit-icon"><Icono size={22} /></span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-open" id="codigo-abierto">
          <div className="landing-open-copy">
            <span className="landing-kicker dark"><Github size={15} /> {c.public}</span>
            <h2>{c.personal}<br />{c.everyone}</h2>
            <p>{c.openText}</p>
            <div className="landing-open-pills">
              <span>React + Vite</span><span>Supabase</span><span>Open source</span>
            </div>
          </div>
          <div className="landing-code-card">
            <div className="code-card-top"><span /><span /><span /><b>rumbo / README.md</b></div>
            <pre><code><span># Rumbo</span>{"\n\n"}{c.appOpen}{"\n\n"}<em>✓</em> {c.monthly}{"\n"}<em>✓</em> {c.weekly}{"\n"}<em>✓</em> {c.goals}</code></pre>
          </div>
        </section>

        <section className="landing-final" id="empezar">
          <div className="landing-final-copy">
            <img src={MONEDIN_IMG} alt="Monedín" />
            <span>{c.today}</span>
            <h2>{c.lighter}</h2>
            <p>{c.finalText}</p>
            <button className="landing-secondary light" onClick={onDemo}>{c.interactive}</button>
          </div>
          <div className="landing-signup-card">
            <div className="signup-icon"><WalletCards size={22} /></div>
            {authenticated ? <>
              <h3>{settings.language === "en" ? "Your session is ready" : "Tu sesión está preparada"}</h3>
              <p>{settings.language === "en" ? `Signed in as ${user.email}. Continue with your real finances.` : `Has iniciado sesión como ${user.email}. Continúa con tus finanzas reales.`}</p>
              <button className="landing-account-button" onClick={onAccount}>{openLabel} <ArrowRight size={17} /></button>
            </> : <>
              <h3>{c.create}</h3>
              <p>{c.sync}</p>
              <AuthForm defaultMode="crear" language={settings.language} />
            </>}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-brand"><span className="landing-brand-mark small"><img src={MONEDIN_IMG} alt="" /></span><span>Rumbo</span></div>
        <p>{c.earth}</p>
        <span>{c.project}</span>
      </footer>

      {modalAbierto && !authenticated && (
        <div className="landing-modal-backdrop" onMouseDown={() => setModalAbierto(false)}>
          <div className="landing-login-card" onMouseDown={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setModalAbierto(false)}><X size={18} /></button>
            <img src={MONEDIN_IMG} alt="Monedín" />
            <h2>{c.welcome}</h2>
            <p>{c.continue}</p>
            <AuthForm defaultMode="entrar" language={settings.language} />
          </div>
        </div>
      )}
    </div>
  );
}
