import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export type NoticeCategory = 'Corte de luz' | 'Obras' | 'Evento' | 'Agua' | 'Transporte' | 'General';

export interface Notice {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  title: string;
  body: string;
  category: NoticeCategory;
  lat?: number;
  lng?: number;
  createdAt: string;
}

export const NOTICE_CATEGORIES: { id: NoticeCategory; emoji: string; color: string }[] = [
  { id: 'Corte de luz', emoji: '⚡', color: 'text-yellow-400' },
  { id: 'Obras',        emoji: '🚧', color: 'text-orange-400' },
  { id: 'Evento',       emoji: '🎉', color: 'text-purple-400' },
  { id: 'Agua',         emoji: '💧', color: 'text-blue-400'   },
  { id: 'Transporte',   emoji: '🚌', color: 'text-green-400'  },
  { id: 'General',      emoji: '📢', color: 'text-slate-400'  },
];

function toNotice(row: any): Notice {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userPhoto: row.user_photo,
    title: row.title,
    body: row.body,
    category: row.category,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
  };
}

export const noticeService = {
  subscribeToNotices(callback: (notices: Notice[]) => void) {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    supabase
      .from('notices')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) callback(data.map(toNotice)); });

    const channel = supabase
      .channel('notices-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notices',
      }, () => {
        supabase
          .from('notices')
          .select('*')
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(50)
          .then(({ data }) => { if (data) callback(data.map(toNotice)); });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  async createNotice(
    data: { title: string; body: string; category: NoticeCategory; lat?: number; lng?: number },
    currentUser: UserProfile
  ) {
    const { error } = await supabase
      .from('notices')
      .insert({
        user_id: currentUser.uid,
        user_name: currentUser.showPublicName ? currentUser.displayName ?? 'Vecino' : 'Vecino',
        user_photo: currentUser.showPublicName ? currentUser.photoURL : null,
        title: data.title,
        body: data.body,
        category: data.category,
        lat: data.lat,
        lng: data.lng,
      });
    if (error) throw error;
  },
};
