import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { ScrollView, Text } from "react-native";

export default function AnalyticsScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={globalStyles.container}>
      <Text>Analytics Screen</Text>
      {profile && <Text>{JSON.stringify(profile)}</Text>}
    </ScrollView>
  );
}
