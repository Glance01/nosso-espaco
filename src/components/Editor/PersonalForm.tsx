import React, { useState } from 'react';
import { PersonalInfo } from '../../types';
import { Sparkles, User, Mail, Phone, MapPin, Globe, Linkedin, Github, Upload, Camera, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PersonalFormProps {
  data: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
  skills: string[];
}

export const PersonalForm: React.FC<PersonalFormProps> = ({ data, onChange, skills }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('A foto deve ter menos de 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateField('photoUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceWithAI = async () => {
    setIsEnhancing(true);
    setAiNotice(null);
    try {
      const res = await fetch('/api/ai/enhance-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSummary: data.summary,
          jobTitle: data.jobTitle,
          skills,
        }),
      });
      const result = await res.json();
      if (result.success && result.summary) {
        updateField('summary', result.summary);
        setAiNotice('Resumo aprimorado com sucesso pelo modelo inteligente!');
        setTimeout(() => setAiNotice(null), 4000);
      } else {
        setAiNotice('Não foi possível conectar à IA. Tente novamente.');
      }
    } catch (err) {
      setAiNotice('Erro de rede ao contactar IA.');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div id="personal-form-section" className="space-y-6">
      {/* Header & Photo Section (Apple Glass 3D Card) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-gradient-to-br from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-3xl shadow-[0_4px_16px_rgba(30,58,138,0.03)]">
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-[#CBD5E1] bg-[#F1F5F9] flex items-center justify-center shrink-0 shadow-md shadow-blue-900/5 transition-transform group-hover:scale-[1.02]">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.fullName || 'Foto do Perfil'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-[#94A3B8]" />
            )}
          </div>
          <label className="absolute inset-0 bg-[#0F172A]/60 text-white rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-xs font-semibold backdrop-blur-xs">
            <Camera className="w-5 h-5 mb-1" />
            Alterar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#0F172A]">Fotografia Profissional</h4>
            <span className="text-[10px] uppercase font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
              Opcional
            </span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Adicione uma fotografia nítida e profissional. Poderá ocultá-la a qualquer momento na aba de Modelos & Cores.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] cursor-pointer shadow-xs hover:shadow-sm transition-all active:scale-[0.98]">
              <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
              Carregar Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
            {data.photoUrl && (
              <button
                type="button"
                onClick={() => updateField('photoUrl', '')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover Foto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Nome Completo <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-full-name"
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Ex: Arsénio Mabunda"
              className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Cargo / Título Profissional <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="input-job-title"
            value={data.jobTitle}
            onChange={(e) => updateField('jobTitle', e.target.value)}
            placeholder="Ex: Engenheiro de Software Sénior"
            className="apple-input w-full px-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Email de Contacto <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              id="input-email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="exemplo@dominio.co.mz"
              className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Contacto Telefónico <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-phone"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+258 84 123 4567"
              className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Localização (Cidade, Província)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-location"
              value={data.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Maputo, Moçambique"
              className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            LinkedIn / Portfolio (Opcional)
          </label>
          <div className="relative">
            <Linkedin className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-linkedin"
              value={data.linkedin || ''}
              onChange={(e) => updateField('linkedin', e.target.value)}
              placeholder="linkedin.com/in/seu-perfil"
              className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>
      </div>

      {/* Professional Summary with AI Enhancement */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#0F172A]">
            Resumo Profissional / Perfil
          </label>
          <button
            type="button"
            id="btn-ai-enhance-summary"
            onClick={handleEnhanceWithAI}
            disabled={isEnhancing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs hover:shadow-sm active:scale-[0.98]"
          >
            {isEnhancing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            )}
            {isEnhancing ? 'A refinar com IA...' : 'Aprimorar com IA'}
          </button>
        </div>

        {aiNotice && (
          <div className="mb-2.5 p-3 bg-blue-50/80 border border-blue-200 text-blue-900 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{aiNotice}</span>
          </div>
        )}

        <textarea
          id="input-summary"
          rows={4}
          value={data.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          placeholder="Descreva a sua trajetória profissional, competências fundamentais e principais conquistas..."
          className="apple-input w-full p-3.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] resize-y leading-relaxed"
        />
        <p className="text-[11px] text-[#64748B] mt-1.5">
          Dica Apple: Mantenha 3 a 5 frases claras focadas em valor e realizações de impacto.
        </p>
      </div>
    </div>
  );
};
