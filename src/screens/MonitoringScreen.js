import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "../utils/storage";

export function MonitoringScreen() {
  const { temperature, timestamp, connectionState, error: mqttError } = useMqttSensor();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Jumlah item per halaman
  const [totalItems, setTotalItems] = useState(0);

  const fetchReadings = useCallback(async (page = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      // Untuk demo, kita akan simulasi pagination dari data yang ada
      // Dalam implementasi nyata, API Anda harus mendukung pagination
      const data = await Api.getSensorReadings();
      setTotalItems(data?.length || 0);
      
      // Simulasi pagination client-side
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data ? data.slice(startIndex, endIndex) : [];
      
      setReadings(paginatedData);
      setCurrentPage(page);
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
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useFocusEffect(
    useCallback(() => {
      fetchReadings(1);
    }, [fetchReadings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings(currentPage);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings, currentPage]);

  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      fetchReadings(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      fetchReadings(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchReadings(page);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Realtime Temperature</Text>
          <View style={styles.valueRow}>
            <Text style={styles.temperatureText}>
              {typeof temperature === "number" ? `${temperature.toFixed(2)}°C` : "--"}
            </Text>
          </View>
          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>
              Last update: {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {mqttError && <Text style={styles.errorText}>MQTT error: {mqttError}</Text>}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Triggered Readings History</Text>
          {loading && <ActivityIndicator />}
        </View>
        
        {/* Pagination Info */}
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Menampilkan {startItem}-{endItem} dari {totalItems} data
          </Text>
        </View>

        {apiError && <Text style={styles.errorText}>Failed to load history: {apiError}</Text>}
        
        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) => (value ? new Date(value).toLocaleString() : "--"),
            },
            {
              key: "temperature",
              title: "Temperature (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
            {
              key: "threshold_value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
          ]}
          data={readings}
          keyExtractor={(item) => item.id}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            {/* Previous Button */}
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.paginationButtonDisabled
              ]}
              onPress={goToPrevPage}
              disabled={currentPage === 1}
            >
              <Text style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.paginationButtonTextDisabled
              ]}>
                Sebelumnya
              </Text>
            </TouchableOpacity>

            {/* Page Numbers */}
            <View style={styles.pageNumbersContainer}>
              {getPageNumbers().map(page => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.pageNumberButton,
                    page === currentPage && styles.pageNumberButtonActive
                  ]}
                  onPress={() => goToPage(page)}
                >
                  <Text style={[
                    styles.pageNumberText,
                    page === currentPage && styles.pageNumberTextActive
                  ]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled
              ]}
              onPress={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <Text style={[
                styles.paginationButtonText,
                currentPage === totalPages && styles.paginationButtonTextDisabled
              ]}>
                Berikutnya
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Page Navigation */}
        {totalPages > 5 && (
          <View style={styles.quickNavigation}>
            <Text style={styles.quickNavigationText}>Lompat ke halaman: </Text>
            <View style={styles.quickInputContainer}>
              <TextInput
                style={styles.quickInput}
                keyboardType="numeric"
                placeholder={`1-${totalPages}`}
                onSubmitEditing={(e) => {
                  const page = parseInt(e.nativeEvent.text);
                  if (page && page >= 1 && page <= totalPages) {
                    goToPage(page);
                  }
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
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
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ff7a59",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  paginationInfo: {
    marginBottom: 12,
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  paginationButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  paginationButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  paginationButtonTextDisabled: {
    color: "#64748b",
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageNumberButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  pageNumberButtonActive: {
    backgroundColor: "#2563eb",
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  pageNumberTextActive: {
    color: "#fff",
  },
  quickNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  quickNavigationText: {
    fontSize: 14,
    color: "#475569",
    marginRight: 8,
  },
  quickInputContainer: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  quickInput: {
    width: 60,
    height: 32,
    textAlign: "center",
    fontSize: 14,
  },
});