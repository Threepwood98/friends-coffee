export function CouchScene() {
  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="La terraza imaginaria: un sofá naranja junto a una puerta morada con mirilla"
      className="h-auto w-full max-w-md"
    >
      {/* zócalo */}
      <rect x="0" y="258" width="420" height="22" fill="var(--muted)" />

      {/* puerta morada con marco amarillo */}
      <rect x="22" y="34" width="124" height="224" rx="16" fill="var(--door)" />
      <rect
        x="22"
        y="34"
        width="124"
        height="224"
        rx="16"
        fill="none"
        stroke="var(--peephole)"
        strokeWidth="6"
      />
      {/* paneles de la puerta */}
      <rect
        x="40"
        y="52"
        width="88"
        height="92"
        rx="8"
        fill="none"
        stroke="oklch(0.97 0.02 90 / 0.25)"
        strokeWidth="3"
      />
      <rect
        x="40"
        y="158"
        width="88"
        height="84"
        rx="8"
        fill="none"
        stroke="oklch(0.97 0.02 90 / 0.25)"
        strokeWidth="3"
      />
      {/* pomo */}
      <circle cx="136" cy="160" r="5" fill="var(--cream)" />
      {/* mirilla */}
      <circle cx="84" cy="72" r="13" fill="var(--peephole)" />
      <circle cx="84" cy="72" r="6" fill="var(--coffee)" />
      <circle cx="81.5" cy="69.5" r="1.6" fill="var(--peephole)" />

      {/* sofá naranja */}
      <g>
        {/* patas */}
        <rect
          x="178"
          y="252"
          width="12"
          height="10"
          rx="3"
          fill="var(--coffee)"
        />
        <rect
          x="392"
          y="252"
          width="12"
          height="10"
          rx="3"
          fill="var(--coffee)"
        />

        {/* respaldo */}
        <rect
          x="188"
          y="118"
          width="216"
          height="38"
          rx="16"
          fill="oklch(0.5 0.14 45)"
        />
        {/* brazos */}
        <rect
          x="172"
          y="124"
          width="27"
          height="114"
          rx="13"
          fill="oklch(0.58 0.15 45)"
        />
        <rect
          x="393"
          y="124"
          width="27"
          height="114"
          rx="13"
          fill="oklch(0.58 0.15 45)"
        />
        {/* asiento */}
        <rect
          x="176"
          y="216"
          width="244"
          height="42"
          rx="14"
          fill="var(--sofa)"
        />
        {/* cojines */}
        <rect
          x="182"
          y="214"
          width="117"
          height="40"
          rx="13"
          fill="oklch(0.77 0.15 45)"
        />
        <rect
          x="303"
          y="214"
          width="117"
          height="40"
          rx="13"
          fill="oklch(0.77 0.15 45)"
        />
        {/* costura */}
        <line
          x1="302"
          y1="216"
          x2="302"
          y2="252"
          stroke="oklch(0.6 0.13 45 / 0.6)"
          strokeWidth="2"
        />
        <line
          x1="183"
          y1="234"
          x2="298"
          y2="234"
          stroke="oklch(0.6 0.13 45 / 0.4)"
          strokeWidth="2"
        />
        <line
          x1="304"
          y1="234"
          x2="419"
          y2="234"
          stroke="oklch(0.6 0.13 45 / 0.4)"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
