import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService, SignUpParams } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  role: UserProfile['role'] | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpStudent: (params: SignUpParams) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    student_number?: string;
    mobile_number?: string;
    avatar_url?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentSessionUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
          const profile = await authService.getCurrentSessionUser();
          if (mounted) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    const { data, error } = await authService.signInWithPassword(email, password);

    setLoading(false);

    if (error || !data) {
      const errorMsg = error || 'Invalid email or password.';
      showToast('Login Failed', errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    setUser(data);

    showToast(
      `Welcome back, ${data.full_name}`,
      `Logged in to your portal`,
      'success'
    );

    return { success: true };
  };

  const signUpStudent = async (
    params: SignUpParams
  ): Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }> => {
    setLoading(true);

    const { data, error } = await authService.signUpStudent(params);

    setLoading(false);

    if (error || !data) {
      const errorMsg = error || 'Registration could not be completed.';
      showToast('Registration Error', errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    if (data.user) {
      setUser(data.user);
      showToast(
        'Registration Successful',
        `Welcome to SkillLab, ${data.user.full_name}!`,
        'success'
      );
    }

    return {
      success: true,
      needsEmailConfirmation: data.needsEmailConfirmation,
    };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);

    showToast(
      'Signed Out',
      'You have been safely signed out.',
      'info'
    );
  };

  const refreshProfile = async () => {
    const profile = await authService.getCurrentSessionUser();
    setUser(profile);
  };

  const updateProfile = async (updates: {
    full_name?: string;
    student_number?: string;
    mobile_number?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User is not authenticated.' };
    }

    const { data, error } = await authService.updateProfile(user.id, updates);
    if (error || !data) {
      const err = error || 'Could not update profile details.';
      showToast('Profile Update Error', err, 'error');
      return { success: false, error: err };
    }

    setUser(data);
    showToast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        signIn,
        signUpStudent,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
