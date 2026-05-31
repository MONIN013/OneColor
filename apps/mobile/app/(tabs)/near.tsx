import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import type { NearDay, NearMode, PaletteColor } from "@onecolor/shared";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { Screen } from "../../src/components/Screen";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { getDateTitle } from "../../src/lib/dates";
import { useAppState } from "../../src/state/AppState";
import { colors, fonts, shadow } from "../../src/theme";

export default function NearScreen() {
  const {
    apiError,
    colors: palette,
    nearDays,
    nearMode,
    refreshNearDays,
    refreshing,
    returnColor,
    selectedDate,
  } = useAppState();
  const [replyTarget, setReplyTarget] = useState<NearDay | null>(null);

  useEffect(() => {
    refreshNearDays(nearMode);
  }, [refreshNearDays]);

  const selectMode = (mode: NearMode) => {
    refreshNearDays(mode);
  };

  const submitReply = async (color: PaletteColor) => {
    if (!replyTarget) {
      return;
    }

    const ok = await returnColor(replyTarget.entryId, color.name);
    if (ok) {
      setReplyTarget(null);
    }
  };

  return (
    <Screen onRefresh={() => refreshNearDays(nearMode)} refreshing={refreshing}>
      <ScreenHeader eyebrow={getDateTitle(selectedDate)} title="似た日" />
      <ErrorBanner message={apiError} onRetry={() => refreshNearDays(nearMode)} />

      <View accessibilityLabel="似た日の絞り込み" style={styles.filterRow}>
        <FilterPill active={nearMode === "color"} label="色が近い" onPress={() => selectMode("color")} />
        <FilterPill active={nearMode === "words"} label="語が近い" onPress={() => selectMode("words")} />
      </View>

      <View style={styles.nearList}>
        {nearDays.length === 0 ? (
          <Text style={styles.emptyText}>似た日はまだありません。</Text>
        ) : (
          nearDays.map((item) => (
            <View key={item.entryId} style={styles.nearCard}>
              <View style={[styles.nearChip, { backgroundColor: item.colorHex }]} />
              <View style={styles.nearCopy}>
                <Text style={styles.nearWords}>{formatWords(item.words)}</Text>
                <Text style={styles.nearMeta}>
                  {item.colorName} ・ 似ている度{item.closeness}%
                </Text>
                {item.returnedColor ? (
                  <View style={styles.returnedColor}>
                    <View
                      style={[
                        styles.returnedColorDot,
                        { backgroundColor: item.returnedColor.colorHex },
                      ]}
                    />
                    <Text style={styles.returnedColorText}>
                      返した色: {item.returnedColor.colorName}
                    </Text>
                  </View>
                ) : null}
                <Pressable
                  accessibilityLabel={`${formatWords(item.words)}に色を返す`}
                  accessibilityRole="button"
                  onPress={() => setReplyTarget(item)}
                  style={styles.replyButton}
                >
                  <Text style={styles.replyButtonText}>
                    {item.returnedColor ? "色を変える" : "色を返す"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setReplyTarget(null)}
        transparent
        visible={replyTarget !== null}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>色を返す</Text>
            <Text style={styles.modalSubtitle}>
              {replyTarget ? formatWords(replyTarget.words) : ""}
            </Text>
            <View accessibilityLabel="返す色を選ぶ" style={styles.modalPalette}>
              {palette.map((color) => {
                const selected = color.name === replyTarget?.returnedColor?.colorName;
                return (
                  <Pressable
                    accessibilityLabel={`${color.name}を返す`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    disabled={refreshing}
                    key={color.name}
                    onPress={() => submitReply(color)}
                    style={[styles.modalColorChoice, selected && styles.modalColorChoiceSelected]}
                  >
                    <View style={[styles.modalColorDot, { backgroundColor: color.hex }]} />
                    <Text style={styles.modalColorName}>{color.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setReplyTarget(null)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function FilterPill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  pill: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
  },
  pillActive: {
    backgroundColor: colors.ink,
  },
  pillText: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
  },
  pillTextActive: {
    color: colors.paperElevated,
  },
  nearList: {
    gap: 14,
  },
  nearCard: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    backgroundColor: "#FFFDF8",
    ...shadow,
  },
  nearChip: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  nearCopy: {
    flex: 1,
  },
  nearWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 19,
    lineHeight: 27,
  },
  nearMeta: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  returnedColor: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  returnedColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(41,36,31,0.14)",
  },
  returnedColorText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  replyButton: {
    alignSelf: "flex-start",
    minHeight: 32,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  replyButtonText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
  },
  emptyText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
    backgroundColor: "rgba(41,36,31,0.42)",
  },
  modalPanel: {
    maxHeight: "84%",
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    backgroundColor: colors.paperElevated,
  },
  modalTitle: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 24,
    lineHeight: 32,
  },
  modalSubtitle: {
    marginTop: 4,
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  modalPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 16,
  },
  modalColorChoice: {
    width: "31%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 6,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  modalColorChoiceSelected: {
    borderColor: colors.ink,
    backgroundColor: "#FFFDF8",
  },
  modalColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,253,248,0.86)",
  },
  modalColorName: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 10,
    lineHeight: 13,
  },
  modalCancel: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  modalCancelText: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 13,
  },
});
