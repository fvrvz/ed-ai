import { useAuth } from "@/contexts/AuthContext";
import { Button, Text, View } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <View>
      <Text>Settings</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
