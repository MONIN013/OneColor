import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/server.ts";

const userA = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const userB = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const userC = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const userD = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const userE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const userF = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const userG = "11111111-1111-4111-8111-111111111111";
const userH = "22222222-2222-4222-8222-222222222222";
const userI = "33333333-3333-4333-8333-333333333333";
const missingEntryId = "99999999-9999-4999-8999-999999999999";

type FeedTestItem = {
  colorName: string;
  createdAt: string;
  entryId: string;
  returnedColor?: {
    colorName: string;
  };
  words: string[];
};

describe("OneColor API", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  const saveEntry = (
    userId: string,
    date: string,
    words: [string, string, string],
    colorName: string,
    extra: Record<string, unknown> = {},
  ) =>
    request(app.getHttpServer())
      .put(`/entries/${date}`)
      .set("X-Anonymous-User-Id", userId)
      .send({ words, colorName, ...extra });

  const seedFeedEntries = async () => {
    await saveEntry(userA, "2026-05-29", ["雨", "改札", "旅"], "遠い青").expect(200);
    await saveEntry(userA, "2026-05-30", ["雨", "改札", "自分"], "遠い青").expect(200);
    await saveEntry(userD, "2026-05-30", ["雨", "駅", "朝"], "遠い青").expect(200);
    await saveEntry(userE, "2026-05-31", ["雨", "改札", "午後"], "熱の赤").expect(200);
    await saveEntry(userF, "2026-05-27", ["本", "机", "犬"], "遠い青").expect(200);
  };

  const findFeedItem = (
    entries: FeedTestItem[],
    words: string,
  ) => entries.find((item) => item.words.join("/") === words);

  beforeAll(async () => {
    app = await createApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns health status", async () => {
    await request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
      });
  });

  it("rejects requests without an anonymous user id", async () => {
    await request(app.getHttpServer()).get("/entries?month=2026-05").expect(400);
  });

  it("returns no seeded entries for a new anonymous user", async () => {
    await request(app.getHttpServer())
      .get("/entries?month=2026-05")
      .set("X-Anonymous-User-Id", userC)
      .expect(200)
      .expect(({ body }) => {
        expect(body.entries).toEqual([]);
      });
  });

  it("returns 404 for an unsaved day", async () => {
    await request(app.getHttpServer())
      .get("/entries/2026-05-29")
      .set("X-Anonymous-User-Id", userC)
      .expect(404);
  });

  it("rejects invalid saves", async () => {
    await request(app.getHttpServer())
      .put("/entries/2026-05-29")
      .set("X-Anonymous-User-Id", userA)
      .send({ words: ["長すぎる言葉です。", "改札", "嘘"], colorName: "遠い青" })
      .expect(400);

    await request(app.getHttpServer())
      .put("/entries/2026-05-29")
      .set("X-Anonymous-User-Id", userA)
      .send({ words: ["雨", "   ", "嘘"], colorName: "遠い青" })
      .expect(400);

    await request(app.getHttpServer())
      .put("/entries/2026-05-29")
      .set("X-Anonymous-User-Id", userA)
      .send({ words: ["雨", "改札", "嘘"], colorName: "ない色" })
      .expect(400);
  });

  it("rejects impossible dates and months", async () => {
    await request(app.getHttpServer())
      .get("/entries?month=2026-13")
      .set("X-Anonymous-User-Id", userA)
      .expect(400);

    await request(app.getHttpServer())
      .put("/entries/2026-02-30")
      .set("X-Anonymous-User-Id", userA)
      .send({ words: ["雨", "改札", "嘘"], colorName: "遠い青" })
      .expect(400);

    await request(app.getHttpServer())
      .get("/feed?limit=0")
      .set("X-Anonymous-User-Id", userA)
      .expect(400);
  });

  it("saves an entry and returns it in month results", async () => {
    await request(app.getHttpServer())
      .put("/entries/2026-05-29")
      .set("X-Anonymous-User-Id", userA)
      .send({ words: ["雨", "改札", "旅"], colorName: "遠い青" })
      .expect(200)
      .expect(({ body }) => {
        expect(body.entry.words).toEqual(["雨", "改札", "旅"]);
        expect(body.entry.colorHex).toBe("#5F7E96");
        expect(body.entry.id).toEqual(expect.any(String));
        expect(body.entry.createdAt).toEqual(expect.any(String));
        expect(body.entry.updatedAt).toEqual(expect.any(String));
      });

    await request(app.getHttpServer())
      .get("/entries?month=2026-05")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        const entry = body.entries.find((item: { date: string }) => item.date === "2026-05-29");
        expect(entry.words).toEqual(["雨", "改札", "旅"]);
        expect(entry.id).toEqual(expect.any(String));
        expect(entry.updatedAt).toEqual(expect.any(String));
      });
  });

  it("returns profile stats across all saved months", async () => {
    await saveEntry(userH, "2026-04-30", ["前", "月", "色"], "朝の白").expect(200);
    await saveEntry(userH, "2026-06-01", ["次", "月", "色"], "雨の青").expect(200);

    await request(app.getHttpServer())
      .get("/profile/stats")
      .set("X-Anonymous-User-Id", userH)
      .expect(200)
      .expect(({ body }) => {
        expect(body.stats).toEqual({
          totalEntries: 2,
          totalWords: 6,
        });
      });
  });

  it("detects stale entry updates with baseUpdatedAt", async () => {
    const firstSave = await saveEntry(
      userI,
      "2026-06-02",
      ["朝", "川", "靴"],
      "雨の青",
    ).expect(200);
    const baseUpdatedAt = firstSave.body.entry.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));
    await saveEntry(userI, "2026-06-02", ["夜", "川", "靴"], "夜の紺", {
      baseUpdatedAt,
    }).expect(200);

    await saveEntry(userI, "2026-06-02", ["古い", "川", "靴"], "古い紙", {
      baseUpdatedAt,
    })
      .expect(409)
      .expect(({ body }) => {
        expect(body.message).toBe("Entry has changed on the server");
        expect(body.entry.words).toEqual(["夜", "川", "靴"]);
        expect(body.entry.updatedAt).not.toBe(baseUpdatedAt);
      });
  });

  it("requires a saved entry before showing the public feed", async () => {
    await request(app.getHttpServer())
      .get("/feed")
      .set("X-Anonymous-User-Id", userC)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          entries: [],
          requiresEntry: true,
        });
      });
  });

  it("returns other anonymous users in the public feed", async () => {
    await seedFeedEntries();
    await saveEntry(userG, "2026-05-30", ["雨", "駅", "朝"], "遠い青").expect(200);

    await request(app.getHttpServer())
      .get("/feed")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        expect(body.requiresEntry).toBe(false);
        expect(findFeedItem(body.entries, "雨/改札/旅")).toBeUndefined();
        expect(findFeedItem(body.entries, "雨/改札/自分")).toBeUndefined();
        expect(findFeedItem(body.entries, "雨/駅/朝")).toEqual(
          expect.objectContaining({
            colorName: "遠い青",
            createdAt: expect.any(String),
            entryId: expect.any(String),
          }),
        );
        expect(body.entries[0]).not.toHaveProperty("userId");
        expect(body.entries[0]).not.toHaveProperty("closeness");
      });

    await request(app.getHttpServer())
      .get("/feed?limit=2")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        expect(body.entries).toHaveLength(2);
        const sortedEntries = [...body.entries].sort(
          (
            a: { createdAt: string; entryId: string },
            b: { createdAt: string; entryId: string },
          ) =>
            b.createdAt.localeCompare(a.createdAt) ||
            b.entryId.localeCompare(a.entryId),
        );
        expect(body.entries.map((item: { entryId: string }) => item.entryId)).toEqual(
          sortedEntries.map((item: { entryId: string }) => item.entryId),
        );
      });
  });

  it("saves and updates a returned color", async () => {
    await seedFeedEntries();

    const feedResponse = await request(app.getHttpServer())
      .get("/feed")
      .set("X-Anonymous-User-Id", userA)
      .expect(200);
    const target = findFeedItem(feedResponse.body.entries, "雨/改札/午後");
    if (!target) {
      throw new Error("Expected feed target to exist");
    }

    await request(app.getHttpServer())
      .put(`/entries/${target.entryId}/reactions/color`)
      .set("X-Anonymous-User-Id", userA)
      .send({ colorName: "藤の紫" })
      .expect(200)
      .expect(({ body }) => {
        expect(body.reaction.colorName).toBe("藤の紫");
        expect(body.reaction.colorHex).toBe("#B8A9C8");
        expect(body.reaction.userId).toBeUndefined();
      });

    await request(app.getHttpServer())
      .put(`/entries/${target.entryId}/reactions/color`)
      .set("X-Anonymous-User-Id", userA)
      .send({ colorName: "蜜の黄" })
      .expect(200);

    await request(app.getHttpServer())
      .get("/entries/2026-05-31/reactions")
      .set("X-Anonymous-User-Id", userE)
      .expect(200)
      .expect(({ body }) => {
        expect(body.reactions).toHaveLength(1);
        expect(body.reactions[0].colorName).toBe("蜜の黄");
        expect(body.reactions[0].userId).toBeUndefined();
      });

    await request(app.getHttpServer())
      .get("/feed")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        const returned = findFeedItem(body.entries, "雨/改札/午後");
        expect(returned?.returnedColor?.colorName).toBe("蜜の黄");
      });
  });

  it("rejects invalid returned colors", async () => {
    await seedFeedEntries();

    const feedResponse = await request(app.getHttpServer())
      .get("/feed")
      .set("X-Anonymous-User-Id", userA)
      .expect(200);
    const target = findFeedItem(feedResponse.body.entries, "雨/改札/午後");
    if (!target) {
      throw new Error("Expected feed target to exist");
    }

    await request(app.getHttpServer())
      .put(`/entries/${target.entryId}/reactions/color`)
      .set("X-Anonymous-User-Id", userA)
      .send({ colorName: "ない色" })
      .expect(400);

    await request(app.getHttpServer())
      .put(`/entries/${missingEntryId}/reactions/color`)
      .set("X-Anonymous-User-Id", userA)
      .send({ colorName: "遠い青" })
      .expect(404);

    const userDFeedResponse = await request(app.getHttpServer())
      .get("/feed")
      .set("X-Anonymous-User-Id", userD)
      .expect(200);
    const ownTarget = findFeedItem(userDFeedResponse.body.entries, "雨/改札/旅");
    if (!ownTarget) {
      throw new Error("Expected own feed target to exist");
    }

    await request(app.getHttpServer())
      .put(`/entries/${ownTarget.entryId}/reactions/color`)
      .set("X-Anonymous-User-Id", userA)
      .send({ colorName: "遠い青" })
      .expect(400);
  });

  it("isolates entries by anonymous user", async () => {
    await request(app.getHttpServer())
      .get("/entries/2026-05-29")
      .set("X-Anonymous-User-Id", userB)
      .expect(404);

    await request(app.getHttpServer())
      .get("/entries?month=2026-05")
      .set("X-Anonymous-User-Id", userB)
      .expect(200)
      .expect(({ body }) => {
        expect(body.entries).toEqual([]);
      });
  });
});
