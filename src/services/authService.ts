import {
  supabase,
  isSupabaseConfigured,
  ServiceResult,
} from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export interface SignUpParams {
  fullName: string;
  usn: string;
  mobileNumber: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  needsEmailConfirmation: boolean;
  user: UserProfile | null;
}

export function formatAuthError(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';
  const msg = typeof error === 'string' ? error : (error as { message?: string })?.message || '';
  const lower = msg.toLowerCase();

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('wrong password')
  ) {
    return 'Invalid email or password.';
  }
  if (
    lower.includes('already registered') ||
    lower.includes('user already registered') ||
    lower.includes('already exists') ||
    lower.includes('unique constraint')
  ) {
    return 'An account with this email already exists.';
  }
  if (
    lower.includes('email not confirmed') ||
    lower.includes('confirm your email') ||
    lower.includes('verify your email')
  ) {
    return 'Please verify your email before logging in.';
  }
  if (
    lower.includes('password') &&
    (lower.includes('weak') ||
      lower.includes('short') ||
      lower.includes('least 6') ||
      lower.includes('6 characters'))
  ) {
    return 'Password must be at least 6 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please try again in a few minutes.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Unable to reach the server. Please check your internet connection.';
  }
  return 'Something went wrong. Please try again.';
}

function mapProfile(
  profile: Record<string, any>,
  fallbackEmail = '',
  userMetadata?: Record<string, any>
): UserProfile {
  return {
    id: profile.id,
    email: profile.email || fallbackEmail,
    full_name: profile.full_name || userMetadata?.full_name || 'SkillLab User',
    role: (profile.role as UserRole) || 'STUDENT',
    avatar_url: profile.avatar_url || userMetadata?.avatar_url,
    student_number: profile.student_number || userMetadata?.student_number,
    mobile_number: profile.mobile_number || userMetadata?.mobile_number,
    cohort: profile.cohort,
    created_at: profile.created_at,
  };
}

export const authService = {
  /**
   * Real Supabase email/password login
   */
  async signInWithPassword(
    email: string,
    password: string
  ): Promise<ServiceResult<UserProfile>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: null,
        error: 'Authentication service is currently unavailable. Please check your configuration.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          data: null,
          error: formatAuthError(error),
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: 'Authentication failed. Please try again.',
        };
      }

      // Fetch the authenticated user's profile from public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        return {
          data: null,
          error:
            'Your account is authenticated, but your SkillLab profile could not be loaded.',
        };
      }

      return {
        data: mapProfile(profile, data.user.email || email.trim()),
        error: null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: formatAuthError(err),
      };
    }
  },

  /**
   * Real Supabase student registration
   */
  async signUpStudent(
    params: SignUpParams
  ): Promise<ServiceResult<SignUpResult>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: null,
        error: 'Authentication service is currently unavailable. Please check your configuration.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            student_number: params.usn.trim(),
            mobile_number: params.mobileNumber.trim(),
            role: 'STUDENT',
          },
        },
      });

      if (error) {
        return {
          data: null,
          error: formatAuthError(error),
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: 'Registration could not be completed. Please try again.',
        };
      }

      // If email confirmation is required, session will be null
      const needsEmailConfirmation = !data.session;
      let userProfile: UserProfile | null = null;

      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          userProfile = mapProfile(profile, data.user.email || params.email.trim());
        }
      }

      return {
        data: {
          needsEmailConfirmation,
          user: userProfile,
        },
        error: null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: formatAuthError(err),
      };
    }
  },

  /**
   * Real Supabase sign out
   */
  async signOut(): Promise<ServiceResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: true,
        error: null,
      };
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error: formatAuthError(error),
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: formatAuthError(err),
      };
    }
  },

  /**
   * Get currently active session and profile
   */
  async getCurrentSessionUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        return {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'SkillLab Student',
          role: (session.user.user_metadata?.role as UserRole) || 'STUDENT',
          avatar_url: session.user.user_metadata?.avatar_url,
          student_number: session.user.user_metadata?.student_number,
          mobile_number: session.user.user_metadata?.mobile_number,
          created_at: session.user.created_at,
        };
      }

      return mapProfile(profile, session.user.email || '', session.user.user_metadata);
    } catch {
      return null;
    }
  },

  /**
   * Update student profile in Supabase
   */
  async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      student_number?: string;
      mobile_number?: string;
      avatar_url?: string;
    }
  ): Promise<ServiceResult<UserProfile>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        data: null,
        error: 'Authentication service is currently unavailable.',
      };
    }

    try {
      const updatePayload: Record<string, any> = {};
      if (updates.full_name !== undefined) updatePayload.full_name = updates.full_name.trim();
      if (updates.student_number !== undefined) updatePayload.student_number = updates.student_number.trim();
      if (updates.mobile_number !== undefined) updatePayload.mobile_number = updates.mobile_number.trim();
      if (updates.avatar_url !== undefined) updatePayload.avatar_url = updates.avatar_url.trim();

      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      try {
        await supabase.auth.updateUser({
          data: updatePayload,
        });
      } catch {
        // Non-blocking
      }

      if (profileError) {
        return {
          data: null,
          error: formatAuthError(profileError),
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      return {
        data: mapProfile(updatedProfile, session?.user?.email || '', session?.user?.user_metadata),
        error: null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: formatAuthError(err),
      };
    }
  },
};
