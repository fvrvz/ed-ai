import InputControl from "@/components/InputControl";
import Title from "@/components/Title";
import { globalStyles } from "@/styles/global";
import { SystemSettings } from "@/types/system-settings";
import {
  createSystemSettingsForClient,
  getSystemSettingsForClient,
  updateSystemSettingsForClient,
} from "@/utils/db";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ClientSecrets() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  const [grokApiKey, setGrokApiKey] = useState("");
  const [grokModelName, setGrokModelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingExists, setSettingExists] = useState(false);

  async function loadData() {
    if (!clientId) return;

    setLoading(true);
    try {
      const data = await getSystemSettingsForClient(clientId);

      if (!data) setSettingExists(false);
      else setSettingExists(true);

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
    if (!clientId) return;

    setLoading(true);

    try {
      let data: SystemSettings;

      if (settingExists) {
        data = await updateSystemSettingsForClient(clientId, {
          grok_api_key: grokApiKey,
          grok_model_name: grokModelName,
        });
      } else {
        data = await createSystemSettingsForClient({
          client_id: clientId,
          grok_api_key: grokApiKey,
          grok_model_name: grokModelName,
        });
      }

      const { grok_api_key = "", grok_model_name = "" } = data;
      setGrokApiKey(grok_api_key);
      setGrokModelName(grok_model_name);
      setSettingExists(true);
      console.log("Operation successful");
      Alert.alert("Operation successful");
    } catch (error) {
      console.error("Unable to update system settings", error);
      Alert.alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={globalStyles.container}>
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

          <Button
            title={settingExists ? "Update Secrets" : "Create Secrets"}
            onPress={handleUpdate}
          />
        </>
      )}
    </ScrollView>
  );
}
