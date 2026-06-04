import Discussion from "@/components/Discussion";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";

export default function DiscussionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  return (
    <Discussion
      client_id={profile?.client_id || ""}
      course_id={id}
      user_id={profile?.id || ""}
    />
  );
}
