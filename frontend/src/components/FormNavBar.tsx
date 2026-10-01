/**
 * FormNavBar
 *
 * Sticky bottom navigation bar used on every multi-step form screen.
 * Handles three states:
 *   - First step  : only Next on the right
 *   - Middle step : Prev (outline) on left, Next (solid) on right
 *   - Last step   : Prev on left, Submit (solid) on right
 *
 * Usage:
 *
 *   <FormNavBar
 *     onNext={handleNext}
 *     nextLabel="Next"          // optional, default "Next →"
 *     nextDisabled={!isValid}
 *   />
 *
 *   <FormNavBar
 *     onPrev={handlePrev}
 *     onNext={handleNext}
 *     nextDisabled={!isValid}
 *   />
 *
 *   <FormNavBar
 *     onPrev={handlePrev}
 *     onNext={handleSubmit}
 *     nextLabel="Submit"
 *     nextDisabled={!allChecked || isSubmitting}
 *     nextLoading={isSubmitting}
 *   />
 *
 * Drop this directly into KeyboardAwareFormLayout's footer prop:
 *
 *   <KeyboardAwareFormLayout
 *     footer={<FormNavBar onNext={handleNext} nextDisabled={!isValid} />}
 *   >
 */

import React from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface FormNavBarProps {
  /** Called when Prev is pressed. If omitted, Prev button is hidden. */
  onPrev?: () => void;
  /** Called when Next / Submit is pressed. Required. */
  onNext: () => void;
  /** Label on the right button. Defaults to "Next →" */
  nextLabel?: string;
  /** Disables and dims the Next button */
  nextDisabled?: boolean;
  /** Shows a spinner inside the Next button */
  nextLoading?: boolean;
  /** Label on the left button. Defaults to "← Prev" */
  prevLabel?: string;
  /** Disables the Prev button */
  prevDisabled?: boolean;
}

export function FormNavBar({
  onPrev,
  onNext,
  nextLabel = "Next →",
  nextDisabled = false,
  nextLoading = false,
  prevLabel = "← Prev",
  prevDisabled = false,
}: FormNavBarProps) {
  const hasPrev = !!onPrev;

  return (
    <View style={[styles.row, !hasPrev && styles.rowEnd]}>
      {hasPrev && (
        <Pressable
          style={({ pressed }) => [
            styles.prevButton,
            pressed && styles.pressed,
            prevDisabled && styles.prevDisabled,
          ]}
          onPress={onPrev}
          disabled={prevDisabled}
          accessibilityRole="button"
          accessibilityLabel={prevLabel}
        >
          <Text style={[styles.prevText, prevDisabled && styles.prevTextDisabled]}>
            {prevLabel}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          pressed && styles.pressed,
          (nextDisabled || nextLoading) && styles.nextDisabled,
        ]}
        onPress={onNext}
        disabled={nextDisabled || nextLoading}
        accessibilityRole="button"
        accessibilityLabel={nextLabel}
      >
        {nextLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.nextText}>{nextLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

const GREEN = "#15803D";
const GREEN_DISABLED = "#86EFAC";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  rowEnd: {
    justifyContent: "flex-end",
  },

  /* ── Prev (outline) ── */
  prevButton: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  prevDisabled: {
    borderColor: "#D1D5DB",
  },
  prevText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "700",
  },
  prevTextDisabled: {
    color: "#9CA3AF",
  },

  /* ── Next (solid) ── */
  nextButton: {
    flex: 1,
    height: 52,
    backgroundColor: GREEN,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextDisabled: {
    backgroundColor: GREEN_DISABLED,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.75,
  },
});
