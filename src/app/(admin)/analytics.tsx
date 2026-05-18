import { useAuth } from "@/contexts/AuthContext";
import { globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { Button, ScrollView, Text } from "react-native";

export default function AnalyticsScreen() {
  const { profile, signOut } = useAuth();

  return (
    <ScrollView style={globalStyles.container}>
      <Text>Analytics Screen</Text>
      <Link href="/(settings)">Go to Settings</Link>
      {profile && <Text>{JSON.stringify(profile)}</Text>}
      <Button title="Sign out" onPress={signOut} />
    </ScrollView>
  );
}
