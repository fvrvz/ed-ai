import { useAuth } from "@/hooks/useAuth";
import { colors, globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { Button, ScrollView, View } from "react-native";

export default function SettingsScreen() {
  const { signOut, isAdmin, isSuperAdmin } = useAuth();
  const canManageSettings = isAdmin || isSuperAdmin;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Link href="/(protected)/(settings)/profile" style={globalStyles.link}>
        Profile
      </Link>
      {canManageSettings && (
        <>
          <Link href="/(protected)/(settings)/users" style={globalStyles.link}>
            Users
          </Link>
          <Link
            href="/(protected)/(settings)/secrets"
            style={globalStyles.link}
          >
            Secrets
          </Link>
        </>
      )}
      <View style={{ alignSelf: "flex-start", marginVertical: 8 }}>
        <Button title="Sign out" onPress={signOut} color={colors.error} />
      </View>
    </ScrollView>
  );
}
