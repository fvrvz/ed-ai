import { colors } from "@/styles/global";
import { ChatSession } from "@/types/chat";
import { getChatSessions } from "@/utils/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Title from "./Title";

type Props = {
  profileId: string;
  courseId: string;
};

export default function ChatSidebar({ profileId, courseId }: Props) {
  const router = useRouter();
  const { sessionId: activeSessionId } = useLocalSearchParams<{
    sessionId: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  async function loadChatSessions() {
    setLoading(true);
    try {
      const data = await getChatSessions({
        profile_id: profileId,
        course_id: courseId,
      });
      setSessions(data);
    } catch (error) {
      console.error("Failed to load chat sessions", { error });
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadChatSessions();
    }, []),
  );

  function handleSessionPress(sessionId: string) {
    router.push(`/courses/${courseId}/chat/${sessionId}`);
  }

  return (
    <View style={styles.sidebar}>
      <Title style={styles.sidebarTitle}>Conversations</Title>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sessionItem}
            onPress={() => handleSessionPress(item.id)}
          >
            <Text
              style={[
                styles.sessionText,
                item.id === activeSessionId && styles.activeSession,
              ]}
            >
              {item.title || "Untitled Conversation"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.sessionText}>
              No conversations yet. Start a new chat!
            </Text>
          ) : null
        }
        style={styles.sessionList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sessionList: {
    flex: 1,
  },
  sessionItem: {
    marginVertical: 5,
    borderRadius: 8,
    paddingVertical: 8,
    color: colors.textSecondary,
  },
  activeSession: {
    color: colors.primary,
  },
  sessionText: {
    fontSize: 15,
  },
});
