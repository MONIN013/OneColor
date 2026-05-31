import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

type ErrorBannerProps = {
  message?: string | null;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={styles.banner}
    >
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryLabel}>再読み込み</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderColor: "#D8B1A0",
    borderRadius: 16,
    backgroundColor: "#FFF5EF",
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  message: {
    color: colors.dangerSoft,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  retry: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceMuted,
  },
  retryLabel: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
  },
});
