import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations } from '../hooks/useMessages';
import { messagesService } from '../services/messages.service';
import { ChatBox } from '../components/chat/ChatBox';
import { Loader } from '../components/common/Loader';
import { MessageSquare, User } from 'lucide-react';

export const Messages = () => {
  const [searchParams] = useSearchParams();
  const { conversations, loading, refetch } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [objectId, setObjectId] = useState<string | null>(null);

  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    const receiverParam = searchParams.get('receiver');
    const objectParam = searchParams.get('object');

    if (conversationParam) {
      setSelectedConversation(conversationParam);
      setReceiverId(receiverParam);
      setObjectId(objectParam);
    }
  }, [searchParams]);

  const handleSelectConversation = (convId: string, otherUserId: string, objId?: string) => {
    setSelectedConversation(convId);
    setReceiverId(otherUserId);
    setObjectId(objId || null);
    messagesService.markConversationAsRead(convId);
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="border-r border-gray-200">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>

              <div className="divide-y overflow-y-auto" style={{ maxHeight: '600px' }}>
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      onClick={() =>
                        handleSelectConversation(
                          conv.conversation_id,
                          conv.other_user.id,
                          conv.object?.id
                        )
                      }
                      className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                        selectedConversation === conv.conversation_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {conv.other_user.full_name || conv.other_user.email}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          {conv.object && (
                            <p className="text-xs text-gray-500 mb-1">
                              Objet: {conv.object.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate">
                            {conv.last_message.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedConversation && receiverId ? (
                <ChatBox
                  conversationId={selectedConversation}
                  receiverId={receiverId}
                  objectId={objectId || undefined}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Sélectionnez une conversation pour commencer
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
