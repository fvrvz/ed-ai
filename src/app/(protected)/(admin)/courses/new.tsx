import { Text, View } from "react-native";

export default function NewCourseScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Create New Course
      </Text>
      <Text>This is where you can create a new course.</Text>
    </View>
  );
}
