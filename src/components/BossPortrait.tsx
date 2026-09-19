import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BossPreset, ActiveSlashEffect, BloodDrop, DamagePhase } from '../types';
import { getCurrentPhase } from '../utils/phaseUtils';
import { Shield, Skull, Heart, Flame, Sparkles, Droplet, AlertTriangle, Swords } from 'lucide-react';

interface BossPortraitProps {
  boss: BossPreset;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  activeSlashes: ActiveSlashEffect[];
  recentDamageNumber: { amount: number; color: string; id: number; damageType: string } | null;
  isShaking: boolean;
  legendaryResistancesUsed: number;
  onToggleLegendaryResistance: (index: number) => void;
  bloodDrops: BloodDrop[];
  phases: DamagePhase[];
  isPlayerView?: boolean;
}

export const BossPortrait: React.FC<BossPortraitProps> = ({
  boss,
  currentHp,
  maxHp,
  tempHp,
  activeSlashes,
  recentDamageNumber,
  isShaking,
  legendaryResistancesUsed,
  onToggleLegendaryResistance,
  bloodDrops,
  phases,
  isPlayerView = false,
}) => {
  const hpPercent = maxHp > 0 ? Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100))) : 0;
  const isDefeated = currentHp <= 0;

  // Active Phase calculation
  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases, currentHp, maxHp);
  }, [phases, currentHp, maxHp]);

  // Determine stage image:
  // 1. If current phase has a specific custom image, use that.
  // 2. Else if boss has multi-stage images (like Malakor), pick stage image based on HP percent.
  // 3. Otherwise use the base uploaded/preset image (and apply dynamic deterioration over it).
  const currentDisplayImage = useMemo(() => {
    if (currentPhase.customImage) {
      return currentPhase.customImage;
    }
    if (boss.stages) {
      if (isDefeated && boss.stages.defeated) {
        return boss.stages.defeated;
      }
      if (hpPercent <= 45 && boss.stages.critical) {
        return boss.stages.critical;
      }
      if (hpPercent <= 75 && boss.stages.wounded) {
        return boss.stages.wounded;
      }
      if (boss.stages.pristine) {
        return boss.stages.pristine;
      }
    }
    return boss.image;
  }, [currentPhase.customImage, boss.stages, boss.image, isDefeated, hpPercent]);

  // Calculate damage intensity (0 to 1) for procedural filters and overlay
  const damageIntensity = Math.max(0, (100 - hpPercent) / 100);
  const bloodIntensity = currentPhase.bloodIntensity || damageIntensity;
  const tearIntensity = currentPhase.tearIntensity || damageIntensity * 0.8;
  const slashesCount = currentPhase.slashesCount || Math.round(damageIntensity * 6);

  return (
    <div
      id="boss-portrait-card"
      className={`relative w-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl flex flex-col ${
        isShaking ? 'animate-[wiggle_0.3s_ease-in-out]' : ''
      }`}
    >
        {/* Top Banner with Name & Status */}
        <div className="relative z-20 flex items-center justify-between px-5 py-3.5 bg-gradient-to-b from-stone-900/95 via-stone-900/80 to-transparent backdrop-blur-md border-b border-stone-800/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Cinzel'] text-xl md:text-2xl font-bold tracking-wide text-amber-100 drop-shadow-md">
                {boss.name}
              </h1>
              {/* Phase badge (Only in DM view) */}
              {!isPlayerView && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    isDefeated
                      ? 'bg-stone-900/90 text-stone-400 border-stone-700'
                      : currentPhase.vignettePulse
                      ? 'bg-red-950/90 text-red-400 border-red-600 animate-pulse'
                      : hpPercent <= 50
                      ? 'bg-amber-950/90 text-amber-300 border-amber-600'
                      : 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                  }`}
                >
                  {currentPhase.name}
                </span>
              )}
            </div>

            {/* Subtitle / Title */}
            <p className="text-xs text-stone-400 font-['Spectral'] italic mt-0.5">
              {boss.title}
            </p>
          </div>

          {/* Type / Size tag without AC or CR (Only in DM view) */}
          {!isPlayerView && (
            <div className="text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 border border-stone-700/60 text-stone-300 font-serif">
                {boss.size ? `${boss.size}, ` : ''}{boss.type}
              </span>
            </div>
          )}
        </div>

        {/* Main Boss Visual Frame (Full height visible, no cut off head) */}
        <div className="relative w-full h-[520px] sm:h-[620px] md:h-[680px] overflow-hidden bg-stone-950 flex items-center justify-center p-3 sm:p-5">
          {/* Ambient blurred backdrop for atmospheric depth without cropping */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <img
              src={currentDisplayImage}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover blur-3xl scale-125 opacity-25 saturate-150"
            />
            <div className="absolute inset-0 bg-stone-950/60" />
          </div>

          {/* Dynamic Boss Image with Crossfade and Dynamic Pose Shift */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentDisplayImage}
              src={currentDisplayImage}
              alt={boss.name}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-bottom select-none transition-all duration-700 drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
              style={{
                transform: isDefeated
                  ? 'translateY(55px) rotate(-80deg) scale(0.82)'
                  : hpPercent <= 20
                  ? 'translateY(22px) rotate(-3.5deg) scale(0.95)'
                  : hpPercent <= 50
                  ? 'translateY(12px) rotate(-1.5deg) scale(0.98)'
                  : hpPercent <= 75
                  ? 'translateY(4px)'
                  : 'translateY(0)',
                transformOrigin: 'bottom center',
                filter: isDefeated
                  ? 'grayscale(1) contrast(1.15) brightness(0.6)'
                  : `sepia(${currentPhase.redTint * 0.4}) saturate(${
                      1 - currentPhase.desaturation * 0.5 + currentPhase.redTint * 0.2
                    }) contrast(${1 + damageIntensity * 0.25}) brightness(${
                      1 - currentPhase.darkness * 0.35
                    })`,
              }}
            />
          </AnimatePresence>

          {/* Dynamic Procedural Deterioration Layer (Cracked armor, facial wounds, bleeding) */}
          {!isDefeated && (damageIntensity > 0.05 || bloodIntensity > 0.05 || tearIntensity > 0.05) && (
            <div
              className="absolute inset-0 pointer-events-none z-15 mix-blend-multiply opacity-95 transition-opacity duration-500"
            >
              <svg className="w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="bloodGlow">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="bloodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#880808" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#380000" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="armorCrackGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f0d0c" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#292524" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* 1. Broken Armor & Plate Fissures (Armor deterioration) */}
                {tearIntensity > 0.2 && (
                  <g opacity={Math.min(1, tearIntensity * 1.2)}>
                    {/* Spiderweb armor fracture across chest/shoulder */}
                    <path
                      d="M 180,210 L 210,240 L 205,270 L 235,310 M 210,240 L 250,230 M 205,270 L 175,295"
                      stroke="url(#armorCrackGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M 181,211 L 211,241 L 206,271 L 236,311"
                      stroke="#44403c"
                      strokeWidth="1"
                      fill="none"
                    />
                  </g>
                )}
                {tearIntensity > 0.5 && (
                  <g opacity={Math.min(1, tearIntensity)}>
                    {/* Secondary armor breach */}
                    <path
                      d="M 140,260 L 165,280 L 155,320 L 130,340 M 165,280 L 195,290"
                      stroke="url(#armorCrackGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Chipped armor shard highlight */}
                    <polygon points="163,278 172,284 167,290 158,284" fill="#1c1917" stroke="#78716c" strokeWidth="0.8" />
                  </g>
                )}

                {/* 2. Facial Trauma & Agony Expression Shading */}
                {damageIntensity > 0.3 && (
                  <g opacity={Math.min(0.85, (damageIntensity - 0.2) * 1.5)}>
                    {/* Dark bruised brow/eye shadow */}
                    <ellipse cx="185" cy="120" rx="16" ry="8" fill="#1f0303" opacity="0.65" filter="url(#bloodGlow)" />
                    {/* Scar slash across eye / cheek */}
                    <path
                      d="M 175,105 Q 183,122 190,138"
                      stroke="url(#bloodGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      filter="url(#bloodGlow)"
                      fill="none"
                    />
                  </g>
                )}
                {damageIntensity > 0.6 && (
                  <g opacity={Math.min(0.9, (damageIntensity - 0.5) * 2)}>
                    {/* Clenched jaw / mouth blood drip */}
                    <path
                      d="M 195,148 Q 200,165 198,185"
                      stroke="url(#bloodGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      filter="url(#bloodGlow)"
                      fill="none"
                    />
                  </g>
                )}

                {/* 3. Slashed Wounds and Scars (Scales with slashesCount) */}
              {slashesCount >= 1 && (
                <path
                  d="M 60,110 Q 140,140 210,180"
                  stroke="url(#bloodGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 2 && (
                <path
                  d="M 290,120 Q 230,190 180,260"
                  stroke="url(#bloodGrad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 3 && (
                <path
                  d="M 80,220 Q 180,240 290,230"
                  stroke="#5a0000"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 4 && (
                <path
                  d="M 110,290 Q 210,320 310,310"
                  stroke="url(#bloodGrad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 5 && (
                <path
                  d="M 150,70 Q 135,210 165,370"
                  stroke="#3b0000"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 6 && (
                <path
                  d="M 70,170 Q 200,200 330,220"
                  stroke="#7a0909"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 7 && (
                <path
                  d="M 130,130 Q 190,160 250,150"
                  stroke="#4a0000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 8 && (
                <path
                  d="M 100,340 Q 200,360 290,380"
                  stroke="url(#bloodGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 9 && (
                <path
                  d="M 240,160 Q 270,240 310,320"
                  stroke="#6b0303"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter="url(#bloodGlow)"
                  fill="none"
                />
              )}
              {slashesCount >= 10 && (
                <g filter="url(#bloodGlow)">
                  <path d="M 160,200 L 240,280" stroke="#880808" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 240,200 L 160,280" stroke="#880808" strokeWidth="5" strokeLinecap="round" />
                </g>
              )}

              {/* 2. Torn Clothing & Shredded Armor Jagged Overlays */}
              {tearIntensity > 0.2 && (
                <g opacity={Math.min(0.85, tearIntensity)}>
                  {/* Slashed armor tear fissure left */}
                  <path
                    d="M 50,250 L 75,270 L 65,300 L 90,320 L 70,350"
                    stroke="#1a0000"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  {/* Slashed armor tear fissure right */}
                  <path
                    d="M 330,220 L 305,250 L 320,280 L 295,310"
                    stroke="#1a0000"
                    strokeWidth="3.5"
                    fill="none"
                  />
                </g>
              )}
              {tearIntensity > 0.4 && (
                <g opacity={tearIntensity}>
                  {/* Impact fracture lines */}
                  <path
                    d="M 190,220 L 210,195 M 190,220 L 165,235 M 190,220 L 215,245 M 190,220 L 175,200"
                    stroke="#220000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>
              )}
              {tearIntensity > 0.5 && (
                <g opacity={tearIntensity}>
                  <polygon
                    points="180,290 220,310 210,340 170,330"
                    fill="#150000"
                    opacity="0.5"
                  />
                  <path
                    d="M 180,290 L 195,320 L 220,310 L 190,340"
                    stroke="#450a0a"
                    strokeWidth="3"
                    fill="none"
                  />
                </g>
              )}

              {/* 3. Blood Drops and Drips (Scaled with bloodIntensity) */}
              {bloodDrops.slice(0, Math.round(bloodDrops.length * Math.max(0.3, bloodIntensity))).map((drop) => (
                <g key={drop.id}>
                  <circle
                    cx={drop.x}
                    cy={drop.y}
                    r={drop.size * (0.8 + bloodIntensity * 0.4)}
                    fill="#6d0505"
                    opacity={drop.opacity}
                  />
                  <path
                    d={`M ${drop.x},${drop.y} Q ${drop.x + (drop.size > 5 ? 2 : -2)},${drop.y + drop.length / 2} ${drop.x},${drop.y + drop.length}`}
                    stroke="#480000"
                    strokeWidth={drop.size * 0.7}
                    strokeLinecap="round"
                    opacity={drop.opacity * 0.9}
                  />
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Dynamic animated weapon slash line across the frame on hit */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
          {activeSlashes.map((slash) => (
            <motion.line
              key={slash.id}
              x1={`${slash.x1}%`}
              y1={`${slash.y1}%`}
              x2={`${slash.x2}%`}
              y2={`${slash.y2}%`}
              stroke={slash.color}
              strokeWidth={slash.width}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          ))}
        </svg>

        {/* Floating Recent Damage Hit Number: ONLY visible in DM mode! In Player View, STRICTLY HIDDEN */}
        {!isPlayerView && (
          <AnimatePresence>
            {recentDamageNumber && (
              <motion.div
                key={recentDamageNumber.id}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1.3, y: -40 }}
                exit={{ opacity: 0, scale: 0.8, y: -80 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
              >
                <span
                  className="font-['Cinzel'] text-4xl sm:text-6xl font-black drop-shadow-[0_8px_16px_rgba(0,0,0,1)] tracking-tight text-white"
                  style={{
                    color: recentDamageNumber.color || '#ef4444',
                    textShadow: `0 0 20px ${recentDamageNumber.color}, 0 4px 10px rgba(0,0,0,0.9)`,
                  }}
                >
                  -{recentDamageNumber.amount}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/80 text-stone-200 border border-stone-700 tracking-wider uppercase font-mono">
                  {recentDamageNumber.damageType}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Heartbeat / Critical blood vignette effect */}
        {(currentPhase.vignettePulse || (hpPercent <= 20 && !isDefeated)) && (
          <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_90px_rgba(180,10,10,0.7)] animate-pulse" />
        )}

        {/* Phase / Condition Banner in portrait corner */}
        {hpPercent <= 50 && !isDefeated && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-950/90 border border-red-700 text-red-200 shadow-xl backdrop-blur-sm text-xs font-bold font-['Cinzel'] tracking-wider">
            <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            {currentPhase.name}
          </div>
        )}

        {/* Slain Banner if defeated */}
        {isDefeated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px] p-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-950/90 border-2 border-red-600 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <Skull className="w-9 h-9 text-red-400" />
            </div>
            <h2 className="font-['Cinzel_Decorative'] text-3xl sm:text-4xl font-bold tracking-widest text-red-500 drop-shadow-lg mb-2">
              БОСС ПОВЕРЖЕН
            </h2>
            <p className="text-sm text-stone-300 font-['Spectral'] italic max-w-sm">
              Победа искателей приключений! Противник пал в бою.
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom Health Bar & Condition Section */}
      <div className="relative z-20 p-5 bg-stone-950 border-t border-stone-800 flex flex-col gap-3.5">
        {/* D&D 5-Stage Condition Progression Rail (Only in DM View) */}
        {!isPlayerView && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-stone-400">
              <span className="flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-amber-500" />
                Состояние монстра (D&D):
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  isDefeated
                    ? 'text-stone-400 bg-stone-900 border border-stone-800'
                    : hpPercent <= 20
                    ? 'text-red-400 bg-red-950/80 border border-red-700 animate-pulse'
                    : hpPercent <= 50
                    ? 'text-amber-300 bg-amber-950/80 border border-amber-600'
                    : hpPercent <= 75
                    ? 'text-yellow-300 bg-yellow-950/80 border border-yellow-700'
                    : 'text-emerald-300 bg-emerald-950/80 border border-emerald-700'
                }`}
              >
                {currentPhase.name}
              </span>
            </div>

            {/* Graphical Rail with 5 canonical D&D stages */}
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { label: 'Невредим', minHp: 76, color: 'bg-emerald-500', active: hpPercent > 75, icon: '🛡️' },
                { label: 'Ранен', minHp: 51, color: 'bg-yellow-500', active: hpPercent <= 75 && hpPercent > 50, icon: '⚔️' },
                { label: 'Окровавлен', minHp: 21, color: 'bg-orange-500', active: hpPercent <= 50 && hpPercent > 20, icon: '🩸', isBloodied: true },
                { label: 'При смерти', minHp: 1, color: 'bg-red-600', active: hpPercent <= 20 && hpPercent > 0, icon: '⚠️' },
                { label: 'Повержен', minHp: 0, color: 'bg-stone-600', active: isDefeated, icon: '💀' },
              ].map((st, idx) => (
                <div
                  key={idx}
                  className={`py-1.5 px-1 rounded-md border text-[10px] sm:text-xs flex flex-col items-center gap-0.5 transition-all duration-300 ${
                    st.active
                      ? 'bg-stone-900 border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)] font-bold scale-[1.02]'
                      : (idx === 0 && hpPercent <= 75) ||
                        (idx === 1 && hpPercent <= 50) ||
                        (idx === 2 && hpPercent <= 20) ||
                        (idx === 3 && isDefeated)
                      ? 'bg-stone-950/50 border-stone-800 text-stone-600 line-through opacity-60'
                      : 'bg-stone-950 border-stone-800/80 text-stone-500 opacity-80'
                  }`}
                >
                  <span className="text-xs">{st.icon}</span>
                  <span className="truncate w-full">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Narrative Description Box: Gives the party vivid sensory feedback of the damage */}
        <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800/80 shadow-inner">
          <p className="text-xs sm:text-sm text-stone-300 font-['Spectral'] italic leading-relaxed">
            «{currentPhase.description}»
          </p>
        </div>

        {isPlayerView ? (
          /* PLAYER VIEW: Visual Vitality Fluid Bar (Zero numbers) */
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-stone-400 font-serif">
              <span>Жизненная сила противника:</span>
              <span className="text-amber-400/90 italic font-['Spectral']">
                {isDefeated
                  ? 'Жизнь покинула тело'
                  : hpPercent <= 20
                  ? 'На последнем издыхании'
                  : hpPercent <= 50
                  ? 'Тяжело ранен и истекает кровью'
                  : hpPercent <= 75
                  ? 'Полон ярости и боевого духа'
                  : 'В полной боевой готовности'}
              </span>
            </div>

            {/* Glowing Vitality Fluid Tube (NO NUMBERS) */}
            <div className="relative w-full h-4 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5 shadow-inner">
              {/* Threshold markers */}
              <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-white/10 z-10" />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500/30 z-10" title="Порог: Окровавлен (50%)" />
              <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-white/10 z-10" />

              <motion.div
                className={`h-full rounded-full transition-all duration-700 relative ${
                  isDefeated
                    ? 'bg-stone-700'
                    : hpPercent <= 20
                    ? 'bg-gradient-to-r from-red-800 via-red-600 to-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.8)]'
                    : hpPercent <= 50
                    ? 'bg-gradient-to-r from-red-800 via-amber-600 to-orange-500'
                    : hpPercent <= 75
                    ? 'bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        ) : (
          /* DM VIEW: Full stats, exact numbers, numerical HP bar, Legendary resistances */
          <>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-2">
                <Heart className={`w-5 h-5 ${isDefeated ? 'text-stone-500' : hpPercent <= 20 ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
                <span className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
                  {currentHp}
                </span>
                <span className="text-stone-500 text-lg font-mono">/ {maxHp} ОЗ</span>
                {tempHp > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/60 text-blue-300 font-bold ml-1">
                    +{tempHp} врем.
                  </span>
                )}
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-stone-400">
                  <b className="text-amber-300">{hpPercent}%</b> остаток ОЗ
                </div>
              </div>
            </div>

            {/* Health Bar with thresholds */}
            <div className="relative w-full h-5 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5 shadow-inner">
              {phases.map((ph, i) => {
                if (ph.thresholdPercent <= 0 || ph.thresholdPercent >= 100) return null;
                return (
                  <div
                    key={ph.id || i}
                    className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                    style={{ left: `${ph.thresholdPercent}%` }}
                    title={`Порог фазы: ${ph.name} (${ph.thresholdHp} ОЗ)`}
                  />
                );
              })}

              <motion.div
                className={`h-full rounded-full transition-all duration-500 relative ${
                  isDefeated
                    ? 'bg-stone-700'
                    : hpPercent <= 20
                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-rose-700 shadow-[0_0_15px_rgba(220,38,38,0.7)]'
                    : hpPercent <= 50
                    ? 'bg-gradient-to-r from-amber-700 via-red-600 to-red-500'
                    : hpPercent <= 75
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />

              {tempHp > 0 && maxHp > 0 && (
                <div
                  className="absolute top-0.5 bottom-0.5 left-0 rounded-full bg-blue-500/40 border-r-2 border-blue-400 pointer-events-none"
                  style={{
                    width: `${Math.min(100, hpPercent + (tempHp / maxHp) * 100)}%`,
                  }}
                />
              )}
            </div>

            {/* Legendary Resistances */}
            {boss.legendaryResistances > 0 && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-800/80">
                <span className="text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Легендарные сопротивления:
                </span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: boss.legendaryResistances }).map((_, i) => {
                    const isUsed = i < legendaryResistancesUsed;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onToggleLegendaryResistance(i)}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                          isUsed
                            ? 'bg-stone-900 border-stone-800 text-stone-600'
                            : 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] hover:scale-105'
                        }`}
                        title={isUsed ? 'Потрачено' : 'Активно'}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
