import LabeledRow from "@/components/ui/LabeledRow";
import { useAuth } from "@/hooks/useAuth";
import { AssigmentSchema, assignmentSchema } from "@/schema/assigments.schema";
import { colors } from "@/styles/global";
import { Profile } from "@/types/auth";
import { UserGroup } from "@/types/user";
import { getUserGroups, getUsers } from "@/utils/db";
import { getFullName } from "@/utils/profile.helper";
import { Button, FieldGroup, Host, Picker, Row, Spacer, Text } from "@expo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";

const intialData: AssigmentSchema = {
  course_id: "",
  user_id: "",
  group_id: "",
  client_id: "",
};

export default function CreateAssignmentScreen() {
  const { profile } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: intialData,
  });

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

  async function onSubmit(data: AssigmentSchema) {
    setLoading(true);

    try {
      console.log(data);
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
            <Controller
              control={control}
              name="user_id"
              render={({ field: { onChange, value } }) => (
                <Picker selectedValue={value} onValueChange={onChange}>
                  <Picker.Item label="Select" value={""} />
                  {users.map((user) => (
                    <Picker.Item
                      label={getFullName(user)}
                      value={user.id}
                      key={user.id}
                    />
                  ))}
                </Picker>
              )}
            />
          </LabeledRow>
          {errors.user_id && (
            <FieldGroup.SectionFooter>
              <Text textStyle={{ fontSize: 13, color: colors.error }}>
                {errors.user_id.message}
              </Text>
            </FieldGroup.SectionFooter>
          )}
        </FieldGroup.Section>

        <FieldGroup.Section title="Group">
          <LabeledRow label="Group">
            <Controller
              control={control}
              name="group_id"
              render={({ field: { value, onChange } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
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
              )}
            />
          </LabeledRow>
          {errors.group_id && (
            <FieldGroup.SectionFooter>
              <Text textStyle={{ fontSize: 13, color: colors.error }}>
                {errors.group_id.message}
              </Text>
            </FieldGroup.SectionFooter>
          )}
        </FieldGroup.Section>

        <FieldGroup.Section>
          <Row alignment="center" style={{ padding: 12 }}>
            <Spacer flexible />
            <Button
              variant="outlined"
              onPress={handleSubmit(onSubmit)}
              label="Submit"
            />
            <Spacer flexible />
          </Row>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
