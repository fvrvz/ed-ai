import { useAuth } from "@/contexts/AuthContext";
import { globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { ScrollView, Text } from "react-native";

export default function AnalyticsScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={globalStyles.container}>
      <Text>Analytics Screen</Text>
      <Link href="/(protected)/(settings)">Go to Settings</Link>
      {profile && <Text>{JSON.stringify(profile)}</Text>}
    </ScrollView>
  );
}
