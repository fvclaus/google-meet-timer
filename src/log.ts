import { headers } from "next/headers";
import { PROJECT_ID } from "./shared/server_constants";
import { SessionData } from "./app/session-store";

export type LogEntry = {
  severity:
    | "DEBUG"
    | "INFO"
    | "NOTICE"
    | "WARNING"
    | "ERROR"
    | "CRITICAL"
    | "ALERT"
    | "EMERGENCY";
  message: string;
  userId?: string;
  meetingCode?: string;
  logName: string;
  session?: SessionData;
  taskName?: string;
  sessionId?: string;
  additional?: unknown;
};

export function log(msg: unknown, entry: Omit<LogEntry, "message">) {
  const globalLogFields: Record<string, string> = {};

  // Add log correlation to nest all log messages beneath request log in Log Viewer.
  // (This only works for HTTP-based invocations where `req` is defined.)
  const traceHeader = headers().get("X-Cloud-Trace-Context");
  if (traceHeader) {
    const [trace] = traceHeader.split("/");
    globalLogFields["logging.googleapis.com/trace"] =
      `projects/${PROJECT_ID}/traces/${trace}`;
  }

  const completeLogEntry: LogEntry = {
    message:
      msg instanceof Error
        ? msg.stack
          ? msg.stack
          : msg.message
        : String(msg),
    ...entry,
  };

  // Serialize to a JSON string and output.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ...completeLogEntry, ...globalLogFields }));
}

export function logDebug(
  msg: string,
  entry: Omit<LogEntry, "severity" | "message">,
) {
  log(msg, { ...entry, severity: "DEBUG" });
}

export function logInfo(
  msg: string,
  entry: Omit<LogEntry, "severity" | "message">,
) {
  log(msg, { ...entry, severity: "INFO" });
}

export function logError(
  msg: unknown,
  entry: Omit<LogEntry, "severity" | "message">,
) {
  log(msg, { ...entry, severity: "ERROR" });
}

export class Logger {
  // eslint-disable-next-line no-empty-function
  constructor(private name: string) {}

  public debug(
    msg: string,
    entry?: Omit<LogEntry, "severity" | "message" | "logName">,
  ) {
    logDebug(msg, { ...entry, logName: this.name });
  }

  public info(
    msg: string,
    entry?: Omit<LogEntry, "severity" | "message" | "logName">,
  ) {
    logInfo(msg, { ...entry, logName: this.name });
  }

  public error(
    msg: unknown,
    entry?: Omit<LogEntry, "severity" | "message" | "logName">,
  ) {
    logError(msg, { ...entry, logName: this.name });
  }
}
