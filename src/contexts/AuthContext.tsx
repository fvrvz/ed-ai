import { supabase } from "@/utils/supabase";

import {
  AuthChangeEvent,
  JwtPayload,
  Session,
  User,
} from "@supabase/supabase-js";

import React, {
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
  const [claims, setClaims] = useState<JwtPayload | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
    try {
      setLoading(true);

      const [sessionResponse, claimsResponse] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getClaims(),
      ]);

      const currentSession = sessionResponse.data.session;

      const currentClaims = claimsResponse.data?.claims ?? null;

      setSession(currentSession);

      setUser(currentSession?.user ?? null);

      setClaims(currentClaims);

      if (currentSession?.user?.id) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
    } finally {
      setLoading(false);
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

        setSession(session);

        setUser(session?.user ?? null);

        if (!session?.user) {
          setClaims(null);
          setProfile(null);
          return;
        }

        const { data } = await supabase.auth.getClaims();

        setClaims(data?.claims ?? null);

        await fetchProfile(session.user.id);
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
    setClaims(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      claims,
      profile,
      loading,
      isLoggedIn: !!session,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      isAdmin: profile?.role === "admin",
      fullName: profile ? `${profile.first_name} ${profile.last_name}` : null,
    }),
    [
      session,
      user,
      claims,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
