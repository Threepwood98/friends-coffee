import { isIP } from "node:net";

interface HeaderReader {
  get(name: string): string | null;
}

interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

interface RateLimitRule {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const COMMENT_WINDOW_MS = 10 * 60 * 1000;
const LIKE_WINDOW_MS = 15 * 60 * 1000;
const MAX_RATE_LIMIT_ENTRIES = 10_000;
const PRUNE_INTERVAL_MS = 60 * 1000;

const globalForRateLimit = globalThis as unknown as {
  authRateLimitStore: Map<string, RateLimitEntry> | undefined;
  authRateLimitLastPrunedAt: number | undefined;
};

const rateLimitStore =
  globalForRateLimit.authRateLimitStore ?? new Map<string, RateLimitEntry>();

globalForRateLimit.authRateLimitStore = rateLimitStore;

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  globalForRateLimit.authRateLimitLastPrunedAt = now;
}

function maintainRateLimitStore(now: number) {
  const lastPrunedAt = globalForRateLimit.authRateLimitLastPrunedAt ?? 0;

  if (now - lastPrunedAt >= PRUNE_INTERVAL_MS) {
    pruneExpiredEntries(now);
  }
}

function makeRoomForEntry() {
  if (rateLimitStore.size < MAX_RATE_LIMIT_ENTRIES) {
    return;
  }

  const oldestEntry = rateLimitStore.keys().next();

  if (!oldestEntry.done) {
    rateLimitStore.delete(oldestEntry.value);
  }
}

function consumeRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitRule): RateLimitResult {
  const now = Date.now();
  maintainRateLimitStore(now);

  let currentEntry = rateLimitStore.get(key);

  if (currentEntry?.resetAt && currentEntry.resetAt <= now) {
    rateLimitStore.delete(key);
    currentEntry = undefined;
  }

  if (!currentEntry) {
    makeRoomForEntry();
    rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });

    if (
      process.env.NODE_ENV !== "production" &&
      rateLimitStore.size > MAX_RATE_LIMIT_ENTRIES
    ) {
      throw new Error("Rate-limit store exceeded its configured capacity.");
    }

    return { allowed: true, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((currentEntry.resetAt - now) / 1000),
  );

  if (currentEntry.attempts >= limit) {
    return { allowed: false, retryAfterSeconds };
  }

  currentEntry.attempts += 1;
  return { allowed: true, retryAfterSeconds };
}

function consumeRules(rules: RateLimitRule[]) {
  for (const rule of rules) {
    const result = consumeRateLimit(rule);

    if (!result.allowed) {
      return result;
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

function getClientIp(headers: HeaderReader) {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("x-real-ip"),
  ];

  for (const value of candidates) {
    const candidate = value?.trim();

    if (candidate && isIP(candidate)) {
      return candidate;
    }
  }

  return "unknown";
}

export function consumeCommentRateLimit(
  headers: HeaderReader,
  identity: string,
) {
  const clientIp = getClientIp(headers);

  return consumeRules([
    {
      key: `comments:ip:${clientIp}`,
      limit: 20,
      windowMs: COMMENT_WINDOW_MS,
    },
    {
      key: `comments:identity:${clientIp}:${identity}`,
      limit: 10,
      windowMs: COMMENT_WINDOW_MS,
    },
  ]);
}

export function consumeLikeRateLimit(headers: HeaderReader, identity: string) {
  const clientIp = getClientIp(headers);

  return consumeRules([
    {
      key: `likes:ip:${clientIp}`,
      limit: 40,
      windowMs: LIKE_WINDOW_MS,
    },
    {
      key: `likes:identity:${clientIp}:${identity}`,
      limit: 20,
      windowMs: LIKE_WINDOW_MS,
    },
  ]);
}
