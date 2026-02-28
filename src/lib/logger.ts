type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: unknown;
  meta?: Record<string, unknown>;
  timestamp: string;
}

function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { raw: String(error) };
}

function log(entry: Omit<LogEntry, "timestamp">) {
  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    ...(entry.error ? { error: formatError(entry.error) } : {}),
  };

  const prefix = `[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}]`;
  const ctx = logEntry.context ? ` [${logEntry.context}]` : "";

  switch (entry.level) {
    case "error":
      console.error(`${prefix}${ctx} ${logEntry.message}`, logEntry.error ?? "", logEntry.meta ?? "");
      break;
    case "warn":
      console.warn(`${prefix}${ctx} ${logEntry.message}`, logEntry.meta ?? "");
      break;
    default:
      console.log(`${prefix}${ctx} ${logEntry.message}`, logEntry.meta ?? "");
  }
}

export const logger = {
  info(message: string, context?: string, meta?: Record<string, unknown>) {
    log({ level: "info", message, context, meta });
  },
  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    log({ level: "warn", message, context, meta });
  },
  error(message: string, error?: unknown, context?: string, meta?: Record<string, unknown>) {
    log({ level: "error", message, error, context, meta });
  },
};
