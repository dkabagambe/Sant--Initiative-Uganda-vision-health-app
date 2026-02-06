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

export default function PaymentsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payments</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statAmount}>UGX 15,000</Text>
              <Text style={styles.statLabel}>Expected</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Total Due</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payments Due Today</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentList}>
              <View style={styles.paymentItem}>
                <View style={styles.paymentAvatar}>
                  <Ionicons name="person-circle" size={40} color="#6B7280" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Nakato Grace</Text>
                  <Text style={styles.paymentDetails}>
                    Reading glasses +2.50D
                  </Text>
                  <Text style={styles.paymentTime}>Due: Today</Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.amount}>UGX 5,000</Text>
                  <TouchableOpacity style={styles.recordButton}>
                    <Text style={styles.recordButtonText}>Record</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.paymentItem}>
                <View style={styles.paymentAvatar}>
                  <Ionicons name="person-circle" size={40} color="#6B7280" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Kigozi David</Text>
                  <Text style={styles.paymentDetails}>
                    Reading glasses +1.75D
                  </Text>
                  <Text style={styles.paymentTime}>Due: Today</Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.amount}>UGX 5,000</Text>
                  <TouchableOpacity style={styles.recordButton}>
                    <Text style={styles.recordButtonText}>Record</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.paymentItem}>
                <View style={styles.paymentAvatar}>
                  <Ionicons name="person-circle" size={40} color="#6B7280" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Namukasa Prossy</Text>
                  <Text style={styles.paymentDetails}>
                    Reading glasses +2.00D
                  </Text>
                  <Text style={styles.paymentTime}>Due: Today</Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.amount}>UGX 5,000</Text>
                  <TouchableOpacity style={styles.recordButton}>
                    <Text style={styles.recordButtonText}>Record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>

            <View style={styles.recentList}>
              <View style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>Musoke Peter</Text>
                  <Text style={styles.recentDetails}>
                    Payment received • UGX 5,000
                  </Text>
                  <Text style={styles.recentTime}>5 hours ago</Text>
                </View>
                <Text style={styles.recentAmount}>+5,000</Text>
              </View>

              <View style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>Nabukeera Mary</Text>
                  <Text style={styles.recentDetails}>
                    Payment received • UGX 3,000
                  </Text>
                  <Text style={styles.recentTime}>1 day ago</Text>
                </View>
                <Text style={styles.recentAmount}>+3,000</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.recordPaymentButton}>
            <Ionicons name="cash" size={20} color="#FFFFFF" />
            <Text style={styles.recordPaymentButtonText}>Record Payment</Text>
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
  statAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  viewAllText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "500",
  },
  paymentList: {
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
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  paymentAvatar: {
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  paymentTime: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "500",
  },
  paymentAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  recordButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  recordButtonText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  recentSection: {
    marginBottom: 24,
  },
  recentList: {
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
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  recentIcon: {
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  recentDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  recordPaymentButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  recordPaymentButtonText: {
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
