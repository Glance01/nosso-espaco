import React from 'react';
import { Education } from '../../types';
import { Plus, Trash2, GraduationCap, Building2 } from 'lucide-react';

interface EducationFormProps {
  educations: Education[];
  onChange: (educations: Education[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ educations, onChange }) => {
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      location: 'Maputo',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    onChange([newEdu, ...educations]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange(
      educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: string) => {
    onChange(educations.filter((edu) => edu.id !== id));
  };

  return (
    <div id="education-form-section" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Formação Académica & Cursos</h4>
          <p className="text-xs text-[#64748B]">Adicione as suas qualificações, licenciaturas ou certificados.</p>
        </div>
        <button
          type="button"
          id="btn-add-education"
          onClick={addEducation}
          className="btn-apple-warm inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-white rounded-2xl text-xs font-bold active:scale-[0.98] self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Formação
        </button>
      </div>

      {educations.length === 0 ? (
        <div className="text-center py-10 px-6 border border-[#CBD5E1] rounded-3xl bg-[#F8FAFC]">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">Nenhuma formação adicionada</p>
          <p className="text-xs text-[#64748B] mt-1 mb-4 max-w-xs mx-auto">
            Inclua o seu ensino superior, cursos técnicos profissionais ou ensino secundário.
          </p>
          <button
            type="button"
            onClick={addEducation}
            className="px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            + Adicionar Qualificação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu, index) => (
            <div
              key={edu.id}
              className="p-5 bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-3xl shadow-[0_4px_16px_rgba(30,58,138,0.03)] space-y-4 transition-all hover:border-[#93C5FD]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-[#0F172A]">
                    {edu.degree || 'Nova Formação'} {edu.institution && `• ${edu.institution}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Remover formação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Grau / Curso <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Ex: Licenciatura em Engenharia Informática"
                    className="apple-input w-full px-3.5 py-2 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Instituição de Ensino <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="Ex: Universidade Eduardo Mondlane (UEM)"
                    className="apple-input w-full px-3.5 py-2 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                    placeholder="Maputo, Nampula, Beira..."
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
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        className="apple-input w-full px-2.5 py-1.5 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Conclusão
                      </label>
                      <input
                        type="month"
                        value={edu.endDate}
                        disabled={edu.current}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        className={`apple-input w-full px-2.5 py-1.5 text-xs text-[#0F172A] ${
                          edu.current ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-1 text-xs font-medium text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    Ainda a frequentar este curso
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Detalhes / Média / Destaques
                </label>
                <textarea
                  rows={2}
                  value={edu.description}
                  onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                  placeholder="Média final, projeto de fim de curso ou distinções académicas..."
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
