import { colors } from "@/styles/global";
import { ChatSession } from "@/types/chat";
import { getChatSessions } from "@/utils/db";
import { Ionicons } from "@expo/vector-icons";
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
  clientId: string;
};

export default function ChatSidebar({ profileId, courseId, clientId }: Props) {
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
        client_id: clientId,
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
      <TouchableOpacity
        style={[
          styles.sessionItem,
          {
            marginVertical: 10,
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
        onPress={() => router.push(`/courses/${courseId}/chat`)}
      >
        <Ionicons name="create-outline" size={16} style={{ marginRight: 6 }} />
        <Text style={styles.sessionText}>New</Text>
      </TouchableOpacity>

      <Text
        style={{
          marginTop: 12,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        Recent
      </Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.sessionItem,
              item.id === activeSessionId && {
                backgroundColor: colors.primary + "20",
              },
            ]}
            onPress={() => handleSessionPress(item.id)}
          >
            <Text
              style={[
                styles.sessionText,
                item.id === activeSessionId && styles.activeSession,
              ]}
            >
              {item.title.toLocaleLowerCase() || "Untitled Conversation"}
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
  },
  sessionList: {
    flex: 1,
  },
  sessionItem: {
    borderRadius: 8,
    color: colors.textSecondary,
    padding: 8,
  },
  activeSession: {
    color: colors.primary,
  },
  sessionText: {
    fontSize: 15,
  },
});
