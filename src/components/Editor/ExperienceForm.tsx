import React from 'react';
import { Experience } from '../../types';
import { Plus, Trash2, Briefcase, Calendar, MapPin, Building, Sparkles } from 'lucide-react';

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ experiences, onChange }) => {
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      location: 'Maputo, Moçambique',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    onChange([newExp, ...experiences]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <div id="experience-form-section" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Experiência Profissional</h4>
          <p className="text-xs text-[#64748B]">Adicione os seus empregos anteriores, cargos e realizações.</p>
        </div>
        <button
          type="button"
          id="btn-add-experience"
          onClick={addExperience}
          className="btn-apple-warm inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-white rounded-2xl text-xs font-bold active:scale-[0.98] self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Cargo
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-10 px-6 border border-[#CBD5E1] rounded-3xl bg-[#F8FAFC]">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">Nenhuma experiência adicionada</p>
          <p className="text-xs text-[#64748B] mt-1 mb-4 max-w-xs mx-auto">
            Destaque os seus empregos, estágios ou projetos freelance para enriquecer o currículo.
          </p>
          <button
            type="button"
            onClick={addExperience}
            className="px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            + Adicionar Primeiro Cargo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className="p-5 bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-3xl shadow-[0_4px_16px_rgba(30,58,138,0.03)] space-y-4 transition-all hover:border-[#93C5FD]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-[#0F172A]">
                    {exp.role || 'Novo Cargo'} {exp.company && `• ${exp.company}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeExperience(exp.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Remover experiência"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Cargo / Função <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    placeholder="Ex: Gestor de Operações"
                    className="apple-input w-full px-3.5 py-2 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Empresa / Organização <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Ex: Cervejas de Moçambique (CDM)"
                    className="apple-input w-full px-3.5 py-2 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    placeholder="Maputo, Matola, Beira..."
                    className="apple-input w-full px-3.5 py-2 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Início
                      </label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="apple-input w-full px-2.5 py-1.5 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Fim
                      </label>
                      <input
                        type="month"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className={`apple-input w-full px-2.5 py-1.5 text-xs text-[#0F172A] ${
                          exp.current ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-1 text-xs font-medium text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    Trabalho atualmente nesta empresa
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Responsabilidades & Conquistas
                </label>
                <textarea
                  rows={3}
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  placeholder="• Liderou equipa de 8 pessoas aumentando eficiência em 25%&#10;• Responsável pela implementação de novos processos..."
                  className="apple-input w-full p-3 text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
