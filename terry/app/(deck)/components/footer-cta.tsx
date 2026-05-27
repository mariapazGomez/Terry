import { WaitlistForm } from "./waitlist-form";

export function FooterCta() {
  return (
    <>
      {/* Footer big CTA */}
      <footer className="d-footer" id="equipo">
        <div className="d-container">
          <span className="d-eyebrow">Únete al piloto</span>
          <h2 className="d-footer-h" style={{ marginTop: 24 }}>
            Tu contador<br />
            siempre disponible.<br />
            <em className="d-grad-text">Sin pedirle nada</em>.
          </h2>
          <div className="d-cta-row">
            <a href="#waitlist" className="d-btn d-btn-primary">
              Unirme al piloto <span className="d-arrow">→</span>
            </a>
          </div>

          <div className="d-footer-row">
            <div className="d-footer-col">
              <span className="lab">Equipo</span>
              <span className="val">Tres fundadores · Santiago, Chile</span>
            </div>
            <div className="d-footer-col">
              <span className="lab">Etapa</span>
              <span className="val">Pre-revenue · piloto activo</span>
            </div>
            <div className="d-footer-col" style={{ alignItems: "flex-end" }}>
              <span className="lab">© 2026</span>
              <span className="val d-mono">Terry · AaaS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist form section */}
      <section id="waitlist" className="d-waitlist-bg" style={{ padding: "80px 0" }}>
        <div className="d-container-narrow">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="d-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>Lista de espera</span>
            <h2 className="d-h-section" style={{ marginTop: 16, color: "#fff" }}>
              Sé de los primeros<br />en probarlo.
            </h2>
            <p className="d-lead" style={{ color: "rgba(255,255,255,0.55)", marginTop: 16 }}>
              Cupos limitados. Sé parte del piloto y ayúdanos a construir el agente financiero que tu negocio necesita.
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px" }}>
            <WaitlistForm dark />
          </div>
        </div>
      </section>
    </>
  );
}
