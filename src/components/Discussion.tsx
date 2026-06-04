import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { Base } from "@/types/base";
import { type Discussion } from "@/types/discussion";
import { addDiscussionMessage, createDiscussion } from "@/utils/db";
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
import Badge from "./Badge";
import DiscussionSidebar from "./DiscussionSidebar";
import MessageBubble from "./MessageBubble";
import Title from "./Title";

type Props = {
  messages?: ComponentProps<typeof MessageBubble>[];
  discussionId?: string;
} & Omit<Discussion, keyof Base | "title" | "status"> &
  Partial<Pick<Discussion, "title" | "status">>;

type Message = Omit<
  ComponentProps<typeof MessageBubble>,
  "profile" | "updated_at"
>;

// 1. Get the screen width to calculate side positioning
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75; // Sidebar fills 75% of screen width

export default function Discussion({
  messages: msgs = [],
  client_id: clientId,
  course_id: courseId,
  discussionId: discussionIdProp,
  title: titleProp,
  status = "opened",
}: Props) {
  const { profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const userJustSentMessageRef = useRef(false);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([...msgs]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState<string>(titleProp || "");
  const [discussionId, setDiscussionId] = useState<string>(
    discussionIdProp || "",
  );

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

    setLoading(true);
    let _discussionId = discussionId;
    const currentInputText = inputText;

    try {
      // open a discussion
      if (!_discussionId) {
        const data = await createDiscussion({
          client_id: clientId,
          course_id: courseId,
          status: "opened",
          title: currentInputText,
          user_id: profile?.id!,
        });
        _discussionId = data.id;
        setDiscussionId(data.id);
        setTitle(data.title);
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputText,
        role: profile?.role || "member",
        created_at: new Date().toISOString(),
        user_id: profile?.id!,
        discussion_id: _discussionId,
      };

      const instantPayload: ComponentProps<typeof MessageBubble> = {
        ...newMessage,
        profile: {
          first_name: profile?.first_name!,
          last_name: profile?.last_name!,
        },
      };

      // 2. Prepend the new message so it instantly appears at the bottom
      setMessages((prev) => [instantPayload, ...prev]);
      setInputText("");
      setError(null);

      userJustSentMessageRef.current = true;

      const { id, ...payload } = newMessage;
      // 4. Send to DB
      await addDiscussionMessage(payload);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Discussion routing error:", err);
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={toggleSidebar} style={{ padding: 8 }}>
            <Ionicons name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Title>{title || "Discussion"}</Title>
          </View>
          {discussionId && (
            <Badge
              text={status.toUpperCase()}
              variant={status === "closed" ? "success" : "info"}
              outline
            />
          )}
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
              <MessageBubble {...item} />
            </View>
          )}
          inverted={messages.length > 0}
          style={{ marginVertical: 8, flex: 1 }}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <Text style={{ color: "#6b7280" }}>
              No messages yet. Start the discussion!
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
          onContentSizeChange={() => {
            if (userJustSentMessageRef.current) {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
              userJustSentMessageRef.current = false;
            }
          }}
        />

        <View
          style={[
            styles.inputContainer,
            !discussionId
              ? styles.containerNewThread
              : styles.containerActiveChat,
          ]}
        >
          {/* ONLY show the Subject text input box if we are creating a brand new thread */}
          {!discussionId && (
            <TextInput
              style={styles.subjectInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter subject title..."
              placeholderTextColor="#9ca3af"
              editable={!loading}
            />
          )}

          <View
            style={
              discussionId ? styles.rowChatWrapper : { width: "100%", gap: 8 }
            }
          >
            <TextInput
              style={[
                styles.input,
                discussionId ? styles.inputActiveChat : styles.inputNewThread,
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                !discussionId
                  ? "Enter your first message..."
                  : "Type a message..."
              }
              placeholderTextColor="#9ca3af"
              editable={!loading}
              multiline
              numberOfLines={!discussionId ? 4 : 1}
              textAlignVertical={!discussionId ? "top" : "center"}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                loading && styles.sendButtonDisabled,
                !discussionId
                  ? styles.sendButtonNewThread
                  : styles.sendButtonActiveChat,
              ]}
              onPress={sendMessage}
              disabled={loading || (!discussionId && !title.trim())} // Block accidental empty threads
            >
              <Ionicons name="send" size={18} color="#fff" />
              {!discussionId && (
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Create Discussion
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* BACKDROP OVERLAY: Taps here close the drawer smoothly */}
      {sidebarOpen && (
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={toggleSidebar} />
        </Animated.View>
      )}

      <Animated.View style={[styles.sidebar, animatedSidebarStyle]}>
        <DiscussionSidebar
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
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  containerNewThread: {
    flexDirection: "column",
    gap: 10,
  },
  containerActiveChat: {
    flexDirection: "column",
  },
  rowChatWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  inputNewThread: {
    minHeight: 80,
    paddingTop: 10,
  },
  inputActiveChat: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingTop: Platform.OS === "ios" ? 10 : 6,
    paddingBottom: Platform.OS === "ios" ? 10 : 6,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonNewThread: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    width: "100%",
  },
  sendButtonActiveChat: {
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
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
