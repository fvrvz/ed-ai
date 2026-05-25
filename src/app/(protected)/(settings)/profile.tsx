import { useAuth } from "@/hooks/useAuth";
import { getFullName } from "@/utils/profile.helper";
import { ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const { profile } = useAuth();
  return (
    <ScrollView>
      <Text>Profile</Text>

      <View>
        <Text>Name: {getFullName(profile)}</Text>
        <Text>Email: {profile?.email}</Text>
      </View>
    </ScrollView>
  );
}
