import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function InventoryScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventory</Text>
          <TouchableOpacity>
            <Ionicons name="add" size={24} color="#1E40AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>Glasses in Stock</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Given This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumberGood}>Good</Text>
              <Text style={styles.statLabel}>Stock Level</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Items</Text>

            <View style={styles.stockList}>
              <View style={styles.stockItem}>
                <View style={styles.stockIcon}>
                  <Ionicons name="eye-outline" size={24} color="#1E40AF" />
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>Reading Glasses +1.00</Text>
                  <Text style={styles.stockDetails}>
                    Quantity: 12 • Last restock: 3 days ago
                  </Text>
                </View>
                <Text style={styles.stockStatus}>Good</Text>
              </View>

              <View style={styles.stockItem}>
                <View style={styles.stockIcon}>
                  <Ionicons name="eye-outline" size={24} color="#1E40AF" />
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>Reading Glasses +1.50</Text>
                  <Text style={styles.stockDetails}>
                    Quantity: 8 • Last restock: 1 week ago
                  </Text>
                </View>
                <Text style={styles.stockStatus}>Low</Text>
              </View>

              <View style={styles.stockItem}>
                <View style={styles.stockIcon}>
                  <Ionicons name="eye-outline" size={24} color="#1E40AF" />
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>Reading Glasses +2.00</Text>
                  <Text style={styles.stockDetails}>
                    Quantity: 15 • Last restock: 2 days ago
                  </Text>
                </View>
                <Text style={styles.stockStatus}>Good</Text>
              </View>

              <View style={styles.stockItem}>
                <View style={styles.stockIcon}>
                  <Ionicons name="eye-outline" size={24} color="#1E40AF" />
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>Reading Glasses +2.50</Text>
                  <Text style={styles.stockDetails}>
                    Quantity: 10 • Last restock: 5 days ago
                  </Text>
                </View>
                <Text style={styles.stockStatus}>Good</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.restockButton}>
            <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
            <Text style={styles.restockButtonText}>Request Restock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  statNumberGood: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  stockList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  stockDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  restockButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  restockButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
