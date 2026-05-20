import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Problema } from "./components/problema";
import { DosApps } from "./components/dos-apps";
import { ComoFunciona } from "./components/como-funciona";
import { ChatDemo } from "./components/chat-demo";
import { Integraciones } from "./components/integraciones";
import { FooterCta } from "./components/footer-cta";

export default function LandingPage() {
  return (
    <div className="deck-root">
      <Nav />
      <Hero />
      <Problema />
      <DosApps />
      <ComoFunciona />
      <ChatDemo />
      <Integraciones />
      <FooterCta />
    </div>
  );
}
