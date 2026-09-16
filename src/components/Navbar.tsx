import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { SubscriptionInfo } from '../types';
import { AppLogo } from './AppLogo';
import {
  FileText,
  Sparkles,
  Download,
  RotateCcw,
  BookOpen,
  Settings,
  CheckCircle2,
  User,
  LogOut,
  ShieldCheck,
  FolderOpen,
  ChevronDown,
  Menu,
  X,
  Lock,
  MessageCircle,
  Bell
} from 'lucide-react';

interface NavbarProps {
  subscription: SubscriptionInfo;
  onOpenPayment: () => void;
  onLoadSampleData: () => void;
  onClearData: () => void;
  onDownloadPdf: () => void;
  isExporting: boolean;
  activeTab: 'edit' | 'preview';
  setActiveTab: (tab: 'edit' | 'preview') => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSaveCloudResume?: () => void;
  isSavingCloud?: boolean;
  onOpenCoverLetter: () => void;
  onOpenInstallApp?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  subscription,
  onOpenPayment,
  onLoadSampleData,
  onClearData,
  onDownloadPdf,
  isExporting,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSaveCloudResume,
  isSavingCloud = false,
  onOpenCoverLetter,
  onOpenInstallApp,
  onOpenNotifications,
}) => {
  const { currentUser, userProfile, logout, isPremium } = useAuth();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-[0_4px_20px_-10px_rgba(30,58,138,0.05)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <AppLogo className="w-9 h-9 sm:w-11 sm:h-11 shadow-md rounded-2xl" />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
                Candidate-se
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                {currentUser ? (isPremium ? 'Pro Ativado' : 'Conta Grátis') : 'Criação Grátis'}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#64748B] hidden lg:block">
              Design estilo Apple • Pagamento Seguro por Cartão Bancário (Visa & Mastercard)
            </p>
          </div>
        </div>

        {/* Center: View Toggle (Editar / Ver A4) - Always visible & prominent on mobile */}
        <div className="flex bg-[#E2E8F0] p-1 rounded-2xl border border-[#CBD5E1] text-xs font-semibold shrink-0">
          <button
            type="button"
            id="mobile-tab-edit"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            id="mobile-tab-preview"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Ver A4
          </button>
        </div>

        {/* Right Desktop/Tablet Actions */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-3">
          {/* Sample Data & Clear Action Pills */}
          <div className="flex items-center gap-1.5 bg-[#F1F5F9]/80 p-1 rounded-2xl border border-[#E2E8F0]">
            <button
              type="button"
              id="btn-sample-data"
              onClick={onLoadSampleData}
              className="px-3 py-1.5 text-xs font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-white/90 rounded-xl transition-all flex items-center gap-1.5"
              title="Preencher com exemplo profissional"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Exemplo</span>
            </button>
            <button
              type="button"
              id="btn-clear-data"
              onClick={onClearData}
              className="p-1.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all"
              title="Limpar formulário"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cover Letter Button Desktop */}
          <button
            type="button"
            id="btn-cover-letter-desktop"
            onClick={onOpenCoverLetter}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
            title="Gerar Carta de Apresentação e Motivação"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Carta de Motivação</span>
          </button>

          {/* Cloud Save Button for logged in users */}
          {currentUser && onSaveCloudResume && (
            <button
              type="button"
              id="btn-save-cloud-desktop"
              onClick={onSaveCloudResume}
              disabled={isSavingCloud}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              title="Guardar alterações na nuvem"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>{isSavingCloud ? 'A guardar...' : 'Guardar CV'}</span>
            </button>
          )}

          {/* Install App Button Desktop */}
          {onOpenInstallApp && (
            <button
              type="button"
              id="btn-install-app-desktop"
              onClick={onOpenInstallApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] shrink-0"
              title="Instalar Candidate-se no seu telemóvel ou computador"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {/* Notifications Trigger Desktop */}
          {onOpenNotifications && (
            <button
              type="button"
              id="btn-notifications-desktop"
              onClick={onOpenNotifications}
              className="relative p-2.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-blue-600 rounded-2xl transition-all active:scale-[0.98] shrink-0 cursor-pointer"
              title="Notificações e Dicas de Emprego"
              aria-label="Abrir notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* WhatsApp Support Button Desktop */}
          <a
            href="https://wa.me/258864813115?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Candidate-se."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-200 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Contactar suporte no WhatsApp (+258 86 481 3115)"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span className="hidden xl:inline">+258 86 481 3115</span>
          </a>

          {/* User Auth Trigger / User Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                id="btn-user-profile-menu"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-2xl transition-all text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] leading-tight truncate max-w-[110px]">
                    {userProfile?.displayName || 'Minha Conta'}
                  </div>
                  <div className="text-[10px] text-blue-700 font-semibold">
                    {isPremium ? 'Plano Pro' : 'Plano Gratuito'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{userProfile?.displayName || currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    {userProfile?.cityProvince && (
                      <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {userProfile.cityProvince}
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    {!isPremium && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenPayment();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        Ativar Plano Pro (299 MT)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminar Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-login-header"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-2xl transition-all"
              >
                Entrar
              </button>
              <button
                type="button"
                id="btn-register-header"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Criar Conta</span>
              </button>
            </div>
          )}

          {/* Subscription Status or Trigger */}
          {isPremium ? (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-2xl text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              <span>Pro Ativo</span>
            </div>
          ) : (
            <button
              type="button"
              id="btn-unlock-premium-nav"
              onClick={onOpenPayment}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE] hover:from-[#DBEAFE] hover:to-[#BFDBFE] text-[#1D4ED8] border border-[#93C5FD] rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Pro (299 MT)</span>
            </button>
          )}

          {/* Export PDF Button (Apple 3D style) */}
          <button
            type="button"
            id="btn-download-pdf-main"
            onClick={onDownloadPdf}
            disabled={isExporting}
            className="btn-apple-3d inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-2xl text-xs sm:text-sm font-bold disabled:opacity-50 active:scale-[0.98] shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'A compilar...' : 'Baixar PDF'}</span>
          </button>
        </div>

        {/* Mobile Right Quick Action Group */}
        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          {/* Mobile Profile / Account Icon (Always Visible on Phones) */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                id="btn-mobile-user-profile"
                onClick={() => {
                  setShowMobileUserMenu(!showMobileUserMenu);
                  if (showMobileDrawer) setShowMobileDrawer(false);
                }}
                className="relative p-0.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100/80 active:scale-95 transition-all flex items-center justify-center"
                title="Meu Perfil"
                aria-label="Abrir perfil de utilizador"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                {isPremium && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Mobile User Dropdown Popover */}
              {showMobileUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
                    onClick={() => setShowMobileUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 border-b border-slate-100 mb-2 bg-slate-50/80 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {userProfile?.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0F172A] truncate">
                            {userProfile?.displayName || currentUser.displayName || 'Minha Conta'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isPremium ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isPremium ? '★ Plano Pro Ativo' : 'Plano Gratuito'}
                        </span>
                        {userProfile?.cityProvince && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                            {userProfile.cityProvince}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {onSaveCloudResume && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMobileUserMenu(false);
                            onSaveCloudResume();
                          }}
                          disabled={isSavingCloud}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <FolderOpen className="w-4 h-4 text-blue-600" />
                          <span>{isSavingCloud ? 'A guardar...' : 'Guardar CV na Nuvem'}</span>
                        </button>
                      )}

                      {!isPremium && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMobileUserMenu(false);
                            onOpenPayment();
                          }}
                          className="w-full text-left px-2.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>Ativar Plano Pro (299 MT)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Terminar Sessão</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              id="btn-mobile-user-login"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1 p-1.5 xs:px-2.5 xs:py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold active:scale-[0.95] transition-all"
              title="Entrar na Minha Conta"
              aria-label="Entrar na Minha Conta"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span className="hidden xs:inline text-[11px]">Entrar</span>
            </button>
          )}

          {/* Mobile Main Download PDF Button */}
          <button
            type="button"
            id="btn-mobile-download-pdf"
            onClick={onDownloadPdf}
            disabled={isExporting}
            className="btn-apple-3d inline-flex items-center gap-1 px-3 py-2 text-white rounded-xl text-xs font-bold disabled:opacity-50 active:scale-[0.95]"
            title="Descarregar PDF do Currículo"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isExporting ? '...' : 'PDF'}</span>
          </button>

          {/* Pro indicator / Upgrade Pill for Mobile */}
          {!isPremium ? (
            <button
              type="button"
              id="btn-mobile-pro-upgrade"
              onClick={onOpenPayment}
              className="hidden sm:flex p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold active:scale-[0.95] items-center justify-center"
              title="Ativar Plano Pro"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
            </button>
          ) : (
            <div className="hidden sm:flex p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl items-center justify-center" title="Plano Pro Ativo">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}

          {/* Mobile Notification Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              id="btn-mobile-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-[0.95] border border-slate-200"
              title="Notificações"
              aria-label="Abrir notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Full Menu Toggle (Hamburger) */}
          <button
            type="button"
            id="btn-mobile-menu-toggle"
            onClick={() => {
              setShowMobileDrawer(!showMobileDrawer);
              if (showMobileUserMenu) setShowMobileUserMenu(false);
            }}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-[0.95] border border-slate-200"
            aria-label="Menu de opções"
          >
            {showMobileDrawer ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Collapsible Complete Action Menu) */}
      {showMobileDrawer && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 shadow-lg">
          {/* User Profile Card / Auth Action on Mobile */}
          {currentUser ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {userProfile?.displayName || 'Minha Conta'}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">
                    {isPremium ? '✓ Plano Pro Ativo' : 'Conta Gratuita'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  logout();
                }}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-mobile-login"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-center"
              >
                Iniciar Sessão
              </button>
              <button
                type="button"
                id="btn-mobile-register"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenAuth('register');
                }}
                className="w-full py-2.5 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Criar Conta
              </button>
            </div>
          )}

          {/* Quick Utility Actions in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              id="btn-mobile-load-sample"
              onClick={() => {
                setShowMobileDrawer(false);
                onLoadSampleData();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Preencher Exemplo
            </button>
            
            <button
              type="button"
              id="btn-mobile-clear-data"
              onClick={() => {
                setShowMobileDrawer(false);
                onClearData();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Campos
            </button>
          </div>

          {/* Notifications Button in Drawer */}
          {onOpenNotifications && (
            <button
              type="button"
              id="btn-mobile-drawer-notifications"
              onClick={() => {
                setShowMobileDrawer(false);
                onOpenNotifications();
              }}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Notificações & Dicas de Emprego</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount} novas
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            id="btn-mobile-cover-letter"
            onClick={() => {
              setShowMobileDrawer(false);
              onOpenCoverLetter();
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Gerar Carta de Apresentação e Motivação</span>
          </button>

          {/* Cloud Save Action */}
          {currentUser && onSaveCloudResume && (
            <button
              type="button"
              id="btn-mobile-save-cloud"
              onClick={() => {
                setShowMobileDrawer(false);
                onSaveCloudResume();
              }}
              disabled={isSavingCloud}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              {isSavingCloud ? 'A guardar na nuvem...' : 'Guardar CV na Minha Conta'}
            </button>
          )}

          {/* Pro Upgrade Full CTA on Mobile */}
          {!isPremium && (
            <button
              type="button"
              id="btn-mobile-drawer-pro"
              onClick={() => {
                setShowMobileDrawer(false);
                onOpenPayment();
              }}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Ativar Plano Pro (299 MT)</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Cartão Bancário
              </span>
            </button>
          )}

          {/* Install App Mobile Drawer Button */}
          {onOpenInstallApp && (
            <button
              type="button"
              id="btn-mobile-drawer-install"
              onClick={() => {
                setShowMobileDrawer(false);
                onOpenInstallApp();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Instalar Aplicação no Telemóvel</span>
            </button>
          )}

          {/* WhatsApp Support Mobile Drawer */}
          <a
            href="https://wa.me/258864813115?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Candidate-se."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>Suporte WhatsApp: +258 86 481 3115</span>
          </a>
        </div>
      )}
    </header>
  );
};

