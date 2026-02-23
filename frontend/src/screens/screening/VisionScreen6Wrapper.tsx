import React, { useState } from "react";
import { Alert, SafeAreaView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VisionScreen6 from "./VisionScreen6";
import ScreeningComplete from "./ScreeningComplete";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";

export default function VisionScreen6Wrapper() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData, resetScreeningData } = useScreening();
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [completedData, setCompletedData] = useState<any>(null);

  // Debug: Log screening data
  React.useEffect(() => {
    console.log("VisionScreen6Wrapper - Screening Data:", screeningData);
    console.log("Client Age:", screeningData.clientAge);
  }, [screeningData]);

  // Torch test and distance vision referrals are now handled directly
  // in VisionScreen4 and VisionScreen5 by navigating to CreateReferralScreen.

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
      const clientAge = Number(screeningData.clientAge) || 0;
      
      // Check if presbyopia (age 40+ with failed near vision)
      if (!passed && clientAge >= 40) {
        // Navigate to reading glasses selection
        setSubmitting(false);
        navigation.navigate("ReadingGlassesSelection");
        return;
      }

      // If passed, navigate directly to completion screen
      if (passed) {
        setSubmitting(false);
        updateScreeningData({
          nearVisionResult: "passed",
          needsGlasses: false,
          needsReferral: false,
        });
        navigation.navigate("ScreeningComplete", {
          glassesDispensed: false,
          glassesPower: "",
        });
        return;
      }

      // If failed and age < 40, navigate to CreateReferralScreen with pre-filled data
      setSubmitting(false);
      updateScreeningData({
        nearVisionResult: "failed",
        needsGlasses: false,
        needsReferral: true,
        referralReason: `Near vision problem detected in client under 40 years (age: ${clientAge}) - requires eye examination`,
      });

      const referralParams = {
        fromScreening: true,
        clientName: screeningData.clientName || "",
        clientPhone: screeningData.clientPhone || "",
        clientAge: clientAge.toString(),
        clientSex: screeningData.clientGender || "",
        district: screeningData.district || "",
        reason: `Near vision problem detected in client under 40 years (age: ${clientAge}) - requires eye examination`,
        urgency: "high",
        notes: `Referred from Step 6 — Near Vision Test.\nClient age: ${clientAge} (under 40).\nNear vision failed — abnormal for this age group.`,
      };

      // Navigate to root-level CreateReferralScreen
      const root = navigation.getParent()?.getParent();
      if (root) {
        root.navigate("CreateReferralScreen", referralParams);
      } else {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate("CreateReferralScreen", referralParams);
        } else {
          navigation.navigate("CreateReferralScreen" as any, referralParams);
        }
      }
      return;
    } catch (error) {
      console.error("Screening submission error:", error);
      setSubmitting(false);
      Alert.alert(
        "Error", 
        `An unexpected error occurred: ${(error as any)?.message || 'Unknown error'}`,
        [
          {
            text: "OK",
          },
        ]
      );
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
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AppTabs" }],
                  });
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
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AppTabs" }],
                  });
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

  const handleRegisterAndSave = () => {
    // Navigate to registration screen instead of showing it
    navigation.navigate("ClientRegistration", {
      clientData: completedData,
      screeningId: screeningId,
    });
  };

  const handleReturnHome = () => {
    resetScreeningData();
    navigation.navigate("CHWDashboard");
  };

  // Navigate to completion screen when showComplete is true
  React.useEffect(() => {
    if (showComplete && completedData) {
      navigation.navigate("ScreeningComplete", {
        glassesDispensed: completedData?.needsGlasses || false,
        glassesPower: completedData?.recommendedPower || "",
      });
      setShowComplete(false);
    }
  }, [showComplete, completedData]);

  return (
    <VisionScreen6
      clientAge={Number(screeningData.clientAge) || 0}
      onComplete={handleComplete}
      onRefer={handleRefer}
    />
  );
}
