import { mythologyEmblem } from "@/lib/journal/mythology-emblems";
import type { MythologyEntity } from "@/lib/journal/mythology-map";

const drawings: Record<string, React.ReactNode> = {
  bolt: <path d="M19 2 7 18h8l-2 12 12-18h-9Z"/>,
  trident: <><path d="M16 29V4M7 5v8q0 5 9 5t9-5V5M4 8l3-4 3 4M13 7l3-4 3 4M22 8l3-4 3 4M12 29h8"/></>,
  bident: <><path d="M11 28V6M5 5v8q0 4 6 4t6-4V5M3 8l2-4 2 4M15 8l2-4 2 4M21 20h8m-3 0v5m-4-3v3"/><circle cx="21" cy="20" r="3"/></>,
  peacock: <><path d="M16 30V16M16 21C2 15 5 2 16 3c11-1 14 12 0 18Z"/><path d="M16 7c-7 0-7 10 0 10s7-10 0-10Z"/><circle cx="16" cy="12" r="2"/></>,
  wheat: <><path d="M16 29V6M16 15Q4 14 7 8q8 0 9 7ZM16 22Q4 21 7 15q8 0 9 7ZM16 12Q28 11 25 5q-8 0-9 7ZM16 20q12-1 9-7-8 0-9 7Z"/></>,
  hearth: <><path d="M6 29V13l10-9 10 9v16M3 29h26M11 28c-7-7 4-10 4-15 8 6 11 12 3 15Z"/></>,
  owl: <><path d="m7 5 5 4h8l5-4v16c0 10-18 10-18 0ZM8 26l-3 4m19-4 3 4"/><circle cx="11" cy="16" r="5"/><circle cx="21" cy="16" r="5"/><path d="m14 22 2 3 2-3M11 15v2m10-2v2"/></>,
  shield: <><path d="M5 10 15 6l10 4v8c0 6-6 10-10 12-4-2-10-6-10-12ZM27 27V3m-3 4 3-5 3 5M15 11v13M10 17h10"/></>,
  shell: <><path d="M13 29C8 22 1 18 3 11 6-1 26-1 29 11c2 7-5 11-10 18ZM16 27V5M13 27 8 7M19 27l5-20M10 25 4 14m18 11 6-11M12 29h8"/></>,
  lyre: <><path d="M6 5c9 0-2 8 0 16 2 10 18 10 20 0 2-8-9-16 0-16M7 12h18M10 12v11m6-11v14m6-14v11M5 5 3 3m23 2 3-2"/></>,
  bow: <><path d="M10 3q22 13 0 26V3M5 16h24m-4-4 4 4-4 4M5 4a6 6 0 0 0 3 9A7 7 0 0 1 5 4Z"/></>,
  caduceus: <><path d="M16 29V5M13 6Q1-2 3 8q3 6 10 1M19 6q12-8 10 2-3 6-10 1M10 12c17 2 16 9 2 11-5 1-4 4 4 6M22 12c-17 2-16 9-2 11 5 1 4 4-4 6"/><circle cx="16" cy="4" r="2"/></>,
  grapes: <><path d="M16 7V2m0 4q9-7 12 0-8 5-12 0Z"/>{[[10,12],[20,12],[6,19],[16,19],[26,19],[11,26],[21,26],[16,31]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y-2} r="4"/>)}</>,
  anvil: <><path d="M2 18h28l-7 6H12l-5-3ZM13 24v5m-5 1h17M18 16V5m-6-3h12v6H12Z"/></>,
  pomegranate: <><path d="m12 7-2-5 6 3 6-3-2 5c15 4 11 23-4 23S-3 11 12 7Z"/>{[[11,14],[20,14],[15,18],[10,23],[21,23],[16,26]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.5"/>)}</>,
  torches: <><path d="m7 29 5-15m13 15-5-15M5 13l10 3m2 0 10-3M9 13C1 9 11 5 9 1c11 7 8 14 0 12ZM23 13c8-4-2-8 0-12-11 7-8 14 0 12Z"/></>,
  "moon-torch": <><path d="M7 29 19 15m-4-3 7 7M19 15c-8-7 8-10 6-15 9 9 3 19-6 15ZM8 3a8 8 0 0 0 4 14A9 9 0 0 1 8 3Z"/></>,
  bloodstone: <><path d="m16 2 11 10-4 13-7 5-7-5-4-13ZM16 2l-5 12 5 16 5-16-5-12ZM5 12l6 2h10l6-2"/></>,
  night: <><path d="M17 3A13 13 0 1 0 29 21 14 14 0 0 1 17 3Z"/><path d="m23 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1ZM7 16h3m-1.5-1.5v3"/></>,
  "inverted-torch": <g transform="rotate(180 16 16)"><path d="M16 30V16M10 16h12M16 16C2 13 17 7 14 1c16 10 9 19 2 15Z"/></g>,
  sleep: <><path d="M3 19q8 9 16 0M5 22l-1 4m7-2v4m6-6 2 4M19 15C12 1 29 4 29 3l-2 7-8 5Zm0 0q11 1 11-6m-11 6q9 7 8-1"/></>,
  thread: <><path d="M4 5h24M16 5v15m-5 0h10M10 24l4-4 8 8M22 20l-4 4M12 30l4-4"/></>,
  scales: <><path d="M16 3v26M7 29h18M4 9h24M7 9l-5 12h10ZM25 9l-5 12h10ZM2 21q5 7 10 0m8 0q5 7 10 0"/></>,
  boat: <><path d="M3 20h26l-5 7H9ZM20 3 8 24M4 30q4-3 8 0t8 0 8 0M19 3l4 3"/></>,
  apple: <><path d="M16 10C3 1-3 23 11 29l5-2 5 2c14-6 8-28-5-19ZM16 10V3m0 4q9-9 12-2-5 6-12 2Z"/></>,
  hourglass: <><path d="M6 3h20M6 29h20M8 3c0 10 8 10 8 13S8 19 8 29M24 3c0 10-8 10-8 13s8 3 8 13M11 25l5-5 5 5"/></>,
  sickle: <path d="M6 29 19 14M19 14C33 8 18-7 9 7c16-4 14 8 10 7Z"/>,
  earth: <><path d="M3 27h26M4 23l8-12 6 9 5-7 6 10M16 19V4m0 8C5 11 5 3 5 3q10 0 11 9Zm0-4C26 8 27 1 27 1 18 1 16 8Z"/></>,
  void: <><path d="M27 9C16-5 0 4 3 18s25 18 26 3S9 2 8 15s16 12 15 4-10-10-11-3 7 7 7 2"/></>,
  sky: <><path d="M3 27a13 13 0 0 1 26 0M4 28h24M16 4v6m-3-3h6M7 14v4m-2-2h4M25 13v4m-2-2h4M13 23v4m-2-2h4"/></>,
  waves: <path d="M2 9q4-5 8 0t8 0 12 0M2 17q4-5 8 0t8 0 12 0M2 25q4-5 8 0t8 0 12 0"/>,
  current: <><circle cx="16" cy="16" r="13"/><path d="M6 13q5-5 10 0t10 0M6 21q5-5 10 0t10 0M9 5l-4 4 5 1M23 27l4-4-5-1"/></>,
  spring: <><path d="M16 2C11 10 4 15 6 22c3 12 23 7 20-3C24 13 20 8 16 2ZM3 29h26M12 20q-3 5 3 6"/></>,
  sun: <><circle cx="16" cy="16" r="7"/><path d="M16 1v5m0 20v5M1 16h5m20 0h5M5 5l4 4m14 14 4 4M5 27l4-4M23 9l4-4"/></>,
  crescent: <path d="M20 3C1-3-3 26 16 29c6 1 10-3 13-7C12 27 8 9 20 3Z"/>,
  dawn: <><path d="M3 24h26M9 24a7 7 0 0 1 14 0M16 3v8M4 10l6 6m18-6-6 6M3 29h26"/></>,
  crown: <path d="M4 10 9 16 16 5l7 11 5-6-4 17H8ZM8 22h16"/>,
  heavens: <><circle cx="16" cy="11" r="9"/><path d="M7 11h18M16 2c-8 5-8 13 0 18 8-5 8-13 0-18ZM5 21l6 3h10l6-3M16 24v7m-6 0h12"/></>,
  flame: <path d="M16 2C22 14 31 13 27 25S4 34 5 21c1-8 7-8 7-14 8 8 0 12 4 15s8-2 0-20Z"/>,
  pipes: <><path d="M3 7h26M5 7v21h5V7m0 0v18h5V7m0 0v15h5V7m0 0v12h5V7m0 0v9h5V7M5 12h25"/></>,
  "serpent-staff": <><path d="M16 2v28M20 5C3 4 8 13 19 13s8 8-3 8-7 6-2 7"/><circle cx="22" cy="5" r="2"/></>,
  wing: <path d="M4 28C-2 14 17 9 29 3c0 13-8 22-25 25ZM5 26l18-14M9 23l4-12m1 9 8-1"/>,
  rainbow: <><path d="M2 28V17a14 14 0 0 1 28 0v11M7 28V17a9 9 0 0 1 18 0v11M12 28V17a4 4 0 0 1 8 0v11"/></>,
  heart: <path d="M16 29C-8 12 3-3 16 8 29-3 40 12 16 29Z"/>,
  shade: <><path d="M6 29V14a10 10 0 0 1 20 0v15l-5-4-5 4-5-4Z"/><circle cx="12" cy="14" r="1"/><circle cx="20" cy="14" r="1"/><path d="M12 20q4 4 8 0"/></>,
  gorgon: <><path d="M8 10c-13-9 4-15 4-5m4 2c-3-13 13-4 6 1m2 2c11-8 10 10 3 6M7 16c-10-6-9 10-1 9M8 10h16v11c0 12-16 12-16 0Z"/><path d="M11 16h2m6 0h2m-9 7q4 4 8 0"/></>,
  serpents: <><path d="M7 13C-1 2 11-3 11 8c4-17 13-5 8 1 13-12 18 6 6 5M8 13v9c0 12 16 12 16 0v-9M10 18h4m4 0h4m-10 7h8"/></>,
  talon: <><path d="M4 5q23 3 25 17L15 14 5 15ZM15 14l-3 11-6 4m6-4 4 5m-4-5 7-1"/></>,
  leaf: <><path d="M5 29 25 6M7 25C-1 6 15 0 28 3c-1 15-3 28-21 22ZM12 22l-1-9m6 4 9-1"/></>,
  laurel: <><path d="M14 29C-3 21 5 5 9 3m9 26C35 21 27 5 23 3M8 9l-6-1 2 6 5 1m-2 4-5-1 3 6h6M24 9l6-1-2 6-5 1m2 4 5-1-3 6h-6"/></>,
};

export default function MythologyEmblem({ entity }: { entity: MythologyEntity }) {
  const emblem = mythologyEmblem(entity);
  return <g data-emblem={emblem.symbol} data-personal-emblem={emblem.personal} aria-hidden="true">
    <svg x={emblem.personal ? -19 : -18} y={emblem.personal ? -19 : -23} width={emblem.personal ? 38 : 36} height={emblem.personal ? 38 : 30} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{drawings[emblem.symbol] || drawings.laurel}</svg>
    {!emblem.personal && <text x="0" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor">{emblem.monogram}</text>}
  </g>;
}
