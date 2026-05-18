import { JwtPayload, Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "member";

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  claims: JwtPayload | null;
  profile: Profile | null;
  loading: boolean;
  isLoggedIn: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  fullName: string | null;
}
