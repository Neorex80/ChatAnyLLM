import { APIKey, Conversation, LLMProvider } from '../types/chat';

// Keys for localStorage
const CONVERSATIONS_KEY = 'chatanyllm-conversations';
const API_KEYS_KEY = 'chatanyllm-api-keys';
const SETTINGS_KEY = 'chatanyllm-settings';
const CUSTOM_ENDPOINTS_KEY = 'chatanyllm-custom-endpoints';

// Get all conversations from localStorage
export const getConversations = (): Conversation[] => {
  const storedConversations = localStorage.getItem(CONVERSATIONS_KEY);
  return storedConversations ? JSON.parse(storedConversations) : [];
};

// Save a conversation to localStorage
export const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);
  
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
};

// Delete a conversation from localStorage
export const deleteConversation = (conversationId: string): void => {
  const conversations = getConversations();
  const updatedConversations = conversations.filter(c => c.id !== conversationId);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
};

// Get API keys from localStorage
export const getApiKeys = (): APIKey[] => {
  const storedKeys = localStorage.getItem(API_KEYS_KEY);
  return storedKeys ? JSON.parse(storedKeys) : [];
};

// Save an API key to localStorage
export const saveApiKey = (provider: LLMProvider, key: string): void => {
  const apiKeys = getApiKeys();
  const existingKeyIndex = apiKeys.findIndex(k => k.provider === provider);
  
  if (existingKeyIndex >= 0) {
    apiKeys[existingKeyIndex].key = key;
  } else {
    apiKeys.push({ provider, key });
  }
  
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(apiKeys));
};

// Get API key for a specific provider
export const getApiKey = (provider: LLMProvider): string | null => {
  const apiKeys = getApiKeys();
  const apiKey = apiKeys.find(k => k.provider === provider);
  return apiKey ? apiKey.key : null;
};

// Get custom endpoints from localStorage
export const getCustomEndpoints = (): Record<string, string> => {
  const storedEndpoints = localStorage.getItem(CUSTOM_ENDPOINTS_KEY);
  return storedEndpoints ? JSON.parse(storedEndpoints) : {};
};

// Save a custom endpoint to localStorage
export const saveCustomEndpoint = (provider: LLMProvider, url: string): void => {
  const endpoints = getCustomEndpoints();
  endpoints[provider] = url;
  localStorage.setItem(CUSTOM_ENDPOINTS_KEY, JSON.stringify(endpoints));
};

// Get custom endpoint for a specific provider
export const getCustomEndpoint = (provider: LLMProvider): string | undefined => {
  const endpoints = getCustomEndpoints();
  return endpoints[provider];
};

// Save settings to localStorage
export const saveSettings = (settings: Record<string, any>): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Get settings from localStorage
export const getSettings = (): Record<string, any> => {
  const storedSettings = localStorage.getItem(SETTINGS_KEY);
  return storedSettings ? JSON.parse(storedSettings) : {};
};