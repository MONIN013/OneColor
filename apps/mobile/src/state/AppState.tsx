import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState as NativeAppState } from "react-native";
import type {
  ColorReaction,
  DayEntry,
  EntryConflictResponse,
  FeedEntry,
  PaletteColor,
  PersistedDayEntry,
  ProfileStatsResponse,
} from "@onecolor/shared";
import { dayPalette, findPaletteColor, makeEntry } from "@onecolor/shared";
import { ApiRequestError, api } from "../lib/api";
import { getTodayId, getMonthId, shiftMonthId } from "../lib/dates";
import { getAnonymousUserId } from "../lib/identity";
import {
  type Draft,
  type PendingEntry,
  isDraftEmpty,
  isRetryableStatus,
  normalizePendingEntries,
  removePendingEntry,
  rolloverEmptyDraft,
  upsertPendingEntry,
} from "./sync";

const draftKey = "onecolor:draft-v2";
const onboardingKey = "onecolor:onboarding-seen";
const pendingEntriesKey = "onecolor:pending-entries-v1";
const dateIdPattern = /^\d{4}-\d{2}-\d{2}$/;

type OperationStatus = {
  error: string | null;
  loading: boolean;
};

type ProfileStats = ProfileStatsResponse["stats"];

type AppStateValue = {
  anonymousUserId: string | null;
  colors: PaletteColor[];
  completeWords: [string, string, string] | null;
  currentMonth: string;
  draft: Draft;
  entries: PersistedDayEntry[];
  entriesByDate: Map<string, PersistedDayEntry>;
  entriesStatus: OperationStatus;
  feedEntries: FeedEntry[];
  feedRequiresEntry: boolean;
  feedStatus: OperationStatus;
  hasSeenOnboarding: boolean;
  pendingEntries: Record<string, PendingEntry>;
  profileStats: ProfileStats;
  profileStatsStatus: OperationStatus;
  reactionStatus: OperationStatus;
  ready: boolean;
  returnedColorsByDate: Record<string, ColorReaction[]>;
  saveStatus: OperationStatus;
  selectedColor: PaletteColor;
  selectedDate: string;
  todayId: string;
  discardPendingEntry: (date: string) => Promise<void>;
  getEntry: (date: string) => DayEntry | undefined;
  getEntryStatus: (date: string) => OperationStatus;
  getPendingEntry: (date: string) => PendingEntry | undefined;
  getPersistedEntry: (date: string) => PersistedDayEntry | undefined;
  getReturnedColors: (date: string) => ColorReaction[];
  getReturnedColorStatus: (date: string) => OperationStatus;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  markOnboardingSeen: () => Promise<void>;
  refreshEntries: () => Promise<void>;
  refreshEntry: (date: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
  refreshProfileStats: () => Promise<void>;
  refreshReturnedColors: (date: string) => Promise<void>;
  resetDraft: (nextDraft?: Draft) => Promise<void>;
  retryPendingEntry: (date: string, forceOverwrite?: boolean) => Promise<boolean>;
  retryPendingEntries: () => Promise<void>;
  returnColor: (entryId: string, colorName: string) => Promise<boolean>;
  saveDraft: () => Promise<boolean>;
  setSelectedColor: (color: PaletteColor) => void;
  setSelectedDate: (date: string) => void;
  setWord: (index: number, value: string) => void;
};

const idleStatus: OperationStatus = {
  error: null,
  loading: false,
};

const emptyStats: ProfileStats = {
  totalEntries: 0,
  totalWords: 0,
};

const createDraft = (date: string): Draft => ({
  colorName: "遠い青",
  date,
  words: ["", "", ""],
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) {
    return fallback;
  }

  return error.message === "Failed to fetch" ? fallback : error.message;
};

const normalizeDateId = (value: unknown, fallback: string) =>
  typeof value === "string" && dateIdPattern.test(value) ? value : fallback;

const createMutationId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;

const getConflictEntry = (error: unknown) => {
  if (!(error instanceof ApiRequestError) || error.status !== 409) {
    return null;
  }

  const body = error.body as Partial<EntryConflictResponse> | undefined;
  return body?.entry ?? null;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [todayId, setTodayId] = useState(() => getTodayId());
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null);
  const [colors, setColors] = useState(dayPalette);
  const [currentMonth, setCurrentMonth] = useState(() => getMonthId(new Date()));
  const [draft, setDraft] = useState<Draft>(() => createDraft(todayId));
  const [entryCache, setEntryCache] = useState<Record<string, PersistedDayEntry>>({});
  const [entryStatuses, setEntryStatuses] = useState<Record<string, OperationStatus>>({});
  const [entriesStatus, setEntriesStatus] = useState<OperationStatus>(idleStatus);
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);
  const [feedRequiresEntry, setFeedRequiresEntry] = useState(false);
  const [feedStatus, setFeedStatus] = useState<OperationStatus>(idleStatus);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<Record<string, PendingEntry>>({});
  const [profileStats, setProfileStats] = useState<ProfileStats>(emptyStats);
  const [profileStatsStatus, setProfileStatsStatus] = useState<OperationStatus>(idleStatus);
  const [reactionStatus, setReactionStatus] = useState<OperationStatus>(idleStatus);
  const [ready, setReady] = useState(false);
  const [returnedColorStatuses, setReturnedColorStatuses] = useState<Record<string, OperationStatus>>({});
  const [returnedColorsByDate, setReturnedColorsByDate] = useState<Record<string, ColorReaction[]>>({});
  const [saveStatus, setSaveStatus] = useState<OperationStatus>(idleStatus);
  const [selectedDate, setSelectedDate] = useState(todayId);

  const entries = useMemo(
    () =>
      Object.values(entryCache)
        .filter((entry) => entry.date.startsWith(`${currentMonth}-`))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [currentMonth, entryCache],
  );
  const entriesByDate = useMemo(
    () => new Map(Object.values(entryCache).map((entry) => [entry.date, entry])),
    [entryCache],
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

  const upsertEntryCache = useCallback((entry: PersistedDayEntry) => {
    setEntryCache((current) => ({
      ...current,
      [entry.date]: entry,
    }));
  }, []);

  const getPersistedEntry = useCallback(
    (date: string) => entriesByDate.get(date),
    [entriesByDate],
  );

  const getPendingEntry = useCallback(
    (date: string) => pendingEntries[date],
    [pendingEntries],
  );

  const getEntry = useCallback(
    (date: string) => {
      const pendingEntry = pendingEntries[date];
      if (pendingEntry && pendingEntry.status !== "conflict") {
        return makeEntry(pendingEntry.date, pendingEntry.words, pendingEntry.colorName);
      }

      const apiEntry = entriesByDate.get(date);
      if (apiEntry) {
        return apiEntry;
      }

      if (date === draft.date && completeWords) {
        return makeEntry(draft.date, completeWords, draft.colorName);
      }

      return undefined;
    },
    [completeWords, draft.colorName, draft.date, entriesByDate, pendingEntries],
  );

  const getEntryStatus = useCallback(
    (date: string) => entryStatuses[date] ?? idleStatus,
    [entryStatuses],
  );

  const getReturnedColors = useCallback(
    (date: string) => returnedColorsByDate[date] ?? [],
    [returnedColorsByDate],
  );
  const getReturnedColorStatus = useCallback(
    (date: string) => returnedColorStatuses[date] ?? idleStatus,
    [returnedColorStatuses],
  );

  const refreshProfileStats = useCallback(async () => {
    if (!anonymousUserId) {
      return;
    }

    setProfileStatsStatus({ error: null, loading: true });
    try {
      const response = await api.profileStats(anonymousUserId);
      setProfileStats(response.stats);
      setProfileStatsStatus({ error: null, loading: false });
    } catch (error) {
      setProfileStatsStatus({
        error: getErrorMessage(error, "プロフィール情報を読み込めませんでした。"),
        loading: false,
      });
    }
  }, [anonymousUserId]);

  const refreshEntry = useCallback(
    async (date: string) => {
      if (!anonymousUserId) {
        return;
      }

      setEntryStatuses((current) => ({
        ...current,
        [date]: { error: null, loading: true },
      }));
      try {
        const response = await api.entry(anonymousUserId, date);
        upsertEntryCache(response.entry);
        setEntryStatuses((current) => ({
          ...current,
          [date]: { error: null, loading: false },
        }));
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          setEntryCache((current) => {
            const next = { ...current };
            delete next[date];
            return next;
          });
          setEntryStatuses((current) => ({
            ...current,
            [date]: { error: null, loading: false },
          }));
          return;
        }

        setEntryStatuses((current) => ({
          ...current,
          [date]: {
            error: getErrorMessage(error, "この日の記録を読み込めませんでした。"),
            loading: false,
          },
        }));
      }
    },
    [anonymousUserId, upsertEntryCache],
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
      setEntryCache((current) => {
        const next = { ...current };
        for (const entry of entriesResponse.entries) {
          next[entry.date] = entry;
        }
        return next;
      });
      setEntriesStatus({ error: null, loading: false });
    } catch (error) {
      setEntriesStatus({
        error: getErrorMessage(error, "APIに接続できませんでした。"),
        loading: false,
      });
    }
  }, [anonymousUserId, currentMonth]);

  const refreshFeed = useCallback(async () => {
    if (!anonymousUserId) {
      return;
    }

    setFeedStatus({ error: null, loading: true });
    try {
      const response = await api.feed(anonymousUserId);
      setFeedEntries(response.entries);
      setFeedRequiresEntry(response.requiresEntry);
      setFeedStatus({ error: null, loading: false });
    } catch (error) {
      setFeedStatus({
        error: getErrorMessage(error, "みんなの日を読み込めませんでした。"),
        loading: false,
      });
    }
  }, [anonymousUserId]);

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

  const retryPendingEntry = useCallback(
    async (date: string, forceOverwrite = false) => {
      const pendingEntry = pendingEntries[date];
      if (!anonymousUserId || !pendingEntry) {
        return false;
      }

      setPendingEntries((current) =>
        upsertPendingEntry(current, {
          ...pendingEntry,
          lastError: undefined,
          status: "syncing",
        }),
      );

      try {
        const response = await api.saveEntry(anonymousUserId, pendingEntry.date, {
          words: pendingEntry.words,
          colorName: pendingEntry.colorName,
          baseUpdatedAt: forceOverwrite ? null : pendingEntry.baseUpdatedAt,
          clientMutationId: pendingEntry.clientMutationId,
        });
        upsertEntryCache(response.entry);
        setPendingEntries((current) => removePendingEntry(current, pendingEntry.date));
        await refreshProfileStats();
        return true;
      } catch (error) {
        const conflictEntry = getConflictEntry(error);
        if (conflictEntry) {
          upsertEntryCache(conflictEntry);
          setPendingEntries((current) =>
            upsertPendingEntry(current, {
              ...pendingEntry,
              lastError: "サーバー側で更新されています。",
              serverEntry: conflictEntry,
              status: "conflict",
            }),
          );
          return false;
        }

        setPendingEntries((current) =>
          upsertPendingEntry(current, {
            ...pendingEntry,
            lastError: getErrorMessage(error, "同期できませんでした。"),
            status: "failed",
          }),
        );
        return false;
      }
    },
    [anonymousUserId, pendingEntries, refreshProfileStats, upsertEntryCache],
  );

  const retryPendingEntries = useCallback(async () => {
    const retryableEntries = Object.values(pendingEntries).filter(
      (entry) => entry.status === "queued" || entry.status === "failed",
    );
    for (const entry of retryableEntries) {
      await retryPendingEntry(entry.date);
    }
  }, [pendingEntries, retryPendingEntry]);

  const discardPendingEntry = useCallback(async (date: string) => {
    setPendingEntries((current) => removePendingEntry(current, date));
  }, []);

  const queuePendingEntry = useCallback((entry: PendingEntry) => {
    setPendingEntries((current) => upsertPendingEntry(current, entry));
  }, []);

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
        setFeedEntries((current) =>
          current.map((entry) =>
            entry.entryId === entryId
              ? {
                  ...entry,
                  returnedColor: response.reaction,
                }
              : entry,
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
      const [userId, savedDraftRaw, onboardingSeen, pendingEntriesRaw] = await Promise.all([
        getAnonymousUserId(),
        AsyncStorage.getItem(draftKey),
        AsyncStorage.getItem(onboardingKey),
        AsyncStorage.getItem(pendingEntriesKey),
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
            const restoredDraft = {
              colorName: savedDraft.colorName,
              date,
              words: savedDraft.words.map((word) => String(word).slice(0, 8)) as [
                string,
                string,
                string,
              ],
            };
            const nextDraft =
              date !== todayId && isDraftEmpty(restoredDraft)
                ? createDraft(todayId)
                : restoredDraft;
            setDraft(nextDraft);
            setSelectedDate(nextDraft.date);
          }
        } catch {
          await AsyncStorage.removeItem(draftKey);
        }
      }

      if (pendingEntriesRaw) {
        try {
          setPendingEntries(normalizePendingEntries(JSON.parse(pendingEntriesRaw)));
        } catch {
          await AsyncStorage.removeItem(pendingEntriesKey);
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
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    AsyncStorage.setItem(draftKey, JSON.stringify(draft)).catch(() => {});
  }, [draft, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    AsyncStorage.setItem(
      pendingEntriesKey,
      JSON.stringify(Object.values(pendingEntries)),
    ).catch(() => {});
  }, [pendingEntries, ready]);

  useEffect(() => {
    if (ready && anonymousUserId) {
      refreshEntries();
      refreshProfileStats();
    }
  }, [anonymousUserId, ready, refreshEntries, refreshProfileStats]);

  useEffect(() => {
    if (!ready || !anonymousUserId) {
      return;
    }

    retryPendingEntries();
  }, [anonymousUserId, ready]);

  useEffect(() => {
    const subscription = NativeAppState.addEventListener("change", (state) => {
      if (state !== "active") {
        return;
      }

      const nextTodayId = getTodayId();
      setTodayId((previousTodayId) => {
        if (previousTodayId === nextTodayId) {
          return previousTodayId;
        }

        setDraft((current) => rolloverEmptyDraft(current, previousTodayId, nextTodayId));
        setSelectedDate((current) =>
          current === previousTodayId ? nextTodayId : current,
        );
        setCurrentMonth(getMonthId(new Date()));
        return nextTodayId;
      });

      if (anonymousUserId) {
        refreshEntries();
        refreshProfileStats();
        retryPendingEntries();
      }
    });

    return () => subscription.remove();
  }, [anonymousUserId, refreshEntries, refreshProfileStats, retryPendingEntries]);

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

    const persistedEntry = entriesByDate.get(draft.date);
    const clientMutationId = createMutationId();
    const pendingEntry: PendingEntry = {
      baseUpdatedAt: persistedEntry?.updatedAt ?? null,
      clientMutationId,
      colorName: draft.colorName,
      date: draft.date,
      queuedAt: new Date().toISOString(),
      status: "queued",
      words: completeWords,
    };

    setSaveStatus({ error: null, loading: true });
    try {
      const response = await api.saveEntry(anonymousUserId, draft.date, {
        words: completeWords,
        colorName: draft.colorName,
        baseUpdatedAt: pendingEntry.baseUpdatedAt,
        clientMutationId,
      });
      upsertEntryCache(response.entry);
      setPendingEntries((current) => removePendingEntry(current, response.entry.date));
      setSelectedDate(response.entry.date);
      setSaveStatus({ error: null, loading: false });
      await refreshProfileStats();
      return true;
    } catch (error) {
      const conflictEntry = getConflictEntry(error);
      if (conflictEntry) {
        upsertEntryCache(conflictEntry);
        queuePendingEntry({
          ...pendingEntry,
          lastError: "サーバー側で更新されています。",
          serverEntry: conflictEntry,
          status: "conflict",
        });
        setSelectedDate(draft.date);
        setSaveStatus({
          error: "サーバー側で更新されています。内容を確認してください。",
          loading: false,
        });
        return false;
      }

      const retryable =
        !(error instanceof ApiRequestError) || isRetryableStatus(error.status);
      if (retryable) {
        queuePendingEntry({
          ...pendingEntry,
          lastError: getErrorMessage(error, "通信できませんでした。"),
          status: "failed",
        });
        setSelectedDate(draft.date);
        setSaveStatus({
          error: "通信できないため端末に保存しました。接続後に同期します。",
          loading: false,
        });
        return true;
      }

      setSaveStatus({
        error: getErrorMessage(error, "記録を保存できませんでした。"),
        loading: false,
      });
      return false;
    }
  }, [
    anonymousUserId,
    completeWords,
    draft.colorName,
    draft.date,
    entriesByDate,
    queuePendingEntry,
    refreshProfileStats,
    upsertEntryCache,
  ]);

  const value = useMemo<AppStateValue>(
    () => ({
      anonymousUserId,
      colors,
      completeWords,
      currentMonth,
      discardPendingEntry,
      draft,
      entries,
      entriesByDate,
      entriesStatus,
      feedEntries,
      feedRequiresEntry,
      feedStatus,
      getEntry,
      getEntryStatus,
      getPendingEntry,
      getPersistedEntry,
      getReturnedColors,
      getReturnedColorStatus,
      goToNextMonth: () => goToMonthOffset(1),
      goToPreviousMonth: () => goToMonthOffset(-1),
      hasSeenOnboarding,
      markOnboardingSeen,
      pendingEntries,
      profileStats,
      profileStatsStatus,
      reactionStatus,
      ready,
      refreshEntries,
      refreshEntry,
      refreshFeed,
      refreshProfileStats,
      refreshReturnedColors,
      retryPendingEntry,
      retryPendingEntries,
      returnedColorsByDate,
      resetDraft,
      returnColor,
      saveDraft,
      saveStatus,
      selectedColor,
      selectedDate,
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
      discardPendingEntry,
      draft,
      entries,
      entriesByDate,
      entriesStatus,
      feedEntries,
      feedRequiresEntry,
      feedStatus,
      getEntry,
      getEntryStatus,
      getPendingEntry,
      getPersistedEntry,
      getReturnedColors,
      getReturnedColorStatus,
      goToMonthOffset,
      hasSeenOnboarding,
      markOnboardingSeen,
      pendingEntries,
      profileStats,
      profileStatsStatus,
      reactionStatus,
      ready,
      refreshEntries,
      refreshEntry,
      refreshFeed,
      refreshProfileStats,
      refreshReturnedColors,
      retryPendingEntry,
      retryPendingEntries,
      returnedColorsByDate,
      resetDraft,
      returnColor,
      saveDraft,
      saveStatus,
      selectedColor,
      selectedDate,
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
