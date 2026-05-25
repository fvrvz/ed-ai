import KPICard from "@/components/KPICard";
import Title from "@/components/Title";
import { colors, globalStyles } from "@/styles/global";
import { Client } from "@/types/client";
import { getClients, getUsers } from "@/utils/db";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SuperAdminAnalyticsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<{ role: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [clientData, usersData] = await Promise.all([
          getClients(),
          getUsers(),
        ]);

        setClients(clientData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading analytics", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const activeClients = clients.filter((item) => item.is_active).length;
    const inactiveClients = clients.length - activeClients;
    const admins = users.filter(
      (user) => user.role === "admin" || user.role === "super_admin",
    ).length;

    return {
      activeClients,
      inactiveClients,
      admins,
      members: users.length - admins,
      usersCount: users.length,
    };
  }, [clients, users]);

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Title>Analytics</Title>
      <Text style={styles.subtitle}>
        High-level visibility for tenant and user distribution.
      </Text>

      {loading ? (
        <Text>Loading analytics...</Text>
      ) : (
        <View style={styles.kpiGrid}>
          <KPICard title="Clients" value={clients.length} />
          <KPICard title="Active clients" value={stats.activeClients} />
          <KPICard title="Inactive clients" value={stats.inactiveClients} />
          <KPICard title="Users" value={stats.usersCount} />
          <KPICard title="Admins" value={stats.admins} />
          <KPICard title="Members" value={stats.members} />
        </View>
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
  },
});
