import { createParser, ParsedEvent } from 'eventsource-parser';
import { LLMProvider, Message } from '../types/chat';
import { getApiKey, getCustomEndpoint } from '../utils/storage';
import { PROVIDERS } from '../data/providers';

interface RequestOptions {
  provider: LLMProvider;
  modelId: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  streamCallback?: (chunk: string) => void;
  systemPrompt?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
}

export const generateCompletion = async (options: RequestOptions): Promise<string> => {
  const { 
    provider, 
    modelId, 
    messages, 
    temperature = 0.7, 
    maxTokens, 
    streamCallback, 
    systemPrompt,
    topP = 1,
    frequencyPenalty = 0,
    presencePenalty = 0,
    timeout = 60000
  } = options;
  
  // Debug - log the input messages
  console.log('====== API REQUEST START ======');
  console.log('Provider:', provider);
  console.log('Model:', modelId);
  console.log('Input Messages:', JSON.stringify(messages, null, 2));
  console.log('System Prompt:', systemPrompt);
  
  // Get the provider configuration
  const providerConfig = PROVIDERS[provider];
  
  // Get the API key for the provider
  const apiKey = getApiKey(provider);
  
  // Get custom endpoint if one exists
  const customEndpoint = getCustomEndpoint(provider);
  
  // Check if API key is required and present
  if (providerConfig.requiresApiKey && !apiKey) {
    console.error('Error: API key required but not provided');
    throw new Error(`API key required for ${providerConfig.name}`);
  }
  
  try {
    // Format messages based on provider
    const formattedMessages = formatMessagesForProvider(provider, messages, systemPrompt);
    console.log('Formatted Messages:', JSON.stringify(formattedMessages, null, 2));
    
    // Build request options based on provider
    const requestOptions = buildRequestOptions(provider, modelId, formattedMessages, {
      temperature,
      maxTokens,
      stream: !!streamCallback,
      topP,
      frequencyPenalty,
      presencePenalty,
      customEndpoint
    });
    
    console.log('API URL:', requestOptions.url);
    console.log('Request Headers:', JSON.stringify(requestOptions.headers, null, 2));
    console.log('Request Body:', JSON.stringify(requestOptions.body, null, 2));
    
    // If streaming is enabled and supported
    if (streamCallback && providerConfig.supportsStreaming) {
      return streamCompletion(provider, requestOptions, streamCallback);
    }
    
    // Standard API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(requestOptions.url, {
      method: 'POST',
      headers: requestOptions.headers,
      body: JSON.stringify(requestOptions.body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    console.log('Response Status:', responseStatus, responseStatusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', errorData);
      throw new Error(`API request failed: ${responseStatus} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    const extractedContent = extractResponseContent(provider, data);
    console.log('Extracted Content (first 100 chars):', extractedContent.substring(0, 100) + '...');
    console.log('====== API REQUEST END ======');
    
    return extractedContent;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout / 1000} seconds`);
    }
    throw error;
  }
};

const buildRequestOptions = (
  provider: LLMProvider, 
  modelId: string, 
  messages: any[], 
  params: { 
    temperature: number; 
    maxTokens?: number; 
    stream: boolean;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    customEndpoint?: string;
  }
) => {
  const providerConfig = PROVIDERS[provider];
  const apiKey = getApiKey(provider);
  
  // Use custom endpoint if provided, otherwise use the default baseUrl
  const baseUrl = params.customEndpoint || providerConfig.baseUrl;
  
  let url = '';
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  let body: any = {};
  
  switch (provider) {
    case 'openai':
      url = `${baseUrl}/chat/completions`;
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model: modelId,
        messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: params.stream,
        top_p: params.topP,
        frequency_penalty: params.frequencyPenalty,
        presence_penalty: params.presencePenalty
      };
      break;
      
    case 'anthropic':
      url = `${baseUrl}/messages`;
      headers['x-api-key'] = apiKey!;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: modelId,
        messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens || 1024,
        stream: params.stream,
        top_p: params.topP
      };
      break;
      
    case 'google':
      const apiVersion = modelId.includes('gemini-1.5') ? 'v1beta' : 'v1';
      url = `${baseUrl.replace('v1', apiVersion)}/models/${modelId}:generateContent`;
      headers['x-goog-api-key'] = apiKey!;
      body = {
        contents: messages,
        generationConfig: {
          temperature: params.temperature,
          maxOutputTokens: params.maxTokens,
          topP: params.topP
        }
      };
      break;
      
    case 'custom':
      url = baseUrl;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      body = {
        model: modelId,
        messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: params.stream,
        top_p: params.topP,
        frequency_penalty: params.frequencyPenalty,
        presence_penalty: params.presencePenalty
      };
      break;
      
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  return { url, headers, body };
};

const formatMessagesForProvider = (
  provider: LLMProvider,
  messages: Message[],
  systemPrompt?: string
): any[] => {
  // Log the incoming messages
  console.log(`Formatting messages for provider: ${provider}`);
  console.log('Messages before formatting:', JSON.stringify(messages, null, 2));
  
  // Ensure we have a valid messages array
  if (!messages) {
    messages = [];
    console.warn("No messages provided for formatting, using empty array");
  }
  
  let formattedMessages;
  
  switch (provider) {
    case 'openai':
      // Format for OpenAI API
      formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add system prompt if provided
      if (systemPrompt) {
        formattedMessages.unshift({ role: 'system', content: systemPrompt });
      } else if (formattedMessages.length === 0) {
        // If no messages and no system prompt, add a minimal system prompt
        formattedMessages.push({ role: 'system', content: 'You are a helpful assistant.' });
      }
      break;
      
    case 'anthropic':
      // Format for Anthropic API (Claude)
      formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      // Add system prompt if provided
      if (systemPrompt) {
        formattedMessages.unshift({ role: 'system', content: systemPrompt });
      }
      
      // Anthropic requires at least one user message
      if (formattedMessages.length === 0 || !formattedMessages.some(msg => msg.role === 'user')) {
        formattedMessages.push({ role: 'user', content: 'Hello' });
      }
      break;
      
    case 'google':
      // Format for Google Gemini API
      formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      // Add system prompt if provided
      if (systemPrompt) {
        // For Google, prepend the system prompt to the first user message
        const firstUserIndex = formattedMessages.findIndex(msg => msg.role === 'user');
        if (firstUserIndex >= 0) {
          const userMsg = formattedMessages[firstUserIndex];
          userMsg.parts[0].text = `${systemPrompt}\n\n${userMsg.parts[0].text}`;
        } else {
          // If no user message, add one with the system prompt
          formattedMessages.push({
            role: 'user',
            parts: [{ text: systemPrompt }]
          });
        }
      }
      
      // Google requires at least one user message
      if (formattedMessages.length === 0 || !formattedMessages.some(msg => msg.role === 'user')) {
        formattedMessages.push({
          role: 'user',
          parts: [{ text: 'Hello' }]
        });
      }
      break;
      
    case 'custom':
      // For custom APIs, use OpenAI format as default
      formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add system prompt if provided
      if (systemPrompt) {
        formattedMessages.unshift({ role: 'system', content: systemPrompt });
      } else if (formattedMessages.length === 0) {
        // If no messages and no system prompt, add a minimal system prompt
        formattedMessages.push({ role: 'system', content: 'You are a helpful assistant.' });
      }
      break;
      
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  // Log the formatted messages
  console.log('Messages after formatting:', JSON.stringify(formattedMessages, null, 2));
  return formattedMessages;
};

const extractResponseContent = (provider: LLMProvider, data: any): string => {
  try {
    switch (provider) {
      case 'openai':
        if (!data.choices || !data.choices[0]?.message?.content) {
          throw new Error("Unexpected response format from OpenAI API");
        }
        return data.choices[0].message.content;
        
      case 'anthropic':
        if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
          throw new Error("Unexpected response format from Anthropic API");
        }
        return data.content[0].text;
        
      case 'google':
        if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
          if (data.error) {
            throw new Error(`Google API error: ${data.error.message}`);
          }
          throw new Error("Unexpected response format from Google API");
        }
        return data.candidates[0].content.parts[0].text;
        
      case 'custom':
        // Try common response formats
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        if (data.content) {
          if (typeof data.content === 'string') {
            return data.content;
          } else if (Array.isArray(data.content) && data.content[0]?.text) {
            return data.content[0].text;
          }
          return JSON.stringify(data.content);
        }
        if (data.response) {
          return data.response;
        }
        // Fallback to stringifying the entire response
        return JSON.stringify(data);
        
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error('Error extracting response content:', error);
    throw new Error(`Failed to extract response from ${provider} API: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const streamCompletion = async (
  provider: LLMProvider,
  requestOptions: { url: string; headers: Record<string, string>; body: any },
  callback: (chunk: string) => void
): Promise<string> => {
  let fullResponse = '';
  
  try {
    console.log('Starting stream completion');
    
    const response = await fetch(requestOptions.url, {
      method: 'POST',
      headers: requestOptions.headers,
      body: JSON.stringify(requestOptions.body)
    });
    
    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => null);
      console.error('Stream Error Response:', errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
    }
    
    const parser = createParser((event: ParsedEvent) => {
      if (event.type === 'event') {
        if (event.data === '[DONE]') {
          console.log('Stream complete');
          return;
        }
        
        try {
          const chunk = parseStreamChunk(provider, event.data);
          if (chunk) {
            fullResponse += chunk;
            callback(chunk);
          }
        } catch (error) {
          console.error('Error parsing stream chunk:', error);
        }
      }
    });
    
    const reader = response.body.getReader();
    
    // Handle the stream
    const processStream = async () => {
      let done = false;
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = new TextDecoder().decode(value);
          parser.feed(chunk);
        }
      }
    };
    
    await processStream();
    console.log('Stream processing complete, full response:', fullResponse.substring(0, 100) + '...');
    return fullResponse;
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
};

const parseStreamChunk = (provider: LLMProvider, chunk: string): string => {
  try {
    const data = JSON.parse(chunk);
    
    switch (provider) {
      case 'openai':
        if (data.choices && data.choices[0]?.delta?.content !== undefined) {
          return data.choices[0].delta.content || '';
        }
        return '';
        
      case 'anthropic':
        if (data.delta && data.delta.text !== undefined) {
          return data.delta.text || '';
        }
        return '';
        
      case 'google':
        if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
          return data.candidates[0].content.parts[0].text || '';
        }
        return '';
        
      case 'custom':
        // Try to handle various formats
        if (data.choices && data.choices[0]?.delta?.content !== undefined) {
          return data.choices[0].delta.content;
        }
        if (data.delta && data.delta.content !== undefined) {
          return data.delta.content;
        }
        return '';
        
      default:
        return '';
    }
  } catch (error) {
    console.error('Error parsing stream chunk:', error);
    return '';
  }
};

// Test API connection - return usage data
export const testApiConnection = async (
  provider: LLMProvider, 
  apiKey: string, 
  baseUrl?: string
): Promise<{ success: boolean; message: string; usage?: any }> => {
  try {
    const providerConfig = PROVIDERS[provider];
    const url = baseUrl || providerConfig.baseUrl;
    
    let endpoint: string;
    let headers: Record<string, string> = {};
    
    switch (provider) {
      case 'openai':
        endpoint = `${url}/models`;
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        break;
        
      case 'anthropic':
        endpoint = `${url}/models`;
        headers = {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        };
        break;
        
      case 'google':
        endpoint = `${url}/models`;
        headers = {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json'
        };
        break;
        
      case 'custom':
        endpoint = baseUrl || '';
        if (!endpoint) {
          throw new Error('Custom API endpoint URL is required');
        }
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        break;
        
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    console.log('Testing connection to:', endpoint);
    console.log('With headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const responseStatus = response.status;
    console.log('Test connection response status:', responseStatus);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test connection error:', errorText);
      return { 
        success: false, 
        message: `API Error: ${responseStatus} - ${errorText}` 
      };
    }
    
    const data = await response.json();
    console.log('Test connection success:', data);
    
    // Successfully connected
    return { 
      success: true, 
      message: 'Successfully connected to API', 
      usage: null // Would contain usage data in a real implementation
    };
  } catch (error) {
    console.error('Test connection error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : String(error) 
    };
  }
};