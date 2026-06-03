import { Stack } from "expo-router";

export default function CoursesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "All Courses",
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "Create Course",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Course Details",
        }}
      />
      {/* <Stack.Screen
        name="chat"
        options={{
          title: "Chat",
        }}
      /> */}
    </Stack>
  );
}
