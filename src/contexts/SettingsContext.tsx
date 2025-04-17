import React, { createContext, useContext, useEffect, useState } from 'react';
import { APIKey, LLMProvider } from '../types/chat';
import { getApiKeys, saveApiKey, getSettings, saveSettings, getCustomEndpoints, saveCustomEndpoint } from '../utils/storage';

interface SettingsContextType {
  apiKeys: APIKey[];
  customEndpoints: Record<string, string>;
  setApiKey: (provider: LLMProvider, key: string) => void;
  setCustomEndpoint: (provider: LLMProvider, url: string) => void;
  soundEnabled: boolean;
  toggleSoundEnabled: () => void;
  speechEnabled: boolean;
  toggleSpeechEnabled: () => void;
  autoSuggestions: boolean;
  toggleAutoSuggestions: () => void;
  enabledModels?: string[];
  setEnabledModels?: (modelIds: string[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [customEndpoints, setCustomEndpoints] = useState<Record<string, string>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [enabledModels, setEnabledModels] = useState<string[]>([]);

  // Load settings from storage on mount
  useEffect(() => {
    const storedApiKeys = getApiKeys();
    setApiKeys(storedApiKeys);
    
    // Load custom endpoints from storage
    const storedEndpoints = getCustomEndpoints();
    if (storedEndpoints) {
      setCustomEndpoints(storedEndpoints);
    }
    
    // Load other settings
    const settings = getSettings();
    if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
    if (settings.speechEnabled !== undefined) setSpeechEnabled(settings.speechEnabled);
    if (settings.autoSuggestions !== undefined) setAutoSuggestions(settings.autoSuggestions);
    if (settings.enabledModels !== undefined) setEnabledModels(settings.enabledModels);
  }, []);

  // Set an API key for a provider
  const setApiKey = (provider: LLMProvider, key: string) => {
    saveApiKey(provider, key);
    
    setApiKeys(prev => {
      const existingIndex = prev.findIndex(k => k.provider === provider);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { provider, key };
        return updated;
      }
      
      return [...prev, { provider, key }];
    });
  };

  // Set a custom endpoint URL
  const setCustomEndpoint = (provider: LLMProvider, url: string) => {
    // Store the endpoint in localStorage
    saveCustomEndpoint(provider, url);
    
    // Update the state
    setCustomEndpoints(prev => ({
      ...prev,
      [provider]: url
    }));
  };
  
  // Toggle sound effects
  const toggleSoundEnabled = () => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      saveSettings({ soundEnabled: newValue });
      return newValue;
    });
  };
  
  // Toggle text-to-speech
  const toggleSpeechEnabled = () => {
    setSpeechEnabled(prev => {
      const newValue = !prev;
      saveSettings({ speechEnabled: newValue });
      return newValue;
    });
  };
  
  // Toggle auto suggestions
  const toggleAutoSuggestions = () => {
    setAutoSuggestions(prev => {
      const newValue = !prev;
      saveSettings({ autoSuggestions: newValue });
      return newValue;
    });
  };
  
  // Update enabled models
  const updateEnabledModels = (modelIds: string[]) => {
    setEnabledModels(modelIds);
    saveSettings({ enabledModels: modelIds });
  };

  return (
    <SettingsContext.Provider
      value={{
        apiKeys,
        customEndpoints,
        setApiKey,
        setCustomEndpoint,
        soundEnabled,
        toggleSoundEnabled,
        speechEnabled,
        toggleSpeechEnabled,
        autoSuggestions,
        toggleAutoSuggestions,
        enabledModels,
        setEnabledModels: updateEnabledModels
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};