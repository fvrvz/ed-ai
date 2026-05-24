import { useAuth } from "@/contexts/AuthContext";
import { colors, globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { Button, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <View>
        <Text>Home</Text>
      </View>
      <Link href="/(protected)/(settings)/profile" style={globalStyles.link}>
        Profile
      </Link>
      <View style={{ alignSelf: "flex-start" }}>
        <Button title="Sign out" onPress={signOut} color={colors.error} />
      </View>
    </ScrollView>
  );
}
