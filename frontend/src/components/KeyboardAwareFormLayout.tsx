/**
 * KeyboardAwareFormLayout
 *
 * Shared layout for all multi-step registration and screening forms.
 * Solves the "Next button floats up over inputs when keyboard opens" bug.
 *
 * Architecture:
 *   <SafeAreaView>               ← caller owns this
 *     <Header />                 ← caller owns this
 *     <KeyboardAwareFormLayout>
 *       [outer flex column]
 *         ├── KeyboardAvoidingView (flex: 1)
 *         │     └── ScrollView — form fields, keyboard pushes content up
 *         └── sticky footer — OUTSIDE KeyboardAvoidingView, position absolute
 *               keyboard NEVER moves the footer; it stays docked at the
 *               bottom of the screen, above the system gesture bar.
 *
 * Platform strategy:
 *   iOS     → behavior="padding": KAV adds bottom padding equal to keyboard
 *              height, so the ScrollView shrinks upward and the focused input
 *              stays visible.
 *   Android → behavior="height": KAV shrinks its own height when the keyboard
 *              appears. This is more reliable than "padding" on Android because
 *              "padding" requires an accurate keyboardVerticalOffset (= header
 *              height), which varies per screen. "height" avoids that entirely.
 *
 * The footer is outside the KAV on both platforms, so the keyboard never
 * pushes it up over the inputs.
 *
 * Usage:
 *
 *   <KeyboardAwareFormLayout
 *     footer={
 *       <FormNavBar onNext={handleNext} nextDisabled={!isValid} />
 *     }
 *   >
 *     {/* your form fields here *\/}
 *   </KeyboardAwareFormLayout>
 *
 * Pass `scrollRef` if you need to programmatically scroll (e.g., on focus).
 */

import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeyboardAwareFormLayoutProps {
  children: React.ReactNode;
  /** Sticky button row rendered BELOW the scroll area, pinned above system nav */
  footer?: React.ReactNode;
  /** Extra bottom padding added to the scroll content (default 24) */
  extraScrollPadding?: number;
  /** Pass through so callers can imperatively scroll */
  scrollRef?: React.RefObject<ScrollView>;
}

export const KeyboardAwareFormLayout: React.FC<
  KeyboardAwareFormLayoutProps
> = ({ children, footer, extraScrollPadding = 24, scrollRef }) => {
  const insets = useSafeAreaInsets();
  const internalRef = useRef<ScrollView>(null);
  const ref = scrollRef ?? internalRef;

  // Footer height: paddingTop(12) + button(52) + paddingBottom(34) + border(1) = ~99
  // Add insets.bottom since the footer's paddingBottom already accounts for the gesture bar.
  const footerHeight = footer ? 99 + Math.max(insets.bottom, 0) : 0;
  const bottomPad = footerHeight + extraScrollPadding;

  return (
    // Outer column: scroll area grows, footer sticks at bottom
    <View style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={ref}
          style={styles.flex}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomPad,
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer lives OUTSIDE KeyboardAvoidingView — keyboard never moves it */}
      {footer && (
        <View
          style={[
            styles.footer,
            // paddingBottom = 34 covers gesture bar on all modern Android/iOS devices.
            // On devices with a larger safe area (e.g. iPhone notch bottom), bump it up.
            { paddingBottom: Math.max(insets.bottom + 16, 34) },
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    zIndex: 100,
    elevation: 10,
  },
});
