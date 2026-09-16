import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  Briefcase,
  Lightbulb,
  Info,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionType: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onAction,
}) => {
  const {
    notifications,
    unreadCount,
    permission,
    requestPushPermission,
    sendLocalPush,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isRequestingPush, setIsRequestingPush] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleEnablePush = async () => {
    setIsRequestingPush(true);
    await requestPushPermission();
    setIsRequestingPush(false);
  };

  const handleTestNotification = () => {
    sendLocalPush(
      'Notificação de Teste 🚀',
      'O sistema de notificações do Candidate-se está ativo e a funcionar a 100%!'
    );
    addNotification({
      title: 'Teste de Alerta Bem-sucedido',
      message: 'O seu dispositivo está configurado para receber notificações em tempo real.',
      type: 'system',
    });
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 2) return 'Agora mesmo';
      if (diffMinutes < 60) return `Há ${diffMinutes} min`;
      if (diffHours < 24) return `Há ${diffHours} h`;
      if (diffDays === 1) return 'Ontem';
      return `Há ${diffDays} dias`;
    } catch {
      return 'Recentemente';
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'career':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-amber-600" />;
      case 'update':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'system':
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'career':
        return 'bg-blue-50 border-blue-200/60 text-blue-700';
      case 'tip':
        return 'bg-amber-50 border-amber-200/60 text-amber-700';
      case 'update':
        return 'bg-purple-50 border-purple-200/60 text-purple-700';
      case 'job':
        return 'bg-emerald-50 border-emerald-200/60 text-emerald-700';
      case 'system':
      default:
        return 'bg-indigo-50 border-indigo-200/60 text-indigo-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        id="notification-drawer"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Notificações & Alertas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Tudo atualizado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="p-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Lidas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Notification Banner */}
        <div className="px-4 py-3 bg-blue-50/70 border-b border-blue-100/70">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950">
                  {permission === 'granted'
                    ? 'Notificações no Telemóvel Ativas'
                    : 'Receber Alertas de Emprego no Ecrã'}
                </p>
                <p className="text-[11px] text-blue-700 leading-tight mt-0.5">
                  {permission === 'granted'
                    ? 'Receberá avisos importantes mesmo com a app fechada.'
                    : 'Ative para ser avisado sobre novas dicas e atualizações.'}
                </p>
              </div>
            </div>

            {permission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isRequestingPush}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isRequestingPush ? 'A ativar...' : 'Ativar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-semibold text-[11px] rounded-lg border border-blue-200 shadow-2xs transition-all shrink-0 cursor-pointer flex items-center gap-1"
                title="Testar notificação no navegador"
              >
                <Send className="w-3 h-3" />
                <span>Testar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs: All / Unread */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Não lidas ({unreadCount})
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] text-slate-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-50">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 stroke-1" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Sem notificações</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                {activeTab === 'unread'
                  ? 'Não tem nenhuma notificação por ler no momento.'
                  : 'Você receberá atualizações de carreira e dicas do seu currículo aqui.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  notif.read
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-blue-50/40 border-blue-100 hover:border-blue-200'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-600" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getBadgeBg(
                      notif.type
                    )}`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/60">
                      <span className="text-[10px] font-medium text-slate-400">
                        {formatRelativeTime(notif.timestamp)}
                      </span>

                      <div className="flex items-center gap-2">
                        {notif.actionText && onAction && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                              if (notif.actionType) onAction(notif.actionType);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>{notif.actionText}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors"
                          title="Remover notificação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Candidate-se Moçambique • Alertas em Tempo Real
          </p>
        </div>
      </div>
    </div>
  );
};
