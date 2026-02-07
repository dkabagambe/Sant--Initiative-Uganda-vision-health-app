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

export default function ReportsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
          <TouchableOpacity>
            <Ionicons name="download" size={24} color="#1E40AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Sales, Payments, Stock & Referrals</Text>
          <Text style={styles.subtitle}>View and export detailed reports</Text>

          <View style={styles.reportsGrid}>
            <TouchableOpacity style={styles.reportCard}>
              <View style={styles.reportIcon}>
                <Ionicons name="cash-outline" size={32} color="#1E40AF" />
              </View>
              <Text style={styles.reportTitle}>Sales Report</Text>
              <Text style={styles.reportDescription}>
                Daily, weekly, monthly sales
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportCard}>
              <View style={styles.reportIcon}>
                <Ionicons name="wallet-outline" size={32} color="#1E40AF" />
              </View>
              <Text style={styles.reportTitle}>Payments Report</Text>
              <Text style={styles.reportDescription}>
                Payment collections & dues
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportCard}>
              <View style={styles.reportIcon}>
                <Ionicons name="cube-outline" size={32} color="#1E40AF" />
              </View>
              <Text style={styles.reportTitle}>Stock Report</Text>
              <Text style={styles.reportDescription}>
                Inventory levels & usage
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportCard}>
              <View style={styles.reportIcon}>
                <Ionicons name="share-outline" size={32} color="#1E40AF" />
              </View>
              <Text style={styles.reportTitle}>Referrals Report</Text>
              <Text style={styles.reportDescription}>
                Referral tracking & outcomes
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Monthly Summary</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Screened:</Text>
                <Text style={styles.summaryValue}>112 clients</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Glasses Given:</Text>
                <Text style={styles.summaryValue}>67 pairs</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Revenue:</Text>
                <Text style={styles.summaryValue}>UGX 335,000</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Successful Referrals:</Text>
                <Text style={styles.summaryValue}>12 clients</Text>
              </View>
            </View>
          </View>

          <View style={styles.periodSelector}>
            <Text style={styles.periodTitle}>Select Period:</Text>
            <View style={styles.periodButtons}>
              <TouchableOpacity style={styles.periodButtonActive}>
                <Text style={styles.periodButtonTextActive}>This Week</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.periodButton}>
                <Text style={styles.periodButtonText}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.periodButton}>
                <Text style={styles.periodButtonText}>Last Month</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.periodButton}>
                <Text style={styles.periodButtonText}>Custom</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.generateButton}>
            <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate Report</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  reportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  reportCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  reportDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  periodSelector: {
    marginBottom: 24,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  periodButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  periodButtonActive: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E3A8A",
  },
  periodButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  generateButtonText: {
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
