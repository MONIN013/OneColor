import { Text, View } from "react-native";
import { appStyles } from "../theme";

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
    </View>
  );
}
