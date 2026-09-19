import React, { useState } from 'react';
import { BossPreset } from '../types';
import { DEFAULT_BOSSES } from '../data/defaultBosses';
import { generateDefaultPhases } from '../utils/phaseUtils';
import { X, Upload, Check, Shield, Skull, Sparkles, Wand2 } from 'lucide-react';

interface BossSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBoss: BossPreset;
  onSelectPreset: (preset: BossPreset) => void;
  onSaveBoss: (updated: BossPreset) => void;
  onOpenPhaseConfig: () => void;
}

export const BossSettingsModal: React.FC<BossSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBoss,
  onSelectPreset,
  onSaveBoss,
  onOpenPhaseConfig,
}) => {
  const [name, setName] = useState(currentBoss.name);
  const [title, setTitle] = useState(currentBoss.title);
  const [cr, setCr] = useState(currentBoss.cr || 'CR 10');
  const [armorClass, setArmorClass] = useState(currentBoss.armorClass.toString());
  const [speed, setSpeed] = useState(currentBoss.speed);
  const [legendaryResistances, setLegendaryResistances] = useState(
    currentBoss.legendaryResistances.toString()
  );
  const [maxHp, setMaxHp] = useState(currentBoss.maxHp.toString());
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedTab, setSelectedTab] = useState<'presets' | 'custom'>('presets');
  const [selectedCrFilter, setSelectedCrFilter] = useState<'all' | 'low' | 'mid' | 'high' | 'epic'>('all');

  if (!isOpen) return null;

  const filteredPresets = DEFAULT_BOSSES.filter((preset) => {
    if (selectedCrFilter === 'all') return true;
    const hp = preset.maxHp;
    if (selectedCrFilter === 'low') return hp <= 100;
    if (selectedCrFilter === 'mid') return hp > 100 && hp <= 150;
    if (selectedCrFilter === 'high') return hp > 150 && hp <= 260;
    if (selectedCrFilter === 'epic') return hp > 260;
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHp = parseInt(maxHp, 10) || 100;
    const updated: BossPreset = {
      ...currentBoss,
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Безымянный босс',
      title: title.trim() || 'Опасное чудовище',
      cr: cr.trim() || 'CR ?',
      type: 'Особый монстр',
      maxHp: parsedHp,
      armorClass: parseInt(armorClass, 10) || 15,
      speed: speed.trim() || '30 фт.',
      legendaryResistances: parseInt(legendaryResistances, 10) || 0,
      image: customImageUrl || currentBoss.image,
      stages: customImageUrl
        ? {
            pristine: customImageUrl,
            wounded: customImageUrl,
            critical: customImageUrl,
            defeated: customImageUrl,
          }
        : currentBoss.stages,
      phases: currentBoss.phases || generateDefaultPhases(parsedHp, 5),
    };
    onSaveBoss(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-700/60 flex items-center justify-center text-red-400">
              <Skull className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] text-base sm:text-lg font-bold text-amber-100 tracking-wide">
                Выбор Противника D&D & Свой Персонаж
              </h2>
              <p className="text-xs text-stone-400 font-['Spectral']">
                10+ готовых монстров разного уровня опасности или создание своего босса
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

        {/* Tab switcher */}
        <div className="flex border-b border-stone-800 px-6 bg-stone-950/40">
          <button
            type="button"
            onClick={() => setSelectedTab('presets')}
            className={`py-3 px-4 text-xs font-['Cinzel'] font-bold border-b-2 transition-all flex items-center gap-2 ${
              selectedTab === 'presets'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Пресеты монстров ({DEFAULT_BOSSES.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('custom')}
            className={`py-3 px-4 text-xs font-['Cinzel'] font-bold border-b-2 transition-all flex items-center gap-2 ${
              selectedTab === 'custom'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Свой босс / Загрузить изображение
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-stone-700">
          {selectedTab === 'presets' ? (
            /* PRESETS GRID WITH D&D RULES STAT BLOCKS */
            <div className="flex flex-col gap-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 pb-1 border-b border-stone-800/80">
                {[
                  { id: 'all', label: `Все противники (${DEFAULT_BOSSES.length})` },
                  { id: 'low', label: 'Обычные противники' },
                  { id: 'mid', label: 'Опасные чудовища' },
                  { id: 'high', label: 'Высшие чудовища' },
                  { id: 'epic', label: 'Легендарные и Титаны' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedCrFilter(f.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedCrFilter === f.id
                        ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                        : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresets.map((preset) => {
                  const isCurrent = currentBoss.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      className={`cursor-pointer rounded-xl border overflow-hidden bg-stone-950/80 hover:bg-stone-900/90 transition-all group flex flex-col ${
                        isCurrent
                          ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
                          : 'border-stone-800 hover:border-amber-600/50'
                      }`}
                    >
                      {/* Authentic Monster Artwork (Full view without cropped heads) */}
                      <div className="relative h-48 w-full overflow-hidden bg-stone-950 flex items-center justify-center p-2">
                        <img
                          src={preset.image}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

                        {/* Monster Type and Size */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-stone-300 font-serif">
                          <span className="px-2 py-0.5 rounded bg-black/80 border border-stone-800 backdrop-blur-xs">
                            {preset.size ? `${preset.size}, ` : ''}{preset.type}
                          </span>
                        </div>
                      </div>

                      {/* Official Stat Block Info */}
                      <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-['Cinzel'] font-bold text-base text-stone-100 group-hover:text-amber-300 transition-colors">
                              {preset.name}
                            </h3>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold uppercase">
                                Выбран
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-amber-200/80 font-['Spectral'] italic mt-0.5">
                            {preset.title}
                          </p>

                          <p className="text-xs text-stone-400 font-['Spectral'] line-clamp-2 mt-1.5 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>

                        {/* Stat Block Footer: HP, Resistances, Rule Source */}
                        <div className="pt-2.5 border-t border-stone-800/80 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs text-stone-300 font-mono">
                            <span title="Хиты (Здоровье)">
                              ОЗ: <b className="text-red-400 font-bold">{preset.maxHp}</b>{' '}
                              <span className="text-stone-500 text-[10px]">({preset.hpFormula || 'к8'})</span>
                            </span>
                            <span title="Легендарные спасброски">
                              Спасброски: <b className="text-purple-300 font-bold">{preset.legendaryResistances}</b>
                            </span>
                          </div>

                          {preset.sourceRule && (
                            <div className="text-[10px] text-stone-500 italic font-serif truncate">
                              📜 {preset.sourceRule}
                            </div>
                          )}

                          <div className="text-[10px] text-amber-400/90 font-medium flex items-center justify-between pt-1 border-t border-stone-900">
                            <span>⚡ {preset.phases?.length || 5} фаз ухудшения состояния</span>
                            <span className="text-stone-400 group-hover:text-amber-300 transition-colors">Выбрать →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CUSTOM BOSS FORM */
            <form onSubmit={handleSaveCustom} className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 text-xs text-amber-200 font-['Spectral']">
                <span className="font-bold font-serif">✨ Динамическое ухудшение загруженных изображений:</span> Любое загруженное вами изображение монстра или NPC автоматически анализируется приложением. На него в реальном времени будут накладываться раны, кровотечения, рваная ткань, пробитая броня и изменение цветовых фильтров в соответствии с настроенными фазами здоровья!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif text-stone-400 mb-1">
                    Имя босса:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm font-semibold text-stone-100 focus:outline-none focus:border-amber-500"
                    placeholder="Например: Капитан пиратов Морган"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif text-stone-400 mb-1">
                    Титул / Класс:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-amber-500"
                    placeholder="Например: Владыка морей"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif text-stone-400 mb-1">
                    Максимальное здоровье (ОЗ):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxHp}
                    onChange={(e) => setMaxHp(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif text-stone-400 mb-1">
                    Легендарные сопротивления (спасброски):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={legendaryResistances}
                    onChange={(e) => setLegendaryResistances(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Upload image */}
              <div className="pt-2 border-t border-stone-800">
                <label className="block text-xs font-serif text-stone-400 mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Загрузить изображение персонажа (JPG / PNG):
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-stone-700 hover:border-amber-500 bg-stone-950 text-xs font-serif text-stone-300 hover:text-amber-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Выберите файл с вашего устройства...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {customImageUrl && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-amber-500 shrink-0">
                      <img
                        src={customImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={onOpenPhaseConfig}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-serif"
                >
                  ⚙️ Настроить фазы для этого босса
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-['Cinzel'] font-bold shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    Создать и применить
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
