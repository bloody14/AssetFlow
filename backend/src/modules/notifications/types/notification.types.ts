export type NotificationType = 'EMAIL' | 'SMS' | 'IN_APP';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateNotificationDTO {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

export interface NotificationDomain {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: 'PENDING' | 'SENT' | 'FAILED';
  metadata?: Record<string, any>;
  createdAt: Date;
  sentAt?: Date;
}
