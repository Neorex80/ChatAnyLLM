export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'pending' | 'complete' | 'error';
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  provider: LLMProvider;
  modelId: string;
  starred?: boolean;
  folder?: string;
}

export interface APIKey {
  provider: LLMProvider;
  key: string;
}

export type LLMProvider = 
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'custom';

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  models: Model[];
  requiresApiKey: boolean;
  supportsStreaming: boolean;
  supportsCustomModels: boolean;
}

export interface Model {
  id: string;
  name: string;
  provider: LLMProvider;
  maxTokens?: number;
  capabilities?: string[];
  description?: string;
}

export interface ChatSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

export interface ExportFormat {
  type: 'json' | 'txt' | 'pdf' | 'md';
  label: string;
  icon: string;
}