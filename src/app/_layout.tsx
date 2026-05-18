import { SplashScreenController } from "@/components/SplashScreenController";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

function RootNavigator() {
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn && isAdmin}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn && !isAdmin}>
        <Stack.Screen name="(member)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SplashScreenController />
      <RootNavigator />
    </AuthProvider>
  );
}
