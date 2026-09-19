import React, { useState } from 'react';
import { DamagePhase } from '../types';
import { generateDefaultPhases } from '../utils/phaseUtils';
import { X, Sliders, Plus, Trash2, Check, Sparkles, Droplets, Scissors, ShieldAlert, Upload } from 'lucide-react';

interface PhaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  phases: DamagePhase[];
  maxHp: number;
  onSavePhases: (updatedPhases: DamagePhase[]) => void;
}

export const PhaseConfigModal: React.FC<PhaseConfigModalProps> = ({
  isOpen,
  onClose,
  phases,
  maxHp,
  onSavePhases,
}) => {
  const [localPhases, setLocalPhases] = useState<DamagePhase[]>(() => {
    return phases && phases.length > 0 ? phases : generateDefaultPhases(maxHp, 5);
  });

  if (!isOpen) return null;

  const handleSetPhaseCount = (count: number) => {
    const newPhases = generateDefaultPhases(maxHp, count);
    setLocalPhases(newPhases);
  };

  const handleUpdatePhase = (index: number, field: keyof DamagePhase, value: any) => {
    setLocalPhases((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };
      
      // If HP was updated, update percent, and vice versa
      if (field === 'thresholdHp') {
        const hpVal = Math.max(0, Math.min(maxHp, Number(value)));
        target.thresholdHp = hpVal;
        target.thresholdPercent = maxHp > 0 ? Math.round((hpVal / maxHp) * 100) : 0;
      } else if (field === 'thresholdPercent') {
        const pctVal = Math.max(0, Math.min(100, Number(value)));
        target.thresholdPercent = pctVal;
        target.thresholdHp = Math.round((pctVal / 100) * maxHp);
      }

      copy[index] = target;
      return copy;
    });
  };

  const handleAddPhase = () => {
    if (localPhases.length >= 8) return;
    const newId = `p-${Date.now()}`;
    const defaultNew: DamagePhase = {
      id: newId,
      name: `Фаза ${localPhases.length + 1}`,
      thresholdHp: Math.round(maxHp * 0.3),
      thresholdPercent: 30,
      description: 'Промежуточное состояние повреждений.',
      bloodIntensity: 0.5,
      slashesCount: 3,
      tearIntensity: 0.4,
      desaturation: 0.1,
      redTint: 0.1,
      darkness: 0.1,
      vignettePulse: false,
    };
    // Insert before the last phase (which is usually Defeated / 0 HP)
    const updated = [...localPhases];
    updated.splice(updated.length - 1, 0, defaultNew);
    setLocalPhases(updated);
  };

  const handleRemovePhase = (index: number) => {
    if (localPhases.length <= 2) return; // Keep at least 2 phases
    setLocalPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhaseImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdatePhase(index, 'customImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Sort phases in descending order of thresholdHp, with 0 HP at the end
    const sorted = [...localPhases].sort((a, b) => b.thresholdHp - a.thresholdHp);
    onSavePhases(sorted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-600/60 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] text-base sm:text-lg font-bold text-amber-100 tracking-wide">
                Настройка Фаз Ухудшения Здоровья
              </h2>
              <p className="text-xs text-stone-400 font-['Spectral']">
                Количество стадий и пороги ОЗ для перехода на следующий этап урона
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-stone-700">
          {/* Quick preset selector for phase count */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-serif text-stone-300 font-semibold block">
                Количество фаз (быстрый шаблон):
              </span>
              <span className="text-[11px] text-stone-500">
                Автоматически распределяет пороги урона от максимума ({maxHp} ОЗ) до 0 ОЗ
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleSetPhaseCount(count)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    localPhases.length === count
                      ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  {count} {count === 2 || count === 3 || count === 4 ? 'фазы' : 'фаз'}
                </button>
              ))}
            </div>
          </div>

          {/* List of Phases */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-['Cinzel'] font-bold text-amber-300 tracking-wider uppercase">
                Конфигурация фаз ({localPhases.length})
              </h3>
              <button
                type="button"
                onClick={handleAddPhase}
                disabled={localPhases.length >= 8}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-stone-300 hover:text-white transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                Добавить фазу
              </button>
            </div>

            {localPhases.map((phase, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === localPhases.length - 1;

              return (
                <div
                  key={phase.id || idx}
                  className="bg-stone-950/60 border border-stone-800/90 rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-stone-700"
                >
                  {/* Phase header: Name + Threshold input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Index badge */}
                    <div className="sm:col-span-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-mono text-amber-300 font-bold">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Phase Name Input */}
                    <div className="sm:col-span-5">
                      <label className="text-[10px] text-stone-400 font-serif block mb-0.5">
                        Название фазы состояния:
                      </label>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => handleUpdatePhase(idx, 'name', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Health threshold input (HP & %) */}
                    <div className="sm:col-span-5 flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-stone-400 font-serif block mb-0.5">
                          Порог ОЗ для фазы:
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={maxHp}
                            value={phase.thresholdHp}
                            onChange={(e) => handleUpdatePhase(idx, 'thresholdHp', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-[11px] text-stone-500 font-mono">ОЗ</span>
                        </div>
                      </div>

                      <div className="w-20">
                        <label className="text-[10px] text-stone-400 font-serif block mb-0.5">
                          Процент:
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={phase.thresholdPercent}
                            onChange={(e) => handleUpdatePhase(idx, 'thresholdPercent', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-1.5 py-1 text-xs font-mono text-stone-300 focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-[11px] text-stone-500 font-mono">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button (if not first and not last) */}
                    <div className="sm:col-span-1 flex justify-end">
                      {!isFirst && !isLast && localPhases.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhase(idx)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-900 transition-colors"
                          title="Удалить фазу"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual parameters of this phase */}
                  <div className="pt-2 border-t border-stone-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Blood Intensity */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-red-400" />
                          Кровотечение:
                        </span>
                        <span className="font-mono text-stone-300">{Math.round(phase.bloodIntensity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={phase.bloodIntensity}
                        onChange={(e) => handleUpdatePhase(idx, 'bloodIntensity', parseFloat(e.target.value))}
                        className="w-full accent-red-600 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Torn clothing & armor damage */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-amber-400" />
                          Рваная одежда / броня:
                        </span>
                        <span className="font-mono text-stone-300">{Math.round(phase.tearIntensity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={phase.tearIntensity}
                        onChange={(e) => handleUpdatePhase(idx, 'tearIntensity', parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Slashes count */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-stone-400" />
                          Шрамы и рассечения:
                        </span>
                        <span className="font-mono text-stone-300">{phase.slashesCount} шт.</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        step="1"
                        value={phase.slashesCount}
                        onChange={(e) => handleUpdatePhase(idx, 'slashesCount', parseInt(e.target.value, 10))}
                        className="w-full accent-stone-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Optional Custom Image for this Phase */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] text-stone-400 hover:text-stone-200 transition-colors">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>{phase.customImage ? 'Заменить арт фазы' : 'Загрузить отдельный арт для фазы (опционально)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhaseImageUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                      {phase.customImage && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          ✓ Свой арт прикреплен
                        </span>
                      )}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-400 hover:text-stone-200">
                      <input
                        type="checkbox"
                        checked={phase.vignettePulse}
                        onChange={(e) => handleUpdatePhase(idx, 'vignettePulse', e.target.checked)}
                        className="rounded bg-stone-900 border-stone-700 text-red-600 focus:ring-0 w-3 h-3"
                      />
                      <span>Пульсирующая кровавая виньетка</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-['Cinzel'] font-bold shadow-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Применить фазы
          </button>
        </div>
      </div>
    </div>
  );
};
