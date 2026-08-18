/**
 * Lightweight animated SVG illustrations for the Nazexa services pages.
 * Pure SVG + existing CSS utilities so they stay small and GPU friendly.
 */
import { cn } from "@/lib/utils";

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-secondary/30 ring-1 ring-border",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_60%)]" />
      {children}
    </div>
  );
}

const grid = (
  <g stroke="currentColor" strokeOpacity="0.07">
    {Array.from({ length: 16 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="180" />
    ))}
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={`h${i}`} x1="0" y1={i * 20} x2="320" y2={i * 20} />
    ))}
  </g>
);

/** Code / build: an editor pane whose lines type themselves in. */
export function BuildVisual({ className }: { className?: string }) {
  const lines = [70, 120, 95, 150, 60, 110];
  return (
    <Frame className={className}>
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full"
        role="img"
        aria-label="Animated code editor illustration"
      >
        {grid}
        <rect
          x="24"
          y="26"
          width="272"
          height="128"
          rx="10"
          fill="color-mix(in oklab, var(--card) 92%, transparent)"
          stroke="var(--primary)"
          strokeOpacity="0.3"
        />
        <g fill="var(--primary)" fillOpacity="0.6">
          <circle cx="40" cy="42" r="3.5" />
          <circle cx="52" cy="42" r="3.5" />
          <circle cx="64" cy="42" r="3.5" />
        </g>
        {lines.map((w, i) => (
          <rect
            key={i}
            x={40}
            y={62 + i * 15}
            width={w}
            height="6"
            rx="3"
            fill={i % 3 === 0 ? "var(--primary)" : "currentColor"}
            fillOpacity={i % 3 === 0 ? 0.7 : 0.18}
            className="animate-float"
            style={{ animationDelay: `${i * 0.25}s`, animationDuration: "5s" }}
          />
        ))}
        <rect
          x="40"
          y="152"
          width="240"
          height="1"
          fill="var(--primary)"
          fillOpacity="0.25"
        />
        <path
          d="M40 156 H280"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeDasharray="240"
          className="animate-draw"
        />
      </svg>
    </Frame>
  );
}

/** Mobile: a handset with a pulsing signal ring. */
export function MobileVisual({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full"
        role="img"
        aria-label="Animated Android app illustration"
      >
        {grid}
        <g className="animate-float" style={{ animationDuration: "6s" }}>
          <rect
            x="128"
            y="22"
            width="64"
            height="120"
            rx="12"
            fill="color-mix(in oklab, var(--card) 94%, transparent)"
            stroke="var(--primary)"
            strokeOpacity="0.45"
          />
          <rect
            x="136"
            y="36"
            width="48"
            height="26"
            rx="5"
            fill="var(--primary)"
            fillOpacity="0.5"
          />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x="136"
              y={70 + i * 14}
              width={i === 2 ? 28 : 48}
              height="7"
              rx="3.5"
              fill="currentColor"
              fillOpacity="0.18"
            />
          ))}
          <rect
            x="136"
            y="116"
            width="48"
            height="14"
            rx="7"
            fill="var(--primary)"
            fillOpacity="0.7"
          />
        </g>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="160"
            cy="82"
            r={50 + i * 22}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity={0.22 - i * 0.06}
            className="animate-float"
            style={{ animationDelay: `${i * 0.6}s`, animationDuration: "7s" }}
          />
        ))}
      </svg>
    </Frame>
  );
}

/** Cloud / deployment: nodes connected to a hub with drawing links. */
export function CloudVisual({ className }: { className?: string }) {
  const nodes = [
    { x: 52, y: 46 },
    { x: 52, y: 134 },
    { x: 268, y: 46 },
    { x: 268, y: 134 },
  ];
  return (
    <Frame className={className}>
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full"
        role="img"
        aria-label="Animated cloud deployment illustration"
      >
        {grid}
        {nodes.map((n, i) => (
          <path
            key={i}
            d={`M${n.x} ${n.y} C ${(n.x + 160) / 2} ${n.y}, ${(n.x + 160) / 2} 90, 160 90`}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeDasharray="200"
            className="animate-draw"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
        {nodes.map((n, i) => (
          <g key={`n${i}`}>
            <rect
              x={n.x - 26}
              y={n.y - 14}
              width="52"
              height="28"
              rx="8"
              fill="color-mix(in oklab, var(--card) 92%, transparent)"
              stroke="currentColor"
              strokeOpacity="0.15"
            />
            <circle
              cx={n.x}
              cy={n.y}
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />
          </g>
        ))}
        <g className="animate-float" style={{ animationDuration: "6s" }}>
          <circle
            cx="160"
            cy="90"
            r="30"
            fill="color-mix(in oklab, var(--card) 90%, transparent)"
            stroke="var(--primary)"
            strokeOpacity="0.55"
          />
          <path
            d="M146 94a10 10 0 0 1 9-13 12 12 0 0 1 22 3 8 8 0 0 1-1 16h-24a7 7 0 0 1-6-6z"
            fill="var(--primary)"
            fillOpacity="0.65"
          />
        </g>
      </svg>
    </Frame>
  );
}

/** Integration / data: two systems exchanging packets. */
export function IntegrationVisual({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full"
        role="img"
        aria-label="Animated system integration illustration"
      >
        {grid}
        {[40, 220].map((x, i) => (
          <g key={x}>
            <rect
              x={x}
              y="52"
              width="60"
              height="76"
              rx="10"
              fill="color-mix(in oklab, var(--card) 92%, transparent)"
              stroke="var(--primary)"
              strokeOpacity="0.4"
            />
            {[0, 1, 2].map((r) => (
              <rect
                key={r}
                x={x + 12}
                y={68 + r * 18}
                width={r === 2 ? 22 : 36}
                height="6"
                rx="3"
                fill="currentColor"
                fillOpacity={i ? 0.16 : 0.22}
              />
            ))}
          </g>
        ))}
        <path
          d="M100 76 H220"
          stroke="var(--primary)"
          strokeOpacity="0.5"
          strokeWidth="1.6"
          strokeDasharray="130"
          className="animate-draw"
        />
        <path
          d="M220 106 H100"
          stroke="var(--primary)"
          strokeOpacity="0.3"
          strokeWidth="1.6"
          strokeDasharray="130"
          className="animate-draw"
          style={{ animationDelay: "0.8s" }}
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="160"
            cy={i === 1 ? 106 : 76}
            r="3.5"
            fill="var(--primary)"
            className="animate-float"
            style={{ animationDelay: `${i * 0.5}s`, animationDuration: "4s" }}
          />
        ))}
      </svg>
    </Frame>
  );
}

/** Design: overlapping artboards with a moving cursor. */
export function DesignVisual({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full"
        role="img"
        aria-label="Animated interface design illustration"
      >
        {grid}
        <rect
          x="52"
          y="36"
          width="130"
          height="106"
          rx="10"
          fill="color-mix(in oklab, var(--card) 90%, transparent)"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <g className="animate-float" style={{ animationDuration: "6.5s" }}>
          <rect
            x="132"
            y="58"
            width="140"
            height="106"
            rx="10"
            fill="color-mix(in oklab, var(--card) 96%, transparent)"
            stroke="var(--primary)"
            strokeOpacity="0.45"
          />
          <rect
            x="146"
            y="74"
            width="60"
            height="8"
            rx="4"
            fill="var(--primary)"
            fillOpacity="0.7"
          />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x="146"
              y={92 + i * 16}
              width={i === 2 ? 70 : 110}
              height="7"
              rx="3.5"
              fill="currentColor"
              fillOpacity="0.18"
            />
          ))}
          <rect
            x="146"
            y="140"
            width="54"
            height="14"
            rx="7"
            fill="var(--primary)"
            fillOpacity="0.6"
          />
        </g>
        <path
          d="M228 118 l0 22 l6 -6 l5 10 l5 -3 l-5 -10 l8 -1 z"
          fill="var(--primary)"
          className="animate-float"
          style={{ animationDuration: "3.5s" }}
        />
      </svg>
    </Frame>
  );
}

export function serviceVisual(slug: string) {
  switch (slug) {
    case "android-app-development":
      return MobileVisual;
    case "ui-ux-design":
    case "website-development":
      return DesignVisual;
    case "cloud-deployment":
    case "api-backend-development":
      return CloudVisual;
    case "system-integration":
    case "database-design-development":
      return IntegrationVisual;
    default:
      return BuildVisual;
  }
}
