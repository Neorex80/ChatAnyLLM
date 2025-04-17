import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../common/Button';
import { useSettings } from '../../contexts/SettingsContext';
import { LLMProvider } from '../../types/chat';
import { PROVIDERS } from '../../data/providers';
import { useChat } from '../../contexts/ChatContext';
import { Volume2, VolumeX, MessageSquare, Check, Info, ChevronDown, Eye, EyeOff } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import OpenAISettings from '../ApiSettings/OpenAISettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'providers' | 'advanced';

export interface Theme {
  id?: string;
  name?: string;
  bgColor: string;
  accentColor: string;
}

export const themeOptions: Theme[] = [
  {
    id: 'green',
    name: 'Forest Mist',
    bgColor: '#f0fdf4',
    accentColor: '#10B981'
  }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const { 
    apiKeys, 
    setApiKey, 
    setCustomEndpoint, 
    customEndpoints, 
    soundEnabled,
    toggleSoundEnabled,
    speechEnabled,
    toggleSpeechEnabled,
    autoSuggestions,
    toggleAutoSuggestions
  } = useSettings();
  const { chatSettings, updateChatSettings } = useChat();
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<LLMProvider, string>>({} as Record<LLMProvider, string>);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [customEndpointInputs, setCustomEndpointInputs] = useState<Record<string, string>>(customEndpoints);
  const [selectedTheme] = useState<Theme>(themeOptions[0]); // Forest Mist theme
  const [bloomEffects, setBloomEffects] = useState(true);
  const [compactLayout, setCompactLayout] = useState(false);
  const [realTimeTyping, setRealTimeTyping] = useState(true);

  // Initialize API key inputs
  useEffect(() => {
    const initialInputs: Record<LLMProvider, string> = {} as Record<LLMProvider, string>;
    
    apiKeys.forEach(({ provider, key }) => {
      initialInputs[provider] = key;
    });
    
    setApiKeyInputs(initialInputs);
    setCustomEndpointInputs(customEndpoints);
  }, [apiKeys, customEndpoints]);
  
  // When theme changes, update CSS variables
  useEffect(() => {
    if (selectedTheme) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', selectedTheme.accentColor);
      root.style.setProperty('--color-primary-light', `${selectedTheme.accentColor}20`);
      root.style.setProperty('--color-bg', selectedTheme.bgColor);
    }
  }, [selectedTheme]);

  const handleApiKeyChange = (provider: LLMProvider, value: string) => {
    setApiKeyInputs(prev => ({ ...prev, [provider]: value }));
  };

  const handleCustomEndpointChange = (provider: LLMProvider, value: string) => {
    setCustomEndpointInputs(prev => ({ ...prev, [provider]: value }));
  };

  const handleSaveApiKey = (provider: LLMProvider) => {
    const key = apiKeyInputs[provider]?.trim();
    if (key) {
      setApiKey(provider, key);
    }
  };

  const handleSaveCustomEndpoint = (provider: LLMProvider) => {
    const url = customEndpointInputs[provider]?.trim();
    if (url) {
      setCustomEndpoint(provider, url);
    }
  };

  const handleTemperatureChange = (value: string) => {
    updateChatSettings({ temperature: parseFloat(value) });
  };

  const handleMaxTokensChange = (value: string) => {
    updateChatSettings({ maxTokens: parseInt(value, 10) });
  };

  const handleSystemPromptChange = (value: string) => {
    updateChatSettings({ systemPrompt: value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="flex h-[70vh]">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-200 pr-4">
          <nav className="space-y-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                activeTab === 'providers'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('providers')}
            >
              Provider Settings
            </button>
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                activeTab === 'advanced'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 pl-6 overflow-y-auto">
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
              <p className="text-sm text-gray-500">
                Enter your API keys for each provider to use their models.
              </p>

              <div className="space-y-4">
                {/* OpenAI Settings Component */}
                <OpenAISettings
                  apiKey={apiKeyInputs['openai'] || ''}
                  onApiKeyChange={(key) => handleApiKeyChange('openai', key)}
                  customEndpoint={customEndpointInputs['openai'] || ''}
                  onCustomEndpointChange={(url) => handleCustomEndpointChange('openai', url)}
                  onSaveSettings={() => {
                    handleSaveApiKey('openai');
                    handleSaveCustomEndpoint('openai');
                  }}
                />
                
                {/* Anthropic Settings */}
                {Object.entries(PROVIDERS).map(([key, provider]) => {
                  if (!provider.requiresApiKey || key === 'openai' || key === 'custom') return null;
                  
                  const providerKey = key as LLMProvider;
                  
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-5">
                      <h4 className="font-medium mb-2 text-gray-900">{provider.name}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKey[providerKey] ? 'text' : 'password'}
                              value={apiKeyInputs[providerKey] || ''}
                              onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                              placeholder={`Enter ${provider.name} API key`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              onClick={() => setShowApiKey(prev => ({ ...prev, [providerKey]: !prev[providerKey] }))}
                            >
                              {showApiKey[providerKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveApiKey(providerKey)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature: {chatSettings.temperature.toFixed(1)}
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">0.0</span>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={chatSettings.temperature}
                      onChange={(e) => handleTemperatureChange(e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
                    />
                    <span className="text-xs text-gray-500">2.0</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lower values (0.0) make responses more focused and deterministic. Higher values (2.0) make output more random and creative.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Tokens: {chatSettings.maxTokens}
                  </label>
                  <input
                    type="number"
                    min="256"
                    max="32000"
                    step="256"
                    value={chatSettings.maxTokens}
                    onChange={(e) => handleMaxTokensChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The maximum number of tokens to generate in the response. Lower values save costs but may truncate responses.
                  </p>
                </div>
                
                {/* Real-time Typing Toggle */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <MessageSquare size={20} className="text-gray-700 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Real-time Typing</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Show typing indicator for more natural conversation flow
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRealTimeTyping(!realTimeTyping)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      realTimeTyping ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        realTimeTyping ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Text-to-Speech Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare size={20} className="text-gray-700 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Text-to-Speech</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Read AI responses aloud using speech synthesis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSpeechEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      speechEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        speechEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Auto-Suggestions Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check size={20} className="text-gray-700 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Auto-Suggestions</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Show suggested prompts based on conversation context
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleAutoSuggestions}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSuggestions ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSuggestions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt
                  </label>
                  <textarea
                    value={chatSettings.systemPrompt}
                    onChange={(e) => handleSystemPromptChange(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    placeholder="Enter a system prompt to control the behavior of the AI..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A system prompt helps define the AI's behavior, style and capabilities. Leave empty for default behavior.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-gray-200 pt-4 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;