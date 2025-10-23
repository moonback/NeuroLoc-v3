import { useState, useEffect } from 'react';
import { messagesService } from '../services/messages.service';
import { Message, Conversation } from '../types';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations
  };
};

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    const subscription = messagesService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = async (content: string, receiverId: string, objectId?: string) => {
    try {
      const message = await messagesService.sendMessage({
        conversation_id: conversationId,
        receiver_id: receiverId,
        content,
        object_id: objectId
      });
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  };
};
