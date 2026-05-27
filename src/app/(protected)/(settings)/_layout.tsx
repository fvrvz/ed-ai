import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

function getBackPath(role: UserRole | undefined) {
  switch (role) {
    case "super_admin":
      return "/(protected)/(super-admin)";
    case "admin":
      return "/(protected)/(admin)";
    default:
      return "/(protected)/(member)";
  }
}

export default function Layout() {
  const router = useRouter();
  const { profile, isAdmin, isSuperAdmin } = useAuth();

  const handleBackPress = () => {
    router.replace(getBackPath(profile?.role));
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
      <Stack.Protected guard={isAdmin || isSuperAdmin}>
        <Stack.Screen
          name="users"
          options={{ title: "Users", headerBackTitle: "" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen
          name="secrets"
          options={{ title: "Secrets", headerBackTitle: "" }}
        />
      </Stack.Protected>
    </Stack>
  );
}
