import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/styles/global";
import { timeOptions } from "@/types/chat";
import { DiscussionMessage } from "@/types/discussion";
import { StyleSheet, Text, View } from "react-native";
import Badge from "./Badge";

type Props = Omit<DiscussionMessage, "updated_at"> & { updated_at?: string };

function getRoleBg(role: Props["role"]): string {
  switch (role) {
    case "edai":
      return colors.primary;
    case "admin":
      return colors.warning;
    case "super_admin":
      return colors.secondary;
    default:
      return colors.success;
  }
}

export default function MessageBubble({
  id,
  content: message,
  role,
  created_at,
  user_id,
  profile: { first_name, last_name },
}: Props) {
  const { profile } = useAuth();
  const isLoggedUser = user_id === profile?.id;

  return (
    <View
      key={id}
      style={[
        styles.container,
        { flexDirection: isLoggedUser ? "row-reverse" : "row" },
      ]}
    >
      <View
        style={[
          styles.message,
          isLoggedUser && { backgroundColor: colors.primary + "20" },
        ]}
      >
        <Text style={{ marginBottom: 8 }}>{message}</Text>
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary }}>
            {first_name} {last_name}
          </Text>
          <Badge text={role.toUpperCase()} color={getRoleBg(role)} />
        </View>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: colors.textSecondary,
          marginHorizontal: 4,
          alignSelf: "flex-end",
        }}
      >
        {new Date(created_at).toLocaleTimeString(undefined, timeOptions)}
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.textSecondary + "20",
  },
});
