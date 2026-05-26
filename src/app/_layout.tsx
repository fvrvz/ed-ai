import { SplashScreenController } from "@/components/SplashScreenController";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { ActivityIndicator, Button, Text, View } from "react-native";

function RootNavigator() {
  const {
    authResolved,
    isLoggedIn,
    profile,
    profileLoading,
    profileError,
    signOut,
  } = useAuth();

  if (!authResolved) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isLoggedIn && profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isLoggedIn && profileError && !profile) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ textAlign: "center", marginBottom: 12 }}>
          We couldn't load your profile. Please sign out and sign back in.
        </Text>
        <Button title="Sign out" onPress={signOut} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
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
