import React, { useState } from 'react';
import { Skill } from '../../types';
import { Plus, Trash2, Sparkles, RefreshCw, Star, CheckCircle2 } from 'lucide-react';

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  jobTitle?: string;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ skills, onChange, jobTitle }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const addSkill = (name?: string) => {
    const finalName = (name || newSkillName).trim();
    if (!finalName) return;

    // Check duplicate
    if (skills.some((s) => s.name.toLowerCase() === finalName.toLowerCase())) {
      setNewSkillName('');
      return;
    }

    const newSkill: Skill = {
      id: `sk-${Date.now()}-${Math.random()}`,
      name: finalName,
      level: 4,
    };
    onChange([...skills, newSkill]);
    setNewSkillName('');
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  const setLevel = (id: string, level: number) => {
    onChange(skills.map((s) => (s.id === id ? { ...s, level } : s)));
  };

  const handleSuggestAI = async () => {
    setIsSuggesting(true);
    setAiNotice(null);
    try {
      const res = await fetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: jobTitle || 'Profissional' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.skills)) {
        const toAdd: Skill[] = data.skills
          .filter((name: string) => !skills.some((s) => s.name.toLowerCase() === name.toLowerCase()))
          .map((name: string, i: number) => ({
            id: `sk-ai-${Date.now()}-${i}`,
            name,
            level: 4,
          }));
        onChange([...skills, ...toAdd]);
        setAiNotice(`+${toAdd.length} competências de ponta adicionadas para ${jobTitle || 'a sua área'}!`);
        setTimeout(() => setAiNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
      setAiNotice('Não foi possível carregar sugestões no momento.');
      setTimeout(() => setAiNotice(null), 3000);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div id="skills-form-section" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Competências & Habilidades</h4>
          <p className="text-xs text-[#64748B]">Adicione ferramentas técnicas, software e competências interpessoais.</p>
        </div>
        <button
          type="button"
          onClick={handleSuggestAI}
          disabled={isSuggesting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 text-blue-700 border border-blue-200/80 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs hover:shadow-sm self-start sm:self-auto active:scale-[0.98]"
        >
          {isSuggesting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          )}
          {isSuggesting ? 'A pesquisar com IA...' : 'Sugerir com IA'}
        </button>
      </div>

      {isSuggesting && (
        <div className="p-2.5 bg-blue-50/90 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
          <span>A IA Gemini está a identificar as melhores competências do mercado...</span>
        </div>
      )}

      {aiNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Add Skill Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          placeholder="Ex: Gestão de Projetos, Python, Liderança, Excel Avançado..."
          className="apple-input flex-1 px-4 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
        />
        <button
          type="button"
          onClick={() => addSkill()}
          className="btn-apple-warm px-5 py-2.5 text-white rounded-2xl text-xs font-bold active:scale-[0.98]"
        >
          Adicionar
        </button>
      </div>

      {/* Skills List as Soft Apple Badges */}
      <div className="space-y-3 pt-1">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-3.5 bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition-all"
          >
            <span className="text-xs font-bold text-[#0F172A] truncate">{skill.name}</span>

            <div className="flex items-center gap-3 shrink-0">
              {/* Level Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(skill.id, lvl)}
                    className="p-0.5 transition-transform hover:scale-110"
                    title={`Nível ${lvl}/5`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        lvl <= skill.level
                          ? 'text-[#2563EB] fill-[#2563EB]'
                          : 'text-[#CBD5E1]'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                className="text-[#94A3B8] hover:text-rose-600 p-1 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
