import React, { useState } from 'react';
import { X, Sun, Moon, Volume2, VolumeX, MessageSquare, Check } from 'lucide-react';

export interface Theme {
  id?: string;
  name?: string;
  bgColor: string;
  accentColor: string;
}

export const themeOptions: Theme[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    bgColor: '#f0f9ff',
    accentColor: '#3b82f6'
  },
  {
    id: 'purple',
    name: 'Lavender',
    bgColor: '#faf5ff',
    accentColor: '#8b5cf6'
  },
  {
    id: 'green',
    name: 'Forest Mist',
    bgColor: '#f0fdf4',
    accentColor: '#10B981'
  },
  {
    id: 'amber',
    name: 'Desert Sand',
    bgColor: '#fffbeb',
    accentColor: '#f59e0b'
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    bgColor: '#fff1f2',
    accentColor: '#e11d48'
  },
  {
    id: 'slate',
    name: 'Slate Gray',
    bgColor: '#f8fafc',
    accentColor: '#475569'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    bgColor: '#ecfdf5',
    accentColor: '#059669'
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    bgColor: '#eef2ff',
    accentColor: '#4f46e5'
  }
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  speechEnabled: boolean;
  onSpeechToggle: () => void;
  autoSuggestions: boolean;
  onAutoSuggestionsToggle: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  darkMode,
  onDarkModeToggle,
  soundEnabled,
  onSoundToggle,
  speechEnabled,
  onSpeechToggle,
  autoSuggestions,
  onAutoSuggestionsToggle
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'chat' | 'advanced'>('appearance');

  // If the panel is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[var(--color-surface)] rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--color-text-primary)]">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface-hover)]"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[var(--color-border)]">
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
              activeTab === 'appearance' 
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
              activeTab === 'chat' 
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
              activeTab === 'advanced' 
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selector */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)] mb-3">Theme</h3>
                <div className="grid grid-cols-4 gap-3">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      className={`group relative`}
                      onClick={() => onThemeChange(theme)}
                      aria-label={theme.name || 'Select theme'}
                    >
                      <div 
                        className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 ${
                          currentTheme.accentColor === theme.accentColor
                            ? 'border-gray-900 dark:border-white scale-95'
                            : 'border-transparent hover:scale-95'
                        }`}
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-200">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Dark Mode Toggle */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)] mb-3">Mode</h3>
                <div className="flex bg-gray-100 dark:bg-[var(--color-surface-hover)] rounded-lg p-1">
                  <button
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-md transition-all ${
                      !darkMode 
                        ? 'bg-white dark:bg-[var(--color-surface)] shadow-sm text-gray-800 dark:text-[var(--color-text-primary)]' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => !darkMode || onDarkModeToggle()}
                  >
                    <Sun size={18} className="mr-2" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-md transition-all ${
                      darkMode 
                        ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text-primary)]' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => darkMode || onDarkModeToggle()}
                  >
                    <Moon size={18} className="mr-2" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                </div>
              </div>
              
              {/* Display Density Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sun size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">Bloom Effects</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                      Display subtle atmospheric bloom effects in the UI
                    </p>
                  </div>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    true ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      true ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Display Density Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">Compact Layout</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                      Use a more compact layout with smaller spacing
                    </p>
                  </div>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    false ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="space-y-6">
              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {soundEnabled ? (
                    <Volume2 size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  ) : (
                    <VolumeX size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">Sound Effects</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                      Play sounds when messages are sent and received
                    </p>
                  </div>
                </div>
                <button
                  onClick={onSoundToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Text-to-Speech Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">Text-to-Speech</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                      Read AI responses aloud using speech synthesis
                    </p>
                  </div>
                </div>
                <button
                  onClick={onSpeechToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    speechEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-[var(--color-surface-hover)]'
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
                  <Check size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">Auto-Suggestions</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                      Show suggested prompts based on conversation context
                    </p>
                  </div>
                </div>
                <button
                  onClick={onAutoSuggestionsToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoSuggestions ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSuggestions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Real-time Typing Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare size={20} className="text-gray-700 dark:text-[var(--color-text-secondary)] mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)]">Real-time Typing</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                      Show typing indicator for more natural conversation flow
                    </p>
                  </div>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    true ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      true ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Model Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)] mb-3">
                  Model Temperature
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)]">Precise (0.0)</span>
                    <span className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)]">Creative (2.0)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-full h-2 bg-gray-200 dark:bg-[var(--color-surface-hover)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
                  />
                  <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                    Higher values make output more random, lower values make it more focused.
                  </p>
                </div>
              </div>
              
              {/* Max Response Length */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)] mb-3">
                  Max Response Length
                </h3>
                <div className="relative">
                  <input
                    type="number"
                    defaultValue="2048"
                    min="256"
                    max="8192"
                    step="256"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] dark:bg-[var(--color-surface-hover)] text-gray-900 dark:text-[var(--color-text-primary)] text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                    <span className="text-gray-500 dark:text-[var(--color-text-tertiary)] text-sm">tokens</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                  Maximum number of tokens in the response. Higher values can generate longer answers.
                </p>
              </div>
              
              {/* System Prompt */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-secondary)] mb-3">
                  System Prompt
                </h3>
                <textarea
                  rows={5}
                  defaultValue="You are ChatAnyLLM, a universal assistant for interacting with various AI providers. Be helpful, creative, and concise."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] dark:bg-[var(--color-surface-hover)] text-gray-900 dark:text-[var(--color-text-primary)] text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-[var(--color-text-tertiary)] mt-1">
                  Customize the AI's behavior with a system prompt. Changes apply to new conversations.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-[var(--color-border)] p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;