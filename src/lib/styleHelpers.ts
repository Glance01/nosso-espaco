import { PrimaryColor, TemplateId } from '../types';

export interface ColorSchemeConfig {
  name: string;
  hex: string;
  bgPrimary: string;
  textPrimary: string;
  borderPrimary: string;
  bgLight: string;
  tagBg: string;
  accentGradient: string;
}

export const colorSchemes: Record<PrimaryColor, ColorSchemeConfig> = {
  emerald: {
    name: 'Azul Real (Apple Pro)',
    hex: '#2563EB',
    bgPrimary: 'bg-blue-600',
    textPrimary: 'text-blue-700',
    borderPrimary: 'border-blue-500',
    bgLight: 'bg-blue-50/80',
    tagBg: 'bg-blue-100 text-blue-900',
    accentGradient: 'from-blue-600 to-indigo-700',
  },
  blue: {
    name: 'Azul Céu Suave (Sky)',
    hex: '#0284C7',
    bgPrimary: 'bg-sky-600',
    textPrimary: 'text-sky-700',
    borderPrimary: 'border-sky-500',
    bgLight: 'bg-sky-50/80',
    tagBg: 'bg-sky-100/90 text-sky-900',
    accentGradient: 'from-sky-600 to-blue-600',
  },
  indigo: {
    name: 'Índigo Executivo',
    hex: '#4F46E5',
    bgPrimary: 'bg-indigo-600',
    textPrimary: 'text-indigo-700',
    borderPrimary: 'border-indigo-500',
    bgLight: 'bg-indigo-50/70',
    tagBg: 'bg-indigo-100 text-indigo-950',
    accentGradient: 'from-indigo-600 to-purple-700',
  },
  teal: {
    name: 'Azul Turquesa Marfim',
    hex: '#0891B2',
    bgPrimary: 'bg-cyan-600',
    textPrimary: 'text-cyan-700',
    borderPrimary: 'border-cyan-500',
    bgLight: 'bg-cyan-50',
    tagBg: 'bg-cyan-100 text-cyan-900',
    accentGradient: 'from-cyan-600 to-blue-600',
  },
  slate: {
    name: 'Azul Grafite Minimalista',
    hex: '#1E293B',
    bgPrimary: 'bg-slate-800',
    textPrimary: 'text-slate-800',
    borderPrimary: 'border-slate-700',
    bgLight: 'bg-slate-100',
    tagBg: 'bg-slate-200/80 text-slate-800',
    accentGradient: 'from-slate-800 to-slate-950',
  },
  rose: {
    name: 'Azul Safira Intenso',
    hex: '#1D4ED8',
    bgPrimary: 'bg-blue-700',
    textPrimary: 'text-blue-800',
    borderPrimary: 'border-blue-600',
    bgLight: 'bg-blue-50',
    tagBg: 'bg-blue-100 text-blue-900',
    accentGradient: 'from-blue-700 to-slate-900',
  },
  amber: {
    name: 'Azul Cobalto Elétrico',
    hex: '#3B82F6',
    bgPrimary: 'bg-blue-500',
    textPrimary: 'text-blue-600',
    borderPrimary: 'border-blue-400',
    bgLight: 'bg-blue-50/60',
    tagBg: 'bg-blue-100 text-blue-900',
    accentGradient: 'from-blue-500 to-blue-700',
  },
  violet: {
    name: 'Azul Marinho & Petróleo',
    hex: '#0F766E',
    bgPrimary: 'bg-teal-700',
    textPrimary: 'text-teal-800',
    borderPrimary: 'border-teal-600',
    bgLight: 'bg-teal-50/60',
    tagBg: 'bg-teal-100 text-teal-950',
    accentGradient: 'from-teal-700 to-blue-800',
  },
};

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  previewColor: string;
}

export const resumeTemplates: TemplateDefinition[] = [
  {
    id: 'modern',
    name: 'Maputo Moderno',
    tagline: 'Duas colunas suaves',
    description: 'Layout equilibrado com barra lateral elegante para competências e contactos.',
    previewColor: '#2563EB',
  },
  {
    id: 'executive',
    name: 'Polana Executivo',
    tagline: 'Corporativo & Apple Style',
    description: 'Cabeçalho distinto com seções lineares refinadas, ideal para liderança.',
    previewColor: '#1D4ED8',
  },
  {
    id: 'minimalist',
    name: 'Zambeze Minimal',
    tagline: 'Clean & Tipográfico',
    description: 'Foco total no conteúdo com linhas finas e tipografia suave e arejada.',
    previewColor: '#0284C7',
  },
  {
    id: 'creative',
    name: 'Inhambane Criativo',
    tagline: 'Visual & Impactante',
    description: 'Estilo contemporâneo com cartões arredondados e destaques profissionais.',
    previewColor: '#4F46E5',
  },
  {
    id: 'compact',
    name: 'Matola Compacto',
    tagline: 'Alta densidade suave',
    description: 'Estruturado para encaixar rica experiência profissional em 1 única página.',
    previewColor: '#0891B2',
  },
  {
    id: 'elegant',
    name: 'Bazaruto Elegante',
    tagline: 'Serifado & Nobre',
    description: 'Tipografia clássica com divisores refinados e tons azuis sofisticados.',
    previewColor: '#1E293B',
  },
];
