/**
 * KeyboardAwareFormLayout
 *
 * Shared layout for all multi-step registration and screening forms.
 * Solves the "Next button floats up over inputs when keyboard opens" bug.
 *
 * Architecture:
 *   [outer flex column]
 *     ├── KeyboardAvoidingView (flex: 1) — only wraps the scroll area
 *     │     └── ScrollView — form fields scroll, keyboard pushes content up
 *     └── sticky footer — lives OUTSIDE KeyboardAvoidingView so the keyboard
 *           NEVER moves it; it stays pinned at the bottom, above the keyboard,
 *           not on top of inputs.
 *
 * On Android, KeyboardAvoidingView behavior="padding" shrinks the scroll area
 * upward when the keyboard opens, so the focused input scrolls into view.
 * The footer is outside and unaffected — it stays at the bottom edge ABOVE
 * the keyboard (Android's windowSoftInputMode handles that automatically when
 * the footer is outside the KAV).
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
        KeyboardAvoidingView only wraps the ScrollView.
        On iOS "padding" adds bottom padding equal to keyboard height.
        On Android "padding" shrinks the view so content scrolls up into view.
        The footer is outside this view so the keyboard NEVER pushes it up.
      */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
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
            { paddingBottom: Math.max(insets.bottom, 16) },
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
    borderTopColor: "#F0F0F0",
  },
});
