import InputControl from "@/components/InputControl";
import Title from "@/components/Title";
import { useAuth } from "@/hooks/useAuth";
import { globalStyles } from "@/styles/global";
import {
  getSystemSettingsForClient,
  updateSystemSettingsForClient,
} from "@/utils/db";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Text,
  View,
} from "react-native";

export default function SecretsScreen() {
  const { profile } = useAuth();

  const [groqApiKey, setGroqApiKey] = useState("");
  const [groqModelName, setGroqModelName] = useState("");
  const [huggingFaceApiKey, setHuggingFaceApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!profile?.client_id) return;

    setLoading(true);
    try {
      const data = await getSystemSettingsForClient(profile.client_id);
      setGroqApiKey(data?.groq_api_key || "");
      setGroqModelName(data?.groq_model_name || "");
      setHuggingFaceApiKey(data?.huggingface_api_key || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  async function handleUpdate() {
    if (!profile?.client_id) return;

    setLoading(true);

    try {
      const data = await updateSystemSettingsForClient(profile.client_id, {
        groq_api_key: groqApiKey,
        groq_model_name: groqModelName,
        huggingface_api_key: huggingFaceApiKey,
      });

      const { groq_api_key, groq_model_name, huggingface_api_key } = data;
      setGroqApiKey(groq_api_key);
      setGroqModelName(groq_model_name);
      setHuggingFaceApiKey(huggingface_api_key);

      console.log("Updated successfully");
      Alert.alert("Updated successfully");
    } catch (error) {
      console.error("Unable to update system settings", error);
      Alert.alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={globalStyles.container}>
      <Title style={{ marginBottom: 12 }}>Secrets</Title>
      <Text>Groq Secrets</Text>
      <Text>Hugging Face Secrets</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View>
            <InputControl
              label="Groq API Key"
              value={groqApiKey}
              onChange={setGroqApiKey}
              placeholder="gsk_..."
            />
            <InputControl
              label="Groq Model"
              value={groqModelName}
              onChange={setGroqModelName}
              placeholder="llama-3.3-70b-versatile"
            />
            <InputControl
              label="Hugging Face API Key"
              value={huggingFaceApiKey}
              onChange={setHuggingFaceApiKey}
              placeholder="hf_..."
            />
          </View>

          <Button title="Update Secrets" onPress={handleUpdate} />
        </>
      )}
    </KeyboardAvoidingView>
  );
}
