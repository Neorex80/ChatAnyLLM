import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import { useChat } from '../../contexts/ChatContext';
import { MessageSquare } from 'lucide-react';

const ChatThread: React.FC = () => {
  const { conversations, currentConversationId, isGenerating, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  
  const currentConversation = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId) 
    : null;
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleRegenerateResponse = async (messageId: string) => {
    if (!currentConversation || isGenerating || regeneratingMessageId) return;
    
    // Find the message and the preceding user message
    const messageIndex = currentConversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex <= 0) return;
    
    const aiMessage = currentConversation.messages[messageIndex];
    const userMessage = currentConversation.messages[messageIndex - 1];
    
    if (userMessage.role !== 'user') return;
    
    setRegeneratingMessageId(messageId);
    
    try {
      console.log('Regenerating response for message:', messageId);
      console.log('User message content:', userMessage.content);
      // Call the API to regenerate the response
      await sendMessage(userMessage.content, true, messageIndex);
    } catch (error) {
      console.error('Error regenerating response:', error);
    } finally {
      setRegeneratingMessageId(null);
    }
  };
  
  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
        <MessageSquare size={64} className="mb-4 opacity-20" />
        <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
        <p className="max-w-md">
          Select a conversation from the sidebar or start a new one to begin chatting
        </p>
      </div>
    );
  }
  
  if (currentConversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#111]">
        <div className="w-16 h-16 bg-[#333] rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={28} className="text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-200 mb-3">
          How can I assist you today?
        </h2>
        <p className="text-gray-400 max-w-md mb-8 text-lg">
          Ask me anything! I can help with information, coding, creative tasks, and more.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <button 
            className="text-left p-5 bg-[#222] rounded-xl hover:shadow-md transition-all border border-gray-700 hover:border-[var(--color-primary)] hover:scale-[1.02]"
            onClick={() => {
              console.log("Example clicked: Python web scraper");
              void sendMessage("Create a simple Python web scraper");
            }}
          >
            <p className="font-medium text-gray-200">Create a simple Python web scraper</p>
          </button>
          <button 
            className="text-left p-5 bg-[#222] rounded-xl hover:shadow-md transition-all border border-gray-700 hover:border-[var(--color-primary)] hover:scale-[1.02]"
            onClick={() => {
              console.log("Example clicked: Quantum computing");
              void sendMessage("Explain quantum computing in simple terms");
            }}
          >
            <p className="font-medium text-gray-200">Explain quantum computing in simple terms</p>
          </button>
          <button 
            className="text-left p-5 bg-[#222] rounded-xl hover:shadow-md transition-all border border-gray-700 hover:border-[var(--color-primary)] hover:scale-[1.02]"
            onClick={() => {
              console.log("Example clicked: AI story");
              void sendMessage("Write a creative short story about AI");
            }}
          >
            <p className="font-medium text-gray-200">Write a creative short story about AI</p>
          </button>
          <button 
            className="text-left p-5 bg-[#222] rounded-xl hover:shadow-md transition-all border border-gray-700 hover:border-[var(--color-primary)] hover:scale-[1.02]"
            onClick={() => {
              console.log("Example clicked: React skills");
              void sendMessage("How to improve my React.js skills?");
            }}
          >
            <p className="font-medium text-gray-200">How to improve my React.js skills?</p>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#111] pb-28">
      {currentConversation.messages.map(message => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          onRegenerateResponse={
            message.role === 'assistant' && !isGenerating && regeneratingMessageId === null
              ? () => handleRegenerateResponse(message.id)
              : undefined
          }
          isProcessing={isGenerating || regeneratingMessageId === message.id}
        />
      ))}
      
      {isGenerating && !regeneratingMessageId && (
        <div className="px-6 py-2 text-sm text-gray-400">
          AI is generating a response...
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatThread;