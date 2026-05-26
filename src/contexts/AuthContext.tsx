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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    setProfileError(null);

    let lastError: unknown;

    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (!error) {
          setProfile(data);
          return;
        }

        lastError = error;

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      console.error("Error fetching profile:", lastError);
      setProfile(null);
      setProfileError(
        lastError instanceof Error
          ? lastError.message
          : "Unable to load your profile. Please sign out and sign back in.",
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to load your profile. Please sign out and sign back in.",
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  }, [fetchProfile, user?.id]);

  const loadAuth = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch (error) {
      console.error("Error loading initial auth:", error);
    } finally {
      setAuthResolved(true);
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession) => {
        console.log(`Auth Event: ${event}`);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setProfile(null);
          setProfileLoading(false);
          setProfileError(null);
          return;
        }

        setProfileLoading(true);
        setProfileError(null);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    if (!user?.id) {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }

    if (profile?.id === user.id) {
      setProfileLoading(false);
      return;
    }

    void fetchProfile(user.id);
  }, [authResolved, fetchProfile, profile, user?.id]);

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
    setProfileLoading(false);
    setProfileError(null);
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      session,
      user,
      profile,
      profileLoading,
      profileError,
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
      profileLoading,
      profileError,
      authResolved,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
