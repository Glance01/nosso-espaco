import React from 'react';
import { AppLogo } from '../AppLogo';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Briefcase,
  Users,
  ChevronRight,
  Star,
  Lock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  HelpCircle,
  Layers,
  Download
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenInstallApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onOpenInstallApp }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppLogo className="w-10 h-10 sm:w-11 sm:h-11 shadow-md rounded-2xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A]">
                  Candidate-se
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Padrão Executivo
                </span>
              </div>
              <p className="text-xs text-[#64748B] hidden md:block">
                Plataforma oficial de criação de currículos para o mercado moçambicano
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenInstallApp && (
              <button
                type="button"
                id="landing-btn-install-header"
                onClick={onOpenInstallApp}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Instalar Candidate-se no seu telemóvel ou computador"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </button>
            )}
            <button
              type="button"
              id="landing-btn-login-header"
              onClick={() => onOpenAuth('login')}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Iniciar Sessão
            </button>
            <button
              type="button"
              id="landing-btn-register-header"
              onClick={() => onOpenAuth('register')}
              className="btn-apple-3d inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              <span>Criar Conta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.12),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Bem-vindo à nova era do recrutamento em Moçambique</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] mb-6">
            O Seu Próximo Emprego Começa com um <span className="text-blue-600">Currículo Perfeito</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Crie um currículo moderno, aprovado por recrutadores moçambicanos e multinacionais, estruturado com precisão e pronto para descarregar em PDF A4 em poucos minutos.
          </p>

          {/* Action CTAs in Hero */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-12">
            <button
              type="button"
              id="landing-hero-btn-start"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto btn-apple-3d inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-2xl text-base font-bold shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-transform"
            >
              <span>Começar Agora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              id="landing-hero-btn-login"
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-2xl text-base font-bold transition-all shadow-xs active:scale-[0.98]"
            >
              <span>Já tenho conta</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 text-left">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Normas ATS & Padrão A4</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Cartão Bancário 3D-Secure</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">IA Inteligente com Gemini</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Salvo na sua conta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: O Que o Site Faz */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-3">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Funcionalidade</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              O Que o Candidate-se Faz por Si
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              Uma ferramenta completa desenvolvida especificamente para as necessidades de quem procura emprego ou evolução de carreira em Moçambique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 font-bold">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Estruturação Automática & Modelos Aprovados</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Elimine o trabalho manual no Word. Os seus dados são organizados em seções limpas (Experiência, Formação, Competências, Idiomas e Certificações) com tipografia executiva e margens perfeitas.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Assistência com IA Gemini</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Não sabe como descrever as suas tarefas ou o seu perfil profissional? A Inteligência Artificial ajuda a redigir resumos atrativos e sugere competências adequadas à sua área.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Exportação PDF Vetorial A4</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gere arquivos em formato A4 com resolução gráfica ultra-nítida. Compatível com envio por e-mail, WhatsApp, LinkedIn e plataformas automáticas de triagem de currículos (ATS).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Por Que Ajuda */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>O Impacto Real no Mercado</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Porque um Currículo Profissional Faz Toda a Diferença?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Em Moçambique, um recrutador avalia mais de <strong>200 currículos por vaga</strong> e dedica em média apenas <strong>6 segundos</strong> para decidir se descarta ou chama para entrevista.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    ✗
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">O Problema dos CVs Comuns</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Modelos desformatados em Word, fotos desproporcionais, falta de destaque nas competências-chave e erros de estrutura causam rejeição imediata.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">A Solução com Candidate-se</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Hierarquia visual clara, destaque profissional imediato, conformidade com os requisitos das empresas em Moçambique e apresentação que transmite credibilidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Comparison Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Vantagens do Candidate-se vs. Método Antigo
              </h3>
              
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600">Tempo de elaboração</span>
                  <span className="font-bold text-blue-600">5 a 10 Minutos</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600">Compatibilidade com Celular</span>
                  <span className="font-bold text-emerald-600">100% Responsivo</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600">Métodos de Pagamento</span>
                  <span className="font-bold text-slate-900">Cartão Bancário (Visa / Mastercard)</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600">Formatação & Design</span>
                  <span className="font-bold text-slate-900">Padrão Apple Executivo</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600">Segurança de Dados</span>
                  <span className="font-bold text-slate-900">Firebase Cloud Seguro</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full mt-6 btn-apple-3d py-3 text-white rounded-xl text-xs sm:text-sm font-bold text-center block"
              >
                Criar Meu Currículo Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Quais as Vantagens */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Por que escolher a nossa plataforma</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Principais Vantagens Exclusivas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Pagamento Seguro por Cartão</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pague em Meticais (MZN) com qualquer cartão de débito ou crédito de bancos em Moçambique (BIM, BCI, Standard Bank, Absa, Moza) de forma segura.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Edição Total no Celular</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Não precisa de um computador para fazer um currículo de elite. Edite e descarregue diretamente do seu telemóvel com interface rápida.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Conta & Salvamento Seguro</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A sua subscrição e os dados do currículo ficam guardados na sua conta pessoal. Nunca perde o seu progresso nem precisa de pagar duas vezes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Inteligência Artificial Gemini</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gere sugestões inteligentes para aprimorar os seus textos e impressionar gestores de RH das maiores empresas do país.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Personalização Completa</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Escolha esquemas de cores profissionais, tipografias modernas, inclua ou omita fotografia conforme o cargo desejado.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Download Instantâneo</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                PDF pronto em segundos, formatado de acordo com a folha padrão A4 (210mm x 297mm) com cabeçalhos organizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Persuasive Call to Action Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
            <Sparkles className="w-8 h-8 text-sky-200" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Pronto para Conquistar a Próxima Oportunidade?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Junte-se a milhares de candidatos em Moçambique que já transformaram a sua apresentação profissional. Crie a sua conta gratuita hoje mesmo e comece a editar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              type="button"
              id="landing-cta-btn-start"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto btn-apple-3d inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white rounded-2xl text-base font-bold shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-transform"
            >
              <ShieldCheck className="w-5 h-5 text-sky-300" />
              <span>Começar — Criar Conta</span>
            </button>

            <button
              type="button"
              id="landing-cta-btn-login"
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-2xl text-base font-bold backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <span>Entrar na Minha Conta</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Processo 100% seguro em 3 etapas simples • Proteção de dados garantida</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              C
            </div>
            <span className="font-semibold text-slate-300">Candidate-se &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">
              Iniciar Sessão
            </button>
            <button type="button" onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">
              Criar Conta
            </button>
          </div>

          <p className="text-slate-400 text-center sm:text-right">
            Desenvolvido para profissionais e empresas em Moçambique
          </p>
        </div>
      </footer>
    </div>
  );
};
