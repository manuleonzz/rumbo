"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  Film,
  Home,
  Lightbulb,
  Plus,
  ReceiptText,
  Rocket,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Trash2,
  Utensils,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import AppControls from "./AppControls";

const MONEDIN_IMG = `${import.meta.env.BASE_URL}monedin.png`;

const frecuencias = [
  { id: "semanal", titulo: "Cada semana", texto: "Normalmente 52 pagos al año", icono: CalendarDays, factor: 52 / 12 },
  { id: "dos-mes", titulo: "Dos veces al mes", texto: "Por ejemplo, el 15 y el 30", icono: Clock3, factor: 2 },
  { id: "mensual", titulo: "Una vez al mes", texto: "Un solo pago mensual", icono: WalletCards, factor: 1 },
  { id: "variable", titulo: "Ingreso variable", texto: "Autónomo, propinas o varios pagos", icono: CircleDollarSign, factor: 1 },
];

const categoriasBase = [
  { id: "hogar", nombre: "Hogar", ayuda: "Alquiler o hipoteca", importe: 800, color: "#5771e5", icono: Home },
  { id: "electricidad", nombre: "Electricidad y servicios", ayuda: "Luz, agua, internet", importe: 150, color: "#8b65d9", icono: Zap },
  { id: "transporte", nombre: "Transporte", ayuda: "Coche, gasolina o tren", importe: 300, color: "#eea83d", icono: Car },
  { id: "comida", nombre: "Supermercado", ayuda: "Compra para casa", importe: 400, color: "#26a889", icono: ShoppingBasket },
  { id: "restaurantes", nombre: "Restaurantes", ayuda: "Comer fuera y delivery", importe: 150, color: "#e56d7a", icono: Utensils },
  { id: "ropa", nombre: "Ropa y cuidado", ayuda: "Ropa, peluquería y otros", importe: 100, color: "#3d9cc8", icono: Shirt },
  { id: "entretenimiento", nombre: "Entretenimiento", ayuda: "Cine, juegos y eventos", importe: 120, color: "#ef7d4f", icono: Film },
];

const serviciosBase = [
  { id: "netflix", nombre: "Netflix", precio: 13.99, sigla: "N", color: "#e50914", tipo: "video" },
  { id: "spotify", nombre: "Spotify", precio: 11.99, sigla: "S", color: "#1db954", tipo: "musica" },
  { id: "prime", nombre: "Amazon Prime", precio: 4.99, sigla: "P", color: "#159bd7", tipo: "video" },
  { id: "youtube", nombre: "YouTube Premium", precio: 13.99, sigla: "Y", color: "#ff0033", tipo: "video" },
  { id: "gimnasio", nombre: "Gimnasio", precio: 29.99, sigla: "G", color: "#6f7a86", tipo: "bienestar" },
  { id: "icloud", nombre: "iCloud+", precio: 2.99, sigla: "iC", color: "#5b9df1", tipo: "software" },
  { id: "disney", nombre: "Disney+", precio: 10.99, sigla: "D+", color: "#173cc4", tipo: "video" },
  { id: "hbomax", nombre: "HBO Max", precio: 9.99, sigla: "H", color: "#5b2dd8", tipo: "video" },
  { id: "appletv", nombre: "Apple TV+", precio: 9.99, sigla: "TV", color: "#20242a", tipo: "video" },
  { id: "applemusic", nombre: "Apple Music", precio: 10.99, sigla: "AM", color: "#fa5060", tipo: "musica" },
  { id: "amazonmusic", nombre: "Amazon Music", precio: 10.99, sigla: "aM", color: "#13a9dd", tipo: "musica" },
  { id: "crunchyroll", nombre: "Crunchyroll", precio: 6.99, sigla: "C", color: "#f47521", tipo: "video" },
  { id: "playstation", nombre: "PlayStation Plus", precio: 8.99, sigla: "PS", color: "#1f59c4", tipo: "gaming" },
  { id: "xbox", nombre: "Xbox Game Pass", precio: 14.99, sigla: "X", color: "#107c10", tipo: "gaming" },
  { id: "nintendo", nombre: "Nintendo Switch Online", precio: 3.99, sigla: "NS", color: "#e60012", tipo: "gaming" },
  { id: "twitch", nombre: "Twitch", precio: 4.99, sigla: "T", color: "#9146ff", tipo: "video" },
  { id: "googleone", nombre: "Google One", precio: 2.99, sigla: "1", color: "#4285f4", tipo: "software" },
  { id: "microsoft", nombre: "Microsoft 365", precio: 9.99, sigla: "M", color: "#f25022", tipo: "software" },
  { id: "adobe", nombre: "Adobe Creative Cloud", precio: 29.99, sigla: "A", color: "#ed2224", tipo: "software" },
  { id: "audible", nombre: "Audible", precio: 9.99, sigla: "Au", color: "#f7991c", tipo: "musica" },
];

const tiposSuscripcion = [
  { id: "todas", nombre: "Todas" }, { id: "video", nombre: "Vídeo" }, { id: "musica", nombre: "Música" },
  { id: "gaming", nombre: "Videojuegos" }, { id: "software", nombre: "Nube y software" }, { id: "bienestar", nombre: "Bienestar" },
];

const tiposMeta = [
  { id: "corto", nombre: "Corto plazo", tiempo: "Hasta 1 año", ayuda: "Algo que quieres pronto", color: "#ef7d4f", icono: Rocket, ejemplos: ["Zapatillas", "Móvil", "Televisor", "Viaje"] },
  { id: "medio", nombre: "Medio plazo", tiempo: "De 1 a 5 años", ayuda: "Un proyecto importante", color: "#eea83d", icono: Car, ejemplos: ["Coche", "Mudanza", "Formación", "Negocio"] },
  { id: "largo", nombre: "Largo plazo", tiempo: "Más de 5 años", ayuda: "Tu futuro con calma", color: "#5771e5", icono: Home, ejemplos: ["Vivienda", "Jubilación", "Universidad", "Inversión"] },
  { id: "libre", nombre: "Solo ahorrar", tiempo: "Sin fecha límite", ayuda: "Guardar por tranquilidad", color: "#26a889", icono: ShieldCheck, ejemplos: ["Fondo de emergencia", "Ahorro general", "Colchón familiar"] },
];

const tiposDeuda = [
  { id: "coche", nombre: "Coche", ayuda: "Financiación del vehículo", color: "#eea83d", icono: Car },
  { id: "tarjeta", nombre: "Tarjeta", ayuda: "Tarjeta o crédito revolving", color: "#e56d7a", icono: WalletCards },
  { id: "prestamo", nombre: "Préstamo", ayuda: "Préstamo personal o familiar", color: "#8b65d9", icono: CircleDollarSign },
  { id: "otra", nombre: "Otra deuda", ayuda: "Impuestos, multas u otros", color: "#64748b", icono: ReceiptText },
];

const fechaDeuda = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

function numeroFlexible(valor) {
  const texto = String(valor ?? "").trim().replace(/\s/g, "");
  if (/^\d{1,3}(\.\d{3})+$/.test(texto)) return Number(texto.replace(/\./g, ""));
  if (texto.includes(",") && texto.includes(".")) return Number(texto.replace(/\./g, "").replace(",", "."));
  return Number(texto.replace(",", "."));
}

function calcularPlanDeuda(saldoValor, cuotaValor, taeValor = 0) {
  const saldo = numeroFlexible(saldoValor) || 0;
  const cuota = numeroFlexible(cuotaValor) || 0;
  const tae = numeroFlexible(taeValor) || 0;
  if (!saldo || !cuota) return { cuotas: 0, fecha: null, insuficiente: false };
  const interesMensual = tae / 100 / 12;
  if (interesMensual && cuota <= saldo * interesMensual) return { cuotas: null, fecha: null, insuficiente: true };
  const cuotas = interesMensual ? Math.ceil(-Math.log(1 - (interesMensual * saldo) / cuota) / Math.log(1 + interesMensual)) : Math.ceil(saldo / cuota);
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + cuotas);
  return { cuotas, fecha: fechaDeuda.format(fecha), insuficiente: false };
}

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function FinanceOnboarding({ onComplete, onCancel, settings }) {
  const [paso, setPaso] = useState(0);
  const [frecuencia, setFrecuencia] = useState("semanal");
  const [ingreso, setIngreso] = useState("650");
  const [categorias, setCategorias] = useState(categoriasBase);
  const [servicios, setServicios] = useState(serviciosBase.map((s) => ({ ...s, activo: ["netflix", "spotify"].includes(s.id) })));
  const [suscripcionesAbiertas, setSuscripcionesAbiertas] = useState(false);
  const [filtroSuscripcion, setFiltroSuscripcion] = useState("todas");
  const [busquedaSuscripcion, setBusquedaSuscripcion] = useState("");
  const [personalizada, setPersonalizada] = useState({ nombre: "", precio: "", tipo: "video" });
  const [metas, setMetas] = useState([]);
  const [metaBorrador, setMetaBorrador] = useState({ tipo: "corto", nombre: "", objetivo: "" });
  const [tieneDeudas, setTieneDeudas] = useState(null);
  const [deudas, setDeudas] = useState([]);
  const [deudaBorrador, setDeudaBorrador] = useState({ tipo: "coche", nombre: "", saldo: "", cuota: "", tae: "" });
  const tr = (es, en) => settings.language === "en" ? en : es;
  const categoryEnglish = { hogar: "Home", electricidad: "Utilities", transporte: "Transport", comida: "Groceries", restaurantes: "Restaurants", ropa: "Clothing & care", entretenimiento: "Entertainment" };
  const categoryHelpEnglish = { hogar: "Rent or mortgage", electricidad: "Power, water, internet", transporte: "Car, fuel or train", comida: "Household groceries", restaurantes: "Eating out and delivery", ropa: "Clothing, haircuts and more", entretenimiento: "Cinema, games and events" };

  const frecuenciaActiva = frecuencias.find((f) => f.id === frecuencia);
  const ingresoMensual = Math.round((Number(ingreso) || 0) * frecuenciaActiva.factor);
  const totalSuscripciones = servicios.filter((s) => s.activo).reduce((sum, s) => sum + s.precio, 0);
  const totalCuotasDeuda = deudas.reduce((sum, deuda) => sum + Number(deuda.cuota || 0), 0);
  const totalGastos = categorias.reduce((sum, c) => sum + Number(c.importe || 0), 0) + totalSuscripciones + totalCuotasDeuda;
  const restante = ingresoMensual - totalGastos;
  const pctGastos = ingresoMensual ? Math.min(100, Math.round((totalGastos / ingresoMensual) * 100)) : 0;

  const segmentos = useMemo(() => {
    const elementos = [...categorias.map((c) => ({ ...c, valor: Number(c.importe || 0) }))];
    if (totalSuscripciones) elementos.push({ id: "suscripciones", nombre: "Suscripciones", valor: totalSuscripciones, color: "#ef7d4f" });
    if (totalCuotasDeuda) elementos.push({ id: "deudas", nombre: "Cuotas de deuda", valor: totalCuotasDeuda, color: "#e56d7a" });
    let acumulado = 0;
    return elementos.map((item) => {
      const inicio = totalGastos ? (acumulado / totalGastos) * 360 : 0;
      acumulado += item.valor;
      const fin = totalGastos ? (acumulado / totalGastos) * 360 : 0;
      return { ...item, inicio, fin, porcentaje: totalGastos ? Math.round((item.valor / totalGastos) * 100) : 0 };
    });
  }, [categorias, totalSuscripciones, totalCuotasDeuda, totalGastos]);

  const fondoGrafica = segmentos.length
    ? `conic-gradient(${segmentos.map((s) => `${s.color} ${s.inicio}deg ${s.fin}deg`).join(",")})`
    : "#e8ece9";

  const actualizarCategoria = (id, valor) => setCategorias((actuales) => actuales.map((c) => c.id === id ? { ...c, importe: valor } : c));
  const alternarServicio = (id) => setServicios((actuales) => actuales.map((s) => s.id === id ? { ...s, activo: !s.activo } : s));
  const actualizarPrecioServicio = (id, precio) => setServicios((actuales) => actuales.map((s) => s.id === id ? { ...s, precio: Number(precio) || 0 } : s));
  const serviciosVisibles = servicios.filter((s) => (filtroSuscripcion === "todas" || s.tipo === filtroSuscripcion) && s.nombre.toLowerCase().includes(busquedaSuscripcion.toLowerCase()));
  const agregarPersonalizada = () => {
    if (!personalizada.nombre.trim() || !Number(personalizada.precio)) return;
    setServicios((actuales) => [...actuales, { id: `custom-${Date.now()}`, nombre: personalizada.nombre.trim(), precio: Number(personalizada.precio), tipo: personalizada.tipo, sigla: personalizada.nombre.trim().slice(0, 2).toUpperCase(), color: "#64748b", activo: true }]);
    setPersonalizada({ nombre: "", precio: "", tipo: "video" });
  };
  const agregarMeta = () => {
    if (!metaBorrador.nombre.trim()) return;
    const tipo = tiposMeta.find((item) => item.id === metaBorrador.tipo);
    setMetas((actuales) => [...actuales, {
      id: `meta-${Date.now()}`,
      tipo: metaBorrador.tipo,
      nombre: metaBorrador.nombre.trim(),
      objetivo: numeroFlexible(metaBorrador.objetivo) || 0,
      ahorrado: 0,
      color: tipo.color,
    }]);
    setMetaBorrador((actual) => ({ ...actual, nombre: "", objetivo: "" }));
  };
  const agregarDeuda = () => {
    const saldo = numeroFlexible(deudaBorrador.saldo);
    const cuota = numeroFlexible(deudaBorrador.cuota);
    const tae = numeroFlexible(deudaBorrador.tae) || 0;
    if (!deudaBorrador.nombre.trim() || !saldo || !cuota) return;
    const tipo = tiposDeuda.find((item) => item.id === deudaBorrador.tipo);
    setDeudas((actuales) => [...actuales, { id: `deuda-${Date.now()}`, tipo: deudaBorrador.tipo, nombre: deudaBorrador.nombre.trim(), saldo, saldoInicial: saldo, cuota, tae, color: tipo.color }]);
    setDeudaBorrador((actual) => ({ ...actual, nombre: "", saldo: "", cuota: "", tae: "" }));
  };

  const terminar = () => {
    onComplete({
      frecuencia,
      ingresoPorPago: Number(ingreso) || 0,
      ingresoMensual,
      categorias: [
        ...categorias.map((c) => ({ id: c.id, nombre: c.nombre, limite: Number(c.importe || 0), color: c.color })),
        ...(totalSuscripciones ? [{ id: "suscripciones", nombre: "Suscripciones", limite: Number(totalSuscripciones.toFixed(2)), color: "#ef7d4f" }] : []),
        ...(totalCuotasDeuda ? [{ id: "deudas", nombre: "Cuotas de deuda", limite: Number(totalCuotasDeuda.toFixed(2)), color: "#e56d7a" }] : []),
      ],
      servicios: servicios.filter((s) => s.activo),
      metas,
      deudas,
    });
  };

  return (
    <div className="setup-root">
      <div className="setup-deco setup-deco-a" /><div className="setup-deco setup-deco-b" />
      <header className="setup-header">
        <button type="button" className="setup-logo" onClick={onCancel} aria-label={tr("Volver a la portada de Rumbo", "Return to the Rumbo home page")}><img src={MONEDIN_IMG} alt="" /><b>Rumbo</b></button>
        <div className="setup-header-actions"><AppControls {...settings} compact /><button onClick={onCancel}><X size={18} /> {tr("Salir de la demo", "Exit demo")}</button></div>
      </header>

      <main className="setup-shell">
        <div className="setup-progress-head"><span>{tr("Paso", "Step")} {paso + 1} {tr("de", "of")} 7</span><b>{Math.round(((paso + 1) / 7) * 100)}%</b></div>
        <div className="setup-progress"><i style={{ width: `${((paso + 1) / 7) * 100}%` }} /></div>

        <div className="setup-monedin-row">
          <img src={MONEDIN_IMG} alt="Monedín" />
          <div className="setup-speech">
            {paso === 0 && <><b>{tr("¡Primero, conozcamos tu ritmo!", "First, let's understand your rhythm!")}</b><span>{tr("No todos cobramos igual. Rumbo se adaptará a ti.", "Not everyone gets paid the same way. Rumbo will adapt to you.")}</span></>}
            {paso === 1 && <><b>{tr("¿Cuánto llega realmente a tu cuenta?", "How much actually reaches your account?")}</b><span>{tr("Usaremos el importe neto, después de impuestos.", "We'll use your net income, after taxes.")}</span></>}
            {paso === 2 && <><b>{tr("Ahora vamos con lo esencial", "Now for the essentials")}</b><span>{tr("Pon una estimación. Siempre podrás cambiarla después.", "Add an estimate. You can always change it later.")}</span></>}
            {paso === 3 && <><b>{tr("Los pequeños pagos también cuentan", "Small payments count too")}</b><span>{tr("Selecciona tus suscripciones y verás cuánto suman juntas.", "Select your subscriptions and see how they add up.")}</span></>}
            {paso === 4 && <><b>{tr("Ahora, pongámosle un propósito a tu ahorro", "Now, give your savings a purpose")}</b><span>{tr("Puedes tener varias metas con plazos diferentes, o simplemente guardar dinero.", "You can have several goals with different timelines, or simply save money.")}</span></>}
            {paso === 5 && <><b>{tr("Las deudas también forman parte del camino", "Debt is part of the journey too")}</b><span>{tr("Sin juicios: saber cuánto falta te ayuda a recuperar el control.", "No judgement: knowing what's left helps you regain control.")}</span></>}
            {paso === 6 && <><b>{tr("¡Tu primer mapa financiero está listo!", "Your first financial map is ready!")}</b><span>{tr("Los colores te enseñan rápidamente adónde se va tu dinero.", "Colours quickly show you where your money goes.")}</span></>}
          </div>
        </div>

        <section className="setup-card">
          {paso === 0 && <div className="setup-step">
            <span className="setup-eyebrow">{tr("TU FORMA DE COBRAR", "YOUR PAY SCHEDULE")}</span>
            <h1>{tr("¿Con qué frecuencia recibes tus ingresos?", "How often do you receive income?")}</h1>
            <p>{tr("Así podremos comparar correctamente lo que entra con tus gastos mensuales.", "This helps us compare your income correctly with monthly expenses.")}</p>
            <div className="setup-frequency-grid">
              {frecuencias.map(({ icono: Icono, ...item }) => <button key={item.id} className={frecuencia === item.id ? "activo" : ""} onClick={() => setFrecuencia(item.id)}>
                <span><Icono size={21} /></span><div><b>{settings.language === "en" ? ({ semanal:"Every week","dos-mes":"Twice a month",mensual:"Once a month",variable:"Variable income" }[item.id]) : item.titulo}</b><small>{settings.language === "en" ? ({ semanal:"Usually 52 payments a year","dos-mes":"For example, on the 15th and 30th",mensual:"One monthly payment",variable:"Freelance, tips or multiple payments" }[item.id]) : item.texto}</small></div>{frecuencia === item.id && <i><Check size={13} /></i>}
              </button>)}
            </div>
          </div>}

          {paso === 1 && <div className="setup-step setup-income-step">
            <span className="setup-eyebrow">{tr("TUS INGRESOS", "YOUR INCOME")}</span>
            <h1>{settings.language === "en" ? (frecuencia === "variable" ? "How much do you earn in a normal month?" : `How much do you receive ${frecuencia === "semanal" ? "each week" : frecuencia === "dos-mes" ? "per payment" : "per month"}?`) : (frecuencia === "variable" ? "¿Cuánto ingresas en un mes normal?" : `¿Cuánto recibes ${frecuencia === "semanal" ? "cada semana" : frecuencia === "dos-mes" ? "en cada pago" : "al mes"}?`)}</h1>
            <p>{tr("Escribe lo que llega limpio a tu cuenta. No necesitamos el salario bruto.", "Enter what actually reaches your account. We don't need your gross salary.")}</p>
            <div className="setup-money-input"><span>€</span><input autoFocus type="number" min="0" value={ingreso} onChange={(e) => setIngreso(e.target.value)} /></div>
            <div className="setup-monthly-preview"><Sparkles size={17} /><div><span>{tr("Rumbo calcula un promedio mensual de", "Rumbo calculates a monthly average of")}</span><b>{euros.format(ingresoMensual)}</b></div></div>
            {frecuencia === "semanal" && <div className="setup-note"><Lightbulb size={15} /> {tr("Usamos 52 semanas ÷ 12 meses, porque algunos meses tienen cinco pagos.", "We use 52 weeks ÷ 12 months because some months have five payments.")}</div>}
          </div>}

          {paso === 2 && <div className="setup-step">
            <span className="setup-eyebrow">{tr("GASTOS PREVISTOS", "EXPECTED EXPENSES")}</span>
            <h1>{tr("¿Cuánto crees que gastarás cada mes?", "How much do you expect to spend each month?")}</h1>
            <p>{tr("No tiene que ser perfecto. Una buena aproximación ya nos da un rumbo.", "It doesn't need to be perfect. A good estimate already gives us direction.")}</p>
            <div className="setup-expense-grid">
              {categorias.map((cat) => { const Icono = cat.icono; return <label key={cat.id} style={{ "--cat": cat.color }}><span className="setup-expense-icon"><Icono size={20} /></span><div><b>{settings.language === "en" ? categoryEnglish[cat.id] : cat.nombre}</b><small>{settings.language === "en" ? categoryHelpEnglish[cat.id] : cat.ayuda}</small></div><div className="setup-expense-input"><span>€</span><input type="number" min="0" value={cat.importe} onChange={(e) => actualizarCategoria(cat.id, e.target.value)} /></div></label>; })}
            </div>
          </div>}

          {paso === 3 && <div className="setup-step">
            <span className="setup-eyebrow">{tr("SUSCRIPCIONES Y ENTRETENIMIENTO", "SUBSCRIPTIONS & ENTERTAINMENT")}</span>
            <h1>{tr("¿Qué pagos se repiten cada mes?", "Which payments repeat every month?")}</h1>
            <p>{tr("Selecciona los que utilizas. Más adelante podrás añadir cualquier otro servicio.", "Select the ones you use. You can add any other service later.")}</p>
            <div className="setup-services">
              {servicios.filter((servicio, index) => index < 6 || servicio.activo).map((servicio) => <button key={servicio.id} className={servicio.activo ? "activo" : ""} onClick={() => alternarServicio(servicio.id)}>
                <span style={{ background: servicio.color }}>{servicio.sigla}</span><div><b>{servicio.nombre}</b><small>{servicio.precio.toFixed(2).replace(".", ",")} €/mes</small></div>{servicio.activo ? <i><Check size={13} /></i> : <Plus size={16} />}
              </button>)}
            </div>
            <button className="setup-add-custom" onClick={() => setSuscripcionesAbiertas(true)}><Plus size={15} /> {tr("Añadir otra suscripción", "Add another subscription")}</button>
            <div className="setup-subtotal"><span>{tr("Entretenimiento y suscripciones", "Entertainment & subscriptions")}</span><b>{totalSuscripciones.toFixed(2).replace(".", ",")} € <small>{tr("al mes", "per month")}</small></b></div>
          </div>}

          {paso === 4 && <div className="setup-step setup-goals-step">
            <span className="setup-eyebrow">{tr("TUS METAS DE AHORRO", "YOUR SAVINGS GOALS")}</span>
            <h1>{tr("¿Tienes alguna meta?", "Do you have a goal?")}</h1>
            <p>{tr("Puedes añadir una para dentro de poco y otra para el futuro. No tienes que elegir un único plazo.", "Add one for the near future and another for later. You don't have to choose a single timeline.")}</p>
            <div className="setup-goal-types">{tiposMeta.map(({ icono: Icono, ...tipo }) => <button key={tipo.id} className={metaBorrador.tipo === tipo.id ? "activo" : ""} style={{ "--goal-color": tipo.color }} onClick={() => setMetaBorrador({ tipo: tipo.id, nombre: "", objetivo: "" })}><span><Icono size={18} /></span><b>{tipo.nombre}</b><small>{tipo.tiempo}</small></button>)}</div>
            <div className="setup-goal-builder" style={{ "--goal-color": tiposMeta.find((tipo) => tipo.id === metaBorrador.tipo).color }}>
              <div className="setup-goal-suggestions"><span>Ideas rápidas:</span>{tiposMeta.find((tipo) => tipo.id === metaBorrador.tipo).ejemplos.map((ejemplo) => <button key={ejemplo} onClick={() => setMetaBorrador({ ...metaBorrador, nombre: ejemplo })}>{ejemplo}</button>)}</div>
              <div className="setup-goal-fields"><label><span>¿Para qué quieres ahorrar?</span><input value={metaBorrador.nombre} onChange={(e) => setMetaBorrador({ ...metaBorrador, nombre: e.target.value })} placeholder={metaBorrador.tipo === "libre" ? "Ej. Ahorro general" : "Ej. Televisor nuevo"} /></label><label><span>¿Cuánto quieres reunir? <small>Opcional</small></span><div><b>€</b><input inputMode="decimal" value={metaBorrador.objetivo} onChange={(e) => setMetaBorrador({ ...metaBorrador, objetivo: e.target.value })} placeholder="0,00" /></div></label><button disabled={!metaBorrador.nombre.trim()} onClick={agregarMeta}><Plus size={16} /> Añadir meta</button></div>
            </div>
            {metas.length > 0 && <div className="setup-added-goals"><div><b>Tus metas</b><span>{metas.length} añadida{metas.length !== 1 ? "s" : ""}</span></div><section>{metas.map((meta) => { const tipo = tiposMeta.find((item) => item.id === meta.tipo); const Icono = tipo.icono; return <article key={meta.id}><span style={{ color: tipo.color, background: `${tipo.color}18` }}><Icono size={17} /></span><div><b>{meta.nombre}</b><small>{tipo.nombre}{meta.objetivo ? ` · ${euros.format(meta.objetivo)}` : " · Sin cantidad fija"}</small></div><button onClick={() => setMetas((actuales) => actuales.filter((item) => item.id !== meta.id))}><Trash2 size={15} /></button></article>; })}</section><small><Plus size={13} /> Elige otro plazo arriba para añadir una meta adicional.</small></div>}
          </div>}

          {paso === 5 && <div className="setup-step setup-debts-step">
            <span className="setup-eyebrow">{tr("TUS DEUDAS", "YOUR DEBTS")}</span>
            <h1>{tr("¿Tienes alguna deuda pendiente?", "Do you have any outstanding debt?")}</h1>
            <p>{tr("La añadiremos a tu presupuesto y calcularemos cuánto te falta para terminar de pagarla.", "We'll add it to your budget and calculate how long it will take to pay off.")}</p>
            <div className="setup-debt-answer"><button className={tieneDeudas === true ? "activo si" : ""} onClick={() => setTieneDeudas(true)}><span><ReceiptText size={20} /></span><div><b>{tr("Sí, tengo alguna deuda", "Yes, I have debt")}</b><small>{tr("Quiero añadirla y ver cuándo terminaré", "I want to add it and see when it ends")}</small></div>{tieneDeudas === true && <i><Check size={13} /></i>}</button><button className={tieneDeudas === false ? "activo no" : ""} onClick={() => { setTieneDeudas(false); setDeudas([]); }}><span><ShieldCheck size={20} /></span><div><b>{tr("No tengo deudas", "I have no debt")}</b><small>{tr("Continuar con mi planificación", "Continue with my plan")}</small></div>{tieneDeudas === false && <i><Check size={13} /></i>}</button></div>
            {tieneDeudas === false && <div className="setup-debt-free"><ShieldCheck size={19} /><div><b>¡Eso te da una gran ventaja!</b><span>Podrás concentrar tu dinero disponible en ahorro y metas.</span></div></div>}
            {tieneDeudas === true && <>
              <div className="setup-debt-types">{tiposDeuda.map(({ icono: Icono, ...tipo }) => <button key={tipo.id} className={deudaBorrador.tipo === tipo.id ? "activo" : ""} style={{ "--debt-color": tipo.color }} onClick={() => setDeudaBorrador({ ...deudaBorrador, tipo: tipo.id, nombre: deudaBorrador.nombre || (tipo.id === "coche" ? "Financiación del coche" : tipo.id === "tarjeta" ? "Tarjeta de crédito" : "") })}><span><Icono size={17} /></span><b>{tipo.nombre}</b></button>)}</div>
              <div className="setup-debt-builder" style={{ "--debt-color": tiposDeuda.find((tipo) => tipo.id === deudaBorrador.tipo).color }}><div className="setup-debt-fields"><label><span>Nombre</span><input value={deudaBorrador.nombre} onChange={(e) => setDeudaBorrador({ ...deudaBorrador, nombre: e.target.value })} placeholder="Ej. Financiación del coche" /></label><label><span>Saldo pendiente</span><div><b>€</b><input inputMode="decimal" value={deudaBorrador.saldo} onChange={(e) => setDeudaBorrador({ ...deudaBorrador, saldo: e.target.value })} placeholder="3.000" /></div></label><label><span>Cuota mensual</span><div><b>€</b><input inputMode="decimal" value={deudaBorrador.cuota} onChange={(e) => setDeudaBorrador({ ...deudaBorrador, cuota: e.target.value })} placeholder="130" /></div></label><label><span>Interés/TAE <small>Opcional</small></span><div><input inputMode="decimal" value={deudaBorrador.tae} onChange={(e) => setDeudaBorrador({ ...deudaBorrador, tae: e.target.value })} placeholder="0" /><b>%</b></div></label><button disabled={!deudaBorrador.nombre.trim() || !numeroFlexible(deudaBorrador.saldo) || !numeroFlexible(deudaBorrador.cuota)} onClick={agregarDeuda}><Plus size={15} /> Añadir</button></div><small><Lightbulb size={13} /> Si indicas la TAE, la fecha estimada será más realista. La cuota se sumará a tus gastos previstos.</small></div>
              {deudas.length > 0 && <div className="setup-added-debts"><div><b>Deudas añadidas</b><span>{euros.format(totalCuotasDeuda)}/mes</span></div>{deudas.map((deuda) => { const tipo = tiposDeuda.find((item) => item.id === deuda.tipo); const Icono = tipo.icono; const plan = calcularPlanDeuda(deuda.saldo, deuda.cuota, deuda.tae); return <article key={deuda.id}><span style={{ color: tipo.color, background: `${tipo.color}18` }}><Icono size={17} /></span><div><b>{deuda.nombre}</b><small>{euros.format(deuda.saldo)} pendientes · {euros.format(deuda.cuota)}/mes</small></div><div>{plan.insuficiente ? <em>Cuota insuficiente</em> : <><b>{plan.cuotas} cuotas</b><small>Hasta {plan.fecha}</small></>}</div><button onClick={() => setDeudas((actuales) => actuales.filter((item) => item.id !== deuda.id))}><Trash2 size={15} /></button></article>; })}</div>}
            </>}
          </div>}

          {paso === 6 && <div className="setup-step">
            <span className="setup-eyebrow">{tr("TU PRIMER RESUMEN", "YOUR FIRST OVERVIEW")}</span>
            <h1>{tr("Así se reparte tu mes", "How your month is divided")}</h1>
            <p>{tr("Esta es tu previsión inicial. Después compararemos lo previsto con lo que gastas de verdad.", "This is your initial forecast. Later we'll compare it with what you actually spend.")}</p>
            <div className="setup-summary">
              <div className="setup-donut" style={{ background: fondoGrafica }}><div><span>{tr("Gastos previstos", "Expected expenses")}</span><b>{euros.format(totalGastos)}</b><small>{pctGastos}% {tr("de tus ingresos", "of your income")}</small></div></div>
              <div className="setup-legend">
                {segmentos.map((s) => <div key={s.id}><i style={{ background: s.color }} /><span>{s.nombre}</span><b>{euros.format(s.valor)}</b><small>{s.porcentaje}%</small></div>)}
              </div>
            </div>
            <div className={`setup-result ${restante < 0 ? "negativo" : ""}`}><span><ReceiptText size={17} /> {tr("Después de tus gastos previstos te quedarían", "After expected expenses, you would have")}</span><b>{euros.format(restante)}</b></div>
          </div>}

          <footer className="setup-footer">
            <button className="setup-back" disabled={paso === 0} onClick={() => setPaso((p) => p - 1)}><ChevronLeft size={17} /> {tr("Atrás", "Back")}</button>
            {paso < 6 ? <button className="setup-next" disabled={(paso === 1 && !Number(ingreso)) || (paso === 5 && tieneDeudas === null)} onClick={() => setPaso((p) => p + 1)}>{tr("Continuar", "Continue")} <ArrowRight size={17} /></button> : <button className="setup-next finish" onClick={terminar}>{tr("Ver mi panel", "View dashboard")} <Sparkles size={16} /></button>}
          </footer>
        </section>
        <button className="setup-skip" onClick={paso === 6 ? terminar : () => setPaso((p) => p + 1)}>{tr("Completaré los detalles más tarde", "I'll complete the details later")}</button>
      </main>
      {suscripcionesAbiertas && <div className="subscription-backdrop" onMouseDown={() => setSuscripcionesAbiertas(false)}>
        <section className="subscription-modal" onMouseDown={(e) => e.stopPropagation()}>
          <button className="subscription-close" onClick={() => setSuscripcionesAbiertas(false)}><X size={18} /></button>
          <span className="setup-eyebrow">CATÁLOGO DE SUSCRIPCIONES</span><h2>¿Qué tipo de suscripción quieres añadir?</h2><p>Elige un servicio frecuente o crea uno personalizado. Los precios son orientativos y puedes modificarlos.</p>
          <div className="subscription-search"><Search size={16} /><input autoFocus value={busquedaSuscripcion} onChange={(e) => setBusquedaSuscripcion(e.target.value)} placeholder="Buscar Netflix, Game Pass, iCloud..." /></div>
          <div className="subscription-filters">{tiposSuscripcion.map((tipo) => <button key={tipo.id} className={filtroSuscripcion === tipo.id ? "activo" : ""} onClick={() => setFiltroSuscripcion(tipo.id)}>{tipo.nombre}</button>)}</div>
          <div className="subscription-catalog">{serviciosVisibles.map((servicio) => <article key={servicio.id} className={servicio.activo ? "activo" : ""}>
            <button className="subscription-select" onClick={() => alternarServicio(servicio.id)}><span style={{ background: servicio.color }}>{servicio.sigla}</span><div><b>{servicio.nombre}</b><small>{tiposSuscripcion.find((t) => t.id === servicio.tipo)?.nombre}</small></div>{servicio.activo ? <i><Check size={13} /></i> : <Plus size={15} />}</button>
            {servicio.activo && <label><span>€</span><input type="number" min="0" step="0.01" value={servicio.precio} onChange={(e) => actualizarPrecioServicio(servicio.id, e.target.value)} /><small>/mes</small></label>}
          </article>)}</div>
          <div className="subscription-custom"><b>¿No aparece en la lista?</b><div><input value={personalizada.nombre} onChange={(e) => setPersonalizada({ ...personalizada, nombre: e.target.value })} placeholder="Nombre de la suscripción" /><select value={personalizada.tipo} onChange={(e) => setPersonalizada({ ...personalizada, tipo: e.target.value })}>{tiposSuscripcion.filter((t) => t.id !== "todas").map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select><label><span>€</span><input type="number" min="0" step="0.01" value={personalizada.precio} onChange={(e) => setPersonalizada({ ...personalizada, precio: e.target.value })} placeholder="0,00" /></label><button onClick={agregarPersonalizada}>Añadir</button></div></div>
          <footer><span>{servicios.filter((s) => s.activo).length} seleccionadas · <b>{totalSuscripciones.toFixed(2).replace(".", ",")} €/mes</b></span><button onClick={() => setSuscripcionesAbiertas(false)}>Listo</button></footer>
        </section>
      </div>}
    </div>
  );
}
