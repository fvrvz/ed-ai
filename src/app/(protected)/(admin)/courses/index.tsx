import Title from "@/components/Title";
import { globalStyles } from "@/styles/global";
import { Course } from "@/types/course";
import { getCourses } from "@/utils/db";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);

  async function fetchCourses() {
    try {
      const data = await getCourses({
        sortBy: "is_published",
        sortOrder: "asc",
      });
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <View style={globalStyles.container}>
      <View style={{ marginBottom: 16 }}>
        <Title style={{ marginBottom: 5 }}>Courses Management</Title>
        <Text>This is where you can manage courses.</Text>
      </View>

      <Link
        href="/(protected)/(admin)/courses/new"
        style={{ marginBottom: 16 }}
      >
        <Text style={{ color: "blue" }}>+ Create New Course</Text>
      </Link>

      <FlatList
        data={courses}
        ListEmptyComponent={() => <Text>No courses found.</Text>}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
            }}
          >
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.is_published ? "Published" : "Not Published"}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
