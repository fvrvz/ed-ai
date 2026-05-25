import KPICard from "@/components/KPICard";
import Title from "@/components/Title";
import { colors, globalStyles } from "@/styles/global";
import { Client } from "@/types/client";
import { getClients, getUsers } from "@/utils/db";
import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SuperAdminHomeScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [clientData, usersData] = await Promise.all([
          getClients({ sortBy: "created_at", sortOrder: "desc" }),
          getUsers(),
        ]);

        setClients(clientData);
        setUsersCount(usersData.length);
      } catch (error) {
        console.error("Error loading dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeClients = clients.filter((client) => client.is_active).length;
    const inactiveClients = clients.length - activeClients;

    return {
      totalClients: clients.length,
      activeClients,
      inactiveClients,
      usersCount,
    };
  }, [clients, usersCount]);

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Title>Super Admin Dashboard</Title>
      <Text style={styles.subtitle}>
        Monitor your tenants, usage, and client health from one place.
      </Text>

      <View style={styles.kpiGrid}>
        <KPICard title="Clients" value={stats.totalClients} />
        <KPICard title="Active" value={stats.activeClients} />
        <KPICard title="Inactive" value={stats.inactiveClients} />
        <KPICard title="Users" value={stats.usersCount} />
      </View>

      <View style={styles.actionsRow}>
        <Link
          href="/(protected)/(super-admin)/clients"
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>View all clients</Text>
        </Link>
        <Link
          href="/(protected)/(super-admin)/clients/new"
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>Create client</Text>
        </Link>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent clients</Text>
        <Text style={styles.sectionDescription}>
          Tap a client to manage users and tenant settings.
        </Text>
      </View>

      {loading ? (
        <Text style={styles.emptyState}>Loading clients...</Text>
      ) : clients.length === 0 ? (
        <Text style={styles.emptyState}>No clients found yet.</Text>
      ) : (
        <FlatList
          data={clients.slice(0, 5)}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(super-admin)/clients/[id]",
                  params: { id: item.id },
                })
              }
              style={styles.clientCard}
            >
              <View>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientCode}>{item.code}</Text>
              </View>
              <Text
                style={[
                  styles.statusTag,
                  item.is_active ? styles.statusActive : styles.statusInactive,
                ]}
              >
                {item.is_active ? "Active" : "Inactive"}
              </Text>
            </Pressable>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  linkButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionDescription: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  clientCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientName: {
    fontWeight: "700",
    fontSize: 16,
  },
  clientCode: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "700",
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  statusInactive: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
});
