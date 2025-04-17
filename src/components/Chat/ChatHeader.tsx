import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { PROVIDERS } from '../../data/providers';
import Dropdown, { DropdownItem } from '../ui/Dropdown';
import { MoreVertical, Edit2, Trash2, Download, Star, Code, BookOpen, ChevronDown } from 'lucide-react';

const ChatHeader: React.FC = () => {
  const { 
    conversations, 
    currentConversationId, 
    updateCurrentConversationTitle,
    deleteCurrentConversation,
    starConversation
  } = useChat();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  const currentConversation = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId) 
    : null;
  
  useEffect(() => {
    if (currentConversation) {
      setTitle(currentConversation.title);
    }
  }, [currentConversation]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleSubmit = () => {
    if (!currentConversationId) return;
    
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      updateCurrentConversationTitle(trimmedTitle);
    } else {
      setTitle(currentConversation?.title || '');
    }
    
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(currentConversation?.title || '');
      setIsEditing(false);
    }
  };
  
  const handleStarClick = () => {
    if (!currentConversationId) return;
    starConversation(currentConversationId, !currentConversation?.starred);
  };
  
  const handleExport = (format: 'json' | 'txt') => {
    if (!currentConversation) return;
    
    let content = '';
    let filename = `${currentConversation.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    let mimeType = '';
    
    if (format === 'json') {
      content = JSON.stringify(currentConversation, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    } else if (format === 'txt') {
      content = currentConversation.messages.map(msg => 
        `[${msg.role.toUpperCase()}]\n${msg.content}\n\n`
      ).join('');
      filename += '.txt';
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleModelSelector = () => {
    setShowModelSelector(!showModelSelector);
  };
  
  if (!currentConversation) {
    return <div className="h-16"></div>;
  }
  
  const providerInfo = PROVIDERS[currentConversation.provider];
  const modelInfo = providerInfo.models.find(m => m.id === currentConversation.modelId);
  
  return (
    <div className="h-16 border-b border-gray-700 bg-[#222] px-6 flex items-center justify-between rounded-t-3xl shadow-md">
      <div className="flex items-center space-x-4">
        {isEditing ? (
          <div className="flex items-center">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              className="bg-gray-700 border-none rounded px-3 py-1.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-gray-200"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleStarClick} className="focus:outline-none">
              <Star 
                size={16} 
                className={currentConversation.starred 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-500 hover:text-gray-300'
                } 
              />
            </button>
            <h2 
              className="font-medium text-gray-200 cursor-pointer hover:underline"
              onClick={() => setIsEditing(true)}
            >
              {currentConversation.title}
            </h2>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative model-selector">
          <button
            onClick={toggleModelSelector}
            className="px-3 py-1.5 text-sm rounded-full bg-gray-700 text-gray-200 flex items-center gap-1.5 hover:bg-gray-600 transition-colors"
          >
            <span>{providerInfo.name} / {modelInfo?.name || currentConversation.modelId}</span>
            <ChevronDown size={14} />
          </button>
          
          {showModelSelector && (
            <div className="absolute right-0 mt-2 w-64 bg-[#222] rounded-lg shadow-lg z-10 border border-gray-700">
              <div className="py-2">
                {providerInfo.models.map(model => (
                  <button
                    key={model.id}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700 flex items-center gap-2 transition-colors text-gray-200"
                  >
                    <BookOpen size={14} className="text-[var(--color-primary)]" />
                    <div>
                      <div className="font-medium">{model.name}</div>
                      {model.description && (
                        <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Dropdown
          label={<MoreVertical size={18} />}
          position="right"
          buttonClassName="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700 transition-colors"
        >
          <DropdownItem onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-2">
              <Edit2 size={14} />
              <span>Rename</span>
            </div>
          </DropdownItem>
          
          <DropdownItem onClick={() => handleExport('json')}>
            <div className="flex items-center gap-2">
              <Code size={14} />
              <span>Export as JSON</span>
            </div>
          </DropdownItem>
          
          <DropdownItem onClick={() => handleExport('txt')}>
            <div className="flex items-center gap-2">
              <Download size={14} />
              <span>Export as TXT</span>
            </div>
          </DropdownItem>
          
          <DropdownItem onClick={deleteCurrentConversation} className="text-red-500 hover:text-red-400">
            <div className="flex items-center gap-2">
              <Trash2 size={14} />
              <span>Delete conversation</span>
            </div>
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};

export default ChatHeader;