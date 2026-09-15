import React, { useState, useEffect } from 'react';
import { CVData, StyleConfig, SubscriptionInfo } from './types';
import { initialCVData, defaultStyleConfig, emptyCVData } from './data/initialData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PersonalForm } from './components/Editor/PersonalForm';
import { ExperienceForm } from './components/Editor/ExperienceForm';
import { EducationForm } from './components/Editor/EducationForm';
import { SkillsForm } from './components/Editor/SkillsForm';
import { LanguagesForm } from './components/Editor/LanguagesForm';
import { CertificationsForm } from './components/Editor/CertificationsForm';
import { StyleCustomizer } from './components/Editor/StyleCustomizer';
import { ResumePreview } from './components/Preview/ResumePreview';
import { PaymentModal } from './components/Payment/PaymentModal';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './components/Landing/LandingPage';
import { InstallAppBanner } from './components/InstallAppBanner';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { CoverLetterGenerator } from './components/CoverLetterGenerator';
import { exportCVToPDF } from './lib/pdfExport';
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Award,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Download,
  ShieldCheck,
  FolderSync,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

const STORAGE_KEY_CV = 'cv_mz_data_v1';
const STORAGE_KEY_STYLE = 'cv_mz_style_v1';
const MONTHLY_PRICE_MZN = 299;

function MainCVApp() {
  const { currentUser, isPremium, subscription, saveUserResume, loadUserResumes } = useAuth();

  // 1. Core State
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CV);
      return saved ? JSON.parse(saved) : initialCVData;
    } catch {
      return initialCVData;
    }
  });

  const [styleConfig, setStyleConfig] = useState<StyleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STYLE);
      return saved ? JSON.parse(saved) : defaultStyleConfig;
    } catch {
      return defaultStyleConfig;
    }
  });

  // UI state
  const [activeEditorTab, setActiveEditorTab] = useState<
    'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'certs' | 'design'
  >('personal');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CV, JSON.stringify(cvData));
  }, [cvData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STYLE, JSON.stringify(styleConfig));
  }, [styleConfig]);

  // Load cloud resume if user is logged in and has one
  useEffect(() => {
    if (currentUser) {
      loadUserResumes().then((resumes) => {
        if (resumes.length > 0 && resumes[0].cvData) {
          setCvData(resumes[0].cvData);
          if (resumes[0].styleConfig) {
            setStyleConfig(resumes[0].styleConfig);
          }
          showToast('Currículo sincronizado a partir da sua conta na nuvem!');
        }
      });
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCloudSave = async () => {
    if (!currentUser) {
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
      return;
    }
    setIsSavingCloud(true);
    try {
      await saveUserResume(cvData, styleConfig);
      showToast('Currículo guardado com segurança na sua conta!');
    } catch (e: any) {
      showToast('Erro ao guardar na nuvem. Verifique a ligação.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  // PDF Export Logic with Premium Gate
  const handleDownloadPdf = async () => {
    if (!isPremium) {
      setIsPaymentModalOpen(true);
      return;
    }

    try {
      setIsExporting(true);
      showToast('A compilar e exportar documento PDF vetorial de alta resolução...');
      const cleanFileName = `Curriculo_${(cvData.personal.fullName || 'Profissional')
        .replace(/\s+/g, '_')}_CV.pdf`;
      await exportCVToPDF('resume-a4-document', cleanFileName);
      showToast('Download do PDF concluído com sucesso!');
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      alert('Erro ao gerar o PDF. Verifique os dados do currículo.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePaymentSuccess = (newSub: SubscriptionInfo) => {
    showToast('Subscrição Pro ativada com sucesso por 30 dias na sua conta!');
  };

  const handleLoadSample = () => {
    setCvData(initialCVData);
    setStyleConfig(defaultStyleConfig);
    showToast('Modelo de exemplo profissional carregado!');
  };

  const handleClear = () => {
    if (window.confirm('Tem a certeza de que deseja limpar todos os campos do currículo?')) {
      setCvData(emptyCVData);
      showToast('Campos do currículo limpos.');
    }
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const editorTabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'experience', label: 'Experiência', icon: Briefcase },
    { id: 'education', label: 'Educação', icon: GraduationCap },
    { id: 'skills', label: 'Competências', icon: Sparkles },
    { id: 'languages', label: 'Idiomas', icon: Languages },
    { id: 'certs', label: 'Certificados', icon: Award },
    { id: 'design', label: 'Modelos & Cores', icon: SlidersHorizontal },
  ];

  // If user is not logged in, enforce landing page (Welcome, what it does, why it helps, advantages, persuasion, and Começar/Login buttons)
  if (!currentUser) {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 border border-blue-500/20">
            <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingPage 
          onOpenAuth={openAuth} 
          onOpenInstallApp={() => setIsInstallModalOpen(true)}
        />

        {/* Auth Modal (3 Steps Registration & Login) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={() => {
            showToast('Bem-vindo! Sessão iniciada com sucesso.');
          }}
        />

        {/* Pop-up de Instalação sempre visível */}
        <InstallAppBanner 
          forceOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        {/* Floating WhatsApp Support Widget */}
        <WhatsAppWidget />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col text-[#0F172A] selection:bg-[#2563EB] selection:text-white font-sans relative overflow-x-hidden">
      {/* Background Soft Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#DBEAFE]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-[#E0E7FF]/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 border border-blue-500/20">
          <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        subscription={subscription}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        onLoadSampleData={handleLoadSample}
        onClearData={handleClear}
        onDownloadPdf={handleDownloadPdf}
        isExporting={isExporting}
        activeTab={mobileTab}
        setActiveTab={setMobileTab}
        onOpenAuth={openAuth}
        onSaveCloudResume={handleCloudSave}
        isSavingCloud={isSavingCloud}
        onOpenCoverLetter={() => setIsCoverLetterOpen(true)}
        onOpenInstallApp={() => setIsInstallModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor & Controls */}
        <div
          className={`lg:col-span-6 space-y-5 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Subheader Apple Card */}
          <div className="bg-gradient-to-r from-white via-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(30,58,138,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/30 shrink-0">
                <Sparkles className="w-5 h-5 text-[#EFF6FF]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                  Criador de Currículos Profissionais
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Preencha as suas informações e personalize o modelo em tons de azul Apple.
                </p>
              </div>
            </div>
            {!currentUser ? (
              <button
                type="button"
                id="btn-subheader-register"
                onClick={() => openAuth('register')}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold tracking-tight px-3.5 py-1.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-xl hover:bg-blue-100 transition-all self-start sm:self-auto shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Criar Conta p/ Guardar
              </button>
            ) : (
              <button
                type="button"
                id="btn-subheader-save-cloud"
                onClick={handleCloudSave}
                disabled={isSavingCloud}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold tracking-tight px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all self-start sm:self-auto shrink-0"
              >
                <FolderSync className="w-3.5 h-3.5" />
                {isSavingCloud ? 'A guardar...' : 'Guardar na Nuvem'}
              </button>
            )}
          </div>

          {/* Cover Letter Banner Card (Accessible & Prominent on Mobile & Desktop) */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3 border border-blue-500/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25 shadow-inner">
                <Sparkles className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                  Carta de Apresentação e Motivação
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5 leading-snug">
                  Crie uma carta formal e profissional com IA para a sua vaga.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn-open-cover-letter-banner"
              onClick={() => setIsCoverLetterOpen(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-blue-50 text-blue-900 rounded-2xl text-xs font-bold transition-all shadow-md shrink-0 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Gerar Carta</span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-700" />
            </button>
          </div>

          {/* Editor Tabs Navigation (Apple Segmented Bar) */}
          <div className="bg-[#E2E8F0] p-1.5 rounded-3xl border border-[#CBD5E1] flex overflow-x-auto no-scrollbar gap-1 shadow-inner sm:flex-wrap">
            {editorTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEditorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveEditorTab(tab.id as any)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#0F172A] shadow-[0_2px_8px_rgba(30,58,138,0.08)] scale-[1.01]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Form Container (Apple Glass Card) */}
          <div className="bg-white/95 backdrop-blur-xl border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-[0_10px_35px_rgba(30,58,138,0.04)] min-h-[500px]">
            {activeEditorTab === 'personal' && (
              <PersonalForm
                data={cvData.personal}
                onChange={(personal) => setCvData({ ...cvData, personal })}
                skills={cvData.skills.map((s) => s.name)}
              />
            )}

            {activeEditorTab === 'experience' && (
              <ExperienceForm
                experiences={cvData.experiences}
                onChange={(experiences) => setCvData({ ...cvData, experiences })}
              />
            )}

            {activeEditorTab === 'education' && (
              <EducationForm
                educations={cvData.educations}
                onChange={(educations) => setCvData({ ...cvData, educations })}
              />
            )}

            {activeEditorTab === 'skills' && (
              <SkillsForm
                skills={cvData.skills}
                onChange={(skills) => setCvData({ ...cvData, skills })}
                jobTitle={cvData.personal.jobTitle}
              />
            )}

            {activeEditorTab === 'languages' && (
              <LanguagesForm
                languages={cvData.languages}
                onChange={(languages) => setCvData({ ...cvData, languages })}
              />
            )}

            {activeEditorTab === 'certs' && (
              <CertificationsForm
                certifications={cvData.certifications}
                onChange={(certifications) => setCvData({ ...cvData, certifications })}
              />
            )}

            {activeEditorTab === 'design' && (
              <StyleCustomizer
                config={styleConfig}
                onChange={(cfg) => setStyleConfig(cfg)}
              />
            )}
          </div>

          {/* Payment Banner at bottom of editor (Apple Blue style) */}
          <div className="p-5 bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#0F172A] text-white rounded-3xl shadow-xl shadow-blue-900/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-400/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#EFF6FF]">Assinatura Mensal CV Pro</span>
                <span className="text-[10px] bg-white/20 text-[#EFF6FF] px-2.5 py-0.5 rounded-full font-bold border border-white/25">
                  {isPremium ? 'Plano Ativo' : `${MONTHLY_PRICE_MZN} MT / mês`}
                </span>
              </div>
              <p className="text-xs text-[#BFDBFE]">
                Pagamento seguro por Cartão Bancário (Visa, Mastercard, Débito e Crédito).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="shrink-0 px-4 py-2.5 bg-gradient-to-b from-white to-[#EFF6FF] hover:from-white hover:to-[#DBEAFE] text-[#1E40AF] rounded-2xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              {isPremium ? 'Subscrição Pro Ativa' : 'Desbloquear PDF'}
            </button>
          </div>
        </div>

        {/* Right Column: Live A4 Resume Preview */}
        <div
          className={`${
            isFullscreenPreviewOpen
              ? 'fixed inset-0 z-[100] bg-slate-200 flex flex-col'
              : `lg:col-span-6 space-y-4 ${
                  mobileTab === 'edit' ? 'hidden lg:block' : 'block'
                }`
          }`}
        >
          {/* Top Preview Controls Header */}
          {!isFullscreenPreviewOpen && (
            <div className="bg-white/90 backdrop-blur-xl border border-[#E2E8F0] rounded-3xl px-5 py-3.5 shadow-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-bold text-[#0F172A] truncate">
                  Pré-visualização (A4)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreviewOpen(!isFullscreenPreviewOpen)}
                  className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors lg:hidden"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="btn-apple-3d inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'A gerar...' : 'Baixar PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Document Preview Stage (Apple Studio Canvas) */}
          <div className={`${!isFullscreenPreviewOpen ? 'bg-gradient-to-b from-[#E2E8F0] to-[#CBD5E1] p-4 sm:p-8 rounded-3xl border border-[#CBD5E1] shadow-inner' : 'flex-1 overflow-y-auto flex flex-col relative'}`}>
            {isFullscreenPreviewOpen && (
              <button
                type="button"
                onClick={() => setIsFullscreenPreviewOpen(false)}
                className="absolute top-4 right-4 z-[110] bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 p-3 rounded-full shadow-lg transition-transform active:scale-95"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
            <ResumePreview
              data={cvData}
              config={styleConfig}
              isPremium={isPremium}
              onUnlockClick={() => setIsPaymentModalOpen(true)}
              isFullscreen={isFullscreenPreviewOpen}
            />
          </div>
        </div>
      </main>

      {/* Payment Checkout Modal (Cartão Bancário Netshop) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        monthlyPriceMzn={MONTHLY_PRICE_MZN}
        onPaymentSuccess={handlePaymentSuccess}
        onDownloadPdfNow={handleDownloadPdf}
        onRequireAuth={() => openAuth('register')}
      />

      {/* Auth Modal (3 Steps Registration & Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          showToast('Sessão autenticada!');
        }}
      />

      {/* Cover Letter & Motivation Generator Modal */}
      {isCoverLetterOpen && (
        <CoverLetterGenerator
          cvData={cvData}
          onClose={() => setIsCoverLetterOpen(false)}
        />
      )}

      {/* Floating App Install Recommendation Pop-up Modal */}
      <InstallAppBanner 
        forceOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Floating WhatsApp Support Widget */}
      <WhatsAppWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainCVApp />
    </AuthProvider>
  );
}
