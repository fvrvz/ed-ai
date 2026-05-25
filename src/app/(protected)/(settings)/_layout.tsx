import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function Layout() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const handleBackPress = () => {
    router.replace(isAdmin ? "/(protected)/(admin)" : "/(protected)/(member)");
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerBackTitle: "",
          headerLeft: () => (
            <Pressable
              onPress={handleBackPress}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="chevron-back-outline" size={24} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: "Profile", headerBackTitle: "" }}
      />
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen
          name="users"
          options={{ title: "Users", headerBackTitle: "" }}
        />
        <Stack.Screen
          name="secrets"
          options={{ title: "Secrets", headerBackTitle: "" }}
        />
      </Stack.Protected>
    </Stack>
  );
}
