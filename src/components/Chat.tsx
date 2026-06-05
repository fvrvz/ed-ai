import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { prompt } from "@/utils/chat-service";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ChatBubble from "./ChatBubble";
import ChatSidebar from "./ChatSidebar";
import Title from "./Title";

type Props = {
  messages?: ComponentProps<typeof ChatBubble>[];
  clientId: string;
  courseId: string;
  sessionId?: string;
};

// 1. Get the screen width to calculate side positioning
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75; // Sidebar fills 75% of screen width

export default function Chat({
  messages: msgs = [],
  clientId,
  courseId,
  sessionId = undefined,
}: Props) {
  const { profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<typeof msgs>([...msgs]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const translateX = useSharedValue(-SIDEBAR_WIDTH);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      // Slide back into hiding position
      translateX.value = withTiming(-SIDEBAR_WIDTH, {
        duration: 300,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    } else {
      // Slide out into fully open position (X = 0)
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    }
    setSidebarOpen(!sidebarOpen);
  };

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    // If open, opacity goes to 0.5, otherwise 0
    opacity: withTiming(translateX.value === 0 ? 0.5 : 0, { duration: 300 }),
  }));

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: (typeof msgs)[number] = {
      id: Date.now().toString(),
      content: inputText,
      role: "user",
      created_at: new Date().toISOString(),
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
      const { assistantMessage: aiAnswer } = await prompt({
        clientId,
        courseId,
        profileId: profile?.id || "",
        messages: nextMessages.map(({ content, role }) => ({ content, role })),
        sessionId,
      });

      setMessages((prev) => [
        {
          role: "assistant",
          content: aiAnswer,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        },
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={toggleSidebar} style={{ padding: 8 }}>
            <Ionicons name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          <Title>Chat</Title>
        </View>

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
          inverted={messages.length > 0}
          style={{ marginVertical: 8, flex: 1 }}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <Text style={{ color: "#6b7280" }}>
              No messages yet. Start the conversation!
            </Text>
          )}
          contentContainerStyle={
            messages.length === 0 && {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }
          }
          ref={flatListRef}
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
      {/* BACKDROP OVERLAY: Taps here close the drawer smoothly */}
      {sidebarOpen && (
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={toggleSidebar} />
        </Animated.View>
      )}

      <Animated.View style={[styles.sidebar, animatedSidebarStyle]}>
        <ChatSidebar
          courseId={courseId}
          profileId={profile?.id!}
          clientId={clientId}
        />
      </Animated.View>
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

  /* OVERLAY BACKDROP STYLES */
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
    zIndex: 10,
  },
  /* SIDEBAR DRAWER STYLES */
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#efefef",
    zIndex: 20,
    paddingTop: 20,
    borderRightWidth: 1,
    borderRightColor: "#2c2c2e",
    elevation: 5, // Android shadows fallback
    shadowColor: "#000000", // iOS native shadow mapping
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
