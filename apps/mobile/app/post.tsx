import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { Screen } from "../src/components/Screen";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { getDateTitle } from "../src/lib/dates";
import { useAppState } from "../src/state/AppState";
import { colors, fonts } from "../src/theme";

export default function PostScreen() {
  const { completeWords, draft, setWord } = useAppState();
  const { returnToDay } = useLocalSearchParams<{ returnToDay?: string }>();
  const canReturnToDay = returnToDay === "1";

  return (
    <Screen>
      <ScreenHeader
        eyebrow={getDateTitle(draft.date)}
        title="この日の三語"
      />

      <View accessibilityLabel="この日の三語入力" style={styles.wordStack}>
        {draft.words.map((word, index) => (
          <View style={[styles.wordInput, word ? styles.wordInputFilled : null]} key={`word-${index}`}>
            <Text style={styles.wordNumber}>{["一", "二", "三"][index]}</Text>
            <TextInput
              accessibilityLabel={`${index + 1}つ目のことば`}
              maxLength={8}
              onChangeText={(value) => setWord(index, value)}
              placeholder="ことば"
              placeholderTextColor="#A99D8F"
              style={styles.textInput}
              value={word}
            />
            <Text style={styles.wordLimit}>{8 - word.length}字まで</Text>
          </View>
        ))}
      </View>

      {canReturnToDay ? (
        <View style={styles.buttonRow}>
          <AppButton
            icon={<ArrowLeft color={colors.ink} size={17} />}
            kind="secondary"
            onPress={() => router.replace("/(tabs)/day")}
            style={styles.backButton}
          >
            戻る
          </AppButton>
          <AppButton
            disabled={!completeWords}
            icon={<Sparkles color={colors.paperElevated} size={18} />}
            onPress={() => router.push("/color")}
            style={styles.primaryButton}
          >
            色を選ぶ
          </AppButton>
        </View>
      ) : (
        <AppButton
          disabled={!completeWords}
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
