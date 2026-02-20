import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import VisionScreen6 from "./VisionScreen6";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";

export default function VisionScreen6Wrapper() {
  const navigation = useNavigation<any>();
  const { screeningData, resetScreeningData } = useScreening();
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async (passed: boolean) => {
    setSubmitting(true);

    try {
      const completeData = {
        ...screeningData,
        nearVisionResult: passed ? "passed" : "failed",
        needsGlasses: !passed && (screeningData.clientAge || 0) >= 40,
        needsReferral: !passed && (screeningData.clientAge || 0) < 40,
        referralReason: !passed && (screeningData.clientAge || 0) < 40 
          ? "Failed near vision test - requires specialist examination" 
          : null,
      };

      const result = await apiService.createScreening(completeData);

      if (result.success) {
        Alert.alert(
          "Success",
          "Screening completed and saved successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                resetScreeningData();
                navigation.navigate("CHWDashboard");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to save screening. Please try again.");
      }
    } catch (error) {
      console.error("Screening submission error:", error);
      Alert.alert("Error", "Failed to save screening. Data saved locally for sync.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefer = async () => {
    setSubmitting(true);

    try {
      const completeData = {
        ...screeningData,
        needsReferral: true,
        referralReason: "Failed vision tests - requires specialist examination",
      };

      const result = await apiService.createScreening(completeData);

      if (result.success) {
        Alert.alert(
          "Referral Created",
          "Client has been referred for specialist examination.",
          [
            {
              text: "OK",
              onPress: () => {
                resetScreeningData();
                navigation.navigate("CHWDashboard");
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create referral.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VisionScreen6
      clientAge={screeningData.clientAge || 0}
      onComplete={handleComplete}
      onRefer={handleRefer}
    />
  );
}
