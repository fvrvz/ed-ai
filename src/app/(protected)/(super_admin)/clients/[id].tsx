import Title from "@/components/Title";
import { colors, globalStyles } from "@/styles/global";
import { Profile } from "@/types/auth";
import { Client } from "@/types/client";
import { changeUserRole, getClientById, getUsers } from "@/utils/db";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function loadClientData() {
    if (!id) {
      return;
    }

    try {
      const [clientData, userData] = await Promise.all([
        getClientById(id),
        getUsers({ clientId: id }),
      ]);

      setClient(clientData);
      setUsers(userData);
    } catch (error) {
      console.error("Error loading client details", error);
      Alert.alert("Unable to load client", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientData();
  }, [id]);

  async function handleRoleChange(userId: string, targetRole: "admin" | "member") {
    setUpdatingUserId(userId);

    try {
      const user = users.find((item) => item.id === userId);

      if (!user?.email) {
        throw new Error("User email is unavailable.");
      }

      await changeUserRole(user.email, targetRole);
      await loadClientData();
    } catch (error) {
      console.error("Error updating role", error);
      Alert.alert("Unable to update role", "Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading client details...</Text>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={globalStyles.container}>
        <Text>Client not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Title>{client.name}</Title>
      <Text style={styles.subtitle}>{client.code}</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Status</Text>
        <Text style={[styles.statusText, client.is_active ? styles.active : styles.inactive]}>
          {client.is_active ? "Active" : "Inactive"}
        </Text>
        <Text style={styles.summaryLabel}>Users</Text>
        <Text style={styles.summaryValue}>{users.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Manage users</Text>
      <Text style={styles.sectionDescription}>
        Update user roles for this tenant from the list below.
      </Text>

      {users.length === 0 ? (
        <Text style={styles.emptyState}>No users are assigned to this client yet.</Text>
      ) : (
        users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.roleText}>Role: {user.role}</Text>
            </View>

            <View style={styles.actionButtons}>
              <Pressable
                disabled={updatingUserId === user.id || user.role === "admin"}
                onPress={() => handleRoleChange(user.id, "admin")}
                style={[styles.roleButton, user.role === "admin" && styles.roleButtonDisabled]}
              >
                <Text style={styles.roleButtonText}>Make admin</Text>
              </Pressable>
              <Pressable
                disabled={updatingUserId === user.id || user.role === "member"}
                onPress={() => handleRoleChange(user.id, "member")}
                style={[styles.roleButton, user.role === "member" && styles.roleButtonDisabled]}
              >
                <Text style={styles.roleButtonText}>Make member</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
  },
  active: {
    color: colors.success,
  },
  inactive: {
    color: colors.error,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDescription: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emptyState: {
    color: colors.textSecondary,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  userName: {
    fontWeight: "700",
    fontSize: 16,
  },
  userEmail: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  roleText: {
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  roleButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  roleButtonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  roleButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
