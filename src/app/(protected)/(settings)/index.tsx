import { useAuth } from "@/contexts/AuthContext";
import { colors, globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { Button, ScrollView, View } from "react-native";

export default function SettingsScreen() {
  const { signOut, isAdmin } = useAuth();
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Link href="/(protected)/(settings)/profile" style={globalStyles.link}>
        Profile
      </Link>
      {isAdmin && (
        <>
          <Link href="/(protected)/(settings)/users" style={globalStyles.link}>
            Users
          </Link>
          <Link
            href="/(protected)/(settings)/api-keys"
            style={globalStyles.link}
          >
            API Keys
          </Link>
        </>
      )}
      <View style={{ alignSelf: "flex-start", marginVertical: 8 }}>
        <Button title="Sign out" onPress={signOut} color={colors.error} />
      </View>
    </ScrollView>
  );
}
