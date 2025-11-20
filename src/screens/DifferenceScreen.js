import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { logout } from "../utils/storage";
import { SwipeIndicator } from "../components/SwipeIndicator";

export function DifferenceScreen() {
  const {
    temperature,
    timestamp,
    connectionState,
    error: mqttError,
  } = useMqttSensor();
  const [threshold, setThreshold] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [apiError, setApiError] = useState(null);
  

  const fetchLatestThreshold = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Api.getThresholds();
      const latest = data?.[0] ?? null;
      setThreshold(typeof latest?.value === "number" ? latest.value : null);
    } catch (err) {
      if (err.message && err.message.includes("Authentication failed")) {
        Alert.alert("Session Expired", "Please login again", [
          {
            text: "OK",
            onPress: async () => {
              try {
                await logout();
              } catch (e) {
                console.error("Error during session expiry logout:", e);
              }
            },
          },
        ]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestThreshold();
  }, [fetchLatestThreshold]);

  const fetchReadings = useCallback(async () => {
    setLoadingReadings(true);
    setApiError(null);
    try {
      // clear previous local data immediately and fetch persisted differences from backend
      setReadings([]);
      const data = await Api.getDifferences();
      // only keep rows that have a numeric `difference` value (i.e. rows from reading_differences)
      const filtered = (data ?? []).filter(
        (r) => typeof r.difference === "number"
      );
      setReadings(filtered);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoadingReadings(false);
    }
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchLatestThreshold(), fetchReadings()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLatestThreshold, fetchReadings]);

  const diff =
    typeof temperature === "number" && typeof threshold === "number"
      ? temperature - threshold
      : null;
  const diffText =
    diff === null ? "--" : `${diff > 0 ? "+" : ""}${diff.toFixed(2)}°C`;
  const statusColor = diff === null ? "#333" : diff > 0 ? "#c82333" : "#15803d";

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <SwipeIndicator />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.title}>Temperature vs Threshold</Text>

          <Text style={styles.label}>Realtime temperature</Text>
          <Text style={styles.value}>
            {typeof temperature === "number"
              ? `${temperature.toFixed(2)}°C`
              : "--"}
          </Text>

          <Text style={styles.label}>Latest threshold</Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.value}>
              {typeof threshold === "number"
                ? `${threshold.toFixed(2)}°C`
                : "--"}
            </Text>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Difference (realtime - threshold)</Text>
          <Text style={[styles.diffText, { color: statusColor }]}>
            {diffText}
          </Text>

          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>
              Last update: {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {mqttError && (
            <Text style={styles.errorText}>MQTT error: {mqttError}</Text>
          )}
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Difference History</Text>
          {loadingReadings && <ActivityIndicator />}
        </View>
        {apiError && (
          <Text style={styles.errorText}>
            Failed to load history: {apiError}
          </Text>
        )}
        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) =>
                value ? new Date(value).toLocaleString() : "--",
            },
            {
              key: "temperature",
              title: "Temperature (°C)",
              render: (value) =>
                typeof value === "number"
                  ? `${Number(value).toFixed(2)}`
                  : "--",
            },
            {
              key: "threshold_value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number"
                  ? `${Number(value).toFixed(2)}`
                  : "--",
            },
            {
              key: "difference",
              title: "Difference (°C)",
              render: (value, item) => {
                // backend stores difference directly
                return typeof value === "number"
                  ? `${value > 0 ? "+" : ""}${Number(value).toFixed(2)}`
                  : "--";
              },
            },
          ]}
          data={readings}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fb",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
    color: "#444",
  },
  value: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
    color: "#ff7a59",
  },
  diffText: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
});
