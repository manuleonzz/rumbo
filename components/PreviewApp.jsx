"use client";

import React, { useEffect, useRef, useState } from "react";
import Landing from "./Landing";
import DemoDashboard from "./DemoDashboard";
import { useAuth } from "../src/lib/AuthContext";
import { CloudDataProvider, useCloudData } from "../src/lib/CloudDataContext";

function LoadingScreen({ language = "es" }) {
  return <div className="rumbo-loading"><span className="rumbo-loading-mark">R</span><b>Rumbo</b><small>{language === "en" ? "Preparing your space…" : "Preparando tu espacio…"}</small></div>;
}

function SyncErrorScreen({ language = "es", onRetry, onHome }) {
  return <div className="rumbo-loading rumbo-sync-error"><span className="rumbo-loading-mark">!</span><b>{language === "en" ? "We couldn't load your data" : "No pudimos cargar tus datos"}</b><small>{language === "en" ? "Your setup has not been reset. Check the connection and try again." : "Tu configuración no se ha reiniciado. Comprueba la conexión e inténtalo otra vez."}</small><div><button onClick={onRetry}>{language === "en" ? "Try again" : "Reintentar"}</button><button onClick={onHome}>{language === "en" ? "Back to home" : "Volver a la portada"}</button></div></div>;
}

function ConnectedDashboard({ settings, onHome }) {
  const cloudData = useCloudData();
  const { user, signOut } = useAuth();

  if (cloudData.cache === null) return <LoadingScreen language={settings.language} />;
  if (cloudData.error && !cloudData.cache?.rumbo_v2) return <SyncErrorScreen language={settings.language} onRetry={cloudData.reload} onHome={onHome} />;

  return <DemoDashboard
    onExit={onHome}
    settings={settings}
    cloudData={cloudData}
    user={user}
    onSignOut={signOut}
  />;
}

export default function PreviewApp() {
  const { user, cargandoSesion, signOut } = useAuth();
  const [screen, setScreen] = useState("landing");
  const previousUser = useRef(undefined);
  const [theme, setTheme] = useState(() => localStorage.getItem("rumbo-theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("rumbo-language") || "es");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    localStorage.setItem("rumbo-theme", theme);
    localStorage.setItem("rumbo-language", language);
  }, [theme, language]);

  useEffect(() => {
    if (cargandoSesion) return;
    // Una sesión que ya estaba guardada no debe saltarse la portada al abrir
    // el enlace público. Solo avanzamos automáticamente cuando el usuario
    // acaba de iniciar sesión desde la propia portada.
    if (previousUser.current === null && user) setScreen("app");
    if (previousUser.current && !user) setScreen("landing");
    previousUser.current = user;
  }, [cargandoSesion, user?.id]);

  const settings = {
    theme,
    language,
    onTheme: () => setTheme((value) => value === "dark" ? "light" : "dark"),
    onLanguage: setLanguage,
  };

  if (cargandoSesion) return <LoadingScreen language={language} />;
  if (screen === "demo") return <DemoDashboard onExit={() => setScreen("landing")} settings={settings} />;
  if (screen === "app" && user) {
    return <CloudDataProvider><ConnectedDashboard settings={settings} onHome={() => setScreen("landing")} /></CloudDataProvider>;
  }

  return <Landing
    onDemo={() => setScreen("demo")}
    onAccount={() => setScreen("app")}
    onSignOut={signOut}
    user={user}
    settings={settings}
  />;
}
