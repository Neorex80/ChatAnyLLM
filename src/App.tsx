import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatThread from './components/Chat/ChatThread';
import MessageInput from './components/Chat/MessageInput';
import ChatHeader from './components/Chat/ChatHeader';
import SettingsModal from './components/Modals/SettingsModal';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initialize theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', '#10B981');
    root.style.setProperty('--color-primary-light', '#10B98110');
    root.style.setProperty('--color-bg', '#0f0f0f');
    
    // Add dark theme to body
    document.body.classList.add('bg-[#0f0f0f]');
    document.body.classList.add('text-gray-200');
    
    return () => {
      document.body.classList.remove('bg-[#0f0f0f]');
      document.body.classList.remove('text-gray-200');
    };
  }, []);

  return (
    <SettingsProvider>
      <ChatProvider>
        <div className="h-screen flex flex-col bg-[#0f0f0f] relative">
          <div className="flex-1 flex overflow-hidden p-4">
            {/* Sidebar */}
            <Sidebar onOpenSettings={() => setIsSettingsModalOpen(true)} />
            
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden ml-4 relative">
              <ChatHeader />
              <ChatThread />
              <MessageInput />
            </div>
          </div>
          
          {/* Settings Modal */}
          <SettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        </div>
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;