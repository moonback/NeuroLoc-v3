import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth.service';
import { Profile } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await authService.getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        (async () => {
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              const userProfile = await authService.getProfile(session.user.id);
              setProfile(userProfile);
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          } else {
            setProfile(null);
          }
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await authService.getProfile(user.id);
      setProfile(userProfile);
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    refreshProfile
  };
};
