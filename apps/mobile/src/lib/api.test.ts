import { describe, expect, it, vi } from "vitest";
import {
  type ApiFetch,
  ApiConnectionError,
  ApiRequestError,
  createApiClient,
  resolveApiBaseUrls,
} from "./api";

vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {},
  },
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

describe("api base URL resolution", () => {
  it("uses the configured API URL without fallback candidates", () => {
    expect(
      resolveApiBaseUrls({
        configuredBaseUrl: "https://api.example.test/",
        isDev: true,
        platform: "android",
      }),
    ).toEqual(["https://api.example.test"]);
  });

  it("uses only local-safe candidates for web development", () => {
    expect(
      resolveApiBaseUrls({
        isDev: true,
        platform: "web",
        webHostname: "localhost",
      }),
    ).toEqual(["http://127.0.0.1:3000"]);
  });

  it("uses the current browser host before loopback for web LAN development", () => {
    expect(
      resolveApiBaseUrls({
        isDev: true,
        platform: "web",
        webHostname: "192.168.1.20",
      }),
    ).toEqual(["http://192.168.1.20:3000", "http://127.0.0.1:3000"]);
  });

  it("uses the Expo host and emulator loopback for Android development", () => {
    expect(
      resolveApiBaseUrls({
        expoHostUri: "192.168.10.5:8081",
        isDev: true,
        platform: "android",
      }),
    ).toEqual(["http://192.168.10.5:3000", "http://10.0.2.2:3000"]);
  });

  it("requires explicit configuration outside development", () => {
    expect(
      resolveApiBaseUrls({
        isDev: false,
        platform: "ios",
      }),
    ).toEqual([]);
  });
});

describe("api requests", () => {
  it("tries the next base URL only after a network failure", async () => {
    const fetchImpl = vi
      .fn<ApiFetch>()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stats: { totalEntries: 0, totalWords: 0 } }), { status: 200 }),
      );
    const client = createApiClient({
      baseUrls: ["http://127.0.0.1:3000", "http://10.0.2.2:3000"],
      fetchImpl,
    });

    await expect(client.profileStats("user-1")).resolves.toEqual({
      stats: { totalEntries: 0, totalWords: 0 },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[1]?.[0]).toBe("http://10.0.2.2:3000/profile/stats");
    expect(fetchImpl.mock.calls[1]?.[1]?.headers).toMatchObject({
      "X-Anonymous-User-Id": "user-1",
    });
  });

  it("does not fall back after an API response error", async () => {
    const fetchImpl = vi.fn<ApiFetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: "bad request" }), {
        status: 400,
      }),
    );
    const client = createApiClient({
      baseUrls: ["http://127.0.0.1:3000", "http://10.0.2.2:3000"],
      fetchImpl,
    });

    await expect(client.profileStats("user-1")).rejects.toMatchObject({
      message: "bad request",
      status: 400,
    } satisfies Partial<ApiRequestError>);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("reports attempted URLs when every candidate fails", async () => {
    const fetchImpl = vi
      .fn<ApiFetch>()
      .mockRejectedValue(new TypeError("network down"));
    const client = createApiClient({
      baseUrls: ["http://127.0.0.1:3000"],
      fetchImpl,
    });

    await expect(client.profileStats("user-1")).rejects.toMatchObject({
      attemptedUrls: ["http://127.0.0.1:3000"],
      message: "APIに接続できませんでした。",
    } satisfies Partial<ApiConnectionError>);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
