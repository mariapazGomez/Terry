"use client";

import { useState, useTransition } from "react";
import { guardarNombreOrg, completarOnboarding } from "@/app/actions/onboarding";

type Props = {
  orgNombre: string;
  sumupConectado: boolean;
};

const TOTAL = 3;
const INK = "#0a0a0a";
const INK15 = "rgba(10,10,10,0.15)";
const INK45 = "rgba(10,10,10,0.45)";

function ProgressDots({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 40 }}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i + 1 <= current ? INK : INK15,
              transition: "background 0.25s",
            }}
          />
          {i < TOTAL - 1 && (
            <span style={{
              width: 28, height: 1,
              background: i + 1 < current ? INK : INK15,
              display: "inline-block",
              transition: "background 0.25s",
            }} />
          )}
        </span>
      ))}
    </div>
  );
}

export default function OnboardingWizard({ orgNombre, sumupConectado }: Props) {
  const [step, setStep] = useState(sumupConectado ? 3 : 1);
  const [isPending, startTransition] = useTransition();

  // ── Step 1: confirm org name ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ width: "100%", maxWidth: 400 }}>
        <ProgressDots current={step} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: INK, marginBottom: 8, letterSpacing: "-0.3px" }}>
          ¿Cómo se llama tu negocio?
        </h1>
        <p style={{ fontSize: 14, color: INK45, marginBottom: 28, lineHeight: 1.5 }}>
          Este nombre aparecerá en tus reportes y en los mensajes de Terry.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              await guardarNombreOrg(fd);
              setStep(2);
            });
          }}
        >
          <input
            name="nombre"
            defaultValue={orgNombre}
            required
            autoFocus
            placeholder="Mi negocio"
            style={{
              width: "100%", boxSizing: "border-box",
              borderRadius: 10, border: `1px solid ${INK15}`,
              padding: "11px 14px", fontSize: 15, color: INK,
              outline: "none", marginBottom: 14,
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%", borderRadius: 10, background: INK,
              color: "white", padding: "11px 0", fontSize: 14,
              fontWeight: 500, border: "none", cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s",
            }}
          >
            {isPending ? "Guardando…" : "Continuar →"}
          </button>
        </form>
      </div>
    );
  }

  // ── Step 2: connect SumUp ────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div style={{ width: "100%", maxWidth: 400 }}>
        <ProgressDots current={step} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: INK, marginBottom: 8, letterSpacing: "-0.3px" }}>
          Conecta tu caja SumUp
        </h1>
        <p style={{ fontSize: 14, color: INK45, marginBottom: 28, lineHeight: 1.5 }}>
          Terry sincroniza tus ventas en tiempo real, sin que tengas que registrar nada manualmente.
        </p>
        <a
          href="/api/sumup/auth"
          style={{
            display: "block", textAlign: "center", textDecoration: "none",
            borderRadius: 10, background: INK, color: "white",
            padding: "11px 0", fontSize: 14, fontWeight: 500,
            marginBottom: 14,
          }}
        >
          Conectar SumUp →
        </a>
        <button
          onClick={() => setStep(3)}
          style={{
            display: "block", width: "100%", background: "none", border: "none",
            cursor: "pointer", fontSize: 13, color: INK45,
            padding: "8px 0", textAlign: "center",
          }}
        >
          Saltar por ahora
        </button>
      </div>
    );
  }

  // ── Step 3: done ─────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
      <ProgressDots current={step} />
      <div
        style={{
          width: 52, height: 52, borderRadius: "50%", background: INK,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: INK, marginBottom: 8, letterSpacing: "-0.3px" }}>
        ¡Terry está listo!
      </h1>
      <p style={{ fontSize: 14, color: INK45, marginBottom: 32, lineHeight: 1.5 }}>
        {sumupConectado
          ? "Tus ventas ya se están sincronizando. Bienvenida a tu nuevo agente financiero."
          : "Puedes conectar SumUp más tarde desde la configuración."}
      </p>
      <form action={completarOnboarding}>
        <button
          type="submit"
          style={{
            width: "100%", borderRadius: 10, background: INK,
            color: "white", padding: "11px 0", fontSize: 14,
            fontWeight: 500, border: "none", cursor: "pointer",
          }}
        >
          Ver mi dashboard →
        </button>
      </form>
    </div>
  );
}
