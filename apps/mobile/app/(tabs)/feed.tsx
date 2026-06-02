import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import type { FeedEntry, PaletteColor } from "@onecolor/shared";
import { AppButton } from "../../src/components/AppButton";
import { DecorativeSwatches } from "../../src/components/DecorativeSwatches";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { Screen } from "../../src/components/Screen";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { getDateTitle } from "../../src/lib/dates";
import { useAppState } from "../../src/state/AppState";
import { colors, fonts, radii, shadowLifted, shadowSoft, surfaces } from "../../src/theme";

export default function FeedScreen() {
  const {
    colors: palette,
    feedEntries,
    feedRequiresEntry,
    feedStatus,
    pendingEntries,
    refreshFeed,
    reactionStatus,
    resetDraft,
    retryPendingEntries,
    returnColor,
    todayId,
  } = useAppState();
  const [replyTarget, setReplyTarget] = useState<FeedEntry | null>(null);
  const pendingEntryList = useMemo(
    () => Object.values(pendingEntries).filter((entry) => entry.status !== "conflict"),
    [pendingEntries],
  );
  const hasPendingEntry = pendingEntryList.length > 0;
  const hasRetryablePendingEntry = pendingEntryList.some(
    (entry) => entry.status === "queued" || entry.status === "failed",
  );

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  const startTodayEntry = async () => {
    await resetDraft({
      colorName: "遠い青",
      date: todayId,
      words: ["", "", ""],
    });
    router.push({
      pathname: "/post",
      params: { returnToDay: "1" },
    });
  };

  const retryPendingAndRefreshFeed = async () => {
    await retryPendingEntries();
    await refreshFeed();
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

  const renderFeedState = () => {
    if (feedRequiresEntry && hasPendingEntry) {
      return (
        <View style={styles.emptyState}>
          <DecorativeSwatches style={styles.emptySwatches} />
          <Text style={styles.emptyTitle}>記録を同期中です。</Text>
          <Text style={styles.emptyText}>同期が終わると、みんなの日を見られます。</Text>
          {hasRetryablePendingEntry ? (
            <AppButton kind="secondary" onPress={retryPendingAndRefreshFeed} style={styles.emptyAction}>
              再同期
            </AppButton>
          ) : null}
        </View>
      );
    }

    if (feedRequiresEntry) {
      return (
        <View style={styles.emptyState}>
          <DecorativeSwatches style={styles.emptySwatches} />
          <Text style={styles.emptyTitle}>記録が必要です。</Text>
          <Text style={styles.emptyText}>記録を残すと、みんなの日を見られます。</Text>
          <AppButton kind="secondary" onPress={startTodayEntry} style={styles.emptyAction}>
            今日を残す
          </AppButton>
        </View>
      );
    }

    if (feedStatus.loading && feedEntries.length === 0) {
      return (
        <View accessibilityLabel="みんなの日を読み込み中" style={styles.loadingState}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.loadingCard}>
              <View style={styles.loadingChip} />
              <View style={styles.loadingCopy}>
                <View style={styles.loadingLineShort} />
                <View style={styles.loadingLineLong} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (feedEntries.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DecorativeSwatches style={styles.emptySwatches} />
          <Text style={styles.emptyTitle}>みんなの日はまだありません。</Text>
          <Text style={styles.emptyText}>他の記録が増えると、ここに表示されます。</Text>
        </View>
      );
    }

    return feedEntries.map((item) => (
      <View key={item.entryId} style={styles.feedCard}>
        <View style={[styles.feedChip, { backgroundColor: item.colorHex }]} />
        <View style={styles.feedCopy}>
          <Text numberOfLines={1} style={styles.feedDate}>
            {getDateTitle(item.date)}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.76}
            numberOfLines={1}
            style={styles.feedWords}
          >
            {formatWords(item.words)}
          </Text>
          <Text numberOfLines={1} style={styles.feedMeta}>
            {item.colorName}
          </Text>
          {item.returnedColor ? (
            <View style={styles.returnedColor}>
              <View
                style={[
                  styles.returnedColorDot,
                  { backgroundColor: item.returnedColor.colorHex },
                ]}
              />
              <Text numberOfLines={1} style={styles.returnedColorText}>
                返した色: {item.returnedColor.colorName}
              </Text>
            </View>
          ) : null}
          <Pressable
            accessibilityLabel={`${getDateTitle(item.date)} ${formatWords(item.words)}に色を返す`}
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
    ));
  };

  return (
    <Screen onRefresh={refreshFeed} refreshing={feedStatus.loading}>
      <ScreenHeader eyebrow="匿名の記録" title="みんなの日" />
      <ErrorBanner message={feedStatus.error} onRetry={refreshFeed} />

      <View style={styles.feedList}>
        {renderFeedState()}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setReplyTarget(null)}
        transparent
        visible={replyTarget !== null}
      >
        <View style={styles.modalBackdrop}>
          <View
            accessibilityLabel="色を返す"
            accessibilityViewIsModal
            style={styles.modalPanel}
          >
            <Text style={styles.modalTitle}>色を返す</Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.76}
              numberOfLines={1}
              style={styles.modalSubtitle}
            >
              {replyTarget ? formatWords(replyTarget.words) : ""}
            </Text>
            <ErrorBanner message={reactionStatus.error} />
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <View accessibilityLabel="返す色を選ぶ" style={styles.modalPalette}>
                {palette.map((color) => {
                  const selected = color.name === replyTarget?.returnedColor?.colorName;
                  return (
                    <Pressable
                      accessibilityLabel={`${color.name}を返す`}
                      accessibilityRole="button"
                      accessibilityState={{ busy: reactionStatus.loading, disabled: reactionStatus.loading, selected }}
                      disabled={reactionStatus.loading}
                      key={color.name}
                      onPress={() => submitReply(color)}
                      style={[
                        styles.modalColorChoice,
                        selected && styles.modalColorChoiceSelected,
                        reactionStatus.loading && styles.modalColorChoiceDisabled,
                      ]}
                    >
                      <View style={[styles.modalColorDot, { backgroundColor: color.hex }]} />
                      <Text
                        adjustsFontSizeToFit
                        minimumFontScale={0.74}
                        numberOfLines={1}
                        style={styles.modalColorName}
                      >
                        {color.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              disabled={reactionStatus.loading}
              onPress={() => setReplyTarget(null)}
              style={[styles.modalCancel, reactionStatus.loading && styles.modalCancelDisabled]}
            >
              <Text style={styles.modalCancelText}>
                {reactionStatus.loading ? "送信中" : "閉じる"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  feedList: {
    gap: 16,
  },
  feedCard: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: surfaces.card,
    ...shadowSoft,
  },
  feedChip: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    flexShrink: 0,
    ...shadowSoft,
  },
  feedCopy: {
    flex: 1,
    minWidth: 0,
  },
  feedDate: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
    marginBottom: 2,
  },
  feedWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 19,
    lineHeight: 27,
  },
  feedMeta: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(41,36,31,0.14)",
  },
  returnedColorText: {
    flex: 1,
    minWidth: 0,
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  replyButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.md,
    backgroundColor: surfaces.primaryWash,
  },
  replyButtonText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
  },
  emptyState: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: surfaces.card,
    ...shadowSoft,
  },
  loadingState: {
    gap: 12,
  },
  loadingCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: surfaces.hairline,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,253,248,0.62)",
  },
  loadingChip: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    flexShrink: 0,
    backgroundColor: "rgba(119,108,97,0.15)",
  },
  loadingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  loadingLineShort: {
    width: "42%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(119,108,97,0.16)",
  },
  loadingLineLong: {
    width: "78%",
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(119,108,97,0.14)",
  },
  emptySwatches: {
    alignSelf: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 20,
    lineHeight: 28,
  },
  emptyText: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    lineHeight: 21,
  },
  emptyAction: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
    backgroundColor: "rgba(41, 36, 31, 0.42)",
  },
  modalPanel: {
    maxHeight: "88%",
    padding: 18,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: colors.paperElevated,
    ...shadowLifted,
  },
  modalTitle: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
  },
  modalSubtitle: {
    marginTop: 4,
    color: colors.inkSubtle,
    fontFamily: fonts.serifHeavy,
    fontSize: 18,
  },
  modalScroll: {
    marginTop: 14,
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modalColorChoice: {
    width: "30.5%",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.md,
    backgroundColor: surfaces.card,
  },
  modalColorChoiceSelected: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  modalColorChoiceDisabled: {
    opacity: 0.62,
  },
  modalColorDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(41,36,31,0.16)",
  },
  modalColorName: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    lineHeight: 15,
  },
  modalCancel: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  modalCancelDisabled: {
    opacity: 0.62,
  },
  modalCancelText: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 13,
  },
});
