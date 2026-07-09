import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
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

// Devuelve una puntuación 0-5 y qué requisitos cumple la contraseña.
function evaluarFuerza(pw) {
  const reglas = {
    largo: pw.length >= 8,
    minimo: pw.length >= 6,
    numero: /[0-9]/.test(pw),
    mayusYminus: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    simbolo: /[^A-Za-z0-9]/.test(pw),
  };
  let puntos = 0;
  if (reglas.minimo) puntos++;
  if (reglas.largo) puntos++;
  if (reglas.numero) puntos++;
  if (reglas.mayusYminus) puntos++;
  if (reglas.simbolo) puntos++;

  const niveles = [
    { texto: "Muy débil", color: "#ff6b5e" },
    { texto: "Débil", color: "#ff9f43" },
    { texto: "Regular", color: "#f2c14e" },
    { texto: "Buena", color: "#8bc34a" },
    { texto: "Fuerte", color: "#2fb380" },
    { texto: "Muy fuerte", color: "#2fb380" },
  ];

  return { puntos, ...niveles[puntos], reglas };
}

function CampoPassword({ placeholder, value, onChange, autoComplete, mostrar, setMostrar }) {
  return (
    <div className="rumbo-auth-pw-wrap">
      <input
        type={mostrar ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button type="button" className="rumbo-auth-eye" onClick={() => setMostrar((v) => !v)} tabIndex={-1}>
        {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function BarraFuerza({ password }) {
  const { puntos, texto, color, reglas } = evaluarFuerza(password);
  return (
    <div className="rumbo-auth-fuerza">
      <div className="rumbo-auth-fuerza-barras">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rumbo-auth-fuerza-seg"
            style={{ background: i < puntos ? color : "#e9eef3" }}
          />
        ))}
      </div>
      <div className="rumbo-auth-fuerza-txt" style={{ color }}>
        {password ? texto : "Escribe una contraseña"}
      </div>
      <div className="rumbo-auth-requisitos">
        <Requisito ok={reglas.minimo} texto="6+ caracteres" />
        <Requisito ok={reglas.mayusYminus} texto="Mayúsculas y minúsculas" />
        <Requisito ok={reglas.numero} texto="Un número" />
        <Requisito ok={reglas.simbolo} texto="Un símbolo (opcional)" />
      </div>
    </div>
  );
}

function Requisito({ ok, texto }) {
  return (
    <div className={`rumbo-auth-req ${ok ? "ok" : ""}`}>
      {ok ? <Check size={11} /> : <X size={11} />} {texto}
    </div>
  );
}

function PantallaLogin() {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState("entrar"); // "entrar" | "crear"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mostrarPw, setMostrarPw] = useState(false);
  const [mostrarPw2, setMostrarPw2] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setError("");
    setAviso("");
    setPassword2("");
  };

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
    if (modo === "crear" && password !== password2) {
      setError("Las dos contraseñas no coinciden.");
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

          <CampoPassword
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            mostrar={mostrarPw}
            setMostrar={setMostrarPw}
          />

          {modo === "crear" && password && <BarraFuerza password={password} />}

          {modo === "crear" && (
            <CampoPassword
              placeholder="Repite la contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              mostrar={mostrarPw2}
              setMostrar={setMostrarPw2}
            />
          )}
          {modo === "crear" && password2 && (
            <div className={`rumbo-auth-match ${password === password2 ? "ok" : "no"}`}>
              {password === password2 ? (
                <>
                  <Check size={12} /> Las contraseñas coinciden
                </>
              ) : (
                <>
                  <X size={12} /> Todavía no coinciden
                </>
              )}
            </div>
          )}

          {error && <div className="rumbo-auth-error">{error}</div>}
          {aviso && <div className="rumbo-auth-aviso">{aviso}</div>}
          <button type="submit" disabled={cargando}>
            {cargando ? "Un momento..." : modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <div className="rumbo-auth-switch">
          {modo === "entrar" ? (
            <>
              ¿Todavía no tienes cuenta? <span onClick={() => cambiarModo("crear")}>Créala aquí</span>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta? <span onClick={() => cambiarModo("entrar")}>Entra aquí</span>
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
    width: 100%; border: 1px solid #e9eef3; border-radius: 12px; padding: 12px 14px;
    font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box;
  }
  .rumbo-auth-form input:focus { border-color: #3aa0e8; }
  .rumbo-auth-form button[type=submit] {
    margin-top: 6px; border: none; background: #0b2545; color: white;
    font-weight: 700; font-size: 14px; padding: 12px; border-radius: 12px;
    cursor: pointer; font-family: inherit;
  }
  .rumbo-auth-form button[type=submit]:hover { background: #3aa0e8; }
  .rumbo-auth-form button[type=submit]:disabled { opacity: 0.6; cursor: default; }
  .rumbo-auth-error { color: #ff6b5e; font-size: 12.5px; text-align: left; }
  .rumbo-auth-aviso { color: #2fb380; font-size: 12.5px; text-align: left; }
  .rumbo-auth-switch { margin-top: 18px; font-size: 12.5px; color: #4c6584; }
  .rumbo-auth-switch span { color: #3aa0e8; font-weight: 700; cursor: pointer; text-decoration: underline; }
  .rumbo-auth-loading { display: flex; flex-direction: column; align-items: center; gap: 14px; color: #4c6584; font-size: 13px; font-weight: 600; }
  .rumbo-auth-loading-img { height: 80px; animation: rumbo-auth-bounce .7s ease-in-out infinite alternate; }
  @keyframes rumbo-auth-bounce { from { transform: translateY(0); } to { transform: translateY(-8px); } }

  .rumbo-auth-pw-wrap { position: relative; }
  .rumbo-auth-pw-wrap input { padding-right: 40px; }
  .rumbo-auth-eye {
    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
    border: none; background: none; color: #4c6584; cursor: pointer;
    padding: 6px; display: flex; align-items: center;
  }
  .rumbo-auth-eye:hover { color: #3aa0e8; }

  .rumbo-auth-fuerza { text-align: left; margin-top: -2px; }
  .rumbo-auth-fuerza-barras { display: flex; gap: 4px; }
  .rumbo-auth-fuerza-seg { flex: 1; height: 5px; border-radius: 3px; transition: background .2s ease; }
  .rumbo-auth-fuerza-txt { font-size: 11px; font-weight: 700; margin-top: 4px; }
  .rumbo-auth-requisitos { display: flex; flex-wrap: wrap; gap: 6px 10px; margin-top: 6px; }
  .rumbo-auth-req { display: flex; align-items: center; gap: 3px; font-size: 10.5px; color: #b7c0cb; }
  .rumbo-auth-req.ok { color: #2fb380; }

  .rumbo-auth-match { display: flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 600; text-align: left; }
  .rumbo-auth-match.ok { color: #2fb380; }
  .rumbo-auth-match.no { color: #ff9f43; }
`;
