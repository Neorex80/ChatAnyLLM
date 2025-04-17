import React from 'react';
import Markdown from 'markdown-to-jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2, Copy } from 'lucide-react';

interface MessageContentProps {
  content: string;
  sender: 'user' | 'ai';
  regenerating?: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, sender, regenerating = false }) => {
  if (regenerating) {
    return (
      <div className="flex items-center space-x-2 py-2">
        <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
        <span className="text-[var(--color-text-secondary)]">Regenerating response...</span>
      </div>
    );
  }

  // For user messages, just return the content
  if (sender === 'user') {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // For AI messages, use markdown rendering with syntax highlighting
  return (
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
      {content}
    </Markdown>
  );
};

export default MessageContent;