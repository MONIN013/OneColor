import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { generateDayPalette } from "@onecolor/shared";
import { radii, shadowSoft } from "../theme";

const swatchColors = generateDayPalette({
  date: "2026-06-02",
  words: ["雨", "改札", "朝"],
}).slice(0, 3).map((color) => color.hex);

type DecorativeSwatchesProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function DecorativeSwatches({ size = 48, style }: DecorativeSwatchesProps) {
  const step = Math.round(size * 0.72);
  const radius = Math.min(radii.md, Math.round(size * 0.28));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.container, { height: size + 12, width: size + step * 2 }, style]}
    >
      {swatchColors.map((color, index) => (
        <View
          key={color}
          style={[
            styles.swatch,
            {
              backgroundColor: color,
              borderRadius: radius,
              height: size,
              left: step * index,
              top: index === 1 ? 9 : index === 0 ? 3 : 0,
              transform: [{ rotate: index === 0 ? "-2deg" : index === 1 ? "2deg" : "1deg" }],
              width: size,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  swatch: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,253,248,0.52)",
    ...shadowSoft,
  },
});
