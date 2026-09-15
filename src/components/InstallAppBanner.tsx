import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Check, Smartphone, Share2, PlusSquare, MoreVertical } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface InstallAppBannerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({ forceOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check device type
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveGuideTab('ios');
    } else if (/android/.test(ua)) {
      setActiveGuideTab('android');
    } else {
      setActiveGuideTab('desktop');
    }

    // Capture PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto show banner if not dismissed before
      const dismissed = sessionStorage.getItem('candidate_se_install_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If no beforeinstallprompt (e.g. iOS or already loaded), show after gentle delay if not dismissed
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('candidate_se_install_dismissed');
      if (!dismissed && !isStandalone) {
        setIsOpen(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  // Listen to external forceOpen (e.g. clicking "Instalar App" in Navbar)
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setShowInstructions(false);
    }
  }, [forceOpen]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsOpen(false);
          if (onClose) onClose();
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowInstructions(true);
      }
    } else {
      // If native prompt is not available (like iOS Safari), show guided steps
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('candidate_se_install_dismissed', 'true');
    if (onClose) onClose();
  };

  if (!isOpen || isInstalled) return null;

  return (
    <aside
      id="app-install-mini-banner"
      aria-label="Instalar aplicação"
      className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:right-4 sm:left-auto sm:w-[380px] z-40 animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-2xl p-3 sm:p-3.5 transition-all">
        {/* Main Compact Row */}
        <div className="flex items-center gap-3">
          {/* App Icon */}
          <div className="w-10 h-10 shrink-0 relative flex items-center justify-center">
            <AppLogo className="w-full h-full shadow-xs rounded-xl" />
          </div>

          {/* Texts */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                Candidate-se
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 leading-none shrink-0">
                Grátis
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
              Acesso rápido e crie currículos offline
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="btn-mini-install"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>

            <button
              type="button"
              id="btn-mini-close-install"
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Fechar recomendação"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guided Steps (Only expands if native install is not direct, e.g. Safari iOS or Chrome manual) */}
        {showInstructions && (
          <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700">Como adicionar ao seu ecrã:</span>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('android')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    activeGuideTab === 'android' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('ios')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    activeGuideTab === 'ios' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  iPhone
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('desktop')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    activeGuideTab === 'desktop' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  PC
                </button>
              </div>
            </div>

            {activeGuideTab === 'android' && (
              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Toque nos <strong>3 pontos (⋮)</strong> no topo do Chrome</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar ao ecrã principal"</strong></span>
                </div>
              </div>
            )}

            {activeGuideTab === 'ios' && (
              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>No Safari, toque no ícone de <strong>Partilhar <Share2 className="w-3 h-3 inline text-blue-600" /></strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Escolha <strong>"Adicionar ao Ecrã Principal"</strong></span>
                </div>
              </div>
            )}

            {activeGuideTab === 'desktop' && (
              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Clique no ícone de <strong>instalar <Download className="w-3 h-3 inline text-blue-600" /></strong> na barra de endereço</span>
                </div>
              </div>
            )}

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg"
              >
                Ocultar ajuda
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
