import React from "react";
import { useAuth } from "./lib/AuthContext";
import { CloudDataProvider, useCloudData } from "./lib/CloudDataContext";
import App from "./App";
import Landing from "./Landing";
import MONEDIN_IMG from "./assets/monedin.png";

function PantallaCarga({ texto }) {
  return (
    <div className="rumbo-auth-loading-root">
      <style>{`
        .rumbo-auth-loading-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #f6f9fc; font-family: 'Inter', -apple-system, sans-serif;
        }
        .rumbo-auth-loading { display: flex; flex-direction: column; align-items: center; gap: 14px; color: #4c6584; font-size: 13px; font-weight: 600; }
        .rumbo-auth-loading-img { height: 80px; animation: rumbo-auth-bounce .7s ease-in-out infinite alternate; }
        @keyframes rumbo-auth-bounce { from { transform: translateY(0); } to { transform: translateY(-8px); } }
      `}</style>
      <div className="rumbo-auth-loading">
        <img src={MONEDIN_IMG} alt="Monedín" className="rumbo-auth-loading-img" />
        <div>{texto}</div>
      </div>
    </div>
  );
}

function AppConectada() {
  const { cache } = useCloudData();
  if (!cache) return <PantallaCarga texto="Cargando tus datos..." />;
  return <App />;
}

export default function AuthGate() {
  const { user, cargandoSesion } = useAuth();

  if (cargandoSesion) return <PantallaCarga texto="Comprobando tu sesión..." />;
  if (!user) return <Landing />;

  return (
    <CloudDataProvider>
      <AppConectada />
    </CloudDataProvider>
  );
}
