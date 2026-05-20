import Image from "next/image";

export function Nav() {
  return (
    <nav className="d-nav">
      <div className="d-container d-nav-inner">
        <div className="d-brand">
          <span className="d-brand-mark">
            <Image src="/terry-face.png" alt="Terry" width={28} height={28} />
          </span>
          <span>Terry</span>
        </div>
        <div className="d-nav-links">
          <a href="#producto">Producto</a>
          <a href="#how">Cómo funciona</a>
          <a href="#fuentes">Integraciones</a>
          <a href="#demo">Demo</a>
        </div>
        <div className="d-row">
          <a href="/login" className="d-btn d-btn-ghost">Iniciar sesión</a>
        </div>
      </div>
    </nav>
  );
}
