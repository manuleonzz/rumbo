"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import FinanceOnboarding from "./FinanceOnboarding";
import IncomeManager from "./IncomeManager";
import AppControls from "./AppControls";
import SettingsPage from "./SettingsPage";
import { crearCobrosDelPeriodo, desplazarPeriodo, etiquetaPeriodo, fechaEnPeriodo, fechaLocalISO, formatearFecha, normalizarFechaMovimiento, periodoActual, periodoDeFecha } from "../src/lib/monthly";
import { buscarMovimientoDePago, crearPagosPrevistos, normalizarPagosPrevistos } from "../src/lib/recurring";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Coffee,
  CreditCard,
  Download,
  Film,
  Flag,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  ReceiptText,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";

const MONEDIN_IMG = `${import.meta.env.BASE_URL}monedin.png`;

const iconos = { hogar: Home, electricidad: Sparkles, comida: ShoppingBasket, transporte: Car, ocio: Coffee, restaurantes: Utensils, ropa: ShoppingBasket, entretenimiento: Film, suscripciones: CreditCard, deudas: WalletCards };

const categoriasIniciales = [
  { id: "hogar", nombre: "Hogar", usado: 617, limite: 700, color: "#5771e5" },
  { id: "comida", nombre: "Comida", usado: 268, limite: 400, color: "#26a889" },
  { id: "transporte", nombre: "Transporte", usado: 194, limite: 300, color: "#eea83d" },
  { id: "ocio", nombre: "Ocio", usado: 126.5, limite: 220, color: "#e56d7a" },
];

const periodoDemo = periodoActual();
const movimientosIniciales = [
  { id: 1, nombre: "Jumbo", categoria: "comida", fechaISO: fechaEnPeriodo(periodoDemo, 20), importe: 42.8 },
  { id: 2, nombre: "Shell", categoria: "transporte", fechaISO: fechaEnPeriodo(periodoDemo, 19), importe: 58.2 },
  { id: 3, nombre: "Alquiler", categoria: "hogar", fechaISO: fechaEnPeriodo(periodoDemo, 15), importe: 617 },
  { id: 4, nombre: "Café y brunch", categoria: "restaurantes", fechaISO: fechaEnPeriodo(periodoDemo, 13), importe: 27.5 },
  { id: 5, nombre: "Vue Cinema", categoria: "entretenimiento", fechaISO: fechaEnPeriodo(periodoDemo, 12), importe: 32 },
  { id: 6, nombre: "Netflix", categoria: "suscripciones", fechaISO: fechaEnPeriodo(periodoDemo, 10), importe: 13.99 },
  { id: 7, nombre: "Ziggo", categoria: "electricidad", fechaISO: fechaEnPeriodo(periodoDemo, 8), importe: 23.75 },
  { id: 8, nombre: "H&M", categoria: "ropa", fechaISO: fechaEnPeriodo(periodoDemo, 6), importe: 49.9 },
];

const firmasMovimientosDemo = new Set(movimientosIniciales.map((movimiento) =>
  `${movimiento.id}|${movimiento.nombre}|${movimiento.categoria}|${movimiento.importe}`
));

function esMovimientoDeEjemplo(movimiento) {
  return firmasMovimientosDemo.has(`${movimiento.id}|${movimiento.nombre}|${movimiento.categoria}|${movimiento.importe}`);
}

function limpiarDatosReales(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return {};
  const limpio = { ...snapshot };
  const movimientosGuardados = Array.isArray(limpio.movimientos) ? limpio.movimientos : [];
  const conteniaEjemplos = movimientosGuardados.some(esMovimientoDeEjemplo);

  const movimientosReales = movimientosGuardados
    .filter((movimiento) => !esMovimientoDeEjemplo(movimiento))
    .map((movimiento) => ({ ...movimiento, fechaISO: normalizarFechaMovimiento(movimiento) }));
  limpio.movimientos = movimientosReales;

  if (conteniaEjemplos) {
    if (Array.isArray(limpio.categorias)) {
      limpio.categorias = limpio.categorias.map((categoria) => ({
        ...categoria,
        usado: movimientosReales
          .filter((movimiento) => movimiento.categoria === categoria.id)
          .reduce((total, movimiento) => total + Number(movimiento.importe || 0), 0),
      }));
    }
  }

  if (Array.isArray(limpio.cobros)) {
    limpio.cobros = limpio.cobros.map((cobro, index) => {
      const incrementoDemo = (index + 1) * 20;
      const esImporteDeEjemplo = cobro?.id === `pago-${index + 1}` && Number(cobro.real) === Number(cobro.previsto) + incrementoDemo;
      return esImporteDeEjemplo ? { ...cobro, real: null } : cobro;
    });
  }

  const tieneConfiguracionAnterior =
    Array.isArray(limpio.categorias) && limpio.categorias.length > 0 &&
    (Array.isArray(limpio.cobros) || Boolean(limpio.cobrosPorMes) || Boolean(limpio.frecuenciaCobro));
  if (tieneConfiguracionAnterior) limpio.configurado = true;
  return limpio;
}

function prepararCobrosPorMes(snapshot, frecuencia, ingresoPorPago, esDemo = false) {
  if (snapshot?.cobrosPorMes && typeof snapshot.cobrosPorMes === "object") {
    return Object.fromEntries(Object.entries(snapshot.cobrosPorMes).map(([periodo, cobros]) => [
      periodo,
      Array.isArray(cobros) ? cobros.map((cobro, index) => ({
        ...cobro,
        fechaISO: /^\d{4}-\d{2}-\d{2}$/.test(cobro.fechaISO || "") ? cobro.fechaISO : fechaEnPeriodo(periodo, frecuencia === "semanal" ? (index + 1) * 7 : frecuencia === "dos-mes" ? (index ? 30 : 15) : 25),
      })) : [],
    ]));
  }
  if (Array.isArray(snapshot?.cobros) && snapshot.cobros.length) {
    const periodo = periodoActual();
    return { [periodo]: snapshot.cobros.map((cobro, index) => ({
      ...cobro,
      id: cobro.extra ? cobro.id : `pago-${periodo}-${index + 1}`,
      fechaISO: (() => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(cobro.fechaISO || "")) return cobro.fechaISO;
        const timestampExtra = cobro.extra ? Number(String(cobro.id || "").replace(/^extra-/, "")) : 0;
        if (timestampExtra > 1000000000000) return fechaLocalISO(new Date(timestampExtra));
        return fechaEnPeriodo(periodo, frecuencia === "semanal" ? (index + 1) * 7 : frecuencia === "dos-mes" ? (index ? 30 : 15) : 25);
      })(),
    })) };
  }
  return esDemo ? { [periodoActual()]: crearCobrosDelPeriodo(frecuencia, ingresoPorPago, periodoActual(), true) } : {};
}

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

const tiposMetaPanel = {
  corto: { nombre: "Corto plazo", tiempo: "Hasta 1 año", color: "#ef7d4f", icono: Rocket },
  medio: { nombre: "Medio plazo", tiempo: "De 1 a 5 años", color: "#eea83d", icono: Car },
  largo: { nombre: "Largo plazo", tiempo: "Más de 5 años", color: "#5771e5", icono: Home },
  libre: { nombre: "Ahorro sin objetivo", tiempo: "Sin fecha límite", color: "#26a889", icono: ShieldCheck },
};

const tiposDeudaPanel = {
  coche: { nombre: "Coche", color: "#eea83d", icono: Car },
  tarjeta: { nombre: "Tarjeta", color: "#e56d7a", icono: CreditCard },
  prestamo: { nombre: "Préstamo", color: "#8b65d9", icono: WalletCards },
  otra: { nombre: "Otra deuda", color: "#64748b", icono: CircleHelp },
};
const formatoFechaDeuda = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
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
  const fecha = new Date(); fecha.setMonth(fecha.getMonth() + cuotas);
  return { cuotas, fecha: formatoFechaDeuda.format(fecha), insuficiente: false };
}

export default function DemoDashboard({ onExit, settings, cloudData = null, user = null, onSignOut = null }) {
  const esCuentaReal = Boolean(cloudData);
  const snapshot = esCuentaReal ? limpiarDatosReales(cloudData?.cache?.rumbo_v2 || {}) : {};
  const periodoInicial = periodoActual();
  const ultimoPeriodoConocido = useRef(periodoInicial);
  const frecuenciaInicial = snapshot.frecuenciaCobro || "semanal";
  const ingresoInicial = Number(snapshot.ingresoPorPago ?? snapshot.cobros?.find((cobro) => !cobro.extra)?.previsto ?? 650);
  const [configurando, setConfigurando] = useState(!snapshot.configurado);
  const [periodoActivo, setPeriodoActivo] = useState(periodoInicial);
  const [frecuenciaCobro, setFrecuenciaCobro] = useState(frecuenciaInicial);
  const [ingresoPorPago, setIngresoPorPago] = useState(ingresoInicial);
  const [cobrosPorMes, setCobrosPorMes] = useState(() => prepararCobrosPorMes(snapshot, frecuenciaInicial, ingresoInicial, !esCuentaReal));
  const [ingresosAbiertos, setIngresosAbiertos] = useState(false);
  const [categorias, setCategorias] = useState(() => (Array.isArray(snapshot.categorias) && snapshot.categorias.length ? snapshot.categorias : categoriasIniciales).map((categoria) => ({ ...categoria, usado: 0 })));
  const [movimientos, setMovimientos] = useState(() => (Array.isArray(snapshot.movimientos) ? snapshot.movimientos : esCuentaReal ? [] : movimientosIniciales).map((movimiento) => ({ ...movimiento, fechaISO: normalizarFechaMovimiento(movimiento) })));
  const [servicios, setServicios] = useState(() => Array.isArray(snapshot.servicios) ? snapshot.servicios : []);
  const [pagosPrevistos, setPagosPrevistos] = useState(() => normalizarPagosPrevistos(snapshot.pagosPrevistos, snapshot.categorias || categoriasIniciales, snapshot.servicios || []));
  const [pagoModal, setPagoModal] = useState(null);
  const [mostrarTodosPagos, setMostrarTodosPagos] = useState(false);
  const [metas, setMetas] = useState(Array.isArray(snapshot.metas) ? snapshot.metas : []);
  const [metaModal, setMetaModal] = useState(false);
  const [deudas, setDeudas] = useState(Array.isArray(snapshot.deudas) ? snapshot.deudas : []);
  const [deudaModal, setDeudaModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [categoriaMenu, setCategoriaMenu] = useState(false);
  const [formError, setFormError] = useState("");
  const [aviso, setAviso] = useState("");
  const [vista, setVista] = useState("resumen");
  const [menu, setMenu] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ nombre: "", importe: "", categoria: "comida", fecha: fechaLocalISO() });
  const tr = (es, en) => settings.language === "en" ? en : es;

  const movimientosDelPeriodo = useMemo(() => movimientos
    .filter((movimiento) => periodoDeFecha(movimiento.fechaISO) === periodoActivo)
    .sort((a, b) => String(b.fechaISO).localeCompare(String(a.fechaISO)) || Number(b.id) - Number(a.id)), [movimientos, periodoActivo]);
  const categoriasDelPeriodo = useMemo(() => categorias.map((categoria) => ({
    ...categoria,
    usado: movimientosDelPeriodo
      .filter((movimiento) => movimiento.categoria === categoria.id)
      .reduce((total, movimiento) => total + Number(movimiento.importe || 0), 0),
  })), [categorias, movimientosDelPeriodo]);
  const cobros = useMemo(() => cobrosPorMes[periodoActivo] || crearCobrosDelPeriodo(frecuenciaCobro, ingresoPorPago, periodoActivo, !esCuentaReal), [cobrosPorMes, periodoActivo, frecuenciaCobro, ingresoPorPago, esCuentaReal]);
  const setCobros = (actualizador) => setCobrosPorMes((anteriores) => {
    const actuales = anteriores[periodoActivo] || crearCobrosDelPeriodo(frecuenciaCobro, ingresoPorPago, periodoActivo, false);
    const siguientes = typeof actualizador === "function" ? actualizador(actuales) : actualizador;
    return { ...anteriores, [periodoActivo]: siguientes };
  });
  const gastos = useMemo(() => movimientosDelPeriodo.reduce((total, movimiento) => total + Number(movimiento.importe || 0), 0), [movimientosDelPeriodo]);
  const ingresos = useMemo(() => cobros.reduce((total, cobro) => total + (cobro.real === null ? cobro.previsto : cobro.real), 0), [cobros]);
  const disponible = ingresos - gastos;
  const filtrados = movimientosDelPeriodo.filter((m) => m.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const categoriaSeleccionada = categoriasDelPeriodo.find((categoria) => categoria.id === form.categoria) || categoriasDelPeriodo[0];
  const presupuestoTotal = categorias.reduce((total, categoria) => total + Number(categoria.limite || 0), 0);
  const porcentajePresupuesto = presupuestoTotal ? Math.min(100, Math.round((gastos / presupuestoTotal) * 100)) : 0;
  const etiquetaMes = etiquetaPeriodo(periodoActivo, settings.language);
  const nombreUsuario = user?.user_metadata?.name || user?.email?.split("@")[0] || "Manuel";
  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? tr("Buenos días", "Good morning") : horaActual < 19 ? tr("Buenas tardes", "Good afternoon") : tr("Buenas noches", "Good evening");
  const metaDestacada = metas.find((meta) => Number(meta.objetivo || 0) > 0);
  const importeFormulario = Number(String(form.importe).replace(",", "."));
  const importeValido = Number.isFinite(importeFormulario) && importeFormulario > 0;
  const pagosConEstado = useMemo(() => pagosPrevistos.map((pago) => ({
    ...pago,
    movimiento: buscarMovimientoDePago(pago, movimientos, periodoActivo),
  })), [pagosPrevistos, movimientos, periodoActivo]);
  const pagosPendientes = pagosConEstado.filter((pago) => !pago.movimiento);
  const totalPendiente = pagosPendientes.reduce((total, pago) => total + Number(pago.importe || 0), 0);
  const pagosVisibles = mostrarTodosPagos ? pagosConEstado : pagosConEstado.slice(0, 6);
  const periodoFuturo = periodoActivo > periodoActual();

  const abrirNuevoGasto = () => {
    const hoy = fechaLocalISO();
    const fechaSugerida = periodoActivo === periodoActual() ? hoy : fechaEnPeriodo(periodoActivo, Math.min(new Date().getDate(), 28));
    setForm((actual) => ({
      ...actual,
      categoria: categorias.some((categoria) => categoria.id === actual.categoria) ? actual.categoria : (categorias[0]?.id || ""),
      fecha: fechaSugerida,
    }));
    setModal(true);
  };

  useEffect(() => {
    if (!cloudData || configurando) return;
    cloudData.setKey("rumbo_v2", { versionDatos: 4, configurado: true, frecuenciaCobro, ingresoPorPago, cobrosPorMes, categorias: categorias.map((categoria) => ({ ...categoria, usado: 0 })), movimientos, servicios, pagosPrevistos, metas, deudas });
  }, [configurando, frecuenciaCobro, ingresoPorPago, cobrosPorMes, categorias, movimientos, servicios, pagosPrevistos, metas, deudas]);

  useEffect(() => {
    const generados = crearPagosPrevistos(categorias, servicios);
    setPagosPrevistos((actuales) => {
      const porId = new Map(actuales.map((pago) => [pago.id, pago]));
      const siguientes = generados.map((generado) => ({ ...generado, ...(porId.get(generado.id) || {}), importe: generado.importe, nombre: generado.nombre, categoria: generado.categoria, color: generado.color }));
      return JSON.stringify(siguientes) === JSON.stringify(actuales) ? actuales : siguientes;
    });
  }, [categorias, servicios]);

  useEffect(() => {
    const comprobarCambioDeMes = () => {
      const nuevoPeriodo = periodoActual();
      const anterior = ultimoPeriodoConocido.current;
      if (nuevoPeriodo !== anterior) {
        setPeriodoActivo((activo) => activo === anterior ? nuevoPeriodo : activo);
        ultimoPeriodoConocido.current = nuevoPeriodo;
      }
    };
    const intervalo = window.setInterval(comprobarCambioDeMes, 60000);
    return () => window.clearInterval(intervalo);
  }, []);

  const guardarMovimiento = (e) => {
    e.preventDefault();
    const importe = Number(String(form.importe).replace(",", "."));
    if (!form.nombre.trim()) {
      setFormError("Escribe el nombre o la descripción del gasto.");
      return;
    }
    if (!Number.isFinite(importe) || importe <= 0) {
      setFormError("Introduce un importe mayor que 0 €. Puedes usar coma o punto.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fecha || "")) {
      setFormError("Selecciona una fecha válida para el gasto.");
      return;
    }
    if (form.fecha > fechaLocalISO()) {
      setFormError("La fecha del gasto no puede estar en el futuro.");
      return;
    }
    if (!categorias.some((categoria) => categoria.id === form.categoria)) {
      setFormError(tr("Selecciona una categoría válida.", "Select a valid category."));
      return;
    }
    setFormError("");
    setMovimientos((actuales) => [
      { id: Date.now(), nombre: form.nombre.trim(), categoria: form.categoria, fechaISO: form.fecha, importe },
      ...actuales,
    ]);
    setPeriodoActivo(periodoDeFecha(form.fecha));
    setForm({ nombre: "", importe: "", categoria: categorias[0]?.id || "", fecha: fechaLocalISO() });
    setCategoriaMenu(false);
    setModal(false);
    setAviso(`Gasto de ${euros.format(importe)} añadido correctamente`);
    window.setTimeout(() => setAviso(""), 3200);
  };

  const fechaParaPagoPrevisto = () => periodoActivo === periodoActual()
    ? fechaLocalISO()
    : fechaEnPeriodo(periodoActivo, Math.min(new Date().getDate(), 28));

  const registrarPagoPrevisto = (pago, importe = pago.importe, fecha = fechaParaPagoPrevisto()) => {
    if (periodoFuturo) return;
    const movimientoExistente = buscarMovimientoDePago(pago, movimientos, periodoActivo);
    if (movimientoExistente) return;
    const importeNumerico = Number(String(importe).replace(",", "."));
    if (!Number.isFinite(importeNumerico) || importeNumerico <= 0) return;
    setMovimientos((actuales) => [{
      id: Date.now(),
      recurrenteId: pago.id,
      nombre: pago.nombre,
      categoria: pago.categoria,
      fechaISO: fecha,
      importe: importeNumerico,
    }, ...actuales]);
    setPagoModal(null);
    setAviso(tr(`${pago.nombre} registrado por ${euros.format(importeNumerico)}`, `${pago.nombre} recorded for ${euros.format(importeNumerico)}`));
    window.setTimeout(() => setAviso(""), 3200);
  };

  const alternarPagoPrevisto = (pago) => {
    const movimiento = buscarMovimientoDePago(pago, movimientos, periodoActivo);
    if (movimiento) {
      setMovimientos((actuales) => actuales.filter((item) => item.id !== movimiento.id));
      setAviso(tr(`Se deshizo el pago de ${pago.nombre}`, `${pago.nombre} payment was undone`));
      window.setTimeout(() => setAviso(""), 3200);
      return;
    }
    if (periodoFuturo) return;
    if (pago.fijo) {
      registrarPagoPrevisto(pago);
      return;
    }
    setPagoModal({ pago, importe: String(pago.importe), fecha: fechaParaPagoPrevisto(), error: "" });
  };

  const completarConfiguracion = async ({ frecuencia, ingresoPorPago, categorias: nuevasCategorias, servicios: nuevosServicios = [], metas: nuevasMetas = [], deudas: nuevasDeudas = [] }) => {
    setFrecuenciaCobro(frecuencia);
    setIngresoPorPago(Number(ingresoPorPago || 0));
    const nuevosCobros = crearCobrosDelPeriodo(frecuencia, ingresoPorPago, periodoActivo, !esCuentaReal);
    const nuevosCobrosPorMes = { [periodoActivo]: nuevosCobros };
    const categoriasConfiguradas = nuevasCategorias.map((categoria, index) => ({
      ...categoria,
      usado: esCuentaReal ? 0 : Math.round(categoria.limite * [0.62, 0.48, 0.55, 0.41, 0.36, 0.28, 0.72][index % 7] * 100) / 100,
    }));
    const movimientosConfigurados = esCuentaReal ? [] : movimientos;
    const pagosConfigurados = crearPagosPrevistos(categoriasConfiguradas, nuevosServicios);
    setCobrosPorMes(nuevosCobrosPorMes);
    setCategorias(categoriasConfiguradas);
    setMovimientos(movimientosConfigurados);
    setServicios(nuevosServicios);
    setPagosPrevistos(pagosConfigurados);
    setMetas(nuevasMetas);
    setDeudas(nuevasDeudas);
    if (cloudData) {
      await cloudData.setKey("rumbo_v2", {
        versionDatos: 4,
        configurado: true,
        frecuenciaCobro: frecuencia,
        ingresoPorPago: Number(ingresoPorPago || 0),
        cobrosPorMes: nuevosCobrosPorMes,
        categorias: categoriasConfiguradas,
        movimientos: movimientosConfigurados,
        servicios: nuevosServicios,
        pagosPrevistos: pagosConfigurados,
        metas: nuevasMetas,
        deudas: nuevasDeudas,
      }, { immediate: true });
    }
    setConfigurando(false);
  };

  if (configurando) return <FinanceOnboarding onComplete={completarConfiguracion} onCancel={onExit} settings={settings} isDemo={!cloudData} />;

  return (
    <div className="demo-app">
      <aside className={menu ? "demo-sidebar abierto" : "demo-sidebar"}>
        <div className="demo-side-head">
          <button className="demo-logo" onClick={onExit} aria-label={tr("Volver a la portada de Rumbo", "Return to the Rumbo home page")}><img src={MONEDIN_IMG} alt="" /><b>Rumbo</b></button>
          <button onClick={() => setMenu(false)} className="demo-side-close"><X size={18} /></button>
        </div>
        <div className="demo-profile">
          <span>{user?.email?.slice(0, 2).toUpperCase() || "ML"}</span><div><b>{user?.user_metadata?.name || user?.email?.split("@")[0] || "Manuel"}</b><small>{tr("Cuenta personal", "Personal account")}</small></div><ChevronDown size={15} />
        </div>
        <nav>
          <span className="demo-nav-label">{tr("GENERAL", "GENERAL")}</span>
          <button className={vista === "resumen" ? "activo" : ""} onClick={() => { setVista("resumen"); setMenu(false); }}><LayoutDashboard size={18} /> {tr("Resumen", "Overview")}</button>
          <button onClick={() => setIngresosAbiertos(true)}><WalletCards size={18} /> {tr("Ingresos", "Income")}</button>
          <button className={vista === "movimientos" ? "activo" : ""} onClick={() => { setVista("movimientos"); setMenu(false); }}><CreditCard size={18} /> {tr("Movimientos", "Transactions")} <i>{movimientosDelPeriodo.length}</i></button>
          <button className={vista === "deudas" ? "activo" : ""} onClick={() => { setVista("deudas"); setMenu(false); }}><WalletCards size={18} /> {tr("Deudas", "Debts")} {deudas.length > 0 && <i>{deudas.length}</i>}</button>
          <button className={vista === "presupuestos" ? "activo" : ""} onClick={() => { setVista("presupuestos"); setMenu(false); }}><BarChart3 size={18} /> {tr("Presupuestos", "Budgets")}</button>
          <button className={vista === "metas" ? "activo" : ""} onClick={() => { setVista("metas"); setMenu(false); }}><Target size={18} /> {tr("Metas", "Goals")} {metas.length > 0 && <i>{metas.length}</i>}</button>
          <span className="demo-nav-label">{tr("CUENTA", "ACCOUNT")}</span>
          <button className={vista === "ajustes" ? "activo" : ""} onClick={() => { setVista("ajustes"); setMenu(false); }}><Settings size={18} /> {tr("Ajustes", "Settings")}</button>
          <button><CircleHelp size={18} /> {tr("Ayuda", "Help")}</button>
          {onSignOut && <button onClick={() => window.confirm(tr("¿Quieres cerrar sesión? Tus datos ya están guardados.", "Sign out? Your data is already saved.")) && onSignOut()}><LogOut size={18} /> {tr("Cerrar sesión", "Sign out")}</button>}
        </nav>
        <div className="demo-side-goal">
          <span><Flag size={16} /> {metaDestacada ? metaDestacada.nombre : tr("Tus metas", "Your goals")}</span>
          {metaDestacada ? <><b>{euros.format(metaDestacada.ahorrado || 0)} <small>{tr("de", "of")} {euros.format(metaDestacada.objetivo)}</small></b><div><i style={{ width: `${Math.min(100, (Number(metaDestacada.ahorrado || 0) / Number(metaDestacada.objetivo)) * 100)}%` }} /></div><small>{Math.round((Number(metaDestacada.ahorrado || 0) / Number(metaDestacada.objetivo)) * 100)}% {tr("completado", "complete")}</small></> : <><b>0 <small>{tr("metas activas", "active goals")}</small></b><small>{tr("Crea una meta cuando estés listo.", "Create a goal when you're ready.")}</small></>}
        </div>
        <button className="demo-exit" onClick={onExit}><ArrowLeft size={16} /> {tr("Volver a la portada", "Back to home")}</button>
      </aside>

      <main className="demo-main">
        <header className="demo-topbar">
          <button className="demo-mobile-menu" onClick={() => setMenu(true)}><Menu size={20} /></button>
          <div className="demo-search"><Search size={17} /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder={tr("Buscar movimientos...", "Search transactions...")} /></div>
          <div className="demo-top-actions">
            <div className="demo-preferences"><small>{tr("APARIENCIA", "APPEARANCE")}</small><AppControls {...settings} compact /></div>
            <span className={`demo-mode ${cloudData?.error ? "sync-warning" : ""}`}><Sparkles size={14} /> {cloudData ? cloudData.error ? tr("Guardado local", "Saved locally") : tr("Sincronizado", "Synced") : tr("Modo demo", "Demo mode")}</span>
            <button><Bell size={18} /><i /></button>
            <button><Download size={18} /></button>
          </div>
        </header>

        <div className="demo-content">
          {vista === "movimientos" ? (
            <MovementsPage language={settings.language}
              movimientos={movimientosDelPeriodo}
              categorias={categoriasDelPeriodo}
              busqueda={busqueda}
              periodo={periodoActivo}
              onPeriodo={setPeriodoActivo}
              onAdd={abrirNuevoGasto}
              onBack={() => setVista("resumen")}
            />
          ) : vista === "metas" ? (
            <GoalsPage language={settings.language} metas={metas} setMetas={setMetas} onAdd={() => setMetaModal(true)} onBack={() => setVista("resumen")} />
          ) : vista === "deudas" ? (
            <DebtsPage language={settings.language} deudas={deudas} setDeudas={setDeudas} onAdd={() => setDeudaModal(true)} onBack={() => setVista("resumen")} />
          ) : vista === "presupuestos" ? (
            <BudgetPage language={settings.language} categorias={categoriasDelPeriodo} setCategorias={setCategorias} ingresos={ingresos} frecuencia={frecuenciaCobro} onBack={() => setVista("resumen")} />
          ) : vista === "ajustes" ? (
            <SettingsPage language={settings.language} settings={settings} frecuencia={frecuenciaCobro} onFrecuencia={setFrecuenciaCobro} categorias={categorias} onCategorias={setCategorias} onBack={() => setVista("resumen")} onNotify={(mensaje) => { setAviso(mensaje); window.setTimeout(() => setAviso(""), 3200); }} user={user} onSignOut={onSignOut} />
          ) : (<>
          <section className="demo-page-title">
            <div><span>{periodoActivo === periodoActual() ? formatearFecha(fechaLocalISO(), settings.language) : etiquetaMes}</span><h1>{saludo}, {nombreUsuario}</h1><p>{tr("Aquí tienes el rumbo de tu dinero en", "Here is the direction of your money in")} {etiquetaMes}.</p></div>
            <div className="demo-title-tools"><MonthNavigator periodo={periodoActivo} onChange={setPeriodoActivo} language={settings.language} /><div className="demo-title-actions"><button className="income" onClick={() => setIngresosAbiertos(true)}><ArrowDownRight size={18} /> {tr("Registrar ingreso", "Add income")}</button><button onClick={abrirNuevoGasto}><Plus size={18} /> {tr("Añadir gasto", "Add expense")}</button></div></div>
          </section>

          <section className="demo-summary-grid">
            <article className="demo-balance-card">
              <div className="demo-card-label"><span>{tr("Dinero disponible", "Available money")}</span><button><MoreHorizontal size={18} /></button></div>
              <strong>{euros.format(disponible)}</strong>
              <div className="demo-balance-change"><TrendingUp size={15} /> {tr("Balance del periodo seleccionado", "Balance for the selected period")}</div>
              <div className="demo-mini-chart">
                <svg viewBox="0 0 480 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5771e5" stopOpacity=".28"/><stop offset="1" stopColor="#5771e5" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,81 C45,75 55,55 96,62 S150,88 190,62 S235,38 274,50 S330,74 365,43 S424,28 480,13 L480,100 L0,100 Z" fill="url(#area)" />
                  <path d="M0,81 C45,75 55,55 96,62 S150,88 190,62 S235,38 274,50 S330,74 365,43 S424,28 480,13" fill="none" stroke="#5771e5" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </article>
            <div className="demo-stat-stack">
              <article><span className="demo-stat-icon income"><ArrowDownRight size={19} /></span><div><small>{tr("Ingresos", "Income")}</small><b>{euros.format(ingresos)}</b><em>{tr("Proyección", "Projection")}</em></div></article>
              <article><span className="demo-stat-icon expense"><ArrowUpRight size={19} /></span><div><small>{tr("Gastos", "Expenses")}</small><b>{euros.format(gastos)}</b><em className="down">{tr("Registrados", "Recorded")}</em></div></article>
            </div>
            <article className="demo-health-card">
              <div className="demo-card-label"><span>{tr("Salud del presupuesto", "Budget health")}</span><button><MoreHorizontal size={18} /></button></div>
              <div className="demo-donut" style={{ "--pct": `${porcentajePresupuesto * 3.6}deg` }}><div><b>{porcentajePresupuesto}%</b><small>{tr("utilizado", "used")}</small></div></div>
              <p><span /> {tr("Vas bien. Mantén este ritmo.", "You're doing well. Keep it up.")}</p>
            </article>
          </section>

          <section className="demo-lower-grid">
            <article className="demo-panel demo-planned-payments">
              <div className="demo-panel-head planned-payments-head">
                <div>
                  <h2>{tr("Pagos previstos", "Planned payments")}</h2>
                  <p>{periodoFuturo
                    ? tr(`Se activarán cuando comience ${etiquetaMes}`, `They will become available when ${etiquetaMes} begins`)
                    : pagosPendientes.length
                      ? tr(`${pagosPendientes.length} pendientes · ${euros.format(totalPendiente)}`, `${pagosPendientes.length} pending · ${euros.format(totalPendiente)}`)
                      : tr(`Todo pagado en ${etiquetaMes}`, `Everything paid in ${etiquetaMes}`)}</p>
                </div>
                {pagosConEstado.length > 6 && <button onClick={() => setMostrarTodosPagos((actual) => !actual)}>{mostrarTodosPagos ? tr("Ver menos", "Show less") : tr("Ver todos", "View all")} <ArrowRightIcon /></button>}
              </div>
              {pagosVisibles.length ? <div className="planned-payments-grid">
                {pagosVisibles.map((pago) => {
                  const Icono = pago.tipo === "suscripcion" ? CreditCard : (iconos[pago.categoria] || ReceiptText);
                  const pagado = Boolean(pago.movimiento);
                  return <div className={pagado ? "planned-payment pagado" : "planned-payment"} key={pago.id}>
                    <span className="planned-payment-icon" style={{ color: pago.color, background: `${pago.color || "#5771e5"}18` }}><Icono size={18} /></span>
                    <div className="planned-payment-copy"><b>{pago.nombre}</b><small>{pagado
                      ? tr(`Pagado el ${formatearFecha(pago.movimiento.fechaISO, settings.language, { corta: true })}`, `Paid ${formatearFecha(pago.movimiento.fechaISO, settings.language, { corta: true })}`)
                      : pago.fijo ? tr("Importe fijo", "Fixed amount") : tr("Confirma el importe", "Confirm amount")}</small></div>
                    <strong>{euros.format(pagado ? pago.movimiento.importe : pago.importe)}</strong>
                    <button
                      type="button"
                      className={pagado ? "planned-payment-check activo" : "planned-payment-check"}
                      disabled={periodoFuturo && !pagado}
                      onClick={() => alternarPagoPrevisto(pago)}
                      aria-label={pagado ? tr(`Deshacer pago de ${pago.nombre}`, `Undo ${pago.nombre} payment`) : tr(`Registrar pago de ${pago.nombre}`, `Record ${pago.nombre} payment`)}
                      title={pagado ? tr("Deshacer", "Undo") : periodoFuturo ? tr("Disponible al comenzar el mes", "Available when the month begins") : tr("Registrar como pagado", "Mark as paid")}
                    ><Check className="payment-check-icon" size={16} /><RotateCcw className="payment-undo-icon" size={14} /></button>
                  </div>;
                })}
              </div> : <div className="planned-payments-empty"><CheckCircle2 size={22} /><div><b>{tr("No hay pagos previstos", "No planned payments")}</b><span>{tr("Añade presupuestos o suscripciones para verlos aquí.", "Add budgets or subscriptions to see them here.")}</span></div></div>}
            </article>

            <article className="demo-panel demo-budget-panel">
              <div className="demo-panel-head"><div><h2>{tr("Presupuesto por categoría", "Budget by category")}</h2><p>{tr("Tu progreso durante", "Your progress during")} {etiquetaMes}</p></div><button onClick={() => setVista("movimientos")}>{tr("Ver todos", "View all")} <ArrowRightIcon /></button></div>
              <div className="demo-categories">
                {categoriasDelPeriodo.map((cat) => {
                  const Icono = iconos[cat.id] || Sparkles;
                  const pct = Math.min(100, Math.round((cat.usado / cat.limite) * 100));
                  return <div className="demo-category" key={cat.id}>
                    <span className="demo-category-icon" style={{ color: cat.color, background: `${cat.color}16` }}><Icono size={18} /></span>
                    <div className="demo-category-info"><div><b>{cat.nombre}</b><span>{euros.format(cat.usado)} <small>de {euros.format(cat.limite)}</small></span></div><div className="demo-category-track"><i style={{ width: `${pct}%`, background: cat.color }} /></div></div>
                    <strong>{pct}%</strong>
                  </div>;
                })}
              </div>
            </article>

            <article className="demo-panel demo-movements">
              <div className="demo-panel-head"><div><h2>{tr("Últimos movimientos", "Latest transactions")}</h2><p>{filtrados.length} {tr("resultados", "results")}</p></div><button onClick={() => setVista("movimientos")}>{tr("Ver todos", "View all")}</button></div>
              <div className="demo-movement-list">
                {filtrados.length ? filtrados.slice(0, 5).map((mov) => {
                  const Icono = mov.categoria === "comida" ? Utensils : (iconos[mov.categoria] || CreditCard);
                  return <div className="demo-movement" key={mov.id}><span><Icono size={18} /></span><div><b>{mov.nombre}</b><small>{formatearFecha(mov.fechaISO, settings.language, { corta: true })}</small></div><strong>−{euros.format(mov.importe)}</strong></div>;
                }) : <div className="demo-empty">{movimientosDelPeriodo.length
                  ? tr("No hay movimientos que coincidan con la búsqueda.", "No transactions match your search.")
                  : tr("Todavía no has registrado ningún gasto.", "You have not recorded any expenses yet.")}</div>}
              </div>
            </article>
          </section>

          <div className="demo-tip"><img src={MONEDIN_IMG} alt="Monedín" /><div><b>{tr("Consejo de Monedín", "Monedín's tip")}</b><p>{tr(`Te quedan ${euros.format(Math.max(0, (categoriasDelPeriodo.find((c) => c.id === "comida")?.limite || 0) - (categoriasDelPeriodo.find((c) => c.id === "comida")?.usado || 0)))} para supermercado en ${etiquetaMes}.`, `You have ${euros.format(Math.max(0, (categoriasDelPeriodo.find((c) => c.id === "comida")?.limite || 0) - (categoriasDelPeriodo.find((c) => c.id === "comida")?.usado || 0)))} left for groceries in ${etiquetaMes}.`)}</p></div><button><X size={16} /></button></div>
          </>)}
        </div>
      </main>

      {modal && (
        <div className="demo-modal-backdrop" onMouseDown={() => { setModal(false); setFormError(""); setCategoriaMenu(false); }}>
          <form className="demo-modal" onSubmit={guardarMovimiento} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="demo-modal-close" onClick={() => { setModal(false); setFormError(""); setCategoriaMenu(false); }}><X size={18} /></button>
            <span className="demo-modal-icon"><WalletCards size={22} /></span>
            <h2>{tr("Nuevo movimiento", "New transaction")}</h2><p>{cloudData ? tr("El gasto se guardará y sincronizará con tu cuenta.", "This expense will be saved and synced with your account.") : tr("Prueba la interacción. Estos datos no se guardarán.", "Try the interaction. This preview does not save data.")}</p>
            <label>{tr("Descripción", "Description")}<input autoFocus placeholder={tr("Ej. Supermercado", "E.g. Groceries")} value={form.nombre} onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setFormError(""); }} /></label>
            <div className="demo-form-row">
              <label>{tr("Importe", "Amount")}<input type="text" inputMode="decimal" placeholder="0,00" value={form.importe} onChange={(e) => { const valor = e.target.value; if (/^\d*[.,]?\d{0,2}$/.test(valor)) { setForm({ ...form, importe: valor }); setFormError(""); } }} /></label>
              <label className="demo-category-field">{tr("Categoría", "Category")}
                <button type="button" className={categoriaMenu ? "demo-category-trigger abierto" : "demo-category-trigger"} onClick={() => setCategoriaMenu((abierto) => !abierto)}>
                  {categoriaSeleccionada && (() => { const Icono = iconos[categoriaSeleccionada.id] || CreditCard; return <span style={{ color: categoriaSeleccionada.color, background: `${categoriaSeleccionada.color}18` }}><Icono size={17} /></span>; })()}
                  <b>{categoriaSeleccionada?.nombre || "Seleccionar"}</b><ChevronDown size={16} />
                </button>
                {categoriaMenu && <div className="demo-category-menu">
                  <div><b>¿En qué lo gastaste?</b><small>Elige una categoría</small></div>
                  <section>{categorias.map((categoria) => { const Icono = iconos[categoria.id] || CreditCard; return <button type="button" className={form.categoria === categoria.id ? "seleccionada" : ""} key={categoria.id} onClick={() => { setForm({ ...form, categoria: categoria.id }); setCategoriaMenu(false); }}><span style={{ color: categoria.color, background: `${categoria.color}18` }}><Icono size={18} /></span><b>{categoria.nombre}</b>{form.categoria === categoria.id && <i>✓</i>}</button>; })}</section>
                </div>}
              </label>
            </div>
            <label className="demo-date-field">{tr("Fecha del gasto", "Expense date")}<div><CalendarDays size={17} /><input type="date" max={fechaLocalISO()} value={form.fecha} onChange={(e) => { setForm({ ...form, fecha: e.target.value }); setFormError(""); }} /></div></label>
            {formError && <div className="demo-form-error"><CircleHelp size={15} /> {formError}</div>}
            <button className="demo-modal-submit" type="submit" disabled={!importeValido}>{tr("Añadir gasto", "Add expense")}</button>
          </form>
        </div>
      )}
      {pagoModal && (
        <div className="demo-modal-backdrop" onMouseDown={() => setPagoModal(null)}>
          <form className="demo-modal planned-payment-modal" onSubmit={(e) => {
            e.preventDefault();
            const importe = Number(String(pagoModal.importe).replace(",", "."));
            if (!Number.isFinite(importe) || importe <= 0) {
              setPagoModal({ ...pagoModal, error: tr("Introduce un importe mayor que 0 €.", "Enter an amount greater than €0.") });
              return;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(pagoModal.fecha || "") || pagoModal.fecha > fechaLocalISO() || periodoDeFecha(pagoModal.fecha) !== periodoActivo) {
              setPagoModal({ ...pagoModal, error: tr(`Selecciona una fecha válida de ${etiquetaMes}.`, `Select a valid date in ${etiquetaMes}.`) });
              return;
            }
            registrarPagoPrevisto(pagoModal.pago, importe, pagoModal.fecha);
          }} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="demo-modal-close" onClick={() => setPagoModal(null)}><X size={18} /></button>
            <span className="demo-modal-icon planned"><ReceiptText size={22} /></span>
            <h2>{tr("Confirmar pago previsto", "Confirm planned payment")}</h2>
            <p>{tr("Comprueba el importe real antes de crear el movimiento.", "Check the actual amount before creating the transaction.")}</p>
            <label>{tr("Descripción", "Description")}<input value={pagoModal.pago.nombre} disabled /></label>
            <div className="demo-form-row">
              <label>{tr("Importe real", "Actual amount")}<input autoFocus type="text" inputMode="decimal" value={pagoModal.importe} onChange={(e) => { const valor = e.target.value; if (/^\d*[.,]?\d{0,2}$/.test(valor)) setPagoModal({ ...pagoModal, importe: valor, error: "" }); }} /></label>
              <label className="demo-date-field">{tr("Fecha del pago", "Payment date")}<div><CalendarDays size={17} /><input type="date" max={fechaLocalISO()} value={pagoModal.fecha} onChange={(e) => setPagoModal({ ...pagoModal, fecha: e.target.value, error: "" })} /></div></label>
            </div>
            {pagoModal.error && <div className="demo-form-error"><CircleHelp size={15} /> {pagoModal.error}</div>}
            <button className="demo-modal-submit" type="submit">{tr("Registrar pago", "Record payment")}</button>
          </form>
        </div>
      )}
      {ingresosAbiertos && <IncomeManager cobros={cobros} setCobros={setCobros} frecuencia={frecuenciaCobro} periodo={periodoActivo} language={settings.language} onClose={() => setIngresosAbiertos(false)} />}
      {metaModal && <GoalModal onClose={() => setMetaModal(false)} onSave={(meta) => { setMetas((actuales) => [...actuales, meta]); setMetaModal(false); }} />}
      {deudaModal && <DebtModal onClose={() => setDeudaModal(false)} onSave={(deuda) => { setDeudas((actuales) => [...actuales, deuda]); setDeudaModal(false); }} />}
      {aviso && <div className="demo-toast"><span>✓</span><div><b>{tr("Rumbo actualizado", "Rumbo updated")}</b><small>{aviso}</small></div></div>}
    </div>
  );
}

function BudgetPage({ categorias, setCategorias, ingresos, frecuencia, onBack, language }) {
  const [periodo, setPeriodo] = useState("mes");
  const [categoriaActivaId, setCategoriaActivaId] = useState(categorias[0]?.id || "");
  const tr = (es, en) => language === "en" ? en : es;
  const factorCobro = frecuencia === "semanal" ? 52 / 12 : frecuencia === "dos-mes" ? 2 : 1;
  const factorVista = periodo === "cobro" ? factorCobro : 1;
  const ingresoVista = ingresos / factorVista;
  const planTotal = categorias.reduce((total, categoria) => total + Number(categoria.limite || 0), 0);
  const gastadoTotal = categorias.reduce((total, categoria) => total + Number(categoria.usado || 0), 0);
  const librePlan = ingresos - planTotal;
  const libreVista = librePlan / factorVista;
  const baseMapa = Math.max(ingresos, planTotal, 1);
  const categoriaActiva = categorias.find((categoria) => categoria.id === categoriaActivaId) || categorias[0];
  const limiteActivoVista = (categoriaActiva?.limite || 0) / factorVista;
  const gastadoActivoVista = (categoriaActiva?.usado || 0) / factorVista;
  const porcentajeGlobal = planTotal ? Math.round((gastadoTotal / planTotal) * 100) : 0;
  const score = Math.max(0, Math.min(100, Math.round(92 - Math.max(0, porcentajeGlobal - 60) * .55 - Math.max(0, -librePlan / Math.max(ingresos, 1) * 80))));
  const categoriaMasAjustada = [...categorias].sort((a, b) => (b.usado / Math.max(b.limite, 1)) - (a.usado / Math.max(a.limite, 1)))[0];
  const semanas = [
    { nombre: "Semana 1", factor: .19 }, { nombre: "Semana 2", factor: .27 },
    { nombre: "Semana 3", factor: .31, actual: true }, { nombre: "Semana 4", factor: .23 },
  ];

  const cambiarLimite = (valorVista) => setCategorias((actuales) => actuales.map((categoria) => categoria.id === categoriaActiva.id ? { ...categoria, limite: Math.max(0, Math.round(Number(valorVista) * factorVista * 100) / 100) } : categoria));
  const moverLimite = (cambio) => cambiarLimite(Math.max(0, limiteActivoVista + cambio));

  return <div className="budget-page">
    <section className="budget-page-head"><div><button onClick={onBack}><ArrowLeft size={15} /> {tr("Volver al resumen", "Back to overview")}</button><span>{tr("TU PLAN FLEXIBLE", "YOUR FLEXIBLE PLAN")}</span><h1>{tr("Haz que cada euro tenga un lugar", "Give every euro a place")}</h1><p>{tr("Organiza tu dinero visualmente y ajusta el plan sin perder el rumbo.", "Organise your money visually and adjust the plan without losing direction.")}</p></div><div className="budget-period-switch"><button className={periodo === "mes" ? "activo" : ""} onClick={() => setPeriodo("mes")}>{tr("Este mes", "This month")}</button><button className={periodo === "cobro" ? "activo" : ""} onClick={() => setPeriodo("cobro")}>{frecuencia === "semanal" ? tr("Por semana", "Per week") : frecuencia === "dos-mes" ? tr("Por cobro", "Per payment") : tr("Por ingreso", "Per income")}</button></div></section>

    <section className="budget-map-card">
      <div className="budget-map-head"><div><span>{tr("MAPA DE TU DINERO", "YOUR MONEY MAP")}</span><h2>{librePlan >= 0 ? tr("Tu mes está cubierto", "Your month is covered") : tr("Tu plan necesita un ajuste", "Your plan needs an adjustment")}</h2><p>{librePlan >= 0 ? <>{tr("Después de repartirlo todo todavía quedan", "After allocating everything, you still have")} <b>{euros.format(libreVista)}</b> {tr("libres.", "unassigned.")}</> : <>{tr("Has repartido", "You allocated")} <b>{euros.format(Math.abs(libreVista))}</b> {tr("más de lo que ingresa.", "more than your income.")}</>}</p></div><div className={librePlan >= 0 ? "budget-score" : "budget-score danger"} style={{ "--score": `${score * 3.6}deg` }}><div><b>{score}</b><small>Rumbo</small></div></div></div>
      <div className="budget-money-map">{categorias.map((categoria) => <button key={categoria.id} title={categoria.nombre} className={categoriaActivaId === categoria.id ? "activo" : ""} style={{ width: `${(categoria.limite / baseMapa) * 100}%`, background: categoria.color }} onClick={() => setCategoriaActivaId(categoria.id)} />)}{librePlan > 0 && <i style={{ width: `${(librePlan / baseMapa) * 100}%` }} />}</div>
      <div className="budget-map-legend"><span><i className="income" /> {tr("Entra", "Income")} {euros.format(ingresoVista)}</span><span><i className="planned" /> {tr("Repartido", "Allocated")} {euros.format(planTotal / factorVista)}</span><span><i className={librePlan >= 0 ? "free" : "over"} /> {librePlan >= 0 ? tr("Libre", "Free") : tr("Falta", "Missing")} {euros.format(Math.abs(libreVista))}</span></div>
    </section>

    <section className="budget-workspace">
      <div className="budget-envelopes"><div className="budget-section-head"><div><span>{tr("SOBRES DE COLORES", "COLOUR ENVELOPES")}</span><h2>{tr("Tu semáforo de categorías", "Your category traffic lights")}</h2></div><small>{tr("Selecciona una para ajustarla", "Select one to adjust it")}</small></div><div className="budget-envelope-grid">{categorias.map((categoria) => { const Icono = iconos[categoria.id] || CreditCard; const pct = categoria.limite ? Math.round((categoria.usado / categoria.limite) * 100) : 0; const estado = pct >= 90 ? { texto: tr("Límite cerca", "Near limit"), clase: "red" } : pct >= 65 ? { texto: tr("Vigilar", "Watch"), clase: "yellow" } : { texto: tr("Con margen", "Plenty left"), clase: "green" }; return <button key={categoria.id} className={`budget-envelope ${categoriaActivaId === categoria.id ? "activo" : ""}`} style={{ "--cat-color": categoria.color, "--cat-pct": `${Math.min(100, pct) * 3.6}deg` }} onClick={() => setCategoriaActivaId(categoria.id)}><span className="budget-envelope-ring"><i><Icono size={17} /></i></span><div><b>{categoria.nombre}</b><small><i className={estado.clase} /> {estado.texto}</small></div><strong>{pct}%</strong></button>; })}</div></div>

      {categoriaActiva && <aside className="budget-tuner" style={{ "--cat-color": categoriaActiva.color }}><div className="budget-tuner-title"><span><SlidersHorizontal size={18} /></span><div><small>{tr("AJUSTE EN VIVO", "LIVE ADJUSTMENT")}</small><h2>{categoriaActiva.nombre}</h2></div></div><div className="budget-tuner-visual"><span>{tr("Presupuesto", "Budget")} {periodo === "mes" ? tr("mensual", "monthly") : tr("por cobro", "per payment")}</span><b>{euros.format(limiteActivoVista)}</b><small>{tr("Has utilizado", "You have used")} {euros.format(gastadoActivoVista)}</small></div><input className="budget-slider" type="range" min="0" max={Math.max(100, Math.ceil(ingresoVista || 1000))} step="5" value={Math.min(limiteActivoVista, Math.max(100, Math.ceil(ingresoVista || 1000)))} onChange={(e) => cambiarLimite(e.target.value)} /><div className="budget-tuner-buttons"><button onClick={() => moverLimite(-10)}>− 10 €</button><button onClick={() => moverLimite(10)}>+ 10 €</button><button onClick={() => moverLimite(50)}>+ 50 €</button></div><div className={librePlan >= 0 ? "budget-impact" : "budget-impact danger"}><Sparkles size={16} /><div><b>{tr("Impacto en tu mes", "Impact on your month")}</b><span>{librePlan >= 0 ? tr(`Te quedarían ${euros.format(libreVista)} sin asignar.`, `${euros.format(libreVista)} would remain unassigned.`) : tr(`Necesitas liberar ${euros.format(Math.abs(libreVista))}.`, `You need to free up ${euros.format(Math.abs(libreVista))}.`)}</span></div></div></aside>}
    </section>

    <section className="budget-bottom-grid"><article className="budget-rhythm"><div className="budget-section-head"><div><span>RITMO DEL MES</span><h2>Cómo se reparte tu gasto</h2></div><small>Vista aproximada</small></div><div className="budget-week-bars">{semanas.map((semana) => { const cantidad = gastadoTotal * semana.factor; const pct = Math.min(100, (cantidad / Math.max(planTotal / 4, 1)) * 100); return <div key={semana.nombre} className={semana.actual ? "actual" : ""}><span>{semana.nombre}{semana.actual && <i>Ahora</i>}</span><div><b style={{ height: `${Math.max(12, pct)}%`, background: pct > 90 ? "#e56d7a" : pct > 70 ? "#eea83d" : "#26a889" }} /></div><small>{pct > 90 ? "Alto" : pct > 70 ? "Atención" : "Bien"}</small></div>; })}</div></article><article className="budget-monedin-tip"><img src={MONEDIN_IMG} alt="Monedín" /><span>CONSEJO PERSONALIZADO</span><h2>{categoriaMasAjustada?.nombre || "Tu presupuesto"} necesita atención</h2><p>{categoriaMasAjustada ? `Es el sobre que está más cerca de llenarse. Puedes aumentar su límite o compensarlo reduciendo otra categoría.` : "Crea tus categorías para recibir recomendaciones."}</p><button onClick={() => categoriaMasAjustada && setCategoriaActivaId(categoriaMasAjustada.id)}>Ajustar este sobre <ArrowRightIcon /></button></article></section>
  </div>;
}

function DebtsPage({ deudas, setDeudas, onAdd, onBack, language }) {
  const [deudaPago, setDeudaPago] = useState(null);
  const [pago, setPago] = useState("");
  const tr = (es, en) => language === "en" ? en : es;
  const saldoTotal = deudas.reduce((total, deuda) => total + Number(deuda.saldo || 0), 0);
  const cuotasMensuales = deudas.reduce((total, deuda) => total + Number(deuda.cuota || 0), 0);
  const planes = deudas.map((deuda) => ({ deuda, ...calcularPlanDeuda(deuda.saldo, deuda.cuota, deuda.tae) }));
  const planMasLargo = planes.filter((plan) => plan.cuotas).sort((a, b) => b.cuotas - a.cuotas)[0];

  const registrarPago = (e) => {
    e.preventDefault();
    const cantidad = numeroFlexible(pago);
    if (!cantidad || cantidad <= 0) return;
    setDeudas((actuales) => actuales.map((deuda) => deuda.id === deudaPago.id ? { ...deuda, saldo: Math.max(0, Number(deuda.saldo) - cantidad) } : deuda));
    setDeudaPago(null); setPago("");
  };

  return <div className="debts-page">
    <section className="debts-page-head"><div><button onClick={onBack}><ArrowLeft size={15} /> {tr("Volver al resumen", "Back to overview")}</button><span>{tr("PLAN DE DEUDAS", "DEBT PLAN")}</span><h1>{tr("Tu camino para quedar libre", "Your path to becoming debt-free")}</h1><p>{tr("Controla cada saldo y descubre cuándo terminarás de pagarlo.", "Track every balance and discover when you'll finish paying it off.")}</p></div><button className="debts-add" onClick={onAdd}><Plus size={18} /> {tr("Añadir deuda", "Add debt")}</button></section>
    <section className="debts-summary"><article className="debts-summary-main"><span><WalletCards size={22} /></span><div><small>Deuda pendiente total</small><b>{euros.format(saldoTotal)}</b><p>entre {deudas.length} deuda{deudas.length !== 1 ? "s" : ""}</p></div></article><article><span className="debt-summary-icon red"><ArrowUpRight size={19} /></span><div><small>Pagas cada mes</small><b>{euros.format(cuotasMensuales)}</b><p>en cuotas previstas</p></div></article><article><span className="debt-summary-icon green"><Flag size={19} /></span><div><small>Fecha libre estimada</small><b className="debt-date-value">{planMasLargo?.fecha || "—"}</b><p>{planMasLargo ? `${planMasLargo.cuotas} cuotas como máximo` : "Sin deudas activas"}</p></div></article></section>
    {deudas.length ? <section className="debts-grid">{deudas.map((deuda) => { const tipo = tiposDeudaPanel[deuda.tipo] || tiposDeudaPanel.otra; const Icono = tipo.icono; const plan = calcularPlanDeuda(deuda.saldo, deuda.cuota, deuda.tae); const inicial = deuda.saldoInicial || deuda.saldo; const progreso = inicial ? Math.min(100, Math.round(((inicial - deuda.saldo) / inicial) * 100)) : 0; return <article className="debt-card" key={deuda.id} style={{ "--debt-color": deuda.color || tipo.color }}><div className="debt-card-top"><span><Icono size={20} /></span><div><small>{tipo.nombre}{deuda.tae ? ` · TAE ${deuda.tae}%` : " · Sin interés indicado"}</small><h2>{deuda.nombre}</h2></div><button><MoreHorizontal size={17} /></button></div><div className="debt-balance"><span>Saldo pendiente</span><b>{euros.format(deuda.saldo)}</b><small>Cuota de {euros.format(deuda.cuota)} al mes</small></div><div className="debt-track"><i style={{ width: `${progreso}%` }} /></div><div className="debt-progress-copy"><span>{progreso}% pagado</span><b>{plan.insuficiente ? "La cuota no cubre los intereses" : `${plan.cuotas} cuotas · ${plan.fecha}`}</b></div>{plan.insuficiente && <div className="debt-warning"><CircleHelp size={15} /> Aumenta la cuota mensual para que la deuda pueda reducirse.</div>}<button className="debt-payment" onClick={() => { setDeudaPago(deuda); setPago(String(deuda.cuota)); }}><Plus size={15} /> Registrar pago</button></article>; })}</section> : <section className="debts-empty"><span><ShieldCheck size={30} /></span><h2>No tienes deudas registradas</h2><p>Si aparece una nueva, añádela y Rumbo calculará automáticamente las cuotas y su fecha estimada.</p><button onClick={onAdd}><Plus size={16} /> Añadir una deuda</button></section>}
    {deudaPago && <div className="debt-modal-backdrop" onMouseDown={() => setDeudaPago(null)}><form className="debt-payment-modal" onSubmit={registrarPago} onMouseDown={(e) => e.stopPropagation()}><button type="button" onClick={() => setDeudaPago(null)}><X size={17} /></button><span style={{ color: deudaPago.color, background: `${deudaPago.color}18` }}><WalletCards size={22} /></span><small>REGISTRAR PAGO</small><h2>{deudaPago.nombre}</h2><p>El saldo y la fecha final se recalcularán automáticamente.</p><label><b>€</b><input autoFocus inputMode="decimal" value={pago} onChange={(e) => setPago(e.target.value)} /></label><button className="debt-save-payment" disabled={!numeroFlexible(pago)}>Confirmar pago</button></form></div>}
  </div>;
}

function DebtModal({ onClose, onSave }) {
  const [form, setForm] = useState({ tipo: "coche", nombre: "", saldo: "", cuota: "", tae: "" });
  const tipo = tiposDeudaPanel[form.tipo];
  const plan = calcularPlanDeuda(form.saldo, form.cuota, form.tae);
  const valido = form.nombre.trim() && numeroFlexible(form.saldo) > 0 && numeroFlexible(form.cuota) > 0;
  const guardar = (e) => { e.preventDefault(); if (!valido) return; const saldo = numeroFlexible(form.saldo); onSave({ id: `deuda-${Date.now()}`, tipo: form.tipo, nombre: form.nombre.trim(), saldo, saldoInicial: saldo, cuota: numeroFlexible(form.cuota), tae: numeroFlexible(form.tae) || 0, color: tipo.color }); };
  return <div className="debt-modal-backdrop" onMouseDown={onClose}><form className="debt-create-modal" onSubmit={guardar} onMouseDown={(e) => e.stopPropagation()}><button type="button" className="debt-modal-close" onClick={onClose}><X size={18} /></button><span className="demo-eyebrow">NUEVA DEUDA</span><h2>¿Qué deuda quieres controlar?</h2><p>Los intereses son opcionales, pero ayudan a calcular una fecha más realista.</p><div className="debt-modal-types">{Object.entries(tiposDeudaPanel).map(([id,item]) => { const Icono=item.icono; return <button type="button" key={id} className={form.tipo===id?"activo":""} style={{"--debt-color":item.color}} onClick={()=>setForm({...form,tipo:id})}><span><Icono size={17}/></span><b>{item.nombre}</b></button>; })}</div><label>Nombre<input autoFocus value={form.nombre} onChange={(e)=>setForm({...form,nombre:e.target.value})} placeholder="Ej. Financiación del coche"/></label><div className="debt-modal-row"><label>Saldo pendiente<div><b>€</b><input inputMode="decimal" value={form.saldo} onChange={(e)=>setForm({...form,saldo:e.target.value})} placeholder="3.000"/></div></label><label>Cuota mensual<div><b>€</b><input inputMode="decimal" value={form.cuota} onChange={(e)=>setForm({...form,cuota:e.target.value})} placeholder="130"/></div></label><label>TAE <small>Opcional</small><div><input inputMode="decimal" value={form.tae} onChange={(e)=>setForm({...form,tae:e.target.value})} placeholder="0"/><b>%</b></div></label></div>{valido && <div className={plan.insuficiente?"debt-plan-preview warning":"debt-plan-preview"}><Sparkles size={16}/><div>{plan.insuficiente?<><b>Esta cuota no reduce la deuda</b><span>No llega a cubrir los intereses mensuales.</span></>:<><b>Aproximadamente {plan.cuotas} cuotas</b><span>Terminarías hacia {plan.fecha}.</span></>}</div></div>}<button className="debt-create-submit" disabled={!valido}><WalletCards size={16}/> Añadir deuda</button></form></div>;
}

function GoalsPage({ metas, setMetas, onAdd, onBack, language }) {
  const [metaAporte, setMetaAporte] = useState(null);
  const [aporte, setAporte] = useState("");
  const tr = (es, en) => language === "en" ? en : es;
  const objetivoTotal = metas.reduce((total, meta) => total + Number(meta.objetivo || 0), 0);
  const ahorradoTotal = metas.reduce((total, meta) => total + Number(meta.ahorrado || 0), 0);
  const metasCompletadas = metas.filter((meta) => meta.objetivo > 0 && meta.ahorrado >= meta.objetivo).length;

  const guardarAporte = (e) => {
    e.preventDefault();
    const cantidad = Number(String(aporte).replace(",", "."));
    if (!cantidad || cantidad <= 0) return;
    setMetas((actuales) => actuales.map((meta) => meta.id === metaAporte.id ? { ...meta, ahorrado: Number(meta.ahorrado || 0) + cantidad } : meta));
    setMetaAporte(null);
    setAporte("");
  };

  return <div className="goals-page">
    <section className="goals-page-head">
      <div><button onClick={onBack}><ArrowLeft size={15} /> {tr("Volver al resumen", "Back to overview")}</button><span>{tr("TUS OBJETIVOS", "YOUR GOALS")}</span><h1>{tr("Dale un propósito a tu ahorro", "Give your savings a purpose")}</h1><p>{tr("Combina metas para ahora, para después y un colchón sin fecha.", "Combine goals for now, later and a safety cushion without a deadline.")}</p></div>
      <button className="goals-add" onClick={onAdd}><Plus size={18} /> {tr("Nueva meta", "New goal")}</button>
    </section>

    <section className="goals-summary">
      <article className="goals-summary-main"><span><Target size={21} /></span><div><small>Ahorrado entre todas tus metas</small><b>{euros.format(ahorradoTotal)}</b><p>{objetivoTotal > 0 ? `de ${euros.format(objetivoTotal)} planificados` : "Empieza registrando tu primer ahorro"}</p></div><div className="goals-total-ring" style={{ "--goal-pct": `${objetivoTotal ? Math.min(100, (ahorradoTotal / objetivoTotal) * 100) * 3.6 : 0}deg` }}><b>{objetivoTotal ? Math.round((ahorradoTotal / objetivoTotal) * 100) : 0}%</b></div></article>
      <article><span className="goal-summary-icon orange"><Rocket size={19} /></span><div><small>Metas activas</small><b>{metas.length}</b><p>en distintos plazos</p></div></article>
      <article><span className="goal-summary-icon green"><Trophy size={19} /></span><div><small>Completadas</small><b>{metasCompletadas}</b><p>¡Cada paso cuenta!</p></div></article>
    </section>

    {metas.length ? <section className="goals-grid">{metas.map((meta) => {
      const tipo = tiposMetaPanel[meta.tipo] || tiposMetaPanel.libre;
      const Icono = tipo.icono;
      const porcentaje = meta.objetivo ? Math.min(100, Math.round((meta.ahorrado / meta.objetivo) * 100)) : 0;
      const restante = Math.max(0, Number(meta.objetivo || 0) - Number(meta.ahorrado || 0));
      return <article className="goal-card" key={meta.id} style={{ "--goal-color": meta.color || tipo.color }}>
        <div className="goal-card-top"><span><Icono size={20} /></span><div><small>{tipo.nombre} · {tipo.tiempo}</small><h2>{meta.nombre}</h2></div><button><MoreHorizontal size={17} /></button></div>
        <div className="goal-amount"><div><span>Ahorrado</span><b>{euros.format(meta.ahorrado || 0)}</b></div><div><span>{meta.objetivo ? "Objetivo" : "Modalidad"}</span><b>{meta.objetivo ? euros.format(meta.objetivo) : "Sin límite"}</b></div></div>
        {meta.objetivo ? <><div className="goal-track"><i style={{ width: `${porcentaje}%` }} /></div><div className="goal-progress-copy"><span>{porcentaje}% completado</span><b>Faltan {euros.format(restante)}</b></div></> : <div className="goal-open-saving"><ShieldCheck size={16} /> Ahorra a tu ritmo, sin una cifra ni fecha obligatoria.</div>}
        <button className="goal-contribute" onClick={() => { setMetaAporte(meta); setAporte(""); }}><Plus size={15} /> Registrar ahorro</button>
      </article>;
    })}</section> : <section className="goals-empty"><span><Target size={30} /></span><h2>Todavía no has creado ninguna meta</h2><p>Puede ser algo pequeño, un proyecto importante o simplemente dinero guardado para estar tranquilo.</p><button onClick={onAdd}><Plus size={16} /> Crear mi primera meta</button></section>}

    {metaAporte && <div className="goal-modal-backdrop" onMouseDown={() => setMetaAporte(null)}><form className="goal-contribution-modal" onSubmit={guardarAporte} onMouseDown={(e) => e.stopPropagation()}><button type="button" onClick={() => setMetaAporte(null)}><X size={17} /></button><span style={{ color: metaAporte.color, background: `${metaAporte.color}18` }}><PiggyBankIcon /></span><small>REGISTRAR AHORRO</small><h2>{metaAporte.nombre}</h2><p>¿Cuánto quieres añadir hoy a esta meta?</p><label><b>€</b><input autoFocus inputMode="decimal" value={aporte} onChange={(e) => setAporte(e.target.value)} placeholder="0,00" /></label><button className="goal-save-contribution" disabled={!Number(String(aporte).replace(",", "."))}>Añadir a mi meta</button></form></div>}
  </div>;
}

function GoalModal({ onClose, onSave }) {
  const [form, setForm] = useState({ tipo: "corto", nombre: "", objetivo: "", ahorrado: "" });
  const tipo = tiposMetaPanel[form.tipo];
  const guardar = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({ id: `meta-${Date.now()}`, tipo: form.tipo, nombre: form.nombre.trim(), objetivo: Number(String(form.objetivo).replace(",", ".")) || 0, ahorrado: Number(String(form.ahorrado).replace(",", ".")) || 0, color: tipo.color });
  };
  return <div className="goal-modal-backdrop" onMouseDown={onClose}><form className="goal-create-modal" onSubmit={guardar} onMouseDown={(e) => e.stopPropagation()}><button type="button" className="goal-modal-close" onClick={onClose}><X size={18} /></button><span className="demo-eyebrow">NUEVA META</span><h2>¿Para qué quieres ahorrar?</h2><p>Puedes crear todas las que necesites y combinarlas por plazo.</p><div className="goal-modal-types">{Object.entries(tiposMetaPanel).map(([id, item]) => { const Icono = item.icono; return <button type="button" key={id} className={form.tipo === id ? "activo" : ""} style={{ "--goal-color": item.color }} onClick={() => setForm({ ...form, tipo: id })}><span><Icono size={17} /></span><b>{item.nombre}</b><small>{item.tiempo}</small></button>; })}</div><label>Nombre de la meta<input autoFocus value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Un televisor nuevo" /></label><div className="goal-modal-row"><label>Cantidad objetivo <small>Opcional</small><div><b>€</b><input inputMode="decimal" value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="0,00" /></div></label><label>Ya tengo ahorrado <small>Opcional</small><div><b>€</b><input inputMode="decimal" value={form.ahorrado} onChange={(e) => setForm({ ...form, ahorrado: e.target.value })} placeholder="0,00" /></div></label></div><button className="goal-create-submit" disabled={!form.nombre.trim()}><Target size={16} /> Crear meta</button></form></div>;
}

function PiggyBankIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 5c-1.5-1.2-3.4-2-5.5-2C8.8 3 5 6 5 10c0 1.8.8 3.5 2 4.7V19h3v-2h5v2h3v-4c1.2-.7 2-2 2-3.5V9h-2.2c-.4-.8-.9-1.5-1.6-2.1"/><path d="M8 4 6 2v4M14 7h.01"/></svg>;
}

function MovementsPage({ movimientos, categorias, busqueda, periodo, onPeriodo, onAdd, onBack, language }) {
  const [filtro, setFiltro] = useState("todas");
  const tr = (es, en) => language === "en" ? en : es;
  const mapaCategorias = useMemo(() => Object.fromEntries(categorias.map((categoria) => [categoria.id, categoria])), [categorias]);
  const resumen = useMemo(() => {
    const totales = movimientos.reduce((acumulado, movimiento) => {
      acumulado[movimiento.categoria] = (acumulado[movimiento.categoria] || 0) + movimiento.importe;
      return acumulado;
    }, {});
    return Object.entries(totales).map(([id, total]) => ({
      id,
      total,
      nombre: mapaCategorias[id]?.nombre || "Otros",
      color: mapaCategorias[id]?.color || "#8a96a7",
    })).sort((a, b) => b.total - a.total);
  }, [movimientos, mapaCategorias]);
  const total = resumen.reduce((suma, categoria) => suma + categoria.total, 0);
  const circunferencia = 2 * Math.PI * 78;
  let recorrido = 0;
  const segmentos = resumen.map((categoria) => {
    const longitud = total ? (categoria.total / total) * circunferencia : 0;
    const segmento = { ...categoria, longitud, inicio: recorrido };
    recorrido += longitud;
    return segmento;
  });
  const lista = movimientos.filter((movimiento) => {
    const coincideTexto = movimiento.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTexto && (filtro === "todas" || movimiento.categoria === filtro);
  });
  const principal = resumen[0];
  const categoriaActiva = resumen.find((categoria) => categoria.id === filtro);

  return <div className="movements-page">
    <section className="movements-page-head">
      <div><button onClick={onBack}><ArrowLeft size={15} /> {tr("Volver al resumen", "Back to overview")}</button><span>{tr("TUS FINANZAS DE", "YOUR FINANCES FOR")} {etiquetaPeriodo(periodo, language).toUpperCase()}</span><h1>{tr("Todos tus movimientos", "All transactions")}</h1><p>{tr("Descubre de un vistazo dónde se está yendo tu dinero.", "See at a glance where your money is going.")}</p></div>
      <div className="movements-head-actions"><MonthNavigator periodo={periodo} onChange={onPeriodo} language={language} /><button className="movements-add" onClick={onAdd}><Plus size={18} /> {tr("Añadir gasto", "Add expense")}</button></div>
    </section>

    <section className="movements-overview">
      <article className="movements-chart-card">
        <div className="movements-card-title"><div><span>{tr("Distribución de gastos", "Spending distribution")}</span><h2>{euros.format(total)}</h2></div><em>{tr("Este mes", "This month")}</em></div>
        <div className="movements-chart-layout">
          <div className={categoriaActiva ? "movements-donut tiene-seleccion" : "movements-donut"}>
            <svg viewBox="0 0 200 200" aria-label="Gráfico de gastos por categoría">
              <circle className="movements-donut-base" cx="100" cy="100" r="78" />
              {segmentos.map((segmento) => <circle
                key={segmento.id}
                className={`movements-donut-segment ${filtro === segmento.id ? "seleccionado" : filtro !== "todas" ? "atenuado" : ""}`}
                cx="100" cy="100" r="78"
                style={{ "--segment-color": segmento.color, stroke: segmento.color }}
                strokeDasharray={`${Math.max(0, segmento.longitud - 2)} ${circunferencia}`}
                strokeDashoffset={-segmento.inicio}
                onClick={() => setFiltro(filtro === segmento.id ? "todas" : segmento.id)}
              />)}
            </svg>
            <div><small>{categoriaActiva?.nombre || tr("Total gastado", "Total spent")}</small><b>{euros.format(categoriaActiva?.total || total)}</b><span>{categoriaActiva ? `${Math.round((categoriaActiva.total / total) * 100)}% ${tr("del total", "of total")}` : `${movimientos.length} ${tr("movimientos", "transactions")}`}</span></div>
          </div>
          <div className="movements-legend">{resumen.map((categoria) => <button key={categoria.id} className={filtro === categoria.id ? "activo" : ""} onClick={() => setFiltro(filtro === categoria.id ? "todas" : categoria.id)}><i style={{ background: categoria.color }} /><span>{categoria.nombre}</span><b>{Math.round((categoria.total / total) * 100)}%</b><small>{euros.format(categoria.total)}</small></button>)}</div>
        </div>
      </article>
      <aside className="movements-insights">
        <div className="movement-insight-icon" style={{ color: principal?.color, background: `${principal?.color || "#5771e5"}18` }}>{principal && (() => { const Icono = iconos[principal.id] || CreditCard; return <Icono size={23} />; })()}</div>
        <span>Categoría principal</span><h2>{principal?.nombre || "Sin gastos"}</h2><b>{principal ? euros.format(principal.total) : euros.format(0)}</b>
        <div className="movement-insight-bar"><i style={{ width: principal ? `${(principal.total / total) * 100}%` : 0, background: principal?.color }} /></div>
        <p>{principal ? `Representa el ${Math.round((principal.total / total) * 100)}% de todos tus gastos.` : "Añade un gasto para ver tu análisis."}</p>
        <div className="movement-insight-tip"><Sparkles size={16} /><span><b>Consejo de Monedín</b> Pulsa en un color del gráfico para ver solo esa categoría.</span></div>
      </aside>
    </section>

    <section className="all-movements-card">
      <div className="all-movements-head"><div><h2>{tr("Historial de gastos", "Spending history")}</h2><p>{lista.length} {tr("movimientos encontrados", "transactions found")}</p></div><div className="movement-filter-bar"><button className={filtro === "todas" ? "activo" : ""} onClick={() => setFiltro("todas")}>{tr("Todos", "All")}</button>{resumen.slice(0, 5).map((categoria) => <button key={categoria.id} className={filtro === categoria.id ? "activo" : ""} onClick={() => setFiltro(categoria.id)}><i style={{ background: categoria.color }} />{categoria.nombre}</button>)}</div></div>
      <div className="all-movement-labels"><span>Movimiento</span><span>Categoría</span><span>Fecha</span><span>Importe</span></div>
      <div className="all-movement-list">{lista.length ? lista.map((movimiento) => {
        const categoria = mapaCategorias[movimiento.categoria] || { nombre: "Otros", color: "#8a96a7" };
        const Icono = iconos[movimiento.categoria] || CreditCard;
        return <article className="all-movement-row" key={movimiento.id}>
          <div className="all-movement-name"><span style={{ color: categoria.color, background: `${categoria.color}18` }}><Icono size={19} /></span><div><b>{movimiento.nombre}</b><small>Pago realizado</small></div></div>
          <div className="all-movement-category"><i style={{ background: categoria.color }} />{categoria.nombre}</div>
          <time dateTime={movimiento.fechaISO}>{formatearFecha(movimiento.fechaISO, language, { corta: true })}</time><strong>−{euros.format(movimiento.importe)}</strong>
        </article>;
      }) : <div className="movements-empty"><Search size={25} /><b>{movimientos.length ? tr("No encontramos gastos", "No expenses found") : tr("Aún no tienes movimientos", "You have no transactions yet")}</b><span>{movimientos.length ? tr("Prueba con otra búsqueda o categoría.", "Try another search or category.") : tr("Pulsa «Añadir gasto» para registrar el primero.", "Select “Add expense” to record the first one.")}</span></div>}</div>
    </section>
  </div>;
}

function MonthNavigator({ periodo, onChange, language }) {
  const siguiente = desplazarPeriodo(periodo, 1);
  const puedeAvanzar = siguiente <= periodoActual();
  return <div className="month-navigator" aria-label={language === "en" ? "Select month" : "Seleccionar mes"}>
    <button type="button" onClick={() => onChange(desplazarPeriodo(periodo, -1))} aria-label={language === "en" ? "Previous month" : "Mes anterior"}><ChevronLeft size={17} /></button>
    <span><CalendarDays size={15} /> {etiquetaPeriodo(periodo, language)}</span>
    <button type="button" disabled={!puedeAvanzar} onClick={() => puedeAvanzar && onChange(siguiente)} aria-label={language === "en" ? "Next month" : "Mes siguiente"}><ChevronRight size={17} /></button>
  </div>;
}

function ArrowRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
