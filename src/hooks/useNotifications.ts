import { useState, useEffect } from 'react';
import { messagesService } from '../services/messages.service';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Demander la permission pour les notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const count = await messagesService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    requestNotificationPermission();

    if (!user) return;

    // Subscription en temps réel pour les nouveaux messages
    const subscription = messagesService.subscribeToAllMessages((newMessage) => {
      // Si le message est pour l'utilisateur actuel et non lu
      if (newMessage.receiver_id === user.id && !newMessage.read) {
        setUnreadCount(prev => prev + 1);
        
        // Notification toast pour nouveau message
        toast.success(`Nouveau message de ${newMessage.sender?.full_name || 'Quelqu\'un'}`, {
          duration: 4000,
          icon: '💬',
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        });

        // Effet sonore (optionnel)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nouveau message', {
            body: `Message de ${newMessage.sender?.full_name || 'Quelqu\'un'}`,
            icon: '/favicon.ico',
            tag: 'new-message'
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (conversationId: string) => {
    try {
      await messagesService.markConversationAsRead(conversationId);
      // Recalculer le nombre de messages non lus
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  return {
    unreadCount,
    loading,
    markAsRead,
    refetch: fetchUnreadCount,
    requestNotificationPermission
  };
};
