const ink = "var(--ink)";
const pine = "var(--pine-bright)";
const pineWash = "var(--pine-wash)";
const amber = "var(--amber)";
const amberWash = "var(--amber-wash)";
const paperDeep = "var(--paper-deep)";
const rust = "var(--rust)";
const faint = "var(--ink-faint)";

export function HeroMail() {
  return (
    <svg viewBox="0 0 340 300" fill="none" role="img" aria-label="Illustration of an email protected by a shield" style={{ width: "100%", height: "auto" }}>
      <path d="M30 250 C 90 210, 250 210, 315 245" stroke={faint} strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      <path d="M20 120 C 60 90, 100 140, 60 170" stroke={faint} strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      <rect x="70" y="90" width="200" height="130" rx="14" fill="#fff" stroke={ink} strokeWidth="2" />
      <path d="M70 104 L 170 175 L 270 104" stroke={ink} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <rect x="70" y="90" width="200" height="130" rx="14" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="258" cy="88" r="44" fill={pineWash} stroke={pine} strokeWidth="2" />
      <path d="M258 62 c 12 8 22 8 26 8 v 22 c 0 18 -14 28 -26 34 c -12 -6 -26 -16 -26 -34 v -22 c 4 0 14 0 26 -8 z" fill="#fff" stroke={pine} strokeWidth="2" strokeLinejoin="round" />
      <path d="M246 92 l 9 9 l 17 -18" stroke={pine} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="52" cy="212" r="5" fill={amber} />
      <circle cx="300" cy="180" r="4" fill={pine} />
      <circle cx="40" cy="70" r="3.5" fill={rust} opacity="0.7" />
      <path d="M96 240 h 60" stroke={paperDeep} strokeWidth="8" strokeLinecap="round" />
      <path d="M96 256 h 96" stroke={paperDeep} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function VecSpf() {
  return (
    <svg viewBox="0 0 200 170" fill="none" role="img" aria-label="A guest list on a clipboard" style={{ width: "100%", height: "auto", maxWidth: 190 }}>
      <rect x="45" y="18" width="112" height="138" rx="10" fill="#fff" stroke={ink} strokeWidth="2" />
      <rect x="80" y="8" width="42" height="18" rx="6" fill={amberWash} stroke={ink} strokeWidth="2" />
      <g stroke={pine} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 52 l 5 5 l 9 -10" />
        <path d="M60 82 l 5 5 l 9 -10" />
        <path d="M60 112 l 5 5 l 9 -10" />
      </g>
      <g stroke={faint} strokeWidth="5" strokeLinecap="round">
        <path d="M85 50 h 52" /><path d="M85 80 h 40" /><path d="M85 110 h 48" />
      </g>
      <path d="M60 138 l 12 0" stroke={rust} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62 132 l 8 12 M 70 132 l -8 12" stroke={rust} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M85 138 h 30" stroke={faint} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function VecDkim() {
  return (
    <svg viewBox="0 0 200 170" fill="none" role="img" aria-label="A wax-sealed letter" style={{ width: "100%", height: "auto", maxWidth: 190 }}>
      <rect x="30" y="40" width="140" height="95" rx="10" fill="#fff" stroke={ink} strokeWidth="2" />
      <path d="M30 52 L 100 100 L 170 52" stroke={ink} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <circle cx="100" cy="100" r="26" fill={amber} stroke={ink} strokeWidth="2" />
      <circle cx="100" cy="100" r="15" fill="none" stroke="oklch(45% 0.1 70)" strokeWidth="2" strokeDasharray="3 4" />
      <path d="M94 100 a 6 6 0 1 1 6 6 v 4 h 4" stroke="oklch(35% 0.08 70)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M155 30 c 10 -3 15 2 12 12" stroke={pine} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M42 145 c -8 3 -13 -2 -10 -10" stroke={pine} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function VecDmarc() {
  return (
    <svg viewBox="0 0 200 170" fill="none" role="img" aria-label="A shield with a report loop" style={{ width: "100%", height: "auto", maxWidth: 190 }}>
      <path d="M100 18 c 20 14 38 14 46 14 v 40 c 0 34 -26 52 -46 62 c -20 -10 -46 -28 -46 -62 v -40 c 8 0 26 0 46 -14 z" fill={pineWash} stroke={pine} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M80 78 l 13 13 l 27 -28" stroke={pine} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M158 60 c 22 24 14 66 -18 82" stroke={faint} strokeWidth="1.8" strokeDasharray="2 6" strokeLinecap="round" fill="none" />
      <path d="M136 146 l 6 -6 m -6 6 l 8 3" stroke={faint} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <rect x="20" y="120" width="44" height="32" rx="6" fill="#fff" stroke={ink} strokeWidth="2" />
      <path d="M27 128 h 30 M 27 136 h 22 M 27 144 h 26" stroke={amber} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function FlowDiagram() {
  return (
    <svg viewBox="0 0 720 240" fill="none" role="img" aria-label="Diagram of an email passing authentication checks on its way to the inbox" style={{ width: "100%", height: "auto" }}>
      <rect x="14" y="86" width="120" height="68" rx="12" fill="#fff" stroke={ink} strokeWidth="2" />
      <path d="M14 98 L 74 136 L 134 98" stroke={ink} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <text x="74" y="180" textAnchor="middle" fontSize="14" fill={ink} fontFamily="var(--font-body)" fontWeight="600">Your email</text>

      <path d="M140 120 h 62" stroke={faint} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M196 114 l 8 6 l -8 6" stroke={faint} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="214" y="42" width="200" height="156" rx="16" fill={paperDeep} stroke={ink} strokeWidth="2" />
      <text x="314" y="30" textAnchor="middle" fontSize="13" fill={faint} fontFamily="var(--font-body)" fontWeight="600" letterSpacing="1.5">RECEIVER CHECKS</text>
      <g fontFamily="var(--font-body)" fontSize="14" fontWeight="600">
        <rect x="234" y="60" width="160" height="34" rx="8" fill="#fff" stroke={pine} strokeWidth="1.5" />
        <text x="252" y="82" fill={ink}>SPF</text>
        <path d="M366 71 l 5 6 l 10 -11" stroke={pine} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="234" y="103" width="160" height="34" rx="8" fill="#fff" stroke={pine} strokeWidth="1.5" />
        <text x="252" y="125" fill={ink}>DKIM</text>
        <path d="M366 114 l 5 6 l 10 -11" stroke={pine} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="234" y="146" width="160" height="34" rx="8" fill="#fff" stroke={pine} strokeWidth="1.5" />
        <text x="252" y="168" fill={ink}>DMARC</text>
        <path d="M366 157 l 5 6 l 10 -11" stroke={pine} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      <path d="M420 100 C 470 90 500 78 546 66" stroke={pine} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M538 62 l 10 3 l -6 9" stroke={pine} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M420 150 C 470 160 496 172 540 186" stroke={rust} strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" fill="none" opacity="0.75" />

      <rect x="556" y="28" width="150" height="62" rx="12" fill={pineWash} stroke={pine} strokeWidth="2" />
      <text x="631" y="54" textAnchor="middle" fontSize="15" fill={ink} fontFamily="var(--font-body)" fontWeight="600">Inbox</text>
      <text x="631" y="74" textAnchor="middle" fontSize="12" fill={faint} fontFamily="var(--font-body)">checks pass</text>

      <rect x="556" y="160" width="150" height="62" rx="12" fill="var(--rust-wash)" stroke={rust} strokeWidth="2" />
      <text x="631" y="186" textAnchor="middle" fontSize="15" fill={rust} fontFamily="var(--font-body)" fontWeight="600">Spam · rejected</text>
      <text x="631" y="206" textAnchor="middle" fontSize="12" fill={faint} fontFamily="var(--font-body)">checks fail</text>
    </svg>
  );
}

export function DashboardPreview() {
  return (
    <svg viewBox="0 0 420 300" fill="none" role="img" aria-label="Preview of the InboxGuard monitoring dashboard" style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="10" width="400" height="280" rx="14" fill="#fff" stroke="oklch(70% 0.02 140)" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="4" fill={rust} opacity="0.7" />
      <circle cx="46" cy="30" r="4" fill={amber} opacity="0.8" />
      <circle cx="62" cy="30" r="4" fill={pine} opacity="0.8" />
      <text x="30" y="66" fontSize="12" fill={faint} fontFamily="var(--font-body)" fontWeight="600" letterSpacing="1">DMARC PASS RATE</text>
      <text x="30" y="92" fontSize="24" fill={ink} fontFamily="var(--font-display)" fontWeight="600">98.2%</text>
      <polyline points="30,150 80,144 130,148 180,132 230,136 280,120 330,116 388,104" stroke={pine} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="30,150 80,144 130,148 180,132 230,136 280,120 330,116 388,104 388,168 30,168" fill={pineWash} opacity="0.45" stroke="none" />
      <g fontFamily="var(--font-body)" fontSize="12">
        <rect x="30" y="186" width="358" height="28" rx="6" fill={paperDeep} />
        <circle cx="46" cy="200" r="4" fill={pine} />
        <text x="58" y="204" fill={ink} fontWeight="600">Google Workspace</text>
        <text x="352" y="204" fill={pine} fontWeight="600">pass</text>
        <rect x="30" y="220" width="358" height="28" rx="6" fill={paperDeep} />
        <circle cx="46" cy="234" r="4" fill={amber} />
        <text x="58" y="238" fill={ink} fontWeight="600">Mailchimp</text>
        <text x="342" y="238" fill="var(--amber-deep)" fontWeight="600">align</text>
        <rect x="30" y="254" width="358" height="28" rx="6" fill="var(--rust-wash)" />
        <circle cx="46" cy="268" r="4" fill={rust} />
        <text x="58" y="272" fill={ink} fontWeight="600">Unknown · 185.220.x.x</text>
        <text x="336" y="272" fill={rust} fontWeight="600">spoof</text>
      </g>
    </svg>
  );
}
