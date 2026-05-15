import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, LogIn, MessageSquare, Heart, ThumbsUp, AlertCircle, ChevronLeft, Lock } from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';
import { formatTimeAgo } from '../../utils/geo';

interface ChatViewProps {
  messages: ChatMessage[];
  currentUser: UserProfile | null;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onAddReaction: (msgId: string, emoji: string) => void;
  onLogin: () => void;
  title?: string;
  onBackClick?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  currentUser,
  newMessage,
  setNewMessage,
  onSendMessage,
  onAddReaction,
  onLogin,
  title = "Chat Comunitario",
  onBackClick
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl z-20 flex items-center gap-4">
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="p-2 -ml-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={20} /> {title}
          </h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
            Activo • {messages.length} mensajes recientes
          </p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
              <MessageSquare size={48} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-widest font-mono">Sin mensajes aún</p>
            </div>
          ) : messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col ${msg.userId === currentUser?.uid ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1.5 px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {msg.userId === currentUser?.uid ? 'Tú' : msg.userName}
                </span>
                <span className="text-[9px] text-slate-600 font-bold">• {formatTimeAgo(msg.timestamp)}</span>
              </div>
              
              <div className={`relative max-w-[85%] px-5 py-3.5 rounded-3xl text-sm font-medium shadow-xl ${
                msg.userId === currentUser?.uid 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
              }`}>
                {msg.text}
                
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-2 right-2 flex gap-1">
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <div key={emoji} className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded-full text-[10px] shadow-lg">
                        <span>{emoji}</span>
                        <span className="text-slate-400 font-black">{(users as string[]).length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input / Login Prompt */}
      <div className="absolute bottom-6 left-4 right-4 z-30">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-4 rounded-[2rem] shadow-2xl">
          {currentUser ? (
            <form onSubmit={onSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-slate-950/50 border border-slate-800/50 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 px-5 rounded-2xl text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-20 transition-all active:scale-90"
              >
                <Send size={20} />
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center gap-4 text-left w-full px-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Acceso Restringido</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Regístrate para participar en la comunidad.</p>
                </div>
                <button 
                  onClick={onLogin}
                  className="ml-auto bg-blue-600 px-6 py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/10 active:scale-95 transition-all flex items-center gap-2"
                >
                  <LogIn size={14} /> Entrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
