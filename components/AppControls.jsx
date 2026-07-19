"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Moon, Sun } from "lucide-react";

export default function AppControls({ theme, language, onTheme, onLanguage, compact = false }) {
  const [open, setOpen] = useState(false);
  return <div className={compact ? "app-controls compact" : "app-controls"}>
    <button className="app-theme-toggle" onClick={onTheme} aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"} title={theme === "dark" ? "Modo claro" : "Modo oscuro"}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
    <div className="app-language-wrap">
      <button className="app-language-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={language === "es" ? "Cambiar idioma" : "Change language"}><span className="app-flag">{language === "es" ? <SpainFlag /> : <UkFlag />}</span><b>{language.toUpperCase()}</b><ChevronDown size={14} /></button>
      {open && <div className="app-language-menu" role="menu">
        <button className={language === "es" ? "activo" : ""} onClick={() => { onLanguage("es"); setOpen(false); }}><span className="app-flag large"><SpainFlag /></span><div><b>Español</b><small>{language === "es" ? "Idioma actual" : "Spanish"}</small></div>{language === "es" && <Check size={14} />}</button>
        <button className={language === "en" ? "activo" : ""} onClick={() => { onLanguage("en"); setOpen(false); }}><span className="app-flag large"><UkFlag /></span><div><b>English</b><small>{language === "en" ? "Current language" : "International"}</small></div>{language === "en" && <Check size={14} />}</button>
      </div>}
    </div>
  </div>;
}

function SpainFlag() {
  return <svg viewBox="0 0 30 20" preserveAspectRatio="none" aria-hidden="true"><rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/><circle cx="9" cy="10" r="2" fill="#AA151B" opacity=".9"/></svg>;
}

function UkFlag() {
  return <svg viewBox="0 0 30 20" preserveAspectRatio="none" aria-hidden="true"><rect width="30" height="20" fill="#012169"/><path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4"/><path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="2"/><path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6"/><path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.2"/></svg>;
}
