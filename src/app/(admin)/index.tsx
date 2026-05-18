import { useAuth } from "@/contexts/AuthContext";
import { globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { Button, ScrollView, Text } from "react-native";

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <ScrollView style={globalStyles.container}>
      <Text>Admin Home Screen</Text>
      <Link href="/(settings)">Go to Settings</Link>
      <Button title="Sign out" onPress={signOut} />
    </ScrollView>
  );
}
