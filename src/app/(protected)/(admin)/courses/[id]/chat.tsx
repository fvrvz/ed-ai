import Chat from "@/components/Chat";
import ChatBubble from "@/components/ChatBubble";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";
import { ComponentProps } from "react";

const messages: ComponentProps<typeof ChatBubble>[] = [
  {
    id: "1",
    role: "user",
    content: "lsjdfdljsf sfjsdknfdsk svdkjfdnf dfjnlf",
  },
  {
    id: "2",
    role: "assistant",
    content: "lsjdfdljsf sfjsdknfdsk svdkjfdnf dfjnlf",
  },
  {
    id: "3",
    role: "user",
    content: "lsjdfdljsf sfjsdknfdsk svdkjfdnf dfjnlf",
  },
  {
    id: "4",
    role: "assistant",
    content: "lsjdfdljsf sfjsdknfdsk svdkjfdnf dfjnlf",
  },
  {
    id: "5",
    role: "user",
    content: "lsjdfdljsf sfjsdknfdsk svdkjfdnf dfjnlf",
  },
  {
    id: "6",
    role: "assistant",
    content: "lsjdfdljsf sfjsdknfdsk svdkjfdnf dfjnlf",
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  return <Chat clientId={profile?.client_id || ""} courseId={id} />;
}
