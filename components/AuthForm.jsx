"use client";

import React, { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "../src/lib/AuthContext";

function evaluarFuerza(password) {
  const reglas = {
    minimo: password.length >= 6,
    mayusYminus: /[a-z]/.test(password) && /[A-Z]/.test(password),
    numero: /[0-9]/.test(password),
    simbolo: /[^A-Za-z0-9]/.test(password),
  };
  const puntos = Object.values(reglas).filter(Boolean).length;
  const colores = ["#e8edf2", "#ff6b5e", "#ff9f43", "#8bc34a", "#2fb380"];
  return { reglas, puntos, color: colores[puntos] };
}

function PasswordField({ value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return <div className="rumbo-auth-pw-wrap">
    <input type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
    <button type="button" className="rumbo-auth-eye" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
  </div>;
}

export default function AuthForm({ defaultMode = "entrar", language = "es" }) {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);
  const fuerza = evaluarFuerza(password);
  const tr = (es, en) => language === "en" ? en : es;

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError("");
    setAviso("");
    setPassword2("");
  };

  const enviar = async (event) => {
    event.preventDefault();
    setError("");
    setAviso("");
    if (!email || !password) return setError(tr("Rellena tu email y contraseña.", "Enter your email and password."));
    if (password.length < 6) return setError(tr("La contraseña necesita al menos 6 caracteres.", "Your password needs at least 6 characters."));
    if (modo === "crear" && password !== password2) return setError(tr("Las dos contraseñas no coinciden.", "The passwords do not match."));

    setCargando(true);
    try {
      const { error: authError } = modo === "entrar" ? await signIn(email, password) : await signUp(email, password);
      if (authError) {
        const mensajeConexion = tr(
          "No se pudo conectar con Supabase. Comprueba tu conexión e inténtalo de nuevo.",
          "Rumbo could not connect to Supabase. Check your connection and try again."
        );
        return setError(authError.message === "Failed to fetch" ? mensajeConexion : authError.message);
      }
      if (modo === "crear") setAviso(tr("Cuenta creada. Si se solicita confirmación, revisa tu correo.", "Account created. Check your email if confirmation is required."));
    } catch (authError) {
      setError(authError?.message === "Failed to fetch"
        ? tr("No se pudo conectar con Supabase. Comprueba tu conexión e inténtalo de nuevo.", "Rumbo could not connect to Supabase. Check your connection and try again.")
        : tr("Ha ocurrido un error inesperado. Inténtalo de nuevo.", "An unexpected error occurred. Please try again."));
    } finally {
      setCargando(false);
    }
  };

  const requisitos = [
    [fuerza.reglas.minimo, tr("6+ caracteres", "6+ characters")],
    [fuerza.reglas.mayusYminus, tr("Mayúsculas y minúsculas", "Upper and lowercase")],
    [fuerza.reglas.numero, tr("Un número", "One number")],
    [fuerza.reglas.simbolo, tr("Un símbolo (opcional)", "A symbol (optional)")],
  ];

  return <>
    <form className="rumbo-auth-form" onSubmit={enviar}>
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={tr("Tu email", "Your email")} autoComplete="email" />
      <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} placeholder={tr("Contraseña (mínimo 6 caracteres)", "Password (6 characters minimum)")} autoComplete={modo === "entrar" ? "current-password" : "new-password"} />
      {modo === "crear" && password && <div className="rumbo-auth-fuerza">
        <div className="rumbo-auth-fuerza-barras">{[1, 2, 3, 4].map((level) => <i key={level} className="rumbo-auth-fuerza-seg" style={{ background: level <= fuerza.puntos ? fuerza.color : "#e9eef3" }} />)}</div>
        <div className="rumbo-auth-requisitos">{requisitos.map(([ok, label]) => <span key={label} className={`rumbo-auth-req ${ok ? "ok" : ""}`}>{ok ? <Check size={11} /> : <X size={11} />}{label}</span>)}</div>
      </div>}
      {modo === "crear" && <PasswordField value={password2} onChange={(event) => setPassword2(event.target.value)} placeholder={tr("Repite la contraseña", "Repeat password")} autoComplete="new-password" />}
      {modo === "crear" && password2 && <div className={`rumbo-auth-match ${password === password2 ? "ok" : "no"}`}>{password === password2 ? <Check size={12} /> : <X size={12} />}{password === password2 ? tr("Las contraseñas coinciden", "Passwords match") : tr("Todavía no coinciden", "Passwords do not match yet")}</div>}
      {error && <div className="rumbo-auth-error">{error}</div>}
      {aviso && <div className="rumbo-auth-aviso">{aviso}</div>}
      <button type="submit" disabled={cargando}>{cargando ? tr("Un momento…", "One moment…") : modo === "crear" ? tr("Crear cuenta", "Create account") : tr("Entrar", "Sign in")}</button>
    </form>
    <div className="rumbo-auth-switch">{modo === "entrar" ? <>{tr("¿Todavía no tienes cuenta? ", "No account yet? ")}<span onClick={() => cambiarModo("crear")}>{tr("Créala aquí", "Create one")}</span></> : <>{tr("¿Ya tienes cuenta? ", "Already have an account? ")}<span onClick={() => cambiarModo("entrar")}>{tr("Entra aquí", "Sign in")}</span></>}</div>
  </>;
}
