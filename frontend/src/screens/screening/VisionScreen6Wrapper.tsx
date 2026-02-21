import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VisionScreen6 from "./VisionScreen6";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";

export default function VisionScreen6Wrapper() {
  const navigation = useNavigation<any>();
  const { screeningData, resetScreeningData } = useScreening();
  const [submitting, setSubmitting] = useState(false);

  const saveOffline = async (data: any) => {
    try {
      const offlineQueue = await AsyncStorage.getItem("offlineScreenings");
      const queue = offlineQueue ? JSON.parse(offlineQueue) : [];
      queue.push({
        ...data,
        offlineId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error("Failed to save offline:", error);
      return false;
    }
  };

  const createReferral = async (screeningId: string, referralData: any) => {
    try {
      // Get nearest facility based on client's district
      const facilitiesResponse = await apiService.getHealthFacilities(screeningData.district);
      const facility = facilitiesResponse.data?.[0]; // Get first/nearest facility

      const referral = await apiService.createReferral({
        screeningId,
        clientName: screeningData.clientName,
        reason: referralData.referralReason,
        urgency: referralData.referralUrgency || "normal",
        facilityName: facility?.name || "Nearest Health Facility",
        facilityLocation: facility?.location || screeningData.district,
        notes: `Referred from ${referralData.referralStep || "screening"}`
      });

      return referral;
    } catch (error) {
      console.error("Failed to create referral:", error);
      return null;
    }
  };

  const handleComplete = async (passed: boolean) => {
    setSubmitting(true);

    try {
      const completeData = {
        ...screeningData,
        nearVisionResult: passed ? "passed" : "failed",
        needsGlasses: !passed && (screeningData.clientAge || 0) >= 40,
        needsReferral: screeningData.needsReferral || (!passed && (screeningData.clientAge || 0) < 40),
        referralReason: screeningData.referralReason || (!passed && (screeningData.clientAge || 0) < 40 
          ? "Failed near vision test - requires specialist examination" 
          : null),
      };

      try {
        const result = await apiService.createScreening(completeData);

        if (result.success) {
          // If referral needed, create it
          if (completeData.needsReferral) {
            await createReferral(result.data.id, completeData);
          }

          Alert.alert(
            "✅ Success",
            completeData.needsReferral 
              ? "Screening completed. Referral created for nearest health facility."
              : "Screening completed and saved successfully!",
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
          throw new Error("API returned error");
        }
      } catch (apiError) {
        // Save offline if API fails
        const saved = await saveOffline(completeData);
        if (saved) {
          Alert.alert(
            "📱 Saved Offline",
            "No internet connection. Screening saved locally and will sync when online.",
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
      }
    } catch (error) {
      console.error("Screening submission error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
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
        referralReason: screeningData.referralReason || "Failed vision tests - requires specialist examination",
        referralUrgency: screeningData.referralUrgency || "normal",
      };

      try {
        const result = await apiService.createScreening(completeData);

        if (result.success) {
          // Create referral with hospital assignment
          const referralResult = await createReferral(result.data.id, completeData);

          Alert.alert(
            "Referral Created",
            referralResult 
              ? `Client referred to ${referralResult.data?.facilityName || "health facility"}`
              : "Client has been referred for specialist examination.",
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
          throw new Error("API returned error");
        }
      } catch (apiError) {
        // Save offline if API fails
        const saved = await saveOffline(completeData);
        if (saved) {
          Alert.alert(
            "📱 Saved Offline",
            "Referral saved locally and will sync when online.",
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
          Alert.alert("Error", "Failed to create referral.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
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
