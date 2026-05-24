import { SplashScreenController } from "@/components/SplashScreenController";
import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

function RootNavigator() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SplashScreenController />
      <RootNavigator />
    </AuthProvider>
  );
}
