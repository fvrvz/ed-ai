import { colors } from "@/styles/global";
import { timeOptions } from "@/types/chat";
import { ChatMessage } from "@/utils/chat-service";
import { Linking, StyleSheet, Text, View } from "react-native";
import { EnrichedMarkdownText } from "react-native-enriched-markdown";

type Props = ChatMessage & {
  id: string;
  created_at?: string;
};

export default function ChatBubble({
  id,
  content: message,
  role,
  created_at,
}: Props) {
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
        <EnrichedMarkdownText
          markdown={message}
          flavor="github"
          onLinkPress={({ url }) => Linking.openURL(url)}
          markdownStyle={{
            paragraph: {
              color: "#fff",
            },
            list: {
              color: "#fff",
              markerColor: "#fff",
              bulletColor: "#fff",
            },
            link: {
              color: "#fff",
            },
          }}
          containerStyle={{
            padding: 0,
            margin: 0,
            backgroundColor: "transparent",
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 10,
          color: colors.textSecondary,
          marginHorizontal: 4,
          alignSelf: "flex-end",
        }}
      >
        {created_at
          ? new Date(created_at).toLocaleTimeString(undefined, timeOptions)
          : new Date(id).toLocaleTimeString(undefined, timeOptions)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  message: {
    maxWidth: 240,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderRadius: 12,
  },
});
