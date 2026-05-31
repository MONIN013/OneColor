import { router } from "expo-router";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import { AppButton } from "./AppButton";
import { ErrorBanner } from "./ErrorBanner";
import { Screen } from "./Screen";
import { ScreenHeader } from "./ScreenHeader";
import { getDateTitle } from "../lib/dates";
import { useAppState } from "../state/AppState";
import { colors, fonts, shadow } from "../theme";

type DayRecordViewProps = {
  date: string;
  isToday?: boolean;
};

export function DayRecordView({ date, isToday = false }: DayRecordViewProps) {
  const {
    entriesByDate,
    entriesStatus,
    getEntry,
    getReturnedColors,
    getReturnedColorStatus,
    refreshEntries,
    refreshReturnedColors,
    resetDraft,
  } = useAppState();
  const entry = getEntry(date);
  const savedEntry = entriesByDate.get(date);
  const returnedColors = getReturnedColors(date);
  const returnedColorStatus = getReturnedColorStatus(date);

  useEffect(() => {
    if (savedEntry) {
      refreshReturnedColors(date);
    }
  }, [date, refreshReturnedColors, savedEntry]);

  const reset = async () => {
    await resetDraft({
      colorName: entry?.colorName ?? "遠い青",
      date,
      words: entry?.words ?? ["", "", ""],
    });
    router.push({
      pathname: "/post",
      params: isToday ? { returnToDay: "1" } : { returnToDate: date },
    });
  };

  return (
    <Screen onRefresh={refreshEntries} refreshing={entriesStatus.loading}>
      <ScreenHeader
        eyebrow={getDateTitle(date)}
        title={isToday ? "今日の記録" : "この日の記録"}
      />
      <ErrorBanner message={entriesStatus.error} onRetry={refreshEntries} />

      {entry ? (
        <View
          accessibilityLabel={`${entry.colorName} ${formatWords(entry.words)}`}
          style={[styles.dayCard, { backgroundColor: entry.colorHex }]}
        >
          <Text style={[styles.cardColor, { color: entry.textColor }]}>
            {entry.colorName}
          </Text>
          {entry.words.map((word, index) => (
            <Text key={`${word}-${index}`} style={[styles.cardWord, { color: entry.textColor }]}>
              {word}
            </Text>
          ))}
        </View>
      ) : (
        <View
          accessibilityLabel={`${getDateTitle(date)} まだ記録なし`}
          style={[styles.dayCard, styles.emptyDayCard]}
        >
          <Text style={styles.emptyTitle}>まだ記録なし</Text>
          <Text style={styles.emptyCopy}>三つのことばと一つの色を置けます。</Text>
        </View>
      )}

      {savedEntry ? (
        <View accessibilityLabel="返ってきた色" style={styles.replySection}>
          <Text style={styles.replyTitle}>返ってきた色</Text>
          <ErrorBanner
            message={returnedColorStatus.error}
            onRetry={() => refreshReturnedColors(date)}
          />
          {returnedColorStatus.loading ? (
            <View accessibilityLabel="返ってきた色を読み込み中" style={styles.replyLoading}>
              <ActivityIndicator color={colors.ink} />
              <Text style={styles.replyLoadingText}>読み込み中</Text>
            </View>
          ) : returnedColors.length === 0 ? (
            <Text style={styles.replyEmpty}>まだ返ってきた色はありません。</Text>
          ) : (
            <View style={styles.replyList}>
              {returnedColors.map((reaction) => (
                <View key={reaction.id} style={styles.replyChip}>
                  <View style={[styles.replyDot, { backgroundColor: reaction.colorHex }]} />
                  <Text style={styles.replyChipText}>{reaction.colorName}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {entry ? (
        <AppButton
          icon={<RotateCcw color={colors.ink} size={17} />}
          kind="secondary"
          onPress={reset}
          style={styles.postButton}
        >
          もう一度置く
        </AppButton>
      ) : (
        <AppButton kind="secondary" onPress={reset} style={styles.postButton}>
          この日を残す
        </AppButton>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayCard: {
    minHeight: 330,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 34,
    ...shadow,
  },
  emptyDayCard: {
    paddingHorizontal: 28,
    backgroundColor: colors.surfaceMuted,
  },
  cardColor: {
    marginBottom: 18,
    fontFamily: fonts.sansHeavy,
    fontSize: 13,
  },
  cardWord: {
    fontFamily: fonts.serifHeavy,
    fontSize: 42,
    lineHeight: 52,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 28,
    lineHeight: 36,
  },
  emptyCopy: {
    maxWidth: 230,
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
  },
  replySection: {
    marginTop: 26,
  },
  replyTitle: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 18,
    marginBottom: 12,
  },
  replyEmpty: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  replyLoading: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  replyLoadingText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  replyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  replyChip: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
  },
  replyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(41,36,31,0.14)",
  },
  replyChipText: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
  },
  postButton: {
    marginTop: 16,
  },
});
