import type { PersistedDayEntry } from "@onecolor/shared";

export type Draft = {
  colorName: string;
  date: string;
  words: [string, string, string];
};

export type PendingEntryStatus = "queued" | "syncing" | "failed" | "conflict";

export type PendingEntry = {
  baseUpdatedAt: string | null;
  clientMutationId: string;
  colorName: string;
  date: string;
  lastError?: string;
  queuedAt: string;
  serverEntry?: PersistedDayEntry;
  status: PendingEntryStatus;
  words: [string, string, string];
};

export const isDraftEmpty = (draft: Draft) =>
  draft.words.every((word) => word.trim().length === 0);

export const rolloverEmptyDraft = (
  draft: Draft,
  previousTodayId: string,
  nextTodayId: string,
) => {
  if (draft.date !== previousTodayId || !isDraftEmpty(draft)) {
    return draft;
  }

  return {
    ...draft,
    date: nextTodayId,
  };
};

export const normalizePendingEntries = (value: unknown): Record<string, PendingEntry> => {
  if (!Array.isArray(value)) {
    return {};
  }

  const entries: Record<string, PendingEntry> = {};
  for (const item of value) {
    if (!isPendingEntry(item)) {
      continue;
    }
    entries[item.date] = {
      ...item,
      status: item.status === "syncing" ? "queued" : item.status,
    };
  }
  return entries;
};

export const upsertPendingEntry = (
  current: Record<string, PendingEntry>,
  entry: PendingEntry,
) => ({
  ...current,
  [entry.date]: entry,
});

export const removePendingEntry = (
  current: Record<string, PendingEntry>,
  date: string,
) => {
  const next = { ...current };
  delete next[date];
  return next;
};

export const isRetryableStatus = (status?: number) =>
  status === undefined || status === 0 || status >= 500;

const isPendingEntry = (value: unknown): value is PendingEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<PendingEntry>;
  return (
    typeof item.date === "string" &&
    Array.isArray(item.words) &&
    item.words.length === 3 &&
    item.words.every((word) => typeof word === "string") &&
    typeof item.colorName === "string" &&
    typeof item.clientMutationId === "string" &&
    typeof item.queuedAt === "string" &&
    (item.baseUpdatedAt === null || typeof item.baseUpdatedAt === "string") &&
    (item.status === "queued" ||
      item.status === "syncing" ||
      item.status === "failed" ||
      item.status === "conflict")
  );
};
