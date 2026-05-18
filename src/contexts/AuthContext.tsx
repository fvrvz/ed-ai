import { supabase } from "@/utils/supabase";
import { JwtPayload } from "@supabase/supabase-js";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  [key: string]: any;
};

type AuthContextValue = {
  claims: JwtPayload | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ data?: any; error?: any }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [claims, setClaims] = useState<JwtPayload | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the claims once, and subscribe to auth state changes
  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getClaims();
      if (error) {
        console.error("Error fetching claims:", error);
      }
      setClaims(data?.claims ?? null);
      setLoading(false);
    };
    fetchClaims();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      console.log("Auth state changed:", { event: _event });
      const { data } = await supabase.auth.getClaims();
      setClaims(data?.claims ?? null);
    });
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  // Fetch the profile when the claims change
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (claims) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", claims.sub)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [claims]);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error, data } as any;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setClaims(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        claims,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isLoggedIn: !!claims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
