import Badge from "@/components/Badge";
import Title from "@/components/Title";
import { globalStyles } from "@/styles/global";
import { Course } from "@/types/course";
import { getCourses } from "@/utils/db";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function CoursesScreen() {
  const router = useRouter();

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

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, []),
  );

  function navigateToCourse(courseId: string) {
    router.push(`/(protected)/(admin)/courses/${courseId}`);
  }

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
          <Pressable onPress={() => navigateToCourse(item.id)}>
            <View
              style={{
                padding: 16,
                backgroundColor: "#fff",
                borderRadius: 8,
                flexDirection: "column",
                gap: 5,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.title}
              </Text>
              <Text>{item.description}</Text>
              <Badge color={item.is_published ? "green" : "red"}>
                {item.is_published ? "Published" : "Not Published"}
              </Badge>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
