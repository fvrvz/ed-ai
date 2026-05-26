import Title from "@/components/Title";
import { colors, globalStyles } from "@/styles/global";
import { Profile, UserRole } from "@/types/auth";
import { Client } from "@/types/client";
import {
  changeUserRole,
  getClientById,
  getUsers,
  updateClient,
  updateUserClient,
} from "@/utils/db";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [isClientActive, setIsClientActive] = useState<boolean>(false);

  async function loadClientData() {
    if (!id) {
      return;
    }

    try {
      const [clientData, userData] = await Promise.all([
        getClientById(id),
        getUsers(),
      ]);

      setClient(clientData);
      setUsers(userData);
      setIsClientActive(clientData?.is_active || false);
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

  const currentUsers = useMemo(
    () => users.filter((user) => user.client_id === id),
    [users, id],
  );

  const otherUsers = useMemo(
    () => users.filter((user) => user.client_id !== id),
    [users, id],
  );

  async function handleRoleChange(
    userId: string,
    targetRole: Omit<UserRole, "super_admin">,
  ) {
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

  async function handleAssignUser(userId: string) {
    if (!id) {
      return;
    }

    setAssigningUserId(userId);

    try {
      await updateUserClient(userId, id);
      await loadClientData();
    } catch (error) {
      console.error("Error assigning user to client", error);
      Alert.alert("Unable to assign user", "Please try again.");
    } finally {
      setAssigningUserId(null);
    }
  }

  async function toggleClientStatus(value: boolean) {
    Alert.alert(
      value ? "Activate client" : "Deactivate client",
      `Are you sure you want to ${value ? "activate" : "deactivate"} this client?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsClientActive(!value), // Revert toggle
        },
        {
          text: "Yes",
          onPress: () => updateClientStatus(value),
        },
      ],
    );
  }

  async function updateClientStatus(value: boolean) {
    setIsClientActive(value);

    try {
      const data = await updateClient(id!, { is_active: value });
      setClient(data);

      Alert.alert(
        "Status updated",
        `Client has been ${value ? "activated" : "deactivated"}.`,
      );
    } catch (error) {
      console.error("Error updating client status", error);
      Alert.alert("Unable to update status", "Please try again.");
      setIsClientActive(!value); // Revert toggle on error
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
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Title>{client.name}</Title>
      <Text style={styles.subtitle}>{client.code}</Text>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Status</Text>
          <Text
            style={[
              styles.statusText,
              client.is_active ? styles.active : styles.inactive,
            ]}
          >
            {client.is_active ? "Active" : "Inactive"}
          </Text>
          <Text style={styles.summaryLabel}>Users</Text>
          <Text style={styles.summaryValue}>{currentUsers.length}</Text>
        </View>
        <View>
          <Switch value={isClientActive} onValueChange={toggleClientStatus} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Current users</Text>
      <Text style={styles.sectionDescription}>
        Update roles for users already assigned to this client.
      </Text>

      {currentUsers.length === 0 ? (
        <Text style={styles.emptyState}>
          No users are assigned to this client yet.
        </Text>
      ) : (
        currentUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.roleText}>Role: {user.role}</Text>
            </View>

            <View style={styles.actionButtons}>
              <Pressable
                disabled={updatingUserId === user.id || user.role === "admin"}
                onPress={() => handleRoleChange(user.id, "admin")}
                style={[
                  styles.roleButton,
                  user.role === "admin" && styles.roleButtonDisabled,
                ]}
              >
                <Text style={styles.roleButtonText}>Make admin</Text>
              </Pressable>
              <Pressable
                disabled={updatingUserId === user.id || user.role === "member"}
                onPress={() => handleRoleChange(user.id, "member")}
                style={[
                  styles.roleButton,
                  user.role === "member" && styles.roleButtonDisabled,
                ]}
              >
                <Text style={styles.roleButtonText}>Make member</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
        Assign users
      </Text>
      <Text style={styles.sectionDescription}>
        Add existing users to this client so they appear in the current users
        list.
      </Text>

      {otherUsers.length === 0 ? (
        <Text style={styles.emptyState}>
          All users are already assigned to a client.
        </Text>
      ) : (
        otherUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.roleText}>Role: {user.role}</Text>
            </View>

            <Pressable
              disabled={assigningUserId === user.id}
              onPress={() => handleAssignUser(user.id)}
              style={styles.assignButton}
            >
              <Text style={styles.assignButtonText}>
                {assigningUserId === user.id
                  ? "Assigning..."
                  : "Assign to client"}
              </Text>
            </Pressable>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  sectionSpacing: {
    marginTop: 16,
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
  assignButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  assignButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
