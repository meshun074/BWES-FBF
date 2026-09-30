export const REDACTED_VALUE = "[REDACTED]";

const CIRCULAR_VALUE = "[Circular]";
const UNREADABLE_VALUE = "[Unreadable]";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "authorization",
  "cookie",
  "setcookie",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "secret",
  "clientsecret",
  "databaseurl",
  "s3accesskey",
  "s3secretkey",
  "directussecret",
  "directusadminpassword",
]);

export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  application: string;
  requestId?: string;
  context?: LogContext;
}

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isSensitiveKey(key: string): boolean {
  const normalizedKey = normalizeKey(key);

  return (
    SENSITIVE_KEYS.has(normalizedKey) ||
    normalizedKey.endsWith("password") ||
    normalizedKey.endsWith("secret") ||
    normalizedKey.endsWith("token") ||
    normalizedKey.endsWith("apikey")
  );
}

function cloneAndRedact(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return CIRCULAR_VALUE;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => cloneAndRedact(item, seen));
  }

  const redacted: LogContext = {};

  for (const key of Object.keys(value)) {
    if (isSensitiveKey(key)) {
      redacted[key] = REDACTED_VALUE;
      continue;
    }

    try {
      redacted[key] = cloneAndRedact(
        (value as Record<string, unknown>)[key],
        seen,
      );
    } catch {
      redacted[key] = UNREADABLE_VALUE;
    }
  }

  return redacted;
}

export function redactSensitiveData<T>(value: T): unknown {
  return cloneAndRedact(value, new WeakSet<object>());
}

export function createStructuredLogEntry(
  level: LogLevel,
  message: string,
  application: string,
  context?: LogContext,
): StructuredLogEntry {
  const entry: StructuredLogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    application,
  };

  if (!context || Object.keys(context).length === 0) {
    return entry;
  }

  const redactedContext = redactSensitiveData(context) as LogContext;
  const { requestId, ...remainingContext } = redactedContext;

  if (typeof requestId === "string") {
    entry.requestId = requestId;
  } else if (requestId !== undefined) {
    remainingContext.requestId = requestId;
  }

  if (Object.keys(remainingContext).length > 0) {
    entry.context = remainingContext;
  }

  return entry;
}

export function serializeStructuredLogEntry(
  level: LogLevel,
  message: string,
  application: string,
  context?: LogContext,
): string {
  return JSON.stringify(
    createStructuredLogEntry(level, message, application, context),
  );
}
