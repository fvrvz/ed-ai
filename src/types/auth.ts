import { Session, User } from "@supabase/supabase-js";
import { Base } from "./base";

export type UserRole = "admin" | "member" | "super_admin";

export interface Profile extends Base {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  phone: string | null;
  client_id: string | null;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  authResolved: boolean;
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
  isSuperAdmin: boolean;
}
