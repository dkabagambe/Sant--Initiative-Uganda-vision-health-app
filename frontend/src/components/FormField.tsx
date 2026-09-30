/**
 * FormField
 *
 * Reusable wrapper for every form field: label → input → hint.
 * Provides consistent spacing (marginBottom: 20, gap: 8) across all forms.
 *
 * Usage:
 *
 *   <FormField label="Business Name" required>
 *     <TextInput style={inputStyle} />
 *   </FormField>
 *
 *   <FormField label="Age" required hint="Age determines which tests to perform">
 *     <TextInput style={inputStyle} keyboardType="numeric" />
 *   </FormField>
 *
 *   <FormField label="District">
 *     <TouchableOpacity style={inputStyle}>...</TouchableOpacity>
 *   </FormField>
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  /** Override the default marginBottom (default: 20) */
  marginBottom?: number;
}

export function FormField({
  label,
  required = false,
  hint,
  children,
  marginBottom = 20,
}: FormFieldProps) {
  return (
    <View style={[styles.container, { marginBottom }]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111827",
  },
  required: {
    color: "#EF4444",
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
