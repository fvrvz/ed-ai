import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { sendChatMessageToGrok } from "@/utils/chat-service";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChatBubble from "./ChatBubble";
import Title from "./Title";

type Props = {
  messages?: ComponentProps<typeof ChatBubble>[];
  clientId: string;
  courseId: string;
};

export default function Chat({
  messages: msgs = [],
  clientId,
  courseId,
}: Props) {
  const { profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<typeof msgs>([...msgs]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: (typeof msgs)[number] = {
      id: Date.now().toString(),
      content: inputText,
      role: "user",
    };

    const nextMessages = [newMessage, ...messages];

    // 2. Prepend the new message so it instantly appears at the bottom
    setMessages(nextMessages);
    setInputText("");
    setError(null);

    // 3. Optional: Smoothly scroll to the very bottom (index 0) if user scrolled up
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });

    // 4. Send to AI
    setLoading(true);
    try {
      const { assistantMessage: aiAnswer } = await sendChatMessageToGrok({
        clientId,
        courseId,
        profileId: profile?.id || "",
        messages: nextMessages.map(({ content, role }) => ({ content, role })),
      });

      setMessages((prev) => [
        { role: "assistant", content: aiAnswer, id: Date.now().toString() },
        ...prev,
      ]);

      // Optional: Smoothly scroll to the very bottom (index 0) if user scrolled up
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Chat routing error:", err);
      setError(errorMsg);

      // Remove the user message on error
      setMessages((prev) => prev.slice(1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={{ flex: 1 }}
      >
        <Title>Chat</Title>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 10 }}>
              <ChatBubble {...item} />
            </View>
          )}
          inverted
          style={{ marginVertical: 8, flex: 1 }}
          keyExtractor={(item) => item.id}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter message..."
            placeholderTextColor="#9ca3af"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#374151",
    color: "#fff",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: "center",
    marginLeft: 12,
    padding: 12,
    backgroundColor: "#10b981",
    borderRadius: 50,
  },
  sendButtonDisabled: {
    backgroundColor: "#6b7280",
    opacity: 0.6,
  },
  sendText: { color: "#fff", fontWeight: "600" },
  loadingContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1f2937",
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  loadingText: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#7f1d1d",
    borderLeftWidth: 4,
    borderLeftColor: "#f87171",
  },
  errorText: {
    color: "#fca5a5",
    fontWeight: "500",
    fontSize: 14,
  },
});
