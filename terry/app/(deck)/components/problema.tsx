export function Problema() {
  return (
    <section id="problema" className="d-section">
      <div className="d-container">
        <div className="d-section-header">
          <span className="d-eyebrow">El problema</span>
        </div>
        <p className="d-problem-quote">
          El dueño de una PyME no necesita <em>otro dashboard</em>.
          Necesita a alguien que le diga, en lenguaje claro,
          <em> qué hacer mañana</em>.
        </p>
        <div className="d-problem-list">
          <div className="d-problem-pill">
            <span className="n">01</span>
            <h4>Datos por todas partes.</h4>
            <p>POS por un lado, banco por otro, facturas en papel, Excel a medias. Nadie tiene la foto completa.</p>
          </div>
          <div className="d-problem-pill">
            <span className="n">02</span>
            <h4>Sin contador propio.</h4>
            <p>Los contadores externos cobran caro y reportan tarde. El dueño no puede esperar al cierre de mes para decidir.</p>
          </div>
          <div className="d-problem-pill">
            <span className="n">03</span>
            <h4>Decisiones a ojo.</h4>
            <p>Las herramientas existentes están hechas para contadores, no para dueños. El resto se decide con intuición.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
