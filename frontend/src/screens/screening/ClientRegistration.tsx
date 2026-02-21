import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import SaleComplete from "./SaleComplete";

interface ClientRegistrationProps {
  clientData: {
    clientName: string;
    clientAge: number;
    clientPhone: string;
    clientGender: string;
    recommendedPower?: string;
    district: string;
    county: string;
    subCounty: string;
    parish: string;
    clientVillage: string;
  };
  screeningId: string;
}

export default function ClientRegistration({
  clientData,
  screeningId,
}: ClientRegistrationProps) {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"full" | "hire-purchase">("hire-purchase");
  const [vslaGroup, setVslaGroup] = useState("");
  const [mobileProvider, setMobileProvider] = useState<"MTN" | "Airtel">("MTN");
  const [mobileNumber, setMobileNumber] = useState(clientData.clientPhone || "");
  const [merchantCode] = useState(`SAN-UG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);
  const [loading, setLoading] = useState(false);
  const [showSaleComplete, setShowSaleComplete] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.success) {
        // Filter products matching recommended power
        const matchingProducts = response.data.filter(
          (p: any) => p.power === clientData.recommendedPower
        );
        setProducts(matchingProducts);
        if (matchingProducts.length > 0) {
          setSelectedProduct(matchingProducts[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const handleConfirmSale = async () => {
    if (!selectedProduct) {
      Alert.alert("Error", "Please select a product");
      return;
    }

    if (paymentMethod === "hire-purchase" && !vslaGroup) {
      Alert.alert("Error", "Please select a VSLA group");
      return;
    }

    setLoading(true);

    try {
      // Create payment record
      const paymentData = {
        screeningId,
        productId: selectedProduct.id,
        amount: selectedProduct.price,
        paymentMethod,
        installments: paymentMethod === "hire-purchase" ? 3 : 1,
        vslaGroup: paymentMethod === "hire-purchase" ? vslaGroup : null,
        mobileProvider,
        mobileNumber,
        merchantCode,
      };

      const result = await apiService.createPayment(paymentData);

      if (result.success) {
        // Calculate next payment date (30 days from now)
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);
        const nextPaymentDate = nextDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Save sale data and show completion screen
        setSaleData({
          clientName: clientData.clientName,
          clientPhone: clientData.clientPhone,
          productName: `${selectedProduct.power} - ${selectedProduct.frameType} Frame`,
          totalAmount: selectedProduct.price,
          paymentMethod,
          installmentAmount,
          nextPaymentDate,
        });
        setShowSaleComplete(true);
      } else {
        throw new Error("Payment creation failed");
      }
    } catch (error) {
      console.error("Sale error:", error);
      Alert.alert("Error", "Failed to complete sale. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const installmentAmount = selectedProduct ? Math.ceil(selectedProduct.price / 3) : 0;

  // Show sale complete screen
  if (showSaleComplete && saleData) {
    return (
      <SaleComplete
        clientName={saleData.clientName}
        clientPhone={saleData.clientPhone}
        productName={saleData.productName}
        totalAmount={saleData.totalAmount}
        paymentMethod={saleData.paymentMethod}
        installmentAmount={saleData.installmentAmount}
        nextPaymentDate={saleData.nextPaymentDate}
        onBackToHome={() => navigation.navigate("CHWDashboard")}
        onScreenNext={() => navigation.navigate("VisionScreen1")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#10B981" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Santé Initiative Uganda</Text>
        <Text style={styles.headerSubtitle}>Client Registration</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Client Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{clientData.clientName}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Age: {clientData.clientAge} years</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Phone: {clientData.clientPhone}</Text>
          </View>

          {clientData.recommendedPower && (
            <View style={styles.detailRow}>
              <Ionicons name="glasses" size={16} color="#6B7280" />
              <Text style={styles.detailText}>Power: {clientData.recommendedPower}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {clientData.clientVillage}, {clientData.parish}, {clientData.subCounty}, {clientData.county}, {clientData.district}
            </Text>
          </View>
        </View>

        {/* Issue Glasses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Glasses</Text>
          <Text style={styles.sectionSubtitle}>Select from Inventory</Text>

          {selectedProduct && (
            <View style={styles.productCard}>
              <Text style={styles.productName}>
                {selectedProduct.power} - {selectedProduct.frameType} Frame
              </Text>
              <Text style={styles.productStock}>Stock Available: {selectedProduct.stockQuantity} units</Text>
              <Text style={styles.productPrice}>UGX {selectedProduct.price.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Total Cost */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Cost</Text>
          <Text style={styles.totalAmount}>
            UGX {selectedProduct ? selectedProduct.price.toLocaleString() : "0"}
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "hire-purchase" && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod("hire-purchase")}
          >
            <View style={styles.radio}>
              {paymentMethod === "hire-purchase" && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>Hire-Purchase (3 months)</Text>
              <Text style={styles.paymentSubtitle}>3 monthly installments via MTN/Airtel Money</Text>
              <Text style={styles.paymentDetail}>
                UGX {installmentAmount.toLocaleString()}/month × 3
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "full" && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod("full")}
          >
            <View style={styles.radio}>
              {paymentMethod === "full" && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>Full Payment</Text>
              <Text style={styles.paymentSubtitle}>
                Pay UGX {selectedProduct ? selectedProduct.price.toLocaleString() : "0"} today
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* VSLA Group (only for hire-purchase) */}
        {paymentMethod === "hire-purchase" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VSLA Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Select VSLA Group"
              value={vslaGroup}
              onChangeText={setVslaGroup}
            />
          </View>
        )}

        {/* Mobile Money Number */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile Money Number</Text>
          
          <View style={styles.providerRow}>
            <TouchableOpacity
              style={[styles.providerButton, mobileProvider === "MTN" && styles.providerButtonSelected]}
              onPress={() => setMobileProvider("MTN")}
            >
              <Text style={[styles.providerText, mobileProvider === "MTN" && styles.providerTextSelected]}>
                MTN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.providerButton, mobileProvider === "Airtel" && styles.providerButtonSelected]}
              onPress={() => setMobileProvider("Airtel")}
            >
              <Text style={[styles.providerText, mobileProvider === "Airtel" && styles.providerTextSelected]}>
                Airtel
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="0700123456"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
          />
        </View>

        {/* Merchant Code */}
        <View style={styles.merchantCodeCard}>
          <Text style={styles.merchantCodeTitle}>Merchant Code</Text>
          <Text style={styles.merchantCodeSubtitle}>Share this code with client for installment payments</Text>
          <Text style={styles.merchantCode}>{merchantCode}</Text>
          <Text style={styles.merchantCodeNote}>
            Client can use this code to pay via Mobile Money or at any Santé Initiative agent
          </Text>
        </View>

        {/* Agreement Note */}
        {paymentMethod === "hire-purchase" && (
          <View style={styles.agreementCard}>
            <Text style={styles.agreementText}>
              Client agrees to pay UGX {installmentAmount.toLocaleString()} monthly for 3 months. Late payments may incur fees.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSale}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? "Processing..." : "Confirm Sale"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate("CHWDashboard")}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#FFFFFF",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  productStock: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  paymentOption: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  paymentSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  paymentDetail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  providerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  providerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  providerButtonSelected: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  providerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  providerTextSelected: {
    color: "#10B981",
  },
  merchantCodeCard: {
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  merchantCodeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
  },
  merchantCodeSubtitle: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 4,
  },
  merchantCode: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E40AF",
    marginTop: 12,
    textAlign: "center",
  },
  merchantCodeNote: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 8,
    textAlign: "center",
  },
  agreementCard: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  agreementText: {
    fontSize: 14,
    color: "#92400E",
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
  },
});
