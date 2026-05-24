import { useAuth } from "@/contexts/AuthContext";
import { globalStyles } from "@/styles/global";
import { ScrollView, Text } from "react-native";

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={globalStyles.container}>
      <Text>Home Screen</Text>
      {profile && <Text>{JSON.stringify(profile)}</Text>}
    </ScrollView>
  );
}
