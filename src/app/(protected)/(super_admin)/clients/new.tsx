import InputControl from "@/components/InputControl";
import Title from "@/components/Title";
import { globalStyles } from "@/styles/global";
import { createClient } from "@/utils/db";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, KeyboardAvoidingView, View } from "react-native";

export default function NewClientScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !code.trim()) {
      Alert.alert("Missing details", "Please enter both a client name and code.");
      return;
    }

    setSubmitting(true);

    try {
      await createClient({
        name: name.trim(),
        code: code.trim(),
        is_active: true,
      });

      Alert.alert("Client created", `${name.trim()} has been created.`);
      router.back();
    } catch (error) {
      console.error("Error creating client", error);
      Alert.alert("Could not create client", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior="padding">
      <Title>Create client</Title>

      <InputControl
        label="Client name"
        value={name}
        onChange={setName}
        placeholder="Acme Corp"
      />
      <InputControl
        label="Client code"
        value={code}
        onChange={setCode}
        placeholder="acme-corp"
      />

      <View style={{ marginTop: 8 }}>
        <Button title={submitting ? "Creating..." : "Create client"} onPress={handleCreate} disabled={submitting} />
      </View>
    </KeyboardAvoidingView>
  );
}
