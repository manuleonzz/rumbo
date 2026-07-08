import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home, MapPin, Zap, Droplet, Tv, ShoppingCart, Phone, Smartphone,
  HeartPulse, Dumbbell, Car, CreditCard, Youtube, Cloud, Bot, Package,
  Flame, Wallet, Plus, Check, X, TrendingUp, TrendingDown, Sparkles,
  PiggyBank, PartyPopper, Target, Wand2, Lock, Moon, Sun,
  ShoppingBag, Coffee, Plane, Bus, Fuel, Scissors, Shirt, Book, Music,
  Film, Gamepad2, Laptop, Wifi, PawPrint, Baby, Wrench, Palette,
  GraduationCap, Umbrella, Briefcase, Star, Heart, Eye, EyeOff
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import MONEDIN_IMG from "./assets/monedin.png";
import { usePersistentState } from "./lib/usePersistentState";

// Repositorio de iconos disponible para cuando el usuario añade un gasto no previsto.
// Un set de iconos de línea consistente (en vez de logos ilustrados sueltos) para que
// cualquier categoría nueva encaje visualmente con el resto de la app.
const ICONOS_REPOSITORIO = [
  { id: "sparkles", Icon: Sparkles, label: "Otro" },
  { id: "shoppingbag", Icon: ShoppingBag, label: "Compras" },
  { id: "coffee", Icon: Coffee, label: "Café" },
  { id: "utensils", Icon: HeartPulse, label: "Salud" },
  { id: "plane", Icon: Plane, label: "Viajes" },
  { id: "bus", Icon: Bus, label: "Transporte" },
  { id: "fuel", Icon: Fuel, label: "Gasolina" },
  { id: "car", Icon: Car, label: "Coche" },
  { id: "scissors", Icon: Scissors, label: "Peluquería" },
  { id: "shirt", Icon: Shirt, label: "Ropa" },
  { id: "gift", Icon: Package, label: "Regalos" },
  { id: "book", Icon: Book, label: "Libros" },
  { id: "music", Icon: Music, label: "Música" },
  { id: "film", Icon: Film, label: "Cine" },
  { id: "gamepad", Icon: Gamepad2, label: "Ocio" },
  { id: "laptop", Icon: Laptop, label: "Tech" },
  { id: "wifi", Icon: Wifi, label: "Internet" },
  { id: "pet", Icon: PawPrint, label: "Mascota" },
  { id: "baby", Icon: Baby, label: "Bebé" },
  { id: "wrench", Icon: Wrench, label: "Reparaciones" },
  { id: "palette", Icon: Palette, label: "Hobbies" },
  { id: "grad", Icon: GraduationCap, label: "Formación" },
  { id: "umbrella", Icon: Umbrella, label: "Seguros" },
  { id: "briefcase", Icon: Briefcase, label: "Trabajo" },
  { id: "star", Icon: Star, label: "Especial" },
  { id: "heart", Icon: Heart, label: "Familia" },
];

const NIVELES = [
  { min: 0, nombre: "Aprendiz del ahorro", emoji: "🌱" },
  { min: 50, nombre: "Ahorrador constante", emoji: "🌿" },
  { min: 120, nombre: "Gestor con cabeza", emoji: "📊" },
  { min: 220, nombre: "Estratega financiero", emoji: "🧠" },
  { min: 350, nombre: "Maestro del presupuesto", emoji: "🏆" },
  { min: 500, nombre: "Leyenda de Monedín", emoji: "👑" },
];

// Medallas: solo por hitos que de verdad significan algo, nunca por acciones triviales.
const MEDALLAS = [
  {
    id: "primer_previsto",
    nombre: "Primer paso",
    desc: "Fijaste tu primer gasto previsto",
    emoji: "🎯",
    cumplida: (ctx) => ctx.categorias.some((c) => c.previstoConfirmado),
  },
  {
    id: "presupuesto_completo",
    nombre: "Presupuesto completo",
    desc: "Fijaste el previsto de todas tus categorías",
    emoji: "📋",
    cumplida: (ctx) => ctx.categorias.every((c) => c.previstoConfirmado),
  },
  {
    id: "primer_ingreso",
    nombre: "Primera nómina",
    desc: "Registraste tu primer ingreso semanal",
    emoji: "💶",
    cumplida: (ctx) => ctx.semanas.some((s) => s.real !== null),
  },
  {
    id: "primer_ahorro",
    nombre: "Primer ahorro",
    desc: "Registraste tu primer ahorro semanal",
    emoji: "🐷",
    cumplida: (ctx) => ctx.ahorros.some((a) => a.guardado !== null),
  },
  {
    id: "racha_ahorro",
    nombre: "Racha de ahorro",
    desc: "3 semanas seguidas con tu ahorro registrado",
    emoji: "🔥",
    cumplida: (ctx) => ctx.ahorros.filter((a) => a.guardado !== null).length >= 3,
  },
  {
    id: "meta_cumplida",
    nombre: "Meta cumplida",
    desc: "Llegaste al 100% de tu meta de ahorro mensual",
    emoji: "🏁",
    cumplida: (ctx) => ctx.metaAhorro > 0 && ctx.ahorroAcumulado >= ctx.metaAhorro,
  },
  {
    id: "mes_resuelto",
    nombre: "Mes bajo control",
    desc: "No dejaste ningún gasto fijado sin resolver",
    emoji: "✅",
    cumplida: (ctx) =>
      ctx.categorias.some((c) => c.previstoConfirmado) &&
      ctx.categorias.filter((c) => c.previstoConfirmado).every((c) => c.status !== "pendiente"),
  },
  {
    id: "nivel_2",
    nombre: "Constancia",
    desc: "Alcanzaste el Nivel 2",
    emoji: "🌿",
    cumplida: (ctx) => ctx.nivelIndex >= 1,
  },
];

const ONBOARDING_PASOS = [
  {
    titulo: "¡Hola! Soy Monedín 🪙",
    texto: "Voy a ayudarte a llevar tus cuentas cada semana, sin agobios y sin montones de números.",
  },
  {
    titulo: "Primero, lo que esperas gastar",
    texto: "Para cada gasto — alquiler, luz, el gym — tú decides cuánto esperas gastar. A eso lo llamamos tu \"previsto\".",
  },
  {
    titulo: "Luego, lo que gastas de verdad",
    texto: "Cuando pagas de verdad, lo marcas con un toque. Así sabemos si vas bien o si algo se salió de lo previsto.",
  },
  {
    titulo: "Y cada domingo, ¡a ahorrar!",
    texto: "Cada domingo te pregunto cuánto ahorraste esa semana. Si se te olvida, yo lo calculo por ti solito.",
  },
];

const ICONOS_MAP = {
  home: Home, parking: MapPin, zap: Zap, agua: Droplet, tv: Tv, mercado: ShoppingCart,
  phone: Phone, o2: Smartphone, salud: HeartPulse, gym: Dumbbell, coche: Car,
  tarjeta: CreditCard, youtube: Youtube, cloud: Cloud, bot: Bot, amazon: Package,
  sparkles: Sparkles, shoppingbag: ShoppingBag, coffee: Coffee, plane: Plane, bus: Bus,
  fuel: Fuel, scissors: Scissors, shirt: Shirt, book: Book, music: Music, film: Film,
  gamepad: Gamepad2, laptop: Laptop, wifi: Wifi, pet: PawPrint, baby: Baby, wrench: Wrench,
  palette: Palette, grad: GraduationCap, umbrella: Umbrella, briefcase: Briefcase,
  star: Star, heart: Heart,
};

const CATS_INICIALES = [
  { id: "alquiler", name: "Alquiler", iconId: "home", previsto: 615 },
  { id: "parking", name: "Parking Deventer", iconId: "parking", previsto: 58 },
  { id: "luz", name: "Electricidad", iconId: "zap", previsto: 74 },
  { id: "agua", name: "Agua", iconId: "agua", previsto: 10 },
  { id: "ziggo", name: "Ziggo", iconId: "tv", previsto: 24 },
  { id: "mercado", name: "Revolut Gas/Mercado", iconId: "mercado", previsto: 400 },
  { id: "kpn", name: "KPN", iconId: "phone", previsto: 21 },
  { id: "o2", name: "O2", iconId: "o2", previsto: 15 },
  { id: "seguro", name: "Seguro médico", iconId: "salud", previsto: 85 },
  { id: "gym", name: "Gym", iconId: "gym", previsto: 35 },
  { id: "coche", name: "Cuota coche", iconId: "coche", previsto: 135 },
  { id: "caixa", name: "Tarjeta Caixa", iconId: "tarjeta", previsto: 25 },
  { id: "yt1", name: "YouTube", iconId: "youtube", previsto: 18 },
  { id: "gone", name: "Google One", iconId: "cloud", previsto: 10 },
  { id: "icloud", name: "iCloud", iconId: "cloud", previsto: 1 },
  { id: "chatgpt", name: "ChatGPT", iconId: "bot", previsto: 18 },
  { id: "amazon", name: "Amazon Prime", iconId: "amazon", previsto: 5 },
].map((c) => ({ ...c, real: 0, status: "pendiente", previstoConfirmado: false }));

const CUENTAS_INICIALES = [
  { id: "bunq", nombre: "Bunq", tipo: "Personal", saldo: 0 },
  { id: "caixa", nombre: "CaixaBank", tipo: "Personal", saldo: 0 },
  { id: "revolut", nombre: "Revolut", tipo: "Personal", saldo: 0 },
  { id: "bunq_c", nombre: "Bunq compartida", tipo: "Con tu pareja", saldo: 0 },
  { id: "revolut_c", nombre: "Revolut compartida", tipo: "Con tu pareja", saldo: 0 },
];

const eur = (n) =>
  n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function playSuccessSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t0 = ctx.currentTime + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.42);
    });
    setTimeout(() => ctx.close(), 700);
  } catch (e) {
    // el navegador bloqueó el audio, no pasa nada
  }
}

function playLevelUpSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    // cascada de "monedas": tonos cortos y brillantes, tipo monedas cayendo
    const monedas = [1568, 1760, 1976, 2093, 2349, 2637];
    monedas.forEach((freq, i) => {
      const t0 = ctx.currentTime + i * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.16, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.18);
    });
    // acorde final de triunfo
    const t0 = ctx.currentTime + monedas.length * 0.05 + 0.06;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.75);
    });
    setTimeout(() => ctx.close(), 1300);
  } catch (e) {
    // el navegador bloqueó el audio, no pasa nada
  }
}

export default function RumboApp() {
  const [saldoInicial, setSaldoInicial] = usePersistentState("saldoInicial", 2800);
  const [modoOscuro, setModoOscuro] = usePersistentState("modoOscuro", false);
  const [modoSimple, setModoSimple] = usePersistentState("modoSimple", true);
  const [onboardingAbierto, setOnboardingAbierto] = usePersistentState("onboardingAbierto", true);
  const [onboardingPaso, setOnboardingPaso] = useState(0);
  const [xp, setXp] = usePersistentState("xp", 0);
  const [xpFlash, setXpFlash] = useState(null);
  const [subidaNivel, setSubidaNivel] = useState(null);
  const nivelPrevRef = useRef(0);
  const [medallaToast, setMedallaToast] = useState(null);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [resumenPaso, setResumenPaso] = useState(0);
  const [categoriaActivaOverride, setCategoriaActivaOverride] = useState(null);
  const [medallasDesbloqueadas, setMedallasDesbloqueadas] = usePersistentState("medallasDesbloqueadas", []);
  const ganarXp = (cantidad) => {
    setXp((x) => x + cantidad);
    setXpFlash(cantidad);
    setTimeout(() => setXpFlash(null), 1100);
  };
  const [detallesVisibles, setDetallesVisibles] = useState({});
  const toggleDetalle = (key) =>
    setDetallesVisibles((d) => ({ ...d, [key]: !d[key] }));
  const [categorias, setCategorias] = usePersistentState("categorias", CATS_INICIALES);
  const [cuentas, setCuentas] = usePersistentState("cuentas", CUENTAS_INICIALES);
  const [semanas, setSemanas] = usePersistentState("semanas", [
    { id: 1, label: "Semana 1", previsto: 650, real: null },
    { id: 2, label: "Semana 2", previsto: 650, real: null },
    { id: 3, label: "Semana 3", previsto: 650, real: null },
    { id: 4, label: "Semana 4", previsto: 650, real: null },
  ]);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoIcono, setNuevoIcono] = useState("sparkles");
  const [ingresoAbierto, setIngresoAbierto] = useState(null);
  const [ingresoManual, setIngresoManual] = useState("");

  const [metaAhorro, setMetaAhorro] = usePersistentState("metaAhorro", 200);
  const [metaConfirmadaEsteMes, setMetaConfirmadaEsteMes] = usePersistentState("metaConfirmadaEsteMes", false);
  const [metaModalAbierto, setMetaModalAbierto] = useState(false);
  const [metaSeleccion, setMetaSeleccion] = useState(200);
  const [metaPersonalizada, setMetaPersonalizada] = useState(false);
  const [metaCustomValor, setMetaCustomValor] = useState("");
  const [ahorros, setAhorros] = usePersistentState("ahorros", [
    { id: 1, guardado: null },
    { id: 2, guardado: null },
    { id: 3, guardado: null },
    { id: 4, guardado: null },
  ]);
  const [gastoEnUltimoCheckin, setGastoEnUltimoCheckin] = usePersistentState("gastoEnUltimoCheckin", 0);
  const [checkinAbierto, setCheckinAbierto] = useState(null);
  const [montoManual, setMontoManual] = useState("");
  const [celebracion, setCelebracion] = useState(null);
  const [modoDemo, setModoDemo] = useState("real");
  const [recordatorio, setRecordatorio] = useState(null);

  const diaHoy = new Date().getDay(); // 0 domingo ... 6 sábado
  const domingoReal = diaHoy === 0;
  const esDomingo = modoDemo === "domingo" ? true : modoDemo === "lunes" ? false : domingoReal;

  const cambiarModoDemo = (valor) => {
    setModoDemo(valor);
    if (valor === "lunes") {
      setRecordatorio(null);
      setAhorros((as) => as.map((a, i) => (i === 0 ? { ...a, guardado: null } : a)));
    }
  };

  useEffect(() => {
    if (celebracion) playSuccessSound();
  }, [celebracion]);

  useEffect(() => {
    if (new Date().getDate() === 1 && !metaConfirmadaEsteMes) {
      setMetaModalAbierto(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siguientePasoOnboarding = () => {
    if (onboardingPaso < ONBOARDING_PASOS.length - 1) {
      setOnboardingPaso((p) => p + 1);
    } else {
      setOnboardingAbierto(false);
      ganarXp(10);
    }
  };
  const saltarOnboarding = () => setOnboardingAbierto(false);
  const reabrirOnboarding = () => {
    setOnboardingPaso(0);
    setOnboardingAbierto(true);
  };

  const confirmarMetaMes = () => {
    const valor = metaPersonalizada ? Number(metaCustomValor) || 0 : metaSeleccion;
    setMetaAhorro(valor);
    setMetaConfirmadaEsteMes(true);
    setMetaModalAbierto(false);
    ganarXp(10);
  };

  useEffect(() => {
    if (esDomingo) return;
    const pendiente = ahorros.find((a) => a.guardado === null);
    if (!pendiente || recordatorio) return;
    const monto = Math.max(0, calcularAutomatico(pendiente.id));
    const semana = semanas.find((s) => s.id === pendiente.id);
    setAhorros((as) => as.map((a) => (a.id === pendiente.id ? { ...a, guardado: monto } : a)));
    setGastoEnUltimoCheckin(totales.realGasto);
    setRecordatorio({ monto, label: semana ? semana.label : "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esDomingo]);

  const totales = useMemo(() => {
    const previstoGasto = categorias.reduce((a, c) => a + (c.previstoConfirmado ? c.previsto : 0), 0);
    const realGasto = categorias.reduce((a, c) => a + (c.status === "pendiente" ? 0 : c.real), 0);
    const realIngreso = semanas.reduce((a, s) => a + (s.real !== null ? s.real : 0), 0);
    const previstoIngreso = semanas.reduce((a, s) => a + s.previsto, 0);
    const saldoFinalPrevisto = saldoInicial + previstoIngreso - previstoGasto;
    const saldoActual = saldoInicial + realIngreso - realGasto;
    const pctGastado = previstoGasto ? Math.min(100, Math.round((realGasto / previstoGasto) * 100)) : 0;
    return { previstoGasto, realGasto, realIngreso, previstoIngreso, saldoFinalPrevisto, saldoActual, pctGastado };
  }, [categorias, semanas, saldoInicial]);

  const marcarPagado = (id) => {
    setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, status: "pagado", real: c.previsto } : c)));
    ganarXp(5);
  };
  const marcarOmitido = (id) => {
    setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, status: "omitido", real: 0 } : c)));
    ganarXp(3);
  };
  const reabrir = (id) =>
    setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, status: "pendiente", real: 0 } : c)));
  const cambiarReal = (id, valor) => {
    setCategorias((cs) =>
      cs.map((c) => (c.id === id ? { ...c, real: Number(valor) || 0, status: "pagado" } : c))
    );
    ganarXp(5);
  };
  const cambiarPrevistoCategoria = (id, valor) =>
    setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, previsto: Number(valor) || 0 } : c)));
  const confirmarPrevistoCategoria = (id) => {
    setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, previstoConfirmado: true } : c)));
    ganarXp(5);
    setCategoriaActivaOverride((o) => (o === id ? null : o));
  };
  const editarPrevistoCategoria = (id) =>
    setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, previstoConfirmado: false } : c)));
  const cambiarPrevistoSemana = (id, valor) =>
    setSemanas((ss) => ss.map((s) => (s.id === id ? { ...s, previsto: Number(valor) || 0 } : s)));
  const confirmarIngreso = (id, valor) => {
    setSemanas((ss) => ss.map((s) => (s.id === id ? { ...s, real: Number(valor) || 0 } : s)));
    setIngresoAbierto(null);
    setIngresoManual("");
    ganarXp(5);
  };
  const abrirEdicionIngreso = (s) => {
    setIngresoAbierto(s.id);
    setIngresoManual(s.real !== null ? String(s.real) : "");
  };
  const cambiarSaldoCuenta = (id, valor) =>
    setCuentas((cs) => cs.map((c) => (c.id === id ? { ...c, saldo: Number(valor) || 0 } : c)));

  const ahorroAcumulado = ahorros.reduce((a, x) => a + (x.guardado || 0), 0);
  const pctMeta = metaAhorro ? Math.min(100, Math.round((ahorroAcumulado / metaAhorro) * 100)) : 0;

  const nivelIndex = NIVELES.reduce((acc, n, i) => (xp >= n.min ? i : acc), 0);
  const nivelActual = NIVELES[nivelIndex];
  const nivelSiguiente = NIVELES[nivelIndex + 1] || null;
  const pctNivel = nivelSiguiente
    ? Math.round(((xp - nivelActual.min) / (nivelSiguiente.min - nivelActual.min)) * 100)
    : 100;
  const xpFaltante = nivelSiguiente ? nivelSiguiente.min - xp : 0;

  useEffect(() => {
    if (nivelIndex > nivelPrevRef.current) {
      setSubidaNivel({
        nivel: nivelIndex + 1,
        nombre: NIVELES[nivelIndex].nombre,
        emoji: NIVELES[nivelIndex].emoji,
      });
      playLevelUpSound();
    }
    nivelPrevRef.current = nivelIndex;
  }, [nivelIndex]);

  const medallasEstado = MEDALLAS.map((m) => ({
    ...m,
    lograda: m.cumplida({ categorias, semanas, ahorros, metaAhorro, ahorroAcumulado, nivelIndex }),
  }));

  useEffect(() => {
    const nuevas = medallasEstado.filter((m) => m.lograda && !medallasDesbloqueadas.includes(m.id));
    if (nuevas.length > 0) {
      setMedallasDesbloqueadas((prev) => [...prev, ...nuevas.map((m) => m.id)]);
      setMedallaToast(nuevas[0]);
      ganarXp(15);
      setTimeout(() => setMedallaToast(null), 2800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias, semanas, ahorros, metaAhorro, ahorroAcumulado, nivelIndex]);

  const categoriaMasCara = categorias
    .filter((c) => c.status === "pagado" && c.real > 0)
    .sort((a, b) => b.real - a.real)[0];

  const resumenSlides = [
    {
      titulo: "Cómo va tu mes",
      texto: `Llevas ${eur(totales.realGasto)} gastados de los ${eur(totales.previstoGasto)} previstos. ${
        totales.realGasto <= totales.previstoGasto ? "¡Vas bien encaminado! 👍" : "Ojo, te has pasado un poco."
      }`,
    },
    {
      titulo: "Tu categoría más cara",
      texto: categoriaMasCara
        ? `${categoriaMasCara.name}, con ${eur(categoriaMasCara.real)} este mes.`
        : "Todavía no has marcado ningún gasto como pagado.",
    },
    {
      titulo: "Tu ahorro",
      texto:
        metaAhorro > 0
          ? `Llevas ahorrados ${eur(ahorroAcumulado)} de tu meta de ${eur(metaAhorro)} este mes (${pctMeta}%).`
          : "Aún no has puesto una meta de ahorro este mes.",
    },
    {
      titulo: "Tu nivel con Monedín",
      texto: `Eres ${nivelActual.emoji} Nivel ${nivelIndex + 1} · ${nivelActual.nombre}, con ${xp} XP y ${
        medallasEstado.filter((m) => m.lograda).length
      } medallas conseguidas.`,
    },
  ];

  const siguienteResumen = () => {
    if (resumenPaso < resumenSlides.length - 1) setResumenPaso((p) => p + 1);
    else setResumenAbierto(false);
  };
  const abrirResumen = () => {
    setResumenPaso(0);
    setResumenAbierto(true);
  };

  const calcularAutomatico = (semanaId) => {
    const semana = semanas.find((s) => s.id === semanaId);
    const ingresoSemana = semana && semana.real !== null ? semana.real : 0;
    const gastoNuevo = Math.max(0, totales.realGasto - gastoEnUltimoCheckin);
    return Math.round(ingresoSemana - gastoNuevo);
  };

  const confirmarAhorro = (semanaId, monto) => {
    setAhorros((as) => as.map((a) => (a.id === semanaId ? { ...a, guardado: monto } : a)));
    setGastoEnUltimoCheckin(totales.realGasto);
    setCheckinAbierto(null);
    setMontoManual("");
    setCelebracion({ monto, total: ahorroAcumulado + monto });
    ganarXp(10);
  };

  const agregarGasto = () => {
    if (!nuevoNombre.trim() || !nuevoMonto) return;
    const id = "extra_" + Date.now();
    setCategorias((cs) => [
      ...cs,
      { id, name: nuevoNombre, iconId: nuevoIcono, previsto: 0, real: Number(nuevoMonto), status: "pagado", previstoConfirmado: true },
    ]);
    setNuevoNombre("");
    setNuevoMonto("");
    setNuevoIcono("sparkles");
    setNuevoAbierto(false);
    ganarXp(5);
  };

  const estadoSimple = (c) => {
    if (!c.previstoConfirmado) return { color: "gris", texto: "Sin fijar", cara: "😴" };
    if (c.status === "pendiente") return { color: "azul", texto: "Pendiente", cara: "🙂" };
    if (c.status === "omitido") return { color: "gris", texto: "Sin gasto", cara: "😌" };
    if (!c.previsto) return { color: "verde", texto: "Pagado", cara: "😄" };
    const ratio = c.real / c.previsto;
    if (ratio <= 1) return { color: "verde", texto: "Bien", cara: "😄" };
    if (ratio <= 1.15) return { color: "ambar", texto: "Cerca", cara: "😬" };
    return { color: "rojo", texto: "Te pasaste", cara: "😟" };
  };

  const chartData = categorias
    .filter((c) => c.previsto > 0 || c.real > 0)
    .map((c) => ({ name: c.name, Previsto: c.previsto, Real: c.status === "pendiente" ? 0 : c.real }));

  const semanasRecibidas = semanas.filter((s) => s.real !== null).length;
  const racha = semanasRecibidas + categorias.filter((c) => c.status !== "pendiente").length;

  return (
    <div className={`rumbo-root ${modoOscuro ? "dark" : ""}`}>
      <style>{`
        .rumbo-root {
          --bg: #f6f9fc;
          --card: #ffffff;
          --navy: #0b2545;
          --navy-soft: #4c6584;
          --sky: #3aa0e8;
          --sky-light: #eaf5fd;
          --green: #2fb380;
          --green-light: #e7f8f1;
          --coral: #ff6b5e;
          --coral-light: #ffefed;
          --border: #e9eef3;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          min-height: 100vh;
          padding: 32px 20px 60px;
          color: var(--navy);
          box-sizing: border-box;
          transition: background .25s ease, color .25s ease;
        }
        .rumbo-root.dark {
          --bg: #0e1621;
          --card: #182233;
          --navy: #eef3fa;
          --navy-soft: #8fa2b8;
          --sky: #5cb8f2;
          --sky-light: rgba(92,184,242,0.14);
          --green: #35d399;
          --green-light: rgba(53,211,153,0.14);
          --coral: #ff8478;
          --coral-light: rgba(255,107,94,0.14);
          --border: #263349;
        }
        .rumbo-root.dark input,
        .rumbo-root.dark select {
          background: var(--card);
          color: var(--navy);
          border-color: var(--border);
        }
        .rumbo-root * { box-sizing: border-box; transition: background .2s ease, border-color .2s ease, color .2s ease; }
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .rumbo-font-display { font-family: 'Sora', sans-serif; }
        .rumbo-shell { max-width: 1100px; margin: 0 auto; }
        .rumbo-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom: 28px; }
        .rumbo-brand { display:flex; align-items:center; gap:10px; }
        .rumbo-brand-badge { width:38px; height:38px; border-radius:12px; background: linear-gradient(135deg, var(--sky), var(--navy)); display:flex; align-items:center; justify-content:center; }
        .rumbo-brand-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .rumbo-streak { display:flex; align-items:center; gap:6px; background: var(--card); border:1px solid var(--border); padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight:600; color: var(--navy-soft); box-shadow: 0 2px 6px rgba(11,37,69,0.04); }
        .rumbo-theme-btn { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); background: var(--card); color: var(--navy-soft); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow: 0 2px 6px rgba(11,37,69,0.04); }
        .rumbo-theme-btn:hover { color: var(--sky); border-color: var(--sky); }
        .rumbo-simple-btn.activo { background: var(--sky-light); color: var(--sky); border-color: var(--sky); }

        .rumbo-hero { display:grid; grid-template-columns: 1.1fr 1.4fr; gap: 20px; margin-bottom: 20px; }
        @media (max-width: 820px) { .rumbo-hero { grid-template-columns: 1fr; } }
        .rumbo-card { background: var(--card); border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(11,37,69,0.05); padding: 24px; }

        .rumbo-ring-wrap { display:flex; align-items:center; gap:24px; }
        .rumbo-ring-label { font-size: 13px; color: var(--navy-soft); font-weight:600; margin-bottom: 4px;}
        .rumbo-ring-value { font-size: 30px; font-weight: 800; }
        .rumbo-stat-row { display:flex; justify-content:space-between; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--border); }
        .rumbo-stat { }
        .rumbo-stat-num { font-size: 18px; font-weight: 700; }
        .rumbo-stat-lbl { font-size: 12px; color: var(--navy-soft); margin-top:2px; }

        .rumbo-week-path { display:flex; align-items:center; justify-content:space-between; padding: 8px 4px; }
        .rumbo-week-node { display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; flex:1; position:relative; }
        .rumbo-week-line { position:absolute; top:22px; left:-50%; width:100%; height:3px; background: var(--border); z-index:0; }
        .rumbo-week-line.done { background: var(--sky); }
        .rumbo-week-circle { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid var(--border); background: var(--card); z-index:1; transition: all .15s ease; font-weight:700; color: var(--navy-soft);}
        .rumbo-week-circle.done { background: var(--sky); border-color: var(--sky); color: white; }
        .rumbo-week-circle:hover { transform: scale(1.06); }
        .rumbo-week-txt { font-size: 12px; font-weight:600; color: var(--navy-soft); }
        .rumbo-week-amt { font-size: 11px; color: var(--navy-soft); }

        .rumbo-section-title { font-size: 15px; font-weight: 700; margin: 0 0 14px; letter-spacing: -0.01em; }
        .rumbo-two-col { display:grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-bottom: 20px; align-items:start;}
        @media (max-width: 900px) { .rumbo-two-col { grid-template-columns: 1fr; } }

        .rumbo-row { display:flex; align-items:center; gap:12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .rumbo-row:last-child { border-bottom: none; }
        .rumbo-icon-badge { width:36px; height:36px; border-radius:10px; background: var(--sky-light); color: var(--sky); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rumbo-icon-badge.omitido { background:#f1f3f6; color:#a7b1bd; }
        .rumbo-icon-badge.pagado { background: var(--green-light); color: var(--green); }
        .rumbo-row-name { font-size: 13.5px; font-weight: 600; }
        .rumbo-row-sub { font-size: 11.5px; color: var(--navy-soft); margin-top: 1px; }
        .rumbo-progress-bg { height:5px; border-radius:4px; background: var(--border); width: 100%; margin-top:5px; overflow:hidden; }
        .rumbo-progress-fill { height:100%; border-radius:4px; background: var(--sky); }
        .rumbo-progress-fill.over { background: var(--coral); }
        .rumbo-row-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .rumbo-mini-input { width: 64px; border: 1px solid var(--border); border-radius: 8px; padding: 5px 6px; font-size: 12.5px; text-align:right; font-family: inherit; }
        .rumbo-btn { border:none; cursor:pointer; border-radius: 10px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; transition: background .12s; }
        .rumbo-btn-check { background: var(--green-light); color: var(--green); }
        .rumbo-btn-check:hover { background: var(--green); color: white; }
        .rumbo-btn-x { background: var(--coral-light); color: var(--coral); }
        .rumbo-btn-x:hover { background: var(--coral); color: white; }
        .rumbo-btn-undo { background: #f1f3f6; color: var(--navy-soft); font-size: 11px; font-weight:600; width:auto; padding: 0 10px; }

        .rumbo-addbtn { width:100%; margin-top: 14px; border: 1.5px dashed var(--border); background:transparent; border-radius:14px; padding: 12px; font-family:inherit; font-weight:600; font-size:13px; color: var(--navy-soft); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; }
        .rumbo-addbtn:hover { border-color: var(--sky); color: var(--sky); background: var(--sky-light); }
        .rumbo-addform { display:flex; gap:8px; margin-top:12px; }
        .rumbo-addform input { flex:1; border:1px solid var(--border); border-radius:10px; padding:8px 10px; font-family:inherit; font-size:13px; }
        .rumbo-addform button { border:none; background: var(--navy); color:white; border-radius:10px; padding: 0 16px; font-weight:600; font-size:13px; cursor:pointer; }
        .rumbo-addform-wrap { margin-top: 12px; }
        .rumbo-icon-picker { display:flex; flex-wrap:wrap; gap: 6px; }
        .rumbo-icon-opcion { width: 32px; height:32px; border-radius: 9px; border: 1.5px solid var(--border); background: var(--card); color: var(--navy-soft); display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .rumbo-icon-opcion.activa { border-color: var(--sky); background: var(--sky-light); color: var(--sky); }

        .rumbo-account-card { border:1px solid var(--border); border-radius:16px; padding:14px 16px; margin-bottom:10px; }
        .rumbo-account-top { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;}
        .rumbo-account-name { font-weight:700; font-size:13.5px; }
        .rumbo-account-tag { font-size:11px; color: var(--navy-soft); }
        .rumbo-account-input { width:100%; border:1px solid var(--border); border-radius:10px; padding:8px 10px; font-family:inherit; font-size:14px; font-weight:700; color:var(--navy); }

        .rumbo-badge-pill { display:inline-flex; align-items:center; gap:6px; background: var(--green-light); color: var(--green); font-size:12.5px; font-weight:700; padding: 8px 14px; border-radius:999px; margin-top: 14px; }

        .rumbo-overlay { position: fixed; inset: 0; background: rgba(11,37,69,0.35); backdrop-filter: blur(2px); display:flex; align-items:center; justify-content:center; z-index: 50; padding: 20px; animation: rumbo-fade .18s ease; }
        @keyframes rumbo-fade { from { opacity: 0; } to { opacity: 1; } }
        .rumbo-celebra-card { background: var(--card); border-radius: 24px; padding: 8px 28px 28px; max-width: 340px; width: 100%; text-align:center; box-shadow: 0 20px 60px rgba(11,37,69,0.25); animation: rumbo-pop .22s cubic-bezier(.34,1.56,.64,1); overflow: hidden; }
        @keyframes rumbo-pop { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .rumbo-celebra-title { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
        .rumbo-celebra-sub { font-size: 13.5px; color: var(--navy-soft); }
        .rumbo-celebra-btn { margin-top: 20px; width: 100%; border:none; background: var(--navy); color:white; font-weight:700; font-size:13.5px; padding: 12px; border-radius: 14px; cursor:pointer; font-family: inherit; }
        .rumbo-celebra-btn:hover { background: var(--sky); }

        .rumbo-celebra-stage { position: relative; height: 170px; display:flex; align-items:flex-end; justify-content:center; margin-bottom: 4px; }
        .rumbo-mascota { height: 150px; width: auto; position: relative; z-index: 3; animation: rumbo-bounce .7s ease-in-out infinite alternate; filter: drop-shadow(0 8px 14px rgba(11,37,69,0.25)); }
        @keyframes rumbo-bounce { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-10px) rotate(2deg); } }
        .rumbo-nivel-up-emoji { font-size: 88px; position: relative; z-index: 3; animation: rumbo-bounce .7s ease-in-out infinite alternate; }

        .rumbo-flame { position: absolute; bottom: 6px; font-size: 22px; z-index: 2; opacity: 0; animation: rumbo-flame-rise 1.1s ease-in infinite; }
        .rumbo-flame-0 { left: 18%; animation-delay: 0s; }
        .rumbo-flame-1 { left: 32%; font-size: 16px; animation-delay: .15s; }
        .rumbo-flame-2 { left: 50%; font-size: 26px; animation-delay: .3s; }
        .rumbo-flame-3 { left: 66%; font-size: 16px; animation-delay: .1s; }
        .rumbo-flame-4 { left: 80%; animation-delay: .25s; }
        @keyframes rumbo-flame-rise {
          0% { opacity: 0; transform: translateY(0) scale(.7); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-90px) scale(1.15); }
        }

        .rumbo-confetti { position:absolute; top: -10px; width: 7px; height: 12px; z-index: 1; border-radius: 2px; animation: rumbo-confetti-fall 1.4s ease-in forwards; }
        .rumbo-confetti-0 { left: 6%; background: var(--sky); animation-delay: 0s; }
        .rumbo-confetti-1 { left: 20%; background: var(--green); animation-delay: .12s; }
        .rumbo-confetti-2 { left: 34%; background: #ffcb47; animation-delay: .05s; }
        .rumbo-confetti-3 { left: 48%; background: var(--coral); animation-delay: .2s; }
        .rumbo-confetti-4 { left: 62%; background: var(--sky); animation-delay: .1s; }
        .rumbo-confetti-5 { left: 76%; background: #ffcb47; animation-delay: .18s; }
        .rumbo-confetti-6 { left: 90%; background: var(--green); animation-delay: .08s; }
        @keyframes rumbo-confetti-fall {
          0% { opacity: 0; transform: translateY(0) rotate(0deg); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translateY(160px) rotate(340deg); }
        }

        .rumbo-demo-select { display:flex; align-items:center; gap:6px; font-size: 11px; color: var(--navy-soft); margin-top: 8px; }
        .rumbo-demo-select select { font-family: inherit; font-size: 11px; color: var(--navy-soft); border: 1px solid var(--border); border-radius: 8px; padding: 3px 6px; background: white; }
        .rumbo-locked { display:flex; align-items:center; justify-content:center; gap:6px; margin-top: 4px; padding: 9px; border-radius: 14px; background: #f1f3f6; color: #9aa5b1; font-size: 12.5px; font-weight:600; }

        .rumbo-reminder { display:flex; align-items:flex-start; gap:12px; background: #fff8ea; border: 1px solid #ffe6ae; border-radius: 18px; padding: 14px 16px; margin-bottom: 20px; }
        .rumbo-reminder img { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }
        .rumbo-reminder-txt { flex: 1; font-size: 13px; color: var(--navy); }
        .rumbo-reminder-txt b { color: var(--navy); }
        .rumbo-reminder-close { border:none; background: transparent; color: #b8934a; font-weight:700; font-size: 12px; cursor:pointer; flex-shrink:0; padding: 4px 8px; }
        .rumbo-week-field { display:flex; align-items:center; justify-content:space-between; gap:6px; font-size: 11.5px; color: var(--navy-soft); margin-top: 8px; }
        .rumbo-week-field .rumbo-mini-input { width: 64px; }
        .rumbo-week-real { margin-top: 8px; font-size: 12px; color: var(--navy-soft); cursor:pointer; }
        .rumbo-week-real b { color: var(--green); }
        .rumbo-week-real span { color: var(--sky); font-size: 11px; margin-left: 4px; }
        .rumbo-week-add { width:100%; margin-top: 8px; border: 1.5px dashed var(--border); background:transparent; border-radius:10px; padding: 7px; font-family:inherit; font-weight:600; font-size:11.5px; color: var(--navy-soft); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; }
        .rumbo-week-add:hover { border-color: var(--sky); color: var(--sky); background: var(--sky-light); }

        .rumbo-previsto-set { display:flex; align-items:center; gap:6px; margin-top: 4px; }
        .rumbo-previsto-set span { font-size: 11.5px; color: var(--navy-soft); }
        .rumbo-edit-link { color: var(--sky); font-size: 11px; cursor:pointer; margin-left: 2px; }
        .rumbo-row-hint { font-size: 11px; color: #b7c0cb; font-style: italic; white-space: nowrap; }

        .rumbo-row-colapsada { opacity: 0.55; }
        .rumbo-fijar-ahora { border:none; background: none; color: var(--sky); font-size: 11px; font-weight:600; cursor:pointer; text-decoration: underline; white-space: nowrap; }
        .rumbo-row-activa { background: var(--sky-light); margin: 0 -14px; padding: 12px 14px; border-radius: 14px; border-bottom: none !important; }
        .rumbo-monedin-tip { display:flex; align-items:center; gap: 8px; margin-top: 10px; }
        .rumbo-monedin-tip img { width: 30px; height: 30px; object-fit: contain; }
        .rumbo-monedin-tip span { font-size: 12px; font-weight: 600; color: var(--sky); background: var(--sky-light); padding: 5px 10px; border-radius: 10px; }

        .rumbo-estado-pill { display:inline-flex; align-items:center; gap:6px; padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight:700; cursor:pointer; margin-top: 4px; }
        .rumbo-estado-verde { background: var(--green-light); color: var(--green); }
        .rumbo-estado-ambar { background: #fff3e0; color: #d9820b; }
        .rumbo-estado-rojo { background: var(--coral-light); color: var(--coral); }
        .rumbo-estado-azul { background: var(--sky-light); color: var(--sky); }
        .rumbo-estado-gris { background: #f1f3f6; color: #9aa5b1; }
        .rumbo-detalle-toggle { font-size: 10.5px; color: var(--sky); cursor:pointer; margin-top: 3px; display:inline-block; }
        .rumbo-detalle-toggle-inline { font-size: 10px; color: var(--navy-soft); font-weight: 500; margin-left: 4px; text-decoration: underline; }

        .rumbo-blur-wrap { position: relative; }
        .rumbo-blur-content { filter: blur(7px); user-select: none; pointer-events: none; }
        .rumbo-blur-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display:flex; align-items:center; gap: 6px; border: none; background: var(--navy); color: white; font-family: inherit; font-weight: 700; font-size: 12px; padding: 9px 16px; border-radius: 999px; cursor: pointer; box-shadow: 0 6px 18px rgba(11,37,69,0.25); white-space: nowrap; z-index: 2; }
        .rumbo-blur-btn:hover { background: var(--sky); }

        .rumbo-onboard-replay { display:block; font-size: 10.5px; color: var(--sky); cursor:pointer; margin-top: 2px; text-decoration: underline; }
        .rumbo-onboard-card { background: var(--card); border-radius: 24px; padding: 28px; max-width: 320px; width: 100%; text-align:center; box-shadow: 0 20px 60px rgba(11,37,69,0.25); animation: rumbo-pop .22s cubic-bezier(.34,1.56,.64,1); }
        .rumbo-onboard-img { height: 110px; width: auto; margin: 0 auto 16px; display:block; filter: drop-shadow(0 8px 14px rgba(11,37,69,0.2)); }
        .rumbo-onboard-title { font-size: 19px; font-weight: 800; margin-bottom: 8px; }
        .rumbo-onboard-texto { font-size: 13.5px; color: var(--navy-soft); line-height: 1.5; }
        .rumbo-onboard-dots { display:flex; justify-content:center; gap: 6px; margin-top: 18px; }
        .rumbo-onboard-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border); }
        .rumbo-onboard-dot.activo { background: var(--sky); width: 18px; border-radius: 4px; }
        .rumbo-onboard-skip { display:block; margin: 10px auto 0; border:none; background:none; color: var(--navy-soft); font-size: 12px; cursor:pointer; text-decoration: underline; font-family: inherit; }

        .rumbo-nivel-bar { position: relative; display:flex; align-items:center; gap: 16px; background: var(--card); border:1px solid var(--border); border-radius: 18px; padding: 14px 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(11,37,69,0.04); flex-wrap: wrap; }
        .rumbo-nivel-info { display:flex; align-items:center; gap: 10px; flex-shrink: 0; }
        .rumbo-nivel-emoji { font-size: 26px; }
        .rumbo-nivel-nombre { font-size: 13px; font-weight: 700; }
        .rumbo-nivel-xp { font-size: 11px; color: var(--navy-soft); font-weight: 600; }
        .rumbo-nivel-progress-wrap { flex: 1; min-width: 160px; }
        .rumbo-nivel-siguiente { font-size: 10.5px; color: var(--navy-soft); margin-top: 5px; }
        .rumbo-xp-flash { position: absolute; right: 18px; top: -6px; background: var(--green); color: white; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 999px; animation: rumbo-xp-float 1.1s ease forwards; }
        .rumbo-resumen-btn { border:none; background: var(--sky-light); color: var(--sky); font-weight:700; font-size: 12px; padding: 8px 14px; border-radius: 999px; cursor:pointer; flex-shrink:0; }
        .rumbo-resumen-btn:hover { background: var(--sky); color: white; }
        @keyframes rumbo-xp-float {
          0% { opacity: 0; transform: translateY(6px) scale(.8); }
          20% { opacity: 1; transform: translateY(-2px) scale(1.05); }
          75% { opacity: 1; transform: translateY(-14px) scale(1); }
          100% { opacity: 0; transform: translateY(-22px) scale(1); }
        }

        .rumbo-medallas-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 12px; }
        .rumbo-medalla { display:flex; flex-direction:column; align-items:center; gap:6px; padding: 12px 6px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg); opacity: 0.55; }
        .rumbo-medalla.lograda { opacity: 1; background: var(--sky-light); border-color: var(--sky); }
        .rumbo-medalla-emoji { font-size: 26px; }
        .rumbo-medalla-nombre { font-size: 10px; font-weight: 700; text-align:center; color: var(--navy-soft); line-height: 1.25; }
        .rumbo-medalla.lograda .rumbo-medalla-nombre { color: var(--navy); }

        .rumbo-medalla-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--navy); color: white; padding: 12px 20px; border-radius: 16px; display:flex; align-items:center; gap: 10px; box-shadow: 0 10px 30px rgba(11,37,69,0.35); z-index: 60; animation: rumbo-toast-in .25s ease; }
        .rumbo-medalla-toast-emoji { font-size: 22px; }
        .rumbo-medalla-toast-txt { font-size: 12.5px; }
        .rumbo-medalla-toast-txt b { display:block; font-size: 13.5px; }
        @keyframes rumbo-toast-in { from { opacity:0; transform: translateX(-50%) translateY(14px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

        .rumbo-demo-link { border:none; background:none; color: var(--sky); font-size: 11px; font-weight:600; cursor:pointer; padding: 0; text-decoration: underline; }

        .rumbo-meta-opciones { display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 4px; }
        .rumbo-meta-opcion { border: 1.5px solid var(--border); background: white; border-radius: 12px; padding: 10px 4px; font-family: inherit; font-weight:700; font-size: 13px; color: var(--navy); cursor:pointer; }
        .rumbo-meta-opcion.activa { border-color: var(--sky); background: var(--sky-light); color: var(--sky); }
        .rumbo-meta-custom-link { border:none; background:none; color: var(--sky); font-size: 12px; font-weight:600; cursor:pointer; margin-top: 10px; padding:0; }
      `}</style>

      <div className="rumbo-shell">
        <div className="rumbo-topbar">
          <div className="rumbo-brand">
            <div className="rumbo-brand-badge">
              <Wallet size={18} color="white" />
            </div>
            <div>
              <div className="rumbo-brand-title rumbo-font-display">Rumbo</div>
              <div style={{ fontSize: 11.5, color: "var(--navy-soft)" }}>Julio 2026 · tu presupuesto</div>
              <span className="rumbo-onboard-replay" onClick={reabrirOnboarding}>
                Ver bienvenida de nuevo
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className={`rumbo-theme-btn rumbo-simple-btn ${modoSimple ? "activo" : ""}`}
              onClick={() => setModoSimple((v) => !v)}
              title={modoSimple ? "Ver todos los números" : "Modo simple (iconos y colores)"}
            >
              {modoSimple ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              className="rumbo-theme-btn"
              onClick={() => setModoOscuro((v) => !v)}
              title={modoOscuro ? "Modo claro" : "Modo noche"}
            >
              {modoOscuro ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="rumbo-streak">
              <Flame size={16} color="#ff9f43" /> {racha} acciones esta semana
            </div>
          </div>
        </div>

        <div className="rumbo-nivel-bar">
          <div className="rumbo-nivel-info">
            <span className="rumbo-nivel-emoji">{nivelActual.emoji}</span>
            <div>
              <div className="rumbo-nivel-nombre">
                Nivel {nivelIndex + 1} · {nivelActual.nombre}
              </div>
              <div className="rumbo-nivel-xp">{xp} XP</div>
            </div>
          </div>
          <div className="rumbo-nivel-progress-wrap">
            <div className="rumbo-progress-bg" style={{ height: 8 }}>
              <div className="rumbo-progress-fill" style={{ width: `${pctNivel}%` }} />
            </div>
            <div className="rumbo-nivel-siguiente">
              {nivelSiguiente ? `${xpFaltante} XP para ${nivelSiguiente.nombre}` : "¡Nivel máximo alcanzado! 👑"}
            </div>
          </div>
          {xpFlash && <div className="rumbo-xp-flash">+{xpFlash} XP</div>}
          <button className="rumbo-resumen-btn" onClick={abrirResumen}>
            📖 Ver mi resumen
          </button>
        </div>

        {recordatorio && (
          <div className="rumbo-reminder">
            <img src={MONEDIN_IMG} alt="Monedín" />
            <div className="rumbo-reminder-txt">
              <b>Se te pasó el domingo.</b> No pasa nada — Monedín calculó solo que ahorraste{" "}
              <b>{eur(recordatorio.monto)}</b> en {recordatorio.label}, y ya lo sumamos a tu meta.
            </div>
            <button className="rumbo-reminder-close" onClick={() => setRecordatorio(null)}>
              Vale
            </button>
          </div>
        )}

        <div className="rumbo-hero">
          <div className="rumbo-card">
            <div className="rumbo-ring-wrap">
              <ProgressRing pct={totales.pctGastado} over={totales.realGasto > totales.previstoGasto} />
              <div style={{ flex: 1 }}>
                <div className="rumbo-ring-label">Gastado del presupuesto</div>
                <div className="rumbo-blur-wrap">
                  <div className={modoSimple && !detallesVisibles.hero ? "rumbo-blur-content" : ""}>
                    <div className="rumbo-ring-value rumbo-font-display">{totales.pctGastado}%</div>
                    <div style={{ fontSize: 12.5, color: "var(--navy-soft)", marginTop: 2 }}>
                      {eur(totales.realGasto)} de {eur(totales.previstoGasto)} previstos
                    </div>
                  </div>
                  {modoSimple && !detallesVisibles.hero && (
                    <button className="rumbo-blur-btn" onClick={() => toggleDetalle("hero")}>
                      <Eye size={13} /> Ver número
                    </button>
                  )}
                </div>
                {modoSimple && detallesVisibles.hero && (
                  <span className="rumbo-detalle-toggle" onClick={() => toggleDetalle("hero")}>
                    difuminar de nuevo
                  </span>
                )}
              </div>
            </div>
            <div className="rumbo-stat-row" style={{ position: "relative" }}>
              <div className="rumbo-blur-wrap" style={{ width: "100%" }}>
                <div
                  className={modoSimple && !detallesVisibles.hero ? "rumbo-blur-content" : ""}
                  style={{ display: "flex", justifyContent: "space-between", width: "100%" }}
                >
                  <div className="rumbo-stat">
                    <div className="rumbo-stat-num">{eur(totales.saldoActual)}</div>
                    <div className="rumbo-stat-lbl">Saldo real ahora</div>
                  </div>
                  <div className="rumbo-stat">
                    <div className="rumbo-stat-num">{eur(totales.saldoFinalPrevisto)}</div>
                    <div className="rumbo-stat-lbl">Saldo previsto fin de mes</div>
                  </div>
                </div>
                {modoSimple && !detallesVisibles.hero && (
                  <button className="rumbo-blur-btn" onClick={() => toggleDetalle("hero")}>
                    <Eye size={13} /> Ver saldo
                  </button>
                )}
              </div>
            </div>
            {totales.saldoActual >= saldoInicial && (
              <div className="rumbo-badge-pill">
                <Sparkles size={14} /> Vas por buen camino este mes
              </div>
            )}
          </div>

          <div className="rumbo-card">
            <div className="rumbo-section-title">Tu camino de ingresos semanales</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {semanas.map((s, i) => {
                const editando = ingresoAbierto === s.id;
                return (
                  <div className="rumbo-account-card" style={{ marginBottom: 0 }} key={s.id}>
                    <div className="rumbo-account-top">
                      <div className="rumbo-account-name">{s.label}</div>
                      {s.real !== null && <Check size={14} color="var(--green)" />}
                    </div>

                    <div className="rumbo-week-field">
                      <span>Previsto</span>
                      <input
                        className="rumbo-mini-input"
                        type="number"
                        defaultValue={s.previsto}
                        onBlur={(e) => cambiarPrevistoSemana(s.id, e.target.value)}
                      />
                    </div>

                    {editando ? (
                      <div className="rumbo-week-field" style={{ marginTop: 6 }}>
                        <input
                          className="rumbo-mini-input"
                          style={{ width: "100%" }}
                          type="number"
                          placeholder="€ recibido"
                          value={ingresoManual}
                          onChange={(e) => setIngresoManual(e.target.value)}
                          autoFocus
                        />
                        <button
                          className="rumbo-btn rumbo-btn-check"
                          onClick={() => ingresoManual !== "" && confirmarIngreso(s.id, ingresoManual)}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : s.real !== null ? (
                      <div className="rumbo-week-real" onClick={() => abrirEdicionIngreso(s)}>
                        Real: <b>{eur(s.real)}</b> <span>editar</span>
                      </div>
                    ) : (
                      <button className="rumbo-week-add" onClick={() => abrirEdicionIngreso(s)}>
                        <Plus size={12} /> Añadir ingreso
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="rumbo-stat-row">
              <div className="rumbo-stat">
                <div className="rumbo-stat-num">{eur(totales.realIngreso)}</div>
                <div className="rumbo-stat-lbl">Recibido este mes</div>
              </div>
              <div className="rumbo-stat">
                <div className="rumbo-stat-num">{eur(totales.previstoIngreso)}</div>
                <div className="rumbo-stat-lbl">Previsto (sueldo)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rumbo-card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="rumbo-section-title" style={{ marginBottom: 4 }}>Meta de ahorro semanal</div>
              <div style={{ fontSize: 12, color: "var(--navy-soft)" }}>
                Cada domingo, registra cuánto has ahorrado esa semana.
              </div>
              <div className="rumbo-demo-select">
                <span>Vista de prueba:</span>
                <select value={modoDemo} onChange={(e) => cambiarModoDemo(e.target.value)}>
                  <option value="real">Día real (hoy)</option>
                  <option value="domingo">Simular domingo</option>
                  <option value="lunes">Simular "se me pasó el domingo"</option>
                </select>
                <button className="rumbo-demo-link" onClick={() => setMetaModalAbierto(true)}>
                  Probar pregunta del día 1
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={15} color="var(--navy-soft)" />
              <span style={{ fontSize: 12.5, color: "var(--navy-soft)" }}>Meta mensual</span>
              <input
                className="rumbo-mini-input"
                style={{ width: 70 }}
                type="number"
                defaultValue={metaAhorro}
                onBlur={(e) => setMetaAhorro(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="rumbo-progress-bg" style={{ height: 8, marginTop: 16 }}>
            <div className="rumbo-progress-fill" style={{ width: `${pctMeta}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--navy-soft)" }}>
            <span>{eur(ahorroAcumulado)} ahorrados</span>
            <span>{pctMeta}% de {eur(metaAhorro)}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginTop: 18 }}>
            {ahorros.map((a, i) => {
              const semana = semanas[i];
              const abierto = checkinAbierto === a.id;
              return (
                <div key={a.id} className="rumbo-account-card" style={{ marginBottom: 0 }}>
                  <div className="rumbo-account-top">
                    <div className="rumbo-account-name">{semana.label}</div>
                    {a.guardado !== null && (
                      <div style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700 }}>
                        <Check size={13} /> {eur(a.guardado)}
                      </div>
                    )}
                  </div>

                  {a.guardado === null && !abierto && (
                    esDomingo ? (
                      <button
                        className="rumbo-addbtn"
                        style={{ marginTop: 4, padding: "9px" }}
                        onClick={() => setCheckinAbierto(a.id)}
                      >
                        <PiggyBank size={14} /> Registrar ahorro
                      </button>
                    ) : (
                      <div className="rumbo-locked" title="Disponible los domingos">
                        <Lock size={13} /> Disponible el domingo
                      </div>
                    )
                  )}

                  {abierto && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        className="rumbo-btn-undo rumbo-btn"
                        style={{ width: "100%", height: 34, gap: 6, background: "var(--sky-light)", color: "var(--sky)" }}
                        onClick={() => confirmarAhorro(a.id, calcularAutomatico(a.id))}
                      >
                        <Wand2 size={14} /> Calcularlo por mí ({eur(Math.max(0, calcularAutomatico(a.id)))})
                      </button>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          className="rumbo-mini-input"
                          style={{ width: "100%" }}
                          placeholder="Escribe el importe"
                          type="number"
                          value={montoManual}
                          onChange={(e) => setMontoManual(e.target.value)}
                        />
                        <button
                          className="rumbo-btn rumbo-btn-check"
                          onClick={() => montoManual && confirmarAhorro(a.id, Number(montoManual))}
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rumbo-card" style={{ marginBottom: 20 }}>
          <div className="rumbo-section-title" style={{ marginBottom: 4 }}>Medallas</div>
          <div style={{ fontSize: 12, color: "var(--navy-soft)", marginBottom: 14 }}>
            {medallasEstado.filter((m) => m.lograda).length} de {medallasEstado.length} conseguidas
          </div>
          <div className="rumbo-medallas-grid">
            {medallasEstado.map((m) => (
              <div
                key={m.id}
                className={`rumbo-medalla ${m.lograda ? "lograda" : ""}`}
                title={m.lograda ? m.desc : `Bloqueada: ${m.desc}`}
              >
                <div className="rumbo-medalla-emoji">{m.lograda ? m.emoji : "🔒"}</div>
                <div className="rumbo-medalla-nombre">{m.nombre}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rumbo-two-col">
          <div className="rumbo-card">
            <div className="rumbo-section-title">Gastos previstos vs reales</div>
            {(() => {
              const primeraSinFijar = categorias.find((c) => !c.previstoConfirmado);
              const categoriaActivaId = categoriaActivaOverride || (primeraSinFijar ? primeraSinFijar.id : null);
              return categorias.map((c) => {
                const Icon = ICONOS_MAP[c.iconId] || Sparkles;
                const pct = c.previsto ? Math.min(100, (c.real / c.previsto) * 100) : c.real ? 100 : 0;
                const over = c.previsto > 0 && c.real > c.previsto;
                const estado = estadoSimple(c);
                const verDetalle = !modoSimple || detallesVisibles[c.id];
                const esActivaGuiada = !c.previstoConfirmado && c.id === categoriaActivaId;
                const esColapsadaGuiada = !c.previstoConfirmado && c.id !== categoriaActivaId;

                if (esColapsadaGuiada) {
                  return (
                    <div className="rumbo-row rumbo-row-colapsada" key={c.id}>
                      <div className="rumbo-icon-badge">
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="rumbo-row-name" style={{ color: "var(--navy-soft)" }}>{c.name}</div>
                        <div className="rumbo-row-sub">Lo vemos más tarde</div>
                      </div>
                      <button className="rumbo-fijar-ahora" onClick={() => setCategoriaActivaOverride(c.id)}>
                        fijar ahora
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={c.id}>
                    {esActivaGuiada && (
                      <div className="rumbo-monedin-tip">
                        <img src={MONEDIN_IMG} alt="Monedín" />
                        <span>Empecemos fijando esta 👇</span>
                      </div>
                    )}
                    <div className={`rumbo-row ${esActivaGuiada ? "rumbo-row-activa" : ""}`}>
                      <div className={`rumbo-icon-badge ${c.status === "omitido" ? "omitido" : c.status === "pagado" ? "pagado" : ""}`}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="rumbo-row-name">{c.name}</div>

                        {!c.previstoConfirmado ? (
                          <div className="rumbo-previsto-set">
                            <span>Previsto</span>
                            <input
                              className="rumbo-mini-input"
                              type="number"
                              placeholder="€"
                              defaultValue={c.previsto || ""}
                              onChange={(e) => cambiarPrevistoCategoria(c.id, e.target.value)}
                              autoFocus
                            />
                            <button className="rumbo-btn rumbo-btn-check" onClick={() => confirmarPrevistoCategoria(c.id)} title="Confirmar previsto">
                              <Check size={14} />
                            </button>
                          </div>
                        ) : verDetalle ? (
                          <>
                            <div className="rumbo-row-sub">
                              Previsto {eur(c.previsto)}{" "}
                              <span className="rumbo-edit-link" onClick={() => editarPrevistoCategoria(c.id)}>editar</span>
                              {c.status !== "pendiente" && ` · Real ${eur(c.real)}`}
                              {c.status === "omitido" && " · sin gasto este mes"}
                            </div>
                            {c.status !== "pendiente" && (
                              <div className="rumbo-progress-bg">
                                <div className={`rumbo-progress-fill ${over ? "over" : ""}`} style={{ width: `${pct}%` }} />
                              </div>
                            )}
                            {modoSimple && (
                              <span className="rumbo-detalle-toggle" onClick={() => toggleDetalle(c.id)}>
                                ocultar números
                              </span>
                            )}
                          </>
                        ) : (
                          <div className={`rumbo-estado-pill rumbo-estado-${estado.color}`} onClick={() => toggleDetalle(c.id)}>
                            <span>{estado.cara}</span> {estado.texto}
                            <span className="rumbo-detalle-toggle-inline">ver números</span>
                          </div>
                        )}
                      </div>
                      <div className="rumbo-row-right">
                        {!c.previstoConfirmado ? (
                          <span className="rumbo-row-hint">fija el previsto</span>
                        ) : c.status === "pendiente" ? (
                          <>
                            <input
                              className="rumbo-mini-input"
                              placeholder="€"
                              type="number"
                              onBlur={(e) => e.target.value && cambiarReal(c.id, e.target.value)}
                            />
                        <button className="rumbo-btn rumbo-btn-check" onClick={() => marcarPagado(c.id)} title="Marcar como pagado igual a lo previsto">
                          <Check size={15} />
                        </button>
                        <button className="rumbo-btn rumbo-btn-x" onClick={() => marcarOmitido(c.id)} title="No hubo este gasto">
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <button className="rumbo-btn rumbo-btn-undo" onClick={() => reabrir(c.id)}>
                        Deshacer
                      </button>
                    )}
                  </div>
                </div>
              </div>
                );
              });
            })()}

            {!nuevoAbierto ? (
              <button className="rumbo-addbtn" onClick={() => setNuevoAbierto(true)}>
                <Plus size={15} /> Añadir gasto no previsto
              </button>
            ) : (
              <div className="rumbo-addform-wrap">
                <div className="rumbo-icon-picker">
                  {ICONOS_REPOSITORIO.map((opt) => {
                    const OptIcon = opt.Icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        title={opt.label}
                        className={`rumbo-icon-opcion ${nuevoIcono === opt.id ? "activa" : ""}`}
                        onClick={() => setNuevoIcono(opt.id)}
                      >
                        <OptIcon size={15} />
                      </button>
                    );
                  })}
                </div>
                <div className="rumbo-addform">
                  <input placeholder="Nombre del gasto" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
                  <input placeholder="€" type="number" style={{ maxWidth: 80 }} value={nuevoMonto} onChange={(e) => setNuevoMonto(e.target.value)} />
                  <button onClick={agregarGasto}>Añadir</button>
                </div>
              </div>
            )}
          </div>

          <div className="rumbo-card">
            <div className="rumbo-section-title">Tus cuentas</div>
            {cuentas.map((c) => (
              <div className="rumbo-account-card" key={c.id}>
                <div className="rumbo-account-top">
                  <div className="rumbo-account-name">{c.nombre}</div>
                  <div className="rumbo-account-tag">{c.tipo}</div>
                </div>
                <input
                  className="rumbo-account-input"
                  type="number"
                  placeholder="Saldo actual (€)"
                  defaultValue={c.saldo || ""}
                  onBlur={(e) => cambiarSaldoCuenta(c.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rumbo-card">
          <div className="rumbo-section-title">Previsto vs real por categoría</div>
          <div className="rumbo-blur-wrap">
            <div
              className={modoSimple && !detallesVisibles.grafica ? "rumbo-blur-content" : ""}
              style={{ width: "100%", height: 340 }}
            >
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9eef3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#4c6584" }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#0b2545" }} />
                  <Tooltip formatter={(v) => eur(v)} contentStyle={{ borderRadius: 10, border: "1px solid #e9eef3", fontSize: 12 }} />
                  <Bar dataKey="Previsto" fill="#cfe6f8" radius={[0, 6, 6, 0]} barSize={9} />
                  <Bar dataKey="Real" fill="#3aa0e8" radius={[0, 6, 6, 0]} barSize={9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {modoSimple && !detallesVisibles.grafica && (
              <button className="rumbo-blur-btn" onClick={() => toggleDetalle("grafica")}>
                <Eye size={13} /> Ver gráfica
              </button>
            )}
          </div>
          {modoSimple && detallesVisibles.grafica && (
            <span className="rumbo-detalle-toggle" onClick={() => toggleDetalle("grafica")}>
              difuminar de nuevo
            </span>
          )}
        </div>
      </div>

      {onboardingAbierto && (
        <div className="rumbo-overlay" onClick={saltarOnboarding}>
          <div className="rumbo-onboard-card" onClick={(e) => e.stopPropagation()}>
            <img src={MONEDIN_IMG} alt="Monedín" className="rumbo-onboard-img" />
            <div className="rumbo-font-display rumbo-onboard-title">
              {ONBOARDING_PASOS[onboardingPaso].titulo}
            </div>
            <div className="rumbo-onboard-texto">{ONBOARDING_PASOS[onboardingPaso].texto}</div>
            <div className="rumbo-onboard-dots">
              {ONBOARDING_PASOS.map((_, i) => (
                <span key={i} className={`rumbo-onboard-dot ${i === onboardingPaso ? "activo" : ""}`} />
              ))}
            </div>
            <button className="rumbo-celebra-btn" onClick={siguientePasoOnboarding}>
              {onboardingPaso === ONBOARDING_PASOS.length - 1 ? "¡Vamos a por mi primer gasto!" : "Siguiente"}
            </button>
            {onboardingPaso < ONBOARDING_PASOS.length - 1 && (
              <button className="rumbo-onboard-skip" onClick={saltarOnboarding}>
                Saltar
              </button>
            )}
          </div>
        </div>
      )}

      {resumenAbierto && (
        <div className="rumbo-overlay" onClick={() => setResumenAbierto(false)}>
          <div className="rumbo-onboard-card" onClick={(e) => e.stopPropagation()}>
            <img src={MONEDIN_IMG} alt="Monedín" className="rumbo-onboard-img" />
            <div className="rumbo-font-display rumbo-onboard-title">{resumenSlides[resumenPaso].titulo}</div>
            <div className="rumbo-onboard-texto">{resumenSlides[resumenPaso].texto}</div>
            <div className="rumbo-onboard-dots">
              {resumenSlides.map((_, i) => (
                <span key={i} className={`rumbo-onboard-dot ${i === resumenPaso ? "activo" : ""}`} />
              ))}
            </div>
            <button className="rumbo-celebra-btn" onClick={siguienteResumen}>
              {resumenPaso === resumenSlides.length - 1 ? "Cerrar" : "Siguiente"}
            </button>
          </div>
        </div>
      )}

      {metaModalAbierto && (
        <div className="rumbo-overlay" onClick={() => setMetaModalAbierto(false)}>
          <div className="rumbo-celebra-card" onClick={(e) => e.stopPropagation()}>
            <img src={MONEDIN_IMG} alt="Monedín" style={{ height: 64, marginBottom: 8 }} />
            <div className="rumbo-font-display rumbo-celebra-title">¿Cuánto quieres ahorrar este mes?</div>
            <div className="rumbo-celebra-sub" style={{ marginBottom: 4 }}>
              Elige una meta o pon la tuya. Iremos viendo si es posible según lo que vayas ganando cada semana.
            </div>

            <div className="rumbo-meta-opciones">
              {[50, 100, 150, 200].map((v) => (
                <button
                  key={v}
                  className={`rumbo-meta-opcion ${!metaPersonalizada && metaSeleccion === v ? "activa" : ""}`}
                  onClick={() => {
                    setMetaSeleccion(v);
                    setMetaPersonalizada(false);
                  }}
                >
                  {eur(v)}
                </button>
              ))}
            </div>

            {!metaPersonalizada ? (
              <button className="rumbo-meta-custom-link" onClick={() => setMetaPersonalizada(true)}>
                Otra cantidad
              </button>
            ) : (
              <input
                className="rumbo-account-input"
                style={{ marginTop: 10 }}
                type="number"
                placeholder="Tu meta en €"
                value={metaCustomValor}
                onChange={(e) => setMetaCustomValor(e.target.value)}
                autoFocus
              />
            )}

            <button className="rumbo-celebra-btn" onClick={confirmarMetaMes}>
              Confirmar meta del mes
            </button>
          </div>
        </div>
      )}

      {medallaToast && (
        <div className="rumbo-medalla-toast">
          <span className="rumbo-medalla-toast-emoji">{medallaToast.emoji}</span>
          <div className="rumbo-medalla-toast-txt">
            Nueva medalla desbloqueada
            <b>{medallaToast.nombre}</b>
          </div>
        </div>
      )}

      {subidaNivel && (
        <div className="rumbo-overlay" onClick={() => setSubidaNivel(null)}>
          <div className="rumbo-celebra-card" onClick={(e) => e.stopPropagation()}>
            <div className="rumbo-celebra-stage">
              {["🪙", "🪙", "🪙", "🪙", "🪙"].map((f, i) => (
                <span key={i} className={`rumbo-flame rumbo-flame-${i}`}>{f}</span>
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className={`rumbo-confetti rumbo-confetti-${i % 7}`} />
              ))}
              <div className="rumbo-nivel-up-emoji">{subidaNivel.emoji}</div>
            </div>
            <div className="rumbo-font-display rumbo-celebra-title">¡Subiste de nivel!</div>
            <div className="rumbo-celebra-sub">
              Ahora eres <b>Nivel {subidaNivel.nivel} · {subidaNivel.nombre}</b>
            </div>
            <button className="rumbo-celebra-btn" onClick={() => setSubidaNivel(null)}>
              ¡Seguimos!
            </button>
          </div>
        </div>
      )}

      {celebracion && (
        <div className="rumbo-overlay" onClick={() => setCelebracion(null)}>
          <div className="rumbo-celebra-card" onClick={(e) => e.stopPropagation()}>
            <div className="rumbo-celebra-stage">
              {["🔥", "🔥", "🔥", "🔥", "🔥"].map((f, i) => (
                <span key={i} className={`rumbo-flame rumbo-flame-${i}`}>{f}</span>
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className={`rumbo-confetti rumbo-confetti-${i % 7}`} />
              ))}
              <img src={MONEDIN_IMG} alt="Monedín celebrando" className="rumbo-mascota" />
            </div>
            <div className="rumbo-font-display rumbo-celebra-title">¡Vamos, esto es ahorrar! 🔥</div>
            <div className="rumbo-celebra-sub">
              Monedín está orgulloso: has guardado <b>{eur(celebracion.monto)}</b> esta semana
            </div>
            <div className="rumbo-progress-bg" style={{ marginTop: 16 }}>
              <div className="rumbo-progress-fill" style={{ width: `${metaAhorro ? Math.min(100, Math.round((celebracion.total / metaAhorro) * 100)) : 0}%` }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--navy-soft)", marginTop: 8 }}>
              Llevas {eur(celebracion.total)} de tu meta de {eur(metaAhorro)}
            </div>
            <button className="rumbo-celebra-btn" onClick={() => setCelebracion(null)}>
              Seguir así
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ pct, over }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(pct, 100) / 100) * c;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx="52" cy="52" r={r} fill="none" stroke="#e9eef3" strokeWidth="10" />
      <circle
        cx="52"
        cy="52"
        r={r}
        fill="none"
        stroke={over ? "#ff6b5e" : "#3aa0e8"}
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 52 52)"
        style={{ transition: "stroke-dashoffset .3s ease" }}
      />
    </svg>
  );
}
