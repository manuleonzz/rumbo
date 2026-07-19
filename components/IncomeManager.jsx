"use client";

import React, { useMemo, useState } from "react";
import { Banknote, Check, Gift, Plus, Sparkles, X } from "lucide-react";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function IncomeManager({ cobros, setCobros, frecuencia, onClose }) {
  const [extraAbierto, setExtraAbierto] = useState(false);
  const [extra, setExtra] = useState({ nombre: "Bono", importe: "" });
  const recibido = useMemo(() => cobros.reduce((sum, c) => sum + (c.real ?? 0), 0), [cobros]);
  const pendiente = useMemo(() => cobros.reduce((sum, c) => sum + (c.real === null ? c.previsto : 0), 0), [cobros]);
  const proyeccion = recibido + pendiente;

  const cambiarReal = (id, valor) => setCobros((actuales) => actuales.map((c) => c.id === id ? { ...c, real: valor === "" ? null : Number(valor) } : c));
  const agregarExtra = (event) => {
    event.preventDefault();
    if (!extra.nombre.trim() || !Number(extra.importe)) return;
    setCobros((actuales) => [...actuales, { id: `extra-${Date.now()}`, label: extra.nombre.trim(), fecha: "Ingreso extraordinario", previsto: 0, real: Number(extra.importe), extra: true }]);
    setExtra({ nombre: "Bono", importe: "" });
    setExtraAbierto(false);
  };

  return <div className="income-backdrop" onMouseDown={onClose}>
    <section className="income-modal" onMouseDown={(e) => e.stopPropagation()}>
      <button className="income-close" onClick={onClose}><X size={18} /></button>
      <header className="income-head"><span><Banknote size={22} /></span><div><small>INGRESOS DE JULIO</small><h2>Tus cobros del mes</h2><p>Modifica cada pago cuando el dinero llegue a tu cuenta.</p></div></header>
      <div className="income-summary"><div><span>Recibido</span><b>{euros.format(recibido)}</b></div><div><span>Pendiente</span><b>{euros.format(pendiente)}</b></div><div className="principal"><span>Proyección del mes</span><b>{euros.format(proyeccion)}</b></div></div>
      <div className="income-context"><Sparkles size={14} /> Plan configurado: <b>{frecuencia === "semanal" ? "cobro semanal" : frecuencia === "dos-mes" ? "dos cobros al mes" : frecuencia === "mensual" ? "cobro mensual" : "ingresos variables"}</b></div>
      <div className="income-list">{cobros.map((cobro) => <article key={cobro.id} className={cobro.extra ? "extra" : ""}>
        <span className="income-row-icon">{cobro.extra ? <Gift size={17} /> : cobro.real !== null ? <Check size={16} /> : <Banknote size={16} />}</span>
        <div className="income-row-copy"><b>{cobro.label}</b><small>{cobro.fecha}{!cobro.extra && ` · previsto ${euros.format(cobro.previsto)}`}</small></div>
        <label><span>€</span><input type="number" min="0" step="0.01" placeholder={String(cobro.previsto)} value={cobro.real ?? ""} onChange={(e) => cambiarReal(cobro.id, e.target.value)} /></label>
        <em className={cobro.real !== null ? "confirmado" : ""}>{cobro.real !== null ? "Recibido" : "Pendiente"}</em>
      </article>)}</div>
      {!extraAbierto ? <button className="income-extra-btn" onClick={() => setExtraAbierto(true)}><Plus size={15} /> Añadir bono u otro ingreso</button> : <form className="income-extra-form" onSubmit={agregarExtra}><div><label>Concepto<input value={extra.nombre} onChange={(e) => setExtra({ ...extra, nombre: e.target.value })} placeholder="Ej. Bono" /></label><label>Importe<input autoFocus type="number" min="0" step="0.01" value={extra.importe} onChange={(e) => setExtra({ ...extra, importe: e.target.value })} placeholder="0,00" /></label></div><button type="submit">Guardar ingreso</button><button type="button" onClick={() => setExtraAbierto(false)}>Cancelar</button></form>}
      <div className="income-explanation"><b>¿Cómo lo calcula Rumbo?</b><span>Usa los importes reales confirmados y mantiene tu media prevista para los pagos que todavía no han llegado.</span></div>
    </section>
  </div>;
}
