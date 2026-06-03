import { colors } from "@/styles/global";
import { ChatMessage } from "@/utils/chat-service";
import { StyleSheet, Text, View } from "react-native";

type Props = ChatMessage & {
  id: string;
};

export default function ChatBubble({ id, content: message, role }: Props) {
  const isUser = role === "user";

  return (
    <View
      key={id}
      style={[
        styles.container,
        { flexDirection: isUser ? "row-reverse" : "row" },
      ]}
    >
      <View
        style={[
          styles.message,
          {
            backgroundColor: isUser ? colors.primary : colors.success,
          },
        ]}
      >
        <Text style={{ color: "#fff" }}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  message: {
    maxWidth: 200,
    padding: 8,
    borderRadius: 12,
  },
});
