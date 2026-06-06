import LabeledRow from "@/components/ui/LabeledRow";
import { useAuth } from "@/hooks/useAuth";
import { Profile } from "@/types/auth";
import { Base } from "@/types/base";
import { Assignment } from "@/types/course";
import { UserGroup } from "@/types/user";
import { getUserGroups, getUsers } from "@/utils/db";
import { getFullName } from "@/utils/profile.helper";
import { Button, FieldGroup, Host, Picker, Row, Spacer, Text } from "@expo/ui";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

type FormData = Omit<Assignment, keyof Base>;

const intialData: FormData = {
  course_id: "",
  user_id: "",
  group_id: "",
  client_id: "",
};

export default function CreateAssignmentScreen() {
  const { profile } = useAuth();
  const [form, setForm] = useState<FormData>(intialData);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadGroups() {
    setLoading(true);

    try {
      const data = await getUserGroups({ client_id: profile?.client_id! });
      setGroups(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    setLoading(true);

    try {
      const data = await getUsers({ clientId: profile?.client_id! });
      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadGroups(), loadUsers()]);
    }, [profile]),
  );

  function validate() {
    if (
      Object.keys(form)
        .filter((key) => key !== "group_id")
        .every((key) => !form[key as keyof FormData])
    ) {
      Alert.alert("Fill the form first");
      return;
    }
  }

  async function handleSubmit() {
    validate();
    setLoading(true);

    try {
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <View>
        <ActivityIndicator />
      </View>
    );

  return (
    <Host style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section title="Form">
          <LabeledRow label="User">
            <Picker
              selectedValue={form.user_id}
              onValueChange={(userId) =>
                setForm((form) => ({ ...form, user_id: userId }))
              }
            >
              <Picker.Item label="Select" value={""} />
              {users.map((user) => (
                <Picker.Item
                  label={getFullName(user)}
                  value={user.id}
                  key={user.id}
                />
              ))}
            </Picker>
          </LabeledRow>
          <FieldGroup.SectionFooter>
            <Text textStyle={{ fontSize: 13, color: "#6c6c70" }}>
              Notification previews can expose sensitive content on the lock
              screen.
            </Text>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>

        <FieldGroup.Section title="Group">
          <LabeledRow label="Group">
            <Picker
              selectedValue={form.group_id}
              onValueChange={(groupId) =>
                setForm((form) => ({ ...form, group_id: groupId }))
              }
              enabled={groups.length > 0}
            >
              <Picker.Item label="Select" value="" />
              {groups.map((group) => (
                <Picker.Item
                  label={group.name}
                  value={group.id}
                  key={group.id}
                />
              ))}
            </Picker>
          </LabeledRow>
        </FieldGroup.Section>

        <FieldGroup.Section>
          <Row alignment="center" style={{ padding: 12 }}>
            <Spacer flexible />
            <Button variant="outlined" onPress={handleSubmit} label="Submit" />
            <Spacer flexible />
          </Row>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
