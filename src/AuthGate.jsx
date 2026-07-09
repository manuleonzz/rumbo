import React, { useState } from "react";
import { useAuth } from "./lib/AuthContext";
import { CloudDataProvider, useCloudData } from "./lib/CloudDataContext";
import App from "./App";
import MONEDIN_IMG from "./assets/monedin.png";

function PantallaCarga({ texto }) {
  return (
    <div className="rumbo-auth-root">
      <style>{AUTH_STYLES}</style>
      <div className="rumbo-auth-loading">
        <img src={MONEDIN_IMG} alt="Monedín" className="rumbo-auth-loading-img" />
        <div>{texto}</div>
      </div>
    </div>
  );
}

function PantallaLogin() {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState("entrar"); // "entrar" | "crear"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setAviso("");
    if (!email || !password) {
      setError("Rellena tu email y contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña necesita al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    const { error: err } =
      modo === "entrar" ? await signIn(email, password) : await signUp(email, password);
    setCargando(false);

    if (err) {
      setError(err.message);
      return;
    }
    if (modo === "crear") {
      setAviso("Cuenta creada. Si tu proyecto pide confirmar el email, revisa tu correo antes de entrar.");
    }
  };

  return (
    <div className="rumbo-auth-root">
      <style>{AUTH_STYLES}</style>
      <div className="rumbo-auth-card">
        <img src={MONEDIN_IMG} alt="Monedín" className="rumbo-auth-img" />
        <div className="rumbo-auth-title">Rumbo</div>
        <div className="rumbo-auth-sub">
          {modo === "entrar" ? "Entra para ver tu presupuesto" : "Crea tu cuenta para empezar"}
        </div>

        <form onSubmit={enviar} className="rumbo-auth-form">
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
          />
          {error && <div className="rumbo-auth-error">{error}</div>}
          {aviso && <div className="rumbo-auth-aviso">{aviso}</div>}
          <button type="submit" disabled={cargando}>
            {cargando ? "Un momento..." : modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <div className="rumbo-auth-switch">
          {modo === "entrar" ? (
            <>
              ¿Todavía no tienes cuenta?{" "}
              <span onClick={() => { setModo("crear"); setError(""); setAviso(""); }}>Créala aquí</span>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <span onClick={() => { setModo("entrar"); setError(""); setAviso(""); }}>Entra aquí</span>
            </>
          )}
        </div>
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
  if (!user) return <PantallaLogin />;

  return (
    <CloudDataProvider>
      <AppConectada />
    </CloudDataProvider>
  );
}

const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
  .rumbo-auth-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f6f9fc;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 20px;
    box-sizing: border-box;
  }
  .rumbo-auth-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px 28px;
    max-width: 340px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(11,37,69,0.1);
  }
  .rumbo-auth-img { height: 90px; margin: 0 auto 14px; display: block; }
  .rumbo-auth-title { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; color: #0b2545; }
  .rumbo-auth-sub { font-size: 13px; color: #4c6584; margin-top: 4px; margin-bottom: 22px; }
  .rumbo-auth-form { display: flex; flex-direction: column; gap: 10px; }
  .rumbo-auth-form input {
    border: 1px solid #e9eef3; border-radius: 12px; padding: 12px 14px;
    font-family: inherit; font-size: 14px; outline: none;
  }
  .rumbo-auth-form input:focus { border-color: #3aa0e8; }
  .rumbo-auth-form button {
    margin-top: 6px; border: none; background: #0b2545; color: white;
    font-weight: 700; font-size: 14px; padding: 12px; border-radius: 12px;
    cursor: pointer; font-family: inherit;
  }
  .rumbo-auth-form button:hover { background: #3aa0e8; }
  .rumbo-auth-form button:disabled { opacity: 0.6; cursor: default; }
  .rumbo-auth-error { color: #ff6b5e; font-size: 12.5px; text-align: left; }
  .rumbo-auth-aviso { color: #2fb380; font-size: 12.5px; text-align: left; }
  .rumbo-auth-switch { margin-top: 18px; font-size: 12.5px; color: #4c6584; }
  .rumbo-auth-switch span { color: #3aa0e8; font-weight: 700; cursor: pointer; text-decoration: underline; }
  .rumbo-auth-loading { display: flex; flex-direction: column; align-items: center; gap: 14px; color: #4c6584; font-size: 13px; font-weight: 600; }
  .rumbo-auth-loading-img { height: 80px; animation: rumbo-auth-bounce .7s ease-in-out infinite alternate; }
  @keyframes rumbo-auth-bounce { from { transform: translateY(0); } to { transform: translateY(-8px); } }
`;
