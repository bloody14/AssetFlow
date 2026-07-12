export interface IUserPayload {
  id: string;
  role: string;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
      requestId?: string;
    }
  }
}

export {};
