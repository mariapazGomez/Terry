import type { Metadata } from "next";
import "./deck.css";

export const metadata: Metadata = {
  title: "Terry — Tu agente financiero",
  description: "Terry centraliza todas las finanzas de tu negocio y te dice exactamente qué está pasando — para que puedas enfocarte en crecer, no en los números.",
  openGraph: {
    title: "Terry — Tu agente financiero",
    description: "Tu contador siempre disponible, sin que tengas que pedirle nada.",
    type: "website",
  },
};

export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
