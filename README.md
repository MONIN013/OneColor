# OneColor / 三語一色

Expo React Native app plus NestJS API for recording a day as three words and one color.

## Workspace

- `apps/mobile`: Expo SDK 56, Expo Router, React Native UI
- `apps/api`: NestJS REST API, Prisma, SQLite
- `packages/shared`: shared palette, sample data, and API-facing TypeScript types

## Setup

```bash
pnpm install
pnpm --filter @onecolor/api prisma:push
```

## Development

Start the API:

```bash
pnpm dev:api
```

Start Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000 pnpm dev:mobile
```

For a physical device, set `EXPO_PUBLIC_API_BASE_URL` to a reachable LAN URL for the API host.

## Verification

```bash
pnpm typecheck
pnpm test
pnpm --filter @onecolor/mobile run expo:doctor
pnpm --filter @onecolor/mobile exec expo export -p web --output-dir dist-web
```
