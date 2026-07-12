import { IUserPayload } from '../auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
      requestId?: string;
    }
  }
}

export {};
