import { v4 as uuidv4 } from 'uuid';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { APIKey, LLMProvider } from '../types/chat';

export interface Message {
  id: number | string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  regenerating?: boolean;
  status?: 'pending' | 'complete' | 'error';
}

// Main function to send a message to the AI service
export const sendMessage = async (
  content: string,
  prevMessages: Message[],
  modelId: string
): Promise<string> => {
  // In a real implementation, this would make API calls to different providers based on the model
  console.log(`Sending message to model: ${modelId}`);

  // For demo purposes, return a mock response after a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a different response based on the message content for demonstration
  if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
    return "Hello! I'm ChatAnyLLM, your universal assistant for interacting with various LLM providers. How can I help you today?";
  } else if (content.toLowerCase().includes('help')) {
    return "I can help you with various tasks like answering questions, writing code, explaining concepts, creating content, and more. Just ask me anything, and I'll try my best to assist you!";
  } else if (content.toLowerCase().includes('code') || content.toLowerCase().includes('python')) {
    return `Here's a simple Python code example to get you started:

\`\`\`python
def greet(name):
    """A simple greeting function"""
    return f"Hello, {name}! Welcome to Python programming."

# Example usage
if __name__ == "__main__":
    user_name = input("Enter your name: ")
    print(greet(user_name))
\`\`\`

This code defines a function that takes a name parameter and returns a personalized greeting. You can modify it to suit your needs or ask for more complex examples.`;
  } else {
    return `Thank you for your message. I'm processing your request about "${content}". In a real implementation, this would connect to the selected model (${modelId}) and stream the response. 

Is there anything specific you'd like to know about implementing a universal LLM interface?`;
  }
};

// Function to regenerate a response
export const regenerateResponse = async (
  messages: Message[],
  modelId: string
): Promise<string> => {
  // Extract the last user message to regenerate a response
  const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
  
  if (!lastUserMessage) {
    throw new Error("No user message found to regenerate a response for");
  }
  
  // Wait a bit longer for regeneration to make it feel different
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a slightly different response
  return `This is a regenerated response to your message about "${lastUserMessage.content}". 

When implementing a universal LLM interface, it's important to consider:
1. Standardizing the API format across different providers
2. Handling streaming responses consistently
3. Managing authentication and API keys securely
4. Providing fallback options when a service is unavailable

Would you like more specific information about any of these aspects?`;
};

// Function to stream a completion from an AI model
export async function streamCompletion(
  provider: LLMProvider,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number = 0.7,
  onUpdate: (chunk: string) => void
): Promise<void> {
  let endpoint = '';
  let headers: Record<string, string> = {};
  let body: any = {};

  // Configure the request based on the selected provider
  switch (provider) {
    case 'openai':
      endpoint = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      body = {
        model,
        messages,
        temperature,
        stream: true
      };
      break;
    
    case 'anthropic':
      endpoint = 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
      body = {
        model,
        messages,
        temperature,
        stream: true
      };
      break;
    
    // Add other providers as needed
    default:
      throw new Error(`Provider ${provider} not supported`);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.statusText} ${JSON.stringify(error)}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Create a parser for server-sent events
    const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
      if (event.type === 'event') {
        if (event.data === '[DONE]') {
          return;
        }
        
        try {
          const json = JSON.parse(event.data);
          
          // Extract the content based on the provider
          let content = '';
          if (provider === 'openai') {
            content = json.choices[0]?.delta?.content || '';
          } else if (provider === 'anthropic') {
            content = json.delta?.text || '';
          }
          
          if (content) {
            onUpdate(content);
          }
        } catch (error) {
          console.error('Error parsing stream:', error);
        }
      }
    });

    // Process the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        parser.feed(chunk);
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}