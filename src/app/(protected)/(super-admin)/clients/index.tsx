import Title from "@/components/Title";
import { colors, globalStyles } from "@/styles/global";
import { Client } from "@/types/client";
import { getClients } from "@/utils/db";
import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type FilterKey = "all" | "active" | "inactive";

export default function SuperAdminClientsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClients({
          sortBy: "created_at",
          sortOrder: "desc",
        });
        setClients(data);
      } catch (error) {
        console.error("Error loading clients", error);
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (filter === "active") {
      return clients.filter((client) => client.is_active);
    }

    if (filter === "inactive") {
      return clients.filter((client) => !client.is_active);
    }

    return clients;
  }, [clients, filter]);

  return (
    <View style={globalStyles.container}>
      <Title>Clients</Title>
      <Text style={styles.description}>
        View all tenants, segment by status, and open any client to manage its
        users.
      </Text>

      <Link
        href="/(protected)/(super-admin)/clients/new"
        style={styles.createLink}
      >
        <Text style={styles.createLinkText}>+ Create new client</Text>
      </Link>

      <View style={styles.filterRow}>
        {(["all", "active", "inactive"] as FilterKey[]).map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterChip,
              filter === item && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === item && styles.filterChipTextActive,
              ]}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <Text style={styles.emptyState}>Loading clients...</Text>
      ) : filteredClients.length === 0 ? (
        <Text style={styles.emptyState}>No clients match this filter.</Text>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
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
                  styles.statusBadge,
                  item.is_active ? styles.statusActive : styles.statusInactive,
                ]}
              >
                {item.is_active ? "Active" : "Inactive"}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  createLink: {
    marginBottom: 16,
  },
  createLinkText: {
    color: colors.primary,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyState: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  clientCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "700",
  },
  clientCode: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
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
