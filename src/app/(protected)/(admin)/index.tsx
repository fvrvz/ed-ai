import KPICard from "@/components/KPICard";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { getCourses, getDocuments, getUsers } from "@/utils/db";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  const { profile } = useAuth();

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);

  async function fetchKPIs() {
    try {
      const [usersRes, coursesRes, documentsRes] = await Promise.all([
        getUsers({ isActive: true }),
        getCourses({ isActive: true }),
        getDocuments(),
      ]);

      setTotalUsers(usersRes.length);
      setTotalCourses(coursesRes.length);
      setTotalDocuments(documentsRes.length);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    }
  }

  useEffect(() => {
    fetchKPIs();
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <Title>Welcome {profile?.first_name || "User"}</Title>
      <View>
        <KPICard title="Total Active Users" value={totalUsers} />
        <KPICard title="Total Published Courses" value={totalCourses} />
        <KPICard title="Total Documents" value={totalDocuments} />
      </View>
    </ScrollView>
  );
}
