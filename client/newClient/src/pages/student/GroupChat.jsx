import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Users, ArrowLeft, User } from 'lucide-react';

function GroupChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock group data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate fetching group data
    const fetchGroupData = async () => {
      // Mock group data
      const mockGroupData = {
        id: 1,
        name: "Web Development Project Team",
        members: [
          { id: 1, name: "Aryan Patel", isOnline: true },
          { id: 2, name: "Zeel Rathod", isOnline: true },
          { id: 3, name: "Kartik Patel", isOnline: false },
          { id: 4, name: "Sanjay Lagariya", isOnline: true }
        ]
      };
      
      // Mock messages
      const mockMessages = [
        { id: 1, sender: "Zeel Rathod", content: "Hi everyone! How's the project coming along?", timestamp: "10:30 AM", isOwn: false },
        { id: 2, sender: "Kartik Patel", content: "I've completed the frontend design. Will share it soon.", timestamp: "11:15 AM", isOwn: false },
        { id: 3, sender: "You", content: "Great work team! I'm working on the backend API integration.", timestamp: "11:45 AM", isOwn: true },
        { id: 4, sender: "Sanjay Lagariya", content: "Can we schedule a meeting for tomorrow to discuss the progress?", timestamp: "12:20 PM", isOwn: false }
      ];
      
      setGroupInfo(mockGroupData);
      setMessages(mockMessages);
    };

    fetchGroupData();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      id: messages.length + 1,
      sender: "You",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const goBack = () => {
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-2xl z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={goBack}
              className="flex items-center text-white hover:text-blue-400 transition duration-200"
            >
              <ArrowLeft className="mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {groupInfo ? groupInfo.name : 'Group Chat'}
              </h1>
              {groupInfo && (
                <p className="text-white/70 text-sm">
                  {groupInfo.members.filter(member => member.isOnline).length} online
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Users size={24} className="text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-6 overflow-y-auto max-h-[calc(100vh-250px)]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/50">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.isOwn
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white/10 text-white rounded-bl-none'
                      }`}
                    >
                      {!message.isOwn && (
                        <p className="text-xs font-semibold mb-1 text-blue-300">
                          {message.sender}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? 'text-blue-200' : 'text-white/50'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition duration-200 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Group Members Sidebar */}
        <div className="lg:w-80 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-4">Group Members</h2>
          <div className="space-y-3">
            {groupInfo ? (
              groupInfo.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl"
                >
                  <div className="relative">
                    <div className="bg-gray-600 rounded-full p-2">
                      <User size={20} className="text-white" />
                    </div>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className={`text-xs ${member.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                      {member.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50">Loading members...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;
