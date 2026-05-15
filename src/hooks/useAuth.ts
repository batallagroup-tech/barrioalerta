import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userService } from '../services/supabase/userService';
import { oneSignalService } from '../services/oneSignalService';
import { UserProfile } from '../types';

function profileFromJWT(u: any): UserProfile {
  return {
    uid: u.id,
    email: u.email ?? null,
    displayName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email ?? null,
    photoURL: u.user_metadata?.avatar_url ?? null,
    showPublicName: true,
    preciseLocation: true,
  };
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('[Auth] event:', event, '| user:', session?.user?.email ?? 'null');

        if (session?.user) {
          // 1. Mostrar dashboard INMEDIATAMENTE con datos del JWT
          const jwtProfile = profileFromJWT(session.user);
          if (mounted) {
            setCurrentUser(jwtProfile);
            setLoading(false); // <- desbloquear YA, sin esperar DB
            oneSignalService.setUserId(session.user.id).catch(() => {});
          }

          // 2. Enriquecer con datos de DB en segundo plano (sin bloquear)
          userService.getProfile(session.user.id)
            .then(dbProfile => {
              if (mounted && dbProfile) setCurrentUser(dbProfile);
            })
            .catch(() => {
              // Si falla la DB, ya esta el perfil JWT - no importa
            });

          // 3. Guardar perfil si es nuevo usuario
          userService.getProfile(session.user.id)
            .then(existing => {
              if (!existing) userService.saveProfile(session.user.id, jwtProfile).catch(() => {});
            })
            .catch(() => {});

        } else {
          if (mounted) {
            setCurrentUser(null);
            setLoading(false);
            oneSignalService.logout().catch(() => {});
          }
        }
      }
    );

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return { currentUser, setCurrentUser, loading };
}



