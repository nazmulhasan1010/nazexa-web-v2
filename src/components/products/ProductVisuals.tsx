/**
 * Animated SVG illustrations for the Nazexa product pages.
 * Pure SVG + CSS (SMIL-free where possible) so they stay light and GPU friendly.
 */
import { cn } from "@/lib/utils";

const frame = "h-full w-full";

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "surface-card relative aspect-[16/10] w-full overflow-hidden p-0",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_60%)]" />
      {children}
    </div>
  );
}

/** Thumbnail / hero visual for Nazexa DB Design — an ERD canvas that draws itself. */
export function ErdVisual({ className }: { className?: string | undefined }) {
  return (
    <Shell className={className}>
      <svg
        viewBox="0 0 320 200"
        className={frame}
        role="img"
        aria-label="Animated entity relationship diagram"
      >
        <defs>
          <linearGradient id="erd-edge" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <g stroke="currentColor" strokeOpacity="0.08">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="200" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2="320" y2={i * 20} />
          ))}
        </g>

        <path
          d="M92 56 C132 56 128 104 168 104"
          fill="none"
          stroke="url(#erd-edge)"
          strokeWidth="1.8"
          strokeDasharray="200"
          className="animate-draw"
        />
        <path
          d="M92 140 C130 140 136 116 168 116"
          fill="none"
          stroke="url(#erd-edge)"
          strokeWidth="1.8"
          strokeDasharray="200"
          className="animate-draw"
          style={{ animationDelay: "0.6s" }}
        />

        {[
          { x: 24, y: 34, label: "users", rows: 3 },
          { x: 24, y: 118, label: "teams", rows: 2 },
          { x: 176, y: 78, label: "projects", rows: 3 },
        ].map((t, i) => (
          <g
            key={t.label}
            className="animate-float"
            style={{ animationDelay: `${i * 0.8}s` }}
          >
            <rect
              x={t.x}
              y={t.y}
              width="72"
              height={20 + t.rows * 12}
              rx="5"
              fill="var(--card)"
              stroke="var(--primary)"
              strokeOpacity="0.45"
            />
            <rect
              x={t.x}
              y={t.y}
              width="72"
              height="14"
              rx="5"
              fill="var(--primary)"
              fillOpacity="0.18"
            />
            <text
              x={t.x + 7}
              y={t.y + 10}
              fontSize="7"
              fill="currentColor"
              fontFamily="monospace"
            >
              {t.label}
            </text>
            {Array.from({ length: t.rows }).map((_, r) => (
              <g key={r}>
                <rect
                  x={t.x + 7}
                  y={t.y + 20 + r * 12}
                  width="34"
                  height="4"
                  rx="2"
                  fill="currentColor"
                  fillOpacity="0.35"
                />
                <rect
                  x={t.x + 48}
                  y={t.y + 20 + r * 12}
                  width="16"
                  height="4"
                  rx="2"
                  fill="var(--primary)"
                  fillOpacity="0.5"
                />
              </g>
            ))}
          </g>
        ))}

        {/* minimap */}
        <g opacity="0.6">
          <rect
            x="252"
            y="150"
            width="56"
            height="36"
            rx="4"
            fill="var(--card)"
            stroke="currentColor"
            strokeOpacity="0.2"
          />
          <rect
            x="258"
            y="156"
            width="14"
            height="9"
            rx="2"
            fill="var(--primary)"
            fillOpacity="0.6"
          />
          <rect
            x="282"
            y="168"
            width="16"
            height="10"
            rx="2"
            fill="var(--primary)"
            fillOpacity="0.4"
          />
        </g>
      </svg>
    </Shell>
  );
}

/** Thumbnail / hero visual for Nazexa DEV Tools — a tool console cycling through payloads. */
export function DevToolsVisual({
  className,
}: {
  className?: string | undefined;
}) {
  return (
    <Shell className={className}>
      <svg
        viewBox="0 0 320 200"
        className={frame}
        role="img"
        aria-label="Animated developer tools console"
      >
        <rect
          x="18"
          y="18"
          width="284"
          height="164"
          rx="10"
          fill="var(--card)"
          stroke="currentColor"
          strokeOpacity="0.14"
        />
        <g>
          {["JSON", "API", "JWT", "SQL"].map((t, i) => (
            <g key={t}>
              <rect
                x={30 + i * 62}
                y={30}
                width="54"
                height="18"
                rx="5"
                fill="var(--primary)"
                fillOpacity={i === 0 ? 0.28 : 0.08}
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.08;0.32;0.08"
                  dur="6s"
                  begin={`${i * 1.5}s`}
                  repeatCount="indefinite"
                />
              </rect>
              <text
                x={37 + i * 62}
                y={43}
                fontSize="8"
                fill="currentColor"
                fontFamily="monospace"
              >
                {t}
              </text>
            </g>
          ))}
        </g>

        {[
          [42, "{"],
          [56, '  "status": 200,'],
          [70, '  "user": {'],
          [84, '    "id": "usr_91f",'],
          [98, '    "role": "admin"'],
          [112, "  }"],
          [126, "}"],
        ].map(([y, text], i) => (
          <text
            key={i}
            x="32"
            y={(y as number) + 22}
            fontSize="8"
            fontFamily="monospace"
            fill="currentColor"
            fillOpacity="0.75"
          >
            {text}
            <animate
              attributeName="fill-opacity"
              values="0;0.8;0.8"
              dur="3s"
              begin={`${i * 0.18}s`}
              repeatCount="indefinite"
            />
          </text>
        ))}

        <rect
          x="214"
          y="64"
          width="76"
          height="96"
          rx="6"
          fill="var(--primary)"
          fillOpacity="0.07"
          stroke="var(--primary)"
          strokeOpacity="0.3"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x="224"
            y={78 + i * 16}
            width={i % 2 ? 40 : 56}
            height="5"
            rx="2.5"
            fill="var(--primary)"
            fillOpacity="0.45"
          >
            <animate
              attributeName="width"
              values="20;56;20"
              dur="4s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </svg>
    </Shell>
  );
}

/** Small feature-level illustrations. */
export function RelationshipVisual() {
  return (
    <FeatureFrame label="Relationship validation">
      <g>
        <rect
          x="14"
          y="30"
          width="52"
          height="34"
          rx="5"
          fill="var(--card)"
          stroke="var(--primary)"
          strokeOpacity="0.5"
        />
        <rect
          x="94"
          y="16"
          width="52"
          height="30"
          rx="5"
          fill="var(--card)"
          stroke="var(--primary)"
          strokeOpacity="0.5"
        />
        <rect
          x="94"
          y="58"
          width="52"
          height="30"
          rx="5"
          fill="var(--card)"
          stroke="var(--primary)"
          strokeOpacity="0.5"
        />
        <path
          d="M66 44 C82 44 78 30 94 30"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.6"
          strokeDasharray="90"
          className="animate-draw"
        />
        <path
          d="M66 50 C82 50 78 72 94 72"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.6"
          strokeDasharray="90"
          className="animate-draw"
          style={{ animationDelay: "0.5s" }}
        />
        <circle cx="80" cy="44" r="3" fill="var(--primary)">
          <animate
            attributeName="r"
            values="2;4.5;2"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </FeatureFrame>
  );
}

export function AutoLayoutVisual() {
  return (
    <FeatureFrame label="Auto layout and snap to grid">
      <g stroke="currentColor" strokeOpacity="0.1">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="104" />
        ))}
      </g>
      {[
        { x: 12, y: 18, d: "0s" },
        { x: 66, y: 54, d: "0.4s" },
        { x: 112, y: 22, d: "0.8s" },
      ].map((b) => (
        <rect
          key={b.d}
          x={b.x}
          y={b.y}
          width="40"
          height="28"
          rx="5"
          fill="var(--primary)"
          fillOpacity="0.16"
          stroke="var(--primary)"
          strokeOpacity="0.5"
          className="animate-float"
          style={{ animationDelay: b.d }}
        />
      ))}
    </FeatureFrame>
  );
}

export function ExportVisual() {
  return (
    <FeatureFrame label="Export to SQL, Laravel, PNG and SVG">
      {["SQL", "JSON", "PHP", "SVG"].map((t, i) => (
        <g key={t}>
          <rect
            x={10 + i * 38}
            y="36"
            width="32"
            height="32"
            rx="6"
            fill="var(--primary)"
            fillOpacity="0.12"
            stroke="var(--primary)"
            strokeOpacity="0.4"
          >
            <animate
              attributeName="y"
              values="36;28;36"
              dur="3.2s"
              begin={`${i * 0.35}s`}
              repeatCount="indefinite"
            />
          </rect>
          <text
            x={14 + i * 38}
            y="56"
            fontSize="8"
            fontFamily="monospace"
            fill="currentColor"
            fillOpacity="0.8"
          >
            {t}
            <animate
              attributeName="y"
              values="56;48;56"
              dur="3.2s"
              begin={`${i * 0.35}s`}
              repeatCount="indefinite"
            />
          </text>
        </g>
      ))}
    </FeatureFrame>
  );
}

export function JsonVisual() {
  return (
    <FeatureFrame label="JSON formatting and validation">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={16 + (i % 3) * 8}
          y={20 + i * 14}
          width="40"
          height="6"
          rx="3"
          fill="currentColor"
          fillOpacity="0.3"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={`r${i}`}
          x="96"
          y={20 + i * 14}
          width="10"
          height="6"
          rx="3"
          fill="var(--primary)"
          fillOpacity="0.7"
        >
          <animate
            attributeName="width"
            values="10;56;10"
            dur="3.6s"
            begin={`${i * 0.25}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </FeatureFrame>
  );
}

export function ApiVisual() {
  return (
    <FeatureFrame label="API request builder and tester">
      <rect
        x="12"
        y="24"
        width="60"
        height="20"
        rx="5"
        fill="var(--primary)"
        fillOpacity="0.18"
        stroke="var(--primary)"
        strokeOpacity="0.4"
      />
      <text
        x="18"
        y="38"
        fontSize="8"
        fontFamily="monospace"
        fill="currentColor"
      >
        GET /v1
      </text>
      <path
        d="M76 34 H140"
        stroke="var(--primary)"
        strokeWidth="1.6"
        strokeDasharray="4 4"
      />
      <circle cx="76" cy="34" r="3.5" fill="var(--primary)">
        <animate
          attributeName="cx"
          values="76;140;76"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </circle>
      <rect
        x="12"
        y="58"
        width="128"
        height="30"
        rx="5"
        fill="var(--card)"
        stroke="currentColor"
        strokeOpacity="0.15"
      />
      <text
        x="18"
        y="77"
        fontSize="8"
        fontFamily="monospace"
        fill="var(--primary)"
      >
        200 OK · 84 ms
      </text>
    </FeatureFrame>
  );
}

export function JwtVisual() {
  return (
    <FeatureFrame label="JWT decoding and inspection">
      {[
        { x: 10, w: 40, label: "header" },
        { x: 54, w: 52, label: "payload" },
        { x: 110, w: 36, label: "sig" },
      ].map((s, i) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y="30"
            width={s.w}
            height="20"
            rx="4"
            fill="var(--primary)"
            fillOpacity={0.1 + i * 0.12}
            stroke="var(--primary)"
            strokeOpacity="0.4"
          >
            <animate
              attributeName="fill-opacity"
              values="0.08;0.34;0.08"
              dur="4.5s"
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
            />
          </rect>
          <text
            x={s.x + 5}
            y="44"
            fontSize="7"
            fontFamily="monospace"
            fill="currentColor"
            fillOpacity="0.85"
          >
            {s.label}
          </text>
          <rect
            x={s.x}
            y="62"
            width={s.w}
            height="5"
            rx="2.5"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <rect
            x={s.x}
            y="72"
            width={s.w * 0.7}
            height="5"
            rx="2.5"
            fill="currentColor"
            fillOpacity="0.18"
          />
        </g>
      ))}
    </FeatureFrame>
  );
}

function FeatureFrame({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-secondary/25">
      <svg
        viewBox="0 0 160 104"
        className="h-28 w-full"
        role="img"
        aria-label={label}
      >
        {children}
      </svg>
    </div>
  );
}
