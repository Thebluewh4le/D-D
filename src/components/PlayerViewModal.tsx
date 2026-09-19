import React, { useEffect, useState } from 'react';
import { BossPreset, ActiveSlashEffect, BloodDrop, DamagePhase } from '../types';
import { BossPortrait } from './BossPortrait';
import { X, Maximize, Minimize } from 'lucide-react';

interface PlayerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  boss: BossPreset;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  activeSlashes: ActiveSlashEffect[];
  isShaking: boolean;
  bloodDrops: BloodDrop[];
  phases: DamagePhase[];
}

export const PlayerViewModal: React.FC<PlayerViewModalProps> = ({
  isOpen,
  onClose,
  boss,
  currentHp,
  maxHp,
  tempHp,
  activeSlashes,
  isShaking,
  bloodDrops,
  phases,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-3 text-stone-400">
        <div className="flex items-center gap-2">
          <span className="text-xs font-['Cinzel'] font-bold text-amber-300 uppercase tracking-wider">
            Экран для игроков (Только внешний вид и имя)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-stone-900/90 border border-stone-800 hover:bg-stone-800 text-stone-300 transition-colors"
            title="Полноэкранный режим (для проектора или второго экрана)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-900/90 border border-stone-800 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Вернуться к панели мастера (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Boss Frame: Strict player view with NO numbers */}
      <div className="w-full max-w-2xl shadow-2xl">
        <BossPortrait
          boss={boss}
          currentHp={currentHp}
          maxHp={maxHp}
          tempHp={tempHp}
          activeSlashes={activeSlashes}
          recentDamageNumber={null}
          isShaking={isShaking}
          legendaryResistancesUsed={0}
          onToggleLegendaryResistance={() => {}}
          bloodDrops={bloodDrops}
          phases={phases}
          isPlayerView={true}
        />
      </div>
    </div>
  );
};
