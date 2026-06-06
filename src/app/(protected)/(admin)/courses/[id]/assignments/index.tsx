import Title from "@/components/Title";
import { colors, globalStyles } from "@/styles/global";
import { Assignment } from "@/types/course";
import { getAssignments } from "@/utils/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function AssignmentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const data = await getAssignments({ courseId: id });
      setAssignments(data);
    } catch (error) {
      console.log("Error fetching course assignments");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id]),
  );

  return (
    <View style={globalStyles.container}>
      <Title>Assignments</Title>

      <TouchableOpacity
        onPress={() => router.push(`/courses/${id}/assignments/new`)}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 12,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Create assignment
        </Text>
      </TouchableOpacity>

      <View>
        <FlatList
          data={assignments}
          renderItem={({ item }) => (
            <View>
              <Text>{item.group_id}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View>
              <Text>No assigments</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
