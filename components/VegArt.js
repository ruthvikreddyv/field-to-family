// Hand-drawn vegetable illustrations (original SVG, free, no downloads, no licences).
// Each one is drawn in a 64x64 box. If a Sheet row has an Image URL, a real photo is shown instead.

const SH = "rgba(43,32,19,.14)"; // soft ground shadow

function Ground() { return <ellipse cx="32" cy="58" rx="19" ry="3" fill={SH} />; }

function Bunch({ leaf, dark, vein, n = 5, rx = 8, ry = 18, spread = 34, accent, ruffle }) {
  const angles = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * ((2 * spread) / (n - 1)));
  return (
    <g>
      <Ground />
      {angles.map((a, i) => (
        <g key={i} transform={`rotate(${a} 32 54)`}>
          <ellipse cx="32" cy={54 - ry} rx={rx} ry={ry} fill={i % 2 ? leaf : dark} />
          {accent && <ellipse cx="32" cy={54 - ry * 0.9} rx={rx * 0.4} ry={ry * 0.55} fill={accent} opacity=".85" />}
          {!ruffle && <path d={`M32 ${54} L32 ${54 - ry * 1.8}`} stroke={vein} strokeWidth="1" opacity=".6" />}
          {ruffle && <circle cx="32" cy={54 - ry * 1.6} r={rx * 0.7} fill={leaf} />}
        </g>
      ))}
      <rect x="27" y="49" width="10" height="5" rx="2" fill="#e2901f" />
      <path d="M29 54 L28 60 M35 54 L36 60" stroke="#8aa56b" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Leaves({ c = "#4d7a3a", c2 = "#6c8f58", y = 14 }) {
  return (
    <g>
      <path d={`M32 ${y + 6} C22 ${y - 6} 14 ${y + 2} 20 ${y + 10} C25 ${y + 12} 30 ${y + 10} 32 ${y + 6}Z`} fill={c} />
      <path d={`M32 ${y + 6} C42 ${y - 8} 52 ${y} 44 ${y + 10} C39 ${y + 12} 34 ${y + 10} 32 ${y + 6}Z`} fill={c2} />
      <path d={`M32 ${y + 8} C31 ${y - 4} 34 ${y - 6} 33 ${y - 8} C38 ${y - 2} 36 ${y + 4} 32 ${y + 8}Z`} fill={c} />
    </g>
  );
}

const ART = {
  spinach: () => <Bunch leaf="#3f8a3f" dark="#2d6a30" vein="#c8e6b0" n={5} rx={8} ry={16} />,
  fenugreek: () => <Bunch leaf="#78b04a" dark="#5c9638" vein="#d8efb8" n={6} rx={5} ry={14} ruffle />,
  amaranth: () => <Bunch leaf="#4f9a43" dark="#3b7e35" vein="#d8efb8" n={5} rx={7} ry={16} accent="#c2355a" />,
  coriander: () => <Bunch leaf="#8cc152" dark="#6fa83d" vein="#e3f3c6" n={7} rx={4.5} ry={14} ruffle />,
  mint: () => <Bunch leaf="#58b06b" dark="#3f9456" vein="#d4f0d8" n={5} rx={6} ry={13} />,
  mustard: () => <Bunch leaf="#5f9f3a" dark="#46832c" vein="#dcefbf" n={4} rx={9} ry={17} />,

  potato: () => (
    <g><Ground />
      <path d="M12 36 C10 24 24 16 38 18 C52 20 56 32 50 42 C44 54 22 54 14 46 C12 44 12 40 12 36Z" fill="#c99a5b" />
      <path d="M16 44 C22 52 42 52 48 42 C52 36 52 30 50 28 C50 40 38 50 16 44Z" fill="#b5834a" opacity=".6" />
      <g fill="#8a5d2b"><circle cx="24" cy="30" r="1.6" /><circle cx="36" cy="26" r="1.4" /><circle cx="42" cy="38" r="1.7" /><circle cx="28" cy="42" r="1.4" /></g>
      <ellipse cx="26" cy="24" rx="7" ry="3" fill="#fff" opacity=".22" />
    </g>),
  onion: () => (
    <g><Ground />
      <path d="M32 6 C33 12 36 14 36 18 C48 22 54 34 48 44 C42 54 22 54 16 44 C10 34 16 22 28 18 C28 14 31 12 32 6Z" fill="#b4476b" />
      <path d="M32 18 C24 26 22 40 28 52 M32 18 C40 26 42 40 36 52" stroke="#d98aa5" strokeWidth="1.4" fill="none" />
      <ellipse cx="26" cy="28" rx="4" ry="8" fill="#fff" opacity=".22" transform="rotate(14 26 28)" />
      <path d="M26 54 L24 58 M30 54 L30 58 M36 54 L38 58" stroke="#e7d7b3" strokeWidth="1.4" />
    </g>),
  carrot: () => (
    <g><Ground /><g transform="rotate(-18 32 32)">
      <path d="M26 18 C26 14 38 14 38 18 L34 56 C33 59 31 59 30 56Z" fill="#f08a24" />
      <path d="M28 26 H36 M29 34 H35 M30 42 H34" stroke="#c96a10" strokeWidth="1.4" />
      <path d="M32 16 C26 8 24 4 22 2 M32 16 C32 8 32 4 32 0 M32 16 C38 8 40 4 42 2" stroke="#4d8a3a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </g></g>),
  beetroot: () => (
    <g><Ground />
      <path d="M32 22 C46 20 54 30 50 42 C46 52 36 54 32 56 C28 54 18 52 14 42 C10 30 18 20 32 22Z" fill="#8e1f4d" />
      <ellipse cx="25" cy="32" rx="5" ry="7" fill="#fff" opacity=".18" />
      <path d="M32 56 L32 61" stroke="#8e1f4d" strokeWidth="1.6" />
      <path d="M28 22 C22 14 20 8 18 4 M32 22 C32 14 34 8 36 3 M36 22 C42 14 46 10 48 7" stroke="#4d8a3a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M28 22 C22 14 20 8 18 4" stroke="#b83a66" strokeWidth="1.2" fill="none" />
    </g>),
  radish: () => (
    <g><Ground />
      <path d="M32 22 C44 22 50 32 44 44 C40 52 34 56 32 60 C30 56 24 52 20 44 C14 32 20 22 32 22Z" fill="#f4f0f2" />
      <path d="M32 22 C44 22 50 32 44 44 C42 48 40 50 38 52 C46 42 46 28 32 26Z" fill="#d7487a" opacity=".55" />
      <path d="M32 22 C28 14 22 8 18 6 M32 22 C32 12 34 8 36 4 M32 22 C38 14 44 10 48 8" stroke="#4d8a3a" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </g>),
  sweetpotato: () => (
    <g><Ground /><g transform="rotate(-24 32 34)">
      <path d="M8 34 C10 24 30 20 44 24 C54 27 58 31 58 34 C58 39 52 44 42 45 C26 47 10 46 8 34Z" fill="#b8553b" />
      <path d="M14 40 C26 46 44 46 54 38 C50 46 34 49 18 46Z" fill="#8f3b27" opacity=".5" />
      <ellipse cx="28" cy="28" rx="9" ry="2.6" fill="#fff" opacity=".22" />
      <path d="M22 32 H26 M38 36 H42" stroke="#8f3b27" strokeWidth="1.2" />
    </g></g>),
  ginger: () => (
    <g><Ground />
      <path d="M10 38 C8 30 14 26 20 28 C20 20 28 16 32 22 C34 14 44 14 44 24 C52 22 56 30 52 36 C58 38 56 48 48 48 C40 54 24 54 16 48 C10 48 8 42 10 38Z" fill="#d6b27a" />
      <path d="M16 44 C28 50 42 50 50 44 M24 34 C28 32 32 32 36 34 M30 24 C32 26 34 26 36 24" stroke="#a98450" strokeWidth="1.4" fill="none" />
      <ellipse cx="26" cy="30" rx="5" ry="2.4" fill="#fff" opacity=".28" />
    </g>),
  garlic: () => (
    <g><Ground />
      <path d="M32 6 C33 12 34 14 36 18 C48 22 54 34 48 44 C42 54 22 54 16 44 C10 34 16 22 28 18 C30 14 31 12 32 6Z" fill="#f1e6cf" stroke="#cdbd98" strokeWidth="1.2" />
      <path d="M32 18 C24 26 22 40 28 53 M32 18 C40 26 42 40 36 53 M32 18 L32 54" stroke="#d9cdb4" strokeWidth="1.4" fill="none" />
      <path d="M26 54 L24 58 M32 54 L32 58 M38 54 L40 58" stroke="#c9b78f" strokeWidth="1.4" />
    </g>),

  bottlegourd: () => (
    <g><Ground /><g transform="rotate(-22 32 32)">
      <path d="M28 6 C28 4 36 4 36 6 L36 18 C50 24 50 52 32 54 C14 52 14 24 28 18Z" fill="#a9d27a" />
      <path d="M22 34 C22 44 26 50 32 51" stroke="#8cb860" strokeWidth="2" fill="none" />
      <ellipse cx="24" cy="38" rx="3" ry="8" fill="#fff" opacity=".3" />
      <rect x="29" y="2" width="6" height="5" rx="2" fill="#7a9a4e" />
    </g></g>),
  ridgegourd: () => (
    <g><Ground /><g transform="rotate(-30 32 32)">
      <path d="M26 6 L38 6 L36 56 C35 60 29 60 28 56Z" fill="#4f8f3a" />
      <path d="M29 8 L30 56 M32 8 V58 M35 8 L34 56" stroke="#2f6a26" strokeWidth="1.5" />
      <path d="M24 4 C24 2 40 2 40 4 L38 8 H26Z" fill="#6a8a3c" />
    </g></g>),
  bittergourd: () => (
    <g><Ground /><g transform="rotate(-28 32 32)">
      <path d="M32 4 C44 6 48 24 46 38 C44 52 38 58 32 60 C26 58 20 52 18 38 C16 24 20 6 32 4Z" fill="#4c8a3c" />
      <g fill="#2f6a26"><ellipse cx="26" cy="18" rx="2.4" ry="4" /><ellipse cx="34" cy="14" rx="2.4" ry="4" /><ellipse cx="38" cy="26" rx="2.4" ry="4" /><ellipse cx="24" cy="32" rx="2.4" ry="4" /><ellipse cx="33" cy="38" rx="2.4" ry="4" /><ellipse cx="26" cy="46" rx="2.4" ry="4" /><ellipse cx="38" cy="48" rx="2.2" ry="3.4" /></g>
      <path d="M32 4 V60" stroke="#7fb862" strokeWidth="1.2" opacity=".6" />
    </g></g>),
  pumpkin: () => (
    <g><Ground />
      <ellipse cx="32" cy="38" rx="22" ry="17" fill="#e8851f" />
      <path d="M32 21 C22 26 20 50 32 55 C44 50 42 26 32 21Z" fill="#f09a35" />
      <path d="M32 21 C26 28 25 46 32 55 M32 21 C38 28 39 46 32 55 M20 25 C14 34 16 46 24 52 M44 25 C50 34 48 46 40 52" stroke="#c46c10" strokeWidth="1.3" fill="none" />
      <path d="M30 22 C30 16 34 14 36 12 C37 15 35 20 34 22Z" fill="#6a8a3c" />
      <ellipse cx="22" cy="32" rx="4" ry="6" fill="#fff" opacity=".2" />
    </g>),
  cucumber: () => (
    <g><Ground /><g transform="rotate(-32 32 32)">
      <path d="M24 8 C24 4 40 4 40 8 L40 52 C40 60 24 60 24 52Z" fill="#3d8a40" />
      <path d="M28 10 V54" stroke="#74b872" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <g fill="#bfe3a8"><circle cx="30" cy="18" r="1" /><circle cx="35" cy="26" r="1" /><circle cx="29" cy="34" r="1" /><circle cx="35" cy="42" r="1" /><circle cx="30" cy="50" r="1" /></g>
    </g></g>),
  snakegourd: () => (
    <g><Ground />
      <path d="M46 8 C52 20 36 30 34 40 C32 48 40 54 38 60" stroke="#cde7b4" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M46 8 C52 20 36 30 34 40 C32 48 40 54 38 60" stroke="#9cc472" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 5" fill="none" opacity=".55" />
    </g>),

  tomato: () => (
    <g><Ground />
      <path d="M32 14 C48 12 58 24 54 38 C50 52 38 56 32 56 C26 56 14 52 10 38 C6 24 16 12 32 14Z" fill="#e0382b" />
      <path d="M12 40 C16 52 28 56 32 56 C40 56 50 52 54 40 C48 50 36 52 12 40Z" fill="#b82618" opacity=".45" />
      <ellipse cx="22" cy="26" rx="6" ry="4" fill="#fff" opacity=".3" transform="rotate(-24 22 26)" />
      <path d="M32 16 L24 12 L28 18 L20 20 L28 22 L26 28 L32 24 L38 28 L36 22 L44 20 L36 18 L40 12Z" fill="#4d8a3a" />
    </g>),
  brinjal: () => (
    <g><Ground /><g transform="rotate(-24 32 32)">
      <path d="M24 12 C16 20 10 40 22 54 C30 62 46 56 46 42 C46 32 38 24 36 12Z" fill="#5b2a86" />
      <ellipse cx="25" cy="38" rx="3.4" ry="10" fill="#fff" opacity=".22" />
      <path d="M22 14 C22 8 38 8 38 14 L42 20 L36 18 L32 24 L28 18 L22 20Z" fill="#4d8a3a" />
      <path d="M30 10 C30 4 32 2 34 2" stroke="#4d8a3a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </g></g>),
  cauliflower: () => (
    <g><Ground />
      <path d="M8 36 C10 52 24 56 32 56 C40 56 54 52 56 36 C48 44 16 44 8 36Z" fill="#6aa04a" />
      <path d="M10 36 C6 26 14 16 22 18 C24 10 38 10 42 18 C52 16 58 28 54 36 C46 42 18 42 10 36Z" fill="#f4efe0" />
      <g fill="#fffaf0"><circle cx="20" cy="28" r="5" /><circle cx="30" cy="22" r="6" /><circle cx="42" cy="26" r="5.5" /><circle cx="34" cy="33" r="5" /><circle cx="24" cy="36" r="4" /></g>
      <g fill="none" stroke="#d6cdb0" strokeWidth="1"><circle cx="30" cy="22" r="6" /><circle cx="42" cy="26" r="5.5" /><circle cx="20" cy="28" r="5" /></g>
    </g>),
  cabbage: () => (
    <g><Ground />
      <circle cx="32" cy="34" r="22" fill="#6faa4a" />
      <path d="M32 12 C22 24 22 44 32 56 M32 12 C42 24 42 44 32 56" stroke="#4d8a3a" strokeWidth="1.6" fill="none" />
      <path d="M14 26 C22 28 26 34 28 44 M50 26 C42 28 38 34 36 44 M16 42 C22 38 28 38 32 40 M48 42 C42 38 36 38 32 40" stroke="#a8d487" strokeWidth="1.4" fill="none" />
      <ellipse cx="22" cy="24" rx="5" ry="3" fill="#fff" opacity=".25" transform="rotate(-30 22 24)" />
    </g>),
  beans: () => (
    <g><Ground />
      <g stroke="#4d9a3e" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M14 10 C20 24 12 40 22 56" /><path d="M30 6 C36 22 28 38 38 58" stroke="#5db04c" /><path d="M46 10 C52 26 44 42 52 54" />
      </g>
      <g stroke="#9bd78a" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity=".7">
        <path d="M13 12 C19 24 11 40 21 54" /><path d="M29 8 C35 22 27 38 37 56" /><path d="M45 12 C51 26 43 42 51 52" />
      </g>
    </g>),
  capsicum: () => (
    <g><Ground />
      <path d="M32 16 C46 12 54 22 52 36 C50 50 44 56 38 56 C35 56 34 53 32 53 C30 53 29 56 26 56 C20 56 14 50 12 36 C10 22 18 12 32 16Z" fill="#3a9a3f" />
      <path d="M24 20 C20 30 22 46 26 54 M40 20 C44 30 42 46 38 54" stroke="#2a7a30" strokeWidth="1.4" fill="none" />
      <ellipse cx="20" cy="28" rx="3.6" ry="8" fill="#fff" opacity=".24" />
      <path d="M32 16 C32 10 34 8 38 7" stroke="#2f6a26" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>),
  peas: () => (
    <g><Ground />
      <path d="M6 30 C10 14 52 14 58 28 C52 46 14 48 6 30Z" fill="#5fa84a" />
      <path d="M8 31 C20 40 46 40 56 29" stroke="#3f8a35" strokeWidth="1.6" fill="none" />
      <g fill="#a7de6b" stroke="#78b84a" strokeWidth="1"><circle cx="17" cy="29" r="5.4" /><circle cx="27" cy="29" r="5.8" /><circle cx="37" cy="28.5" r="5.8" /><circle cx="47" cy="27.5" r="5.2" /></g>
      <g fill="#fff" opacity=".35"><circle cx="15" cy="27" r="1.4" /><circle cx="25" cy="27" r="1.5" /><circle cx="35" cy="26.5" r="1.5" /><circle cx="45" cy="25.5" r="1.3" /></g>
      <path d="M54 20 C60 18 62 14 62 10" stroke="#4d8a3a" strokeWidth="2" fill="none" />
    </g>),
  okra: () => (
    <g><Ground />
      <g fill="#5fa04a">
        <path d="M14 14 C16 10 22 10 24 14 L26 52 C26 60 20 62 18 56Z" transform="rotate(-8 20 36)" />
        <path d="M28 8 C30 4 36 4 38 8 L40 52 C40 60 34 62 32 56Z" fill="#6cb056" />
        <path d="M44 14 C46 10 52 10 54 14 L52 52 C50 60 44 62 44 54Z" transform="rotate(10 48 36)" />
      </g>
      <g stroke="#3d8035" strokeWidth="1.2"><path d="M32 12 L34 54" /><path d="M20 16 L22 52" transform="rotate(-8 20 36)" /><path d="M48 16 L47 52" transform="rotate(10 48 36)" /></g>
      <g fill="#3d8035"><rect x="29" y="4" width="8" height="5" rx="2" /><rect x="15" y="10" width="8" height="5" rx="2" transform="rotate(-8 20 36)" /><rect x="44" y="10" width="8" height="5" rx="2" transform="rotate(10 48 36)" /></g>
    </g>),
  chilli: () => (
    <g><Ground />
      <path d="M12 22 C14 18 18 18 22 20 C34 26 48 36 56 56 C46 52 28 46 16 34 C10 30 10 26 12 22Z" fill="#3fa23a" />
      <path d="M12 38 C14 34 18 34 22 36 C30 40 40 46 46 60 C38 56 24 52 16 48 C10 44 10 42 12 38Z" fill="#59b84a" transform="translate(4 -6)" />
      <path d="M12 22 C8 18 8 12 12 8" stroke="#2f7a2a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M16 24 C28 30 40 38 48 50" stroke="#fff" strokeWidth="1.6" opacity=".3" fill="none" />
    </g>),
  drumstick: () => (
    <g><Ground />
      <path d="M8 56 L56 8" stroke="#8a9a4a" strokeWidth="5" strokeLinecap="round" />
      <path d="M14 58 L58 20" stroke="#738a3a" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M8 40 L40 8" stroke="#9aaa58" strokeWidth="3.6" strokeLinecap="round" />
      <g fill="#6b7a34"><circle cx="22" cy="42" r="1.6" /><circle cx="34" cy="30" r="1.6" /><circle cx="46" cy="18" r="1.6" /><circle cx="30" cy="48" r="1.5" /><circle cx="46" cy="38" r="1.5" /></g>
    </g>),
  /* ---------- more vegetables ---------- */
  gongura: () => <Bunch leaf="#6ab04c" dark="#4a8f3a" vein="#e0556a" n={5} rx={9} ry={14} accent="#d2475f" />,
  drumstickleaves: () => <Bunch leaf="#7fbf55" dark="#5ea040" vein="#e6f5cc" n={7} rx={4} ry={15} ruffle />,
  springonion: () => (
    <g><Ground />
      {[-12, -4, 4, 12].map((x, i) => (
        <g key={i} transform={`rotate(${x} 32 56)`}>
          <path d={`M30 56 C29 40 29 24 ${30 + i} 6 L${33 + i} 6 C34 24 34 40 34 56Z`} fill={i % 2 ? "#5fa84a" : "#4a9a3e"} />
          <path d="M28 56 C27 52 28 48 30 46 L34 46 C36 48 37 52 36 56Z" fill="#f4f0e6" />
        </g>
      ))}
      <path d="M26 58 L24 62 M32 58 V62 M38 58 L40 62" stroke="#e7d7b3" strokeWidth="1.4" />
    </g>),
  curryleaves: () => (
    <g><Ground />
      <path d="M32 58 C30 40 34 24 30 6" stroke="#4f7d3a" strokeWidth="2" fill="none" />
      {[[26, 50, -30], [38, 46, 30], [25, 38, -35], [39, 34, 35], [26, 26, -35], [38, 22, 35], [28, 14, -30], [36, 10, 30]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="7" ry="3.4" fill={i % 2 ? "#3f8a3f" : "#2f6f33"} transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </g>),
  yam: () => (
    <g><Ground />
      <path d="M8 38 C6 24 20 14 34 16 C50 18 58 30 54 42 C50 54 20 56 12 48 C9 46 8 42 8 38Z" fill="#9a7452" />
      <path d="M14 46 C24 54 44 54 52 42 C50 50 30 56 14 46Z" fill="#7a5a3c" opacity=".6" />
      <path d="M22 24 C30 20 40 20 46 26" stroke="#c9a77c" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <g fill="#6d4f33"><circle cx="20" cy="36" r="1.6" /><circle cx="30" cy="42" r="1.6" /><circle cx="42" cy="36" r="1.6" /><circle cx="34" cy="30" r="1.4" /></g>
    </g>),
  colocasia: () => (
    <g><Ground />
      {[[22, 38, 11, 14, "#7b5a3e"], [42, 38, 11, 14, "#6e5037"], [32, 28, 12, 15, "#86654a"]].map(([x, y, rx, ry, c], i) => (
        <g key={i}><ellipse cx={x} cy={y + (i === 2 ? 0 : 8)} rx={rx} ry={ry} fill={c} />
          <path d={`M${x - rx + 3} ${y + 6} H${x + rx - 3} M${x - rx + 4} ${y + 12} H${x + rx - 4}`} stroke="#4f3826" strokeWidth="1" opacity=".5" />
          <path d={`M${x} ${y - ry + 8} l0 -4`} stroke="#4f3826" strokeWidth="2" /></g>
      ))}
    </g>),
  turnip: () => (
    <g><Ground />
      <circle cx="32" cy="38" r="18" fill="#f5f0f4" />
      <path d="M14 34 C16 22 48 22 50 34 C44 28 20 28 14 34Z" fill="#a8498f" />
      <ellipse cx="25" cy="40" rx="4" ry="6" fill="#fff" opacity=".5" />
      <path d="M32 22 C28 14 22 8 18 6 M32 22 C32 12 34 8 36 4 M32 22 C38 14 44 10 48 8" stroke="#4d8a3a" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M32 56 L32 61" stroke="#d9d2dc" strokeWidth="1.6" />
    </g>),
  ashgourd: () => (
    <g><Ground />
      <ellipse cx="32" cy="36" rx="22" ry="19" fill="#a6c98a" />
      <ellipse cx="32" cy="36" rx="22" ry="19" fill="#f4f7ee" opacity=".35" />
      <path d="M32 17 C24 24 24 48 32 55 M32 17 C40 24 40 48 32 55" stroke="#86ab6a" strokeWidth="1.2" fill="none" />
      <path d="M30 18 C30 12 34 10 36 8 C37 11 35 16 34 18Z" fill="#6a8a3c" />
      <ellipse cx="22" cy="30" rx="4" ry="6" fill="#fff" opacity=".35" />
    </g>),
  ivygourd: () => (
    <g><Ground />
      {[[20, 24, -30], [38, 18, 18], [26, 42, 24], [44, 40, -14]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="6" ry="13" fill="#6fb04e" /><path d={`M${x} ${y - 12} V${y + 12}`} stroke="#d9efc4" strokeWidth="1.6" opacity=".8" />
          <ellipse cx={x - 2} cy={y - 3} rx="1.6" ry="5" fill="#fff" opacity=".25" />
        </g>
      ))}
    </g>),
  clusterbeans: () => (
    <g><Ground />
      {[[-36, 26], [-18, 30], [0, 32], [18, 30], [36, 26]].map(([r, l], i) => (
        <g key={i} transform={`rotate(${r} 32 56)`}><path d={`M28.6 56 C27 ${56 - l} 30 ${56 - l - 4} 32 ${56 - l - 5} C34 ${56 - l - 4} 37 ${56 - l} 35.4 56Z`} fill={i % 2 ? "#5da64a" : "#4a9040"} /></g>
      ))}
      <rect x="26" y="52" width="12" height="5" rx="2" fill="#7a5a34" />
    </g>),
  broadbeans: () => (
    <g><Ground />
      {[[14, -12], [30, 0], [46, 12]].map(([x, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + 3} 36)`}>
          <path d={`M${x} 10 C${x - 6} 24 ${x - 6} 48 ${x + 2} 58 C${x + 12} 54 ${x + 12} 20 ${x + 4} 8Z`} fill={i === 1 ? "#6fb24f" : "#5ea140"} />
          <g fill="#4a8a35" opacity=".7"><ellipse cx={x + 3} cy="22" rx="3.4" ry="5" /><ellipse cx={x + 3} cy="34" rx="3.4" ry="5" /><ellipse cx={x + 3} cy="46" rx="3" ry="4.6" /></g>
        </g>
      ))}
    </g>),
  rawbanana: () => (
    <g><Ground />
      <path d="M8 22 C14 44 30 54 52 50 C42 46 26 40 18 20Z" fill="#7ab648" />
      <path d="M16 16 C22 40 36 48 56 42 C46 40 32 34 24 14Z" fill="#8cc656" />
      <path d="M22 12 C28 34 40 42 58 32 C50 32 38 26 30 10Z" fill="#9ad063" />
      <path d="M8 22 L14 14 M16 16 L22 8 M22 12 L28 6" stroke="#4f7d3a" strokeWidth="3.4" strokeLinecap="round" />
    </g>),
  rawmango: () => (
    <g><Ground />
      <path d="M32 12 C48 10 58 26 52 40 C46 54 30 58 22 50 C12 42 12 14 32 12Z" fill="#7fb643" />
      <path d="M52 40 C46 54 30 58 22 50 C34 52 48 48 52 40Z" fill="#5f9a2c" opacity=".5" />
      <ellipse cx="22" cy="26" rx="4" ry="8" fill="#fff" opacity=".28" transform="rotate(20 22 26)" />
      <path d="M32 12 C32 8 34 6 36 5" stroke="#6a4a2a" strokeWidth="2" fill="none" />
      <path d="M36 8 C42 2 52 4 54 8 C48 12 40 12 36 8Z" fill="#3f8a3f" />
    </g>),
  rawpapaya: () => (
    <g><Ground /><g transform="rotate(-24 32 32)">
      <path d="M32 4 C48 8 52 34 46 46 C42 56 36 60 32 60 C28 60 22 56 18 46 C12 34 16 8 32 4Z" fill="#78ae4c" />
      <path d="M32 6 V58 M24 12 C20 28 24 48 30 58 M40 12 C44 28 40 48 34 58" stroke="#9bcf6a" strokeWidth="1.4" fill="none" />
      <rect x="29" y="2" width="6" height="5" rx="2" fill="#5b7a3a" />
    </g></g>),
  lemon: () => (
    <g><Ground />
      {[[24, 38, -20], [42, 34, 16]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <path d={`M${x - 15} ${y} C${x - 15} ${y - 14} ${x + 15} ${y - 14} ${x + 15} ${y} C${x + 15} ${y + 14} ${x - 15} ${y + 14} ${x - 15} ${y}Z`} fill={i ? "#f4d03a" : "#f7dc50"} />
          <path d={`M${x - 15} ${y} l-3 0 M${x + 15} ${y} l3 0`} stroke="#d9b520" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx={x - 5} cy={y - 5} rx="5" ry="2.4" fill="#fff" opacity=".4" />
        </g>
      ))}
      <path d="M34 20 C40 12 50 12 52 16 C46 22 38 22 34 20Z" fill="#4d8a3a" />
    </g>),
  sweetcorn: () => (
    <g><Ground /><g transform="rotate(-14 32 32)">
      <path d="M32 6 C44 8 46 36 42 52 C40 58 24 58 22 52 C18 36 20 8 32 6Z" fill="#f4c52a" />
      <g stroke="#d9a516" strokeWidth="1.2"><path d="M24 14 V54 M28 10 V56 M32 8 V58 M36 10 V56 M40 14 V54" /><path d="M22 20 H42 M22 28 H43 M22 36 H43 M22 44 H42" /></g>
      <path d="M32 60 C16 56 12 32 16 18 C20 38 26 50 32 54Z" fill="#6fae48" />
      <path d="M32 60 C48 56 52 32 48 18 C44 38 38 50 32 54Z" fill="#5a9a3a" />
    </g></g>),
  babycorn: () => (
    <g><Ground />
      {[[18, -14], [32, 0], [46, 14]].map(([x, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} 56)`}>
          <path d={`M${x - 5} 56 C${x - 7} 36 ${x - 4} 18 ${x} 12 C${x + 4} 18 ${x + 7} 36 ${x + 5} 56Z`} fill="#f6e08a" />
          <g stroke="#d8bd5a" strokeWidth="1"><path d={`M${x - 3} 22 V54 M${x} 14 V56 M${x + 3} 22 V54`} /><path d={`M${x - 5} 28 H${x + 5} M${x - 5} 38 H${x + 5} M${x - 5} 48 H${x + 5}`} /></g>
          <path d={`M${x} 12 C${x - 3} 6 ${x - 5} 4 ${x - 6} 2`} stroke="#c9a54a" strokeWidth="1.4" fill="none" />
        </g>
      ))}
    </g>),
  bananaflower: () => (
    <g><Ground /><g transform="rotate(-16 32 32)">
      <path d="M32 6 C46 16 50 40 38 58 C34 60 30 60 26 58 C14 40 18 16 32 6Z" fill="#7a1f4d" />
      <path d="M32 6 C40 18 40 42 32 58 C24 42 24 18 32 6Z" fill="#9b2f63" />
      <path d="M32 6 C36 22 36 42 32 58" stroke="#c0568a" strokeWidth="1.4" fill="none" />
      <ellipse cx="24" cy="30" rx="2.6" ry="9" fill="#fff" opacity=".2" />
    </g></g>),
  broccoli: () => (
    <g><Ground />
      <path d="M26 56 L28 36 H36 L38 56Z" fill="#8cc152" />
      <g fill="#3f8a3f"><circle cx="20" cy="30" r="10" /><circle cx="32" cy="22" r="12" /><circle cx="44" cy="30" r="10" /><circle cx="32" cy="34" r="9" /></g>
      <g fill="#58a84c"><circle cx="18" cy="26" r="4" /><circle cx="30" cy="18" r="5" /><circle cx="42" cy="26" r="4" /><circle cx="26" cy="32" r="3.4" /><circle cx="38" cy="32" r="3.4" /></g>
    </g>),
  mushroom: () => (
    <g><Ground />
      {[[22, 40, 15, 1], [42, 38, 12, 0.85]].map(([x, y, r, k], i) => (
        <g key={i}>
          <path d={`M${x - 6 * k} ${y} H${x + 6 * k} L${x + 4 * k} ${y + 18 * k} H${x - 4 * k}Z`} fill="#efe6d8" />
          <path d={`M${x - r} ${y + 2} C${x - r} ${y - r} ${x + r} ${y - r} ${x + r} ${y + 2}Z`} fill="#f6efe4" stroke="#d9cdb8" strokeWidth="1.2" />
          <ellipse cx={x - r * 0.4} cy={y - r * 0.45} rx={r * 0.3} ry={r * 0.18} fill="#fff" opacity=".8" />
        </g>
      ))}
    </g>),
  redcabbage: () => (
    <g><Ground />
      <circle cx="32" cy="34" r="22" fill="#8e3a8c" />
      <path d="M32 12 C22 24 22 44 32 56 M32 12 C42 24 42 44 32 56" stroke="#6c2670" strokeWidth="1.6" fill="none" />
      <path d="M14 26 C22 28 26 34 28 44 M50 26 C42 28 38 34 36 44 M16 42 C22 38 28 38 32 40 M48 42 C42 38 36 38 32 40" stroke="#c07abe" strokeWidth="1.4" fill="none" />
      <ellipse cx="22" cy="24" rx="5" ry="3" fill="#fff" opacity=".25" transform="rotate(-30 22 24)" />
    </g>),
  zucchini: () => (
    <g><Ground /><g transform="rotate(-34 32 32)">
      <path d="M24 8 C24 4 40 4 40 8 L40 52 C40 60 24 60 24 52Z" fill="#2f7a3a" />
      <path d="M28 10 V54 M33 8 V58 M37 10 V54" stroke="#8cc86a" strokeWidth="1.6" opacity=".6" />
      <rect x="27" y="2" width="10" height="6" rx="2" fill="#5b7a3a" />
    </g></g>),
  colourcapsicum: () => (
    <g><Ground />
      {[[22, "#d6291f", "#a81b13"], [42, "#f2c418", "#cf9f0a"]].map(([x, c, d], i) => (
        <g key={i} transform={`translate(${x - 32} ${i ? 4 : 0}) scale(${0.62}) translate(${i ? 8 : 12} 14)`}>
          <path d="M32 16 C46 12 54 22 52 36 C50 50 44 56 38 56 C35 56 34 53 32 53 C30 53 29 56 26 56 C20 56 14 50 12 36 C10 22 18 12 32 16Z" fill={c} />
          <path d="M24 20 C20 30 22 46 26 54 M40 20 C44 30 42 46 38 54" stroke={d} strokeWidth="1.6" fill="none" />
          <ellipse cx="20" cy="28" rx="3.6" ry="8" fill="#fff" opacity=".28" />
          <path d="M32 16 C32 10 34 8 38 7" stroke="#2f6a26" strokeWidth="4.4" strokeLinecap="round" fill="none" />
        </g>
      ))}
    </g>),
  cherrytomato: () => (
    <g><Ground />
      <path d="M12 12 C24 6 40 6 52 14" stroke="#4d8a3a" strokeWidth="2.4" fill="none" />
      {[[16, 30], [30, 38], [44, 30], [24, 48], [38, 50]].map(([x, y], i) => (
        <g key={i}><path d={`M${x} 14 L${x} ${y - 8}`} stroke="#4d8a3a" strokeWidth="1.4" />
          <circle cx={x} cy={y} r="9" fill={i % 2 ? "#e0382b" : "#d12f22"} /><ellipse cx={x - 3} cy={y - 3} rx="2.6" ry="1.8" fill="#fff" opacity=".4" />
          <path d={`M${x - 4} ${y - 8} L${x} ${y - 5} L${x + 4} ${y - 8}`} stroke="#4d8a3a" strokeWidth="2" fill="none" /></g>
      ))}
    </g>),

  /* ---------- more greens, gourds and beans ---------- */
  bachalakura: () => (
    <g><Ground />
      <path d="M32 58 C28 44 36 30 30 8" stroke="#8a2f5e" strokeWidth="2.2" fill="none" />
      {[[24, 46, -30], [40, 40, 30], [22, 30, -40], [42, 24, 36], [26, 16, -30], [38, 10, 28]].map(([x, y, r], i) => (
        <path key={i} transform={`rotate(${r} ${x} ${y})`} d={`M${x} ${y + 9} C${x - 14} ${y} ${x - 8} ${y - 12} ${x} ${y - 6} C${x + 8} ${y - 12} ${x + 14} ${y} ${x} ${y + 9}Z`} fill={i % 2 ? "#2f7a3a" : "#3f8f45"} />
      ))}
    </g>),
  chukkakura: () => <Bunch leaf="#7fbf4a" dark="#68a83a" vein="#e24a5a" n={6} rx={6} ry={15} accent="#d94a55" />,
  koyigura: () => <Bunch leaf="#4a8f3a" dark="#336f2e" vein="#cfe8b4" n={5} rx={5.5} ry={17} />,
  roundsorakaya: () => (
    <g><Ground />
      <ellipse cx="32" cy="36" rx="22" ry="20" fill="#b6d98a" />
      <path d="M32 16 C24 24 24 48 32 56 M32 16 C40 24 40 48 32 56" stroke="#98c068" strokeWidth="1.3" fill="none" />
      <ellipse cx="22" cy="30" rx="4" ry="8" fill="#fff" opacity=".35" />
      <path d="M30 17 C30 11 34 9 37 8 C38 12 36 15 34 17Z" fill="#7a9a4e" />
    </g>),
  dosakaya: () => (
    <g><Ground /><g transform="rotate(-20 32 34)">
      <ellipse cx="32" cy="34" rx="18" ry="24" fill="#e6b92e" />
      <ellipse cx="32" cy="34" rx="18" ry="24" fill="#c98f1c" opacity=".25" />
      <g stroke="#a8741a" strokeWidth="1" opacity=".5" fill="none"><path d="M20 24 L28 32 L22 42 M44 24 L36 34 L42 44 M30 14 L34 24 M30 46 L34 54" /></g>
      <ellipse cx="25" cy="26" rx="3.4" ry="8" fill="#fff" opacity=".3" />
      <rect x="29" y="8" width="6" height="5" rx="2" fill="#6a7a3a" />
    </g></g>),
  dondakayahybrid: () => (
    <g><Ground />
      {[[18, 22, -24], [34, 16, 12], [46, 34, 28], [24, 42, -10]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="6.4" ry="15" fill="#8cc152" /><path d={`M${x} ${y - 14} V${y + 14}`} stroke="#e8f6d2" strokeWidth="1.6" opacity=".8" />
          <ellipse cx={x - 2} cy={y - 4} rx="1.6" ry="6" fill="#fff" opacity=".3" />
        </g>
      ))}
    </g>),
  gokarakayalocal: () => (
    <g><Ground />
      {[[-26, 26], [-10, 30], [8, 30], [26, 26]].map(([r, l], i) => (
        <g key={i} transform={`rotate(${r} 32 56)`}>
          <path d={`M29 56 C27 ${56 - l} 30 ${56 - l - 5} 32 ${56 - l - 6} C34 ${56 - l - 5} 37 ${56 - l} 35 56Z`} fill={i % 2 ? "#6d9a3a" : "#5a8a32"} />
          <path d={`M32 ${56 - l - 4} V54`} stroke="#c9e3a0" strokeWidth="1" opacity=".6" />
        </g>
      ))}
      <rect x="27" y="52" width="10" height="5" rx="2" fill="#7a5a34" />
    </g>),
  gokarakayahybrid: () => (
    <g><Ground />
      {[[-24, 30], [-8, 34], [8, 34], [24, 30]].map(([r, l], i) => (
        <g key={i} transform={`rotate(${r} 32 56)`}>
          <path d={`M29.4 56 C27.6 ${56 - l} 30 ${56 - l - 5} 32 ${56 - l - 6} C34 ${56 - l - 5} 36.4 ${56 - l} 34.6 56Z`} fill={i % 2 ? "#7fb648" : "#6aa83c"} />
          <path d={`M32 ${56 - l - 4} V54`} stroke="#e3f3c6" strokeWidth="1" opacity=".7" />
        </g>
      ))}
      <rect x="27" y="52" width="10" height="5" rx="2" fill="#7a5a34" />
    </g>),
  chikkudukayahybrid: () => (
    <g><Ground />
      {[[14, -12], [30, 0], [46, 12]].map(([x, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + 3} 36)`}>
          <path d={`M${x} 10 C${x - 6} 24 ${x - 6} 48 ${x + 2} 58 C${x + 12} 54 ${x + 12} 20 ${x + 4} 8Z`} fill={i === 1 ? "#a7d36a" : "#98c85a"} />
          <g fill="#7fb046" opacity=".7"><ellipse cx={x + 3} cy="22" rx="3.4" ry="5" /><ellipse cx={x + 3} cy="34" rx="3.4" ry="5" /><ellipse cx={x + 3} cy="46" rx="3" ry="4.6" /></g>
        </g>
      ))}
    </g>),

  /* ---------- fruits ---------- */
  banana: () => (
    <g><Ground />
      <path d="M8 24 C12 46 30 56 54 50 C42 46 28 40 18 20Z" fill="#f2c92e" />
      <path d="M16 18 C20 42 36 50 58 42 C46 40 32 34 24 14Z" fill="#f7d84a" />
      <path d="M24 12 C28 34 40 42 60 32 C52 32 38 26 32 10Z" fill="#fbe36a" />
      <path d="M8 24 L12 14 M16 18 L20 8 M24 12 L28 4" stroke="#6a5a2a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M54 50 l4 0 M58 42 l3 -1 M60 32 l2 -2" stroke="#5a4a22" strokeWidth="2.4" strokeLinecap="round" />
    </g>),
  apple: () => (
    <g><Ground />
      <path d="M32 18 C40 10 56 16 54 34 C52 50 42 58 36 56 C34 55 33 54 32 54 C31 54 30 55 28 56 C22 58 12 50 10 34 C8 16 24 10 32 18Z" fill="#d6312a" />
      <path d="M12 40 C16 52 24 58 28 56 C20 54 14 48 12 40Z" fill="#a8201a" opacity=".5" />
      <ellipse cx="20" cy="28" rx="3.6" ry="7" fill="#fff" opacity=".3" transform="rotate(14 20 28)" />
      <path d="M32 18 C32 12 34 8 36 6" stroke="#5a4020" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M36 10 C42 4 50 6 52 10 C46 14 40 14 36 10Z" fill="#4d8a3a" />
    </g>),
  orange: () => (
    <g><Ground />
      <circle cx="32" cy="36" r="21" fill="#f08a1c" />
      <circle cx="32" cy="36" r="21" fill="none" stroke="#d9740c" strokeWidth="1.2" opacity=".4" />
      <g fill="#d9740c" opacity=".35">{[[22, 28], [40, 26], [28, 44], [44, 40], [34, 34], [20, 40], [38, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1" />)}</g>
      <ellipse cx="23" cy="27" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-30 23 27)" />
      <path d="M32 15 C34 12 38 12 40 14 C36 18 34 17 32 15Z" fill="#4d8a3a" />
    </g>),
  mosambi: () => (
    <g><Ground />
      <circle cx="32" cy="36" r="21" fill="#b8d65a" />
      <circle cx="32" cy="36" r="21" fill="#f3e46a" opacity=".35" />
      <g fill="#8aa832" opacity=".4">{[[22, 28], [40, 26], [28, 44], [44, 40], [34, 34], [20, 40], [38, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1" />)}</g>
      <ellipse cx="23" cy="27" rx="5" ry="3" fill="#fff" opacity=".4" transform="rotate(-30 23 27)" />
      <path d="M32 15 C34 12 38 12 40 14 C36 18 34 17 32 15Z" fill="#4d8a3a" />
    </g>),
  pomegranate: () => (
    <g><Ground />
      <path d="M32 16 C46 12 58 24 54 40 C50 54 38 58 32 58 C26 58 14 54 10 40 C6 24 18 12 32 16Z" fill="#b5192a" />
      <path d="M12 42 C16 54 28 58 32 58 C40 58 50 54 54 42 C46 52 30 54 12 42Z" fill="#7d0f1b" opacity=".45" />
      <ellipse cx="20" cy="30" rx="4" ry="8" fill="#fff" opacity=".25" transform="rotate(14 20 30)" />
      <path d="M24 16 L26 8 L30 14 L34 6 L38 14 L42 8 L42 16Z" fill="#c9302c" />
      <path d="M24 16 L26 8 L30 14 L34 6 L38 14 L42 8 L42 16Z" fill="none" stroke="#7d0f1b" strokeWidth="1.2" />
    </g>),
  papaya: () => (
    <g><Ground /><g transform="rotate(-24 32 32)">
      <path d="M32 4 C48 8 52 34 46 46 C42 56 36 60 32 60 C28 60 22 56 18 46 C12 34 16 8 32 4Z" fill="#f0a02a" />
      <path d="M32 6 C40 20 40 44 32 58 M32 6 C24 20 24 44 32 58" stroke="#d9861a" strokeWidth="1.2" fill="none" opacity=".6" />
      <ellipse cx="24" cy="26" rx="3" ry="9" fill="#fff" opacity=".3" />
      <rect x="29" y="2" width="6" height="5" rx="2" fill="#6a8a3a" />
    </g></g>),
  watermelon: () => (
    <g><Ground />
      <path d="M6 28 C6 52 58 52 58 28Z" fill="#2f8a3a" />
      <path d="M8 28 C10 46 54 46 56 28Z" fill="#5fb85a" />
      <path d="M10 28 C12 42 52 42 54 28Z" fill="#fff4f0" />
      <path d="M12 28 C14 39 50 39 52 28Z" fill="#e8384a" />
      <g fill="#2b2013">{[[22, 32], [30, 35], [38, 35], [44, 32], [26, 29], [36, 29]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="1.2" ry="2" />)}</g>
      <path d="M6 28 H58" stroke="#e8384a" strokeWidth="1" opacity=".0" />
    </g>),
  muskmelon: () => (
    <g><Ground />
      <ellipse cx="32" cy="36" rx="22" ry="20" fill="#e8c36a" />
      <g stroke="#b88f2e" strokeWidth="1.2" fill="none" opacity=".6"><path d="M32 16 C24 24 24 48 32 56 M32 16 C40 24 40 48 32 56 M16 24 C22 30 22 44 18 52 M48 24 C42 30 42 44 46 52" /><path d="M14 30 C26 34 38 34 50 30 M14 42 C26 46 38 46 50 42" /></g>
      <ellipse cx="22" cy="28" rx="4" ry="7" fill="#fff" opacity=".3" />
      <path d="M32 16 C32 11 35 9 37 8" stroke="#6a8a3a" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </g>),
  grapes: () => (
    <g><Ground />
      <path d="M32 6 C32 12 30 14 30 18" stroke="#5a4020" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M32 10 C40 4 48 8 50 12 C44 16 36 16 32 10Z" fill="#4d8a3a" />
      {[[22, 24], [32, 22], [42, 24], [18, 34], [28, 33], [38, 33], [46, 34], [24, 44], [34, 43], [42, 44], [29, 53], [37, 53]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="6.2" fill={i % 3 ? "#8ac34a" : "#9ad05a"} /><ellipse cx={x - 2} cy={y - 2} rx="1.8" ry="1.2" fill="#fff" opacity=".6" /></g>
      ))}
    </g>),
  guava: () => (
    <g><Ground />
      <path d="M32 12 C48 10 56 26 50 40 C46 52 36 58 30 56 C18 54 8 42 10 28 C12 16 22 12 32 12Z" fill="#a9cf5c" />
      <path d="M32 12 C48 10 56 26 50 40 C46 52 36 58 30 56 C40 52 50 38 44 22Z" fill="#8fb846" opacity=".5" />
      <ellipse cx="22" cy="26" rx="4" ry="7" fill="#fff" opacity=".35" transform="rotate(14 22 26)" />
      <path d="M30 12 C30 8 34 6 36 5" stroke="#5a7a30" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M36 8 C42 2 50 4 52 8 C46 12 40 12 36 8Z" fill="#3f8a3f" />
    </g>),
  pineapple: () => (
    <g><Ground />
      <path d="M32 22 C24 12 20 6 22 2 C26 8 30 10 32 14 C34 10 38 8 42 2 C44 6 40 12 32 22Z" fill="#3f8a3f" />
      <path d="M26 16 C22 10 18 8 16 6 C20 12 24 16 28 20Z M38 16 C42 10 46 8 48 6 C44 12 40 16 36 20Z" fill="#58a84c" />
      <ellipse cx="32" cy="40" rx="15" ry="19" fill="#eab72a" />
      <g stroke="#c28a14" strokeWidth="1.4" fill="none" opacity=".8"><path d="M18 34 L46 50 M18 44 L40 56 M22 24 L46 40 M46 34 L20 50 M46 44 L26 56 M42 24 L18 40" /></g>
      <g fill="#8a5a10" opacity=".7">{[[26, 32], [38, 32], [32, 40], [26, 48], [38, 48], [32, 28], [32, 52]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.2" />)}</g>
    </g>),
  sapota: () => (
    <g><Ground />
      {[[22, 38, 15], [42, 34, 14]].map(([x, y, r], i) => (
        <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r - 1} fill={i ? "#b8854a" : "#c4955a"} />
          <ellipse cx={x - 4} cy={y - 5} rx={r * 0.3} ry={r * 0.2} fill="#fff" opacity=".28" />
          <circle cx={x} cy={y - r + 2} r="1.8" fill="#6a4a28" /></g>
      ))}
    </g>),
  custardapple: () => (
    <g><Ground />
      <path d="M32 12 C48 10 58 26 52 42 C46 56 34 58 30 56 C16 54 6 40 10 26 C14 14 24 12 32 12Z" fill="#8fbf5a" />
      <g stroke="#6a9a3a" strokeWidth="1.3" fill="none" opacity=".8">{[[22, 26], [34, 22], [44, 30], [20, 40], [32, 36], [44, 44], [28, 50], [38, 52]].map(([x, y], i) => <path key={i} d={`M${x - 5} ${y} C${x - 3} ${y - 6} ${x + 3} ${y - 6} ${x + 5} ${y} C${x + 3} ${y + 5} ${x - 3} ${y + 5} ${x - 5} ${y}Z`} />)}</g>
      <ellipse cx="20" cy="24" rx="3.4" ry="6" fill="#fff" opacity=".25" />
      <path d="M32 12 C32 8 34 6 37 5" stroke="#5a7a30" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </g>),
  mango: () => (
    <g><Ground />
      <path d="M32 12 C50 10 58 28 50 44 C44 56 30 60 22 52 C10 42 12 14 32 12Z" fill="#f0b030" />
      <path d="M32 12 C50 10 58 28 50 44 C44 56 30 60 22 52 C36 54 48 42 44 24Z" fill="#e8872a" opacity=".55" />
      <path d="M32 12 C24 14 14 20 12 34 C12 24 20 14 32 12Z" fill="#d6c23a" opacity=".5" />
      <ellipse cx="24" cy="26" rx="4" ry="8" fill="#fff" opacity=".28" transform="rotate(18 24 26)" />
      <path d="M32 12 C32 8 34 6 36 5" stroke="#6a4a2a" strokeWidth="2.2" fill="none" />
      <path d="M36 8 C42 2 52 4 54 8 C48 12 40 12 36 8Z" fill="#3f8a3f" />
    </g>),
};

// fallback: a leaf badge when we have no drawing for a new vegetable you add later
function Generic({ name }) {
  return (
    <g><Ground />
      <circle cx="32" cy="34" r="20" fill="#e9f0dd" />
      <Leaves y={22} />
      <text x="32" y="50" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2f4a34" fontFamily="Georgia,serif">
        {String(name || "?").charAt(0).toUpperCase()}
      </text>
    </g>
  );
}

// keyword fallback so rows you add in the Sheet still get a sensible picture
const GUESS = [
  ["gourd", "bottlegourd"], ["tomato", "tomato"], ["potato", "potato"], ["onion", "onion"], ["carrot", "carrot"],
  ["chilli", "chilli"], ["chili", "chilli"], ["bean", "beans"], ["pea", "peas"], ["cabbage", "cabbage"], ["cauli", "cauliflower"],
  ["brinjal", "brinjal"], ["eggplant", "brinjal"], ["pepper", "capsicum"], ["capsicum", "capsicum"], ["cucumber", "cucumber"],
  ["pumpkin", "pumpkin"], ["garlic", "garlic"], ["ginger", "ginger"], ["radish", "radish"], ["beet", "beetroot"],
  ["apple", "apple"], ["orange", "orange"], ["melon", "muskmelon"], ["grape", "grapes"], ["pineapple", "pineapple"], ["guava", "guava"], ["papaya", "papaya"], ["fruit", "apple"], ["mushroom", "mushroom"], ["corn", "sweetcorn"], ["lemon", "lemon"], ["mango", "rawmango"], ["banana", "rawbanana"], ["leaf", "spinach"], ["leaves", "spinach"], ["greens", "spinach"], ["palak", "spinach"], ["okra", "okra"], ["lady", "okra"],
];

export function artFor(id, name) {
  if (ART[id]) return ART[id];
  const n = String(name || id || "").toLowerCase();
  const hit = GUESS.find(([k]) => n.includes(k));
  return hit ? ART[hit[1]] : null;
}

export default function VegArt({ id, name, size = 52 }) {
  const Draw = artFor(id, name);
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={name || id} className="vegart">
      {Draw ? <Draw /> : <Generic name={name} />}
    </svg>
  );
}

export const ART_IDS = Object.keys(ART);
