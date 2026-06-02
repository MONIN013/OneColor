import { Platform } from "react-native";
import type {
  ColorReactionResponse,
  ColorReactionsResponse,
  EntriesResponse,
  EntryResponse,
  FeedResponse,
  PaletteResponse,
  ProfileStatsResponse,
  SaveColorReactionRequest,
  SaveEntryRequest,
} from "@onecolor/shared";

const defaultApiBaseUrl = Platform.select({
  android: "http://10.0.2.2:3000",
  default: "http://127.0.0.1:3000",
});

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? defaultApiBaseUrl;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  userId: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Anonymous-User-Id": userId,
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    let body: unknown;
    try {
      body = await response.json();
      const responseBody = body as { message?: string | string[] };
      message = Array.isArray(responseBody.message)
        ? responseBody.message.join("\n")
        : responseBody.message ?? message;
    } catch {
      // Keep the status-based message when the response body is not JSON.
    }
    throw new ApiRequestError(message, response.status, body);
  }

  return response.json() as Promise<T>;
}

export const api = {
  palette: (userId: string) => request<PaletteResponse>("/palette", userId),
  profileStats: (userId: string) =>
    request<ProfileStatsResponse>("/profile/stats", userId),
  entries: (userId: string, month: string) =>
    request<EntriesResponse>(`/entries?month=${encodeURIComponent(month)}`, userId),
  entry: (userId: string, date: string) =>
    request<EntryResponse>(`/entries/${encodeURIComponent(date)}`, userId),
  saveEntry: (userId: string, date: string, body: SaveEntryRequest) =>
    request<EntryResponse>(`/entries/${encodeURIComponent(date)}`, userId, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  entryReactions: (userId: string, date: string) =>
    request<ColorReactionsResponse>(
      `/entries/${encodeURIComponent(date)}/reactions`,
      userId,
    ),
  returnColor: (userId: string, entryId: string, body: SaveColorReactionRequest) =>
    request<ColorReactionResponse>(
      `/entries/${encodeURIComponent(entryId)}/reactions/color`,
      userId,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),
  feed: (userId: string) => request<FeedResponse>("/feed", userId),
};
