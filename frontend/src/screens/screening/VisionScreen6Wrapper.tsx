import React, { useState } from "react";
import { Alert, SafeAreaView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VisionScreen6 from "./VisionScreen6";
import ScreeningComplete from "./ScreeningComplete";
import ClientRegistration from "./ClientRegistration";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";

export default function VisionScreen6Wrapper() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData, resetScreeningData } = useScreening();
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [completedData, setCompletedData] = useState<any>(null);

  // Debug: Log screening data
  React.useEffect(() => {
    console.log("VisionScreen6Wrapper - Screening Data:", screeningData);
    console.log("Client Age:", screeningData.clientAge);
  }, [screeningData]);

  // Check if referral already needed (from torch test or distance vision failure)
  React.useEffect(() => {
    if (screeningData.needsReferral) {
      if (screeningData.referralStep === "Step 4 - Torch Light Test") {
        // Torch test abnormal - END screening immediately
        handleTorchTestReferral();
      } else if (screeningData.referralStep === "Step 5 - Distance Vision Test") {
        // Distance vision failed - END screening immediately
        handleDistanceVisionReferral();
      }
    }
  }, []);

  const handleTorchTestReferral = async () => {
    setSubmitting(true);

    try {
      const completeData = {
        ...screeningData,
        torchTestPassed: false,
        distanceVisionResult: "not_tested",
        nearVisionResult: "not_tested",
        needsReferral: true,
        needsGlasses: false,
      };

      try {
        const result = await apiService.createScreening(completeData);

        if (result.success) {
          await createReferral(result.data.id, completeData);

          Alert.alert(
            "🏥 Referral Created",
            `Abnormal eye signs detected: ${screeningData.torchTestAbnormalSigns}\n\nClient referred to health facility. No other tests performed.`,
            [
              {
                text: "OK",
                onPress: () => {
                  resetScreeningData();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CHWTabs" }],
                  });
                },
              },
            ]
          );
        } else {
          throw new Error("API error");
        }
      } catch (apiError) {
        const saved = await saveOffline(completeData);
        if (saved) {
          Alert.alert(
            "📱 Referral Saved Offline",
            "Torch test referral saved locally and will sync when online.",
            [
              {
                text: "OK",
                onPress: () => {
                  resetScreeningData();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CHWTabs" }],
                  });
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Referral error:", error);
    } finally {
      setSubmitting(false);
    }
  };


  const handleDistanceVisionReferral = async () => {
    setSubmitting(true);

    try {
      const completeData = {
        ...screeningData,
        distanceVisionResult: "failed",
        nearVisionResult: "not_tested", // Skip near vision
        needsReferral: true,
        needsGlasses: false,
      };

      try {
        const result = await apiService.createScreening(completeData);

        if (result.success) {
          await createReferral(result.data.id, completeData);

          Alert.alert(
            "🏥 Referral Required",
            "Distance vision test failed. Client referred to health facility.\n\nNear vision test was NOT performed (protocol requirement).",
            [
              {
                text: "OK",
                onPress: () => {
                  resetScreeningData();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CHWTabs" }],
                  });
                },
              },
            ]
          );
        } else {
          throw new Error("API error");
        }
      } catch (apiError) {
        const saved = await saveOffline(completeData);
        if (saved) {
          Alert.alert(
            "📱 Referral Saved Offline",
            "Distance vision referral saved locally and will sync when online.",
            [
              {
                text: "OK",
                onPress: () => {
                  resetScreeningData();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CHWTabs" }],
                  });
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Referral error:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
      const clientAge = screeningData.clientAge || 0;
      
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

      // If failed and age < 40, navigate to referral screen with pre-filled data
      setSubmitting(false);
      updateScreeningData({
        nearVisionResult: "failed",
        needsGlasses: false,
        needsReferral: true,
        referralReason: `Near vision problem detected in client under 40 years (age: ${clientAge}) - requires eye examination`,
      });
      
      navigation.navigate("ReferralManagementScreen", {
        autoOpenForm: true,
        prefilledData: {
          clientName: screeningData.clientName,
          clientAge: clientAge,
          clientPhone: screeningData.clientPhone,
          referralReason: `Near vision problem detected in client under 40 years (age: ${clientAge}) - requires eye examination`,
          urgency: "high",
          referralType: "eye-care",
        },
      });
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
                    routes: [{ name: "CHWTabs" }],
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
                    routes: [{ name: "CHWTabs" }],
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
    // Show registration screen
    setShowComplete(false);
    setShowRegistration(true);
  };

  const handleReturnHome = () => {
    resetScreeningData();
    navigation.navigate("CHWDashboard");
  };

  // Show registration screen
  if (showRegistration && screeningId && completedData) {
    return (
      <ClientRegistration
        clientData={completedData}
        screeningId={screeningId}
      />
    );
  }

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
      clientAge={screeningData.clientAge || 0}
      onComplete={handleComplete}
      onRefer={handleRefer}
    />
  );
}
