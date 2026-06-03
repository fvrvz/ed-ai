import Chat from "@/components/Chat";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  return <Chat clientId={profile?.client_id || ""} courseId={id} />;
}
