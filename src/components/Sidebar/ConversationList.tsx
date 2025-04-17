import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { PROVIDERS } from '../../data/providers';
import { Bot, MessageSquare, Plus, Star, Trash2 } from 'lucide-react';
import Button from '../common/Button';

interface ConversationListProps {
  onNewChat: () => void;
  isCollapsed?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ onNewChat, isCollapsed = false }) => {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversationId,
    deleteCurrentConversation
  } = useChat();
  
  // Sort conversations by updateAt (most recent first)
  // and separate starred conversations
  const starredConversations = conversations
    .filter(c => c.starred)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  
  const regularConversations = conversations
    .filter(c => !c.starred)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <>
      <div className="p-4">
        <Button
          variant="primary"
          fullWidth
          onClick={onNewChat}
          className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'justify-center gap-2 py-2.5'} bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]`}
        >
          <Plus size={16} />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Conversations
        </div>
      )}
      
      {starredConversations.length > 0 && !isCollapsed && (
        <div className="mb-4">
          <div className="px-4 py-1 text-xs font-medium text-gray-400 flex items-center gap-1">
            <Star size={12} className="text-yellow-400" />
            <span>Starred</span>
          </div>
          <ul className="space-y-1 px-3">
            {starredConversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => setCurrentConversationId(conversation.id)}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>
      )}
      
      {regularConversations.length > 0 && (
        <div>
          {!isCollapsed && (
            <div className="px-4 py-1 text-xs font-medium text-gray-400 flex items-center gap-1">
              <MessageSquare size={12} />
              <span>Recent</span>
            </div>
          )}
          <ul className="space-y-1 px-3">
            {regularConversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => setCurrentConversationId(conversation.id)}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>
      )}
      
      {conversations.length === 0 && (
        <div className="px-4 py-6 text-center text-gray-400">
          <Bot size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-1">Start a new chat to begin</p>
        </div>
      )}
    </>
  );
};

interface ConversationItemProps {
  conversation: {
    id: string;
    title: string;
    provider: string;
    modelId: string;
    updatedAt: number;
  };
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  isCollapsed = false
}) => {
  const { deleteConversation } = useChat();
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversation.id);
    }
  };
  
  const providerInfo = PROVIDERS[conversation.provider as keyof typeof PROVIDERS];
  
  if (isCollapsed) {
    return (
      <li
        className={`p-2 rounded-md flex items-center justify-center cursor-pointer ${
          isActive 
            ? 'bg-gray-700' 
            : 'hover:bg-gray-800'
        }`}
        onClick={onClick}
      >
        <div className={`p-1.5 rounded-md ${
          isActive 
            ? 'text-[var(--color-primary)]' 
            : 'text-gray-400'
        }`}>
          <MessageSquare size={16} />
        </div>
      </li>
    );
  }
  
  return (
    <li
      className={`p-2.5 rounded-lg flex items-center justify-between group cursor-pointer ${
        isActive 
          ? 'bg-gray-700' 
          : 'hover:bg-gray-800 text-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className={`p-1.5 rounded-md ${
          isActive 
            ? 'text-[var(--color-primary)]' 
            : 'text-gray-400'
        }`}>
          <Bot size={14} />
        </div>
        
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-200">
            {conversation.title}
          </p>
          <div className="flex items-center text-xs text-gray-500 gap-1 mt-0.5">
            <span className="truncate">{providerInfo?.name || 'Unknown'}</span>
            <span>•</span>
            <span>{new Date(conversation.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:bg-gray-600 hover:text-gray-200"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
};

export default ConversationList;