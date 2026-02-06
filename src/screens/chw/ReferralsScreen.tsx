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

export default function ReferralsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Referrals</Text>
          <TouchableOpacity>
            <Ionicons name="add" size={24} color="#1E40AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pending Referrals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Outstanding</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Referrals</Text>

            <View style={styles.referralList}>
              <View style={styles.referralItem}>
                <View style={styles.referralIcon}>
                  <Ionicons name="medical" size={24} color="#DC2626" />
                </View>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>Nansubuga Sarah</Text>
                  <Text style={styles.referralDetails}>
                    Referred to: Luweero Hospital
                  </Text>
                  <Text style={styles.referralTime}>Referred: 1 day ago</Text>
                </View>
                <TouchableOpacity style={styles.followUpButton}>
                  <Text style={styles.followUpButtonText}>Follow Up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.referralItem}>
                <View style={styles.referralIcon}>
                  <Ionicons name="medical" size={24} color="#F59E0B" />
                </View>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>Kato John</Text>
                  <Text style={styles.referralDetails}>
                    Referred to: Bombo Health Center
                  </Text>
                  <Text style={styles.referralTime}>Referred: 3 days ago</Text>
                </View>
                <TouchableOpacity style={styles.followUpButton}>
                  <Text style={styles.followUpButtonText}>Follow Up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.referralItem}>
                <View style={styles.referralIcon}>
                  <Ionicons name="medical" size={24} color="#059669" />
                </View>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>Nakimuli Joan</Text>
                  <Text style={styles.referralDetails}>
                    Referred to: Vision Care Clinic
                  </Text>
                  <Text style={styles.referralTime}>Referred: 5 days ago</Text>
                </View>
                <TouchableOpacity style={styles.followUpButton}>
                  <Text style={styles.followUpButtonText}>Follow Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.newReferralButton}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.newReferralButtonText}>New Referral</Text>
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
  referralList: {
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
  referralItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  referralDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  referralTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  followUpButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  followUpButtonText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "600",
  },
  newReferralButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  newReferralButtonText: {
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
