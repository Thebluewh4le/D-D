import { DamagePhase } from '../types';

export function generateDefaultPhases(maxHp: number, phaseCount: number = 5): DamagePhase[] {
  const count = Math.max(2, Math.min(8, phaseCount));

  if (count === 2) {
    return [
      {
        id: 'p1',
        name: 'В строю',
        thresholdHp: maxHp,
        thresholdPercent: 100,
        description: 'Персонаж готов к бою, видимых повреждений нет.',
        bloodIntensity: 0,
        slashesCount: 0,
        tearIntensity: 0,
        desaturation: 0,
        redTint: 0,
        darkness: 0,
        vignettePulse: false,
      },
      {
        id: 'p2',
        name: 'Повержен',
        thresholdHp: 0,
        thresholdPercent: 0,
        description: 'Противник пал в бою, жизненная сила иссякла.',
        bloodIntensity: 1,
        slashesCount: 6,
        tearIntensity: 1,
        desaturation: 0.8,
        redTint: 0.3,
        darkness: 0.5,
        vignettePulse: false,
      },
    ];
  }

  if (count === 3) {
    const p2Hp = Math.round(maxHp * 0.5);
    return [
      {
        id: 'p1',
        name: 'В полной силе',
        thresholdHp: maxHp,
        thresholdPercent: 100,
        description: 'Полное здоровье, безупречный внешний вид.',
        bloodIntensity: 0,
        slashesCount: 0,
        tearIntensity: 0,
        desaturation: 0,
        redTint: 0,
        darkness: 0,
        vignettePulse: false,
      },
      {
        id: 'p2',
        name: 'Окровавлен и изранен',
        thresholdHp: p2Hp,
        thresholdPercent: 50,
        description: 'Множество открытых ран, разорванная одежда и кровотечение.',
        bloodIntensity: 0.6,
        slashesCount: 4,
        tearIntensity: 0.5,
        desaturation: 0.15,
        redTint: 0.2,
        darkness: 0.1,
        vignettePulse: true,
      },
      {
        id: 'p3',
        name: 'Повержен',
        thresholdHp: 0,
        thresholdPercent: 0,
        description: 'Противник пал в бою.',
        bloodIntensity: 1,
        slashesCount: 6,
        tearIntensity: 1,
        desaturation: 0.8,
        redTint: 0.3,
        darkness: 0.5,
        vignettePulse: false,
      },
    ];
  }

  if (count === 4) {
    const p2Hp = Math.round(maxHp * 0.66);
    const p3Hp = Math.round(maxHp * 0.33);
    return [
      {
        id: 'p1',
        name: 'В полной силе',
        thresholdHp: maxHp,
        thresholdPercent: 100,
        description: 'Полное здоровье, уверенная боевая стойка.',
        bloodIntensity: 0,
        slashesCount: 0,
        tearIntensity: 0,
        desaturation: 0,
        redTint: 0,
        darkness: 0,
        vignettePulse: false,
      },
      {
        id: 'p2',
        name: 'Первые ранения',
        thresholdHp: p2Hp,
        thresholdPercent: 66,
        description: 'Царапины, сколотая броня и потёки крови.',
        bloodIntensity: 0.3,
        slashesCount: 2,
        tearIntensity: 0.2,
        desaturation: 0.05,
        redTint: 0.05,
        darkness: 0.05,
        vignettePulse: false,
      },
      {
        id: 'p3',
        name: 'Окровавлен и изнурён',
        thresholdHp: p3Hp,
        thresholdPercent: 33,
        description: 'Глубокие раны, рваная одежда, обильное кровотечение.',
        bloodIntensity: 0.7,
        slashesCount: 5,
        tearIntensity: 0.6,
        desaturation: 0.2,
        redTint: 0.25,
        darkness: 0.2,
        vignettePulse: true,
      },
      {
        id: 'p4',
        name: 'Повержен',
        thresholdHp: 0,
        thresholdPercent: 0,
        description: 'Противник повержен.',
        bloodIntensity: 1,
        slashesCount: 7,
        tearIntensity: 1,
        desaturation: 0.8,
        redTint: 0.3,
        darkness: 0.5,
        vignettePulse: false,
      },
    ];
  }

  // 5 phases (default standard)
  const p2Hp = Math.round(maxHp * 0.75);
  const p3Hp = Math.round(maxHp * 0.5);
  const p4Hp = Math.round(maxHp * 0.2);

  return [
    {
      id: 'p1',
      name: 'В полной силе',
      thresholdHp: maxHp,
      thresholdPercent: 100,
      description: 'Безупречное состояние, сияющие доспехи, грозный вид.',
      bloodIntensity: 0,
      slashesCount: 0,
      tearIntensity: 0,
      desaturation: 0,
      redTint: 0,
      darkness: 0,
      vignettePulse: false,
    },
    {
      id: 'p2',
      name: 'Лёгкие раны',
      thresholdHp: p2Hp,
      thresholdPercent: 75,
      description: 'Появились ссадины, сколы на броне и мелкие порезы.',
      bloodIntensity: 0.25,
      slashesCount: 2,
      tearIntensity: 0.15,
      desaturation: 0.05,
      redTint: 0.05,
      darkness: 0.05,
      vignettePulse: false,
    },
    {
      id: 'p3',
      name: 'Окровавлен',
      thresholdHp: p3Hp,
      thresholdPercent: 50,
      description: 'Доспехи пробиты, рваная ткань, кровь стекает по телу.',
      bloodIntensity: 0.55,
      slashesCount: 4,
      tearIntensity: 0.45,
      desaturation: 0.15,
      redTint: 0.15,
      darkness: 0.15,
      vignettePulse: false,
    },
    {
      id: 'p4',
      name: 'Критическое состояние',
      thresholdHp: p4Hp,
      thresholdPercent: 20,
      description: 'Тяжёлые кровотечения, оторванная защита, агония боя.',
      bloodIntensity: 0.85,
      slashesCount: 6,
      tearIntensity: 0.8,
      desaturation: 0.3,
      redTint: 0.35,
      darkness: 0.3,
      vignettePulse: true,
    },
    {
      id: 'p5',
      name: 'Повержен',
      thresholdHp: 0,
      thresholdPercent: 0,
      description: 'Босс пал в сражении, силы оставили его.',
      bloodIntensity: 1,
      slashesCount: 8,
      tearIntensity: 1,
      desaturation: 0.85,
      redTint: 0.4,
      darkness: 0.55,
      vignettePulse: false,
    },
  ];
}

export function getCurrentPhase(phases: DamagePhase[], currentHp: number, maxHp: number): DamagePhase {
  if (!phases || phases.length === 0) {
    return generateDefaultPhases(maxHp, 5)[0];
  }

  // If currentHp <= 0, return the lowest phase (usually 0 HP / Defeated)
  if (currentHp <= 0) {
    return phases[phases.length - 1];
  }

  // Iterate from top to bottom
  // A phase is active if currentHp is less than or equal to its threshold,
  // but higher than the next phase threshold.
  for (let i = 0; i < phases.length; i++) {
    const nextPhase = phases[i + 1];
    if (!nextPhase) {
      return phases[i];
    }
    // If currentHp is above the next phase's threshold, it belongs to this phase
    if (currentHp > nextPhase.thresholdHp) {
      return phases[i];
    }
  }

  return phases[phases.length - 1];
}
