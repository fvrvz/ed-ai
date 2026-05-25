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
      const sessionResponse = await supabase.auth.getSession();
      const currentSession = sessionResponse.data.session;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user?.id) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
      setProfile(null);
    } finally {
      setAuthResolved(true); // Always resolves initial load state
    }
  }, [fetchProfile]);

  /**
   * Initial load execution
   */
  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  /**
   * Auth state listener (FIXED LOOP AND REFRESH PROTECTION)
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession) => {
        console.log("Auth event caught:", event);

        // 1. Only show the full screen loading spinner if it's a completely fresh sign-in.
        // Ignore TOKEN_REFRESHED so the app doesn't flash or freeze in the background.
        if (event === "SIGNED_IN") {
          setAuthResolved(false);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // 2. Handle immediate logout cleanly
        if (!currentSession?.user) {
          setProfile(null);
          setAuthResolved(true);
          return;
        }

        try {
          // 3. Fetch profile updates
          await fetchProfile(currentSession.user.id);
        } catch (error) {
          console.error("Error updating state profile context mapping:", error);
          setProfile(null);
        } finally {
          // 4. GUARANTEED RESOLUTION: This block will always run even if network items fail,
          // ensuring the UI unfreezes and doesn't get stuck on the ActivityIndicator.
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
      if (error) throw error;
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
      if (error) throw error;
    },
    [],
  );

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

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
