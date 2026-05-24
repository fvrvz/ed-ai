import { supabase } from "@/utils/supabase";

import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AuthContextValue, Profile } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  /**
   * Fetch user profile
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);

      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  /**
   * Refresh profile manually
   */
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    await fetchProfile(user.id);
  }, [fetchProfile, user?.id]);

  /**
   * Load initial auth state
   */
  const loadAuth = useCallback(async () => {
    setAuthResolved(false); // Start as unresolved
    try {
      const sessionResponse = await supabase.auth.getSession();
      const currentSession = sessionResponse.data.session;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user?.id) {
        // Wait for profile before setting resolved to true
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
      setProfile(null);
    } finally {
      setAuthResolved(true); // Triggers layout evaluation cleanly
    }
  }, [fetchProfile]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  /**
   * Auth state listener
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log("Auth event:", event);

        // 1. If logging in or token refreshed, block routing by resetting authResolved
        if (session?.user) {
          setAuthResolved(false);
        }

        setSession(session);
        setUser(session?.user ?? null);

        // Handle logout
        if (!session?.user) {
          setProfile(null);
          setAuthResolved(true);
          return;
        }

        try {
          // 2. Wait for the profile to download completely
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching profile on auth state change:", error);
          setProfile(null);
        } finally {
          // 3. Only unlock routing once BOTH session AND profile data are in memory
          setAuthResolved(true);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Sign in
   */
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    },
    [],
  );

  /**
   * Sign up
   */
  const signUpWithEmail = useCallback(
    async ({
      email,
      password,
      firstName,
      lastName,
      phone,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
          },
        },
      });

      if (error) {
        throw error;
      }
    },
    [],
  );

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      authResolved,
      isLoggedIn: !!session,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      isAdmin: profile?.role === "admin",
    }),
    [
      session,
      user,
      profile,
      authResolved,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
