import { globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { ScrollView, Text } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text>Admin Home Screen</Text>
      <Link href="/(protected)/(settings)">Go to Settings</Link>
    </ScrollView>
  );
}
