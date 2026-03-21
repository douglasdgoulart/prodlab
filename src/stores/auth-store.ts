import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  initialized: boolean;
  setAuth: (user: User | null, role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchRole: (userId: string) => Promise<UserRole | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  initialized: false,

  setAuth: (user, role) => set({ user, role }),
  setLoading: (loading) => set({ loading }),
  setInitialized: () => set({ initialized: true }),

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },

  fetchRole: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data.role as UserRole;
  },
}));
