import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { Screen } from "../src/components/Screen";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { getDateTitle } from "../src/lib/dates";
import { useAppState } from "../src/state/AppState";
import { colors, fonts } from "../src/theme";

export default function PostScreen() {
  const { completeWords, draft, saveStatus, setWord } = useAppState();
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
  const progressText = `${completedCount} / 3 ことば`;
  const disabledReason = completeWords
    ? null
    : remainingCount === 3
      ? "三つのことばを入れると色を選べます。"
      : `あと${remainingCount}語で色を選べます。`;

  const goBack = () => {
    if (canReturnToDay) {
      router.replace("/(tabs)/day");
      return;
    }

    router.replace({
      pathname: "/day-detail/[date]",
      params: { date: returnToDate ?? draft.date },
    });
  };

  return (
    <Screen>
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
            style={[
              styles.wordInput,
              word ? styles.wordInputFilled : null,
              isFocused && styles.wordInputFocused,
              isFull && styles.wordInputFull,
            ]}
            key={`word-${index}`}
          >
            <Text style={styles.wordNumber}>{["一", "二", "三"][index]}</Text>
            <TextInput
              accessibilityLabel={`${index + 1}つ目のことば`}
              maxLength={8}
              onBlur={() => setFocusedIndex(null)}
              onChangeText={(value) => setWord(index, value)}
              onFocus={() => setFocusedIndex(index)}
              placeholder="ことば"
              placeholderTextColor="#A99D8F"
              style={styles.textInput}
              value={word}
            />
            <Text style={[styles.wordLimit, isFull && styles.wordLimitFull]}>
              {8 - word.length}字まで
            </Text>
          </View>
        );
        })}
      </View>

      <View accessibilityLiveRegion="polite" style={styles.progressRow}>
        <Text style={styles.progressText}>{progressText}</Text>
        {disabledReason ? <Text style={styles.disabledReason}>{disabledReason}</Text> : null}
      </View>

      {canReturn ? (
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
            onPress={() => router.push("/color")}
            style={styles.primaryButton}
          >
            色を選ぶ
          </AppButton>
        </View>
      ) : (
        <AppButton
          disabled={!completeWords || saveStatus.loading}
          icon={<Sparkles color={colors.paperElevated} size={18} />}
          onPress={() => router.push("/color")}
          style={styles.colorButton}
        >
          色を選ぶ
        </AppButton>
      )}
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
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  backButton: {
    flex: 0.58,
  },
  primaryButton: {
    flex: 1,
  },
  colorButton: {
    marginTop: 20,
  },
});
