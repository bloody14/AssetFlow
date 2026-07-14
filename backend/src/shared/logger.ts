import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

export interface LogContext {
  correlationId: string;
  method?: string;
  path?: string;
  userId?: string;
  module?: string;
  operation?: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

const formatContext = winston.format((info) => {
  const context = asyncLocalStorage.getStore();
  if (context) {
    info.correlationId = context.correlationId;
    if (context.method) info.method = context.method;
    if (context.path) info.path = context.path;
    if (context.userId) info.userId = context.userId;
    if (context.module) info.module = context.module;
    if (context.operation) info.operation = context.operation;
  }
  info.environment = process.env.NODE_ENV || 'development';
  return info;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    formatContext(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});
