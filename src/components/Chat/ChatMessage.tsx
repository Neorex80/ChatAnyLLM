import React from 'react';
import Markdown from 'markdown-to-jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../../types/chat';
import { Bot, User, AlertCircle, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onRegenerateResponse?: () => Promise<void>;
  isProcessing?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRegenerateResponse, isProcessing = false }) => {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isRegenerating = message.status === 'regenerating';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className="py-5 px-6">
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className="flex-shrink-0">
            <div className={`flex items-center justify-center h-9 w-9 rounded-full ${
              isUser 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[#333] text-[var(--color-primary)]'
            }`}>
              {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>
          </div>
          
          <div className={`flex-1 overflow-hidden ${isUser ? 'text-right' : ''}`}>
            <div className={`flex items-center mb-1.5 ${isUser ? 'justify-end' : ''}`}>
              {isUser ? (
                <span className="text-sm font-medium text-gray-300">You</span>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-[var(--color-primary)] mr-1">ChatAnyLLM</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--color-primary)"/>
                    <path d="M16 10L10.5 15.5L8 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className={`prose prose-sm max-w-none ${isUser ? 'flex justify-end' : ''}`}>
              {isError ? (
                <div className="flex items-start gap-2 text-red-500">
                  <AlertCircle size={18} />
                  <span>{message.content}</span>
                </div>
              ) : isRegenerating ? (
                <div className="flex items-center space-x-2 py-2">
                  <RefreshCw size={16} className="animate-spin text-[var(--color-primary)]" />
                  <span className="text-gray-400">Regenerating response...</span>
                </div>
              ) : (
                <div className={isUser ? 'bg-[var(--color-primary)] text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] inline-block text-left' : 'text-gray-200'}>
                  <Markdown
                    options={{
                      overrides: {
                        pre: {
                          component: ({ children, ...props }) => {
                            return <div {...props}>{children}</div>;
                          }
                        },
                        code: {
                          component: ({ className, children }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';
                            const code = String(children).replace(/\n$/, '');

                            return (
                              <div className="relative group">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="p-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  language={language}
                                  style={vscDarkPlus}
                                  customStyle={{
                                    borderRadius: '0.375rem',
                                    marginTop: '1rem',
                                    marginBottom: '1rem'
                                  }}
                                >
                                  {code}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }
                        }
                      }
                    }}
                  >
                    {message.content}
                  </Markdown>
                </div>
              )}
            </div>
            
            {!isUser && !isError && !isRegenerating && (
              <div className="flex items-center mt-3.5 space-x-2">
                <button className="p-1.5 rounded-full transition-colors hover:bg-gray-800">
                  <ThumbsUp size={14} className="text-gray-500" />
                </button>
                <button className="p-1.5 rounded-full transition-colors hover:bg-gray-800">
                  <ThumbsDown size={14} className="text-gray-500" />
                </button>
                {onRegenerateResponse && (
                  <button 
                    className={`p-1.5 rounded-full transition-colors hover:bg-gray-800 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onRegenerateResponse}
                    disabled={isProcessing}
                  >
                    <RefreshCw size={14} className={`text-gray-500 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span className="text-xs text-gray-500">Regenerate</span>
                  </button>
                )}
                <div className="flex-1 flex justify-end">
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-full transition-colors hover:bg-gray-800"
                  >
                    <Copy size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;