import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  isTyping?: boolean;
}

interface UserSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSupportChat: React.FC<UserSupportChatProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: `Hello ${user?.name || 'there'}! I'm your AI assistant. How can I help you today? Type "human" or "agent" if you'd like to speak with a human representative.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setChatId(`chat_${Date.now()}_${user?.id || 'guest'}`);
    }
  }, [isOpen, user, messages.length]);

  // Simulate bot responses
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check for handoff keywords
    const handoffKeywords = ['human', 'agent', 'speak to someone', 'escalate', 'manager', 'representative'];
    if (handoffKeywords.some(keyword => message.includes(keyword))) {
      setIsAgentConnected(true);
      return "I'm connecting you with a human agent now. Please wait a moment...";
    }
    
    // Trading-related responses
    if (message.includes('signal') || message.includes('trade')) {
      return "For trading signals and strategies, you can find them in your dashboard under the 'Signals' tab. Is there a specific signal you need help with?";
    }
    
    if (message.includes('account') || message.includes('balance')) {
      return "For account-related questions, please check your dashboard or provide more details about what you need help with.";
    }
    
    if (message.includes('password') || message.includes('login')) {
      return "For login issues, try using the 'Forgot Password' link on the login page. If you're still having trouble, I can connect you with an agent.";
    }
    
    if (message.includes('payment') || message.includes('subscription')) {
      return "For payment and subscription questions, please check your account settings or let me know what specific issue you're experiencing.";
    }
    
    if (message.includes('prop firm') || message.includes('challenge')) {
      return "For prop firm challenges, check the 'Prop Firm Rules' section in your dashboard. Do you need help with a specific rule or requirement?";
    }
    
    // Default responses
    const defaultResponses = [
      "I understand your concern. Could you provide more details so I can better assist you?",
      "That's a great question! Let me help you with that. Can you be more specific about what you need?",
      "I'm here to help! Could you tell me more about the issue you're experiencing?",
      "Thanks for reaching out! What specific area would you like assistance with?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Store message for customer service dashboard
    const chatData = {
      chatId,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      message: userMessage,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage for customer service dashboard to pick up
    const existingChats = JSON.parse(localStorage.getItem('customer_support_chats') || '[]');
    const chatIndex = existingChats.findIndex((chat: any) => chat.chatId === chatId);
    
    if (chatIndex >= 0) {
      existingChats[chatIndex].messages.push(userMessage);
      existingChats[chatIndex].lastMessage = userMessage.text;
      existingChats[chatIndex].lastUpdate = new Date().toISOString();
    } else {
      existingChats.unshift({
        chatId,
        userId: user?.id,
        userName: user?.name || 'User',
        userEmail: user?.email || 'user@example.com',
        status: 'active',
        priority: 'medium',
        messages: [userMessage],
        lastMessage: userMessage.text,
        lastUpdate: new Date().toISOString(),
        isAgentConnected: false
      });
    }
    
    localStorage.setItem('customer_support_chats', JSON.stringify(existingChats));

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      setIsTyping(false);
      
      if (isAgentConnected) {
        // Agent response simulation
        const agentMessage: ChatMessage = {
          id: `agent_${Date.now()}`,
          text: "Hello! I'm John from customer support. I see you were chatting with our AI assistant. How can I help you today?",
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
        
        // Update chat status
        const updatedChats = JSON.parse(localStorage.getItem('customer_support_chats') || '[]');
        const chatIndex = updatedChats.findIndex((chat: any) => chat.chatId === chatId);
        if (chatIndex >= 0) {
          updatedChats[chatIndex].isAgentConnected = true;
          updatedChats[chatIndex].messages.push(agentMessage);
          localStorage.setItem('customer_support_chats', JSON.stringify(updatedChats));
        }
      } else {
        // Bot response
        const botResponse = getBotResponse(userMessage.text);
        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Update chat with bot response
        const updatedChats = JSON.parse(localStorage.getItem('customer_support_chats') || '[]');
        const chatIndex = updatedChats.findIndex((chat: any) => chat.chatId === chatId);
        if (chatIndex >= 0) {
          updatedChats[chatIndex].messages.push(botMessage);
          localStorage.setItem('customer_support_chats', JSON.stringify(updatedChats));
        }
      }
    }, 1500 + Math.random() * 2000); // 1.5-3.5 second delay
  };

  // Listen for agent responses from customer service dashboard
  useEffect(() => {
    const handleAgentResponse = () => {
      const chats = JSON.parse(localStorage.getItem('customer_support_chats') || '[]');
      const currentChatData = chats.find((chat: any) => chat.chatId === chatId);
      
      if (currentChatData && currentChatData.messages) {
        const lastMessage = currentChatData.messages[currentChatData.messages.length - 1];
        if (lastMessage && lastMessage.sender === 'agent' && !messages.find(m => m.id === lastMessage.id)) {
          setMessages(prev => [...prev, lastMessage]);
          setIsAgentConnected(true);
        }
      }
    };

    const interval = setInterval(handleAgentResponse, 2000);
    return () => clearInterval(interval);
  }, [chatId, messages]);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Support Chat</span>
            {isAgentConnected && (
              <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs">Agent Online</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.sender === 'bot'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === 'bot' && <Bot className="w-3 h-3" />}
                      {message.sender === 'agent' && <User className="w-3 h-3" />}
                      <span className="text-xs opacity-75">
                        {message.sender === 'user' ? 'You' : 
                         message.sender === 'bot' ? 'AI Assistant' : 'Support Agent'}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                    <div className="flex items-center space-x-2">
                      {isAgentConnected ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      <span className="text-xs">
                        {isAgentConnected ? 'Agent' : 'AI Assistant'} is typing...
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserSupportChat;