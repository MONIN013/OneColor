import { router } from "expo-router";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import { AppButton } from "./AppButton";
import { DecorativeSwatches } from "./DecorativeSwatches";
import { ErrorBanner } from "./ErrorBanner";
import { Screen } from "./Screen";
import { ScreenHeader } from "./ScreenHeader";
import { getDateTitle } from "../lib/dates";
import { useAppState } from "../state/AppState";
import { colors, fonts, radii, shadowLifted, shadowSoft, surfaces } from "../theme";

type DayRecordViewProps = {
  date: string;
  isToday?: boolean;
};

export function DayRecordView({ date, isToday = false }: DayRecordViewProps) {
  const {
    entriesStatus,
    discardPendingEntry,
    getEntry,
    getEntryStatus,
    getPendingEntry,
    getPersistedEntry,
    getReturnedColors,
    getReturnedColorStatus,
    refreshEntries,
    refreshEntry,
    refreshReturnedColors,
    resetDraft,
    retryPendingEntry,
  } = useAppState();
  const entry = getEntry(date);
  const savedEntry = getPersistedEntry(date);
  const pendingEntry = getPendingEntry(date);
  const entryStatus = getEntryStatus(date);
  const returnedColors = getReturnedColors(date);
  const returnedColorStatus = getReturnedColorStatus(date);

  useEffect(() => {
    refreshEntry(date);
  }, [date, refreshEntry]);

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
  const refresh = () => {
    refreshEntry(date);
    refreshEntries();
  };

  return (
    <Screen onRefresh={refresh} refreshing={entriesStatus.loading || entryStatus.loading}>
      <ScreenHeader
        eyebrow={getDateTitle(date)}
        title={isToday ? "今日の記録" : "この日の記録"}
      />
      <ErrorBanner
        message={entryStatus.error ?? entriesStatus.error}
        onRetry={refresh}
      />

      {entryStatus.loading && !entry ? (
        <View accessibilityLabel="この日の記録を読み込み中" style={styles.loadingState}>
          <ActivityIndicator color={colors.ink} />
          <Text style={styles.replyLoadingText}>読み込み中</Text>
        </View>
      ) : null}

      {entry ? (
        <View
          accessibilityLabel={`${entry.colorName} ${formatWords(entry.words)}`}
          style={[styles.dayCard, { backgroundColor: entry.colorHex }]}
        >
          <View
            accessibilityElementsHidden
            style={[
              styles.cardSpecimenCorner,
              { backgroundColor: entry.textColor },
            ]}
          />
          <View style={styles.cardBadge}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.76}
              numberOfLines={1}
              style={[styles.cardColor, { color: entry.textColor }]}
            >
              {entry.colorName}
            </Text>
          </View>
          <View style={styles.cardWordStack}>
            {entry.words.map((word, index) => (
              <Text
                adjustsFontSizeToFit
                key={`${word}-${index}`}
                minimumFontScale={0.68}
                numberOfLines={1}
                style={[styles.cardWord, { color: entry.textColor }]}
              >
                {word}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <View
          accessibilityLabel={`${getDateTitle(date)} まだ記録なし`}
          style={[styles.dayCard, styles.emptyDayCard]}
        >
          <DecorativeSwatches size={58} style={styles.emptySwatches} />
          <Text maxFontSizeMultiplier={1.2} style={styles.emptyTitle}>
            まだ記録なし
          </Text>
          <Text style={styles.emptyCopy}>三つのことばと一つの色を置けます。</Text>
        </View>
      )}

      {pendingEntry ? (
        <View style={styles.syncPanel}>
          <Text style={styles.syncTitle}>
            {pendingEntry.status === "conflict"
              ? "未同期の変更があります"
              : pendingEntry.status === "syncing"
                ? "同期中"
                : pendingEntry.status === "failed"
                  ? "同期できていません"
                  : "同期待ち"}
          </Text>
          <Text style={styles.syncText}>
            {pendingEntry.status === "conflict"
              ? "サーバー側の記録を表示しています。端末の変更はまだ残っています。"
              : pendingEntry.lastError ?? "接続できると自動で同期します。"}
          </Text>
          {pendingEntry.status === "conflict" ? (
            <View style={styles.syncActions}>
              <AppButton
                kind="secondary"
                onPress={() => discardPendingEntry(date)}
                style={styles.syncAction}
              >
                破棄
              </AppButton>
              <AppButton
                onPress={() => retryPendingEntry(date, true)}
                style={styles.syncAction}
              >
                上書き同期
              </AppButton>
            </View>
          ) : pendingEntry.status === "failed" ? (
            <View style={styles.syncActions}>
              <AppButton
                kind="secondary"
                onPress={() => discardPendingEntry(date)}
                style={styles.syncAction}
              >
                破棄
              </AppButton>
              <AppButton
                onPress={() => retryPendingEntry(date)}
                style={styles.syncAction}
              >
                再同期
              </AppButton>
            </View>
          ) : null}
        </View>
      ) : null}

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
                  <Text numberOfLines={1} style={styles.replyChipText}>
                    {reaction.colorName}
                  </Text>
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
    minHeight: 350,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    overflow: "hidden",
    paddingHorizontal: 30,
    paddingVertical: 30,
    borderRadius: radii.specimen,
    ...shadowLifted,
  },
  cardSpecimenCorner: {
    position: "absolute",
    top: -22,
    right: -20,
    width: 96,
    height: 96,
    borderRadius: 26,
    opacity: 0.14,
    transform: [{ rotate: "8deg" }],
  },
  loadingState: {
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyDayCard: {
    justifyContent: "center",
    backgroundColor: surfaces.wash,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
  },
  emptySwatches: {
    marginBottom: 10,
  },
  cardColor: {
    maxWidth: "100%",
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  cardBadge: {
    alignSelf: "flex-start",
    maxWidth: "78%",
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,249,241,0.22)",
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,249,241,0.16)",
  },
  cardWordStack: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cardWord: {
    maxWidth: "100%",
    fontFamily: fonts.serifHeavy,
    fontSize: 46,
    lineHeight: 56,
    textAlign: "center",
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
    padding: 16,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: surfaces.card,
    ...shadowSoft,
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
    maxWidth: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.md,
    backgroundColor: surfaces.card,
  },
  replyDot: {
    width: 20,
    height: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(41,36,31,0.14)",
  },
  replyChipText: {
    flexShrink: 1,
    minWidth: 0,
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
  },
  syncPanel: {
    gap: 8,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.md,
    backgroundColor: surfaces.cardMuted,
  },
  syncTitle: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 13,
  },
  syncText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 19,
  },
  syncActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  syncAction: {
    flex: 1,
    paddingHorizontal: 10,
  },
  postButton: {
    marginTop: 16,
  },
});
