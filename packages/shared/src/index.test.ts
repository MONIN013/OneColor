import { describe, expect, it } from "vitest";
import {
  generateDayPalette,
  generatedPaletteSize,
  isGeneratedColor,
} from "./index";

const words = ["雨", "改札", "朝"] as [string, string, string];

const hexDistance = (a: string, b: string) => {
  const ar = Number.parseInt(a.slice(1, 3), 16);
  const ag = Number.parseInt(a.slice(3, 5), 16);
  const ab = Number.parseInt(a.slice(5, 7), 16);
  const br = Number.parseInt(b.slice(1, 3), 16);
  const bg = Number.parseInt(b.slice(3, 5), 16);
  const bb = Number.parseInt(b.slice(5, 7), 16);
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
};

describe("generateDayPalette", () => {
  it("returns the same 24 colors for the same date and words", () => {
    const first = generateDayPalette({ date: "2026-06-02", words });
    const second = generateDayPalette({ date: "2026-06-02", words });

    expect(first).toEqual(second);
    expect(first).toHaveLength(generatedPaletteSize);
  });

  it("changes when the date or words change", () => {
    const base = generateDayPalette({ date: "2026-06-02", words });
    const nextDate = generateDayPalette({ date: "2026-06-03", words });
    const nextWords = generateDayPalette({
      date: "2026-06-02",
      words: ["雨", "改札", "夜"],
    });

    expect(base.map((color) => color.hex)).not.toEqual(nextDate.map((color) => color.hex));
    expect(base.map((color) => color.hex)).not.toEqual(nextWords.map((color) => color.hex));
  });

  it("returns valid generated colors with distinct swatches", () => {
    const palette = generateDayPalette({ date: "2026-06-02", words });

    for (const color of palette) {
      expect(isGeneratedColor(color)).toBe(true);
      expect(color.label.length).toBeGreaterThan(0);
    }

    for (let index = 0; index < palette.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < palette.length; compareIndex += 1) {
        expect(hexDistance(palette[index]!.hex, palette[compareIndex]!.hex)).toBeGreaterThanOrEqual(56);
      }
    }
  });
});
