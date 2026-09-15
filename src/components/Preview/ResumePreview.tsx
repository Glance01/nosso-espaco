import React from 'react';
import { CVData, StyleConfig } from '../../types';
import { colorSchemes } from '../../lib/styleHelpers';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Building, Award, GraduationCap, Briefcase, Lock, Sparkles } from 'lucide-react';

interface ResumePreviewProps {
  data: CVData;
  config: StyleConfig;
  isPremium: boolean;
  onUnlockClick: () => void;
  isFullscreen?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  config,
  isPremium,
  onUnlockClick,
  isFullscreen = false,
}) => {
  const color = colorSchemes[config.colorScheme] || colorSchemes.emerald;
  const { personal, experiences, educations, skills, languages, certifications } = data;

  const fontClass =
    config.fontFamily === 'serif'
      ? 'font-serif'
      : config.fontFamily === 'display'
      ? 'font-sans'
      : 'font-sans';

  const spacingClass =
    config.spacing === 'compact'
      ? 'space-y-3'
      : config.spacing === 'spacious'
      ? 'space-y-6'
      : 'space-y-4';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month || '1', 10) - 1);
      return date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${isFullscreen ? 'h-full' : ''}`}>
      {/* Free Plan Apple Notice Indicator */}
      {!isPremium && !isFullscreen && (
        <div data-html2canvas-ignore="true" className="w-full max-w-[794px] mb-4 bg-gradient-to-r from-blue-50/90 via-white to-blue-50/90 border border-blue-200 text-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 leading-relaxed">
              Modo de Edição Grátis. O download em PDF de alta resolução vetorial é desbloqueado com o Plano Pro.
            </span>
          </div>
          <button
            type="button"
            id="btn-preview-unlock-pro"
            onClick={onUnlockClick}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            Desbloquear PDF (299 MT)
          </button>
        </div>
      )}

      {/* Main A4 Document Paper with Apple 3D Stage styling */}
      <div className={`w-full flex ${isFullscreen ? 'justify-center items-start min-h-full bg-slate-200 p-2 sm:p-6 pb-20 overflow-visible' : 'justify-center pb-4 max-h-[60vh] lg:max-h-none overflow-x-auto overflow-y-auto lg:overflow-y-visible'}`}>
        <div
          id="resume-a4-document"
          className={`w-[794px] min-w-[794px] bg-white text-slate-800 shrink-0 rounded-none relative flex flex-col ${fontClass} ${isFullscreen ? 'scale-[0.48] sm:scale-[0.8] md:scale-100 origin-top shadow-2xl' : ''}`}
          style={{
            minHeight: '1123px',
            boxSizing: 'border-box',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
            marginBottom: isFullscreen ? '-50%' : '0'
          }}
        >
          {/* Subtle Watermark for non-premium users */}
          {!isPremium && (
            <div data-html2canvas-ignore="true" className="absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-[0.03] rotate-[-35deg] text-6xl font-black tracking-widest text-[#4A3B32]">
              CRIADO GRÁTIS NO CANDIDATE-SE
            </div>
          )}

        {/* 1. TEMPLATE: MODERN (Maputo Moderno - Dual Column Sidebar) */}
        {config.template === 'modern' && (
          <div className="flex flex-1 w-full min-h-full">
            {/* Left Sidebar */}
            <div className="w-[34%] bg-[#2D241E] text-[#F5EBE1] p-8 flex flex-col justify-between shrink-0">
              <div className="space-y-8">
                {/* Photo */}
                {config.showPhoto && personal.photoUrl && (
                  <div className="flex justify-center">
                    <div
                      className="w-32 h-32 rounded-3xl overflow-hidden border-2 shadow-lg"
                      style={{ borderColor: color.hex }}
                    >
                      <img
                        src={personal.photoUrl}
                        alt={personal.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Contacts */}
                <div className="space-y-3">
                  <h3
                    className="text-xs font-bold tracking-wider uppercase pb-1 border-b"
                    style={{ borderColor: color.hex, color: '#FAF6F0' }}
                  >
                    Contactos
                  </h3>
                  <div className="space-y-2 text-[11px] text-[#D8CEBE]">
                    {personal.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-[#A69584]" />
                        <span className="truncate">{personal.email}</span>
                      </div>
                    )}
                    {personal.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-[#A69584]" />
                        <span>{personal.phone}</span>
                      </div>
                    )}
                    {personal.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#A69584]" />
                        <span>{personal.location}</span>
                      </div>
                    )}
                    {personal.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-3.5 h-3.5 shrink-0 text-[#A69584]" />
                        <span className="truncate">{personal.linkedin}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="space-y-3">
                    <h3
                      className="text-xs font-bold tracking-wider uppercase pb-1 border-b"
                      style={{ borderColor: color.hex, color: '#FAF6F0' }}
                    >
                      Competências
                    </h3>
                    <div className="space-y-2">
                      {skills.map((s) => (
                        <div key={s.id} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-[#EAE2D5] font-medium">
                            <span>{s.name}</span>
                            {config.showSkillBars && <span>{s.level}/5</span>}
                          </div>
                          {config.showSkillBars && (
                            <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(s.level / 5) * 100}%`,
                                  backgroundColor: color.hex,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <div className="space-y-3">
                    <h3
                      className="text-xs font-bold tracking-wider uppercase pb-1 border-b"
                      style={{ borderColor: color.hex, color: '#FAF6F0' }}
                    >
                      Idiomas
                    </h3>
                    <div className="space-y-1.5">
                      {languages.map((l) => (
                        <div key={l.id} className="flex justify-between text-[11px]">
                          <span className="text-[#EAE2D5] font-medium">{l.name}</span>
                          <span className="text-[#A69584]">{l.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="pt-6 text-[10px] text-[#8C7A6B] text-center border-t border-white/10">
                Moçambique
              </div>
            </div>

            {/* Right Main Body */}
            <div className="w-[66%] p-10 bg-white flex flex-col flex-1">
              <div className={`${spacingClass} flex-1`}>
                {/* Header Profile */}
                <div className="border-b pb-6" style={{ borderColor: '#EAE1D3' }}>
                  <h1 className="text-3xl font-black text-[#2D241E] tracking-tight uppercase">
                    {personal.fullName || 'Seu Nome Completo'}
                  </h1>
                  <h2
                    className="text-sm font-bold mt-1.5 tracking-wider uppercase"
                    style={{ color: color.hex }}
                  >
                    {personal.jobTitle || 'Título Profissional'}
                  </h2>
                  {personal.summary && (
                    <p className="text-[12px] text-[#5A4B3E] mt-4 leading-[1.6] text-justify">
                      {personal.summary}
                    </p>
                  )}
                </div>

                {/* Experience */}
                {experiences.length > 0 && (
                  <div className="space-y-4">
                    <h3
                      className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b"
                      style={{ borderColor: '#EAE1D3', color: color.hex }}
                    >
                      <Briefcase className="w-4 h-4" />
                      Experiência Profissional
                    </h3>
                    <div className="space-y-5">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[14px] font-bold text-[#2D241E]">
                              {exp.role || 'Cargo'}
                            </span>
                            <span className="text-[11px] font-semibold text-[#8C7A6B]">
                              {formatDate(exp.startDate)} — {exp.current ? 'Presente' : formatDate(exp.endDate)}
                            </span>
                          </div>
                          <div className="text-[12px] font-semibold text-[#7A6B5E] tracking-wide">
                            {exp.company} {exp.location && `• ${exp.location}`}
                          </div>
                          {exp.description && (
                            <p className="text-[12px] text-[#5A4B3E] whitespace-pre-line leading-[1.6] mt-1 text-justify">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {educations.length > 0 && (
                  <div className="space-y-4">
                    <h3
                      className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b"
                      style={{ borderColor: '#EAE1D3', color: color.hex }}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Formação Académica
                    </h3>
                    <div className="space-y-4">
                      {educations.map((edu) => (
                        <div key={edu.id} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[13px] font-bold text-[#2D241E]">
                              {edu.degree || 'Qualificação'}
                            </span>
                            <span className="text-[11px] font-semibold text-[#8C7A6B]">
                              {formatDate(edu.startDate)} — {edu.current ? 'Em curso' : formatDate(edu.endDate)}
                            </span>
                          </div>
                          <div className="text-[12px] font-medium text-[#7A6B5E]">
                            {edu.institution} {edu.location && `• ${edu.location}`}
                          </div>
                          {edu.description && (
                            <p className="text-[11px] text-[#5A4B3E] pt-0.5">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3
                      className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b"
                      style={{ borderColor: '#EAE1D3', color: color.hex }}
                    >
                      <Award className="w-4 h-4" />
                      Certificações
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {certifications.map((c) => (
                        <div key={c.id} className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EAE1D3] shadow-sm">
                          <div className="text-[12px] font-bold text-[#2D241E]">{c.name}</div>
                          <div className="text-[11px] font-medium text-[#7A6B5E] pt-0.5">{c.issuer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Anchor */}
              <div className="mt-auto pt-16">
                <div className="border-t border-[#EAE1D3] pt-5 flex justify-between items-center text-[10px] text-[#8C7A6B] font-bold tracking-[0.2em] uppercase">
                  <span>{personal.fullName}</span>
                  <span>Currículo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TEMPLATE: EXECUTIVE (Polana Executivo) */}
        {config.template === 'executive' && (
          <div className="p-10 space-y-8 flex flex-col flex-1 w-full min-h-full">
            {/* Elegant Header with Accent Bar */}
            <div className="flex items-center justify-between pb-6 border-b-2" style={{ borderColor: color.hex }}>
              <div className="space-y-1.5">
                <h1 className="text-3xl font-black text-[#2D241E] tracking-tight uppercase">
                  {personal.fullName || 'Seu Nome Completo'}
                </h1>
                <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: color.hex }}>
                  {personal.jobTitle || 'Título Executivo'}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#7A6B5E] pt-2 font-medium tracking-wide">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>• {personal.phone}</span>}
                  {personal.location && <span>• {personal.location}</span>}
                  {personal.linkedin && <span>• {personal.linkedin}</span>}
                </div>
              </div>
              {config.showPhoto && personal.photoUrl && (
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-md shrink-0 ml-4"
                  style={{ borderColor: color.hex }}
                >
                  <img
                    src={personal.photoUrl}
                    alt={personal.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            {personal.summary && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: color.hex }}>
                  Perfil Executivo
                </h3>
                <p className="text-[12.5px] text-[#5A4B3E] leading-[1.6] text-justify">
                  {personal.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-widest pb-2 border-b" style={{ borderColor: '#EAE1D3', color: color.hex }}>
                  Experiência Profissional
                </h3>
                <div className="space-y-5">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[14px] font-bold text-[#2D241E]">{exp.role}</span>
                        <span className="text-[11px] font-semibold text-[#8C7A6B]">
                          {formatDate(exp.startDate)} — {exp.current ? 'Presente' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <div className="text-[12px] font-semibold text-[#7A6B5E] tracking-wide">
                        {exp.company} • {exp.location}
                      </div>
                      <p className="text-[13px] text-[#5A4B3E] whitespace-pre-line leading-[1.6] text-justify pt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Skills Grid */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              {educations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold uppercase tracking-widest pb-2 border-b" style={{ borderColor: '#EAE1D3', color: color.hex }}>
                    Formação
                  </h3>
                  <div className="space-y-4">
                    {educations.map((edu) => (
                      <div key={edu.id} className="space-y-0.5">
                        <div className="text-[13px] font-bold text-[#2D241E]">{edu.degree}</div>
                        <div className="text-[12px] text-[#7A6B5E]">{edu.institution}</div>
                        <div className="text-[11px] text-[#8C7A6B] font-medium pt-0.5">
                          {formatDate(edu.startDate)} — {edu.current ? 'Em curso' : formatDate(edu.endDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold uppercase tracking-widest pb-2 border-b" style={{ borderColor: '#EAE1D3', color: color.hex }}>
                    Competências Chave
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-3 py-1.5 bg-[#FAF6F0] border border-[#EAE1D3] rounded-lg text-[11px] font-bold text-[#4A3B32] tracking-wide"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Anchor */}
            <div className="mt-auto pt-16">
              <div className="border-t border-[#EAE1D3] pt-5 flex justify-between items-center text-[10px] text-[#8C7A6B] font-bold tracking-[0.2em] uppercase">
                <span>{personal.fullName}</span>
                <span>{personal.jobTitle}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. TEMPLATE: MINIMALIST (Zambeze Minimal) */}
        {config.template === 'minimalist' && (
          <div className="p-10 space-y-7 flex flex-col flex-1 w-full min-h-full">
            {/* Header Clean */}
            <div className="text-center space-y-1.5 pb-6 border-b border-[#EAE1D3]">
              <h1 className="text-4xl font-light tracking-widest text-[#2D241E] uppercase">
                {personal.fullName || 'Seu Nome'}
              </h1>
              <h2 className="text-[13px] font-semibold tracking-[0.2em] uppercase" style={{ color: color.hex }}>
                {personal.jobTitle || 'Profissão'}
              </h2>
              <div className="flex justify-center flex-wrap gap-4 text-[11px] text-[#7A6B5E] pt-2 font-medium">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
                {personal.location && <span>• {personal.location}</span>}
              </div>
            </div>

            {/* Summary */}
            {personal.summary && (
              <p className="text-[12.5px] text-[#5A4B3E] text-center max-w-2xl mx-auto italic leading-[1.6]">
                "{personal.summary}"
              </p>
            )}

            {/* Experiences */}
            {experiences.length > 0 && (
              <div className="space-y-6 pt-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-center" style={{ color: color.hex }}>
                  Trajetória Profissional
                </h3>
                <div className="space-y-5">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="space-y-1 border-l-2 pl-4 border-[#EAE1D3] ml-2">
                      <div className="flex justify-between text-[13px] font-bold text-[#2D241E]">
                        <span>{exp.role}</span>
                        <span className="text-[11px] font-normal text-[#8C7A6B]">
                          {formatDate(exp.startDate)} - {exp.current ? 'Atual' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <div className="text-[12px] font-medium text-[#7A6B5E] tracking-wide">{exp.company}</div>
                      <p className="text-[13px] text-[#5A4B3E] leading-[1.6] pt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Skills */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              {educations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: color.hex }}>Educação</h3>
                  {educations.map((edu) => (
                    <div key={edu.id} className="text-[12px] border-l-2 pl-3 border-[#EAE1D3] space-y-0.5 ml-2">
                      <div className="font-bold text-[#2D241E] text-[13px]">{edu.degree}</div>
                      <div className="text-[#7A6B5E] font-medium">{edu.institution}</div>
                    </div>
                  ))}
                </div>
              )}
              {skills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: color.hex }}>Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s.id} className="text-[11px] px-3 py-1.5 bg-[#FAF6F0] rounded-lg text-[#4A3B32] font-medium tracking-wide">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Anchor */}
            <div className="mt-auto pt-16 pb-4">
              <div className="flex items-center justify-center gap-4 text-[#8C7A6B] opacity-50">
                <div className="h-[1px] flex-1 bg-[#EAE1D3]"></div>
                <div className="text-[9px] uppercase tracking-widest font-bold">
                  {personal.fullName?.split(' ')[0]} CV
                </div>
                <div className="h-[1px] flex-1 bg-[#EAE1D3]"></div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TEMPLATES: CREATIVE, COMPACT, ELEGANT (Adaptive Render) */}
        {['creative', 'compact', 'elegant'].includes(config.template) && (
          <div className="p-10 space-y-8 flex flex-col flex-1 w-full min-h-full">
            {/* Header with rounded background card */}
            <div
              className="p-8 rounded-3xl text-white flex items-center justify-between"
              style={{ backgroundColor: color.hex }}
            >
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight uppercase">
                  {personal.fullName || 'Seu Nome'}
                </h1>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] opacity-90">
                  {personal.jobTitle || 'Título Profissional'}
                </h2>
                <div className="flex flex-wrap gap-4 text-[11px] font-medium opacity-90 pt-1">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>• {personal.phone}</span>}
                  {personal.location && <span>• {personal.location}</span>}
                </div>
              </div>
              {config.showPhoto && personal.photoUrl && (
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/60 shrink-0">
                  <img src={personal.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {personal.summary && (
              <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#EAE1D3] text-[13px] text-[#5A4B3E] leading-[1.6] text-justify shadow-sm">
                {personal.summary}
              </div>
            )}

            {experiences.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#2D241E] ml-1">
                  Experiência Profissional
                </h3>
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="p-5 bg-white border border-[#EAE1D3] rounded-2xl space-y-1 shadow-sm">
                      <div className="flex justify-between text-[14px] font-bold text-[#2D241E]">
                        <span>{exp.role}</span>
                        <span className="text-[11px] font-medium text-[#8C7A6B]">
                          {formatDate(exp.startDate)} — {exp.current ? 'Presente' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <div className="text-[12px] font-bold tracking-wide" style={{ color: color.hex }}>
                        {exp.company} • {exp.location}
                      </div>
                      <p className="text-[13px] text-[#5A4B3E] whitespace-pre-line leading-[1.6] pt-1 text-justify">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 pt-2">
              {educations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#2D241E] ml-1">Formação</h3>
                  <div className="space-y-3">
                    {educations.map((edu) => (
                      <div key={edu.id} className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#EAE1D3] shadow-sm">
                        <div className="text-[13px] font-bold text-[#2D241E]">{edu.degree}</div>
                        <div className="text-[11px] font-medium text-[#7A6B5E] pt-0.5">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#2D241E] ml-1">Competências</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-3 py-1.5 bg-white border border-[#EAE1D3] shadow-sm rounded-lg text-[11px] font-bold text-[#4A3B32] tracking-wide"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Anchor */}
            <div className="mt-auto pt-16">
              <div className="flex justify-between items-center px-4 py-4 bg-[#FAF6F0] rounded-2xl border border-[#EAE1D3] text-[10px] text-[#8C7A6B] font-bold tracking-[0.2em] uppercase">
                <span>{personal.fullName}</span>
                <span>{personal.jobTitle}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
