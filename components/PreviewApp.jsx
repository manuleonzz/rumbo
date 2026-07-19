"use client";

import React, { useEffect, useState } from "react";
import Landing from "./Landing";
import DemoDashboard from "./DemoDashboard";
import { useAuth } from "../src/lib/AuthContext";
import { CloudDataProvider, useCloudData } from "../src/lib/CloudDataContext";

function LoadingScreen({ language = "es" }) {
  return <div className="rumbo-loading"><span className="rumbo-loading-mark">R</span><b>Rumbo</b><small>{language === "en" ? "Preparing your space…" : "Preparando tu espacio…"}</small></div>;
}

function ConnectedDashboard({ settings, onHome }) {
  const cloudData = useCloudData();
  const { user, signOut } = useAuth();

  if (cloudData.cache === null) return <LoadingScreen language={settings.language} />;

  return <DemoDashboard
    onExit={onHome}
    settings={settings}
    cloudData={cloudData}
    user={user}
    onSignOut={signOut}
  />;
}

export default function PreviewApp() {
  const { user, cargandoSesion } = useAuth();
  const [demo, setDemo] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("rumbo-theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("rumbo-language") || "es");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    localStorage.setItem("rumbo-theme", theme);
    localStorage.setItem("rumbo-language", language);
  }, [theme, language]);

  useEffect(() => {
    if (user) {
      setDemo(false);
      setShowLanding(false);
    }
  }, [user?.id]);

  const settings = {
    theme,
    language,
    onTheme: () => setTheme((value) => value === "dark" ? "light" : "dark"),
    onLanguage: setLanguage,
  };

  if (cargandoSesion) return <LoadingScreen language={language} />;
  if (demo) return <DemoDashboard onExit={() => setDemo(false)} settings={settings} />;
  if (user && !showLanding) {
    return <CloudDataProvider><ConnectedDashboard settings={settings} onHome={() => setShowLanding(true)} /></CloudDataProvider>;
  }

  return <Landing onDemo={() => setDemo(true)} settings={settings} />;
}
