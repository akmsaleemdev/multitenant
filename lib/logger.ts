type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  route?: string;
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, ctx?: LogContext): string {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...ctx,
  };
  return JSON.stringify(payload);
}

export const logger = {
  info(message: string, ctx?: LogContext) {
    console.log(formatMessage('info', message, ctx));
  },
  warn(message: string, ctx?: LogContext) {
    console.warn(formatMessage('warn', message, ctx));
  },
  error(message: string, ctx?: LogContext) {
    console.error(formatMessage('error', message, ctx));
  },
  debug(message: string, ctx?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, ctx));
    }
  },
};
