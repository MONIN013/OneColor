import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { Screen } from "../src/components/Screen";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { getDateTitle } from "../src/lib/dates";
import { useAppState } from "../src/state/AppState";
import { colors, fonts } from "../src/theme";

export default function PostScreen() {
  const { completeWords, draft, getPendingEntry, saveStatus, setWord } = useAppState();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { returnToDate, returnToDay } = useLocalSearchParams<{
    returnToDate?: string;
    returnToDay?: string;
  }>();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const canReturnToDay = returnToDay === "1";
  const canReturnToDate = typeof returnToDate === "string" && returnToDate.length > 0;
  const canReturn = canReturnToDay || canReturnToDate;
  const completedCount = draft.words.filter((word) => word.trim().length > 0).length;
  const remainingCount = 3 - completedCount;
  const pendingEntry = getPendingEntry(draft.date);
  const progressText = `${completedCount} / 3 ことば`;
  const disabledReason = completeWords
    ? pendingEntry?.status === "conflict"
      ? "未同期の変更があります。記録画面で確認できます。"
      : null
    : remainingCount === 3
      ? "三つのことばを入れると色を選べます。"
      : `あと${remainingCount}語で色を選べます。`;

  const goBack = () => {
    Keyboard.dismiss();

    if (canReturnToDay) {
      router.replace("/(tabs)/day");
      return;
    }

    router.replace({
      pathname: "/day-detail/[date]",
      params: { date: returnToDate ?? draft.date },
    });
  };
  const goColor = () => {
    Keyboard.dismiss();
    router.push("/color");
  };
  const footer = canReturn ? (
    <View style={styles.buttonRow}>
      <AppButton
        icon={<ArrowLeft color={colors.ink} size={17} />}
        kind="secondary"
        onPress={goBack}
        style={styles.backButton}
      >
        戻る
      </AppButton>
      <AppButton
        disabled={!completeWords || saveStatus.loading}
        icon={<Sparkles color={colors.paperElevated} size={18} />}
        onPress={goColor}
        style={styles.primaryButton}
      >
        色を選ぶ
      </AppButton>
    </View>
  ) : (
    <AppButton
      disabled={!completeWords || saveStatus.loading}
      icon={<Sparkles color={colors.paperElevated} size={18} />}
      onPress={goColor}
    >
      色を選ぶ
    </AppButton>
  );

  return (
    <Screen footer={footer}>
      <ScreenHeader
        eyebrow={getDateTitle(draft.date)}
        title="この日の三語"
      />

      <View accessibilityLabel="この日の三語入力" style={styles.wordStack}>
        {draft.words.map((word, index) => {
          const isFocused = focusedIndex === index;
          const isFull = word.length >= 8;
          return (
            <View
              accessibilityLabel={`${index + 1}つ目のことば ${
                word ? "入力済み" : "未入力"
              }${isFocused ? " 入力中" : ""}${isFull ? " 8字まで入力済み" : ""}`}
              style={[
                styles.wordInput,
                word ? styles.wordInputFilled : null,
                isFocused && styles.wordInputFocused,
                isFull && styles.wordInputFull,
              ]}
              key={`word-${index}`}
            >
              <Text maxFontSizeMultiplier={1.15} style={styles.wordNumber}>
                {["一", "二", "三"][index]}
              </Text>
              <TextInput
                accessibilityLabel={`${index + 1}つ目のことば`}
                accessibilityHint={isFull ? "8字まで入力済みです。" : "8字まで入力できます。"}
                blurOnSubmit={index === 2}
                maxLength={8}
                maxFontSizeMultiplier={1.15}
                onBlur={() => setFocusedIndex(null)}
                onChangeText={(value) => setWord(index, value)}
                onFocus={() => setFocusedIndex(index)}
                onSubmitEditing={() => {
                  if (index < 2) {
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
                placeholder="ことば"
                placeholderTextColor="#A99D8F"
                ref={(input) => {
                  inputRefs.current[index] = input;
                }}
                returnKeyType={index === 2 ? "done" : "next"}
                style={styles.textInput}
                value={word}
              />
              <Text
                maxFontSizeMultiplier={1.15}
                style={[styles.wordLimit, isFull && styles.wordLimitFull]}
              >
                {8 - word.length}字まで
              </Text>
            </View>
          );
        })}
      </View>

      <View accessibilityLiveRegion="polite" style={styles.progressRow}>
        <Text style={styles.progressText}>{progressText}</Text>
        {disabledReason ? <Text style={styles.disabledReason}>{disabledReason}</Text> : null}
        {saveStatus.error ? <Text style={styles.saveError}>{saveStatus.error}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wordStack: {
    gap: 12,
  },
  wordInput: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
  },
  wordInputFilled: {
    backgroundColor: "rgba(255,253,248,0.82)",
  },
  wordInputFocused: {
    borderColor: colors.ink,
  },
  wordInputFull: {
    borderColor: colors.primaryDark,
  },
  wordNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    color: colors.inkSubtle,
    fontFamily: fonts.serifHeavy,
    fontSize: 13,
    lineHeight: 28,
    textAlign: "center",
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 28,
  },
  wordLimit: {
    flexShrink: 0,
    color: "#A99D8F",
    fontFamily: fonts.sansBold,
    fontSize: 10,
  },
  wordLimitFull: {
    color: colors.primaryDark,
  },
  progressRow: {
    minHeight: 48,
    justifyContent: "center",
    gap: 4,
    marginTop: 14,
    paddingHorizontal: 2,
  },
  progressText: {
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 13,
  },
  disabledReason: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  saveError: {
    color: colors.dangerSoft,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  backButton: {
    flex: 0.58,
  },
  primaryButton: {
    flex: 1,
  },
});
