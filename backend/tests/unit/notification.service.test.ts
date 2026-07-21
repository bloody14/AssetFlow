import { describe, it, expect } from 'vitest';
import { NotificationService } from '../../src/modules/notifications/services/notification.service';
import { CreateNotificationDTO } from '../../src/modules/notifications/types/notification.types';

describe('NotificationService', () => {
  const service = new NotificationService();

  it('should dispatch a notification successfully', async () => {
    const data: CreateNotificationDTO = {
      recipientId: 'USER-123',
      type: 'EMAIL',
      title: 'Test Notification',
      message: 'This is a test message.',
      priority: 'HIGH'
    };

    const result = await service.dispatch(data);

    expect(result).toHaveProperty('id');
    expect(result.recipientId).toBe('USER-123');
    expect(result.type).toBe('EMAIL');
    expect(result.title).toBe('Test Notification');
    expect(result.message).toBe('This is a test message.');
    expect(result.priority).toBe('HIGH');
    expect(result.status).toBe('SENT');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.sentAt).toBeInstanceOf(Date);
  });

  it('should default priority to LOW if not provided', async () => {
    const data: CreateNotificationDTO = {
      recipientId: 'USER-456',
      type: 'IN_APP',
      title: 'Test Default Priority',
      message: 'Message without priority'
    };

    const result = await service.dispatch(data);
    expect(result.priority).toBe('LOW');
  });
});
