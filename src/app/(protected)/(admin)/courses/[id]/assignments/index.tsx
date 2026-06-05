import Title from "@/components/Title";
import { globalStyles } from "@/styles/global";
import { Assignment } from "@/types/course";
import { getAssignments } from "@/utils/db";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function AssignmentsScreen() {
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

      <Text>Create assignment</Text>

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
