import { v4 as uuidv4 } from 'uuid';
import { CreateNotificationDTO, NotificationDomain } from '../types/notification.types';
import { logger } from '../../../shared/logger';

export class NotificationService {
  /**
   * Dispatches a notification.
   * For Phase 5.4 MVP, this is a mock implementation that logs to the console.
   */
  async dispatch(data: CreateNotificationDTO): Promise<NotificationDomain> {
    const notification: NotificationDomain = {
      id: uuidv4(),
      recipientId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'LOW',
      status: 'SENT', // Immediately 'sent' in our mock
      metadata: data.metadata,
      createdAt: new Date(),
      sentAt: new Date()
    };

    logger.info(`[MOCK DISPATCH: ${notification.type}] To: ${notification.recipientId} | Title: ${notification.title}`, {
      module: 'Notifications',
      operation: 'Dispatch',
      notificationId: notification.id,
      priority: notification.priority
    });

    return notification;
  }
}
