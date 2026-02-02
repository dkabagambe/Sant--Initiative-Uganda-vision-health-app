import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { colors } from "../../theme/colors";

export default function OTPScreen() {
  const [otp, setOtp] = useState("");
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to your phone
      </Text>

      <AppInput
        label="OTP Code"
        value={otp}
        onChangeText={setOtp}
        placeholder="123456"
        keyboardType="number-pad"
      />

      <AppButton
        title="Verify & Continue"
        disabled={otp.length < 6}
        onPress={() => navigation.replace("AppTabs", { role })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
