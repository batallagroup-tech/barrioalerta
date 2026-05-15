import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { chatService } from '../services/supabase/chatService';
import { ChatMessage, UserProfile } from '../types';

export function useChat(
  authenticated: boolean,
  currentUser: UserProfile | null,
  incidentId?: string
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Solo suscribir community chat si NO hay incidentId
    if (incidentId === undefined && !authenticated) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Si hay incidentId pero no está autenticado, no suscribir
    if (incidentId !== undefined && !authenticated) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (incidentId) {
      // Chat de incidente específico
      supabase
        .from('incident_messages')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true })
        .limit(50)
        .then(({ data }) => {
          if (data) setMessages(data.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name,
            userPhoto: r.user_photo,
            text: r.text,
            timestamp: r.created_at,
            type: r.type ?? 'text',
            reactions: r.reactions ?? {},
          })));
          setLoading(false);
        });

      const channel = supabase
        .channel(`incident-chat-${incidentId}-${Date.now()}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'incident_messages',
          filter: `incident_id=eq.${incidentId}`
        }, (payload) => {
          const r = payload.new as any;
          setMessages(prev => [...prev, {
            id: r.id,
            userId: r.user_id,
            userName: r.user_name,
            userPhoto: r.user_photo,
            text: r.text,
            timestamp: r.created_at,
            type: r.type ?? 'text',
            reactions: r.reactions ?? {},
          }]);
        })
        .subscribe();

      unsubRef.current = () => supabase.removeChannel(channel);

    } else if (authenticated) {
      // Solo community chat si está autenticado y no hay incidentId
      const unsub = chatService.subscribeToCommunityChat((data) => {
        setMessages(data);
        setLoading(false);
      });
      unsubRef.current = unsub;
    }

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [authenticated, incidentId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentUser) return;
    if (incidentId) {
      await chatService.sendIncidentMessage(incidentId, text, currentUser);
    } else {
      await chatService.sendMessage(text, currentUser);
    }
  };

  const addReaction = async (msgId: string, emoji: string) => {
    if (!currentUser) return;
    await chatService.addReaction(msgId, emoji, currentUser, incidentId);
  };

  return { messages, setMessages, loading, sendMessage, addReaction };
}