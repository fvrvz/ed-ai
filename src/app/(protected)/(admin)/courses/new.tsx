import InputControl from "@/components/InputControl";
import { useAuth } from "@/hooks/useAuth";
import { createCourse } from "@/utils/db";
import { useState } from "react";
import { Alert, Button, KeyboardAvoidingView, Text, View } from "react-native";

export default function NewCourseScreen() {
  const { profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validateForm() {
    return title.trim() !== "" && description.trim() !== "";
  }

  function clearForm() {
    setTitle("");
    setDescription("");
  }

  async function handlePublish() {
    if (!validateForm()) {
      console.error("Please fill in all fields.");
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const newCourse = {
        client_id: profile?.client_id || "",
        title,
        description,
        is_published: true,
      };

      await createCourse(newCourse);
      Alert.alert("Success", "Course published successfully.");
      console.log("Course published:", newCourse);
      clearForm();
    } catch (error) {
      Alert.alert("Error", "Failed to publish course.");
      console.error("Error publishing course:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const newCourse = {
        client_id: profile?.client_id || "",
        title,
        description,
        is_published: false,
      };

      await createCourse(newCourse);
      Alert.alert("Success", "Course saved as draft.");
      console.log("Course saved as draft:", newCourse);
      clearForm();
    } catch (error) {
      Alert.alert("Error", "Failed to save course as draft.");
      console.error("Error saving course as draft:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Create New Course
      </Text>
      <InputControl
        label="Title"
        value={title}
        onChange={setTitle}
        placeholder="Enter course title"
      />
      <InputControl
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Enter course description"
      />
      <View>
        <Button
          title="Publish Course"
          onPress={handlePublish}
          disabled={submitting}
        />
        <Button
          title="Save as Draft"
          onPress={handleSaveDraft}
          disabled={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
