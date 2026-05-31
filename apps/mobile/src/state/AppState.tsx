import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ColorReaction, DayEntry, NearDay, NearMode, PaletteColor } from "@onecolor/shared";
import { dayPalette, findPaletteColor, makeEntry } from "@onecolor/shared";
import { api } from "../lib/api";
import { getTodayId, getMonthId, shiftMonthId } from "../lib/dates";
import { getAnonymousUserId } from "../lib/identity";

const draftKey = "onecolor:draft-v2";
const onboardingKey = "onecolor:onboarding-seen";
const dateIdPattern = /^\d{4}-\d{2}-\d{2}$/;

type Draft = {
  colorName: string;
  date: string;
  words: [string, string, string];
};

type OperationStatus = {
  error: string | null;
  loading: boolean;
};

type AppStateValue = {
  anonymousUserId: string | null;
  colors: PaletteColor[];
  completeWords: [string, string, string] | null;
  currentMonth: string;
  draft: Draft;
  entries: DayEntry[];
  entriesByDate: Map<string, DayEntry>;
  entriesStatus: OperationStatus;
  hasSeenOnboarding: boolean;
  nearDays: NearDay[];
  nearMode: NearMode;
  nearStatus: OperationStatus;
  reactionStatus: OperationStatus;
  ready: boolean;
  returnedColorsByDate: Record<string, ColorReaction[]>;
  saveStatus: OperationStatus;
  selectedColor: PaletteColor;
  selectedDate: string;
  todayId: string;
  getEntry: (date: string) => DayEntry | undefined;
  getReturnedColors: (date: string) => ColorReaction[];
  getReturnedColorStatus: (date: string) => OperationStatus;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  markOnboardingSeen: () => Promise<void>;
  refreshEntries: () => Promise<void>;
  refreshNearDays: (mode?: NearMode) => Promise<void>;
  refreshReturnedColors: (date: string) => Promise<void>;
  resetDraft: (nextDraft?: Draft) => Promise<void>;
  returnColor: (entryId: string, colorName: string) => Promise<boolean>;
  saveDraft: () => Promise<boolean>;
  setNearMode: (mode: NearMode) => void;
  setSelectedColor: (color: PaletteColor) => void;
  setSelectedDate: (date: string) => void;
  setWord: (index: number, value: string) => void;
};

const idleStatus: OperationStatus = {
  error: null,
  loading: false,
};

const createDraft = (date: string): Draft => ({
  colorName: "遠い青",
  date,
  words: ["", "", ""],
});

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const normalizeDateId = (value: unknown, fallback: string) =>
  typeof value === "string" && dateIdPattern.test(value) ? value : fallback;

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const todayId = useMemo(getTodayId, []);
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null);
  const [colors, setColors] = useState(dayPalette);
  const [currentMonth, setCurrentMonth] = useState(() => getMonthId(new Date()));
  const [draft, setDraft] = useState<Draft>(() => createDraft(todayId));
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [entriesStatus, setEntriesStatus] = useState<OperationStatus>(idleStatus);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [nearDays, setNearDays] = useState<NearDay[]>([]);
  const [nearMode, setNearMode] = useState<NearMode>("color");
  const [nearStatus, setNearStatus] = useState<OperationStatus>(idleStatus);
  const [reactionStatus, setReactionStatus] = useState<OperationStatus>(idleStatus);
  const [ready, setReady] = useState(false);
  const [returnedColorStatuses, setReturnedColorStatuses] = useState<Record<string, OperationStatus>>({});
  const [returnedColorsByDate, setReturnedColorsByDate] = useState<Record<string, ColorReaction[]>>({});
  const [saveStatus, setSaveStatus] = useState<OperationStatus>(idleStatus);
  const [selectedDate, setSelectedDate] = useState(todayId);

  const entriesByDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  );
  const selectedColor = useMemo(
    () => findPaletteColor(draft.colorName),
    [draft.colorName],
  );
  const completeWords = useMemo(() => {
    const trimmed = draft.words.map((word) => word.trim()) as [
      string,
      string,
      string,
    ];
    return trimmed.every((word) => word.length > 0) ? trimmed : null;
  }, [draft.words]);

  const getEntry = useCallback(
    (date: string) => {
      const apiEntry = entriesByDate.get(date);
      if (apiEntry) {
        return apiEntry;
      }

      if (date === draft.date && completeWords) {
        return makeEntry(draft.date, completeWords, draft.colorName);
      }

      return undefined;
    },
    [completeWords, draft.colorName, draft.date, entriesByDate],
  );
  const getReturnedColors = useCallback(
    (date: string) => returnedColorsByDate[date] ?? [],
    [returnedColorsByDate],
  );
  const getReturnedColorStatus = useCallback(
    (date: string) => returnedColorStatuses[date] ?? idleStatus,
    [returnedColorStatuses],
  );

  const refreshEntries = useCallback(async () => {
    if (!anonymousUserId) {
      return;
    }

    setEntriesStatus({ error: null, loading: true });
    try {
      const [paletteResponse, entriesResponse] = await Promise.all([
        api.palette(anonymousUserId),
        api.entries(anonymousUserId, currentMonth),
      ]);
      setColors(paletteResponse.colors);
      setEntries(entriesResponse.entries);
      setEntriesStatus({ error: null, loading: false });
    } catch (error) {
      setEntriesStatus({
        error: getErrorMessage(error, "APIに接続できませんでした。"),
        loading: false,
      });
    }
  }, [anonymousUserId, currentMonth]);

  const refreshNearDays = useCallback(
    async (mode: NearMode = "color") => {
      if (!anonymousUserId) {
        return;
      }

      setNearStatus({ error: null, loading: true });
      try {
        const response = await api.nearDays(anonymousUserId, selectedDate, mode);
        setNearDays(response.days);
        setNearMode(mode);
        setNearStatus({ error: null, loading: false });
      } catch (error) {
        setNearStatus({
          error: getErrorMessage(error, "似た日を読み込めませんでした。"),
          loading: false,
        });
      }
    },
    [anonymousUserId, selectedDate],
  );

  const refreshReturnedColors = useCallback(
    async (date: string) => {
      if (!anonymousUserId) {
        return;
      }

      setReturnedColorStatuses((current) => ({
        ...current,
        [date]: { error: null, loading: true },
      }));
      try {
        const response = await api.entryReactions(anonymousUserId, date);
        setReturnedColorsByDate((current) => ({
          ...current,
          [date]: response.reactions,
        }));
        setReturnedColorStatuses((current) => ({
          ...current,
          [date]: { error: null, loading: false },
        }));
      } catch (error) {
        setReturnedColorStatuses((current) => ({
          ...current,
          [date]: {
            error: getErrorMessage(error, "返ってきた色を読み込めませんでした。"),
            loading: false,
          },
        }));
      }
    },
    [anonymousUserId],
  );

  const returnColor = useCallback(
    async (entryId: string, colorName: string) => {
      if (!anonymousUserId) {
        return false;
      }

      setReactionStatus({ error: null, loading: true });
      try {
        const response = await api.returnColor(anonymousUserId, entryId, {
          colorName,
        });
        setNearDays((current) =>
          current.map((day) =>
            day.entryId === entryId
              ? {
                  ...day,
                  returnedColor: response.reaction,
                }
              : day,
          ),
        );
        setReactionStatus({ error: null, loading: false });
        return true;
      } catch (error) {
        setReactionStatus({
          error: getErrorMessage(error, "色を返せませんでした。"),
          loading: false,
        });
        return false;
      }
    },
    [anonymousUserId],
  );

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const [userId, savedDraftRaw, onboardingSeen] = await Promise.all([
        getAnonymousUserId(),
        AsyncStorage.getItem(draftKey),
        AsyncStorage.getItem(onboardingKey),
      ]);

      if (!mounted) {
        return;
      }

      if (savedDraftRaw) {
        try {
          const savedDraft = JSON.parse(savedDraftRaw) as Partial<Draft>;
          if (
            Array.isArray(savedDraft.words) &&
            savedDraft.words.length === 3 &&
            typeof savedDraft.colorName === "string"
          ) {
            const date = normalizeDateId(savedDraft.date, todayId);
            setDraft({
              colorName: savedDraft.colorName,
              date,
              words: savedDraft.words.map((word) => String(word).slice(0, 8)) as [
                string,
                string,
                string,
              ],
            });
            setSelectedDate(date);
          }
        } catch {
          await AsyncStorage.removeItem(draftKey);
        }
      }

      setAnonymousUserId(userId);
      setHasSeenOnboarding(onboardingSeen === "true");
      setReady(true);
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [todayId]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    AsyncStorage.setItem(draftKey, JSON.stringify(draft)).catch(() => {});
  }, [draft, ready]);

  useEffect(() => {
    if (ready && anonymousUserId) {
      refreshEntries();
    }
  }, [anonymousUserId, ready, refreshEntries]);

  const setWord = useCallback((index: number, value: string) => {
    setDraft((current) => {
      const words = [...current.words] as [string, string, string];
      words[index] = value.slice(0, 8);
      return { ...current, words };
    });
  }, []);

  const setSelectedColor = useCallback((color: PaletteColor) => {
    setDraft((current) => ({
      ...current,
      colorName: color.name,
    }));
  }, []);

  const goToMonthOffset = useCallback((offset: number) => {
    setCurrentMonth((current) => {
      const nextMonth = shiftMonthId(current, offset);
      setSelectedDate(`${nextMonth}-01`);
      return nextMonth;
    });
  }, []);

  const markOnboardingSeen = useCallback(async () => {
    await AsyncStorage.setItem(onboardingKey, "true");
    setHasSeenOnboarding(true);
  }, []);

  const resetDraft = useCallback(async (nextDraft: Draft = createDraft(todayId)) => {
    setDraft(nextDraft);
    setSelectedDate(nextDraft.date);
    await AsyncStorage.setItem(draftKey, JSON.stringify(nextDraft));
  }, [todayId]);

  const saveDraft = useCallback(async () => {
    if (!anonymousUserId || !completeWords) {
      return false;
    }

    setSaveStatus({ error: null, loading: true });
    try {
      const response = await api.saveEntry(anonymousUserId, draft.date, {
        words: completeWords,
        colorName: draft.colorName,
      });
      setEntries((current) => {
        const next = current.filter((entry) => entry.date !== response.entry.date);
        if (response.entry.date.startsWith(`${currentMonth}-`)) {
          next.push(response.entry);
        }
        return next.sort((a, b) => a.date.localeCompare(b.date));
      });
      setSelectedDate(response.entry.date);
      setSaveStatus({ error: null, loading: false });
      return true;
    } catch (error) {
      setSaveStatus({
        error: getErrorMessage(error, "記録を保存できませんでした。"),
        loading: false,
      });
      return false;
    }
  }, [anonymousUserId, completeWords, currentMonth, draft.colorName, draft.date]);

  const value = useMemo<AppStateValue>(
    () => ({
      anonymousUserId,
      colors,
      completeWords,
      currentMonth,
      draft,
      entries,
      entriesByDate,
      entriesStatus,
      getEntry,
      getReturnedColors,
      getReturnedColorStatus,
      goToNextMonth: () => goToMonthOffset(1),
      goToPreviousMonth: () => goToMonthOffset(-1),
      hasSeenOnboarding,
      markOnboardingSeen,
      nearDays,
      nearMode,
      nearStatus,
      reactionStatus,
      ready,
      refreshEntries,
      refreshNearDays,
      refreshReturnedColors,
      returnedColorsByDate,
      resetDraft,
      returnColor,
      saveDraft,
      saveStatus,
      selectedColor,
      selectedDate,
      setNearMode,
      setSelectedColor,
      setSelectedDate,
      setWord,
      todayId,
    }),
    [
      anonymousUserId,
      colors,
      completeWords,
      currentMonth,
      draft,
      entries,
      entriesByDate,
      entriesStatus,
      getEntry,
      getReturnedColors,
      getReturnedColorStatus,
      goToMonthOffset,
      hasSeenOnboarding,
      markOnboardingSeen,
      nearDays,
      nearMode,
      nearStatus,
      reactionStatus,
      ready,
      refreshEntries,
      refreshNearDays,
      refreshReturnedColors,
      returnedColorsByDate,
      resetDraft,
      returnColor,
      saveDraft,
      saveStatus,
      selectedColor,
      selectedDate,
      setNearMode,
      setSelectedColor,
      setSelectedDate,
      setWord,
      todayId,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
