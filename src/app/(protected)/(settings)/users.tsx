import UserCard from "@/components/UserCard";
import { globalStyles } from "@/styles/global";
import { Profile } from "@/types/auth";
import { getUsers } from "@/utils/db";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function UsersScreen() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={users}
        refreshing={loading}
        ListEmptyComponent={() => (
          <View style={{ padding: 16 }}>
            <Text>No users found.</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard {...item} style={{ marginBottom: 16 }} />
        )}
      />
    </View>
  );
}
