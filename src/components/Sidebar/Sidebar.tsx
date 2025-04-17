import React, { useState } from 'react';
import ConversationList from './ConversationList';
import { Settings, X, Menu } from 'lucide-react';
import NewChatModal from '../Modals/NewChatModal';
import { RiSidebarFoldLine, RiSidebarUnfoldFill } from 'react-icons/ri';

interface SidebarProps {
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="fixed z-20 top-4 left-4 p-2 bg-[#222] rounded-md shadow-md border border-gray-600 md:hidden text-gray-300"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar */}
      <div
        className={`bg-[#222] rounded-3xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[280px]' : 'w-[72px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar header */}
        <div className="h-16 border-b border-gray-700 flex items-center justify-between px-5">
          {isOpen ? (
            <>
              <h1 className="text-lg font-semibold text-gray-200">ChatAnyLLM</h1>
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700 md:flex hidden"
              >
                <RiSidebarFoldLine size={18} />
              </button>
            </>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="mx-auto p-1.5 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700 hidden md:flex"
            >
              <RiSidebarUnfoldFill size={18} />
            </button>
          )}
        </div>
        
        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto bg-[#222] text-gray-300">
          <ConversationList 
            onNewChat={() => setIsNewChatModalOpen(true)} 
            isCollapsed={!isOpen}
          />
        </div>
        
        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-700">
          {isOpen ? (
            <div className="flex items-center justify-between">
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700"
              >
                <Settings size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700"
              >
                <Settings size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar;