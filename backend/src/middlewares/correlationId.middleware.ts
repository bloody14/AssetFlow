import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncLocalStorage, logger } from '../shared/logger';

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.header('x-correlation-id') || (req.header('x-request-id') as string) || uuidv4();
  res.setHeader('X-Correlation-ID', correlationId);

  const store = {
    correlationId,
    method: req.method,
    path: req.originalUrl
  };

  asyncLocalStorage.run(store, () => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const userId = (req as any).user?.userId;
      if (userId) {
         const currentStore = asyncLocalStorage.getStore();
         if (currentStore) currentStore.userId = userId;
      }
      logger.info('HTTP Request', {
        operation: 'HttpRequest',
        duration,
        statusCode: res.statusCode
      });
    });

    next();
  });
};
