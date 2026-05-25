import { Profile } from "@/types/auth";
import { getFullName } from "@/utils/profile.helper";
import {
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Badge from "./Badge";

type UserCardProps = Profile & { style?: StyleProp<ViewStyle> };

export default function UserCard({ style, ...profile }: UserCardProps) {
  const name = getFullName(profile);
  const { email, role, is_active, phone } = profile;

  return (
    <View style={[styles.card, style]}>
      <View style={{ flex: 1, rowGap: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{name}</Text>
        <Text style={{ color: "#666" }}>{email}</Text>
        <Text style={{ color: "#666" }}>{phone ?? "N/A"}</Text>
        <Badge
          text={role.toUpperCase()}
          variant={role === "admin" ? "success" : "info"}
        />
      </View>
      <Switch
        value={is_active}
        onValueChange={() => {}}
        style={styles.switch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switch: {
    transform: [{ scale: 0.8 }],
    alignSelf: "center",
  },
});
