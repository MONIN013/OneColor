import { router } from "expo-router";
import { Check, RotateCcw } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import { AppButton } from "../src/components/AppButton";
import { ErrorBanner } from "../src/components/ErrorBanner";
import { Screen } from "../src/components/Screen";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { getDateTitle } from "../src/lib/dates";
import { useAppState } from "../src/state/AppState";
import { colors, fonts, shadow } from "../src/theme";

export default function ColorScreen() {
  const {
    colors: palette,
    completeWords,
    draft,
    entriesStatus,
    refreshEntries,
    saveDraft,
    saveStatus,
    selectedColor,
    setSelectedColor,
    todayId,
  } = useAppState();
  const words = completeWords ?? draft.words;

  const save = async () => {
    const ok = await saveDraft();
    if (ok) {
      if (draft.date === todayId) {
        router.replace("/(tabs)/day");
      } else {
        router.replace({
          pathname: "/day-detail/[date]",
          params: { date: draft.date },
        });
      }
    }
  };

  return (
    <Screen onRefresh={refreshEntries} refreshing={entriesStatus.loading}>
      <ScreenHeader eyebrow={getDateTitle(draft.date)} title="この日に色を置く" />
      <ErrorBanner message={entriesStatus.error} onRetry={refreshEntries} />

      <View style={styles.selectedPreview}>
        <View style={[styles.largeChip, { backgroundColor: selectedColor.hex }]} />
        <View style={styles.previewCopy}>
          <Text style={styles.previewWords}>{formatWords(words)}</Text>
          <Text style={styles.previewMeta}>選択中: {selectedColor.name}</Text>
        </View>
      </View>

      <View style={styles.palettePanel}>
        <View style={styles.panelTitle}>
          <Text style={styles.panelTitleText}>色の地図</Text>
        </View>
        <View accessibilityLabel="24色パレット" style={styles.paletteGrid}>
          {palette.map((color) => {
            const selected = color.name === draft.colorName;
            return (
              <Pressable
                accessibilityLabel={`${color.name}を選ぶ`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={color.name}
                onPress={() => setSelectedColor(color)}
                style={[styles.paletteChoice, selected && styles.paletteChoiceSelected]}
              >
                <View style={[styles.paletteDot, { backgroundColor: color.hex }]} />
                <Text style={styles.paletteName}>{color.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.selectedStrip}>
        <View style={[styles.miniDot, { backgroundColor: selectedColor.hex }]} />
        <Text style={styles.selectedStripText}>選択中: {selectedColor.name}</Text>
      </View>

      <View style={styles.buttonRow}>
        <AppButton
          icon={<RotateCcw color={colors.ink} size={17} />}
          kind="secondary"
          onPress={() => router.back()}
          style={styles.secondaryButton}
        >
          戻る
        </AppButton>
        <AppButton
          busy={saveStatus.loading}
          disabled={!completeWords}
          icon={<Check color={colors.paperElevated} size={18} />}
          onPress={save}
          style={styles.primaryButton}
        >
          この日を残す
        </AppButton>
      </View>
      <ErrorBanner message={saveStatus.error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  selectedPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    ...shadow,
  },
  largeChip: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  previewCopy: {
    flex: 1,
  },
  previewWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
    lineHeight: 30,
  },
  previewMeta: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  palettePanel: {
    marginTop: 18,
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
  },
  panelTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  panelTitleText: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  paletteChoice: {
    width: "31%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 14,
    backgroundColor: "rgba(255,253,248,0.55)",
    padding: 6,
  },
  paletteChoiceSelected: {
    borderColor: colors.ink,
    backgroundColor: "#FFFDF8",
  },
  paletteDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,253,248,0.86)",
  },
  paletteName: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 10,
    lineHeight: 13,
  },
  selectedStrip: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
  },
  miniDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  selectedStripText: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 0.58,
  },
  primaryButton: {
    flex: 1,
  },
});
