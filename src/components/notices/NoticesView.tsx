import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Plus, X, Send, LogIn, ChevronDown, ArrowLeft } from 'lucide-react';
import { Notice, NoticeCategory, NOTICE_CATEGORIES } from '../../services/supabase/noticeService';
import { UserProfile } from '../../types';
import { formatTimeAgo } from '../../utils/geo';

interface NoticesViewProps {
  notices: Notice[];
  currentUser: UserProfile | null;
  onSendNotice: (data: { title: string; body: string; category: NoticeCategory }) => Promise<void>;
  onLogin: () => void;
  onBack: () => void;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  notices,
  currentUser,
  onSendNotice,
  onLogin,
  onBack,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('General');
  const [sending, setSending] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await onSendNotice({ title: title.trim(), body: body.trim(), category });
      setTitle('');
      setBody('');
      setCategory('General');
      setShowForm(false);
    } finally {
      setSending(false);
    }
  };

  const catConfig = NOTICE_CATEGORIES.find(c => c.id === category)!;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl z-20 flex items-center justify-between">
        <button onClick={onBack} className="bg-slate-800 p-2.5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="text-yellow-400" size={20} /> Avisos del Barrio
          </h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
            {notices.length} avisos recientes
          </p>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black p-2.5 rounded-xl shadow-lg transition-all active:scale-95"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      {/* Formulario nuevo aviso */}
      <AnimatePresence>
        {showForm && currentUser && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-4 space-y-3 bg-slate-900">
              {/* Selector de categoría */}
              <div className="relative">
                <button
                  onClick={() => setShowCatMenu(v => !v)}
                  className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <span>{catConfig.emoji} {category}</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showCatMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-2xl"
                    >
                      {NOTICE_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => { setCategory(cat.id); setShowCatMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-sm text-white transition-colors"
                        >
                          <span>{cat.emoji}</span>
                          <span className={cat.color}>{cat.id}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                placeholder="Título del aviso..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={60}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
              <textarea
                placeholder="Describe el aviso con detalle..."
                value={body}
                onChange={e => setBody(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!title.trim() || !body.trim() || sending}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 text-black font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send size={16} /> {sending ? 'Publicando...' : 'Publicar Aviso'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de avisos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-24">
        {notices.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50 pt-20">
            <Megaphone size={48} strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-widest">Sin avisos aún</p>
          </div>
        ) : (
          notices.map(notice => {
            const cat = NOTICE_CATEGORIES.find(c => c.id === notice.category) ?? NOTICE_CATEGORIES[5];
            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${cat.color}`}>{notice.category}</span>
                  </div>
                  <span className="text-[9px] text-slate-600 font-bold shrink-0">{formatTimeAgo(notice.createdAt)}</span>
                </div>
                <p className="text-white font-bold text-sm leading-tight">{notice.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{notice.body}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">— {notice.userName}</p>
              </motion.div>
            );
          })
        )}

        {!currentUser && (
          <div className="mx-2 mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-black text-xs uppercase tracking-widest">Publica un aviso</p>
              <p className="text-slate-500 text-[11px] mt-1">Inicia sesión para informar a tu barrio.</p>
            </div>
            <button
              onClick={onLogin}
              className="bg-yellow-500 px-4 py-2.5 rounded-xl text-black font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
            >
              <LogIn size={14} /> Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
