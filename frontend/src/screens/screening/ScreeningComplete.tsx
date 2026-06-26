import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { moderateScale, scale, verticalScale, fontSize as responsiveFontSize } from "../../utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ScreeningComplete() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { resetScreeningData, screeningData } = useScreening();
  const [saving, setSaving] = useState(false);
  
  const glassesDispensed = route.params?.glassesDispensed || false;
  const glassesPower = route.params?.glassesPower || "";

  // Simple offline detection - check if API is reachable
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    try {
      // Try a simple API call to check connectivity
      await apiService.getCurrentUser();
      return false; // If API works, we're online
    } catch (error) {
      // If API fails, assume we're offline
      console.log("API connectivity check failed, assuming offline");
      return true;
    }
  };

  const handleRegisterAndSave = async () => {
    // If glasses were dispensed, go to ClientRegistration for payment/sale flow
    if (glassesDispensed) {
      navigation.navigate("ClientRegistration", {
        clientData: {
          clientName: screeningData.clientName || "",
          clientAge: screeningData.clientAge || 0,
          clientPhone: screeningData.clientPhone || "",
          clientGender: screeningData.clientGender || "",
          recommendedPower: glassesPower || screeningData.recommendedPower || "",
          district: screeningData.district || "",
          county: screeningData.county || "",
          subCounty: screeningData.subCounty || "",
          parish: screeningData.parish || "",
          clientVillage: screeningData.clientVillage || "",
        },
        screeningId: screeningData.screeningId || "",
      });
      return;
    }

    // No glasses — save screening record and client directly
    setSaving(true);
    try {
      const completeData = {
        ...screeningData,
        needsGlasses: false,
        needsReferral: false,
        notes: screeningData.notes || "All vision tests passed. No glasses needed.",
      };

      let savedSuccessfully = false;

      try {
        const result = await apiService.createScreening(completeData);
        if (result.success) {
          savedSuccessfully = true;
        }
      } catch (apiError) {
        console.error("API save failed:", apiError);
        
        // Check if we're actually offline before saving offline
        const isOffline = await checkNetworkConnectivity();
        
        if (isOffline) {
          console.log("Device is offline, saving to offline queue");
          try {
            const offlineQueue = await AsyncStorage.getItem("offlineScreenings");
            const queue = offlineQueue ? JSON.parse(offlineQueue) : [];
            queue.push({
              ...completeData,
              offlineId: Date.now().toString(),
              timestamp: new Date().toISOString(),
            });
            await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
            savedSuccessfully = true;
          } catch (offlineError) {
            console.error("Offline save failed:", offlineError);
          }
        } else {
          console.log("Device is online but API failed - not saving offline");
        }
      }

      if (savedSuccessfully) {
        Alert.alert(
          "✅ Record Saved",
          `Screening for ${screeningData.clientName || "client"} has been saved successfully.`,
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
      } else {
        Alert.alert("Error", "Failed to save record. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleReturnHome = () => {
    resetScreeningData();
    navigation.reset({
      index: 0,
      routes: [{ name: "AppTabs" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#10B981" barStyle="light-content" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={120} color="#10B981" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Screening Complete! 🎉</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {glassesDispensed 
            ? `Reading glasses ${glassesPower} dispensed successfully`
            : "All tests finished successfully"}
        </Text>

        {glassesDispensed && (
          <View style={styles.infoCard}>
            <Ionicons name="glasses" size={32} color="#2E7D32" />
            <Text style={styles.infoText}>
              Glasses power: {glassesPower}
            </Text>
            <Text style={styles.infoSubtext}>
              Inventory has been updated
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Register & Save Button */}
          <TouchableOpacity
            style={[styles.primaryButton, saving && { opacity: 0.7 }]}
            onPress={handleRegisterAndSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="save" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.primaryButtonText}>
              {saving ? "Saving..." : "Register Client & Save Record"}
            </Text>
          </TouchableOpacity>

          {/* Community Follow-up Button */}
          <TouchableOpacity
            style={styles.followUpButton}
            onPress={() => {
              resetScreeningData();
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate("CommunityFollowUp");
              } else {
                navigation.navigate("CommunityFollowUp" as any);
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={24} color="#0891B2" />
            <Text style={styles.followUpButtonText}>Community Follow-up</Text>
          </TouchableOpacity>

          {/* Return Home Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleReturnHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={24} color="#10B981" />
            <Text style={styles.secondaryButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  followUpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFEFF",
    borderWidth: 2,
    borderColor: "#0891B2",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  followUpButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0891B2",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
});
