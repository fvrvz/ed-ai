import Chat from "@/components/Chat";
import ChatBubble from "@/components/ChatBubble";
import { useAuth } from "@/hooks/useAuth";
import { getChatMessagesBySessionId } from "@/utils/db";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { ComponentProps, useCallback, useState } from "react";
import { Text } from "react-native";

export default function ChatWithSeesionScreen() {
  const { id, sessionId } = useLocalSearchParams<{
    id: string;
    sessionId: string;
  }>();
  const { profile } = useAuth();

  const [messages, setMessages] = useState<ComponentProps<typeof ChatBubble>[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    try {
      setLoading(true);
      const response = await getChatMessagesBySessionId(sessionId);
      setMessages(
        response.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.sender_type,
          created_at: msg.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading chat messages:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [sessionId]),
  );

  if (loading) {
    return <Text>Loading chat messages...</Text>;
  }

  return (
    <Chat
      clientId={profile?.client_id || ""}
      courseId={id}
      messages={messages}
      sessionId={sessionId}
    />
  );
}
