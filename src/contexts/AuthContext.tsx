import { AuthContextValue, Profile } from "@/types/auth";
import { supabase } from "@/utils/supabase";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      // We do NOT throw here, just handle gracefully
      return;
    }
    setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  }, [fetchProfile, user?.id]);

  const loadAuth = useCallback(async () => {
    try {
      // 1. Get the session from AsyncStorage (Fast)
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // 2. If we have a user, fetch the profile immediately
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }
    } catch (error) {
      console.error("Error loading initial auth:", error);
    } finally {
      // 3. Unblock the App - The ONLY place we handle the initial unblock
      setAuthResolved(true);
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession) => {
        console.log(`Auth Event: ${event}`);

        // 1. Update strict auth state immediately
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // 2. Handle Logout
        if (!currentSession?.user) {
          setProfile(null);
          return;
        }

        // 3. Handle Login / Token Refresh / User Updates
        // We fetch the profile to keep data fresh, but we DO NOT block the UI.
        // The app is already running (authResolved is true), so this happens in background.
        try {
          await fetchProfile(currentSession.user.id);
        } catch (error) {
          console.error("Profile update error:", error);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    [],
  );

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
      if (error) throw error;
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
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
      isSuperAdmin: profile?.role === "super_admin",
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
