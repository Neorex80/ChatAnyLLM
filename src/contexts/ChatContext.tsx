import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message, LLMProvider, ChatSettings } from '../types/chat';
import { getConversations, saveConversation, deleteConversation } from '../utils/storage';
import { generateCompletion } from '../services/api';
import { getDefaultModel } from '../data/providers';

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  isGenerating: boolean;
  chatSettings: ChatSettings;
  createNewConversation: (provider: LLMProvider, modelId?: string) => string;
  setCurrentConversationId: (id: string | null) => void;
  sendMessage: (content: string, isRegeneration?: boolean, replaceIndex?: number) => Promise<void>;
  deleteCurrentConversation: () => void;
  deleteConversation: (id: string) => void;
  updateCurrentConversationTitle: (title: string) => void;
  starConversation: (id: string, starred: boolean) => void;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
}

const defaultChatSettings: ChatSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: ''
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings>(defaultChatSettings);
  const [pendingMessages, setPendingMessages] = useState<{content: string, isRegeneration: boolean, replaceIndex?: number}[]>([]);

  // Load conversations from storage on mount
  useEffect(() => {
    const storedConversations = getConversations();
    setConversations(storedConversations);
    
    // If there are conversations, set the most recent as current
    if (storedConversations.length > 0) {
      const mostRecent = storedConversations.reduce((latest, current) => {
        return latest.updatedAt > current.updatedAt ? latest : current;
      }, storedConversations[0]);
      
      setCurrentConversationId(mostRecent.id);
    }
  }, []);

  // Process any pending messages when the generating state changes to false
  useEffect(() => {
    if (!isGenerating && pendingMessages.length > 0) {
      const nextMessage = pendingMessages[0];
      const updatedPending = pendingMessages.slice(1);
      setPendingMessages(updatedPending);
      
      // Process the next message
      void processMessage(nextMessage.content, nextMessage.isRegeneration, nextMessage.replaceIndex);
    }
  }, [isGenerating, pendingMessages]);

  // Get the current conversation
  const getCurrentConversation = (): Conversation | undefined => {
    return conversations.find(c => c.id === currentConversationId);
  };

  // Create a new conversation
  const createNewConversation = (provider: LLMProvider, modelId?: string): string => {
    const model = modelId ? modelId : getDefaultModel(provider).id;
    
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider,
      modelId: model
    };
    
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
    saveConversation(newConversation);
    
    return newConversation.id;
  };

  // Process a message (internal function)
  const processMessage = async (content: string, isRegeneration = false, replaceIndex?: number): Promise<void> => {
    console.log(`Processing message: "${content.substring(0, 30)}..."`);
    console.log(`Is regeneration: ${isRegeneration}, Replace index: ${replaceIndex}`);
    
    const currentConversation = getCurrentConversation();
    
    if (!currentConversation) {
      console.error('No active conversation found');
      throw new Error('No active conversation');
    }
    
    // Set generating state
    setIsGenerating(true);
    
    try {
      // Don't create a new user message if this is a regeneration
      if (!isRegeneration) {
        console.log('Adding new user message to conversation');
        
        // Create user message
        const userMessage: Message = {
          id: uuidv4(),
          role: 'user',
          content,
          timestamp: Date.now()
        };
        
        // Create pending assistant message
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          status: 'pending'
        };
        
        // Update conversation with the new messages
        const updatedConversation: Conversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, userMessage, assistantMessage],
          updatedAt: Date.now()
        };
        
        console.log(`Updated conversation with ${updatedConversation.messages.length} messages`);
        
        setConversations(prev => 
          prev.map(c => c.id === currentConversation.id ? updatedConversation : c)
        );
        saveConversation(updatedConversation);
      } else if (replaceIndex !== undefined) {
        console.log(`Preparing to regenerate response at index ${replaceIndex}`);
        
        // Mark the message at replaceIndex as regenerating
        const updatedMessages = [...currentConversation.messages];
        updatedMessages[replaceIndex] = {
          ...updatedMessages[replaceIndex],
          status: 'regenerating'
        };
        
        const updatedConversation: Conversation = {
          ...currentConversation,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
        
        setConversations(prev => 
          prev.map(c => c.id === currentConversation.id ? updatedConversation : c)
        );
        saveConversation(updatedConversation);
      }
      
      // Refresh current conversation after updates
      const updatedCurrentConversation = conversations.find(c => c.id === currentConversationId);
      if (!updatedCurrentConversation) {
        throw new Error('Conversation not found after update');
      }
      
      // Get the messages to send to the API
      let messagesToSend: Message[];
      
      if (isRegeneration && replaceIndex !== undefined) {
        // For regeneration, only send messages up to the user message before the one being regenerated
        messagesToSend = updatedCurrentConversation.messages.slice(0, replaceIndex);
      } else {
        // For normal messages, send all messages except the pending one
        messagesToSend = updatedCurrentConversation.messages.slice(0, updatedCurrentConversation.messages.length - 1);
      }
      
      console.log(`Prepared ${messagesToSend.length} messages to send to API`);
      
      // Handle case where there are no messages to send
      if (messagesToSend.length === 0) {
        console.log('No messages to send, using initial message mode');
        
        // For new conversations, this is normal - use the user's message with a system prompt
        if (!isRegeneration && updatedCurrentConversation.messages.length >= 1) {
          // Get the user's message that was just added
          const userMessage = updatedCurrentConversation.messages[updatedCurrentConversation.messages.length - 2];
          messagesToSend = [userMessage];
          console.log('Using just the user message for initial conversation');
        } else if (isRegeneration) {
          console.error('Cannot regenerate without previous messages');
          // For regeneration with no messages, update the message with an error
          setConversations(prev => {
            const conversation = prev.find(c => c.id === currentConversationId);
            
            if (!conversation) return prev;
            
            const updatedMessages = [...conversation.messages];
            
            if (replaceIndex !== undefined) {
              // Update the message at replaceIndex
              updatedMessages[replaceIndex] = {
                ...updatedMessages[replaceIndex],
                content: 'Error: Cannot regenerate. No previous messages to provide context.',
                status: 'error'
              };
            }
            
            const updatedConv = {
              ...conversation,
              messages: updatedMessages,
              updatedAt: Date.now()
            };
            
            saveConversation(updatedConv);
            
            return prev.map(c => c.id === currentConversation.id ? updatedConv : c);
          });
          
          setIsGenerating(false);
          return;
        } else {
          throw new Error("No messages to send to the API");
        }
      }
      
      console.log('Getting ready to call API');
      
      let fullResponse = '';
      
      // Define stream callback to update the assistant message in real-time
      const streamCallback = (chunk: string) => {
        fullResponse += chunk;
        
        // Update the conversation with the current response
        setConversations(prev => {
          const conversation = prev.find(c => c.id === currentConversation.id);
          
          if (!conversation) return prev;
          
          const updatedMessages = [...conversation.messages];
          
          if (isRegeneration && replaceIndex !== undefined) {
            // Update the message at replaceIndex
            updatedMessages[replaceIndex] = {
              ...updatedMessages[replaceIndex],
              content: fullResponse,
              status: 'complete'
            };
          } else {
            // Update the last message (which should be the pending assistant message)
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'assistant' && lastMessage.status === 'pending') {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: fullResponse
              };
            }
          }
          
          const updatedConv = {
            ...conversation,
            messages: updatedMessages
          };
          
          // Save to storage
          saveConversation(updatedConv);
          
          return prev.map(c => c.id === currentConversation.id ? updatedConv : c);
        });
      };
      
      // Generate the completion
      console.log('Calling generateCompletion API');
      
      try {
        const response = await generateCompletion({
          provider: updatedCurrentConversation.provider,
          modelId: updatedCurrentConversation.modelId,
          messages: messagesToSend,
          temperature: chatSettings.temperature,
          maxTokens: chatSettings.maxTokens,
          streamCallback,
          systemPrompt: chatSettings.systemPrompt,
          topP: chatSettings.topP,
          frequencyPenalty: chatSettings.frequencyPenalty,
          presencePenalty: chatSettings.presencePenalty
        });
        
        console.log('API call successful, got response');
        
        // Update the conversation with the final response
        setConversations(prev => {
          const conversation = prev.find(c => c.id === currentConversation.id);
          
          if (!conversation) return prev;
          
          const updatedMessages = [...conversation.messages];
          
          if (isRegeneration && replaceIndex !== undefined) {
            // Update the message at replaceIndex
            updatedMessages[replaceIndex] = {
              ...updatedMessages[replaceIndex],
              content: response,
              status: 'complete',
              timestamp: Date.now()
            };
          } else {
            // Update the last message (which should be the pending assistant message)
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'assistant' && lastMessage.status === 'pending') {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: response,
                status: 'complete'
              };
            }
          }
          
          // Update conversation title if it's the first message
          let title = conversation.title;
          if (!isRegeneration && conversation.messages.length <= 2 && title === 'New Conversation') {
            // Generate a title from the user's first message
            title = content.length > 30 ? `${content.substring(0, 30)}...` : content;
          }
          
          const updatedConv = {
            ...conversation,
            title,
            messages: updatedMessages,
            updatedAt: Date.now()
          };
          
          // Save to storage
          saveConversation(updatedConv);
          
          return prev.map(c => c.id === currentConversation.id ? updatedConv : c);
        });
      } catch (error) {
        console.error('Error generating response:', error);
        
        // Update the message to show the error
        setConversations(prev => {
          const conversation = prev.find(c => c.id === currentConversation.id);
          
          if (!conversation) return prev;
          
          const updatedMessages = [...conversation.messages];
          
          if (isRegeneration && replaceIndex !== undefined) {
            // Update the message at replaceIndex
            updatedMessages[replaceIndex] = {
              ...updatedMessages[replaceIndex],
              content: `Error: ${error instanceof Error ? error.message : String(error)}`,
              status: 'error'
            };
          } else {
            // Update the last message (which should be the pending assistant message)
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'assistant' && lastMessage.status === 'pending') {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                status: 'error'
              };
            }
          }
          
          const updatedConv = {
            ...conversation,
            messages: updatedMessages,
            updatedAt: Date.now()
          };
          
          // Save to storage
          saveConversation(updatedConv);
          
          return prev.map(c => c.id === currentConversation.id ? updatedConv : c);
        });
      }
    } catch (error) {
      console.error('Process message error:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Send a message - public function that either processes directly or queues
  const sendMessage = async (content: string, isRegeneration = false, replaceIndex?: number): Promise<void> => {
    console.log(`sendMessage called with content: "${content.substring(0, 30)}..."`, isGenerating);
    
    if (isGenerating) {
      // If already generating, add to pending queue
      console.log('Already generating, adding to pending queue');
      setPendingMessages(prev => [...prev, {content, isRegeneration, replaceIndex}]);
      return;
    }
    
    return processMessage(content, isRegeneration, replaceIndex);
  };

  // Delete the current conversation
  const deleteCurrentConversation = () => {
    if (!currentConversationId) return;
    deleteConversation(currentConversationId);
    
    setConversations(prev => prev.filter(c => c.id !== currentConversationId));
    
    // Set the most recent conversation as current, or null if none left
    const remainingConversations = conversations.filter(c => c.id !== currentConversationId);
    
    if (remainingConversations.length > 0) {
      const mostRecent = remainingConversations.reduce((latest, current) => {
        return latest.updatedAt > current.updatedAt ? latest : current;
      }, remainingConversations[0]);
      
      setCurrentConversationId(mostRecent.id);
    } else {
      setCurrentConversationId(null);
    }
  };

  // Delete a specific conversation
  const deleteConversationById = (id: string) => {
    deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    
    // If the deleted conversation is the current one, set a new current conversation
    if (id === currentConversationId) {
      const remainingConversations = conversations.filter(c => c.id !== id);
      
      if (remainingConversations.length > 0) {
        const mostRecent = remainingConversations.reduce((latest, current) => {
          return latest.updatedAt > current.updatedAt ? latest : current;
        }, remainingConversations[0]);
        
        setCurrentConversationId(mostRecent.id);
      } else {
        setCurrentConversationId(null);
      }
    }
  };

  // Update the title of the current conversation
  const updateCurrentConversationTitle = (title: string) => {
    const currentConversation = getCurrentConversation();
    
    if (!currentConversation) return;
    
    const updatedConversation = {
      ...currentConversation,
      title,
      updatedAt: Date.now()
    };
    
    setConversations(prev => 
      prev.map(c => c.id === currentConversation.id ? updatedConversation : c)
    );
    
    saveConversation(updatedConversation);
  };

  // Star or unstar a conversation
  const starConversation = (id: string, starred: boolean) => {
    const conversation = conversations.find(c => c.id === id);
    
    if (!conversation) return;
    
    const updatedConversation = {
      ...conversation,
      starred,
      updatedAt: Date.now()
    };
    
    setConversations(prev => 
      prev.map(c => c.id === id ? updatedConversation : c)
    );
    
    saveConversation(updatedConversation);
  };

  // Update chat settings
  const updateChatSettings = (settings: Partial<ChatSettings>) => {
    setChatSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        isGenerating,
        chatSettings,
        createNewConversation,
        setCurrentConversationId,
        sendMessage,
        deleteCurrentConversation,
        deleteConversation: deleteConversationById,
        updateCurrentConversationTitle,
        starConversation,
        updateChatSettings
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};