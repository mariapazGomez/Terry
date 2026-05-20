"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Turn = { who: "user" | "terry"; text: React.ReactNode; delay?: number };

type Scenario = { label: string; tag: string; turns: Turn[] };

const SCRIPT: Record<string, Scenario> = {
  semana: {
    label: "¿Cómo vamos esta semana?",
    tag: "Pregunta abierta",
    turns: [
      { who: "user", text: "Terry, ¿cómo vamos esta semana?" },
      {
        who: "terry",
        delay: 1400,
        text: (
          <>
            Vamos <strong>arriba del promedio</strong>. Cinco días corridos sobre la línea base —
            la mejor racha desde marzo. Pero el margen está apretado.
            <div className="d-kpi-inline">
              <div><div className="k">Ventas</div><div className="v v-up">+18%</div></div>
              <div><div className="k">Tickets</div><div className="v">324</div></div>
              <div><div className="k">Margen</div><div className="v v-down">−3 pts</div></div>
            </div>
          </>
        ),
      },
      { who: "user", text: "¿Qué me está apretando el margen?" },
      {
        who: "terry",
        delay: 1600,
        text: (
          <>
            Insumos. <strong>Frutera Central</strong> te subió la palta de $3.100 a $4.200/kg el martes.
            Compraste tres veces esta semana — son ~$38.000 de más.
            Hay dos proveedores en tu zona con la palta a $3.200.
          </>
        ),
      },
      { who: "user", text: "Mándale el contacto a Marcela." },
      {
        who: "terry",
        delay: 1300,
        text: "Listo. Le envié los dos contactos por WhatsApp y la nota con el ahorro estimado. ¿Te aviso si vuelve a comprar a Frutera Central?",
      },
    ],
  },
  alerta: {
    label: "Avísame cosas importantes",
    tag: "Alerta proactiva",
    turns: [
      {
        who: "terry",
        text: (
          <>
            <span style={{ display: "inline-block", padding: "2px 8px", background: "var(--accent-soft)", color: "var(--accent-ink)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", marginBottom: 8 }}>● ALERTA · GASTOS</span>
            <br />
            Detecté un cargo de <strong>$184.500</strong> que no había visto antes —
            "PROVEEDORES SPA", mismo monto cada 1° del mes desde febrero.
            ¿Es una suscripción tuya?
          </>
        ),
      },
      { who: "user", text: "No me suena. ¿Tienes el detalle?" },
      {
        who: "terry",
        delay: 1500,
        text: (
          <>
            Es un cobro recurrente del banco — sin glosa clara, sin contrato adjunto en el SII.
            Lleva <strong>4 meses</strong>: total $738.000.
            Si quieres, te dejo redactado el correo para pedir el origen.
          </>
        ),
      },
      { who: "user", text: "Sí, mándamelo." },
      { who: "terry", delay: 1100, text: "Te lo dejé en borradores con todos los datos. Te aviso si vuelve a aparecer." },
    ],
  },
  cierre: {
    label: "Cierre de caja del día",
    tag: "Rutina diaria",
    turns: [
      { who: "user", text: "Hagamos el cierre de hoy." },
      {
        who: "terry",
        delay: 1500,
        text: (
          <>
            Cuadrado. <strong>$847.320</strong> en 87 transacciones — 14% sobre tu promedio de miércoles.
            <div className="d-kpi-inline">
              <div><div className="k">Efectivo</div><div className="v">$182.400</div></div>
              <div><div className="k">Débito</div><div className="v">$412.600</div></div>
              <div><div className="k">Crédito</div><div className="v">$252.320</div></div>
            </div>
          </>
        ),
      },
      { who: "user", text: "¿Algo raro?" },
      {
        who: "terry",
        delay: 1700,
        text: (
          <>
            Dos cosas. Una propina de <strong>$45.000</strong> a las 14:32 — probablemente mal tipeada,
            te la marqué para revisar. Y el horario peak se movió 40 minutos más tarde
            esta semana: si esto sigue, conviene ajustar el segundo turno.
          </>
        ),
      },
    ],
  },
};

export function ChatDemo() {
  const [current, setCurrent] = useState<string>("semana");
  const [shown, setShown] = useState<Turn[]>([]);
  const [typing, setTyping] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    setShown([]);
    setTyping(false);
    const turns = SCRIPT[current].turns;
    let acc = 0;
    turns.forEach((turn, i) => {
      const baseDelay = turn.delay ?? 900;
      if (turn.who === "terry") {
        acc += i === 0 ? 400 : 700;
        const tShow = setTimeout(() => setTyping(true), acc);
        timersRef.current.push(tShow);
        acc += baseDelay;
        const tBubble = setTimeout(() => {
          setTyping(false);
          setShown(prev => [...prev, turn]);
        }, acc);
        timersRef.current.push(tBubble);
      } else {
        acc += i === 0 ? 300 : 1100;
        const t = setTimeout(() => setShown(prev => [...prev, turn]), acc);
        timersRef.current.push(t);
      }
    });
    return clearTimers;
  }, [current]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [shown, typing]);

  return (
    <section id="demo" className="d-section">
      <div className="d-container">
        <div className="d-section-header">
          <span className="d-eyebrow">Demo · 60 segundos con Terry</span>
          <h2 className="d-h-section" style={{ marginTop: 20 }}>
            Así <em className="d-grad-text">te habla</em> Terry.
          </h2>
          <p className="d-lead">Tres escenas reales del piloto. Elige una y míralo trabajar.</p>
        </div>

        <div className="d-demo-shell">
          <div className="d-demo-side">
            <span className="d-demo-eyebrow">Elige una conversación</span>
            <div className="d-demo-prompts">
              {Object.entries(SCRIPT).map(([key, val]) => (
                <button
                  key={key}
                  className={"d-demo-prompt " + (current === key ? "d-demo-prompt-active" : "")}
                  onClick={() => setCurrent(key)}
                >
                  <span className="lab">{val.tag}</span>
                  {val.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 24, color: "var(--ink-3)", fontSize: 12, lineHeight: 1.5 }}>
              <p style={{ marginBottom: 8 }}>Las respuestas se basan en datos reales del piloto de desarrollo (SumUp).</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em" }}>v0.4 · mayo 2026</p>
            </div>
          </div>

          <div className="d-demo-window">
            <div className="d-demo-window-header">
              <div className="d-demo-window-avatar">
                <Image src="/terry-face.png" alt="Terry" width={50} height={50} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="d-demo-window-title">Terry</div>
                <div className="d-demo-window-sub">● en línea · v0.4 piloto</div>
              </div>
              <button className="d-btn d-btn-ghost" onClick={() => setCurrent(current)}>↻ reiniciar</button>
            </div>
            <div className="d-chat-scroll" ref={scrollRef}>
              {shown.map((t, i) => (
                <div key={i} className={"d-bubble " + (t.who === "terry" ? "d-bubble-terry" : "d-bubble-user")}>
                  <span className="d-label">{t.who === "terry" ? "Terry" : "Tú"}</span>
                  {t.text}
                </div>
              ))}
              {typing && (
                <div className="d-bubble d-bubble-terry" style={{ padding: "10px 16px" }}>
                  <div className="d-bubble-typing"><span /><span /><span /></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
