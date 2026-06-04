export type ColorAlgorithmVersion = "rgb24-v1";

export type GeneratedColor = {
  index: number;
  label: string;
  hex: string;
  textColor: string;
  algorithmVersion: ColorAlgorithmVersion;
};

export type ColorSeed = {
  date: string;
  words: [string, string, string];
  algorithmVersion?: ColorAlgorithmVersion;
};

export type DayEntry = {
  date: string;
  words: [string, string, string];
  colorLabel: string;
  colorHex: string;
  textColor: string;
  colorIndex: number;
  colorAlgorithmVersion: ColorAlgorithmVersion;
};

export type PersistedDayEntry = DayEntry & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ColorReaction = {
  id: string;
  entryId: string;
  colorLabel: string;
  colorHex: string;
  textColor: string;
  colorIndex: number;
  colorAlgorithmVersion: ColorAlgorithmVersion;
  createdAt: string;
  updatedAt: string;
};

export type ScreenId =
  | "onboarding"
  | "post"
  | "color"
  | "calendar"
  | "day"
  | "feed"
  | "profile";

export type FeedEntry = DayEntry & {
  entryId: string;
  createdAt: string;
  returnedColor?: ColorReaction;
};

export type SaveEntryRequest = {
  words: [string, string, string];
  color: GeneratedColor;
  baseUpdatedAt?: string | null;
  clientMutationId?: string;
};

export type SaveColorReactionRequest = {
  color: GeneratedColor;
};

export type EntriesResponse = {
  entries: PersistedDayEntry[];
};

export type EntryResponse = {
  entry: PersistedDayEntry;
};

export type EntryConflictResponse = {
  statusCode: 409;
  message: string;
  entry: PersistedDayEntry;
};

export type FeedResponse = {
  entries: FeedEntry[];
  requiresEntry: boolean;
};

export type ColorReactionsResponse = {
  reactions: ColorReaction[];
};

export type ColorReactionResponse = {
  reaction: ColorReaction;
};

export type ProfileStatsResponse = {
  stats: {
    totalEntries: number;
    totalWords: number;
  };
};

export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

export const semantic = {
  paper: "#F8F1E8",
  paperElevated: "#FFF9F1",
  surfaceMuted: "#F1E7DA",
  ink: "#29241F",
  inkSubtle: "#776C61",
  line: "#E4D7C7",
  primary: "#60766E",
  primaryDark: "#405650",
  dangerSoft: "#A75F3F",
} as const;

export const colorAlgorithmVersion: ColorAlgorithmVersion = "rgb24-v1";
export const generatedPaletteSize = 24;

const inkTextColor = semantic.ink;
const paperTextColor = semantic.paperElevated;
const hueStep = 360 / generatedPaletteSize;

type Rgb = {
  r: number;
  g: number;
  b: number;
};

export const normalizeWords = (words: [string, string, string]) =>
  words.map((word) => word.trim()) as [string, string, string];

export const generateDayPalette = ({
  date,
  words,
  algorithmVersion = colorAlgorithmVersion,
}: ColorSeed): GeneratedColor[] => {
  const normalizedWords = normalizeWords(words);
  const seed = `${date}|${normalizedWords.join("|")}|${algorithmVersion}`;
  const rng = createRng(hashString(seed));
  const baseHue = rng() * 360;
  const colors: GeneratedColor[] = [];

  for (let index = 0; index < generatedPaletteSize; index += 1) {
    let selected: GeneratedColor | null = null;

    for (let attempt = 0; attempt < 18; attempt += 1) {
      const hue = wrapDegrees(
        baseHue + hueStep * index + (rng() - 0.5) * (attempt === 0 ? 8 : 14),
      );
      const saturation = 46 + rng() * 24;
      const lightness = 38 + rng() * 24;
      const rgb = hslToRgb(hue, saturation, lightness);
      const textColor = chooseTextColor(rgb);

      if (
        contrastRatio(rgb, hexToRgb(textColor)) < 4.5 ||
        colors.some((color) => colorDistance(rgb, hexToRgb(color.hex)) < 56)
      ) {
        continue;
      }

      selected = {
        index,
        label: labelForHsl(hue, saturation, lightness),
        hex: rgbToHex(rgb),
        textColor,
        algorithmVersion,
      };
      break;
    }

    if (!selected) {
      for (let attempt = 0; attempt < 48; attempt += 1) {
        const hue = wrapDegrees(baseHue + hueStep * index + (attempt - 24) * 0.8);
        const lightness = [42, 58, 49, 36, 64][attempt % 5]!;
        const saturation = [54, 62, 48, 68][attempt % 4]!;
        const rgb = hslToRgb(hue, saturation, lightness);
        const textColor = chooseTextColor(rgb);
        if (
          contrastRatio(rgb, hexToRgb(textColor)) >= 4.5 &&
          colors.every((color) => colorDistance(rgb, hexToRgb(color.hex)) >= 56)
        ) {
          selected = {
            index,
            label: labelForHsl(hue, saturation, lightness),
            hex: rgbToHex(rgb),
            textColor,
            algorithmVersion,
          };
          break;
        }
      }
    }

    if (!selected) {
      const hue = wrapDegrees(baseHue + hueStep * index);
      const rgb = hslToRgb(hue, 64, 45);
      selected = {
        index,
        label: labelForHsl(hue, 64, 45),
        hex: rgbToHex(rgb),
        textColor: chooseTextColor(rgb),
        algorithmVersion,
      };
    }

    colors.push(selected);
  }

  return colors;
};

export const findGeneratedColor = (
  seed: ColorSeed,
  color: GeneratedColor,
) =>
  generateDayPalette(seed).find(
    (candidate) =>
      candidate.index === color.index &&
      candidate.hex.toUpperCase() === color.hex.toUpperCase() &&
      candidate.label === color.label &&
      candidate.algorithmVersion === color.algorithmVersion,
  );

export const isGeneratedColor = (value: unknown): value is GeneratedColor => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const color = value as Partial<GeneratedColor>;
  return (
    typeof color.index === "number" &&
    Number.isInteger(color.index) &&
    color.index >= 0 &&
    color.index < generatedPaletteSize &&
    typeof color.label === "string" &&
    color.label.length > 0 &&
    typeof color.hex === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(color.hex) &&
    (color.textColor === inkTextColor || color.textColor === paperTextColor) &&
    color.algorithmVersion === colorAlgorithmVersion
  );
};

export const makeEntry = (
  date: string,
  words: [string, string, string],
  color: GeneratedColor,
): DayEntry => ({
  date,
  words,
  colorLabel: color.label,
  colorHex: color.hex.toUpperCase(),
  textColor: color.textColor,
  colorIndex: color.index,
  colorAlgorithmVersion: color.algorithmVersion,
});

export const formatWords = (words: [string, string, string]) =>
  words.join(" / ");

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const wrapDegrees = (value: number) => ((value % 360) + 360) % 360;

const hslToRgb = (hue: number, saturation: number, lightness: number): Rgb => {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const rgbToHex = ({ r, g, b }: Rgb) =>
  `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`.toUpperCase();

const toHexPair = (value: number) =>
  Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");

const hexToRgb = (hex: string): Rgb => ({
  r: Number.parseInt(hex.slice(1, 3), 16),
  g: Number.parseInt(hex.slice(3, 5), 16),
  b: Number.parseInt(hex.slice(5, 7), 16),
});

const chooseTextColor = (rgb: Rgb) =>
  contrastRatio(rgb, hexToRgb(inkTextColor)) >=
  contrastRatio(rgb, hexToRgb(paperTextColor))
    ? inkTextColor
    : paperTextColor;

const contrastRatio = (a: Rgb, b: Rgb) => {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
};

const relativeLuminance = ({ r, g, b }: Rgb) => {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const colorDistance = (a: Rgb, b: Rgb) =>
  Math.sqrt(
    (a.r - b.r) ** 2 +
      (a.g - b.g) ** 2 +
      (a.b - b.b) ** 2,
  );

const labelForHsl = (hue: number, saturation: number, lightness: number) => {
  const base = baseColorName(hue, lightness);
  if (saturation < 52) {
    return `灰みの${base}`;
  }
  if (lightness >= 58) {
    return `淡い${base}`;
  }
  if (lightness <= 42) {
    return `深い${base}`;
  }
  return `澄んだ${base}`;
};

const baseColorName = (hue: number, lightness: number) => {
  if (hue < 18 || hue >= 345) {
    return "赤";
  }
  if (hue < 42) {
    return lightness < 46 ? "茶" : "橙";
  }
  if (hue < 70) {
    return "黄";
  }
  if (hue < 155) {
    return "緑";
  }
  if (hue < 205) {
    return "青緑";
  }
  if (hue < 255) {
    return "青";
  }
  if (hue < 292) {
    return "紫";
  }
  if (hue < 330) {
    return "桃";
  }
  return "赤";
};
