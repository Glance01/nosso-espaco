import React, { useState } from 'react';
import { CVData } from '../types';
import { FileText, Sparkles, Send, Copy, Check, Download, RefreshCw, Building2, UserCheck, Briefcase } from 'lucide-react';
import { exportCVToPDF } from '../lib/pdfExport';
import TextareaAutosize from 'react-textarea-autosize';

interface CoverLetterGeneratorProps {
  cvData: CVData;
  onClose: () => void;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ cvData, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [recipientName, setRecipientName] = useState('Diretor de Recursos Humanos');
  const [positionApplied, setPositionApplied] = useState(cvData.personal.jobTitle || 'Profissional Especialista');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [letter, setLetter] = useState({
    recipientName: 'Diretor de Recursos Humanos',
    companyName: 'Empresa em Moçambique',
    companyAddress: 'Maputo, Moçambique',
    positionApplied: cvData.personal.jobTitle || 'Profissional',
    salutation: `Exmo(a). Sr(a). Diretor de Recursos Humanos,`,
    openingParagraph: `Venho por meio desta apresentar a minha candidatura à vaga de ${cvData.personal.jobTitle || 'Especialista'} na vossa prestigiada organização, motivado(a) pelas oportunidades de desenvolvimento e impacto no mercado de Moçambique.`,
    bodyParagraph1: `Com mais de 6 anos de experiência consolidada em ${cvData.personal.jobTitle}, possuo sólida formação académica e competências avançadas em gestão de projetos, resolução de problemas e entrega de resultados de alto desempenho.`,
    bodyParagraph2: `No meu percurso profissional recente, liderei equipas multidisciplinares, otimizei processos internos e assegurei conformidade rigorosa com os padrões do setor, o que me capacita a agregar valor imediato aos vossos objetivos corporativos.`,
    closingParagraph: `Agradeço desde já a atenção dispensada e manifesto total disponibilidade para uma entrevista, onde terei o privilégio de detalhar as minhas qualificações e contributos potenciais.`,
    signOff: `Com os melhores cumprimentos,\n${cvData.personal.fullName}`
  });

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cvData.personal.fullName,
          careerField: cvData.personal.jobTitle,
          jobTitle: positionApplied,
          companyName: companyName || 'Empresa em Moçambique',
          recipientName: recipientName,
          experienceSummary: cvData.personal.summary,
        }),
      });
      const data = await res.json();
      if (data.success && data.letterData) {
        setLetter(data.letterData);
      }
    } catch (e) {
      console.error('Error generating cover letter:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = `
${cvData.personal.fullName}
${cvData.personal.email} • ${cvData.personal.phone} • ${cvData.personal.location}

${new Date().toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })}

À
${letter.recipientName}
${letter.companyName}
${letter.companyAddress}

Assunto: Candidatura à vaga de ${letter.positionApplied}

${letter.salutation}

${letter.openingParagraph}

${letter.bodyParagraph1}

${letter.bodyParagraph2}

${letter.closingParagraph}

${letter.signOff}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const cleanFileName = `Carta_Apresentacao_${(cvData.personal.fullName || 'Profissional').replace(/\s+/g, '_')}.pdf`;
      await exportCVToPDF('cover-letter-a4-document', cleanFileName);
    } catch (e) {
      console.error('Error exporting cover letter PDF:', e);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-emerald-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Carta de Apresentação & Motivação</h2>
              <p className="text-xs text-slate-500">Criada profissionalmente para o mercado de Moçambique</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm font-bold"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          
          {/* Form Configuration (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Dados da Vaga & Empresa</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Standard Bank Moçambique"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destinatário / RH</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex: Dr. Carlos Mondlane"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cargo a Candidatar-se</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={positionApplied}
                  onChange={(e) => setPositionApplied(e.target.value)}
                  placeholder="Ex: Engenheiro de Software Sénior"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'A gerar com IA Gemini...' : 'Gerar Carta com IA'}</span>
            </button>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              💡 A IA analisa automaticamente os dados do seu currículo e redige uma carta formal sob medida para a empresa e cargo indicados.
            </div>
          </div>

          {/* Letter Preview & Edit (Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-0">
            {/* Scrollable A4 Preview Area */}
            <div className="bg-[#E2E8F0] p-4 sm:p-8 rounded-t-2xl border border-slate-300 shadow-inner overflow-x-auto overflow-y-auto flex justify-center relative h-[50vh] lg:h-auto lg:max-h-[800px]">
              <div
                id="cover-letter-a4-document"
                className="bg-white flex flex-col justify-between font-serif text-slate-900 leading-relaxed shadow-lg shrink-0"
                style={{
                  width: '794px',
                  minWidth: '794px',
                  minHeight: '1123px',
                  padding: '2cm',
                  fontSize: '11pt',
                  boxSizing: 'border-box'
                }}
              >
                <div className="space-y-4">
                
                {/* Header Info */}
              <div className="text-left border-b border-slate-300 pb-4 mb-4">
                <h4 className="font-bold text-2xl tracking-tight text-slate-950 uppercase">{cvData.personal.fullName}</h4>
                <p className="text-[10pt] text-slate-600 mt-1">{cvData.personal.email} • {cvData.personal.phone} • {cvData.personal.location}</p>
              </div>

              <div className="text-right text-[10pt] text-slate-700">
                {cvData.personal.location.split(',')[0] || 'Maputo'}, {new Date().toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {/* Recipient */}
              <div className="text-[11pt] text-slate-800 space-y-1">
                <p className="font-bold">À(o)</p>
                <p className="font-bold text-slate-950">{letter.recipientName}</p>
                <p>{letter.companyName}</p>
                <p>{letter.companyAddress}</p>
              </div>

              {/* Subject */}
              <div className="pt-2">
                <p className="font-bold text-slate-950 uppercase tracking-wide">
                  Assunto: Candidatura à vaga de {letter.positionApplied}
                </p>
              </div>

              {/* Salutation */}
              <div className="pt-1">
                <input
                  type="text"
                  value={letter.salutation}
                  onChange={(e) => setLetter({ ...letter, salutation: e.target.value })}
                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 -ml-1 font-bold text-slate-950 transition-colors outline-none"
                />
              </div>

              {/* Paragraphs (editable) */}
              <div className="space-y-2 pt-1 text-justify">
                <TextareaAutosize
                  minRows={1}
                  value={letter.openingParagraph}
                  onChange={(e) => setLetter({ ...letter, openingParagraph: e.target.value })}
                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 -ml-1 leading-relaxed resize-none overflow-hidden transition-colors outline-none"
                />
                <TextareaAutosize
                  minRows={1}
                  value={letter.bodyParagraph1}
                  onChange={(e) => setLetter({ ...letter, bodyParagraph1: e.target.value })}
                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 -ml-1 leading-relaxed resize-none overflow-hidden transition-colors outline-none"
                />
                <TextareaAutosize
                  minRows={1}
                  value={letter.bodyParagraph2}
                  onChange={(e) => setLetter({ ...letter, bodyParagraph2: e.target.value })}
                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 -ml-1 leading-relaxed resize-none overflow-hidden transition-colors outline-none"
                />
                <TextareaAutosize
                  minRows={1}
                  value={letter.closingParagraph}
                  onChange={(e) => setLetter({ ...letter, closingParagraph: e.target.value })}
                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 -ml-1 leading-relaxed resize-none overflow-hidden transition-colors outline-none"
                />
              </div>

              {/* Sign off */}
              <div className="pt-2">
                <TextareaAutosize
                  minRows={1}
                  value={letter.signOff}
                  onChange={(e) => setLetter({ ...letter, signOff: e.target.value })}
                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 -ml-1 font-bold text-slate-950 resize-none overflow-hidden transition-colors outline-none"
                />
              </div>

              </div>
              </div>
            </div>

            {/* Actions Footer - Pinned strictly outside the printable document scroll area */}
            <div className="bg-white p-4 border border-t-0 border-slate-300 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar Texto'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="w-full sm:flex-1 py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'A descarregar PDF...' : 'Descarregar PDF'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
