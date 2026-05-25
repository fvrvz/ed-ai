import KPICard from "@/components/KPICard";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { getAssignmentsByUserId } from "@/utils/db";
import { getFullName } from "@/utils/profile.helper";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function HomeScreen() {
  const { profile } = useAuth();

  const [totalAssignments, setTotalAssignments] = useState(0);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getAssignmentsByUserId(profile?.id || "");
      setTotalAssignments(data?.length || 0);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [profile]);

  return (
    <View style={globalStyles.container}>
      <Title>Welcome, {getFullName(profile) || "User"}!</Title>

      <KPICard title="Total Courses" value={totalAssignments} />
    </View>
  );
}
