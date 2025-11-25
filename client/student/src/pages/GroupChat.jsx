import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Users, ArrowLeft, User, Loader2, AlertCircle } from "lucide-react";
import { studentProtectedAPI } from "../services/api";

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

function GroupChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await studentProtectedAPI.getGroupChatMessages();

        setGroupInfo(response.group || null);
        setCurrentStudentId(response.currentStudentId || null);

        const normalizedMessages = (response.messages || []).map((msg) => ({
          id: msg.id || msg._id,
          senderName: msg.sender?.name || "Unknown",
          senderId: msg.sender?.id || msg.senderId,
          content: msg.content || msg.message,
          timestamp: msg.createdAt,
          isOwn:
            (msg.sender?.id || msg.senderId)?.toString() ===
            (response.currentStudentId || "").toString(),
        }));

        setMessages(normalizedMessages);
      } catch (err) {
        console.error("Failed to load chat", err);
        setError(err.message || "Failed to load group chat.");
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupInfo) return;

    try {
      setIsSending(true);
      const response = await studentProtectedAPI.sendGroupChatMessage(
        newMessage.trim()
      );

      const formattedMessage = {
        id: response.id || response._id,
        senderName: response.sender?.name || "You",
        senderId: response.sender?.id || currentStudentId,
        content: response.content || response.message,
        timestamp: response.createdAt,
        isOwn: true,
      };

      setMessages((prev) => [...prev, formattedMessage]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const goBack = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span>Loading group chat...</span>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4 px-4 text-center">
        <AlertCircle size={40} className="text-yellow-400" />
        <p>You need to be part of a group to use the chat.</p>
        <button
          onClick={() => navigate("/student/create-group")}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl text-white transition"
        >
          Create or Join Group
        </button>
      </div>
    );
  }

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
                  {groupInfo.members?.length || 0} members
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
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-300 gap-2">
                <AlertCircle />
                <p>{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/50">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.isOwn
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white/10 text-white rounded-bl-none"
                      }`}
                    >
                      {!message.isOwn && (
                        <p className="text-xs font-semibold mb-1 text-blue-300">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? "text-blue-200" : "text-white/50"
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
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
              disabled={isSending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white p-3 rounded-2xl transition duration-200 flex items-center justify-center"
            >
              {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>

        {/* Group Members Sidebar */}
        <div className="lg:w-80 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-4">Group Members</h2>
          <div className="space-y-3">
            {groupInfo.members && groupInfo.members.length > 0 ? (
              groupInfo.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl"
                >
                  <div className="relative">
                    <div className="bg-gray-600 rounded-full p-2">
                      <User size={20} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-xs text-white/50">{member.enrollmentNumber}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50">No members found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;
