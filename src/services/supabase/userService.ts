import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) return null;

    return {
      uid: data.id,
      email: data.email,
      displayName: data.full_name,
      photoURL: data.avatar_url,
      showPublicName: data.show_public_name ?? true,
      preciseLocation: data.precise_location ?? true,
      fcmToken: data.fcm_token,
      reputation: data.reputation,
      verification: data.verification,
    };
  },

  async saveProfile(uid: string, profile: Partial<UserProfile>) {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: uid,
        email: profile.email,
        full_name: profile.displayName,
        avatar_url: profile.photoURL,
        show_public_name: profile.showPublicName ?? true,
        precise_location: profile.preciseLocation ?? true,
        fcm_token: profile.fcmToken,
        reputation: profile.reputation,
        verification: profile.verification,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) throw error;
  }
};