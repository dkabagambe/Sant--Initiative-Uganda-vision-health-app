/**
 * Shared form styles used across all registration and screening forms.
 * Import these instead of duplicating input/label styles per-screen.
 *
 * Usage:
 *   import { inputStyle, fieldGroupStyle, labelStyle, hintStyle } from '../../constants/styles';
 *
 *   <View style={fieldGroupStyle}>
 *     <Text style={labelStyle}>Business Name <Text style={{color:'#EF4444'}}>*</Text></Text>
 *     <TextInput style={inputStyle} />
 *   </View>
 *
 * Or use the <FormField> component which wraps this automatically.
 */

import { ViewStyle, TextStyle } from "react-native";

/** Standard text input — used for TextInput and Dropdown trigger containers */
export const inputStyle = {
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 14,
  backgroundColor: "#FFFFFF",
  fontSize: 15,
  color: "#111827",
} as const;

/** Wrapper View around each label + input + hint group */
export const fieldGroupStyle: ViewStyle = {
  marginBottom: 20,
};

/** Field label above the input */
export const labelStyle: TextStyle = {
  fontWeight: "600",
  fontSize: 14,
  color: "#111827",
  marginBottom: 8,
};

/** Helper / hint text below the input */
export const hintStyle: TextStyle = {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 4,
};

/** Error text below the input */
export const errorTextStyle: TextStyle = {
  fontSize: 12,
  color: "#EF4444",
  marginTop: 4,
};
