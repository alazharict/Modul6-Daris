import { useCallback, useState, useLayoutEffect } from "react";
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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native"; // Import useRoute
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "../utils/storage";
import { Ionicons } from "@expo/vector-icons"; // Tambahan Icon

const MonitoringScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Ambil params dari App.js

  // Cek apakah user adalah Guest (default false jika tidak ada param)
  const isGuest = route.params?.isGuest ?? false;

  const {
    temperature,
    timestamp,
    connectionState,
    error: mqttError,
  } = useMqttSensor();
  const [allReadings, setAllReadings] = useState([]);
  const [currentReadings, setCurrentReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [quickJumpPage, setQuickJumpPage] = useState("");

  // --- LOGIKA HEADER KHUSUS GUEST ---
  useLayoutEffect(() => {
    if (isGuest) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.headerLoginBtn}
          >
            <Text style={styles.headerLoginText}>Login</Text>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isGuest]);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await Api.getSensorReadings();
      setAllReadings(data ?? []);
      updateCurrentReadings(data ?? [], currentPage);
    } catch (err) {
      // Jika guest, error auth diabaikan saja (karena wajar mereka tidak punya token)
      if (err.message && err.message.includes("Authentication failed")) {
        if (!isGuest) {
          // Hanya alert jika SEHARUSNYA login tapi token mati
          Alert.alert("Session Expired", "Please login again", [
            {
              text: "OK",
              onPress: async () => {
                try {
                  await logout();
                } catch (e) {}
              },
            },
          ]);
        }
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, isGuest]); // Tambahkan isGuest ke dependency

  const updateCurrentReadings = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    setCurrentReadings(paginatedData);
  };

  useFocusEffect(
    useCallback(() => {
      fetchReadings();
    }, [fetchReadings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings();
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings]);

  // ... (Fungsi Pagination: goToNextPage, goToPrevPage, goToPage, handleQuickJump TETAP SAMA) ...
  // Copy paste fungsi pagination Anda yang lama di sini agar tidak hilang
  const totalItems = allReadings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateCurrentReadings(allReadings, newPage);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateCurrentReadings(allReadings, newPage);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateCurrentReadings(allReadings, page);
      setQuickJumpPage("");
    }
  };

  const handleQuickJump = () => {
    const page = parseInt(quickJumpPage);
    if (page && page >= 1 && page <= totalPages) goToPage(page);
    else
      Alert.alert(
        "Invalid Page",
        `Please enter a page number between 1 and ${totalPages}`
      );
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];
    const pages = [];
    const maxVisiblePages = 1;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };
  // ... (Akhir Fungsi Pagination) ...

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner khusus Guest */}
        {isGuest && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestText}>Anda dalam mode tamu.</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.guestLink}>Login untuk akses penuh</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>Realtime Temperature</Text>
          <View style={styles.valueRow}>
            <Text style={styles.temperatureText}>
              {typeof temperature === "number"
                ? `${temperature.toFixed(2)}°C`
                : "--"}
            </Text>
          </View>
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
          <Text style={styles.sectionTitle}>Triggered Readings History</Text>
          {loading && <ActivityIndicator />}
        </View>

        {/* Pagination Info */}
        {totalItems > 0 && (
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Menampilkan {startItem}-{endItem} dari {totalItems} data
            </Text>
            <Text style={styles.pageInfoText}>
              Halaman {currentPage} dari {totalPages}
            </Text>
          </View>
        )}

        {/* API Error handling */}
        {apiError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load history: {apiError}
            </Text>
            {isGuest && (
              <Text style={styles.hintText}>
                (Login mungkin diperlukan untuk melihat history)
              </Text>
            )}
          </View>
        )}

        {totalItems === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No data available</Text>
          </View>
        ) : (
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
            ]}
            data={currentReadings}
            keyExtractor={(item) => item.id}
          />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.paginationSection}>
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === 1 && styles.paginationButtonDisabled,
                ]}
                onPress={goToPrevPage}
                disabled={currentPage === 1}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    currentPage === 1 && styles.paginationButtonTextDisabled,
                  ]}
                >
                  ← Prev
                </Text>
              </TouchableOpacity>

              <View style={styles.pageNumbersContainer}>
                {getPageNumbers().map((page) => (
                  <TouchableOpacity
                    key={page}
                    style={[
                      styles.pageNumberButton,
                      page === currentPage && styles.pageNumberButtonActive,
                    ]}
                    onPress={() => goToPage(page)}
                  >
                    <Text
                      style={[
                        styles.pageNumberText,
                        page === currentPage && styles.pageNumberTextActive,
                      ]}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === totalPages && styles.paginationButtonDisabled,
                ]}
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    currentPage === totalPages &&
                      styles.paginationButtonTextDisabled,
                  ]}
                >
                  Next →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickNavigation}>
              <Text style={styles.quickNavigationText}>Page: </Text>
              <TextInput
                style={styles.quickInput}
                keyboardType="numeric"
                placeholder={`1-${totalPages}`}
                value={quickJumpPage}
                onChangeText={setQuickJumpPage}
                onSubmitEditing={handleQuickJump}
              />
              <TouchableOpacity
                style={styles.quickJumpButton}
                onPress={handleQuickJump}
              >
                <Text style={styles.quickJumpButtonText}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fb", padding: 16 },
  
  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  valueRow: { flexDirection: "row", alignItems: "flex-end" },
  temperatureText: { fontSize: 48, fontWeight: "700", color: "#ff7a59" },
  metaText: { marginTop: 8, color: "#555" },
  errorText: { marginTop: 8, color: "#c82333", textAlign: "center" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  paginationInfo: {
    marginBottom: 12,
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  paginationText: { fontSize: 14, color: "#475569", fontWeight: "500" },
  pageInfoText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  emptyState: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyStateText: { fontSize: 16, color: "#64748b", textAlign: "center" },
  paginationSection: {
    marginTop: 16,
    marginBottom: 19,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paginationButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  paginationButtonDisabled: { backgroundColor: "#cbd5e1" },
  paginationButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  paginationButtonTextDisabled: { color: "#64748b" },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  pageNumberButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    minWidth: 36,
    alignItems: "center",
  },
  pageNumberButtonActive: { backgroundColor: "#2563eb" },
  pageNumberText: { fontSize: 14, fontWeight: "500", color: "#475569" },
  pageNumberTextActive: { color: "#fff" },
  quickNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  quickNavigationText: { fontSize: 14, color: "#475569", marginRight: 8 },
  quickInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    width: 60,
    height: 32,
    textAlign: "center",
    fontSize: 14,
    marginRight: 8,
    paddingTop: -1,
    paddingBottom: -3,
  },
  quickJumpButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickJumpButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  // --- STYLE BARU UNTUK GUEST ---
  headerLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 16,
  },
  headerLoginText: { color: "#fff", fontWeight: "600", marginRight: 4 },
  guestBanner: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestText: { color: "#92400e", fontWeight: "500" },
  guestLink: {
    color: "#2563eb",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  hintText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  errorContainer: { marginBottom: 10, alignItems: "center" },
});

export default MonitoringScreen;
