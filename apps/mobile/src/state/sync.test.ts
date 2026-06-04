import { describe, expect, it } from "vitest";
import { generateDayPalette } from "@onecolor/shared";
import {
  normalizePendingEntries,
  removePendingEntry,
  rolloverEmptyDraft,
  upsertPendingEntry,
} from "./sync";

const words = ["雨", "改札", "嘘"] as [string, string, string];
const color = generateDayPalette({ date: "2026-06-01", words })[0]!;

describe("sync helpers", () => {
  it("normalizes only valid pending entries", () => {
    const pending = {
      baseUpdatedAt: null,
      clientMutationId: "mutation-1",
      color,
      date: "2026-06-01",
      queuedAt: "2026-06-01T00:00:00.000Z",
      status: "queued",
      words,
    };

    expect(normalizePendingEntries([pending, { date: "bad" }])).toEqual({
      "2026-06-01": pending,
    });
  });

  it("restores in-flight pending entries as retryable queued entries", () => {
    const pending = {
      baseUpdatedAt: null,
      clientMutationId: "mutation-1",
      color,
      date: "2026-06-01",
      queuedAt: "2026-06-01T00:00:00.000Z",
      status: "syncing",
      words,
    };

    expect(normalizePendingEntries([pending])["2026-06-01"]?.status).toBe(
      "queued",
    );
  });

  it("upserts and removes pending entries by date", () => {
    const pending = {
      baseUpdatedAt: null,
      clientMutationId: "mutation-1",
      color,
      date: "2026-06-01",
      queuedAt: "2026-06-01T00:00:00.000Z",
      status: "failed" as const,
      words,
    };

    const withEntry = upsertPendingEntry({}, pending);
    expect(withEntry["2026-06-01"]).toBe(pending);
    expect(removePendingEntry(withEntry, "2026-06-01")).toEqual({});
  });

  it("rolls an empty old today draft forward only when it is still empty", () => {
    const emptyDraft = {
      color: null,
      date: "2026-05-31",
      words: ["", "", ""] as [string, string, string],
    };
    const nonEmptyDraft = {
      ...emptyDraft,
      words: ["雨", "", ""] as [string, string, string],
    };

    expect(rolloverEmptyDraft(emptyDraft, "2026-05-31", "2026-06-01")).toEqual({
      ...emptyDraft,
      date: "2026-06-01",
    });
    expect(rolloverEmptyDraft(nonEmptyDraft, "2026-05-31", "2026-06-01")).toBe(
      nonEmptyDraft,
    );
  });
});
