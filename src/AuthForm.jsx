import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "./lib/AuthContext";

// Devuelve una puntuación 0-5 y qué requisitos cumple la contraseña.
function evaluarFuerza(pw) {
  const reglas = {
    minimo: pw.length >= 6,
    largo: pw.length >= 8,
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

function Requisito({ ok, texto }) {
  return (
    <div className={`rumbo-auth-req ${ok ? "ok" : ""}`}>
      {ok ? <Check size={11} /> : <X size={11} />} {texto}
    </div>
  );
}

function BarraFuerza({ password }) {
  const { puntos, texto, color, reglas } = evaluarFuerza(password);
  return (
    <div className="rumbo-auth-fuerza">
      <div className="rumbo-auth-fuerza-barras">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="rumbo-auth-fuerza-seg" style={{ background: i < puntos ? color : "#e9eef3" }} />
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

// variant: "card" añade su propio marco de tarjeta blanca; "embedded" deja que
// el contenedor que lo use (por ejemplo la landing page) ponga el marco.
export default function AuthForm({ defaultMode = "entrar", onModeChange }) {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState(defaultMode);
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
    if (onModeChange) onModeChange(nuevo);
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
    <>
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
    </>
  );
}
