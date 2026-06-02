export type PaletteColor = {
  name: string;
  hex: string;
  recommendedText: string;
};

export type DayEntry = {
  date: string;
  words: [string, string, string];
  colorName: string;
  colorHex: string;
  textColor: string;
};

export type PersistedDayEntry = DayEntry & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ColorReaction = {
  id: string;
  entryId: string;
  colorName: string;
  colorHex: string;
  textColor: string;
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
  colorName: string;
  baseUpdatedAt?: string | null;
  clientMutationId?: string;
};

export type SaveColorReactionRequest = {
  colorName: string;
};

export type PaletteResponse = {
  colors: PaletteColor[];
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

export const dayPalette: PaletteColor[] = [
  { name: "朝の白", hex: "#F5EFE3", recommendedText: "#29241F" },
  { name: "古い紙", hex: "#E8D7B9", recommendedText: "#29241F" },
  { name: "薄い灰", hex: "#D8D2CA", recommendedText: "#29241F" },
  { name: "煙の灰", hex: "#A9A59D", recommendedText: "#29241F" },
  { name: "透明な水", hex: "#B7D2D3", recommendedText: "#29241F" },
  { name: "雨の青", hex: "#7E9AAE", recommendedText: "#29241F" },
  { name: "遠い青", hex: "#5F7E96", recommendedText: "#FFF9F1" },
  { name: "夜の紺", hex: "#263E55", recommendedText: "#FFF9F1" },
  { name: "若葉の緑", hex: "#A9BD8D", recommendedText: "#29241F" },
  { name: "苔の緑", hex: "#6F8367", recommendedText: "#FFF9F1" },
  { name: "沈んだ緑", hex: "#415D52", recommendedText: "#FFF9F1" },
  { name: "深い黒", hex: "#1E1D1A", recommendedText: "#FFF9F1" },
  { name: "乾いた黄", hex: "#D7B95F", recommendedText: "#29241F" },
  { name: "蜜の黄", hex: "#E4C981", recommendedText: "#29241F" },
  { name: "夕方の橙", hex: "#D69A5C", recommendedText: "#29241F" },
  { name: "錆びた橙", hex: "#A75F3F", recommendedText: "#FFF9F1" },
  { name: "薄い桃", hex: "#E6BAB9", recommendedText: "#29241F" },
  { name: "くすんだ桃", hex: "#C9898B", recommendedText: "#29241F" },
  { name: "熱の赤", hex: "#B85B51", recommendedText: "#FFF9F1" },
  { name: "暗い赤", hex: "#6F3B3B", recommendedText: "#FFF9F1" },
  { name: "藤の紫", hex: "#B8A9C8", recommendedText: "#29241F" },
  { name: "深い紫", hex: "#66516F", recommendedText: "#FFF9F1" },
  { name: "土の茶", hex: "#8A6B4E", recommendedText: "#FFF9F1" },
  { name: "コーヒー色", hex: "#5A4537", recommendedText: "#FFF9F1" },
];

export const findPaletteColor = (name: string) =>
  dayPalette.find((color) => color.name === name) ?? dayPalette[6];

export const makeEntry = (
  date: string,
  words: [string, string, string],
  colorName: string,
): DayEntry => {
  const color = findPaletteColor(colorName);
  return {
    date,
    words,
    colorName: color.name,
    colorHex: color.hex,
    textColor: color.recommendedText,
  };
};

export const formatWords = (words: [string, string, string]) =>
  words.join(" / ");

export const isKnownColorName = (colorName: string) =>
  dayPalette.some((color) => color.name === colorName);
