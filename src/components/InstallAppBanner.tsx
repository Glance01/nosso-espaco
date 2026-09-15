import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, CheckCircle2, Apple, Monitor, ArrowRight, Share2, PlusSquare, MoreVertical } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface InstallAppBannerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({ forceOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detect device to auto-select right instruction tab
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveGuideTab('ios');
    } else if (/android/.test(userAgent)) {
      setActiveGuideTab('android');
    } else {
      setActiveGuideTab('desktop');
    }

    // Capture PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Listen to external forceOpen triggers (e.g. clicking "Instalar App" in Navbar)
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setTimeout(() => {
          setIsOpen(false);
          if (onClose) onClose();
        }, 1500);
      }
      setDeferredPrompt(null);
    } else {
      // If native prompt is not directly available (like Safari iOS or inside iframe), show the clear guided steps
      setShowInstructions(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      id="app-install-popup-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-install-title"
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Gradient Accent */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 w-full" />

        {/* Close Button */}
        <button
          type="button"
          id="btn-close-install-modal"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer z-10"
          aria-label="Fechar pop up"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-6 text-center">
          {/* App Icon */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3 relative flex items-center justify-center">
            <AppLogo className="w-full h-full shadow-lg rounded-2xl" />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-md">
              <Download className="w-4 h-4" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aplicação Oficial</span>
          </div>

          <h3 id="modal-install-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Instalar o Candidate-se
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Instale a aplicação no seu telemóvel ou computador para acesso rápido e criação de currículos mesmo offline.
          </p>

          {/* Value Propositions */}
          <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold text-slate-900">Acesso em 1 toque:</span> Abra direto do ecrã inicial como uma app nativa.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold text-slate-900">Funciona Offline:</span> Edite e consulte os seus currículos sem gastar dados.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold text-slate-900">Ultraleve e Gratuito:</span> Não ocupa a memória do seu telemóvel.
              </div>
            </div>
          </div>

          {/* If instructions are triggered */}
          {showInstructions && (
            <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-left animate-in fade-in">
              <div className="flex items-center justify-between gap-1 mb-3 border-b border-blue-200/60 pb-2">
                <span className="text-xs font-bold text-blue-900">Como instalar no seu dispositivo:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('android')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${activeGuideTab === 'android' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('ios')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${activeGuideTab === 'ios' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
                  >
                    iPhone
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('desktop')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${activeGuideTab === 'desktop' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
                  >
                    PC
                  </button>
                </div>
              </div>

              {activeGuideTab === 'android' && (
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Toque no menu do Chrome <strong className="inline-flex items-center gap-0.5 font-bold text-slate-900">(3 pontos <MoreVertical className="w-3.5 h-3.5 inline" />)</strong>.</li>
                  <li>Selecione <strong className="font-bold text-blue-800">"Instalar aplicação"</strong> ou <strong className="font-bold text-blue-800">"Adicionar ao ecrã inicial"</strong>.</li>
                  <li>Toque em <strong className="font-bold text-blue-800">"Instalar"</strong> para concluir.</li>
                </ol>
              )}

              {activeGuideTab === 'ios' && (
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                  <li>No Safari, toque no botão <strong className="inline-flex items-center gap-0.5 font-bold text-slate-900">Partilhar <Share2 className="w-3.5 h-3.5 inline text-blue-600" /></strong> na barra inferior.</li>
                  <li>Role para baixo e selecione <strong className="inline-flex items-center gap-0.5 font-bold text-blue-800"><PlusSquare className="w-3.5 h-3.5 inline" /> "Adicionar ao Ecrã Principal"</strong>.</li>
                  <li>Toque em <strong className="font-bold text-blue-800">"Adicionar"</strong> no canto superior direito.</li>
                </ol>
              )}

              {activeGuideTab === 'desktop' && (
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Clique no ícone de instalação <strong className="inline-flex items-center gap-0.5 font-bold text-blue-800"><Download className="w-3.5 h-3.5 inline" /></strong> na barra de endereço do navegador.</li>
                  <li>Ou abra o menu do navegador e clique em <strong className="font-bold text-blue-800">"Instalar Candidate-se"</strong>.</li>
                </ol>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              id="btn-install-app-now"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>{showInstructions ? 'Seguir os Passos Acima' : 'Instalar Aplicação Agora'}</span>
            </button>

            <button
              type="button"
              id="btn-dismiss-install-modal"
              onClick={handleClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Continuar no Navegador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
