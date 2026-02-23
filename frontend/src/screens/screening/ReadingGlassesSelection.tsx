import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { moderateScale, scale, verticalScale, fontSize as responsiveFontSize } from "../../utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GLASSES_POWERS = [
  { value: "+1.00", label: "+1.00D", description: "Mild presbyopia" },
  { value: "+1.50", label: "+1.50D", description: "Mild to moderate" },
  { value: "+2.00", label: "+2.00D", description: "Moderate presbyopia" },
  { value: "+2.50", label: "+2.50D", description: "Moderate to strong" },
  { value: "+3.00", label: "+3.00D", description: "Strong presbyopia" },
  { value: "+3.50", label: "+3.50D", description: "Very strong" },
];

export default function ReadingGlassesSelection() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData, resetScreeningData } = useScreening();
  
  const [selectedPower, setSelectedPower] = useState<string | null>(null);
  const [canReadWithGlasses, setCanReadWithGlasses] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState<"select" | "test" | "confirm">("select");
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await apiService.getInventory();
      if (response.success) {
        setInventory(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  const getStockForPower = (power: string) => {
    const product = inventory.find(
      (item) => item.product_type === "reading_glasses" && item.power === power
    );
    return product?.quantity || 0;
  };

  const handlePowerSelect = (power: string) => {
    const stock = getStockForPower(power);
    if (stock === 0) {
      Alert.alert("Out of Stock", `Reading glasses ${power} are currently out of stock.`);
      return;
    }
    setSelectedPower(power);
    setCurrentStep("test");
  };

  const handleTestResult = (canRead: boolean) => {
    setCanReadWithGlasses(canRead);
    if (canRead) {
      setCurrentStep("confirm");
    } else {
      // Try next higher power
      const currentIndex = GLASSES_POWERS.findIndex((p) => p.value === selectedPower);
      if (currentIndex < GLASSES_POWERS.length - 1) {
        Alert.alert(
          "Try Higher Power",
          "Client still cannot read N8 line. Let's try a stronger power.",
          [
            {
              text: "OK",
              onPress: () => {
                setSelectedPower(null);
                setCanReadWithGlasses(null);
                setCurrentStep("select");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Maximum Power Reached",
          "Client cannot read even with +3.50D glasses. Referral to eye specialist required.",
          [
            {
              text: "Create Referral",
              onPress: () => handleReferralForGlassesFailure(),
            },
          ]
        );
      }
    }
  };

  const handleReferralForGlassesFailure = async () => {
    setLoading(true);
    try {
      const referralData = {
        ...screeningData,
        nearVisionResult: "failed",
        glassesDispensed: false,
        needsReferral: true,
        referralReason: "Cannot read with maximum reading glasses power (+3.50D). Requires comprehensive eye examination.",
        referralUrgency: "normal",
        referralStep: "Step 7 - Reading Glasses Selection",
      };

      const result = await apiService.createScreening(referralData);
      
      if (result.success) {
        const facilities = await apiService.getHealthFacilities(referralData.district);
        const facility = facilities.data?.[0];
        
        await apiService.createReferral({
          screeningId: result.data.id,
          clientName: referralData.clientName,
          reason: referralData.referralReason,
          urgency: "normal",
          facilityName: facility?.name || "Nearest Health Facility",
          facilityLocation: facility?.location || referralData.district,
          notes: "Presbyopia - maximum reading glasses power insufficient",
        });

        Alert.alert(
          "✅ Referral Created",
          `Client referred to ${facility?.name || "health facility"} for comprehensive eye examination.`,
          [
            {
              text: "OK",
              onPress: () => {
                resetScreeningData();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "AppTabs" }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Referral error:", error);
      Alert.alert("Error", "Failed to create referral. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDispenseGlasses = async () => {
    if (!selectedPower) return;

    setLoading(true);
    try {
      // Find product in inventory
      const product = inventory.find(
        (item) => item.product_type === "reading_glasses" && item.power === selectedPower
      );

      if (!product) {
        Alert.alert("Error", "Product not found in inventory.");
        setLoading(false);
        return;
      }

      // Update inventory (dispense)
      const dispenseResult = await apiService.updateInventory(product.id, {
        quantity: product.quantity - 1,
      });

      if (!dispenseResult.success) {
        throw new Error("Failed to update inventory");
      }

      // Save screening with glasses info
      const completeData = {
        ...screeningData,
        nearVisionResult: "failed_presbyopia",
        glassesDispensed: true,
        glassesPower: selectedPower,
        glassesProductId: product.id,
        needsReferral: false,
        needsGlasses: true,
        notes: `Presbyopia (age ${screeningData.clientAge}). Reading glasses ${selectedPower} dispensed successfully.`,
      };

      const screeningResult = await apiService.createScreening(completeData);

      if (screeningResult.success) {
        // Navigate to completion screen instead of showing alert
        updateScreeningData(completeData);
        navigation.navigate("ScreeningComplete", {
          glassesDispensed: true,
          glassesPower: selectedPower,
        });
      } else {
        throw new Error("Failed to save screening");
      }
    } catch (error) {
      console.error("Dispense error:", error);
      
      // Try saving offline
      try {
        const offlineData = {
          ...screeningData,
          glassesDispensed: true,
          glassesPower: selectedPower,
          offlineId: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        const offlineQueue = await AsyncStorage.getItem("offlineScreenings");
        const queue = offlineQueue ? JSON.parse(offlineQueue) : [];
        queue.push(offlineData);
        await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));

        Alert.alert(
          "📱 Saved Offline",
          "No internet connection. Screening saved locally and will sync when online.",
          [
            {
              text: "OK",
              onPress: () => {
                resetScreeningData();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "AppTabs" }],
                });
              },
            },
          ]
        );
      } catch (offlineError) {
        Alert.alert("Error", "Failed to save screening. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSelectStep = () => (
    <>
      <View style={styles.titleCard}>
        <Ionicons name="glasses-outline" size={32} color="#9333EA" />
        <Text style={styles.titleText}>Step 7: Reading Glasses Selection</Text>
        <Text style={styles.subtitleText}>Age 40+ • Presbyopia (Normal Aging)</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ About Presbyopia:</Text>
        <Text style={styles.infoText}>
          Presbyopia is a normal part of aging that affects everyone after age 40. The eye's lens becomes less flexible, making it harder to focus on close objects.
        </Text>
        <Text style={styles.infoText}>
          Reading glasses help restore the ability to read and do close work.
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>📋 Selection Method:</Text>
        <View style={styles.instructionStep}>
          <Text style={styles.stepNumber}>1️⃣</Text>
          <Text style={styles.stepText}>Start with +1.00D (lowest power)</Text>
        </View>
        <View style={styles.instructionStep}>
          <Text style={styles.stepNumber}>2️⃣</Text>
          <Text style={styles.stepText}>Ask client to read N8 line</Text>
        </View>
        <View style={styles.instructionStep}>
          <Text style={styles.stepNumber}>3️⃣</Text>
          <Text style={styles.stepText}>If cannot read, try next higher power</Text>
        </View>
        <View style={styles.instructionStep}>
          <Text style={styles.stepNumber}>4️⃣</Text>
          <Text style={styles.stepText}>Stop when client can read N8 clearly</Text>
        </View>
      </View>

      <View style={styles.powersSection}>
        <Text style={styles.powersTitle}>Select Power to Test:</Text>
        {GLASSES_POWERS.map((power) => {
          const stock = getStockForPower(power.value);
          const outOfStock = stock === 0;
          
          return (
            <TouchableOpacity
              key={power.value}
              style={[
                styles.powerCard,
                outOfStock && styles.powerCardDisabled,
              ]}
              onPress={() => handlePowerSelect(power.value)}
              disabled={outOfStock}
              activeOpacity={0.7}
            >
              <View style={styles.powerLeft}>
                <Text style={[styles.powerLabel, outOfStock && styles.powerLabelDisabled]}>
                  {power.label}
                </Text>
                <Text style={[styles.powerDescription, outOfStock && styles.powerDescriptionDisabled]}>
                  {power.description}
                </Text>
              </View>
              <View style={styles.powerRight}>
                {outOfStock ? (
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                ) : (
                  <>
                    <Text style={styles.stockText}>Stock: {stock}</Text>
                    <Ionicons name="chevron-forward" size={24} color="#9333EA" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const renderTestStep = () => (
    <>
      <View style={styles.testCard}>
        <Ionicons name="glasses-outline" size={48} color="#9333EA" />
        <Text style={styles.testTitle}>Testing {selectedPower}</Text>
        <Text style={styles.testSubtitle}>Ask client to read N8 line at 40cm</Text>
      </View>

      <View style={styles.testInstructionCard}>
        <Text style={styles.testInstructionTitle}>📖 Test Instructions:</Text>
        <View style={styles.testInstruction}>
          <Text style={styles.bullet}>1.</Text>
          <Text style={styles.testInstructionText}>
            Give client reading glasses {selectedPower}
          </Text>
        </View>
        <View style={styles.testInstruction}>
          <Text style={styles.bullet}>2.</Text>
          <Text style={styles.testInstructionText}>
            Hold near vision chart at arm's length (~40cm)
          </Text>
        </View>
        <View style={styles.testInstruction}>
          <Text style={styles.bullet}>3.</Text>
          <Text style={styles.testInstructionText}>
            Ask client to read the N8 line
          </Text>
        </View>
        <View style={styles.testInstruction}>
          <Text style={styles.bullet}>4.</Text>
          <Text style={styles.testInstructionText}>
            Ensure good lighting
          </Text>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>Can the client read N8 line clearly with {selectedPower}?</Text>
        
        <TouchableOpacity
          style={[styles.answerButton, styles.yesButton]}
          onPress={() => handleTestResult(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
          <Text style={styles.answerButtonText}>Yes - Can Read Clearly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.answerButton, styles.noButton]}
          onPress={() => handleTestResult(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={28} color="#FFFFFF" />
          <Text style={styles.answerButtonText}>No - Still Difficult</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderConfirmStep = () => (
    <>
      <View style={styles.successCard}>
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text style={styles.successTitle}>Perfect Match Found!</Text>
        <Text style={styles.successSubtitle}>Client can read clearly with {selectedPower}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📋 Screening Summary:</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Client:</Text>
          <Text style={styles.summaryValue}>{screeningData.clientName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Age:</Text>
          <Text style={styles.summaryValue}>{screeningData.clientAge} years</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Condition:</Text>
          <Text style={styles.summaryValue}>Presbyopia (Normal Aging)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Glasses Power:</Text>
          <Text style={styles.summaryValue}>{selectedPower}</Text>
        </View>
      </View>

      <View style={styles.dispenseCard}>
        <Text style={styles.dispenseTitle}>✅ Ready to Dispense</Text>
        <Text style={styles.dispenseText}>
          Tap the button below to dispense reading glasses and complete the screening.
        </Text>
        <Text style={styles.dispenseNote}>
          Note: Inventory will be automatically updated.
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A4D8F" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>VHT Eye Screening</Text>
          <Text style={styles.headerStep}>Step 7 of 7</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: "100%" }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === "select" && renderSelectStep()}
        {currentStep === "test" && renderTestStep()}
        {currentStep === "confirm" && renderConfirmStep()}
      </ScrollView>

      {/* Bottom Button */}
      {currentStep === "confirm" && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.dispenseButton}
            onPress={handleDispenseGlasses}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={24} color="#FFFFFF" />
                <Text style={styles.dispenseButtonText}>Dispense Glasses & Complete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A4D8F",
  },
  headerStep: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9333EA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  titleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#9333EA",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    marginRight: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  powersSection: {
    marginBottom: 16,
  },
  powersTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  powerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  powerCardDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.6,
  },
  powerLeft: {
    flex: 1,
  },
  powerLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9333EA",
    marginBottom: 4,
  },
  powerLabelDisabled: {
    color: "#9CA3AF",
  },
  powerDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  powerDescriptionDisabled: {
    color: "#9CA3AF",
  },
  powerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  outOfStockText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  testCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#9333EA",
  },
  testTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#9333EA",
    marginTop: 12,
  },
  testSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  testInstructionCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  testInstructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 12,
  },
  testInstruction: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginRight: 8,
  },
  testInstructionText: {
    fontSize: 14,
    color: "#78350F",
    flex: 1,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  yesButton: {
    backgroundColor: "#10B981",
  },
  noButton: {
    backgroundColor: "#F59E0B",
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  dispenseCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  dispenseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 8,
  },
  dispenseText: {
    fontSize: 14,
    color: "#047857",
    lineHeight: 20,
    marginBottom: 8,
  },
  dispenseNote: {
    fontSize: 12,
    color: "#059669",
    fontStyle: "italic",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  dispenseButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  dispenseButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
