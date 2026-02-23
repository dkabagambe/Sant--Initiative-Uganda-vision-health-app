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
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { apiService } from "../../services/api";
import SaleComplete from "./SaleComplete";
import { moderateScale, scale, verticalScale, fontSize as responsiveFontSize } from "../../utils/responsive";

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

export default function ClientRegistration() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const clientData = route.params?.clientData || {};
  const screeningId = route.params?.screeningId || "";
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"full" | "hire-purchase">("hire-purchase");
  const [vslaGroup, setVslaGroup] = useState<any>(null);
  const [showVslaDropdown, setShowVslaDropdown] = useState(false);
  const [mobileProvider, setMobileProvider] = useState<"MTN" | "Airtel">("MTN");
  const [mobileNumber, setMobileNumber] = useState(clientData.clientPhone || "");
  const [merchantCode] = useState(`SAN-UG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);
  const [loading, setLoading] = useState(false);
  const [showSaleComplete, setShowSaleComplete] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);

  // VSLA Groups data (grouped by district and sub-county)
  const vslaGroups = [
    { id: "1", name: "Twezimbe Women's Group", district: "Luweero", subCounty: "Wobulenzi" },
    { id: "2", name: "Bweyogerere Savings Circle", district: "Luweero", subCounty: "Wobulenzi" },
    { id: "3", name: "Kikyusa Farmers VSLA", district: "Luweero", subCounty: "Kikyusa" },
    { id: "4", name: "Bamunanika Youth Savers", district: "Luweero", subCounty: "Bamunanika" },
    { id: "5", name: "Katikamu Women United", district: "Luweero", subCounty: "Katikamu" },
    { id: "6", name: "Nakaseke Bright Future", district: "Nakaseke", subCounty: "Nakaseke TC" },
    { id: "7", name: "Kiwoko Health Savers", district: "Nakaseke", subCounty: "Kiwoko" },
    { id: "8", name: "Kampala Central VSLA", district: "Kampala", subCounty: "Central Division" },
    { id: "9", name: "Mukono Traders Group", district: "Mukono", subCounty: "Mukono TC" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.success) {
        // Filter products matching recommended power, or show all if no match
        let matchingProducts = response.data.filter(
          (p: any) => p.power === clientData.recommendedPower
        );
        
        // If no matching products, show all products
        if (matchingProducts.length === 0) {
          matchingProducts = response.data;
        }
        
        setProducts(matchingProducts);
        if (matchingProducts.length > 0) {
          setSelectedProduct(matchingProducts[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      Alert.alert("Error", "Failed to load products. Please try again.");
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

    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid mobile money number");
      return;
    }

    setLoading(true);

    try {
      // Create payment record
      const paymentData = {
        screeningId,
        productId: selectedProduct.id,
        clientName: clientData.clientName,
        clientPhone: mobileNumber,
        amount: selectedProduct.price,
        mobileMoneyNumber: mobileNumber,
        paymentMethod: paymentMethod === "hire-purchase" ? "mobile_money" : "cash",
        paymentType: paymentMethod === "hire-purchase" ? "installment" : "full",
        totalInstallments: paymentMethod === "hire-purchase" ? 3 : 1,
        installmentNumber: 1,
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
          productName: `${selectedProduct.power} - ${selectedProduct.name || "Reading Glasses"}`,
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
        onBackToHome={() => navigation.reset({
          index: 0,
          routes: [{ name: "AppTabs" }],
        })}
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
                {selectedProduct.power} - Frame
              </Text>
              <Text style={styles.productStock}>Stock Available: {selectedProduct.stock_quantity || 0} units</Text>
              <Text style={styles.productPrice}>UGX {(selectedProduct.price || 0).toLocaleString()}</Text>
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
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowVslaDropdown(true)}
            >
              {vslaGroup ? (
                <View>
                  <Text style={styles.dropdownSelectedText}>{vslaGroup.name}</Text>
                  <Text style={styles.dropdownSubText}>{vslaGroup.district} • {vslaGroup.subCounty}</Text>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Select VSLA Group</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
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
            style={[styles.confirmButton, loading && { opacity: 0.7 }]}
            onPress={handleConfirmSale}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Sale</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: "AppTabs" }],
            })}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* VSLA Group Dropdown Modal */}
      <Modal
        visible={showVslaDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVslaDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select VSLA Group</Text>
              <TouchableOpacity onPress={() => setShowVslaDropdown(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={vslaGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.vslaItem,
                    vslaGroup?.id === item.id && styles.vslaItemSelected,
                  ]}
                  onPress={() => {
                    setVslaGroup(item);
                    setShowVslaDropdown(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.vslaName,
                      vslaGroup?.id === item.id && { color: "#10B981" },
                    ]}>{item.name}</Text>
                    <Text style={styles.vslaLocation}>
                      {item.district} • {item.subCounty}
                    </Text>
                  </View>
                  {vslaGroup?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />}
            />
          </View>
        </View>
      </Modal>
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
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(16),
  },
  headerTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "400",
    color: "#FFFFFF",
    marginTop: verticalScale(4),
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: scale(16),
    padding: scale(16),
    borderRadius: moderateScale(12),
    elevation: 2,
  },
  cardTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(12),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(8),
    gap: scale(8),
  },
  detailText: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
  },
  section: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  sectionSubtitle: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
    marginBottom: verticalScale(12),
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productName: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#111827",
  },
  productStock: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  productPrice: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: "700",
    color: "#10B981",
    marginTop: verticalScale(8),
  },
  totalAmount: {
    fontSize: responsiveFontSize.xxlarge,
    fontWeight: "700",
    color: "#111827",
  },
  paymentOption: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: verticalScale(12),
  },
  paymentOptionSelected: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  radio: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: "#10B981",
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#111827",
  },
  paymentSubtitle: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  paymentDetail: {
    fontSize: responsiveFontSize.regular,
    fontWeight: "600",
    color: "#10B981",
    marginTop: verticalScale(4),
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    fontSize: responsiveFontSize.medium,
  },
  providerRow: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  providerButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  providerButtonSelected: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  providerText: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#6B7280",
  },
  providerTextSelected: {
    color: "#10B981",
  },
  merchantCodeCard: {
    backgroundColor: "#EFF6FF",
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  merchantCodeTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "700",
    color: "#1E40AF",
  },
  merchantCodeSubtitle: {
    fontSize: responsiveFontSize.regular,
    color: "#3B82F6",
    marginTop: verticalScale(4),
  },
  merchantCode: {
    fontSize: responsiveFontSize.xxlarge,
    fontWeight: "700",
    color: "#1E40AF",
    marginTop: verticalScale(12),
    textAlign: "center",
  },
  merchantCodeNote: {
    fontSize: responsiveFontSize.small,
    color: "#3B82F6",
    marginTop: verticalScale(8),
    textAlign: "center",
  },
  agreementCard: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(12),
    borderRadius: moderateScale(8),
  },
  agreementText: {
    fontSize: responsiveFontSize.regular,
    color: "#92400E",
  },
  buttonContainer: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  confirmButton: {
    backgroundColor: "#10B981",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: "600",
    color: "#6B7280",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    minHeight: verticalScale(48),
  },
  dropdownSelectedText: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#111827",
  },
  dropdownSubText: {
    fontSize: responsiveFontSize.small,
    color: "#6B7280",
    marginTop: verticalScale(2),
  },
  dropdownPlaceholder: {
    fontSize: responsiveFontSize.medium,
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  vslaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
  },
  vslaItemSelected: {
    backgroundColor: "#F0FDF4",
  },
  vslaName: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#111827",
  },
  vslaLocation: {
    fontSize: responsiveFontSize.small,
    color: "#6B7280",
    marginTop: verticalScale(2),
  },
});
