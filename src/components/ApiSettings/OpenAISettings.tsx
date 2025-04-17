import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, RefreshCw, Globe, Info, Server, Shield, Plus, Trash2 } from 'lucide-react';
import { testApiConnection } from '../../services/api';
import { LLMProvider } from '../../types/chat';
import Button from '../common/Button';
import Tooltip from '../ui/Tooltip';

interface OpenAISettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  customEndpoint: string;
  onCustomEndpointChange: (url: string) => void;
  onSaveSettings: () => void;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionState {
  status: ConnectionStatus;
  message: string;
  lastChecked?: Date;
  models?: string[];
}

// Custom model interface
interface CustomModel {
  id: string;
  name: string;
}

const OpenAISettings: React.FC<OpenAISettingsProps> = ({
  apiKey,
  onApiKeyChange,
  customEndpoint,
  onCustomEndpointChange,
  onSaveSettings
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(!!customEndpoint);
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'disconnected',
    message: 'Not connected'
  });
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [customModels, setCustomModels] = useState<CustomModel[]>([
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-1106-preview', name: 'GPT-4 Turbo (1106)' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
    { id: 'deepseek-v3', name: 'DeepSeek v3' }
  ]);
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultEndpoint = 'https://api.openai.com/v1';

  // Validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isEndpointValid = isValidUrl(useCustomEndpoint ? customEndpoint : defaultEndpoint);

  // Toggle show/hide API key
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  // Toggle custom endpoint usage
  const toggleCustomEndpoint = () => {
    setUseCustomEndpoint(!useCustomEndpoint);
    if (!useCustomEndpoint && !customEndpoint) {
      onCustomEndpointChange(defaultEndpoint);
    }
  };

  // Setup WebSocket connection for real-time status
  useEffect(() => {
    const setupWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // In a real app, this would connect to a real WebSocket endpoint
      // For this example, we'll simulate WebSocket behavior
      const mockWsSetup = () => {
        setWsStatus('connected');
        console.log('WebSocket connected');
      };
      
      // Simulate WebSocket connection
      setTimeout(mockWsSetup, 1000);
      
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    };
    
    // Only setup if we have an API key
    if (apiKey) {
      return setupWebSocket();
    } else {
      setWsStatus('disconnected');
    }
  }, [apiKey, customEndpoint, useCustomEndpoint]);

  // Test API connection
  const testConnection = async () => {
    if (!apiKey || (useCustomEndpoint && !isEndpointValid)) {
      return;
    }
    
    setIsTestingConnection(true);
    setConnection({
      ...connection,
      status: 'connecting',
      message: 'Testing connection...'
    });
    
    try {
      const endpoint = useCustomEndpoint ? customEndpoint : defaultEndpoint;
      const result = await testApiConnection('openai', apiKey, endpoint);
      
      if (result.success) {
        setConnection({
          status: 'connected',
          message: 'Connection successful',
          lastChecked: new Date(),
          models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo', ...customModels.map(m => m.id)]
        });
      } else {
        setConnection({
          status: 'error',
          message: result.message,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      setConnection({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        lastChecked: new Date()
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Add custom model
  const handleAddCustomModel = () => {
    if (newModelId.trim() && newModelName.trim()) {
      setCustomModels([...customModels, {
        id: newModelId.trim(),
        name: newModelName.trim()
      }]);
      setNewModelId('');
      setNewModelName('');
      setShowAddModel(false);
    }
  };

  // Remove custom model
  const handleRemoveCustomModel = (id: string) => {
    setCustomModels(customModels.filter(model => model.id !== id));
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (connection.status) {
      case 'connected':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'connecting':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  // Format last checked time
  const formatLastChecked = () => {
    if (!connection.lastChecked) return '';
    return connection.lastChecked.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-gray-900">
              OpenAI API Configuration
            </h3>
            <div className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${
              connection.status === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : connection.status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {getStatusIndicator()}
              <span>
                {connection.status === 'connected' ? 'Connected' : 
                 connection.status === 'connecting' ? 'Connecting...' :
                 connection.status === 'error' ? 'Connection Error' : 'Not Connected'}
              </span>
            </div>
          </div>
          
          {wsStatus === 'connected' && (
            <div className="flex items-center text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              <span>Realtime Updates Active</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* API Key input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk-..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] pr-28 ${
                  connection.status === 'error' 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                }`}
              />
              
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                {connection.status !== 'disconnected' && getStatusIndicator()}
                <button
                  type="button"
                  onClick={toggleShowApiKey}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {connection.status === 'error' && (
              <p className="mt-1 text-xs text-red-500">
                {connection.message}
              </p>
            )}
            
            {connection.lastChecked && (
              <p className="mt-1 text-xs text-gray-500">
                Last checked: {formatLastChecked()}
              </p>
            )}
          </div>
          
          {/* Custom Endpoint toggle */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Use Custom API Endpoint
                </label>
                <Tooltip content="Override the default OpenAI API endpoint with a compatible alternative">
                  <Info size={14} className="text-gray-400" />
                </Tooltip>
              </div>
              <div>
                <button
                  onClick={toggleCustomEndpoint}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useCustomEndpoint ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useCustomEndpoint ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {useCustomEndpoint && (
              <>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => onCustomEndpointChange(e.target.value)}
                    placeholder="https://your-custom-endpoint.com/v1"
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] ${
                      useCustomEndpoint && !isEndpointValid ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                
                {useCustomEndpoint && !isEndpointValid && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid URL including protocol (https://)
                  </p>
                )}
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <button 
                    onClick={() => onCustomEndpointChange('https://api.openai.com/v1')}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      customEndpoint === 'https://api.openai.com/v1'
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'bg-gray-100 text-gray-700 border-transparent'
                    }`}
                  >
                    OpenAI (Default)
                  </button>
                  <button 
                    onClick={() => onCustomEndpointChange('https://api.groq.com/v1')}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      customEndpoint === 'https://api.groq.com/v1'
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'bg-gray-100 text-gray-700 border-transparent'
                    }`}
                  >
                    Groq
                  </button>
                  <button 
                    onClick={() => onCustomEndpointChange('https://api.together.xyz/v1')}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      customEndpoint === 'https://api.together.xyz/v1'
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'bg-gray-100 text-gray-700 border-transparent'
                    }`}
                  >
                    Together AI
                  </button>
                  <button 
                    onClick={() => onCustomEndpointChange('https://your-custom-proxy.com/v1')}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      customEndpoint === 'https://your-custom-proxy.com/v1'
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'bg-gray-100 text-gray-700 border-transparent'
                    }`}
                  >
                    Custom Proxy
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Custom Models Section */}
          {useCustomEndpoint && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-700">Custom Models</h4>
                  <Tooltip content="Add custom models for this endpoint that are not in the default list">
                    <Info size={14} className="text-gray-400" />
                  </Tooltip>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddModel(!showAddModel)}
                >
                  <Plus size={14} className="mr-1" /> Add Model
                </Button>
              </div>
              
              {/* Add New Model Form */}
              {showAddModel && (
                <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Model ID</label>
                      <input
                        type="text"
                        value={newModelId}
                        onChange={(e) => setNewModelId(e.target.value)}
                        placeholder="e.g., gpt-4o-mini"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="e.g., GPT-4o Mini"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddModel(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleAddCustomModel}
                      disabled={!newModelId.trim() || !newModelName.trim()}
                    >
                      Add Model
                    </Button>
                  </div>
                </div>
              )}

              {/* Custom Models List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customModels.map((model) => (
                  <div 
                    key={model.id} 
                    className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                  >
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.id}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomModel(model.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* API Connection Test */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              {connection.status === 'connected' && (
                <div className="text-sm text-green-600 flex flex-col">
                  <span className="font-medium">API Connection Active</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {connection.models?.length} models available including GPT-4o
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSaveSettings}
                disabled={useCustomEndpoint && !isEndpointValid}
              >
                Save
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={testConnection}
                isLoading={isTestingConnection}
                disabled={!apiKey || (useCustomEndpoint && !isEndpointValid)}
              >
                Test Connection
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection Details */}
      {connection.status === 'connected' && (
        <div className="border border-gray-200 rounded-lg p-5">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Connection Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Server size={18} className="text-[var(--color-primary)] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Endpoint
                </h4>
                <p className="text-xs text-gray-500">
                  {useCustomEndpoint ? customEndpoint : defaultEndpoint}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Shield size={18} className="text-[var(--color-primary)] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Security
                </h4>
                <p className="text-xs text-gray-500">
                  {customEndpoint.startsWith('https://') ? 'Secure (HTTPS)' : 'Not secure (HTTP)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <RefreshCw size={18} className="text-[var(--color-primary)] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  WebSocket Status
                </h4>
                <div className="flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-xs text-gray-500">
                    {wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Globe size={18} className="text-[var(--color-primary)] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Compatibility
                </h4>
                <p className="text-xs text-gray-500">
                  OpenAI API compatible ({connection.models?.length || 0} models)
                </p>
              </div>
            </div>
          </div>
          
          {connection.models && connection.models.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Available Models
              </h4>
              <div className="flex flex-wrap gap-2">
                {connection.models.map(model => (
                  <span 
                    key={model} 
                    className="px-2 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs rounded-md"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenAISettings;