import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { appStyles, shadowSoft, surfaces } from "../theme";

type ScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, footer, onRefresh, refreshing = false }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={appStyles.root}>
      <View pointerEvents="none" style={styles.paperLayer}>
        <View style={styles.paperBlockTop} />
        <View style={styles.paperBlockBottom} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.shell}
      >
        <View style={styles.shell}>
          <ScrollView
            contentContainerStyle={[
              appStyles.scrollContent,
              footer ? styles.scrollContentWithFooter : null,
            ]}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
            style={styles.scroller}
          >
            <View style={styles.content}>{children}</View>
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
              <View style={styles.content}>{footer}</View>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  scrollContentWithFooter: {
    paddingBottom: 24,
  },
  content: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 438,
    paddingHorizontal: 24,
  },
  footer: {
    alignItems: "center",
    paddingTop: 14,
    backgroundColor: surfaces.footer,
    ...shadowSoft,
  },
  paperLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  paperBlockTop: {
    position: "absolute",
    top: -54,
    left: -28,
    right: 56,
    height: 188,
    borderRadius: 38,
    backgroundColor: surfaces.washCool,
    opacity: 0.62,
    transform: [{ rotate: "-3deg" }],
  },
  paperBlockBottom: {
    position: "absolute",
    right: -48,
    bottom: -74,
    width: 214,
    height: 264,
    borderRadius: 34,
    backgroundColor: surfaces.wash,
    opacity: 0.58,
    transform: [{ rotate: "6deg" }],
  },
});
