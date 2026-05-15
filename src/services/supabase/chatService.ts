import { supabase } from '../../lib/supabase';
import { ChatMessage, UserProfile } from '../../types';

function toMessage(row: any): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userPhoto: row.user_photo,
    text: row.message ?? row.text,
    timestamp: row.created_at,
    type: row.type ?? 'text',
    reactions: row.reactions ?? {},
  };
}

export const chatService = {
subscribeToCommunityChat(callback: (messages: ChatMessage[]) => void) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    supabase
      .from('community_chat')
      .select('*')
      .gte('created_at', dayAgo)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => { if (data) callback(data.map(toMessage)); });

    const channelName = `community-chat-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_chat',
      }, (payload) => {
        const r = payload.new as any;
        callback([toMessage(r)]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  async sendMessage(text: string, currentUser: UserProfile) {
    const { error } = await supabase
      .from('community_chat')
      .insert({
        user_id: currentUser.uid,
        user_name: currentUser.showPublicName
          ? currentUser.displayName ?? 'Vecino'
          : 'Vecino',
        user_photo: currentUser.showPublicName ? currentUser.photoURL : null,
        message: text,
        type: 'text',
        reactions: {},
      });

    if (error) throw error;
  },

  async sendIncidentMessage(
    incidentId: string,
    text: string,
    currentUser: UserProfile
  ) {
    const { error } = await supabase
      .from('incident_messages')
      .insert({
        incident_id: incidentId,
        user_id: currentUser.uid,
        user_name: currentUser.showPublicName
          ? currentUser.displayName ?? 'Vecino'
          : 'Vecino',
        user_photo: currentUser.showPublicName ? currentUser.photoURL : null,
        text,
        type: 'text',
        reactions: {},
      });

    if (error) throw error;
  },

  async addReaction(
    msgId: string,
    emoji: string,
    currentUser: UserProfile,
    incidentId?: string
  ) {
    const table = incidentId ? 'incident_messages' : 'community_chat';

    const { data } = await supabase
      .from(table)
      .select('reactions')
      .eq('id', msgId)
      .single();

    if (!data) return;

    const reactions = data.reactions ?? {};
    const users: string[] = reactions[emoji] ?? [];
    if (users.includes(currentUser.uid)) return;

    reactions[emoji] = [...users, currentUser.uid];

    await supabase
      .from(table)
      .update({ reactions })
      .eq('id', msgId);
  }
};