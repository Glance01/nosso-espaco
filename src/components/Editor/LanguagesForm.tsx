import React, { useState } from 'react';
import { Language } from '../../types';
import { Plus, Trash2, Globe } from 'lucide-react';

interface LanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

const proficiencyLevels: Language['proficiency'][] = [
  'Básico',
  'Intermédio',
  'Avançado',
  'Fluente',
  'Nativo',
];

export const LanguagesForm: React.FC<LanguagesFormProps> = ({ languages, onChange }) => {
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState<Language['proficiency']>('Intermédio');

  const addLanguage = () => {
    if (!name.trim()) return;
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: name.trim(),
      proficiency,
    };
    onChange([...languages, newLang]);
    setName('');
  };

  const removeLanguage = (id: string) => {
    onChange(languages.filter((l) => l.id !== id));
  };

  return (
    <div id="languages-form-section" className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Idiomas & Nível de Domínio</h4>
          <p className="text-xs text-[#64748B]">Adicione línguas que fala (Português, Inglês, Changana, Sena, etc.).</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Português, Inglês, Changana..."
          className="apple-input flex-1 px-4 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
        />
        <select
          value={proficiency}
          onChange={(e) => setProficiency(e.target.value as Language['proficiency'])}
          className="apple-input px-3.5 py-2.5 text-xs font-semibold text-[#0F172A]"
        >
          {proficiencyLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addLanguage}
          className="btn-apple-warm px-5 py-2.5 text-white rounded-2xl text-xs font-bold active:scale-[0.98]"
        >
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className="p-3.5 bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">{lang.name}</div>
                <div className="text-[10px] font-semibold text-[#2563EB]">{lang.proficiency}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeLanguage(lang.id)}
              className="text-[#94A3B8] hover:text-rose-600 p-1 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
