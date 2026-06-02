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
import { appStyles, colors, shadowSoft, surfaces } from "../theme";

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
        <View style={[styles.paperFiber, styles.paperFiberTop]} />
        <View style={[styles.paperFiber, styles.paperFiberMid]} />
        <View style={[styles.paperFiber, styles.paperFiberLow]} />
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
    width: "91%",
    maxWidth: 372,
    alignSelf: "center",
  },
  footer: {
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: surfaces.hairline,
    backgroundColor: "rgba(248,241,232,0.96)",
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
  paperFiber: {
    position: "absolute",
    height: 1,
    backgroundColor: surfaces.hairline,
  },
  paperFiberTop: {
    top: 96,
    left: 24,
    right: 18,
  },
  paperFiberMid: {
    top: 312,
    left: -28,
    right: 86,
  },
  paperFiberLow: {
    bottom: 180,
    left: 82,
    right: -34,
  },
});
