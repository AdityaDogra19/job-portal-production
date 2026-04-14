import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { Send, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputData, setInputData] = useState('');
  const [targetUserId, setTargetUserId] = useState(''); // Who we are chatting with
  const messagesEndRef = useRef(null);

  // Parse local user context
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Connect to server (Ensure URL matches backend environment)
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001');
    setSocket(newSocket);

    // Register user with their DB ID
    if (currentUser.id || currentUser._id) {
      newSocket.emit('register_user', currentUser.id || currentUser._id);
    }

    // Listen for incoming messages
    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [currentUser.id, currentUser._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!targetUserId) {
      toast.error("Please specify a Target User ID to chat with.");
      return;
    }
    if (!inputData.trim()) return;

    const messagePayload = {
      senderId: currentUser.id || currentUser._id,
      receiverId: targetUserId,
      text: inputData
    };

    socket.emit('send_message', messagePayload);
    
    // Optimistically update our own chat log
    setMessages((prev) => [...prev, messagePayload]);
    setInputData('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Direct Messaging</h1>
        <p className="text-slate-500 font-medium text-lg mt-1">Chat securely with recruiters or applicants in real-time.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Target Selector Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <UserIcon className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Target User DB ID..."
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 relative">
          {messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Send className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === (currentUser.id || currentUser._id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`px-5 py-3 rounded-2xl max-w-[70%] shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                      <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Block */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input 
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 outline-none px-5 py-3 rounded-xl border-none focus:ring-2 focus:bg-white focus:ring-blue-600 font-medium transition-all"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center font-bold"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
