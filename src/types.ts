export type DamageType = 
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'fire'
  | 'lightning'
  | 'cold'
  | 'necrotic'
  | 'radiant'
  | 'acid'
  | 'psychic'
  | 'force'
  | 'poison';

export interface DamageTypeInfo {
  id: DamageType;
  nameRu: string;
  icon: string;
  color: string;
  glowColor: string;
}

export interface DamagePhase {
  id: string;
  name: string;              // e.g. "В полной силе", "Лёгкие раны", "Окровавлен", "Критическое состояние", "Повержен"
  thresholdHp: number;        // The HP threshold below which or at which this phase is active
  thresholdPercent: number;   // Calculated percentage (e.g. 100, 75, 50, 20, 0)
  description: string;        // Visual description (e.g. "Доспехи целы, яростный взор")
  customImage?: string;       // Optional custom stage image if uploaded
  bloodIntensity: number;     // 0 to 1
  slashesCount: number;       // Number of visible deep scars/cuts
  tearIntensity: number;      // Torn clothing / broken armor intensity (0 to 1)
  desaturation: number;       // 0 to 1
  redTint: number;            // 0 to 1
  darkness: number;           // 0 to 1
  vignettePulse: boolean;     // Pulse red vignette
}

export interface BossPortraitStages {
  pristine?: string;
  wounded?: string;
  critical?: string;
  defeated?: string;
}

export interface BossPreset {
  id: string;
  name: string;
  title: string;
  cr: string;                 // e.g. "ПО 1 (CR 1)", "ПО 17 (CR 17)"
  type: string;               // e.g. "Гуманоид (гоблиноид)", "Нежить", "Дракон"
  size?: string;              // e.g. "Маленький", "Средний", "Большой", "Огромный", "Колоссальный"
  alignment?: string;         // e.g. "Законно-злой", "Хаотично-злой"
  hpFormula?: string;         // e.g. "6к6", "19к10 + 76"
  maxHp: number;
  armorClass: number;
  legendaryResistances: number;
  speed: string;
  description: string;
  image: string;              // Base portrait image
  stages?: BossPortraitStages;// Optional dedicated stage images (like Death Knight)
  phases?: DamagePhase[];     // Configured deterioration phases
  sourceRule?: string;        // e.g. "D&D 5e Monster Manual, стр. 71"
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  type: 'damage' | 'heal' | 'tempHp' | 'reset' | 'maxHpChange' | 'phaseChange';
  amount: number;
  damageType?: DamageType;
  previousHp: number;
  newHp: number;
  phaseName?: string;
  isBloodiedTrigger?: boolean;
  isDefeatedTrigger?: boolean;
  note?: string;
}

export interface ActiveSlashEffect {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  damageType: DamageType;
}

export interface BloodDrop {
  id: string;
  x: number;
  y: number;
  size: number;
  length: number;
  opacity: number;
}
