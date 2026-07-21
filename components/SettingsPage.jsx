"use client";

import React, { useState } from "react";
import AppControls from "./AppControls";
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Coins,
  CreditCard,
  Database,
  Download,
  Eye,
  Film,
  Home,
  HeartPulse,
  Monitor,
  LogOut,
  Palette,
  Save,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Tags,
  Trash2,
  UserRound,
  Utensils,
  WalletCards,
  Wifi,
} from "lucide-react";

const MONEDIN_IMG = `${import.meta.env.BASE_URL}monedin.png`;
const colores = ["#5771e5", "#26a889", "#eea83d", "#e56d7a", "#8b65d9", "#359cc4", "#ec744b", "#64748b"];
const iconos = {
  hogar: Home,
  comida: ShoppingBasket,
  transporte: Car,
  ocio: Utensils,
  entretenimiento: Film,
  suscripciones: CreditCard,
  electricidad: Sparkles,
  suministros: Wifi,
  telefonia: Smartphone,
  salud: HeartPulse,
  ropa: ShoppingBasket,
};

export default function SettingsPage({ language, settings, frecuencia, onFrecuencia, categorias, onCategorias, onBack, onNotify, user = null, onSignOut = null }) {
  const tr = (es, en) => language === "en" ? en : es;
  const [perfil, setPerfil] = useState({ nombre: user?.user_metadata?.name || user?.email?.split("@")[0] || "Manuel", email: user?.email || "manuel@rumbo.app" });
  const [moneda, setMoneda] = useState("EUR");
  const [inicioMes, setInicioMes] = useState("1");
  const [tamano, setTamano] = useState("normal");
  const [movimientoReducido, setMovimientoReducido] = useState(false);
  const [avisos, setAvisos] = useState({ presupuesto: true, suscripciones: true, deudas: true, metas: false });
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState("");

  const avisar = (mensaje) => {
    onNotify?.(mensaje);
  };

  const actualizarColor = (id, color) => {
    onCategorias(categorias.map((categoria) => categoria.id === id ? { ...categoria, color } : categoria));
    avisar(tr("Color de categoría actualizado", "Category colour updated"));
  };

  const eliminarCategoria = (categoria) => {
    if (categorias.length <= 1) {
      avisar(tr("Necesitas conservar al menos una categoría", "You need to keep at least one category"));
      return;
    }
    const confirmado = window.confirm(tr(
      `¿Quitar “${categoria.nombre}” de tus gastos previstos? Los movimientos antiguos conservarán su nombre y su importe en el historial.`,
      `Remove “${categoria.nombre}” from your planned expenses? Older transactions will keep their name and amount in your history.`,
    ));
    if (!confirmado) return;
    onCategorias(categorias.filter((item) => item.id !== categoria.id));
    avisar(tr("Categoría eliminada del próximo presupuesto", "Category removed from the next budget"));
  };

  const exportar = () => {
    const contenido = JSON.stringify({ perfil, moneda, frecuenciaCobro: frecuencia, inicioMes, categorias, avisos }, null, 2);
    const url = URL.createObjectURL(new Blob([contenido], { type: "application/json" }));
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "rumbo-datos-demo.json";
    enlace.click();
    URL.revokeObjectURL(url);
    avisar(tr("Copia de tus datos preparada", "Your data copy is ready"));
  };

  const alternarAviso = (id) => setAvisos((actuales) => ({ ...actuales, [id]: !actuales[id] }));

  const crearCategoria = (e) => {
    e.preventDefault();
    if (!nombreCategoria.trim()) return;
    onCategorias([...categorias, { id: `personalizada-${Date.now()}`, nombre: nombreCategoria.trim(), usado: 0, limite: 100, color: "#8b65d9" }]);
    setNombreCategoria("");
    setCreandoCategoria(false);
    avisar(tr("Categoría personalizada creada", "Custom category created"));
  };

  return <div className={`settings-page settings-size-${tamano} ${movimientoReducido ? "reduce-motion" : ""}`}>
    <section className="settings-page-head">
      <div>
        <button onClick={onBack}><ArrowLeft size={15} /> {tr("Volver al resumen", "Back to overview")}</button>
        <span>{tr("TU CUENTA", "YOUR ACCOUNT")}</span>
        <h1>{tr("Ajustes a tu manera", "Settings, your way")}</h1>
        <p>{tr("Personaliza Rumbo sin perderte entre opciones técnicas.", "Personalise Rumbo without getting lost in technical options.")}</p>
      </div>
    </section>

    <section className="settings-health">
      <img src={MONEDIN_IMG} alt="Monedín" />
      <div className="settings-health-copy">
        <span><CheckCircle2 size={14} /> {tr("TODO BAJO CONTROL", "EVERYTHING UNDER CONTROL")}</span>
        <h2>{tr("Tu espacio está bien configurado", "Your space is set up nicely")}</h2>
        <p>{tr("Puedes cambiar estas preferencias cuando quieras. Tus finanzas no se verán afectadas.", "You can change these preferences whenever you want. Your finances will not be affected.")}</p>
      </div>
      <div className="settings-health-score"><div><b>100%</b><small>{tr("listo", "ready")}</small></div></div>
    </section>

    <section className="settings-grid">
      <article className="settings-card settings-profile-card">
        <SettingsCardTitle icon={UserRound} color="#5771e5" eyebrow={tr("PERFIL", "PROFILE")} title={tr("Tu información", "Your information")} description={tr("Así te reconocerá Monedín.", "This is how Monedín will recognise you.")} />
        <div className="settings-profile-row"><span>ML</span><div><b>{perfil.nombre || tr("Sin nombre", "No name")}</b><small>{tr("Cuenta personal", "Personal account")}</small></div><i><ShieldCheck size={15} /> {tr("Protegida", "Protected")}</i></div>
        <div className="settings-form-grid">
          <label>{tr("Nombre", "Name")}<input value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} /></label>
          <label>{tr("Correo", "Email")}<input type="email" value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} /></label>
        </div>
        <button className="settings-save" onClick={() => avisar(tr("Perfil guardado correctamente", "Profile saved successfully"))}><Save size={15} /> {tr("Guardar perfil", "Save profile")}</button>
      </article>

      <article className="settings-card settings-finance-card">
        <SettingsCardTitle icon={Coins} color="#26a889" eyebrow={tr("DINERO", "MONEY")} title={tr("Preferencias financieras", "Financial preferences")} description={tr("Adapta los cálculos a tu realidad.", "Adapt calculations to your situation.")} />
        <div className="settings-select-row">
          <label><span><WalletCards size={16} /> {tr("Moneda principal", "Main currency")}</span><select value={moneda} onChange={(e) => setMoneda(e.target.value)}><option value="EUR">EUR · Euro (€)</option><option value="USD">USD · Dollar ($)</option><option value="GBP">GBP · Pound (£)</option></select></label>
          <label><span><CalendarDays size={16} /> {tr("El mes empieza el día", "Month starts on")}</span><select value={inicioMes} onChange={(e) => setInicioMes(e.target.value)}><option value="1">1</option><option value="15">15</option><option value="25">25</option></select></label>
        </div>
        <div className="settings-pay-cycle"><span>{tr("¿Cada cuánto cobras?", "How often are you paid?")}</span><div>{[["semanal", tr("Semanal", "Weekly")], ["dos-mes", tr("Quincenal", "Twice monthly")], ["mensual", tr("Mensual", "Monthly")], ["variable", tr("Variable", "Variable")]].map(([id, label]) => <button key={id} className={frecuencia === id ? "activo" : ""} onClick={() => { onFrecuencia(id); avisar(tr("Frecuencia de cobro actualizada", "Pay frequency updated")); }}>{frecuencia === id && <Check size={13} />}{label}</button>)}</div></div>
      </article>

      <article className="settings-card settings-appearance-card">
        <SettingsCardTitle icon={Palette} color="#8b65d9" eyebrow={tr("APARIENCIA", "APPEARANCE")} title={tr("Hazlo cómodo para ti", "Make it comfortable")} description={tr("Tema, idioma y accesibilidad.", "Theme, language and accessibility.")} />
        <div className="settings-appearance-main"><div><Monitor size={18} /><span><b>{tr("Tema e idioma", "Theme and language")}</b><small>{tr("Los cambios se aplican al instante", "Changes apply instantly")}</small></span></div><AppControls {...settings} /></div>
        <div className="settings-segmented"><span>{tr("Tamaño de interfaz", "Interface size")}</span><div>{[["compacto", tr("Compacto", "Compact")], ["normal", tr("Normal", "Normal")], ["grande", tr("Grande", "Large")]].map(([id, label]) => <button key={id} className={tamano === id ? "activo" : ""} onClick={() => setTamano(id)}>{label}</button>)}</div></div>
        <ToggleRow icon={Eye} title={tr("Reducir animaciones", "Reduce animations")} detail={tr("Más calma visual al navegar", "Calmer movement while browsing")} active={movimientoReducido} onClick={() => setMovimientoReducido(!movimientoReducido)} />
      </article>

      <article className="settings-card settings-alert-card">
        <SettingsCardTitle icon={BellRing} color="#eea83d" eyebrow={tr("AVISOS", "ALERTS")} title={tr("Monedín te avisa", "Monedín keeps you posted")} description={tr("Solo cuando realmente importa.", "Only when it really matters.")} />
        <div className="settings-toggle-list">
          <ToggleRow title={tr("Límite de presupuesto", "Budget limit")} detail={tr("Al llegar al 80% de una categoría", "When a category reaches 80%") } active={avisos.presupuesto} onClick={() => alternarAviso("presupuesto")} />
          <ToggleRow title={tr("Próxima suscripción", "Upcoming subscription")} detail={tr("Dos días antes del cobro", "Two days before the charge")} active={avisos.suscripciones} onClick={() => alternarAviso("suscripciones")} />
          <ToggleRow title={tr("Pago de deuda", "Debt payment")} detail={tr("Recordatorio mensual", "Monthly reminder")} active={avisos.deudas} onClick={() => alternarAviso("deudas")} />
          <ToggleRow title={tr("Progreso de metas", "Goal progress")} detail={tr("Resumen cada domingo", "Summary every Sunday")} active={avisos.metas} onClick={() => alternarAviso("metas")} />
        </div>
      </article>

      <article className="settings-card settings-categories-card">
        <SettingsCardTitle icon={Tags} color="#e56d7a" eyebrow={tr("CATEGORÍAS", "CATEGORIES")} title={tr("Tus colores, tus reglas", "Your colours, your rules")} description={tr("Cambia el color de cada categoría y verás el resultado en todos los gráficos.", "Change each category colour and see it across every chart.")} />
        <div className="settings-category-grid">{categorias.map((categoria) => {
          const Icono = iconos[categoria.id] || CircleHelp;
          return <div className="settings-category-row" key={categoria.id}>
            <span style={{ color: categoria.color, background: `${categoria.color}1f` }}><Icono size={18} /></span>
            <div><b>{categoria.nombre}</b><small>{tr("Presupuesto", "Budget")} · {categoria.limite} €</small></div>
            <div className="settings-colour-picker">{colores.slice(0, 6).map((color) => <button type="button" key={color} aria-label={`${tr("Cambiar a", "Change to")} ${color}`} className={categoria.color === color ? "activo" : ""} style={{ background: color, "--swatch": color }} onClick={() => actualizarColor(categoria.id, color)}>{categoria.color === color && <Check size={10} />}</button>)}</div>
            <button type="button" className="settings-category-delete" aria-label={`${tr("Eliminar", "Remove")} ${categoria.nombre}`} title={tr("Quitar de los gastos previstos", "Remove from planned expenses")} onClick={() => eliminarCategoria(categoria)}><Trash2 size={15} /></button>
          </div>;
        })}</div>
        {creandoCategoria ? <form className="settings-new-category" onSubmit={crearCategoria}><input autoFocus value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} placeholder={tr("Nombre de la categoría", "Category name")} /><button disabled={!nombreCategoria.trim()}><Check size={14} /> {tr("Crear", "Create")}</button><button type="button" onClick={() => { setCreandoCategoria(false); setNombreCategoria(""); }}>{tr("Cancelar", "Cancel")}</button></form> : <button className="settings-inline-action" onClick={() => setCreandoCategoria(true)}><Sparkles size={14} /> {tr("Crear una categoría personalizada", "Create a custom category")} <ChevronRight size={15} /></button>}
      </article>

      <article className="settings-card settings-data-card">
        <SettingsCardTitle icon={Database} color="#359cc4" eyebrow={tr("DATOS Y PRIVACIDAD", "DATA & PRIVACY")} title={tr("Tus datos son tuyos", "Your data is yours")} description={tr("Control sencillo, sin letra pequeña.", "Simple control, no small print.")} />
        <div className="settings-sync-state"><span><Database size={18} /></span><div><b>Supabase</b><small>{tr("Sincronización preparada para tu cuenta", "Sync ready for your account")}</small></div><i><CheckCircle2 size={14} /> {tr("Conectado", "Connected")}</i></div>
        <button className="settings-data-action" onClick={exportar}><Download size={17} /><span><b>{tr("Descargar mis datos", "Download my data")}</b><small>{tr("Obtén una copia en formato JSON", "Get a copy in JSON format")}</small></span><ChevronRight size={16} /></button>
        {onSignOut && <button className="settings-data-action" onClick={() => window.confirm(tr("¿Quieres cerrar sesión? Tus datos ya están guardados.", "Sign out? Your data is already saved.")) && onSignOut()}><LogOut size={17} /><span><b>{tr("Cerrar sesión", "Sign out")}</b><small>{user?.email}</small></span><ChevronRight size={16} /></button>}
        <div className="settings-privacy-note"><ShieldCheck size={16} /><span><b>{tr("Privacidad por diseño", "Privacy by design")}</b><small>{tr("Rumbo nunca vende ni utiliza tus movimientos para publicidad.", "Rumbo never sells or uses your transactions for advertising.")}</small></span></div>
      </article>
    </section>
  </div>;
}

function SettingsCardTitle({ icon: Icon, color, eyebrow, title, description }) {
  return <header className="settings-card-title"><span style={{ color, background: `${color}1d` }}><Icon size={19} /></span><div><small style={{ color }}>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div></header>;
}

function ToggleRow({ icon: Icon, title, detail, active, onClick }) {
  return <button className="settings-toggle-row" onClick={onClick}><span>{Icon && <Icon size={16} />}</span><div><b>{title}</b><small>{detail}</small></div><i className={active ? "activo" : ""}><em /></i></button>;
}
