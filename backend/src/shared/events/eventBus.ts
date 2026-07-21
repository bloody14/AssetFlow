import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { DomainEvent, EventHandler } from './types';
import { logger, asyncLocalStorage } from '../logger';

class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    this.emitter.on(eventType, async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`Error handling event ${eventType}`, { eventId: event.eventId, error });
      }
    });
  }

  public publish<T = unknown>(
    eventType: string,
    payload: T,
    actorId: string,
    actorType: string = 'USER',
    explicitCorrelationId?: string
  ): void {
    const context = asyncLocalStorage.getStore();

    const event: DomainEvent<T> = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date(),
      correlationId: explicitCorrelationId || context?.correlationId,
      actor: {
        id: actorId,
        type: actorType,
      },
      version: 1,
      payload,
    };

    logger.info(`Publishing Domain Event: ${eventType}`, {
      eventId: event.eventId,
      actorId,
      correlationId: event.correlationId,
    });
    this.emitter.emit(eventType, event);
  }
}

export const eventBus = new EventBus();
