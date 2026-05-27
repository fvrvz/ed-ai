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

  const [grokApiKey, setGrokApiKey] = useState("");
  const [grokModelName, setGrokModelName] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!profile?.client_id) return;

    setLoading(true);
    try {
      const data = await getSystemSettingsForClient(profile.client_id);
      setGrokApiKey(data?.grok_api_key || "");
      setGrokModelName(data?.grok_model_name || "");
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
        grok_api_key: grokApiKey,
        grok_model_name: grokModelName,
      });

      if (!data) throw new Error("Data not available");

      const { grok_api_key, grok_model_name } = data;
      setGrokApiKey(grok_api_key);
      setGrokModelName(grok_model_name);

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
      <Text>Grok Secrets</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View>
            <InputControl
              label="Grok API Key"
              value={grokApiKey}
              onChange={setGrokApiKey}
              placeholder="gsk_..."
            />
            <InputControl
              label="Grok Model"
              value={grokModelName}
              onChange={setGrokModelName}
              placeholder="llama-3.3-70b-versatile"
            />
          </View>

          <Button title="Update Secrets" onPress={handleUpdate} />
        </>
      )}
    </KeyboardAvoidingView>
  );
}
