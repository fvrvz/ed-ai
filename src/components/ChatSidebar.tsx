import { ChatSession } from "@/types/chat";
import { getChatSessions } from "@/utils/db";
import { useFocusEffect } from "expo-router";
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

  return (
    <View style={styles.sidebar}>
      <Title style={styles.sidebarTitle}>Conversations</Title>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.sessionItem}>
            <Text style={styles.sessionText}>
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
  },
  sidebarHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#2c2c2e",
    color: "#ffffff",
  },
  sidebarTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  sessionList: {
    gap: 8,
  },
  sessionItem: {
    marginVertical: 14,
    borderRadius: 8,
  },
  activeSession: {
    backgroundColor: "#2c2c2e",
  },
  sessionText: {
    color: "#ffffff",
    fontSize: 15,
  },
});
