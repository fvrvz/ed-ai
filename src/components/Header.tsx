import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header() {
  const router = useRouter();

  const handlePress = () => {
    router.replace("/(protected)/(settings)");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View>
        <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="notifications" size={24} />
        </Pressable>
      </View>
      <View>
        <Pressable
          onPress={handlePress}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="settings-outline" size={24} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
});
