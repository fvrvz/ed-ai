import Badge from "@/components/Badge";
import Title from "@/components/Title";
import { globalStyles } from "@/styles/global";
import { Course } from "@/types/course";
import { Document } from "@/types/document";
import { getCourseById, getDocumentsByCourseId } from "@/utils/db";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);

  async function loadCourseData() {
    if (!id) {
      return;
    }

    try {
      const data = await getCourseById(id);
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourseData();
  }, [id]);

  async function loadDocumentData() {
    if (!id) return;
    setDocsLoading(true);
    try {
      const data = await getDocumentsByCourseId(id);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setDocsLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading course details...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Title>Course Detail Screen</Title>
      {course && (
        <View
          style={{
            marginTop: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {course.title}
          </Text>
          <Text>
            Created at: {new Date(course.created_at).toLocaleDateString()}
          </Text>
          <Text>
            Last updated: {new Date(course.updated_at).toLocaleDateString()}
          </Text>
          <Badge
            text={course.is_published ? "Published" : "Draft"}
            color={course.is_published ? "green" : "gray"}
          />
        </View>
      )}

      <View style={{ marginTop: 32 }}>
        <Title>Course Content</Title>
        <Text style={{ fontStyle: "italic", color: "#666" }}>
          Description: {course?.description}
        </Text>
      </View>

      <View style={{ marginTop: 32 }}>
        <View>
          <Title>Knowledge Base</Title>
          <Text style={{ fontStyle: "italic", color: "#666" }}>
            (This section can list documents related to the course)
          </Text>
        </View>

        <FlatList
          data={documents}
          ListEmptyComponent={() => <Text>No document found.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => {}}>
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
                  {item.name}
                </Text>
                <Text>{item.updated_at}</Text>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}
