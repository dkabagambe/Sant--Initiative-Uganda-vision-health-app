import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <AppInput label="Full Name" value={name} onChangeText={setName} />

      <AppInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <AppButton title="Submit Registration" />
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
    marginBottom: 16,
  },
});
