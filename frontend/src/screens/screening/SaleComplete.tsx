import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SaleCompleteProps {
  clientName: string;
  clientPhone: string;
  productName: string;
  totalAmount: number;
  paymentMethod: "full" | "hire-purchase";
  installmentAmount?: number;
  nextPaymentDate?: string;
  onBackToHome: () => void;
  onScreenNext: () => void;
}

export default function SaleComplete({
  clientName,
  clientPhone,
  productName,
  totalAmount,
  paymentMethod,
  installmentAmount,
  nextPaymentDate,
  onBackToHome,
  onScreenNext,
}: SaleCompleteProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#10B981" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Sale Completed Successfully!</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Cards */}
        <View style={styles.successCard}>
          <View style={styles.successItem}>
            <Ionicons name="cube" size={24} color="#10B981" />
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Inventory Updated:</Text>
              <Text style={styles.successText}>✓ Stock reduced by 1 unit</Text>
            </View>
          </View>

          {paymentMethod === "hire-purchase" && (
            <View style={styles.successItem}>
              <Ionicons name="calendar" size={24} color="#10B981" />
              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Repayment Schedule:</Text>
                <Text style={styles.successText}>✓ Created (3 months)</Text>
              </View>
            </View>
          )}

          <View style={styles.successItem}>
            <Ionicons name="person" size={24} color="#10B981" />
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Client Record:</Text>
              <Text style={styles.successText}>✓ Saved</Text>
            </View>
          </View>
        </View>

        {/* Receipt & SMS Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.receiptTitle}>Receipt & SMS Sent!</Text>
          </View>

          <View style={styles.receiptItem}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#6B7280" />
            <Text style={styles.receiptText}>✓ SMS sent to {clientPhone}</Text>
          </View>

          <View style={styles.receiptItem}>
            <Ionicons name="document-text" size={20} color="#6B7280" />
            <Text style={styles.receiptText}>✓ Payment receipt generated</Text>
          </View>

          {paymentMethod === "hire-purchase" && (
            <>
              <View style={styles.receiptItem}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.receiptText}>✓ Repayment schedule sent</Text>
              </View>

              <View style={styles.nextPaymentCard}>
                <Text style={styles.nextPaymentText}>
                  Next payment: UGX {installmentAmount?.toLocaleString()} due {nextPaymentDate}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Client:</Text>
            <Text style={styles.summaryValue}>{clientName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product:</Text>
            <Text style={styles.summaryValue}>{productName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>UGX {totalAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method:</Text>
            <Text style={styles.summaryValue}>
              {paymentMethod === "hire-purchase" ? "Hire-Purchase (3 months)" : "Full Payment"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onScreenNext}
            activeOpacity={0.8}
          >
            <Ionicons name="eye" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Screen Next Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onBackToHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={24} color="#10B981" />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#10B981",
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  successItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: "#6B7280",
  },
  receiptCard: {
    backgroundColor: "#F0FDF4",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  receiptItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  receiptText: {
    fontSize: 14,
    color: "#166534",
  },
  nextPaymentCard: {
    backgroundColor: "#DCFCE7",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  nextPaymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
});
