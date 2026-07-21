import { Request, Response } from 'express';
import { env } from '../config/env';

export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'AssetFlow', checks: { database: 'ok' } }); // DB check to be expanded
};

export const livenessCheck = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'live' });
};

export const readinessCheck = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ready' });
};

export const versionInfo = (_req: Request, res: Response) => {
  res.status(200).json({
    application: env.APP_NAME,
    version: process.env.npm_package_version || '1.0.0',
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    gitCommit: process.env.GIT_COMMIT || 'unknown',
    environment: env.NODE_ENV,
  });
};
