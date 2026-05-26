import KPICard from "@/components/KPICard";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { Profile } from "@/types/auth";
import { Course } from "@/types/course";
import { Document } from "@/types/document";
import { getCourses, getDocuments, getUsers } from "@/utils/db";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const { profile } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchKPIs() {
    try {
      const [usersRes, coursesRes, documentsRes] = await Promise.all([
        getUsers(),
        getCourses(),
        getDocuments(),
      ]);

      setUsers(usersRes);
      setCourses(coursesRes);
      setDocuments(documentsRes);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchKPIs();
    }, []),
  );

  const stats = useMemo(() => {
    return {
      totalActiveUsers: users.filter((u) => u.is_active).length,
      totalInactiveUsers: users.filter((u) => !u.is_active).length,
      totalPublishedCourses: courses.filter((c) => c.is_published).length,
      totalDraftCourses: courses.filter((c) => !c.is_published).length,
      totalDocuments: documents.length,
    };
  }, [users, courses, documents]);

  return (
    <ScrollView style={globalStyles.container}>
      <Title>Welcome {profile?.first_name || "User"}</Title>
      <View>
        {loading ? (
          <Text>Loading KPIs...</Text>
        ) : (
          <>
            <KPICard
              title="Total Active Users"
              value={stats.totalActiveUsers}
            />
            <KPICard
              title="Total Inactive Users"
              value={stats.totalInactiveUsers}
            />
            <KPICard
              title="Total Published Courses"
              value={stats.totalPublishedCourses}
            />
            <KPICard
              title="Total Draft Courses"
              value={stats.totalDraftCourses}
            />
            <KPICard title="Total Documents" value={stats.totalDocuments} />
          </>
        )}
      </View>
    </ScrollView>
  );
}
