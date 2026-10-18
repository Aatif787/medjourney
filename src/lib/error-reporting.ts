export interface ErrorReportingContext {
  boundary?: string;
  route?: string;
  [key: string]: unknown;
}

/**
 * Global application error reporter.
 * Logs application and route boundary errors cleanly to console in development
 * and provides a single integration point for production monitoring (e.g. Sentry, Datadog).
 */
export function reportError(error: unknown, context: ErrorReportingContext = {}): void {
  const message = formatErrorMessage(error);
  const currentRoute = typeof window !== "undefined" ? window.location.pathname : undefined;

  console.error("[Application Error]", {
    message,
    route: currentRoute,
    ...context,
    error,
  });
}

const MAX_SERIALIZED_LENGTH = 2000;

function formatErrorMessage(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  const { message } = (error ?? {}) as { message?: unknown };
  if (typeof message === "string" && message.length > 0) {
    return message;
  }
  try {
    return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
  } catch {
    return String(error);
  }
}
