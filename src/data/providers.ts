import { LLMProvider, Model, ProviderConfig } from '../types/chat';

export const PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    supportsStreaming: true,
    supportsCustomModels: true,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        maxTokens: 128000,
        capabilities: ['vision', 'coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Most capable multimodal model for a wide range of tasks'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        maxTokens: 128000,
        capabilities: ['coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Powerful large language model with knowledge up to April 2023'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        maxTokens: 16385,
        capabilities: ['coding', 'reasoning', 'knowledge-to-2021'],
        description: 'Efficient language model with a good balance of capabilities'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        maxTokens: 8192,
        capabilities: ['coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Original GPT-4 model with strong reasoning capabilities'
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 (32K context)',
        provider: 'openai',
        maxTokens: 32768,
        capabilities: ['coding', 'reasoning', 'knowledge-to-2023'],
        description: 'GPT-4 with extended context length'
      },
      {
        id: 'gpt-3.5-turbo-1106',
        name: 'GPT-3.5 Turbo (1106)',
        provider: 'openai',
        maxTokens: 16385,
        capabilities: ['coding', 'reasoning'],
        description: 'November 2023 version of GPT-3.5 Turbo'
      }
    ]
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    supportsStreaming: true,
    supportsCustomModels: false,
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        maxTokens: 200000,
        capabilities: ['vision', 'coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Most powerful Claude model for complex tasks'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        maxTokens: 200000,
        capabilities: ['vision', 'coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Balanced Claude model for most use cases'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        maxTokens: 200000,
        capabilities: ['vision', 'coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Fastest and most compact Claude model'
      }
    ]
  },
  google: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    requiresApiKey: true,
    supportsStreaming: true,
    supportsCustomModels: false,
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        maxTokens: 1000000,
        capabilities: ['vision', 'coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Most capable Gemini model with multimodal understanding'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        maxTokens: 1000000,
        capabilities: ['coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Optimized for efficiency with strong capabilities'
      },
      {
        id: 'gemini-1.0-pro',
        name: 'Gemini 1.0 Pro',
        provider: 'google',
        maxTokens: 32768,
        capabilities: ['vision', 'coding', 'reasoning', 'knowledge-to-2023'],
        description: 'Original Gemini model with strong general capabilities'
      }
    ]
  },
  custom: {
    name: 'Custom API',
    baseUrl: '',
    requiresApiKey: true,
    supportsStreaming: false,
    supportsCustomModels: false,
    models: [
      {
        id: 'custom-model',
        name: 'Custom Model',
        provider: 'custom',
        description: 'Custom API endpoint'
      }
    ]
  }
};

export const getDefaultModel = (provider: LLMProvider): Model => {
  return PROVIDERS[provider].models[0];
};

export const getAllModels = (): Model[] => {
  return Object.values(PROVIDERS).flatMap(provider => provider.models);
};

export const getModelById = (modelId: string): Model | undefined => {
  return getAllModels().find(model => model.id === modelId);
};