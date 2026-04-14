import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes — ignore transient token refreshes that
    // briefly null-out the session, which would otherwise trigger a
    // redirect to landing and blow up the OAuth state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESHED always comes with a valid session — safe to update
      // SIGNED_IN / INITIAL_SESSION — safe to update
      // SIGNED_OUT — session will be null, that's intentional
      // USER_UPDATED — safe to update
      // Skip nothing, but only clear user state on explicit SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      } else if (session) {
        // Only update if we actually have a session — never null-out on refresh events
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);

      // Log visitor on sign-in
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user?.email) {
        fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

