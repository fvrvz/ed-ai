import { colors } from "@/styles/global";
import { Discussion } from "@/types/discussion";
import { getDiscussions } from "@/utils/db";
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
import Badge from "./Badge";
import Title from "./Title";

type Props = {
  profileId: string;
  courseId: string;
  clientId: string;
};

export default function DiscussionSidebar({
  profileId,
  courseId,
  clientId,
}: Props) {
  const router = useRouter();
  const { discussionId: activeDiscussionId } = useLocalSearchParams<{
    discussionId: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  async function loadDiscussions() {
    setLoading(true);
    try {
      const data = await getDiscussions({
        client_id: clientId,
        course_id: courseId,
        user_id: profileId,
      });

      setDiscussions(data);
    } catch (error) {
      console.error("Failed to load discussions", { error });
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadDiscussions();
    }, []),
  );

  function handleDiscussionPress(id: string) {
    router.push(`/courses/${courseId}/discussion/${id}`);
  }

  return (
    <View style={styles.sidebar}>
      <Title style={styles.sidebarTitle}>Discussions</Title>
      <TouchableOpacity
        style={[
          styles.discussionItem,
          {
            marginVertical: 10,
            justifyContent: "flex-start",
          },
        ]}
        onPress={() => router.push(`/courses/${courseId}/discussion`)}
      >
        <Ionicons name="create-outline" size={16} />
        <Text style={styles.discussionText}>New</Text>
      </TouchableOpacity>

      <Text
        style={{
          marginTop: 12,
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        Recent
      </Text>

      <FlatList
        data={discussions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.discussionItem,
              item.id === activeDiscussionId && {
                backgroundColor: colors.primary + "20",
              },
            ]}
            onPress={() => handleDiscussionPress(item.id)}
          >
            <Text
              style={[
                styles.discussionText,
                item.id === activeDiscussionId && styles.activeDiscussion,
                { flex: 1 },
              ]}
              numberOfLines={1}
            >
              {item.title.toLocaleLowerCase() || "Untitled Discussion"}
            </Text>
            <View style={{ flexShrink: 9 }}>
              <Badge
                text={item.status.toUpperCase()}
                variant={item.status === "closed" ? "success" : "info"}
              />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.discussionText}>
              No conversations yet. Start a new discussion!
            </Text>
          ) : null
        }
        style={styles.discussionList}
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
  discussionList: {
    flex: 1,
  },
  discussionItem: {
    borderRadius: 8,
    color: colors.textSecondary,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  activeDiscussion: {
    color: colors.primary,
  },
  discussionText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
