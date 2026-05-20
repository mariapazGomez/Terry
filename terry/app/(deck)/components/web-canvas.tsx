import Image from "next/image";

export function WebCanvas() {
  return (
    <div className="d-webcanvas">
      <div className="d-wc-chrome">
        <div className="d-wc-dots"><span /><span /><span /></div>
        <div className="d-wc-url">terry.app / pizarra · Marzo 2026</div>
        <div className="d-wc-side">
          <span className="d-wc-pill">Exportar</span>
          <span className="d-wc-avatar">MC</span>
        </div>
      </div>
      <div className="d-webcanvas-body">
        <div className="d-webcanvas-grid">
          {/* Card 1: Bar comparison */}
          <div className="d-wc-card d-wc-card-1">
            <div className="d-wc-card-head">
              <span className="d-wc-card-title">Ventas — mes vs anterior</span>
              <span className="d-wc-card-mini">●●●</span>
            </div>
            <div className="d-wc-bars">
              {[
                [42, 58], [55, 72], [48, 62], [62, 85], [70, 95],
              ].map(([past, now], i) => (
                <div key={i} className="d-wc-bar-pair">
                  <div className="d-wc-bar d-wc-bar-past" style={{ height: `${past}%` }} />
                  <div className="d-wc-bar d-wc-bar-now" style={{ height: `${now}%` }} />
                </div>
              ))}
            </div>
            <div className="d-wc-card-foot">
              <span><span className="dot dot-past" /> Feb</span>
              <span><span className="dot dot-now" /> Mar</span>
              <span className="d-wc-up">+18.4%</span>
            </div>
          </div>

          {/* Card 2: Line chart */}
          <div className="d-wc-card d-wc-card-2">
            <div className="d-wc-card-head">
              <span className="d-wc-card-title">Flujo de caja · 30 días</span>
            </div>
            <svg viewBox="0 0 220 90" className="d-wc-line" style={{ width: "100%", height: 80, display: "block" }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="d-lineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="oklch(70% 0.21 45)" stopOpacity="0.22" />
                  <stop offset="1" stopColor="oklch(70% 0.21 45)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="d-lineStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="oklch(62% 0.24 28)" />
                  <stop offset="0.5" stopColor="oklch(70% 0.21 45)" />
                  <stop offset="1" stopColor="oklch(82% 0.18 80)" />
                </linearGradient>
              </defs>
              <path d="M0 70 L 30 55 L 60 65 L 90 40 L 120 48 L 150 28 L 180 35 L 220 18 L 220 90 L 0 90 Z" fill="url(#d-lineFill)" />
              <path d="M0 70 L 30 55 L 60 65 L 90 40 L 120 48 L 150 28 L 180 35 L 220 18" stroke="url(#d-lineStroke)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="d-wc-card-foot">
              <span className="d-wc-mono">Min $1.2M · Max $4.8M</span>
            </div>
          </div>

          {/* Card 3: Top categories */}
          <div className="d-wc-card d-wc-card-3">
            <div className="d-wc-card-head">
              <span className="d-wc-card-title">Top categorías</span>
            </div>
            <div className="d-wc-hbar">
              {[
                ["Almuerzos", 92, "$3.4M"],
                ["Bebidas",   68, "$2.1M"],
                ["Postres",   44, "$1.4M"],
                ["Delivery",  32, "$0.9M"],
              ].map(([label, pct, val]) => (
                <div key={label as string} className="d-wc-hb-row">
                  <span>{label}</span>
                  <div className="d-wc-hb"><div style={{ width: `${pct}%` }} /></div>
                  <span className="d-wc-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generating card */}
          <div className="d-wc-card d-wc-card-new">
            <div className="d-wc-shimmer" />
            <div className="d-wc-loading-row">
              <div className="d-bubble-typing"><span /><span /><span /></div>
              <span className="d-wc-loading-text">Generando gráfico…</span>
            </div>
          </div>
        </div>

        {/* Chat prompt */}
        <div className="d-wc-prompt">
          <div className="d-wc-prompt-avatar">
            <Image src="/terry-face.png" alt="Terry" width={42} height={42} />
          </div>
          <div className="d-wc-prompt-input">
            <span className="d-wc-prompt-typing">Compara ventas del mes anterior y este mes</span>
            <span className="d-wc-caret" />
          </div>
          <button className="d-wc-prompt-send">↑</button>
        </div>
      </div>
    </div>
  );
}
