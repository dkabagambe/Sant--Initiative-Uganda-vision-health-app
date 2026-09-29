/**
 * KeyboardAwareFormLayout
 *
 * Shared layout for all multi-step registration and screening forms.
 * Solves two problems in one component:
 *
 *  1. Keyboard covering inputs — KeyboardAvoidingView pushes content up
 *     so the active field is never hidden behind the soft keyboard.
 *
 *  2. Bottom nav-bar buttons hidden — the sticky footer sits outside the
 *     ScrollView and uses useSafeAreaInsets so it clears gesture-nav bars.
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
 * The `footer` prop is optional — omit it for screens with a single "Next"
 * button placed as the last item inside the scroll content.
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
  /** Sticky button row rendered below the scroll area, above the home indicator */
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

  /**
   * Footer height estimate used as scroll bottom padding so the last field
   * is never hidden under the sticky footer. 80px covers a typical two-button
   * row; add extra if your footer is taller.
   */
  const footerHeight = footer ? 80 : 0;
  const bottomPad = footerHeight + Math.max(insets.bottom, 16) + extraScrollPadding;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
    </KeyboardAvoidingView>
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
