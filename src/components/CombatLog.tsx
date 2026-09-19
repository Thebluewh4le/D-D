import React from 'react';
import { CombatLogEntry } from '../types';
import { DAMAGE_TYPES } from '../data/defaultBosses';
import { Scroll, Undo2, Trash2 } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

export const CombatLog: React.FC<CombatLogProps> = ({
  logs,
  onUndo,
  onClear,
  canUndo,
}) => {
  return (
    <div id="combat-log-panel" className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-['Cinzel'] font-bold text-xs text-stone-200 tracking-wide">
              Летопись Боя (Журнал Урона)
            </h3>
            <span className="text-[11px] text-stone-500 font-serif">
              {logs.length} {logs.length === 1 ? 'запись' : 'записей'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-undo-action"
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-serif transition-colors ${
              canUndo
                ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white'
                : 'bg-stone-900/50 border-stone-800/50 text-stone-600 cursor-not-allowed'
            }`}
            title="Отменить последнее действие урона/исцеления"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Отмена</span>
          </button>

          <button
            type="button"
            id="btn-clear-log"
            onClick={onClear}
            disabled={logs.length === 0}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              logs.length > 0
                ? 'bg-stone-800 border-stone-700 text-stone-400 hover:text-red-400 hover:bg-stone-700'
                : 'bg-stone-900/50 border-stone-800/50 text-stone-600 cursor-not-allowed'
            }`}
            title="Очистить журнал боя"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Entries List */}
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500 font-['Spectral'] italic">
            Битва ещё не началась. Введите урон, чтобы зафиксировать первый удар!
          </div>
        ) : (
          logs.map((log) => {
            const typeInfo = log.damageType
              ? DAMAGE_TYPES.find((t) => t.id === log.damageType)
              : null;

            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500">{log.timestamp}</span>

                  {log.type === 'damage' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{typeInfo?.icon || '⚔️'}</span>
                      <span className="font-bold text-red-400">-{log.amount}</span>
                      <span className="text-stone-400 text-[11px] font-serif">
                        ({typeInfo?.nameRu || 'урон'})
                      </span>
                    </div>
                  )}

                  {log.type === 'heal' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">💚</span>
                      <span className="font-bold text-emerald-400">+{log.amount}</span>
                      <span className="text-stone-400 text-[11px] font-serif">(исцеление)</span>
                    </div>
                  )}

                  {log.type === 'tempHp' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🛡️</span>
                      <span className="font-bold text-blue-400">+{log.amount}</span>
                      <span className="text-stone-400 text-[11px] font-serif">(врем. ОЗ)</span>
                    </div>
                  )}

                  {log.type === 'reset' && (
                    <span className="text-amber-300 font-serif">Сброс здоровья до максимума</span>
                  )}

                  {log.type === 'maxHpChange' && (
                    <span className="text-stone-300 font-serif">
                      Макс. ОЗ изменено на {log.amount}
                    </span>
                  )}

                  {log.isBloodiedTrigger && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-600 text-amber-300 text-[10px] font-sans font-bold">
                      Окровавлен!
                    </span>
                  )}

                  {log.isDefeatedTrigger && (
                    <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-600 text-red-300 text-[10px] font-sans font-bold">
                      Повержен!
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  {log.newHp} ОЗ
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
