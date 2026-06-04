import Badge from "@/components/Badge";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { colors, globalStyles } from "@/styles/global";
import { Course } from "@/types/course";
import { Document } from "@/types/document";
import {
  addDocument,
  deleteDocument,
  deleteEmbeddingByDocumentId,
  getCourseById,
  getDocumentsByCourseId,
} from "@/utils/db";
import { triggerVectorProcessing } from "@/utils/rag-service";
import {
  deleteDocumentFromStorage,
  uploadDocumentToStorage,
} from "@/utils/storage-service";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ComponentProps, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function getEmbeddingVariant(
  status: Document["embedding_status"],
): ComponentProps<typeof Badge>["variant"] {
  switch (status) {
    case "completed":
      return "success";
    case "processing":
      return "warning";
    default:
      return "error";
  }
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPicker.DocumentPickerAsset>();
  const [uploading, setUploading] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadCourseData(), loadDocumentData()]);
    }, [id]),
  );

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

  async function handleDocumentSelection() {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      if (!result.canceled) {
        const successResult = result;
        setSelectedDocument(successResult.assets[0]);
      } else {
        console.log("document selection cancelled");
      }
    } catch (error) {
      console.error("Error picking documents", error);
    }
  }

  async function handleUploadDocuments() {
    if (!profile?.client_id) return;

    setUploading(true);
    try {
      const storageUrl = await uploadDocumentToStorage({
        clientId: profile?.client_id,
        fileName: selectedDocument?.name!,
        fileType: selectedDocument?.mimeType!,
        fileUri: selectedDocument?.uri!,
      });

      if (!storageUrl) throw new Error("Document upload failed");

      const newEntry = await addDocument({
        client_id: profile.client_id,
        course_id: id,
        name: selectedDocument?.name!,
        storage_url: storageUrl,
      });

      if (!newEntry) throw new Error("Document entry insert operation failed");

      setDocuments((prev) => [...prev, newEntry]);

      triggerVectorProcessing({
        clientId: profile.client_id,
        documentId: newEntry.id,
        fileType: selectedDocument?.mimeType!,
        storagePath: storageUrl,
      }).finally(() => loadDocumentData());

      console.log(`Document uploaded successfully ${newEntry.name}`);
    } catch (error) {
      console.error("Something went wrong on file upload", error);
    } finally {
      setUploading(false);
      setSelectedDocument(undefined);
    }
  }

  function handleDocumentDelete(id: string, storageUri: string) {
    Alert.alert("Delete", "Are you sure to delete this document?", [
      { text: "Yes", onPress: () => documentDelete(id, storageUri) },
      { text: "No", onPress: () => {} },
    ]);
  }

  async function documentDelete(id: string, storageUri: string) {
    try {
      await Promise.all([
        deleteDocument(id),
        deleteDocumentFromStorage(storageUri),
        deleteEmbeddingByDocumentId(id),
      ]);
      console.log("Document deleted successfully");
      Alert.alert("Deleted successfully");

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Something went wrong while delete the document", error);
      Alert.alert("Something went wrong");
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

      <View
        style={{
          marginTop: 32,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-end",
        }}
      >
        <TouchableOpacity
          style={{
            padding: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
            width: "auto",
            alignSelf: "flex-end",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
          onPress={() => router.push(`/courses/${id}/discussion`)}
        >
          <Ionicons name="mail-outline" size={20} />
          <Text>Discussions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
            width: "auto",
            alignSelf: "flex-end",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
          onPress={() => router.push(`/courses/${id}/chat`)}
        >
          <Ionicons name="chatbubble-outline" size={20} />
          <Text>Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 32 }}>
        <Title style={{ marginBottom: 5 }}>Course Content</Title>
        <Text style={{ fontStyle: "italic", color: "#666" }}>
          Description: {course?.description}
        </Text>
      </View>

      <View style={{ marginTop: 32 }}>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <Title>Knowledge Base</Title>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: 3,
                borderRadius: 50,
              }}
              onPress={handleDocumentSelection}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontStyle: "italic", color: "#666" }}>
            (This section can list documents related to the course)
          </Text>
        </View>

        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            minHeight: 80,
          }}
        >
          <FlatList
            data={documents}
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#1e1e1e" }}>No document found.</Text>
              </View>
            )}
            refreshing={docsLoading}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 16,
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {item.name}
                  </Text>
                  <Text>{new Date(item.updated_at).toLocaleDateString()}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    <Text>Embedding:</Text>
                    <Badge
                      text={item.embedding_status.toUpperCase()}
                      variant={getEmbeddingVariant(item.embedding_status)}
                    />
                  </View>
                </View>
                <View
                  style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
                >
                  {/* <ActivityIndicator size="small" /> */}
                  <Pressable
                    onPress={() =>
                      handleDocumentDelete(item.id, item.storage_url)
                    }
                  >
                    <Ionicons name="trash" color={colors.error} size={25} />
                  </Pressable>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            opacity: selectedDocument ? 1 : 0.5,
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 10,
            borderRadius: 12,
            marginTop: 10,
          }}
          disabled={!selectedDocument}
          onPress={handleUploadDocuments}
        >
          {uploading ? (
            <>
              <ActivityIndicator />
              <Text style={{ fontWeight: "bold", color: "#fff" }}>
                Uploading
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={{ fontWeight: "bold", color: "#fff" }}>
                Upload selected
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
