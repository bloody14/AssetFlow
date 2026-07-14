export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: Date;
  correlationId?: string;
  actor: {
    id: string;
    type: string;
  };
  version: number;
  payload: T;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;
