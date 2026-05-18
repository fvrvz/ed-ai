import { SplashScreenController } from "@/components/SplashScreenController";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      {/* <Stack.Screen name="+not-found" /> */}
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
