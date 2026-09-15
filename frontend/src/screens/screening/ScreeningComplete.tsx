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
import {
  moderateScale,
  scale,
  verticalScale,
  fontSize as responsiveFontSize,
} from "../../utils/responsive";
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

  // Route params are the source of truth for glasses data — context may not
  // have flushed yet when this screen first mounts (React state is async).
  const glassesDispensed: boolean = route.params?.glassesDispensed || false;
  const glassesPower: string      = route.params?.glassesPower      || "";
  const glassesFrameType: string  = route.params?.glassesFrameType  || screeningData.glassesFrameType || "";
  const paramNotes: string        = route.params?.notes             || "";

  const saveOffline = async (data: any): Promise<string> => {
    const queue = JSON.parse(
      (await AsyncStorage.getItem("offlineScreenings")) || "[]"
    );
    const offlineId = Date.now().toString();
    queue.push({ ...data, offlineId, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
    return offlineId;
  };

  const handleRegisterAndSave = async () => {
    const clientName   = screeningData.clientName   || "";
    const clientAge    = screeningData.clientAge    ?? 0;
    const clientPhone  = screeningData.clientPhone  || "";
    const clientGender = screeningData.clientGender || "";

    // Build the complete payload — prefer route params over context for glasses fields
    const completeData = {
      ...screeningData,
      clientName,
      clientAge,
      clientPhone,
      clientGender,
      district:        screeningData.district        || "",
      county:          screeningData.county          || "",
      subCounty:       screeningData.subCounty       || "",
      parish:          screeningData.parish          || "",
      clientVillage:   screeningData.clientVillage   || "",
      needsGlasses:    glassesDispensed || Boolean(screeningData.needsGlasses),
      glassesDispensed,
      glassesPower:    glassesPower    || screeningData.glassesPower    || screeningData.recommendedPower || "",
      recommendedPower: glassesPower   || screeningData.recommendedPower || "",
      glassesFrameType: glassesFrameType,
      selectedFrameType: glassesFrameType,
      needsReferral:   Boolean(screeningData.needsReferral),
      notes:           paramNotes || screeningData.notes || "All vision tests completed.",
    };

    setSaving(true);
    try {
      let savedScreeningId: string = "";
      let savedSuccessfully        = false;

      // 1. Try to save to the server
      try {
        const result = await apiService.createScreening(completeData);
        if (result?.success) {
          savedSuccessfully  = true;
          savedScreeningId   = result.screeningId || result.data?.id || "";
        } else {
          // Server returned a non-success response — fall through to offline
          throw new Error(result?.error || "Server returned failure");
        }
      } catch (apiError: any) {
        console.warn("API save failed, falling back to offline queue:", apiError?.message);
        // Always queue offline on any API failure — never silently discard
        try {
          savedScreeningId  = await saveOffline(completeData);
          savedSuccessfully = true;
        } catch (offlineError) {
          console.error("Offline save also failed:", offlineError);
        }
      }

      if (!savedSuccessfully) {
        Alert.alert("Error", "Failed to save screening record. Please try again.");
        return;
      }

      // 2. If glasses were dispensed → go to payment (ClientRegistration)
      if (glassesDispensed) {
        resetScreeningData();
        navigation.navigate("ClientRegistration", {
          clientData: {
            clientName,
            clientAge,
            clientPhone,
            clientGender,
            recommendedPower: glassesPower || screeningData.recommendedPower || "",
            glassesFrameType,
            district:      screeningData.district      || "",
            county:        screeningData.county        || "",
            subCounty:     screeningData.subCounty     || "",
            parish:        screeningData.parish        || "",
            clientVillage: screeningData.clientVillage || "",
          },
          screeningId: savedScreeningId,
        });
        return;
      }

      // 3. No glasses — saved, just confirm and go home
      Alert.alert(
        "✅ Record Saved",
        `Screening for ${clientName || "client"} has been saved successfully.`,
        [
          {
            text: "OK",
            onPress: () => {
              resetScreeningData();
              navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
            },
          },
        ],
      );
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
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
            <Text style={styles.infoText}>Glasses power: {glassesPower}</Text>
            <Text style={styles.infoSubtext}>Inventory has been updated</Text>
          </View>
        )}

        {/* Referral reminder — shown when REFER_EDUCATE was triggered in key questions */}
        {screeningData.needsReferral && !glassesDispensed && screeningData.referralReason && (
          <View style={styles.referralReminderCard}>
            <Ionicons name="alert-circle" size={24} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.referralReminderTitle}>⚠️ Referral Recommended</Text>
              <Text style={styles.referralReminderText}>{screeningData.referralReason}</Text>
              <Text style={styles.referralReminderText}>Complete a VHT Referral Form before the client leaves.</Text>
            </View>
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
              // CommunityFollowUp is registered in ScreeningStack — navigate directly
              navigation.navigate("CommunityFollowUp" as any);
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
  referralReminderCard: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 16,
  },
  referralReminderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  referralReminderText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
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
