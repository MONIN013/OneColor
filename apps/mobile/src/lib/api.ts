import Constants from "expo-constants";
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

const apiPort = "3000";
const requestTimeoutMs = 3500;

type ApiClientOptions = {
  baseUrls?: string[];
  fetchImpl?: ApiFetch;
};

export type ApiFetch = (input: string, init?: RequestInit) => Promise<Response>;

type ResolveApiBaseUrlOptions = {
  configuredBaseUrl?: string;
  expoHostUri?: string;
  isDev?: boolean;
  platform?: typeof Platform.OS;
  webHostname?: string;
};

const normalizeApiBaseUrl = (value: string | undefined) => {
  const normalized = value?.trim().replace(/\/+$/, "");
  return normalized && normalized.length > 0 ? normalized : undefined;
};

const getRuntimeWebHostname = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.location.hostname || undefined;
};

const normalizeLocalHostname = (hostname: string | undefined) => {
  if (!hostname) {
    return undefined;
  }

  if (hostname === "localhost") {
    return "127.0.0.1";
  }

  return hostname;
};

const getExpoHostApiBaseUrl = (hostUri: string | undefined) => {
  if (!hostUri) {
    return undefined;
  }

  const value = /^[a-z]+:\/\//i.test(hostUri) ? hostUri : `http://${hostUri}`;
  let host: string | undefined;
  try {
    host = new URL(value).hostname;
  } catch {
    host = hostUri
      .replace(/^[a-z]+:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");
  }

  const normalizedHost = normalizeLocalHostname(host);

  return normalizedHost ? `http://${normalizedHost}:${apiPort}` : undefined;
};

const unique = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }
  return result;
};

const isDevelopmentRuntime = () => {
  if (typeof __DEV__ !== "undefined") {
    return __DEV__;
  }

  return process.env.NODE_ENV !== "production";
};

export const resolveApiBaseUrls = ({
  configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL,
  expoHostUri = Constants.expoConfig?.hostUri,
  isDev = isDevelopmentRuntime(),
  platform = Platform.OS,
  webHostname = getRuntimeWebHostname(),
}: ResolveApiBaseUrlOptions = {}) => {
  const configuredApiBaseUrl = normalizeApiBaseUrl(configuredBaseUrl);
  if (configuredApiBaseUrl) {
    return [configuredApiBaseUrl];
  }

  if (!isDev) {
    return [];
  }

  if (platform === "web") {
    return unique([
      normalizeLocalHostname(webHostname)
        ? `http://${normalizeLocalHostname(webHostname)}:${apiPort}`
        : undefined,
      "http://127.0.0.1:3000",
    ]);
  }

  if (platform === "android") {
    return unique([getExpoHostApiBaseUrl(expoHostUri), "http://10.0.2.2:3000"]);
  }

  return unique([getExpoHostApiBaseUrl(expoHostUri), "http://127.0.0.1:3000"]);
};

export const getApiBaseUrls = () => resolveApiBaseUrls();

const createRequestSignal = () => {
  if (typeof AbortController === "undefined") {
    return { clear: () => {}, signal: undefined };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
  return {
    clear: () => clearTimeout(timeoutId),
    signal: controller.signal,
  };
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
  }
}

export class ApiConnectionError extends Error {
  constructor(
    message: string,
    readonly attemptedUrls: string[],
    readonly cause?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(
  baseUrls: string[],
  fetchImpl: ApiFetch,
  path: string,
  userId: string,
  init: RequestInit = {},
): Promise<T> {
  if (baseUrls.length === 0) {
    throw new ApiConnectionError(
      "APIの接続先が設定されていません。",
      [],
    );
  }

  let lastError: unknown;
  const attemptedUrls: string[] = [];

  for (const apiBaseUrl of baseUrls) {
    let response: Response;
    const timeout = createRequestSignal();
    attemptedUrls.push(apiBaseUrl);
    try {
      response = await fetchImpl(`${apiBaseUrl}${path}`, {
        ...init,
        signal: init.signal ?? timeout.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Anonymous-User-Id": userId,
          ...init.headers,
        },
      });
    } catch (error) {
      lastError = error;
      if (init.signal?.aborted) {
        throw new ApiConnectionError(
          "APIに接続できませんでした。",
          attemptedUrls,
          lastError,
        );
      }
      continue;
    } finally {
      timeout.clear();
    }

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

  throw new ApiConnectionError(
    "APIに接続できませんでした。",
    attemptedUrls,
    lastError,
  );
}

export const createApiClient = ({
  baseUrls = getApiBaseUrls(),
  fetchImpl = fetch,
}: ApiClientOptions = {}) => ({
  palette: (userId: string) =>
    request<PaletteResponse>(baseUrls, fetchImpl, "/palette", userId),
  profileStats: (userId: string) =>
    request<ProfileStatsResponse>(
      baseUrls,
      fetchImpl,
      "/profile/stats",
      userId,
    ),
  entries: (userId: string, month: string) =>
    request<EntriesResponse>(
      baseUrls,
      fetchImpl,
      `/entries?month=${encodeURIComponent(month)}`,
      userId,
    ),
  entry: (userId: string, date: string) =>
    request<EntryResponse>(
      baseUrls,
      fetchImpl,
      `/entries/${encodeURIComponent(date)}`,
      userId,
    ),
  saveEntry: (userId: string, date: string, body: SaveEntryRequest) =>
    request<EntryResponse>(
      baseUrls,
      fetchImpl,
      `/entries/${encodeURIComponent(date)}`,
      userId,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),
  entryReactions: (userId: string, date: string) =>
    request<ColorReactionsResponse>(
      baseUrls,
      fetchImpl,
      `/entries/${encodeURIComponent(date)}/reactions`,
      userId,
    ),
  returnColor: (userId: string, entryId: string, body: SaveColorReactionRequest) =>
    request<ColorReactionResponse>(
      baseUrls,
      fetchImpl,
      `/entries/${encodeURIComponent(entryId)}/reactions/color`,
      userId,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),
  feed: (userId: string) =>
    request<FeedResponse>(baseUrls, fetchImpl, "/feed", userId),
});

export const api = createApiClient();
