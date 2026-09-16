import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission;
  requestPushPermission: () => Promise<boolean>;
  sendLocalPush: (title: string, body: string, options?: NotificationOptions) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Dica de Ouro para Moçambique 🇲🇿',
    message: 'Recrutadores em Maputo valorizam competências técnicas claras e números nos resultados das suas experiências.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    type: 'career',
    actionText: 'Melhorar Resumo',
    actionType: 'aiSummary',
  },
  {
    id: 'notif-2',
    title: 'Nova Ferramenta: Carta de Apresentação ✉️',
    message: 'Agora pode gerar uma Carta de Motivação adaptada à sua vaga com inteligência artificial num só clique.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: false,
    type: 'update',
    actionText: 'Criar Carta',
    actionType: 'coverLetter',
  },
  {
    id: 'notif-3',
    title: 'Modo Offline Ativo 📱',
    message: 'O Candidate-se funciona perfeitamente sem internet. Instale no seu ecrã inicial para editar onde quiser!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    type: 'system',
  },
  {
    id: 'notif-4',
    title: 'Oportunidades no Mercado de Trabalho 💼',
    message: 'Mais de 120 empresas nacionais e multinacionais estão a recrutar com exigência de CVs em formato A4 limpo.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    type: 'job',
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('candidate_se_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading stored notifications:', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    try {
      localStorage.setItem('candidate_se_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Error persisting notifications:', e);
    }
  }, [notifications]);

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        sendLocalPush(
          'Notificações Ativadas! 🎉',
          'Você receberá alertas de dicas de emprego e atualizações do seu currículo.'
        );
        addNotification({
          title: 'Notificações Ativadas com Sucesso',
          message: 'Está tudo pronto para receber alertas profissionais diretamente no seu dispositivo.',
          type: 'system',
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  };

  const sendLocalPush = (title: string, body: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon: '/logo.svg',
              badge: '/logo.svg',
              ...options,
            });
          }).catch(() => {
            new Notification(title, {
              body,
              icon: '/logo.svg',
              ...options,
            });
          });
        } else {
          new Notification(title, {
            body,
            icon: '/logo.svg',
            ...options,
          });
        }
      } catch (e) {
        console.warn('Could not trigger native notification:', e);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Also trigger push if granted
    if (permission === 'granted') {
      sendLocalPush(newNotif.title, newNotif.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
