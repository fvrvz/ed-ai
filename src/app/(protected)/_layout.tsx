import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { authResolved, isAdmin } = useAuth();

  if (!authResolved) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAdmin}>
        <Stack.Screen name="(member)" />
      </Stack.Protected>
      <Stack.Screen name="(settings)" />
    </Stack>
  );
}
