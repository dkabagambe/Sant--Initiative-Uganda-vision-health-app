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
 *         └── sticky footer — OUTSIDE KeyboardAvoidingView
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
 *       <View style={{ flexDirection: 'row', gap: 12 }}>
 *         <PreviousButton />
 *         <NextButton />
 *       </View>
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

  // Add generous bottom padding so the last field is never hidden under the footer.
  // 80px covers a typical two-button row; insets.bottom clears the gesture bar.
  const footerHeight = footer ? 80 : 0;
  const bottomPad = footerHeight + Math.max(insets.bottom, 16) + extraScrollPadding;

  return (
    // Outer column: scroll area grows, footer sticks at bottom
    <View style={styles.flex}>
      {/*
        iOS:     behavior="padding" — adds bottom padding equal to keyboard height.
        Android: behavior="height" — shrinks the KAV itself when keyboard appears.
                 "height" is more reliable on Android because it does not require
                 knowing the exact header height (keyboardVerticalOffset).

        The footer is OUTSIDE this KAV on both platforms, so the keyboard
        never pushes it upward over the input fields.
      */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={ref}
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: bottomPad }}
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
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
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
    flexDirection: "row",
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 8,
  },
});
