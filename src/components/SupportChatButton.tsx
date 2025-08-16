import React, { useState } from 'react';
import { MessageSquare, HelpCircle } from 'lucide-react';
import UserSupportChat from './UserSupportChat';

const SupportChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      >
        <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
      </button>

      {/* Tooltip */}
      {!isChatOpen && (
        <div className="fixed bottom-20 right-6 z-40 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Need help? Chat with us!
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Chat Component */}
      <UserSupportChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default SupportChatButton;