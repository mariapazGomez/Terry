import type { ReactNode } from "react";

type TagTone = "green" | "red" | "yellow" | "ink";

const TAG_STYLES: Record<TagTone, { bg: string; color: string }> = {
  green:  { bg: "oklch(0.94 0.05 145)", color: "oklch(0.62 0.15 145)" },
  red:    { bg: "oklch(0.94 0.05 27)",  color: "oklch(0.58 0.19 27)" },
  yellow: { bg: "oklch(0.96 0.08 85)",  color: "oklch(0.45 0.12 75)" },
  ink:    { bg: "rgba(10,10,10,0.07)",  color: "rgba(10,10,10,0.70)" },
};

type TerryPanelProps = {
  title: string;
  subtitle?: string;
  tag?: string;
  tagTone?: TagTone;
  children: ReactNode;
  className?: string;
  bodyPadding?: number | string;
};

export default function TerryPanel({
  title,
  subtitle,
  tag,
  tagTone = "ink",
  children,
  className = "",
  bodyPadding = 14,
}: TerryPanelProps) {
  const tagStyle = TAG_STYLES[tagTone];

  return (
    <div
      className={`terry-card flex flex-col overflow-hidden relative h-full ${className}`}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px 8px",
          borderBottom: "1px solid rgba(10,10,10,0.08)",
          gap: 8, flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12, fontWeight: 600, color: "#0a0a0a",
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 10.5, color: "rgba(10,10,10,0.52)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {tag && (
            <span
              className="terry-tag"
              style={{ background: tagStyle.bg, color: tagStyle.color }}
            >
              {tag}
            </span>
          )}
          {/* Three dots menu visual */}
          <div style={{ display: "flex", gap: 2, padding: 3, color: "rgba(10,10,10,0.25)" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{ width: 3, height: 3, borderRadius: "50%", background: "currentColor" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: bodyPadding,
          flex: 1, minHeight: 0,
          display: "flex", flexDirection: "column",
        }}
      >
        {children}
      </div>

      {/* Resize handle visual */}
      <div
        style={{
          position: "absolute", bottom: 3, right: 3,
          color: "rgba(10,10,10,0.20)", pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 10 10" width="10" height="10">
          <path d="M10 2 L2 10 M10 5 L5 10 M10 8 L8 10" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>
    </div>
  );
}
