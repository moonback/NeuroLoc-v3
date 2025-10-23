import { supabase } from './supabase';
import { Message, Conversation, CreateMessageInput } from '../types';

export const messagesService = {
  async getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*),
        object:objects(*)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!messages) return [];

    const conversationsMap = new Map<string, Conversation>();

    messages.forEach((msg) => {
      const convId = msg.conversation_id;
      const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;

      if (!conversationsMap.has(convId)) {
        const unreadCount = messages.filter(
          m => m.conversation_id === convId &&
               m.receiver_id === user.id &&
               !m.read
        ).length;

        conversationsMap.set(convId, {
          conversation_id: convId,
          other_user: otherUser,
          last_message: msg,
          unread_count: unreadCount,
          object: msg.object || undefined
        });
      }
    });

    return Array.from(conversationsMap.values());
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*),
        object:objects(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(input: CreateMessageInput): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...input,
        sender_id: user.id
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*),
        object:objects(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  async markConversationAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (error) throw error;
  },

  generateConversationId(userId1: string, userId2: string, objectId?: string): string {
    const sortedIds = [userId1, userId2].sort();
    return objectId
      ? `${sortedIds[0]}_${sortedIds[1]}_${objectId}`
      : `${sortedIds[0]}_${sortedIds[1]}`;
  },

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(*),
              receiver:profiles!messages_receiver_id_fkey(*),
              object:objects(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return subscription;
  },

  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  subscribeToAllMessages(callback: (message: Message) => void) {
    const subscription = supabase
      .channel('all_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(*),
              receiver:profiles!messages_receiver_id_fkey(*),
              object:objects(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return subscription;
  }
};
