import { globalStyles } from "@/styles/global";
import { ScrollView, Text } from "react-native";

export default function CoursesScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text>Courses</Text>
    </ScrollView>
  );
}
