import { useState, useEffect } from 'react';
import { noticeService, Notice } from '../services/supabase/noticeService';
import { UserProfile } from '../types';

export function useNotices(currentUser: UserProfile | null) {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const unsub = noticeService.subscribeToNotices((incoming) => {
      setNotices(incoming);
    });
    return unsub;
  }, []);

  const sendNotice = async (data: {
    title: string;
    body: string;
    category: any;
    lat?: number;
    lng?: number;
  }) => {
    if (!currentUser) return;
    await noticeService.createNotice(data, currentUser);
  };

  return { notices, sendNotice };
}
