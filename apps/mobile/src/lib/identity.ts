import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const anonymousUserIdKey = "onecolor:anonymous-user-id";
const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAnonymousUserId() {
  const existing = await AsyncStorage.getItem(anonymousUserIdKey);

  if (existing && uuidV4Pattern.test(existing)) {
    return existing;
  }

  const nextId = Crypto.randomUUID();
  await AsyncStorage.setItem(anonymousUserIdKey, nextId);
  return nextId;
}
