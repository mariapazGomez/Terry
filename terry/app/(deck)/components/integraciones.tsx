const sources: [string, string, "ok" | "soon"][] = [
  ["SumUp",         "POS",       "ok"],
  ["Square",        "POS",       "ok"],
  ["Toteat",        "POS",       "soon"],
  ["Banco Estado",  "Banco",     "ok"],
  ["Banco de Chile","Banco",     "soon"],
  ["BCI",           "Banco",     "soon"],
  ["SII",           "Facturas",  "ok"],
  ["Defontana",     "ERP",       "soon"],
  ["Nubox",         "Contable",  "soon"],
  ["Excel",         "Planillas", "ok"],
  ["WhatsApp",      "Canal",     "ok"],
  ["Email",         "Canal",     "ok"],
];

export function Integraciones() {
  return (
    <section id="fuentes" className="d-section">
      <div className="d-container">
        <div className="d-section-header">
          <span className="d-eyebrow">Integraciones</span>
          <h2 className="d-h-section" style={{ marginTop: 20 }}>
            Vive donde están <em className="d-grad-text">tus datos</em>.
          </h2>
          <p className="d-lead">
            Conexión directa con las herramientas que ya usas. Sin migrar, sin pegar Excels.
          </p>
        </div>
        <div className="d-logos">
          {sources.map(([name, kind, status]) => (
            <div key={name} className="d-logo-cell">
              <span className={"badge " + (status === "ok" ? "" : "badge-soon")}>
                {status === "ok" ? "● Live" : "○ Pronto"}
              </span>
              <div>
                <div>{name}</div>
                <div className="d-logo-cell-kind">{kind}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="d-body-sm d-mono" style={{ marginTop: 20, textAlign: "center" }}>
          12 fuentes hoy · El catálogo crece con cada piloto.
        </p>
      </div>
    </section>
  );
}
