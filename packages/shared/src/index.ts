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
  | "near"
  | "profile";

export type NearMode = "color" | "words";

export type NearDay = DayEntry & {
  closeness: number;
  entryId: string;
  returnedColor?: ColorReaction;
};

export type SaveEntryRequest = {
  words: [string, string, string];
  colorName: string;
};

export type SaveColorReactionRequest = {
  colorName: string;
};

export type PaletteResponse = {
  colors: PaletteColor[];
};

export type EntriesResponse = {
  entries: DayEntry[];
};

export type EntryResponse = {
  entry: DayEntry;
};

export type NearDaysResponse = {
  days: NearDay[];
};

export type ColorReactionsResponse = {
  reactions: ColorReaction[];
};

export type ColorReactionResponse = {
  reaction: ColorReaction;
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

export const sampleEntry: DayEntry = {
  date: "2026-05-29",
  words: ["雨", "改札", "嘘"],
  colorName: "遠い青",
  colorHex: "#5F7E96",
  textColor: "#FFF9F1",
};

export const sampleEntries: DayEntry[] = [
  { date: "2026-05-01", words: ["朝", "窓", "手紙"], colorName: "朝の白", colorHex: "#F5EFE3", textColor: "#29241F" },
  { date: "2026-05-02", words: ["雨", "傘", "駅"], colorName: "雨の青", colorHex: "#7E9AAE", textColor: "#29241F" },
  { date: "2026-05-04", words: ["熱", "坂", "赤信号"], colorName: "錆びた橙", colorHex: "#A75F3F", textColor: "#FFF9F1" },
  { date: "2026-05-05", words: ["藤", "庭", "沈黙"], colorName: "藤の紫", colorHex: "#B8A9C8", textColor: "#29241F" },
  { date: "2026-05-06", words: ["古本", "線", "午後"], colorName: "古い紙", colorHex: "#E8D7B9", textColor: "#29241F" },
  { date: "2026-05-07", words: ["遠雷", "橋", "返事"], colorName: "遠い青", colorHex: "#5F7E96", textColor: "#FFF9F1" },
  { date: "2026-05-08", words: ["夜", "鍵", "深呼吸"], colorName: "深い黒", colorHex: "#1E1D1A", textColor: "#FFF9F1" },
  { date: "2026-05-09", words: ["桃", "皿", "電話"], colorName: "薄い桃", colorHex: "#E6BAB9", textColor: "#29241F" },
  { date: "2026-05-10", words: ["紫", "階段", "眠り"], colorName: "深い紫", colorHex: "#66516F", textColor: "#FFF9F1" },
  { date: "2026-05-12", words: ["港", "夜", "輪郭"], colorName: "夜の紺", colorHex: "#263E55", textColor: "#FFF9F1" },
  { date: "2026-05-13", words: ["黄", "喫茶", "封筒"], colorName: "乾いた黄", colorHex: "#D7B95F", textColor: "#29241F" },
  { date: "2026-05-14", words: ["桃", "鏡", "午後"], colorName: "くすんだ桃", colorHex: "#C9898B", textColor: "#29241F" },
  { date: "2026-05-15", words: ["土", "靴", "路地"], colorName: "土の茶", colorHex: "#8A6B4E", textColor: "#FFF9F1" },
  { date: "2026-05-16", words: ["煙", "椅子", "帰路"], colorName: "煙の灰", colorHex: "#A9A59D", textColor: "#29241F" },
  { date: "2026-05-17", words: ["若葉", "風", "昼寝"], colorName: "若葉の緑", colorHex: "#A9BD8D", textColor: "#29241F" },
  { date: "2026-05-18", words: ["蜜", "匙", "手紙"], colorName: "蜜の黄", colorHex: "#E4C981", textColor: "#29241F" },
  { date: "2026-05-20", words: ["珈琲", "影", "階段"], colorName: "コーヒー色", colorHex: "#5A4537", textColor: "#FFF9F1" },
  { date: "2026-05-21", words: ["水", "透明", "声"], colorName: "透明な水", colorHex: "#B7D2D3", textColor: "#29241F" },
  { date: "2026-05-22", words: ["苔", "雨戸", "朝"], colorName: "苔の緑", colorHex: "#6F8367", textColor: "#FFF9F1" },
  { date: "2026-05-23", words: ["夕方", "橙", "改札"], colorName: "夕方の橙", colorHex: "#D69A5C", textColor: "#29241F" },
  { date: "2026-05-24", words: ["赤", "手袋", "待合"], colorName: "暗い赤", colorHex: "#6F3B3B", textColor: "#FFF9F1" },
  { date: "2026-05-25", words: ["白", "封筒", "息"], colorName: "朝の白", colorHex: "#F5EFE3", textColor: "#29241F" },
  { date: "2026-05-26", words: ["雨", "線路", "青"], colorName: "雨の青", colorHex: "#7E9AAE", textColor: "#29241F" },
  { date: "2026-05-27", words: ["緑", "沈む", "机"], colorName: "沈んだ緑", colorHex: "#415D52", textColor: "#FFF9F1" },
  { date: "2026-05-28", words: ["錆", "扉", "夕刊"], colorName: "錆びた橙", colorHex: "#A75F3F", textColor: "#FFF9F1" },
  sampleEntry,
  { date: "2026-05-30", words: ["紙", "午後", "窓辺"], colorName: "古い紙", colorHex: "#E8D7B9", textColor: "#29241F" },
  { date: "2026-05-31", words: ["水", "街", "静けさ"], colorName: "透明な水", colorHex: "#B7D2D3", textColor: "#29241F" },
];

export const nearDays: NearDay[] = [
  { entryId: "sample-near-1", date: "2026-05-29", words: ["駅", "傘", "既読"], colorName: "煙の灰", colorHex: "#A9A59D", textColor: "#29241F", closeness: 82 },
  { entryId: "sample-near-2", date: "2026-05-29", words: ["夜", "電車", "沈黙"], colorName: "夜の紺", colorHex: "#263E55", textColor: "#FFF9F1", closeness: 76 },
  { entryId: "sample-near-3", date: "2026-05-29", words: ["嘘", "帰宅", "透明"], colorName: "透明な水", colorHex: "#B7D2D3", textColor: "#29241F", closeness: 69 },
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
