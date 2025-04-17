import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { LLMProvider } from '../../types/chat';
import { PROVIDERS } from '../../data/providers';
import Button from '../common/Button';
import { useChat } from '../../contexts/ChatContext';
import { useSettings } from '../../contexts/SettingsContext';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai');
  const [selectedModel, setSelectedModel] = useState('');
  const { apiKeys, customEndpoints } = useSettings();
  const { createNewConversation } = useChat();
  
  // Set default model when provider changes
  useEffect(() => {
    if (selectedProvider) {
      const provider = PROVIDERS[selectedProvider];
      if (provider && provider.models.length > 0) {
        setSelectedModel(provider.models[0].id);
      }
    }
  }, [selectedProvider]);

  const handleCreate = () => {
    createNewConversation(selectedProvider, selectedModel);
    onClose();
  };

  const providerHasApiKey = (provider: LLMProvider): boolean => {
    const providerConfig = PROVIDERS[provider];
    
    if (!providerConfig.requiresApiKey) {
      return true;
    }
    
    return apiKeys.some(key => key.provider === provider);
  };

  // Add custom models for OpenAI with custom endpoint
  const getModelsForProvider = (provider: LLMProvider) => {
    const models = [...PROVIDERS[provider].models];
    
    // If this is OpenAI and has a custom endpoint, add custom models
    if (provider === 'openai' && customEndpoints.openai) {
      // Here you would typically fetch models from your state
      // This is just an example of adding some custom models
      const customModels = [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          provider: 'openai' as LLMProvider,
          description: 'Via OpenAI-compatible API'
        },
        {
          id: 'deepseek-v3',
          name: 'DeepSeek v3',
          provider: 'openai' as LLMProvider,
          description: 'Via OpenAI-compatible API'
        }
      ];
      
      return [...models, ...customModels];
    }
    
    return models;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PROVIDERS).map(([key, provider]) => {
              const hasKey = providerHasApiKey(key as LLMProvider);
              
              return (
                <button
                  key={key}
                  className={`border rounded-lg p-3 flex flex-col items-center justify-center transition-colors ${
                    selectedProvider === key
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${!hasKey ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedProvider(key as LLMProvider)}
                >
                  <span className="font-medium text-sm">{provider.name}</span>
                  {!hasKey && (
                    <span className="text-xs text-red-500 mt-1">Missing API Key</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Model
          </label>
          <div className="space-y-2">
            {getModelsForProvider(selectedProvider).map(model => (
              <button
                key={model.id}
                className={`w-full border rounded-lg p-3 flex items-start transition-colors text-left ${
                  selectedModel === model.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div>
                  <span className="font-medium text-sm">{model.name}</span>
                  {model.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {model.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreate}
            disabled={!providerHasApiKey(selectedProvider)}
          >
            Create Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewChatModal;