import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Input } from '../common/Input';

interface ChatBoxProps {
  conversationId: string;
  receiverId: string;
  objectId?: string;
}

export const ChatBox = ({ conversationId, receiverId, objectId }: ChatBoxProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(newMessage.trim(), receiverId, objectId);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex justify-center items-center h-full">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-brand-600" />
          </div>
          <h3 className="text-heading text-lg font-semibold">Messages</h3>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium mb-2">Aucun message</p>
            <p className="text-sm">Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-brand-500 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-brand-100' : 'text-neutral-500'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t border-neutral-200 p-4">
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              isLoading={isSending} 
              disabled={!newMessage.trim()}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Envoyer
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
