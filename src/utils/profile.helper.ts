import { Profile } from "@/types/auth";

export function getFullName(profile: Profile | null): string {
  if (!profile) return "";

  return `${profile.first_name} ${profile.last_name}`;
}
