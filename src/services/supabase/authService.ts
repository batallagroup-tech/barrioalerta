import { supabase } from '../../lib/supabase';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const authService = {

  async signInWithGoogle(): Promise<void> {
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.barrioalerta.app://login-callback'
      : window.location.href.split('?')[0].split('#')[0];

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No URL de OAuth');

    if (Capacitor.isNativePlatform()) {
      await Browser.open({
        url: data.url,
        windowName: '_self',
        presentationStyle: 'popover',
      });
    } else {
      window.location.href = data.url;
    }
  },

  async signInWithMagicLink(email: string): Promise<void> {
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.barrioalerta.app://login-callback'
      : window.location.href.split('?')[0].split('#')[0];

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
