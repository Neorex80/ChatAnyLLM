import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Send, Loader2, Plus, Search, MoreHorizontal, Mic } from 'lucide-react';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, isGenerating, currentConversationId } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSend = async () => {
    if (!message.trim() || isGenerating || !currentConversationId) return;
    
    try {
      const trimmedMessage = message.trim();
      setMessage('');
      await sendMessage(trimmedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#18191A] bg-opacity-60 backdrop-blur-md rounded-2xl shadow-lg p-2">
          <div className="relative rounded-xl border border-gray-600 bg-[#222] shadow-md">
            <div className="flex items-center pl-2 text-gray-300 space-x-1">
              <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <Plus size={18} />
              </button>
              <div className="flex items-center">
                <button className="p-2 rounded-full hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                  <Search size={16} />
                  <span className="text-sm font-medium">Search</span>
                </button>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                <span className="text-sm font-medium">Reason</span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="w-full resize-none border-0 bg-transparent py-3 px-4 pr-12 text-gray-100 placeholder:text-gray-400 focus:ring-0 focus:outline-none text-sm"
              rows={1}
              disabled={isGenerating || !currentConversationId}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button 
                className="p-1.5 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
              >
                <Mic size={18} />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || isGenerating || !currentConversationId}
                className={`p-1.5 rounded-full transition-colors ${
                  message.trim() && !isGenerating && currentConversationId
                    ? 'text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400 text-center">
          <span>ChatAnyLLM can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;