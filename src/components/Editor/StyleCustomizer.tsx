import React from 'react';
import { StyleConfig, PrimaryColor, TemplateId } from '../../types';
import { colorSchemes, resumeTemplates } from '../../lib/styleHelpers';
import { Layout, Palette, Type, Sliders, Image, Check, Eye } from 'lucide-react';

interface StyleCustomizerProps {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({ config, onChange }) => {
  const update = <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div id="style-customizer-section" className="space-y-6">
      {/* 1. Template Choice */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1E40AF]">
          <Layout className="w-4 h-4 text-[#2563EB]" />
          <span>Escolha o Modelo de Currículo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {resumeTemplates.map((tpl) => {
            const isSelected = config.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                id={`template-btn-${tpl.id}`}
                onClick={() => update('template', tpl.id)}
                className={`flex flex-col text-left p-3.5 rounded-3xl border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-md shadow-blue-500/10 scale-[1.02]'
                    : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFC]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <span className="text-xs font-bold text-[#0F172A]">{tpl.name}</span>
                <span className="text-[11px] text-[#2563EB] font-semibold">{tpl.tagline}</span>
                <span className="text-[10px] text-[#64748B] mt-1 line-clamp-2 leading-tight">
                  {tpl.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Scheme */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1E40AF]">
          <Palette className="w-4 h-4 text-[#2563EB]" />
          <span>Paleta de Cores de Destaque</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(colorSchemes) as PrimaryColor[]).map((colorKey) => {
            const isSelected = config.colorScheme === colorKey;
            const c = colorSchemes[colorKey];
            return (
              <button
                key={colorKey}
                type="button"
                onClick={() => update('colorScheme', colorKey)}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-inner border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs font-bold text-[#0F172A] truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Typography & Display Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Família Tipográfica</span>
          </label>
          <select
            value={config.fontFamily}
            onChange={(e) => update('fontFamily', e.target.value as any)}
            className="apple-input w-full px-3 py-2 text-xs font-bold text-[#0F172A]"
          >
            <option value="sans">Plus Jakarta Sans (Moderna & Clean)</option>
            <option value="serif">Lora (Serifada & Elegante)</option>
            <option value="display">DM Sans (Executiva)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Espaçamento do Documento</span>
          </label>
          <select
            value={config.spacing}
            onChange={(e) => update('spacing', e.target.value as any)}
            className="apple-input w-full px-3 py-2 text-xs font-bold text-[#0F172A]"
          >
            <option value="compact">Compacto (Ideal para 1 Página)</option>
            <option value="normal">Normal (Equilibrado)</option>
            <option value="spacious">Arejado (Mais Espaçoso)</option>
          </select>
        </div>
      </div>

      {/* 4. Toggles */}
      <div className="p-4 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-[#2563EB]" />
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Exibir Foto de Perfil</div>
              <div className="text-[10px] text-[#64748B]">Mostra a foto no documento A4</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.showPhoto}
            onChange={(e) => update('showPhoto', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#2563EB]" />
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Barras de Progresso de Competências</div>
              <div className="text-[10px] text-[#64748B]">Exibe barras visuais com nível de 1 a 5</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.showSkillBars}
            onChange={(e) => update('showSkillBars', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
