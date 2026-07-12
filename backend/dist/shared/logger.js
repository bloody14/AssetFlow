"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    return `${String(ts)} ${level}: ${String(stack || message)} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});
exports.logger = winston_1.default.createLogger({
    level: env_1.env.LOG_LEVEL,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'assetflow-api' },
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
        }),
    ],
});
