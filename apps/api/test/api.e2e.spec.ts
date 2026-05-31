import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/server.ts";

const userA = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const userB = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const userC = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const userD = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const userE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const userF = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const missingEntryId = "99999999-9999-4999-8999-999999999999";

describe("OneColor API", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  const saveEntry = (
    userId: string,
    date: string,
    words: [string, string, string],
    colorName: string,
  ) =>
    request(app.getHttpServer())
      .put(`/entries/${date}`)
      .set("X-Anonymous-User-Id", userId)
      .send({ words, colorName });

  const seedNearEntries = async () => {
    await saveEntry(userA, "2026-05-29", ["雨", "改札", "旅"], "遠い青").expect(200);
    await saveEntry(userA, "2026-05-30", ["雨", "改札", "自分"], "遠い青").expect(200);
    await saveEntry(userD, "2026-05-30", ["雨", "駅", "朝"], "遠い青").expect(200);
    await saveEntry(userE, "2026-05-31", ["雨", "改札", "午後"], "熱の赤").expect(200);
    await saveEntry(userF, "2026-05-27", ["本", "机", "犬"], "遠い青").expect(200);
  };

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
      .get("/near-days?date=2026-02-30&mode=color")
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
      });

    await request(app.getHttpServer())
      .get("/entries?month=2026-05")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        const entry = body.entries.find((item: { date: string }) => item.date === "2026-05-29");
        expect(entry.words).toEqual(["雨", "改札", "旅"]);
      });
  });

  it("returns no near days when the base day has not been saved", async () => {
    await request(app.getHttpServer())
      .get("/near-days?date=2026-05-29&mode=color")
      .set("X-Anonymous-User-Id", userC)
      .expect(200)
      .expect(({ body }) => {
        expect(body.days).toEqual([]);
      });
  });

  it("finds near days from other anonymous users", async () => {
    await seedNearEntries();

    await request(app.getHttpServer())
      .get("/near-days?date=2026-05-29&mode=color")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        expect(body.days[0].words).toEqual(["雨", "駅", "朝"]);
        expect(body.days[0].closeness).toBe(100);
        expect(body.days[0].entryId).toEqual(expect.any(String));
        expect(
          body.days.some((item: { words: string[] }) => item.words.join("/") === "雨/改札/自分"),
        ).toBe(false);
      });

    await request(app.getHttpServer())
      .get("/near-days?date=2026-05-29&mode=words")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        expect(body.days[0].words).toEqual(["雨", "改札", "午後"]);
        expect(body.days[0].closeness).toBe(67);
        expect(
          body.days.some((item: { words: string[] }) => item.words.join("/") === "本/机/犬"),
        ).toBe(false);
      });
  });

  it("saves and updates a returned color", async () => {
    await seedNearEntries();

    const nearResponse = await request(app.getHttpServer())
      .get("/near-days?date=2026-05-29&mode=color")
      .set("X-Anonymous-User-Id", userA)
      .expect(200);
    const target = nearResponse.body.days.find(
      (item: { words: string[] }) => item.words.join("/") === "雨/駅/朝",
    );

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
      .get("/entries/2026-05-30/reactions")
      .set("X-Anonymous-User-Id", userD)
      .expect(200)
      .expect(({ body }) => {
        expect(body.reactions).toHaveLength(1);
        expect(body.reactions[0].colorName).toBe("蜜の黄");
        expect(body.reactions[0].userId).toBeUndefined();
      });

    await request(app.getHttpServer())
      .get("/near-days?date=2026-05-29&mode=color")
      .set("X-Anonymous-User-Id", userA)
      .expect(200)
      .expect(({ body }) => {
        const returned = body.days.find(
          (item: { words: string[] }) => item.words.join("/") === "雨/駅/朝",
        );
        expect(returned.returnedColor.colorName).toBe("蜜の黄");
      });
  });

  it("rejects invalid returned colors", async () => {
    await seedNearEntries();

    const nearResponse = await request(app.getHttpServer())
      .get("/near-days?date=2026-05-29&mode=color")
      .set("X-Anonymous-User-Id", userA)
      .expect(200);
    const target = nearResponse.body.days.find(
      (item: { words: string[] }) => item.words.join("/") === "雨/駅/朝",
    );

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

    const userDNearResponse = await request(app.getHttpServer())
      .get("/near-days?date=2026-05-30&mode=color")
      .set("X-Anonymous-User-Id", userD)
      .expect(200);
    const ownTarget = userDNearResponse.body.days.find(
      (item: { words: string[] }) => item.words.join("/") === "雨/改札/旅",
    );

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
