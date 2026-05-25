import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
  const { isAdmin } = useAuth();

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
