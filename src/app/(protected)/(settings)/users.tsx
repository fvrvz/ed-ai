import { getFullName } from "@/utils/profile.helper";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{getFullName(item)}</Text>
          <Text>{item.email}</Text>
        </View>
      )}
    />
  );
}
