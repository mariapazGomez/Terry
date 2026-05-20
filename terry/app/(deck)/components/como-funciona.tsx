function ConnectVis() {
  return (
    <svg viewBox="0 0 240 110" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
      <g stroke="var(--ink-3)" strokeDasharray="2 3">
        <path d="M30 25 L120 55" /><path d="M30 55 L120 55" /><path d="M30 85 L120 55" />
        <path d="M210 25 L120 55" /><path d="M210 85 L120 55" />
      </g>
      <g fill="var(--cream)" stroke="var(--ink-2)">
        <rect x="6" y="14" width="50" height="22" rx="11" /><rect x="6" y="44" width="50" height="22" rx="11" />
        <rect x="6" y="74" width="50" height="22" rx="11" /><rect x="186" y="14" width="50" height="22" rx="11" />
        <rect x="186" y="74" width="50" height="22" rx="11" />
      </g>
      <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-2)" stroke="none" textAnchor="middle">
        <text x="31" y="29">POS</text><text x="31" y="59">Banco</text><text x="31" y="89">SII</text>
        <text x="211" y="29">Excel</text><text x="211" y="89">WApp</text>
      </g>
      <circle cx="120" cy="55" r="14" fill="var(--ink)" />
      <text x="120" y="59" fontFamily="var(--font-display)" fontSize="14" fill="var(--cream)" textAnchor="middle" stroke="none">T</text>
    </svg>
  );
}

function LearnVis() {
  return (
    <svg viewBox="0 0 240 110" width="100%" height="100%" fill="none">
      <g stroke="var(--line)" strokeWidth="1">
        {[0,1,2,3].map(i => <line key={i} x1="20" y1={20+i*20} x2="220" y2={20+i*20} />)}
      </g>
      <path d="M20 80 Q 60 70, 80 60 T 140 35 T 220 18" stroke="var(--accent)" strokeWidth="2" fill="none" />
      <path d="M20 90 L 60 88 L 100 78 L 140 70 L 180 58 L 220 50" stroke="var(--ink-2)" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
      <g fontFamily="var(--font-mono)" fontSize="8" fill="var(--ink-3)">
        <text x="20" y="105">L</text><text x="60" y="105">M</text><text x="100" y="105">M</text>
        <text x="140" y="105">J</text><text x="180" y="105">V</text><text x="218" y="105">S</text>
      </g>
      <circle cx="220" cy="18" r="3" fill="var(--accent)" />
    </svg>
  );
}

function TalkVis() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, padding: 8 }}>
      <div className="d-bubble d-bubble-terry" style={{ fontSize: 11, padding: "8px 12px", maxWidth: "100%", animation: "none" }}>
        Esta semana <strong>+12% ventas</strong>, pero margen cayó 3 pts.
      </div>
      <div className="d-bubble d-bubble-user" style={{ fontSize: 11, padding: "8px 12px", maxWidth: "70%", animation: "none" }}>
        ¿Por qué?
      </div>
      <div className="d-bubble-typing" style={{ alignSelf: "flex-start" }}>
        <span /><span /><span />
      </div>
    </div>
  );
}

export function ComoFunciona() {
  return (
    <section id="how" className="d-section" style={{ background: "var(--cream-2)" }}>
      <div className="d-container">
        <div className="d-section-header">
          <span className="d-eyebrow">Cómo funciona Terry</span>
          <h2 className="d-h-section" style={{ marginTop: 20 }}>
            Conecta. Aprende. <em className="d-grad-text">Habla</em>.
          </h2>
          <p className="d-lead">
            Terry vive donde tú trabajas. En WhatsApp, en la app, o donde quieras escucharlo.
          </p>
        </div>
        <div className="d-how-grid">
          <div className="d-how-card">
            <span className="step-num">Paso 01</span>
            <div className="step-title">Conecta<br />tus fuentes.</div>
            <p className="step-text">POS, banco, facturas, planillas. Terry se enchufa a SumUp, Square, Banco Estado, SII y más. Sin migrar nada, sin tocar tu operación.</p>
            <div className="step-viz"><ConnectVis /></div>
          </div>
          <div className="d-how-card">
            <span className="step-num">Paso 02</span>
            <div className="step-title">Aprende<br />tu negocio.</div>
            <p className="step-text">Identifica tus proveedores, tus márgenes, tus ciclos. Cada semana entiende un poco más cómo se mueve tu plata.</p>
            <div className="step-viz"><LearnVis /></div>
          </div>
          <div className="d-how-card">
            <span className="step-num">Paso 03</span>
            <div className="step-title">Te habla<br />en humano.</div>
            <p className="step-text">Sin gráficos crípticos. Terry te dice qué pasó, por qué importa, y qué hacer al respecto. Tú decides.</p>
            <div className="step-viz"><TalkVis /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
