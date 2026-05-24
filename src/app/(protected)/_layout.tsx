import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { isLoggedIn, authResolved } = useAuth();

  if (!authResolved) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(member)" />
        <Stack.Screen name="(settings)" />
      </Stack.Protected>
    </Stack>
  );
}
