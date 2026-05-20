import Image from "next/image";
import { AppPhone } from "./app-phone";

export function Hero() {
  return (
    <header className="d-hero-a">
      <div className="d-container">
        <div className="d-hero-a-grid">
          <div>
            <span className="d-eyebrow">Agent as a Service · Finanzas para PyMEs</span>
            <h1 className="d-h-display" style={{ marginTop: 28 }}>
              Hola, soy <em>Terry</em>.<br />
              El primer agente<br />
              que entiende<br />
              tu negocio.
            </h1>
            <p className="d-lead" style={{ marginTop: 28 }}>
              Terry centraliza todas las finanzas de tu negocio y te dice exactamente
              qué está pasando — para que puedas enfocarte en crecer, no en los números.
            </p>
            <div className="d-cta-row">
              <a href="#demo" className="d-btn d-btn-secondary">Hablar con Terry</a>
              <span className="d-body-sm d-mono" style={{ marginLeft: 8 }}>
                · Cupos limitados · 2026
              </span>
            </div>
            <div className="d-hero-meta">
              <div className="d-hero-meta-item">
                <span className="k">Sin contador</span>
                <span className="v">24 / 7</span>
              </div>
              <div className="d-hero-meta-item">
                <span className="k">Fuentes</span>
                <span className="v">POS · Banco · Facturas</span>
              </div>
              <div className="d-hero-meta-item">
                <span className="k">Decisiones</span>
                <span className="v">En lenguaje humano</span>
              </div>
            </div>
          </div>
          <div className="d-hero-big-terry">
            <Image src="/terry-face.png" alt="Terry" width={520} height={520} style={{ mixBlendMode: "multiply" }} />
          </div>
        </div>
      </div>
    </header>
  );
}
