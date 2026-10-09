/**
 * Election Commission of India (ECI) Official Symbol Vector Renderers
 * Conforms to The Election Symbols (Reservation and Allotment) Order, 1968
 * High-definition, offline-compatible SVG vectors for EVM Ballot Units and Electoral Registers.
 */

// 1. LOTUS (Bharatiya Janata Party / NDA)
const SvgLotus = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="lotusGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="60%" stopColor="#fb7185" />
        <stop offset="100%" stopColor="#fda4af" />
      </linearGradient>
      <linearGradient id="lotusLeaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
    {/* Water waves */}
    <path d="M12 86 C25 81, 35 91, 50 86 C65 81, 75 91, 88 86" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M20 92 C32 88, 42 96, 50 92 C58 88, 68 96, 80 92" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Stalk & Base */}
    <path d="M47 75 C47 84 48 88 50 90 C52 88 53 84 53 75 Z" fill="url(#lotusLeaf)" stroke="#0f172a" strokeWidth="1.5" />
    <ellipse cx="50" cy="76" rx="14" ry="4" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />
    {/* Outer Left Petal */}
    <path d="M36 68 C16 66 12 76 22 83 C32 86 42 80 44 75 C38 72 36 68 36 68 Z" fill="#ffe4e6" stroke="#0f172a" strokeWidth="1.8" />
    {/* Outer Right Petal */}
    <path d="M64 68 C84 66 88 76 78 83 C68 86 58 80 56 75 C62 72 64 68 64 68 Z" fill="#ffe4e6" stroke="#0f172a" strokeWidth="1.8" />
    {/* Mid Left Petal */}
    <path d="M48 42 C30 46 22 62 30 76 C38 79 46 76 49 73 C44 62 44 50 48 42 Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.8" />
    {/* Mid Right Petal */}
    <path d="M52 42 C70 46 78 62 70 76 C62 79 54 76 51 73 C56 62 56 50 52 42 Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.8" />
    {/* Inner Left Petal */}
    <path d="M49 28 C39 36 36 55 45 74 C48 74 50 72 50 72 C44 56 44 40 49 28 Z" fill="#fb7185" stroke="#0f172a" strokeWidth="1.8" />
    {/* Inner Right Petal */}
    <path d="M51 28 C61 36 64 55 55 74 C52 74 50 72 50 72 C56 56 56 40 51 28 Z" fill="#fb7185" stroke="#0f172a" strokeWidth="1.8" />
    {/* Center Core Petal */}
    <path d="M50 14 C43 30 44 60 50 74 C56 60 57 30 50 14 Z" fill="url(#lotusGrad)" stroke="#0f172a" strokeWidth="2" />
    {/* Seed pod stamen detail */}
    <ellipse cx="50" cy="67" rx="3.5" ry="2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
  </svg>
);

// 2. HAND (Indian National Congress / UPA)
const SvgHand = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="handGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f8fafc" />
      </linearGradient>
    </defs>
    {/* Hand Silhouette & Contour */}
    <path
      d="M38 90 
         L38 78 
         C33 77 24 74 20 66 
         C16 58 22 52 28 54 
         C32 55 35 60 38 65 
         L38 34 
         C38 29 44 29 44 34 
         L44 48 
         C44 22 50 22 50 28 
         L50 48 
         C50 16 56 16 56 22 
         L56 49 
         C56 25 62 25 62 32 
         L62 55 
         C62 36 68 36 68 43 
         L68 66 
         C68 82 58 90 48 90 
         Z"
      fill="url(#handGrad)"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Palm creases */}
    <path d="M38 65 C45 68 54 66 60 62" stroke="#0f172a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M42 74 C48 76 54 75 58 72" stroke="#0f172a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M42 55 C46 59 48 64 48 70" stroke="#0f172a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

// 3. BROOM (Aam Aadmi Party)
const SvgBroom = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Broom Top Handle (Bound Grass) */}
    <path d="M16 22 L32 38 L26 44 L10 28 Z" fill="#d97706" stroke="#0f172a" strokeWidth="1.8" />
    {/* Binding Rings */}
    <line x1="12" y1="26" x2="28" y2="42" stroke="#0f172a" strokeWidth="2.5" />
    <line x1="15" y1="23" x2="31" y2="39" stroke="#b45309" strokeWidth="2.5" />
    <line x1="18" y1="20" x2="34" y2="36" stroke="#0f172a" strokeWidth="2.5" />
    {/* Main Fan of Straw Bristles */}
    <path
      d="M32 38 
         L84 66 
         C88 74 86 86 78 90 
         C70 94 58 90 52 82 
         L26 44 Z"
      fill="#fef08a"
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Tied Mid-Ribbon */}
    <path d="M38 48 C44 54 48 58 52 62" stroke="#b91c1c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {/* Radiating Bristle Textures */}
    <line x1="33" y1="40" x2="80" y2="70" stroke="#ca8a04" strokeWidth="1.3" />
    <line x1="32" y1="42" x2="76" y2="78" stroke="#ca8a04" strokeWidth="1.3" />
    <line x1="30" y1="43" x2="68" y2="84" stroke="#ca8a04" strokeWidth="1.3" />
    <line x1="28" y1="44" x2="58" y2="86" stroke="#ca8a04" strokeWidth="1.3" />
    <line x1="35" y1="39" x2="84" y2="72" stroke="#a16207" strokeWidth="1.1" />
  </svg>
);

// 4. ELEPHANT (Bahujan Samaj Party)
const SvgElephant = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="elephGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    {/* Elephant Body Silhouette */}
    <path
      d="M74 38
         C70 24 52 24 40 28
         C28 32 24 44 24 52
         L20 46
         C15 40 10 46 12 56
         C13 62 16 68 18 70
         C20 72 22 66 22 60
         L24 78
         L33 78
         L34 62
         C38 62 44 62 46 62
         L46 78
         L54 78
         L54 62
         C60 62 66 62 68 62
         L68 78
         L76 78
         L77 58
         C82 58 84 56 86 64
         L86 68
         L88 68
         L88 56
         C86 48 82 42 74 38
         Z"
      fill="url(#elephGrad)"
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Tusk */}
    <path d="M22 60 C18 64 16 66 12 65 C14 62 18 58 22 57 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
    {/* Ear Flap */}
    <path d="M34 32 C40 32 44 42 42 52 C40 58 35 58 32 54 C30 48 30 38 34 32 Z" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
    {/* Eye */}
    <circle cx="28" cy="40" r="1.5" fill="#f8fafc" />
    {/* Saddle / Caparison Rug (Jhool) */}
    <path d="M48 38 L68 38 L66 54 L49 54 Z" fill="#dc2626" stroke="#facc15" strokeWidth="1.2" />
    <line x1="50" y1="52" x2="65" y2="52" stroke="#facc15" strokeWidth="1.5" strokeDasharray="2,2" />
  </svg>
);

// 5. HAMMER, SICKLE AND STAR (Communist Party of India (Marxist))
const SvgHammerSickleStar = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* 5-Pointed Star at Top */}
    <polygon points="50,8 54,20 67,20 57,28 61,40 50,32 39,40 43,28 33,20 46,20" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
    {/* Hammer Handle */}
    <path d="M24 78 L68 34 L73 39 L29 83 Z" fill="#d97706" stroke="#0f172a" strokeWidth="1.8" />
    {/* Hammer Head */}
    <path d="M62 26 L80 44 L75 49 L57 31 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.8" />
    {/* Sickle Blade (Curved arc) */}
    <path
      d="M32 72
         C16 52 24 30 46 22
         C58 18 72 26 74 34
         C68 28 54 26 44 32
         C30 40 28 56 38 68
         L32 72 Z"
      fill="#e2e8f0"
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Sickle Handle */}
    <path d="M38 68 L48 84 L41 88 L31 72 Z" fill="#b45309" stroke="#0f172a" strokeWidth="1.8" />
  </svg>
);

// 6. BOOK (National People's Party)
const SvgBook = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Hardcover Binding Base */}
    <path d="M12 70 C30 65 46 72 50 78 C54 72 70 65 88 70 L86 78 C70 72 54 78 50 84 C46 78 30 72 14 78 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.8" />
    {/* Left Open Page */}
    <path d="M14 32 C30 26 46 32 50 38 L50 76 C46 70 30 64 14 70 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
    {/* Right Open Page */}
    <path d="M86 32 C70 26 54 32 50 38 L50 76 C54 70 70 64 86 70 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
    {/* Left Page Text Lines */}
    <line x1="22" y1="42" x2="42" y2="44" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="49" x2="42" y2="51" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="56" x2="42" y2="58" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Right Page Text Lines */}
    <line x1="58" y1="44" x2="78" y2="42" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="58" y1="51" x2="78" y2="49" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="58" y1="58" x2="78" y2="56" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Center Spine Crease */}
    <line x1="50" y1="38" x2="50" y2="76" stroke="#0f172a" strokeWidth="2" />
  </svg>
);

// 7. FLOWERS AND GRASS (All India Trinamool Congress)
const SvgFlowersAndGrass = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Ground Soil Arc */}
    <path d="M16 88 C34 82 66 82 84 88" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Grass Blades at Base */}
    <path d="M26 86 C28 72 24 64 18 58 C24 66 32 76 34 86" fill="#22c55e" stroke="#0f172a" strokeWidth="1.2" />
    <path d="M42 86 C40 68 34 56 26 48 C36 58 44 70 46 86" fill="#16a34a" stroke="#0f172a" strokeWidth="1.2" />
    <path d="M58 86 C60 68 66 56 74 48 C64 58 56 70 54 86" fill="#16a34a" stroke="#0f172a" strokeWidth="1.2" />
    <path d="M74 86 C72 72 76 64 82 58 C76 66 68 76 66 86" fill="#22c55e" stroke="#0f172a" strokeWidth="1.2" />
    {/* Left Flower Stem & Bud */}
    <path d="M46 86 C46 55 36 40 38 28" stroke="#15803d" strokeWidth="2.5" fill="none" />
    <circle cx="38" cy="24" r="7" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
    <circle cx="38" cy="24" r="3" fill="#facc15" />
    {/* Right Flower Stem & Bud */}
    <path d="M54 86 C54 55 64 40 62 28" stroke="#15803d" strokeWidth="2.5" fill="none" />
    <circle cx="62" cy="24" r="7" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
    <circle cx="62" cy="24" r="3" fill="#facc15" />
  </svg>
);

// 8. RISING SUN (Dravida Munnetra Kazhagam)
const SvgRisingSun = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Sun Rays */}
    <g stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round">
      <line x1="50" y1="46" x2="50" y2="14" />
      <line x1="50" y1="46" x2="26" y2="22" />
      <line x1="50" y1="46" x2="74" y2="22" />
      <line x1="50" y1="46" x2="14" y2="40" />
      <line x1="50" y1="46" x2="86" y2="40" />
      <line x1="50" y1="46" x2="36" y2="16" />
      <line x1="50" y1="46" x2="64" y2="16" />
    </g>
    {/* Sun Disc */}
    <ellipse cx="50" cy="56" rx="20" ry="18" fill="#facc15" stroke="#ea580c" strokeWidth="2.2" />
    {/* Left Mountain Peak */}
    <path d="M8 82 L38 52 L54 74 L8 82 Z" fill="#475569" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
    {/* Right Mountain Peak */}
    <path d="M46 74 L66 48 L92 82 L46 74 Z" fill="#334155" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
    {/* Valley Base / Waterline */}
    <line x1="8" y1="82" x2="92" y2="82" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 9. TWO LEAVES (All India Anna Dravida Munnetra Kazhagam)
const SvgTwoLeaves = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Central Branch Stem */}
    <path d="M50 88 C50 72 50 56 50 48" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Left Leaf */}
    <path
      d="M50 56
         C34 54 18 42 22 24
         C36 20 48 38 50 56 Z"
      fill="#22c55e"
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Left Leaf Center Vein */}
    <path d="M50 56 C38 46 28 35 22 24" stroke="#15803d" strokeWidth="1.5" fill="none" />
    {/* Right Leaf */}
    <path
      d="M50 56
         C66 54 82 42 78 24
         C64 20 52 38 50 56 Z"
      fill="#22c55e"
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Right Leaf Center Vein */}
    <path d="M50 56 C62 46 72 35 78 24" stroke="#15803d" strokeWidth="1.5" fill="none" />
  </svg>
);

// 10. FLAMING TORCH / MASHAL (Shiv Sena UBT)
const SvgFlamingTorch = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Torch Flames */}
    <path
      d="M50 12
         C42 22 40 30 46 36
         C38 32 30 38 34 46
         C38 52 46 54 50 54
         C54 54 62 52 66 46
         C70 38 62 32 54 36
         C60 30 58 22 50 12 Z"
      fill="#ea580c"
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Inner Core Flame */}
    <path
      d="M50 24
         C46 30 46 36 50 42
         C54 36 54 30 50 24 Z"
      fill="#facc15"
    />
    {/* Torch Bowl / Cup */}
    <path d="M36 54 L64 54 L60 66 L40 66 Z" fill="#64748b" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
    {/* Torch Handle */}
    <path d="M46 66 L54 66 L52 90 L48 90 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.8" />
    {/* Grip Rings */}
    <line x1="47" y1="72" x2="53" y2="72" stroke="#f1f5f9" strokeWidth="1.5" />
    <line x1="47" y1="78" x2="53" y2="78" stroke="#f1f5f9" strokeWidth="1.5" />
    <line x1="47" y1="84" x2="53" y2="84" stroke="#f1f5f9" strokeWidth="1.5" />
  </svg>
);

// 11. BOW AND ARROW (Shiv Sena / Jharkhand Mukti Morcha)
const SvgBowAndArrow = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Curved Bow */}
    <path
      d="M24 16
         C42 26 48 50 48 50
         C48 50 42 74 24 84"
      stroke="#b45309"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    {/* Bowstring */}
    <line x1="24" y1="16" x2="24" y2="84" stroke="#64748b" strokeWidth="1.5" />
    {/* Nocked Arrow Shaft */}
    <line x1="16" y1="50" x2="82" y2="50" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    {/* Arrowhead */}
    <polygon points="82,42 94,50 82,58" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
    {/* Arrow Fletching */}
    <path d="M18 44 L26 50 L18 56" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M12 44 L20 50 L12 56" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// 12. MAN BLOWING TURHA / TUTARI (NCP - Sharadchandra Pawar)
const SvgManBlowingTurha = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Man's Turban (Pagri / Feta) */}
    <path d="M22 42 C20 34 26 28 34 28 C42 28 46 34 44 42 Z" fill="#ea580c" stroke="#0f172a" strokeWidth="1.5" />
    <path d="M34 28 C36 22 42 20 44 24" stroke="#c2410c" strokeWidth="2" fill="none" />
    {/* Man's Face & Head */}
    <circle cx="34" cy="42" r="7" fill="#fbd5b5" stroke="#0f172a" strokeWidth="1.2" />
    {/* Torso */}
    <path d="M26 49 L42 49 L44 76 L24 76 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
    {/* Raised Arm Holding Turha */}
    <path d="M36 54 L52 48 L56 42" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Traditional Turha (Curved Bugle Horn) */}
    <path
      d="M40 42 
         C52 42 64 36 72 26 
         C76 22 84 20 88 16"
      stroke="#eab308"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Flared Bell of Turha */}
    <ellipse cx="88" cy="16" rx="6" ry="10" transform="rotate(30 88 16)" fill="#ca8a04" stroke="#0f172a" strokeWidth="1.5" />
    {/* Decorative tassels */}
    <path d="M62 38 C64 46 66 52 64 58" stroke="#dc2626" strokeWidth="1.8" fill="none" />
  </svg>
);

// 13. CLOCK (Nationalist Congress Party)
const SvgClock = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Alarm Bell Left */}
    <path d="M24 22 C20 28 26 34 32 30 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.8" />
    {/* Alarm Bell Right */}
    <path d="M76 22 C80 28 74 34 68 30 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.8" />
    {/* Bell Striker / Top Handle */}
    <path d="M46 16 L54 16 L52 24 L48 24 Z" fill="#0f172a" />
    {/* Feet */}
    <line x1="30" y1="80" x2="24" y2="88" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <line x1="70" y1="80" x2="76" y2="88" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    {/* Clock Outer Rim */}
    <circle cx="50" cy="54" r="30" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
    {/* 12, 3, 6, 9 Hour markers */}
    <line x1="50" y1="28" x2="50" y2="33" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="76" y1="54" x2="71" y2="54" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="80" x2="50" y2="75" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="54" x2="29" y2="54" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    {/* Clock Hands at 10:10 */}
    <line x1="50" y1="54" x2="36" y2="40" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="54" x2="68" y2="44" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="54" r="3" fill="#dc2626" />
  </svg>
);

// 14. BICYCLE (Samajwadi Party / Telugu Desam Party)
const SvgBicycle = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Rear Wheel */}
    <circle cx="26" cy="64" r="18" fill="none" stroke="#0f172a" strokeWidth="2.5" />
    <circle cx="26" cy="64" r="2" fill="#0f172a" />
    {/* Front Wheel */}
    <circle cx="74" cy="64" r="18" fill="none" stroke="#0f172a" strokeWidth="2.5" />
    <circle cx="74" cy="64" r="2" fill="#0f172a" />
    {/* Diamond Frame Tubes */}
    <line x1="26" y1="64" x2="48" y2="64" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="26" y1="64" x2="44" y2="40" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="48" y1="64" x2="44" y2="40" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="44" y1="40" x2="66" y2="40" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="48" y1="64" x2="66" y2="40" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="66" y1="40" x2="74" y2="64" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
    {/* Saddle / Seat */}
    <line x1="44" y1="40" x2="42" y2="34" stroke="#0f172a" strokeWidth="2.5" />
    <path d="M36 34 L48 34" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
    {/* Handlebars */}
    <line x1="66" y1="40" x2="68" y2="30" stroke="#0f172a" strokeWidth="2.5" />
    <path d="M64 30 L72 30 L74 35" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

// 15. CEILING FAN (YSRCP)
const SvgCeilingFan = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Downrod & Motor Canopy */}
    <line x1="50" y1="12" x2="50" y2="38" stroke="#0f172a" strokeWidth="3" />
    <circle cx="50" cy="46" r="10" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
    {/* Blade 1 (Pointing Bottom Left) */}
    <path d="M44 52 L14 74 C10 78 14 84 20 82 L48 54 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
    {/* Blade 2 (Pointing Bottom Right) */}
    <path d="M56 52 L86 74 C90 78 86 84 80 82 L52 54 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
    {/* Blade 3 (Pointing Top / Upward Profile) */}
    <path d="M50 36 L50 18 C50 14 56 14 56 18 L54 36 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
    <circle cx="50" cy="46" r="4" fill="#facc15" />
  </svg>
);

// 16. CAR (Bharat Rashtra Samithi)
const SvgCar = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Car Body */}
    <path
      d="M14 62 
         L18 50 
         C22 50 28 40 38 34 
         L66 34 
         C74 38 80 50 86 52 
         L90 62 
         C90 66 86 68 82 68 
         L78 68 
         C76 60 64 60 62 68 
         L38 68 
         C36 60 24 60 22 68 
         L14 68 
         C12 68 10 65 14 62 Z"
      fill="#ec4899"
      stroke="#0f172a"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Windows */}
    <path d="M38 38 L50 38 L50 48 L32 48 Z" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.4" />
    <path d="M54 38 L65 38 L72 48 L54 48 Z" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.4" />
    {/* Wheels */}
    <circle cx="30" cy="68" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
    <circle cx="30" cy="68" r="3" fill="#cbd5e1" />
    <circle cx="70" cy="68" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
    <circle cx="70" cy="68" r="3" fill="#cbd5e1" />
  </svg>
);

// 17. ARROW (Janata Dal - United)
const SvgArrow = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Horizontal Arrow Shaft */}
    <line x1="12" y1="50" x2="82" y2="50" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
    {/* Arrowhead */}
    <polygon points="78,34 94,50 78,66 82,50" fill="#16a34a" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
    {/* Arrow Rear Fletchings */}
    <path d="M16 38 L26 50 L16 62" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M24 38 L34 50 L24 62" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

// 18. HURRICANE LAMP (Rashtriya Janata Dal)
const SvgHurricaneLamp = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Handle Loop */}
    <path d="M34 32 C34 14 66 14 66 32" stroke="#0f172a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {/* Top Cap */}
    <path d="M42 28 L58 28 L56 34 L44 34 Z" fill="#16a34a" stroke="#0f172a" strokeWidth="1.8" />
    {/* Glass Chimney / Flame Core */}
    <ellipse cx="50" cy="52" rx="14" ry="18" fill="#fef08a" stroke="#0f172a" strokeWidth="2" />
    <path d="M50 44 C47 48 47 54 50 58 C53 54 53 48 50 44 Z" fill="#ea580c" />
    {/* Protective Wire Cage */}
    <line x1="36" y1="52" x2="64" y2="52" stroke="#0f172a" strokeWidth="1.5" />
    <path d="M38 34 L38 70" stroke="#0f172a" strokeWidth="1.8" />
    <path d="M62 34 L62 70" stroke="#0f172a" strokeWidth="1.8" />
    {/* Fuel Tank Base */}
    <path d="M32 70 L68 70 L72 86 L28 86 Z" fill="#15803d" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

// 19. CONCH / SHANKHA (Biju Janata Dal)
const SvgConch = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Conch Body */}
    <path
      d="M20 54
         C16 38 32 24 54 22
         C74 20 86 34 84 52
         C82 68 64 78 46 80
         C32 82 22 70 20 54 Z"
      fill="#f8fafc"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Conch Spire / Tip */}
    <path d="M84 52 C92 48 94 40 88 34" stroke="#0f172a" strokeWidth="2" fill="none" />
    {/* Spiral Ridges */}
    <path d="M54 22 C56 34 60 52 50 78" stroke="#0284c7" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M66 26 C68 40 70 58 64 74" stroke="#0284c7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M38 30 C40 44 42 60 36 76" stroke="#0284c7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {/* Fluted Aperture */}
    <ellipse cx="26" cy="54" rx="5" ry="14" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.8" />
  </svg>
);

// 20. SCALES (Shiromani Akali Dal)
const SvgScales = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Center Post & Fulcrum */}
    <line x1="50" y1="18" x2="50" y2="82" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="22" r="4" fill="#eab308" stroke="#0f172a" strokeWidth="1.5" />
    <line x1="38" y1="82" x2="62" y2="82" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    {/* Balance Beam */}
    <line x1="18" y1="32" x2="82" y2="32" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    {/* Left Pan Strings */}
    <line x1="18" y1="32" x2="10" y2="58" stroke="#64748b" strokeWidth="1.3" />
    <line x1="18" y1="32" x2="26" y2="58" stroke="#64748b" strokeWidth="1.3" />
    {/* Left Pan */}
    <path d="M8 58 C12 68 24 68 28 58 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.8" />
    {/* Right Pan Strings */}
    <line x1="82" y1="32" x2="74" y2="58" stroke="#64748b" strokeWidth="1.3" />
    <line x1="82" y1="32" x2="90" y2="58" stroke="#64748b" strokeWidth="1.3" />
    {/* Right Pan */}
    <path d="M72 58 C76 68 88 68 92 58 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.8" />
  </svg>
);

// 21. KITE (All India Majlis-E-Ittehadul Muslimeen)
const SvgKite = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Diamond Sail */}
    <polygon points="50,14 84,48 50,82 16,48" fill="#15803d" stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Color Halves */}
    <polygon points="50,14 84,48 50,82" fill="#22c55e" opacity="0.4" />
    {/* Vertical Spine */}
    <line x1="50" y1="14" x2="50" y2="82" stroke="#0f172a" strokeWidth="2" />
    {/* Curved Bow Spar */}
    <path d="M16 48 C30 28 70 28 84 48" stroke="#0f172a" strokeWidth="2" fill="none" />
    {/* Triangular Tail */}
    <polygon points="50,82 42,92 58,92" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
  </svg>
);

// 22. INKPOT AND PEN (Independent Candidates / Free Symbol)
const SvgInkpotAndPen = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Inkpot Glass Body */}
    <path d="M22 56 L46 56 L50 82 L18 82 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
    {/* Inkpot Cap / Neck */}
    <path d="M26 48 L42 48 L44 56 L24 56 Z" fill="#0369a1" stroke="#0f172a" strokeWidth="1.8" />
    <ellipse cx="34" cy="48" rx="8" ry="3" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
    {/* Blue Ink Level */}
    <path d="M20 68 L48 68 L49 80 L19 80 Z" fill="#1d4ed8" />
    {/* Dip Pen Diagonally Placed */}
    <line x1="48" y1="74" x2="86" y2="18" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
    {/* Pen Metal Nib */}
    <polygon points="44,78 48,72 52,76" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.2" />
    <line x1="46" y1="75" x2="48" y2="72" stroke="#0f172a" strokeWidth="1" />
  </svg>
);

// 23. ORBIT & STAR
const SvgOrbitAndStar = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Elliptical Orbits */}
    <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="#6366f1" strokeWidth="2" transform="rotate(-30 50 50)" />
    <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="#8b5cf6" strokeWidth="2" transform="rotate(30 50 50)" />
    {/* Central Star */}
    <polygon points="50,28 55,42 70,42 58,52 62,68 50,58 38,68 42,52 30,42 45,42" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
  </svg>
);

// 24. LOTUS & SUN
const SvgLotusAndSun = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    {/* Radiant Sun in background */}
    <ellipse cx="50" cy="42" rx="16" ry="16" fill="#facc15" stroke="#ea580c" strokeWidth="2" />
    <g stroke="#ea580c" strokeWidth="2">
      <line x1="50" y1="22" x2="50" y2="12" />
      <line x1="32" y1="28" x2="24" y2="20" />
      <line x1="68" y1="28" x2="76" y2="20" />
    </g>
    {/* Foreground Lotus */}
    <path d="M50 36 C42 48 44 72 50 82 C56 72 58 48 50 36 Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.8" />
    <path d="M38 52 C26 56 22 68 32 78 C40 80 46 76 48 74 Z" fill="#fb7185" stroke="#0f172a" strokeWidth="1.6" />
    <path d="M62 52 C74 56 78 68 68 78 C60 80 54 76 52 74 Z" fill="#fb7185" stroke="#0f172a" strokeWidth="1.6" />
  </svg>
);

// 25. OFFICIAL ECI DEFAULT EMBLEM (Statutory Fallback)
const SvgDefaultEmblem = ({ symbol }) => {
  const initial = (symbol && symbol.trim().length > 0) ? symbol.trim()[0].toUpperCase() : "E";
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="42" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="3" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
      {/* Central Initial / Shield */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="28"
        fontWeight="bold"
        fill="#1e3a8a"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
      <text
        x="50"
        y="74"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="#ea580c"
        letterSpacing="1"
        fontFamily="sans-serif"
      >
        ECI
      </text>
    </svg>
  );
};

// Normalization & Dispatch Map
const getSymbolRenderer = (symbolName) => {
  if (!symbolName) return SvgDefaultEmblem;
  const s = symbolName.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (s.includes("lotus") && s.includes("sun")) return SvgLotusAndSun;
  if (s.includes("lotus")) return SvgLotus;
  if (s.includes("hand")) return SvgHand;
  if (s.includes("broom") || s.includes("jhadu")) return SvgBroom;
  if (s.includes("elephant") || s.includes("hathi")) return SvgElephant;
  if (s.includes("hammersickle") || (s.includes("hammer") && s.includes("sickle"))) return SvgHammerSickleStar;
  if (s.includes("book") || s.includes("kitab")) return SvgBook;
  if (s.includes("flowersandgrass") || s.includes("flowersgrass") || s.includes("ghasphool")) return SvgFlowersAndGrass;
  if (s.includes("risingsun") || s.includes("udaytasurya")) return SvgRisingSun;
  if (s.includes("twoleaves") || s.includes("twoleaf") || s.includes("irattailai")) return SvgTwoLeaves;
  if (s.includes("flamingtorch") || s.includes("torch") || s.includes("mashal")) return SvgFlamingTorch;
  if (s.includes("bowandarrow") || s.includes("bowarrow") || s.includes("tirkaman")) return SvgBowAndArrow;
  if (s.includes("turha") || s.includes("tutari") || s.includes("manblowing")) return SvgManBlowingTurha;
  if (s.includes("clock") || s.includes("ghadi")) return SvgClock;
  if (s.includes("bicycle") || s.includes("cycle")) return SvgBicycle;
  if (s.includes("ceilingfan") || s.includes("fan") || s.includes("pankha")) return SvgCeilingFan;
  if (s.includes("car") || s.includes("gadi")) return SvgCar;
  if (s.includes("arrow") || s.includes("teer")) return SvgArrow;
  if (s.includes("lamp") || s.includes("lantern") || s.includes("lalteen") || s.includes("hurricane")) return SvgHurricaneLamp;
  if (s.includes("conch") || s.includes("shankha") || s.includes("shankh")) return SvgConch;
  if (s.includes("scale") || s.includes("scales") || s.includes("taraju")) return SvgScales;
  if (s.includes("kite") || s.includes("patang")) return SvgKite;
  if (s.includes("inkpot") || s.includes("pen") || s.includes("dawat")) return SvgInkpotAndPen;
  if (s.includes("orbit")) return SvgOrbitAndStar;

  return SvgDefaultEmblem;
};

/**
 * Main ECISymbolIcon Component
 *
 * @param {string} symbol - Statutory symbol name (e.g., "Lotus", "Hand", "Broom")
 * @param {number} size - Pixel dimension (width and height), default 36
 * @param {boolean} showLabel - If true, renders symbol name alongside icon
 * @param {boolean} framed - If true, wraps in official ECI security ballot border box
 * @param {string} className - Optional styling classes
 * @param {object} style - Custom inline styles
 */
export default function ECISymbolIcon({
  symbol = "",
  size = 36,
  showLabel = false,
  framed = true,
  className = "",
  style = {}
}) {
  const SvgComponent = getSymbolRenderer(symbol);

  const containerStyle = framed
    ? {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        padding: `${Math.max(2, Math.round(size * 0.08))}px`,
        boxSizing: "border-box",
        overflow: "hidden",
        ...style
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        boxSizing: "border-box",
        ...style
      };

  const iconElement = (
    <div
      className={`eci-symbol-icon ${className}`}
      style={containerStyle}
      title={`ECI Reserved Election Symbol: ${symbol || "Official Allotment"}`}
    >
      {SvgComponent({ symbol })}
    </div>
  );

  if (!showLabel) {
    return iconElement;
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      {iconElement}
      <div>
        <strong style={{ color: "#0f172a", fontSize: "13px", display: "block" }}>{symbol}</strong>
        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          ECI Reserved Allotment
        </span>
      </div>
    </div>
  );
}
