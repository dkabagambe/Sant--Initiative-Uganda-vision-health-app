import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  StartScreening: undefined;
  VHTScreeningStep1: undefined;
};

type StartScreeningScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StartScreening"
>;

/**
 * StartScreeningScreen – previously a full info page with a "Start Screening"
 * button. Removed as a duplicate: the dashboard "VHT Eye Screening" quick
 * action already goes straight to Step 1. This component now just redirects
 * immediately so any existing navigation.navigate("StartScreening") calls
 * still work without showing an extra tap.
 */
export default function StartScreeningScreen() {
  const navigation = useNavigation<StartScreeningScreenNavigationProp>();

  useEffect(() => {
    const tabNavigation = navigation.getParent<any>();
    if (tabNavigation) {
      tabNavigation.navigate("Screen", { screen: "VHTScreeningStep1" });
    } else {
      navigation.replace("VHTScreeningStep1" as any);
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FFF8" }}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}
