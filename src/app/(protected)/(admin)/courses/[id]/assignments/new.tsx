import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import { useState } from "react";
import { View } from "react-native";

export default function CreateAssignmentScreen() {
  const { profile } = useAuth();
  const [form, setForm] = useState({});

  return (
    <View style={globalStyles.container}>
      <Title>Create Assignments</Title>

      <View></View>
    </View>
  );
}
