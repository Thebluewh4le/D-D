import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BossPreset, DamageType, CombatLogEntry, ActiveSlashEffect, BloodDrop, DamagePhase } from './types';
import { DEFAULT_BOSSES, DAMAGE_TYPES } from './data/defaultBosses';
import { generateDefaultPhases, getCurrentPhase } from './utils/phaseUtils';
import { BossPortrait } from './components/BossPortrait';
import { DamageControls } from './components/DamageControls';
import { CombatLog } from './components/CombatLog';
import { BossSettingsModal } from './components/BossSettingsModal';
import { PhaseConfigModal } from './components/PhaseConfigModal';
import { PlayerViewModal } from './components/PlayerViewModal';
import {
  playHitSound,
  playHealSound,
  playBloodiedGong,
  playDefeatSound,
} from './utils/audio';
import { Shield, Sparkles, Sword, SlidersHorizontal, Users } from 'lucide-react';

interface HistorySnapshot {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  bloodDrops: BloodDrop[];
  phases: DamagePhase[];
  log: CombatLogEntry;
}

export default function App() {
  const [boss, setBoss] = useState<BossPreset>(() => {
    const saved = localStorage.getItem('dnd_boss_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = DEFAULT_BOSSES.find((b) => b.id === parsed.id);
        if (match) return match;
        return parsed;
      } catch {
        // ignore
      }
    }
    return DEFAULT_BOSSES[0];
  });

  const [maxHp, setMaxHp] = useState<number>(() => {
    const saved = localStorage.getItem('dnd_boss_max_hp');
    return saved ? parseInt(saved, 10) : DEFAULT_BOSSES[0].maxHp;
  });

  const [currentHp, setCurrentHp] = useState<number>(() => {
    const saved = localStorage.getItem('dnd_boss_current_hp');
    return saved ? parseInt(saved, 10) : DEFAULT_BOSSES[0].maxHp;
  });

  const [phases, setPhases] = useState<DamagePhase[]>(() => {
    const savedPhases = localStorage.getItem('dnd_boss_phases');
    if (savedPhases) {
      try {
        return JSON.parse(savedPhases);
      } catch {
        // ignore
      }
    }
    return boss.phases || generateDefaultPhases(maxHp, 5);
  });

  const [tempHp, setTempHp] = useState<number>(0);
  const [legendaryResistancesUsed, setLegendaryResistancesUsed] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Visual effects states
  const [activeSlashes, setActiveSlashes] = useState<ActiveSlashEffect[]>([]);
  const [bloodDrops, setBloodDrops] = useState<BloodDrop[]>([]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [recentDamageNumber, setRecentDamageNumber] = useState<{
    amount: number;
    color: string;
    id: number;
    damageType: string;
  } | null>(null);

  // History & Logs
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([]);

  // Modals
  const [isPlayerViewOpen, setIsPlayerViewOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPhaseConfigOpen, setIsPhaseConfigOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dnd_boss_data', JSON.stringify(boss));
  }, [boss]);

  useEffect(() => {
    localStorage.setItem('dnd_boss_max_hp', maxHp.toString());
  }, [maxHp]);

  useEffect(() => {
    localStorage.setItem('dnd_boss_current_hp', currentHp.toString());
  }, [currentHp]);

  useEffect(() => {
    localStorage.setItem('dnd_boss_phases', JSON.stringify(phases));
  }, [phases]);

  // Handle damage application
  const handleApplyDamage = useCallback(
    (amount: number, type: DamageType, isCrit: boolean) => {
      if (amount <= 0) return;

      const previousHp = currentHp;
      let remainingDamage = amount;
      let newTempHp = tempHp;

      // 1. Temp HP absorbs damage first (D&D 5e Rules)
      if (newTempHp > 0) {
        if (newTempHp >= remainingDamage) {
          newTempHp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= newTempHp;
          newTempHp = 0;
        }
        setTempHp(newTempHp);
      }

      // 2. Remaining damage to regular HP
      const newHp = Math.max(0, currentHp - remainingDamage);
      const prevPhase = getCurrentPhase(phases, previousHp, maxHp);
      const nextPhase = getCurrentPhase(phases, newHp, maxHp);
      const phaseChanged = prevPhase.id !== nextPhase.id;

      const isBloodiedTrigger =
        previousHp > maxHp * 0.5 && newHp <= maxHp * 0.5 && newHp > 0;
      const isDefeatedTrigger = previousHp > 0 && newHp <= 0;

      setCurrentHp(newHp);

      // 3. Audio effects
      if (soundEnabled) {
        playHitSound(type, isCrit);
        if (phaseChanged || isBloodiedTrigger) {
          setTimeout(() => playBloodiedGong(), 220);
        }
        if (isDefeatedTrigger) {
          setTimeout(() => playDefeatSound(), 350);
        }
      }

      // 4. Confetti on defeat
      if (isDefeatedTrigger) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#f59e0b', '#e11d48', '#450a0a'],
        });
      }

      // 5. Visual hit effects
      const typeInfo = DAMAGE_TYPES.find((t) => t.id === type);
      const glowColor = typeInfo?.glowColor || '#dc2626';

      // Slash line animation
      const slashId = `${Date.now()}-${Math.random()}`;
      const newSlash: ActiveSlashEffect = {
        id: slashId,
        x1: 20 + Math.random() * 20,
        y1: 15 + Math.random() * 30,
        x2: 60 + Math.random() * 30,
        y2: 50 + Math.random() * 40,
        color: glowColor,
        width: isCrit ? 6 : 4,
        damageType: type,
      };

      setActiveSlashes((prev) => [...prev, newSlash]);
      setTimeout(() => {
        setActiveSlashes((prev) => prev.filter((s) => s.id !== slashId));
      }, 500);

      // Add blood drops to persistent SVG overlay as damage accumulates
      const newDrops: BloodDrop[] = Array.from({
        length: Math.min(6, Math.max(1, Math.round(amount / 12))),
      }).map(() => ({
        id: `${Date.now()}-${Math.random()}`,
        x: 40 + Math.random() * 320,
        y: 100 + Math.random() * 300,
        size: 2.5 + Math.random() * 4.5,
        length: 8 + Math.random() * 26,
        opacity: 0.7 + Math.random() * 0.25,
      }));

      setBloodDrops((prev) => [...prev, ...newDrops]);

      // Shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 320);

      // Floating hit number
      setRecentDamageNumber({
        amount,
        color: glowColor,
        id: Date.now(),
        damageType: typeInfo?.nameRu || type,
      });

      // 6. Log entry & undo snapshot
      const logEntry: CombatLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        type: 'damage',
        amount,
        damageType: type,
        previousHp,
        newHp,
        phaseName: phaseChanged ? nextPhase.name : undefined,
        isBloodiedTrigger,
        isDefeatedTrigger,
      };

      setCombatLogs((prev) => [logEntry, ...prev]);
      setHistoryStack((prev) => [
        ...prev,
        {
          currentHp: previousHp,
          maxHp,
          tempHp,
          bloodDrops,
          phases,
          log: logEntry,
        },
      ]);
    },
    [currentHp, maxHp, tempHp, soundEnabled, bloodDrops, phases]
  );

  // Handle healing
  const handleApplyHeal = (amount: number) => {
    if (amount <= 0) return;
    const previousHp = currentHp;
    const newHp = Math.min(maxHp, currentHp + amount);
    setCurrentHp(newHp);

    if (soundEnabled) {
      playHealSound();
    }

    // Slightly reduce blood overlay on heal
    setBloodDrops((prev) => prev.slice(Math.floor(amount / 15)));

    const prevPhase = getCurrentPhase(phases, previousHp, maxHp);
    const nextPhase = getCurrentPhase(phases, newHp, maxHp);

    const logEntry: CombatLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      type: 'heal',
      amount,
      previousHp,
      newHp,
      phaseName: prevPhase.id !== nextPhase.id ? nextPhase.name : undefined,
    };

    setCombatLogs((prev) => [logEntry, ...prev]);
    setHistoryStack((prev) => [
      ...prev,
      {
        currentHp: previousHp,
        maxHp,
        tempHp,
        bloodDrops,
        phases,
        log: logEntry,
      },
    ]);
  };

  // Set Temp HP
  const handleSetTempHp = (amount: number) => {
    setTempHp(amount);
    const logEntry: CombatLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      type: 'tempHp',
      amount,
      previousHp: currentHp,
      newHp: currentHp,
    };
    setCombatLogs((prev) => [logEntry, ...prev]);
  };

  // Update Max HP & scale phase thresholds if needed
  const handleUpdateMaxHp = (newMax: number, adjustCurrent: boolean = false) => {
    const prevMax = maxHp;
    setMaxHp(newMax);
    if (adjustCurrent) {
      const ratio = newMax / prevMax;
      setCurrentHp(Math.min(newMax, Math.round(currentHp * ratio)));
    } else {
      if (currentHp > newMax) {
        setCurrentHp(newMax);
      }
    }

    // Rescale phase thresholds based on percent
    const updatedPhases = phases.map((p) => ({
      ...p,
      thresholdHp: Math.round((p.thresholdPercent / 100) * newMax),
    }));
    setPhases(updatedPhases);

    const logEntry: CombatLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      type: 'maxHpChange',
      amount: newMax,
      previousHp: currentHp,
      newHp: currentHp,
    };
    setCombatLogs((prev) => [logEntry, ...prev]);
  };

  // Reset to full HP
  const handleResetHp = () => {
    setCurrentHp(maxHp);
    setTempHp(0);
    setBloodDrops([]);
    setLegendaryResistancesUsed(0);

    const logEntry: CombatLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      type: 'reset',
      amount: maxHp,
      previousHp: currentHp,
      newHp: maxHp,
    };
    setCombatLogs((prev) => [logEntry, ...prev]);
  };

  // Select monster preset
  const handleSelectPreset = (preset: BossPreset) => {
    setBoss(preset);
    setMaxHp(preset.maxHp);
    setCurrentHp(preset.maxHp);
    setTempHp(0);
    setBloodDrops([]);
    setLegendaryResistancesUsed(0);

    const presetPhases = preset.phases && preset.phases.length > 0
      ? preset.phases
      : generateDefaultPhases(preset.maxHp, 5);
    setPhases(presetPhases);

    const logEntry: CombatLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      type: 'reset',
      amount: preset.maxHp,
      previousHp: currentHp,
      newHp: preset.maxHp,
      note: `Выбран противник: ${preset.name} (${preset.cr})`,
    };
    setCombatLogs((prev) => [logEntry, ...prev]);
  };

  // Undo last action
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const lastSnapshot = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setCurrentHp(lastSnapshot.currentHp);
    setMaxHp(lastSnapshot.maxHp);
    setTempHp(lastSnapshot.tempHp);
    setBloodDrops(lastSnapshot.bloodDrops);
    setPhases(lastSnapshot.phases);
    setCombatLogs((prev) => prev.slice(1));
  };

  const handleToggleLegendaryResistance = (index: number) => {
    if (index < legendaryResistancesUsed) {
      setLegendaryResistancesUsed((prev) => Math.max(0, prev - 1));
    } else {
      setLegendaryResistancesUsed((prev) =>
        Math.min(boss.legendaryResistances, prev + 1)
      );
    }
  };

  const activePhase = getCurrentPhase(phases, currentHp, maxHp);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-red-900 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.3)]">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel'] font-bold text-base text-amber-100 tracking-wider">
                  D&D BOSS TRACKER
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                  {boss.type || 'D&D 5e'}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-['Spectral']">
                Динамическое окно ухудшения состояния босса по фазам урона
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsPhaseConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-amber-200 transition-colors"
              title="Настроить фазы ухудшения состояния"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Фазы ({phases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPlayerViewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600/70 hover:bg-amber-900/70 text-amber-200 font-semibold transition-colors"
              title="Открыть окно показа для игроков (только внешность и имя)"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Для игроков</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: The Boss Portrait (Visual Window) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
            <BossPortrait
              boss={boss}
              currentHp={currentHp}
              maxHp={maxHp}
              tempHp={tempHp}
              activeSlashes={activeSlashes}
              recentDamageNumber={recentDamageNumber}
              isShaking={isShaking}
              legendaryResistancesUsed={legendaryResistancesUsed}
              onToggleLegendaryResistance={handleToggleLegendaryResistance}
              bloodDrops={bloodDrops}
              phases={phases}
            />

            {/* Current Phase & Boss Lore Card */}
            <div className="bg-stone-900/40 border border-stone-800/60 rounded-xl p-4 text-xs font-['Spectral'] text-stone-400 leading-relaxed flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-stone-800/60 pb-2">
                <div className="flex items-center gap-1.5 font-semibold text-stone-200 font-['Cinzel']">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Текущая фаза: <span className="text-amber-300">{activePhase.name}</span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">
                  Порог перехода: &le; {activePhase.thresholdHp} ОЗ ({activePhase.thresholdPercent}%)
                </span>
              </div>
              <p className="italic text-stone-300">
                «{activePhase.description}»
              </p>
              <p className="text-[11px] text-stone-500 pt-1">
                {boss.description}
              </p>
            </div>
          </div>

          {/* Right Column: DM Damage Controls & Combat Timeline */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-5">
            {/* 1. Damage Controls & Max HP Adjustment */}
            <DamageControls
              maxHp={maxHp}
              currentHp={currentHp}
              tempHp={tempHp}
              phases={phases}
              onApplyDamage={handleApplyDamage}
              onApplyHeal={handleApplyHeal}
              onSetTempHp={handleSetTempHp}
              onUpdateMaxHp={handleUpdateMaxHp}
              onResetHp={handleResetHp}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onOpenPlayerView={() => setIsPlayerViewOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenPhaseConfig={() => setIsPhaseConfigOpen(true)}
            />

            {/* 2. Combat Timeline / Log */}
            <CombatLog
              logs={combatLogs}
              onUndo={handleUndo}
              onClear={() => {
                setCombatLogs([]);
                setHistoryStack([]);
              }}
              canUndo={historyStack.length > 0}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <PlayerViewModal
        isOpen={isPlayerViewOpen}
        onClose={() => setIsPlayerViewOpen(false)}
        boss={boss}
        currentHp={currentHp}
        maxHp={maxHp}
        tempHp={tempHp}
        activeSlashes={activeSlashes}
        isShaking={isShaking}
        bloodDrops={bloodDrops}
        phases={phases}
      />

      <PhaseConfigModal
        isOpen={isPhaseConfigOpen}
        onClose={() => setIsPhaseConfigOpen(false)}
        phases={phases}
        maxHp={maxHp}
        onSavePhases={(updatedPhases) => setPhases(updatedPhases)}
      />

      <BossSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentBoss={boss}
        onSelectPreset={handleSelectPreset}
        onSaveBoss={(updated) => {
          setBoss(updated);
          setMaxHp(updated.maxHp);
          setCurrentHp(updated.maxHp);
          if (updated.phases && updated.phases.length > 0) {
            setPhases(updated.phases);
          } else {
            setPhases(generateDefaultPhases(updated.maxHp, 5));
          }
        }}
        onOpenPhaseConfig={() => {
          setIsSettingsOpen(false);
          setIsPhaseConfigOpen(true);
        }}
      />
    </div>
  );
}
