import React, { useState } from "react";
import { Alert, SafeAreaView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VisionScreen6 from "./VisionScreen6";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";

export default function VisionScreen6Wrapper() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData, resetScreeningData } =
    useScreening();
  const [submitting, setSubmitting] = useState(false);

  // Clear submitting state when screening context is reset
  React.useEffect(() => {
    if (Object.keys(screeningData).length === 0) {
      setSubmitting(false);
    }
  }, [screeningData]);

  // Torch test and distance vision referrals are handled directly
  // in VisionScreen4 and VisionScreen5 by navigating to CreateReferralScreen.

  const saveOffline = async (data: any) => {
    try {
      const queue = JSON.parse(
        (await AsyncStorage.getItem("offlineScreenings")) || "[]"
      );
      queue.push({ ...data, offlineId: Date.now().toString(), timestamp: new Date().toISOString() });
      await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
    } catch (e) {
      console.error("Offline save failed:", e);
    }
  };

  const handleComplete = async (passed: boolean) => {
    setSubmitting(true);

    try {
      const clientAge = Number(screeningData.clientAge) || 0;

      // Check if presbyopia (age 40+ with failed near vision)
      if (!passed && clientAge >= 40) {
        // Navigate to VHT Reading Glasses screen (full VHT protocol)
        setSubmitting(false);
        updateScreeningData({ nearVisionResult: "failed", needsGlasses: true });
        navigation.navigate("VHTReadingGlasses");
        return;
      }

      // If passed, proceed to Step 7: Manage Normal Eye Findings
      if (passed) {
        setSubmitting(false);
        updateScreeningData({
          nearVisionResult: "passed",
          needsGlasses: false,
          needsReferral: false,
        });
        navigation.navigate("VHTNormalFindings");
        return;
      }

      // If failed and age < 40, save screening then navigate to CreateReferralScreen
      const failedData = {
        ...screeningData,
        nearVisionResult: "failed",
        needsGlasses: false,
        needsReferral: true,
        referralReason: `Near vision problem detected in client under 40 years (age: ${clientAge}) - requires eye examination`,
        referralStep: "Step 6 - Near Vision Test",
      };

      updateScreeningData(failedData);

      // Save screening record first
      let savedScreeningId: string | null = null;
      try {
        const result = await apiService.createScreening(failedData);
        if (result.success) {
          savedScreeningId = result.data?.id || result.screeningId || null;
        }
      } catch (err) {
        console.error("Failed to save screening, saving offline:", err);
        await saveOffline(failedData);
      }

      setSubmitting(false);

      const referralParams = {
        fromScreening: true,
        screeningId: savedScreeningId,
        clientName: screeningData.clientName || "",
        clientPhone: screeningData.clientPhone || "",
        clientAge: clientAge.toString(),
        clientSex: screeningData.clientGender || "",
        district: screeningData.district || "",
        county: screeningData.county || "",
        subCounty: screeningData.subCounty || "",
        parish: screeningData.parish || "",
        reason: failedData.referralReason,
        urgency: "high",
        notes: `Referred from Step 6 — Near Vision Test.\nClient age: ${clientAge} (under 40).\nNear vision failed — abnormal for this age group.`,
      };

      // From ScreeningStack: getParent() = CHWTabs, getParent().getParent() = Root Stack
      const root = navigation.getParent()?.getParent();
      if (root) {
        root.navigate("CreateReferralScreen", referralParams);
      } else {
        navigation.navigate("CreateReferralScreen" as any, referralParams);
      }
      return;
    } catch (error) {
      console.error("Screening submission error:", error);
      setSubmitting(false);
      Alert.alert(
        "Error",
        `An unexpected error occurred: ${(error as any)?.message || "Unknown error"}`,
        [
          {
            text: "OK",
          },
        ],
      );
    }
  };

  const handleRefer = async () => {
    // Legacy path — referrals are now handled directly in handleComplete
    // keeping this as a no-op prop to satisfy VisionScreen6's onRefer prop
  };

  return (
    <VisionScreen6
      clientAge={Number(screeningData.clientAge) || 0}
      onComplete={handleComplete}
      onRefer={handleRefer}
    />
  );
}
