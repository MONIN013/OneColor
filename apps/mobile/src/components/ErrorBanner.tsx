import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, surfaces } from "../theme";

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
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8B1A0",
    borderRadius: radii.md,
    backgroundColor: "#FFF4EC",
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  message: {
    flex: 1,
    color: colors.dangerSoft,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  retry: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radii.md,
    paddingHorizontal: 14,
    backgroundColor: surfaces.cardMuted,
  },
  retryLabel: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
  },
});
