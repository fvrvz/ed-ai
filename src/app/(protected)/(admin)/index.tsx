import KPICard from "@/components/KPICard";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={globalStyles.container}>
      <Title>Welcome {profile?.first_name || "User"}</Title>
      <View>
        <KPICard title="Total Users" value={1234} />
        <KPICard title="Active Sessions" value={567} />
        <KPICard title="Revenue" value="$12,345" />
      </View>
    </ScrollView>
  );
}
