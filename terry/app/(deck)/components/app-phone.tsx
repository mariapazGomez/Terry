import Image from "next/image";

function KpiCard({ label, value, delta, up }: { label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="d-kpi-card">
      <div className="d-kpi-label">{label}</div>
      <div className="d-kpi-value">{value}</div>
      <div className={"d-kpi-delta " + (up ? "d-kpi-delta-up" : "d-kpi-delta-down")}>
        <span style={{ fontSize: 8 }}>{up ? "▲" : "▼"}</span> {delta}
      </div>
    </div>
  );
}

export function AppPhone({ scale = 1 }: { scale?: number }) {
  return (
    <div className="d-phone-real" style={{ transform: `scale(${scale})`, transformOrigin: "top center", position: "relative" }}>
      <div style={{ position: "relative" }}>
        <div className="d-phone-status-bar">
          <span style={{ fontVariantNumeric: "tabular-nums" }}>9:41</span>
          <span className="d-ps-notch" />
          <span className="d-ps-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="4" width="3" height="7" rx="0.5"/><rect x="9" y="2" width="3" height="9" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 11C8.6 11 9.5 10.1 9.5 9C9.5 7.9 8.6 7 7.5 7C6.4 7 5.5 7.9 5.5 9C5.5 10.1 6.4 11 7.5 11Z"/><path d="M3.5 6.5C4.5 5.5 6 4.8 7.5 4.8C9 4.8 10.5 5.5 11.5 6.5L13 5C11.5 3.5 9.5 2.6 7.5 2.6C5.5 2.6 3.5 3.5 2 5L3.5 6.5Z"/><path d="M0.5 3.5C2.5 1.5 4.9 0.3 7.5 0.3C10.1 0.3 12.5 1.5 14.5 3.5L13 5C11.5 3.5 9.5 2.5 7.5 2.5C5.5 2.5 3.5 3.5 2 5L0.5 3.5Z"/></svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5"/><rect x="2" y="2" width="17" height="7" rx="1" fill="currentColor"/><rect x="21" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
          </span>
        </div>
      </div>

      <div className="d-phone-real-body">
        <div className="d-phone-app-header">
          <div className="d-t-badge">T</div>
          <div className="d-t-name">terry <span className="d-t-tag">BETA 1.0</span></div>
          <div className="d-mc-avatar">MC</div>
        </div>

        <div className="d-phone-meta">LUN · 18 MAY 2026</div>
        <h3 className="d-phone-greeting">Hola, Matías</h3>
        <p className="d-phone-sub">Resumen financiero de tu empresa al día de hoy.</p>

        <div className="d-phone-eyebrow-row">
          <span className="d-phone-eyebrow">INDICADORES DEL MES</span>
          <span className="d-phone-stamp">hace 12 min</span>
        </div>

        <div className="d-kpi-grid">
          <KpiCard label="Ingresos del mes" value="$12.6M" delta="+12.5%" up />
          <KpiCard label="Egresos del mes" value="$9.2M" delta="+6.9%" up />
          <KpiCard label="Flujo neto" value="$3.4M" delta="+22%" up />
          <KpiCard label="Caja actual" value="$14.3M" delta="−1.2%" />
        </div>

        <div className="d-phone-cta">
          <div className="d-phone-cta-row">
            <div className="d-phone-cta-avatar">
              <Image src="/terry-face.png" alt="Terry" width={42} height={42} />
            </div>
            <div className="d-phone-cta-bubble">Tres cobros recurrentes nuevos esta semana. ¿Los revisamos?</div>
          </div>
        </div>

        <div className="d-phone-tabbar">
          <div className="tab active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
            <span>Inicio</span>
          </div>
          <div className="tab">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12h8M8 16h5M8 8h8"/></svg>
            <span>Reportes</span>
          </div>
          <div className="tab">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Terry</span>
          </div>
          <div className="tab">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
            <span>Cuenta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
