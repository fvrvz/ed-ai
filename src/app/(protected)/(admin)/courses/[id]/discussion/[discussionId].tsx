import Discussion from "@/components/Discussion";
import MessageBubble from "@/components/MessageBubble";
import { useAuth } from "@/hooks/useAuth";
import { Discussion as DiscussionType } from "@/types/discussion";
import { getDiscussionMessages, getDiscussions } from "@/utils/db";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { ComponentProps, useCallback, useState } from "react";
import { Text } from "react-native";

export default function DiscussionWithIdScreen() {
  const { id, discussionId } = useLocalSearchParams<{
    id: string;
    discussionId: string;
  }>();
  const { profile } = useAuth();

  const [messages, setMessages] = useState<
    ComponentProps<typeof MessageBubble>[]
  >([]);
  const [discussion, setDiscussion] = useState<DiscussionType>();
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    try {
      setLoading(true);
      const response = await getDiscussionMessages(discussionId);
      setMessages(response);
      const [data] = await getDiscussions({
        id: discussionId,
      });
      setDiscussion(data);
    } catch (error) {
      console.error("Error loading discussion:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [discussionId]),
  );

  if (loading) {
    return <Text>Loading discussion...</Text>;
  }

  return (
    <Discussion
      client_id={profile?.client_id || ""}
      course_id={id}
      user_id={profile?.id || ""}
      discussionId={discussionId}
      messages={messages}
      title={discussion?.title}
      status={discussion?.status}
    />
  );
}
