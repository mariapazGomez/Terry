"use client";

import { useActionState } from "react";
import { unirseWaitlist, type WaitlistResult } from "../actions";

const rubros = ["Restaurante / Café / Bar", "Retail / Tienda", "Servicios profesionales", "Salud / Belleza", "Construcción / Remodelación", "Tecnología", "Otro"];
const sucursales = ["Solo 1", "2–3", "4–10", "Más de 10"];

export function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: WaitlistResult | null, formData: FormData) => unirseWaitlist(formData),
    null
  );

  if (state?.ok) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 16, color: dark ? "#fff" : "var(--ink)" }}>¡Ya estás en la lista!</h3>
        <p style={{ marginTop: 8, color: dark ? "rgba(255,255,255,0.55)" : "var(--ink-3)", fontSize: 15 }}>Te avisaremos cuando Terry esté listo para ti.</p>
      </div>
    );
  }

  const inputCls = dark ? "d-waitlist-input d-waitlist-select" : undefined;
  const labelColor = dark ? "rgba(255,255,255,0.5)" : "var(--ink-3)";
  const inputStyle = dark
    ? undefined
    : { background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 8, padding: "12px 16px", fontSize: 15, width: "100%", fontFamily: "var(--font-sans)", color: "var(--ink)", outline: "none" } as React.CSSProperties;

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" style={{ position: "absolute", left: -9999, height: 0, width: 0, overflow: "hidden" }} autoComplete="off" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: labelColor, marginBottom: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Nombre</label>
          {dark
            ? <input name="nombre" type="text" required placeholder="María" className="d-waitlist-input" />
            : <input name="nombre" type="text" required placeholder="María" style={inputStyle} />}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: labelColor, marginBottom: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Email</label>
          {dark
            ? <input name="email" type="email" required placeholder="maria@minegocio.cl" className="d-waitlist-input" />
            : <input name="email" type="email" required placeholder="maria@minegocio.cl" style={inputStyle} />}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: labelColor, marginBottom: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Rubro <span style={{ opacity: 0.5 }}>(opcional)</span></label>
          {dark
            ? <select name="rubro" className="d-waitlist-input d-waitlist-select"><option value="">Selecciona...</option>{rubros.map(r => <option key={r} value={r}>{r}</option>)}</select>
            : <select name="rubro" style={{ ...inputStyle, appearance: "none" as const }}><option value="">Selecciona...</option>{rubros.map(r => <option key={r} value={r}>{r}</option>)}</select>}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: labelColor, marginBottom: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Sucursales <span style={{ opacity: 0.5 }}>(opcional)</span></label>
          {dark
            ? <select name="num_sucursales" className="d-waitlist-input d-waitlist-select"><option value="">Selecciona...</option>{sucursales.map(s => <option key={s} value={s}>{s}</option>)}</select>
            : <select name="num_sucursales" style={{ ...inputStyle, appearance: "none" as const }}><option value="">Selecciona...</option>{sucursales.map(s => <option key={s} value={s}>{s}</option>)}</select>}
        </div>
      </div>

      {state && !state.ok && (
        <p style={{ background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ff6060" }}>{state.error}</p>
      )}

      <button type="submit" disabled={isPending} className="d-waitlist-btn">
        {isPending ? "Registrando..." : "Quiero acceso anticipado →"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12, color: dark ? "rgba(255,255,255,0.3)" : "var(--ink-4)" }}>
        Sin spam. Solo te avisamos cuando Terry esté listo.
      </p>
    </form>
  );
}
