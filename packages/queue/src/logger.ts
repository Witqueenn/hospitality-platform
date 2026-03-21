type LogLevel = "info" | "warn" | "error";

function log(
  level: LogLevel,
  context: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(meta && { meta }),
  };
  const line = JSON.stringify(entry) + "\n";
  if (level === "error") {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

export const logger = {
  info: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("info", context, message, meta),
  warn: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("warn", context, message, meta),
  error: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("error", context, message, meta),
};
