import CourseCard from "@/components/CourseCard";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { AssignmentWithCourse } from "@/types/course";
import { getAssignmentsByUserIdWithCourse } from "@/utils/db";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function CoursesScreen() {
  const { profile } = useAuth();

  const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getAssignmentsByUserIdWithCourse(profile?.id || "");
      setAssignments(data);
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
      <Title>Courses</Title>

      <FlatList
        data={assignments}
        refreshing={loading}
        ListEmptyComponent={<Text>No assignments found.</Text>}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            style={{ marginBottom: 10 }}
            title={item.course?.title ?? item.course_id}
            description={item.course?.description ?? "No course description"}
          />
        )}
      />
    </View>
  );
}
