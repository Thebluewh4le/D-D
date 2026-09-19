import React, { useState } from 'react';
import { DamageType, DamagePhase } from '../types';
import { getCurrentPhase } from '../utils/phaseUtils';
import { Swords, HeartPulse, ShieldAlert, RotateCcw, MonitorPlay, Settings, SlidersHorizontal } from 'lucide-react';

interface DamageControlsProps {
  maxHp: number;
  currentHp: number;
  tempHp: number;
  phases: DamagePhase[];
  onApplyDamage: (amount: number, type: DamageType, isCrit: boolean) => void;
  onApplyHeal: (amount: number) => void;
  onSetTempHp: (amount: number) => void;
  onUpdateMaxHp: (newMax: number, adjustCurrent: boolean) => void;
  onResetHp: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenPlayerView: () => void;
  onOpenSettings: () => void;
  onOpenPhaseConfig: () => void;
}

export const DamageControls: React.FC<DamageControlsProps> = ({
  maxHp,
  currentHp,
  tempHp,
  phases,
  onApplyDamage,
  onApplyHeal,
  onSetTempHp,
  onUpdateMaxHp,
  onResetHp,
  onOpenPlayerView,
  onOpenSettings,
  onOpenPhaseConfig,
}) => {
  // Local state for numerical inputs
  const [damageInput, setDamageInput] = useState<string>('15');
  const [isCritical, setIsCritical] = useState<boolean>(false);

  // Local state for Max HP editing
  const [editingMaxHp, setEditingMaxHp] = useState<string>(maxHp.toString());
  const [isEditingMaxHp, setIsEditingMaxHp] = useState<boolean>(false);

  const activePhase = getCurrentPhase(phases, currentHp, maxHp);

  const handleDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(damageInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onApplyDamage(amount, 'slashing', isCritical);
      setIsCritical(false);
    }
  };

  const handleHealClick = () => {
    const amount = parseInt(damageInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onApplyHeal(amount);
    }
  };

  const handleTempHpClick = () => {
    const amount = parseInt(damageInput, 10);
    if (!isNaN(amount) && amount >= 0) {
      onSetTempHp(amount);
    }
  };

  const handleSaveMaxHp = () => {
    const newMax = parseInt(editingMaxHp, 10);
    if (!isNaN(newMax) && newMax > 0) {
      onUpdateMaxHp(newMax, false);
      setIsEditingMaxHp(false);
    }
  };

  return (
    <div id="damage-control-panel" className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col gap-5 shadow-xl backdrop-blur-sm">
      {/* Top DM Toolbar */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-700/60 flex items-center justify-center text-red-400">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-stone-100 text-sm tracking-wide">
              Панель Урона & Здоровья
            </h2>
            <p className="text-[11px] text-stone-400 font-serif">
              Управление боевым состоянием босса D&D
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-phase-config"
            onClick={onOpenPhaseConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600/70 hover:bg-amber-900/70 text-amber-200 text-xs font-semibold transition-colors"
            title="Настроить количество фаз ухудшения состояния и пороги здоровья"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Фазы ({phases.length})</span>
          </button>

          <button
            type="button"
            id="btn-player-view"
            onClick={onOpenPlayerView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
            title="Открыть окно показа для игроков (только внешность и имя, без чисел)"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Для игроков</span>
          </button>

          <button
            type="button"
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-stone-800 border border-stone-700 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Выбор готового монстра или загрузка своего изображения"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-reset-hp"
            onClick={onResetHp}
            className="p-2 rounded-lg bg-stone-800 border border-stone-700 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Восстановить полное здоровье"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Phase Banner */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-serif">Текущая фаза:</span>
          <span className="text-xs font-['Cinzel'] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/50">
            {activePhase.name}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenPhaseConfig}
          className="text-[11px] text-stone-400 hover:text-amber-300 underline font-serif transition-colors"
        >
          Изменить фазы ({phases.length})
        </button>
      </div>

      {/* Section 1: Max HP Setting (Возможность указать максимальное значение здоровья) */}
      <div className="bg-stone-950/70 border border-stone-800/90 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="max-hp-input" className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-red-400" />
            Максимальное здоровье (Макс. ОЗ):
          </label>
          <span className="text-xs text-stone-500 font-mono">
            Текущее: {currentHp} / {maxHp}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              id="max-hp-input"
              type="number"
              min="1"
              max="9999"
              value={editingMaxHp}
              onChange={(e) => {
                setEditingMaxHp(e.target.value);
                setIsEditingMaxHp(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveMaxHp();
              }}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 font-mono text-base font-bold focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="button"
            id="btn-save-max-hp"
            onClick={handleSaveMaxHp}
            disabled={!isEditingMaxHp && parseInt(editingMaxHp, 10) === maxHp}
            className={`px-4 py-2 rounded-lg font-['Cinzel'] text-xs font-bold transition-all ${
              isEditingMaxHp && parseInt(editingMaxHp, 10) !== maxHp
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
            }`}
          >
            Сохранить
          </button>
        </div>

        {/* Quick Max HP Presets */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
          <span className="text-[11px] text-stone-500 font-serif mr-1">Пресеты:</span>
          {[21, 50, 93, 135, 180, 220, 300, 676].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setEditingMaxHp(preset.toString());
                onUpdateMaxHp(preset, false);
                setIsEditingMaxHp(false);
              }}
              className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors ${
                maxHp === preset
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Damage Input Window (Окно для ввода численных значений повреждений) */}
      <form onSubmit={handleDamageSubmit} className="bg-stone-950/70 border border-stone-800/90 rounded-xl p-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="damage-amount-input" className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-red-500" />
              Значение урона / исцеления:
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-400 hover:text-stone-200">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="rounded bg-stone-900 border-stone-700 text-red-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span className={isCritical ? 'text-amber-400 font-bold' : ''}>
                Крит. удар 💥
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="damage-amount-input"
                type="number"
                min="1"
                max="9999"
                value={damageInput}
                onChange={(e) => setDamageInput(e.target.value)}
                placeholder="Введите число урона..."
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-2.5 text-xl font-bold font-mono text-amber-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all placeholder:text-stone-600"
                autoFocus
              />
            </div>

            {/* Quick +/- buttons for damage amount */}
            <div className="flex items-center gap-1">
              {[5, 10, 25, 50].map((quickVal) => (
                <button
                  key={quickVal}
                  type="button"
                  onClick={() => setDamageInput(quickVal.toString())}
                  className="px-2.5 py-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 text-xs font-mono font-bold transition-colors"
                  title={`Установить урон: ${quickVal}`}
                >
                  {quickVal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Deal Damage, Heal, Temp HP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="submit"
            id="btn-deal-damage"
            className="sm:col-span-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-['Cinzel'] font-bold text-sm shadow-[0_4px_15px_rgba(185,28,28,0.4)] hover:shadow-[0_6px_20px_rgba(185,28,28,0.6)] active:scale-[0.98] transition-all"
          >
            <Swords className="w-4 h-4" />
            Нанести {damageInput || 0}
          </button>

          <button
            type="button"
            id="btn-heal"
            onClick={handleHealClick}
            className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-emerald-700/60 hover:border-emerald-500 text-emerald-400 font-['Cinzel'] font-semibold text-xs active:scale-[0.98] transition-all"
          >
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            Исцелить +{damageInput || 0}
          </button>

          <button
            type="button"
            id="btn-temp-hp"
            onClick={handleTempHpClick}
            className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-blue-700/60 hover:border-blue-500 text-blue-400 font-['Cinzel'] font-semibold text-xs active:scale-[0.98] transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            Врем. ОЗ {damageInput || 0}
          </button>
        </div>
      </form>
    </div>
  );
};
