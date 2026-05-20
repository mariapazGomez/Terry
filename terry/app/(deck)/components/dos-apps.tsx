import { WebCanvas } from "./web-canvas";
import { AppPhone } from "./app-phone";

export function DosApps() {
  return (
    <section id="producto" className="d-section d-twoapps">
      <div className="d-container">
        <div className="d-section-header">
          <span className="d-eyebrow">Producto · una pareja inseparable</span>
          <h2 className="d-h-section" style={{ marginTop: 20 }}>
            Dos aplicaciones,<br />
            un mismo <em className="d-grad-text">Terry</em>.
          </h2>
          <p className="d-lead">
            En el escritorio, una pizarra donde Terry te arma los gráficos que pidas.
            En el bolsillo, un dashboard limpio con los números del día — y siempre disponible para hablar.
          </p>
        </div>
        <div className="d-twoapps-grid">
          {/* Web */}
          <div className="d-twoapps-card">
            <div className="d-twoapps-label">
              <span className="d-tag-pill">Web · Análisis a fondo</span>
              <h3 className="d-twoapps-title">La pizarra de Terry.</h3>
              <p className="d-twoapps-text">
                Pregúntale lo que sea y Terry te arma una card con el gráfico justo.
                Acumula análisis, compara escenarios, exporta. Como tener un analista
                construyendo dashboards en vivo a tu lado.
              </p>
              <ul className="d-twoapps-bullets">
                <li>Cards de gráficos generadas por el agente</li>
                <li>Canvas infinito, reorganizable</li>
                <li>Comparativas multivariable a pedido</li>
              </ul>
            </div>
            <WebCanvas />
          </div>

          {/* Mobile */}
          <div className="d-twoapps-card">
            <div className="d-twoapps-label">
              <span className="d-tag-pill">Móvil · Lo esencial</span>
              <h3 className="d-twoapps-title">El dashboard que viaja contigo.</h3>
              <p className="d-twoapps-text">
                KPIs predefinidos, reportes automáticos del SII y un chat directo con Terry
                cuando necesites preguntar algo. Diseñado para revisarlo en 30 segundos,
                entre dos pedidos.
              </p>
              <ul className="d-twoapps-bullets">
                <li>Dashboard del mes en una pantalla</li>
                <li>Reportes Flujo · EERR · IVA automáticos</li>
                <li>Chat con Terry desde cualquier lugar</li>
              </ul>
            </div>
            <div className="d-twoapps-phone-stage">
              <AppPhone />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
