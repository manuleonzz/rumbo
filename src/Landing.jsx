import React, { useEffect, useRef, useState } from "react";
import {
  Wallet, X, TrendingDown, CalendarX, PiggyBank, Sparkles,
  Github, Sun, ArrowDown,
} from "lucide-react";
import MONEDIN_IMG from "./assets/monedin.png";
import AuthForm from "./AuthForm";
import Reveal from "./lib/Reveal";
import { useScrollProgress } from "./lib/useScrollProgress";

export default function Landing() {
  const progreso = useScrollProgress();
  const [navSolida, setNavSolida] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [scrollYHero, setScrollYHero] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setNavSolida(window.scrollY > 40);
      setScrollYHero(window.scrollY);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const irAlFinal = () => {
    document.getElementById("empezar")?.scrollIntoView({ behavior: "smooth" });
  };

  const alturaHero = heroRef.current?.offsetHeight || 800;
  const avanceHero = Math.min(1, scrollYHero / alturaHero);

  return (
    <div className="rumbo-land-root">
      <style>{LANDING_STYLES}</style>

      <div className="rumbo-land-progress-track">
        <div className="rumbo-land-progress-fill" style={{ width: `${progreso * 100}%` }} />
        <img
          src={MONEDIN_IMG}
          alt=""
          className="rumbo-land-progress-coin"
          style={{ left: `calc(${progreso * 100}% - 12px)` }}
        />
      </div>

      <nav className={`rumbo-land-nav ${navSolida ? "solida" : ""}`}>
        <div className="rumbo-land-nav-brand">
          <img src={MONEDIN_IMG} alt="Monedín" />
          <span>Rumbo</span>
        </div>
        <button className="rumbo-land-nav-btn" onClick={() => setModalAbierto(true)}>
          Iniciar sesión
        </button>
      </nav>

      <section className="rumbo-land-hero" ref={heroRef}>
        <div
          className="rumbo-land-hero-content"
          style={{
            transform: `translateY(${avanceHero * 60}px)`,
            opacity: 1 - avanceHero * 1.15,
          }}
        >
          <img src={MONEDIN_IMG} alt="Monedín, la mascota de Rumbo" className="rumbo-land-hero-img" />
          <h1>
            Tu dinero.
            <br />
            Sin hojas de cálculo.
            <br />
            Sin caos.
          </h1>
          <p>Rumbo convierte gestionar tus gastos en algo que de verdad te apetece abrir cada semana.</p>
          <button className="rumbo-land-cta-primary" onClick={irAlFinal}>
            Empieza tu rumbo
          </button>
        </div>
        <div className="rumbo-land-scroll-cue" style={{ opacity: 1 - avanceHero * 3 }}>
          <ArrowDown size={18} />
          <span>Baja para ver cómo funciona</span>
        </div>
      </section>

      <section className="rumbo-land-section clara">
        <div className="rumbo-land-container">
          <Reveal as="div" className="rumbo-land-eyebrow">EL PROBLEMA</Reveal>
          <Reveal as="h2" delay={60}>
            Las hojas de cálculo no fueron pensadas para tu vida real
          </Reveal>
          <div className="rumbo-land-cards">
            <Reveal delay={100} className="rumbo-land-card">
              <TrendingDown size={22} />
              <h3>Números por todos lados</h3>
              <p>Filas y columnas que no te dicen si vas bien o mal este mes, solo datos sueltos.</p>
            </Reveal>
            <Reveal delay={200} className="rumbo-land-card">
              <CalendarX size={22} />
              <h3>Se te olvida apuntarlo</h3>
              <p>Un gasto que no anotas a tiempo es un gasto que desaparece de tu control real.</p>
            </Reveal>
            <Reveal delay={300} className="rumbo-land-card">
              <PiggyBank size={22} />
              <h3>El ahorro, para "el mes que viene"</h3>
              <p>Sin un hábito semanal, ahorrar se queda siempre en una buena intención.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="rumbo-land-section oscura">
        <div className="rumbo-land-container">
          <Reveal as="div" className="rumbo-land-eyebrow clara">LA SOLUCIÓN</Reveal>
          <Reveal as="h2" delay={60} className="clara">
            Así de simple se ve tu mes con Rumbo
          </Reveal>
          <Reveal delay={150} className="rumbo-land-sub clara">
            Fijas lo que esperas gastar, marcas lo que gastas de verdad, y Rumbo te dice cómo vas —
            con una carita, no con una tabla.
          </Reveal>

          <Reveal delay={250} className="rumbo-land-mock">
            <div className="rumbo-land-mock-row">
              <div className="rumbo-land-mock-pill verde">😄 Bien</div>
              <div className="rumbo-land-mock-pill ambar">😬 Cerca</div>
              <div className="rumbo-land-mock-pill rojo">😟 Te pasaste</div>
            </div>
            <div className="rumbo-land-mock-ring">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="#1c3157" strokeWidth="9" />
                <circle
                  cx="45"
                  cy="45"
                  r="38"
                  fill="none"
                  stroke="#3aa0e8"
                  strokeWidth="9"
                  strokeDasharray={239}
                  strokeDashoffset={239 * 0.35}
                  strokeLinecap="round"
                  transform="rotate(-90 45 45)"
                />
              </svg>
              <div className="rumbo-land-mock-ring-txt">65%<span>gastado</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="rumbo-land-section clara">
        <div className="rumbo-land-container">
          <Reveal as="div" className="rumbo-land-eyebrow">EL JUEGO</Reveal>
          <Reveal as="h2" delay={60}>
            Esto no es una tarea. Es un juego.
          </Reveal>
          <Reveal delay={150} className="rumbo-land-sub">
            Cada previsto que fijas, cada gasto que marcas, cada domingo que ahorras: todo suma XP,
            sube tu nivel, y desbloquea medallas de verdad.
          </Reveal>

          <Reveal delay={250} className="rumbo-land-xp-demo">
            <div className="rumbo-land-xp-top">
              <span>🌿 Nivel 2 · Ahorrador constante</span>
              <span>85 XP</span>
            </div>
            <div className="rumbo-land-xp-bar">
              <div className="rumbo-land-xp-bar-fill" />
            </div>
          </Reveal>

          <div className="rumbo-land-medals">
            {["🎯", "💶", "🐷", "🔥", "🏁"].map((m, i) => (
              <Reveal key={i} delay={300 + i * 90} className="rumbo-land-medal">
                {m}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="rumbo-land-section oscura">
        <div className="rumbo-land-container angosto">
          <Reveal as="div" className="rumbo-land-eyebrow clara">EL PROYECTO</Reveal>
          <Reveal as="h2" delay={60} className="clara">
            Hecho con IA. Abierto para cualquiera.
          </Reveal>
          <Reveal delay={150} className="rumbo-land-sub clara">
            Rumbo nació como un proyecto personal, construido con ayuda de IA de principio a fin. Es
            de código abierto: cualquiera puede usarlo, revisarlo o mejorarlo.
          </Reveal>
          <Reveal delay={220} className="rumbo-land-badges">
            <span><Sparkles size={14} /> Hecho con IA</span>
            <span><Github size={14} /> Código abierto</span>
            <span><Sun size={14} /> Gratis de usar</span>
          </Reveal>
        </div>
      </section>

      <section className="rumbo-land-section final" id="empezar">
        <div className="rumbo-land-final-confetti" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={`rumbo-land-confetti c${i % 8}`} />
          ))}
        </div>
        <div className="rumbo-land-container angosto">
          <Reveal>
            <img src={MONEDIN_IMG} alt="" className="rumbo-land-final-img" />
            <h2>Empieza tu rumbo</h2>
            <p className="rumbo-land-sub">
              Crea tu cuenta gratis. Tus datos te siguen entre el ordenador y el móvil.
            </p>
          </Reveal>
          <Reveal delay={120} className="rumbo-land-final-card">
            <AuthForm defaultMode="crear" />
          </Reveal>
        </div>
      </section>

      <footer className="rumbo-land-footer">
        <Wallet size={14} /> Rumbo — un proyecto personal, hecho con IA
      </footer>

      {modalAbierto && (
        <div className="rumbo-overlay" onClick={() => setModalAbierto(false)}>
          <div className="rumbo-land-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rumbo-land-modal-close" onClick={() => setModalAbierto(false)}>
              <X size={18} />
            </button>
            <img src={MONEDIN_IMG} alt="Monedín" className="rumbo-auth-img" />
            <div className="rumbo-auth-title">Rumbo</div>
            <div className="rumbo-auth-sub">Entra para ver tu presupuesto</div>
            <AuthForm defaultMode="entrar" />
          </div>
        </div>
      )}
    </div>
  );
}

const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  .rumbo-land-root {
    --l-navy: #0b2545;
    --l-navy-deep: #071633;
    --l-sky: #3aa0e8;
    --l-sky-bright: #6fd0ff;
    --l-gold: #ffcb47;
    --l-cream: #f6f9fc;
    --l-coral: #ff6b5e;
    --l-green: #2fb380;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--l-cream);
    color: var(--l-navy);
    overflow-x: hidden;
  }
  .rumbo-land-root * { box-sizing: border-box; }
  .rumbo-land-root h1, .rumbo-land-root h2 { font-family: 'Sora', sans-serif; }
  .rumbo-land-root button:focus-visible, .rumbo-land-root input:focus-visible { outline: 2px solid var(--l-sky); outline-offset: 2px; }

  .rumbo-land-progress-track { position: fixed; top: 0; left: 0; right: 0; height: 4px; background: rgba(11,37,69,0.08); z-index: 60; }
  .rumbo-land-progress-fill { height: 100%; background: linear-gradient(90deg, var(--l-sky), var(--l-gold)); transition: width .05s linear; }
  .rumbo-land-progress-coin { position: absolute; top: -10px; width: 24px; height: 24px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(11,37,69,0.3)); transition: left .05s linear; }

  .rumbo-land-nav { position: fixed; top: 4px; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; transition: background .25s ease, box-shadow .25s ease; }
  .rumbo-land-nav.solida { background: rgba(246,249,252,0.9); backdrop-filter: blur(8px); box-shadow: 0 2px 12px rgba(11,37,69,0.06); }
  .rumbo-land-nav-brand { display: flex; align-items: center; gap: 8px; font-family: 'Sora', sans-serif; font-weight: 800; font-size: 17px; color: var(--l-navy); }
  .rumbo-land-nav-brand img { width: 30px; height: 30px; object-fit: contain; }
  .rumbo-land-nav-btn { border: none; background: var(--l-navy); color: white; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 999px; cursor: pointer; font-family: inherit; }
  .rumbo-land-nav-btn:hover { background: var(--l-sky); }

  .rumbo-land-hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 50% 20%, #10285a 0%, var(--l-navy-deep) 65%); text-align: center; padding: 100px 20px 60px; }
  .rumbo-land-hero-content { max-width: 640px; display: flex; flex-direction: column; align-items: center; will-change: transform, opacity; }
  .rumbo-land-hero-img { height: 150px; margin-bottom: 20px; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.35)); animation: rumbo-land-float 4s ease-in-out infinite; }
  @keyframes rumbo-land-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  .rumbo-land-hero h1 { font-size: clamp(30px, 5.5vw, 52px); font-weight: 800; color: white; line-height: 1.15; margin: 0 0 16px; letter-spacing: -0.01em; }
  .rumbo-land-hero p { font-size: 16px; color: #b9c8de; margin: 0 0 28px; max-width: 460px; }
  .rumbo-land-cta-primary { border: none; background: var(--l-sky); color: white; font-weight: 700; font-size: 15px; padding: 15px 30px; border-radius: 999px; cursor: pointer; font-family: inherit; box-shadow: 0 10px 30px rgba(58,160,232,0.35); }
  .rumbo-land-cta-primary:hover { background: var(--l-sky-bright); }
  .rumbo-land-scroll-cue { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 4px; color: #7f93b3; font-size: 11.5px; animation: rumbo-land-bounce 1.6s ease-in-out infinite; }
  @keyframes rumbo-land-bounce { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 8px); } }

  .rumbo-land-section { padding: 100px 20px; position: relative; }
  .rumbo-land-section.clara { background: var(--l-cream); }
  .rumbo-land-section.oscura { background: var(--l-navy-deep); }
  .rumbo-land-container { max-width: 920px; margin: 0 auto; }
  .rumbo-land-container.angosto { max-width: 640px; text-align: center; }

  .rumbo-land-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; color: var(--l-sky); margin-bottom: 10px; }
  .rumbo-land-eyebrow.clara { color: var(--l-sky-bright); }
  .rumbo-land-section h2 { font-size: clamp(24px, 3.4vw, 34px); font-weight: 800; margin: 0 0 16px; line-height: 1.25; max-width: 620px; }
  .rumbo-land-section h2.clara { color: white; }
  .rumbo-land-sub { font-size: 15px; color: #4c6584; max-width: 560px; margin: 0 0 30px; line-height: 1.6; }
  .rumbo-land-sub.clara { color: #b9c8de; }

  .rumbo-land-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-top: 30px; }
  .rumbo-land-card { background: white; border: 1px solid #e9eef3; border-radius: 20px; padding: 26px 22px; color: var(--l-coral); box-shadow: 0 4px 16px rgba(11,37,69,0.04); }
  .rumbo-land-card h3 { font-family: 'Sora', sans-serif; font-size: 16px; color: var(--l-navy); margin: 14px 0 8px; }
  .rumbo-land-card p { font-size: 13.5px; color: #4c6584; line-height: 1.5; margin: 0; }

  .rumbo-land-mock { background: #0e1f42; border: 1px solid #1c3157; border-radius: 24px; padding: 30px; max-width: 420px; display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .rumbo-land-mock-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .rumbo-land-mock-pill { font-size: 12.5px; font-weight: 700; padding: 7px 12px; border-radius: 999px; }
  .rumbo-land-mock-pill.verde { background: rgba(47,179,128,0.18); color: #6be3b0; }
  .rumbo-land-mock-pill.ambar { background: rgba(255,203,71,0.18); color: var(--l-gold); }
  .rumbo-land-mock-pill.rojo { background: rgba(255,107,94,0.18); color: #ff9a90; }
  .rumbo-land-mock-ring { position: relative; display: flex; align-items: center; justify-content: center; }
  .rumbo-land-mock-ring-txt { position: absolute; text-align: center; font-family: 'Sora', sans-serif; font-weight: 800; font-size: 17px; color: white; }
  .rumbo-land-mock-ring-txt span { display: block; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 9px; color: #7f93b3; }

  .rumbo-land-xp-demo { background: white; border: 1px solid #e9eef3; border-radius: 18px; padding: 18px 20px; max-width: 420px; box-shadow: 0 4px 16px rgba(11,37,69,0.04); }
  .rumbo-land-xp-top { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; color: var(--l-navy); margin-bottom: 8px; }
  .rumbo-land-xp-bar { height: 8px; border-radius: 6px; background: #e9eef3; overflow: hidden; }
  .rumbo-land-xp-bar-fill { height: 100%; width: 0%; background: var(--l-sky); border-radius: 6px; transition: width 1.2s ease .3s; }
  .rumbo-reveal-visible .rumbo-land-xp-bar-fill { width: 62%; }

  .rumbo-land-medals { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
  .rumbo-land-medal { width: 52px; height: 52px; border-radius: 14px; background: white; border: 1px solid #e9eef3; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(11,37,69,0.05); }

  .rumbo-land-badges { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .rumbo-land-badges span { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #d7e3f2; font-size: 12.5px; font-weight: 600; padding: 8px 14px; border-radius: 999px; }

  .rumbo-land-section.final { background: linear-gradient(180deg, #fff8ea 0%, var(--l-cream) 55%); text-align: center; overflow: hidden; }
  .rumbo-land-final-img { height: 90px; margin-bottom: 10px; }
  .rumbo-land-section.final h2 { margin-left: auto; margin-right: auto; }
  .rumbo-land-final-card { background: white; border-radius: 24px; padding: 30px 28px; max-width: 340px; margin: 20px auto 0; box-shadow: 0 20px 60px rgba(11,37,69,0.12); text-align: left; }

  .rumbo-land-final-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .rumbo-land-confetti { position: absolute; top: -10px; width: 7px; height: 12px; border-radius: 2px; animation: rumbo-land-fall 4.5s linear infinite; }
  .rumbo-land-confetti.c0 { left: 5%; background: var(--l-sky); animation-delay: 0s; }
  .rumbo-land-confetti.c1 { left: 15%; background: var(--l-gold); animation-delay: .6s; }
  .rumbo-land-confetti.c2 { left: 28%; background: var(--l-green); animation-delay: 1.2s; }
  .rumbo-land-confetti.c3 { left: 40%; background: var(--l-coral); animation-delay: .3s; }
  .rumbo-land-confetti.c4 { left: 55%; background: var(--l-sky); animation-delay: 1.8s; }
  .rumbo-land-confetti.c5 { left: 68%; background: var(--l-gold); animation-delay: .9s; }
  .rumbo-land-confetti.c6 { left: 80%; background: var(--l-green); animation-delay: 1.5s; }
  .rumbo-land-confetti.c7 { left: 92%; background: var(--l-coral); animation-delay: 2.1s; }
  @keyframes rumbo-land-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 100% { transform: translateY(600px) rotate(360deg); opacity: 0; } }

  .rumbo-land-footer { text-align: center; padding: 26px; font-size: 12px; color: #9aa5b1; display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--l-cream); }

  .rumbo-reveal { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }
  .rumbo-reveal-visible { opacity: 1; transform: translateY(0); }

  .rumbo-overlay { position: fixed; inset: 0; background: rgba(11,37,69,0.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 70; padding: 20px; }
  .rumbo-land-modal { position: relative; background: white; border-radius: 24px; padding: 34px 28px 28px; max-width: 340px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(11,37,69,0.25); }
  .rumbo-land-modal-close { position: absolute; top: 14px; right: 14px; border: none; background: #f1f3f6; color: #4c6584; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .rumbo-land-modal-close:hover { background: #e9eef3; }

  @media (max-width: 640px) {
    .rumbo-land-section { padding: 70px 18px; }
    .rumbo-land-hero { padding-top: 90px; }
    .rumbo-land-nav { padding: 12px 16px; }
  }

  .rumbo-auth-img { height: 70px; margin: 0 auto 10px; display: block; }
  .rumbo-auth-title { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: var(--l-navy); text-align: center; }
  .rumbo-auth-sub { font-size: 13px; color: #4c6584; margin-top: 4px; margin-bottom: 20px; text-align: center; }
  .rumbo-auth-form { display: flex; flex-direction: column; gap: 10px; }
  .rumbo-auth-form input { width: 100%; border: 1px solid #e9eef3; border-radius: 12px; padding: 12px 14px; font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box; }
  .rumbo-auth-form input:focus { border-color: var(--l-sky); }
  .rumbo-auth-form button[type=submit] { margin-top: 6px; border: none; background: var(--l-navy); color: white; font-weight: 700; font-size: 14px; padding: 12px; border-radius: 12px; cursor: pointer; font-family: inherit; }
  .rumbo-auth-form button[type=submit]:hover { background: var(--l-sky); }
  .rumbo-auth-form button[type=submit]:disabled { opacity: 0.6; cursor: default; }
  .rumbo-auth-error { color: var(--l-coral); font-size: 12.5px; text-align: left; }
  .rumbo-auth-aviso { color: var(--l-green); font-size: 12.5px; text-align: left; }
  .rumbo-auth-switch { margin-top: 16px; font-size: 12.5px; color: #4c6584; text-align: center; }
  .rumbo-auth-switch span { color: var(--l-sky); font-weight: 700; cursor: pointer; text-decoration: underline; }

  .rumbo-auth-pw-wrap { position: relative; }
  .rumbo-auth-pw-wrap input { padding-right: 40px; }
  .rumbo-auth-eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #4c6584; cursor: pointer; padding: 6px; display: flex; align-items: center; }
  .rumbo-auth-eye:hover { color: var(--l-sky); }

  .rumbo-auth-fuerza { text-align: left; margin-top: -2px; }
  .rumbo-auth-fuerza-barras { display: flex; gap: 4px; }
  .rumbo-auth-fuerza-seg { flex: 1; height: 5px; border-radius: 3px; transition: background .2s ease; }
  .rumbo-auth-fuerza-txt { font-size: 11px; font-weight: 700; margin-top: 4px; }
  .rumbo-auth-requisitos { display: flex; flex-wrap: wrap; gap: 6px 10px; margin-top: 6px; }
  .rumbo-auth-req { display: flex; align-items: center; gap: 3px; font-size: 10.5px; color: #b7c0cb; }
  .rumbo-auth-req.ok { color: var(--l-green); }

  .rumbo-auth-match { display: flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 600; text-align: left; }
  .rumbo-auth-match.ok { color: var(--l-green); }
  .rumbo-auth-match.no { color: #ff9f43; }

  @media (prefers-reduced-motion: reduce) {
    .rumbo-land-hero-img, .rumbo-land-scroll-cue, .rumbo-land-confetti { animation: none !important; }
  }
`;
