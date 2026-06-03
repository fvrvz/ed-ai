import { ChatSession } from "@/types/chat";
import { getChatSessions } from "@/utils/db";
import { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  useLoadEffect(
    useCallback(() => {
      loadChatSessions();
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="flex-1 p-4">
          <Title>Conversations</Title>

          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity className="mt-4 p-4 bg-gray-100 rounded-lg">
                <Text className="text-gray-700">
                  {item.title || "Untitled Conversation"}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading ? (
                <Text className="text-gray-500 mt-4">
                  No conversations yet. Start a new chat!
                </Text>
              ) : null
            }
          />
          {/* <TouchableOpacity className="mt-4 p-4 bg-gray-100 rounded-lg">
            <Text className="text-gray-700">Chat about Course 101</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mt-4 p-4 bg-gray-100 rounded-lg">
            <Text className="text-gray-700">Chat about Course 202</Text>
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function useLoadEffect(arg0: () => void) {
  throw new Error("Function not implemented.");
}
