import {
  faBell,
  faCarSide,
  faCheck,
  faTools,
  faWarning,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface NotificationConfig {
  bgColor: string;
  borderColor: string;
  icon: IconDefinition;
}

type NotificationType =
  | 'SendRequestSuccess'
  | 'RequestApproved'
  | 'VehicleReturned'
  | 'RequestRejected'
  | 'RequestCancelled'
  | 'NewRequestSubmitted'
  | 'VehicleInUse'
  | 'MaintenanceScheduled'
  | 'UserDeactivated'
  | 'RemindReturn'
  | 'System';

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  SendRequestSuccess: {
    bgColor: 'bg-purple-500',
    borderColor: 'border-l-purple-500',
    icon: faCarSide,
  },
  RequestApproved: {
    bgColor: 'bg-green-500',
    borderColor: 'border-l-green-500',
    icon: faCheck,
  },
  VehicleReturned: {
    bgColor: 'bg-green-500',
    borderColor: 'border-l-green-500',
    icon: faCarSide,
  },
  RequestRejected: {
    bgColor: 'bg-red-500',
    borderColor: 'border-l-red-500',
    icon: faXmark,
  },
  RequestCancelled: {
    bgColor: 'bg-orange-500',
    borderColor: 'border-l-orange-500',
    icon: faXmark,
  },
  NewRequestSubmitted: {
    bgColor: 'bg-orange-500',
    borderColor: 'border-l-orange-500',
    icon: faCarSide,
  },
  VehicleInUse: {
    bgColor: 'bg-orange-500',
    borderColor: 'border-l-orange-500',
    icon: faCarSide,
  },
  MaintenanceScheduled: {
    bgColor: 'bg-blue-500',
    borderColor: 'border-l-blue-500',
    icon: faTools,
  },
  UserDeactivated: {
    bgColor: 'bg-red-500',
    borderColor: 'border-l-red-500',
    icon: faWarning,
  },
  RemindReturn: {
    bgColor: 'bg-orange-500',
    borderColor: 'border-l-orange-500',
    icon: faWarning,
  },
  System: {
    bgColor: 'bg-gray-500',
    borderColor: 'border-l-gray-500',
    icon: faBell,
  },
};

const DEFAULT_CONFIG: NotificationConfig = {
  bgColor: 'bg-gray-500',
  borderColor: 'border-l-gray-500',
  icon: faBell,
};

export const getNotificationConfig = (type: string): NotificationConfig => {
  return NOTIFICATION_CONFIG[type as NotificationType] || DEFAULT_CONFIG;
};

export const getNotificationBackgroundColor = (type: string): string => {
  const config = getNotificationConfig(type);
  return config.bgColor;
};

export const getNotificationBorderColor = (type: string): string => {
  const config = getNotificationConfig(type);
  return config.borderColor;
};

export const getNotificationIcon = (type: string): IconDefinition => {
  const config = getNotificationConfig(type);
  return config.icon;
};
