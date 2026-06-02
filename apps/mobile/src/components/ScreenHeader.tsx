import { StyleSheet, Text, View } from "react-native";
import { appStyles, colors, surfaces } from "../theme";

type ScreenHeaderProps = {
  body?: string;
  eyebrow?: string;
  title: string;
};

export function ScreenHeader({ body, eyebrow, title }: ScreenHeaderProps) {
  return (
    <View style={appStyles.header}>
      {eyebrow ? <Text style={appStyles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={appStyles.h1}>{title}</Text>
      {body ? <Text style={appStyles.body}>{body}</Text> : null}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.rule}
      >
        <View style={styles.ruleAccent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rule: {
    height: 1,
    marginTop: 16,
    backgroundColor: surfaces.hairline,
  },
  ruleAccent: {
    width: 44,
    height: 1,
    backgroundColor: colors.primaryDark,
  },
});
