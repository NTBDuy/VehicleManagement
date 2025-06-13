import Request from '@/types/Request';
import User from '@/types/User';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

const BUTTON_STYLES = {
  base: 'items-center rounded-xl py-4 shadow-sm',
  full: 'w-full',
  half: 'w-[48%]',
  colors: {
    green: 'bg-green-600',
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    disabled: 'bg-gray-400',
  },
};

interface ActionButtonProps {
  title?: string;
  onPress?: () => void;
  color?: 'green' | 'red' | 'blue' | 'gray' | 'amber' | 'orange';
  disabled?: boolean;
  loading?: boolean;
  width?: string;
  loadingText?: string;
  className?: string;
}

const ActionButton = ({
  title,
  onPress,
  color = 'gray',
  disabled = false,
  loading = false,
  width = 'full',
  loadingText = '',
  className = '',
}: ActionButtonProps) => {
  const buttonColor =
    disabled || loading ? BUTTON_STYLES.colors.disabled : BUTTON_STYLES.colors[color];
  const buttonWidth = width === 'half' ? BUTTON_STYLES.half : BUTTON_STYLES.full;

  return (
    <TouchableOpacity
      className={`${BUTTON_STYLES.base} ${buttonWidth} ${buttonColor} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}>
      <Text className="font-semibold text-white">{loading ? loadingText : title}</Text>
    </TouchableOpacity>
  );
};

interface ActionButtonsProps {
  user: User;
  requestData: Request;
  isUsingLoading: boolean;
  isEndUsageLoading: boolean;
  isReminderSent: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  onUsingVehicle: () => void;
  onEndUsage: () => void;
  onRemind: () => void;
}

const ActionButtons = ({
  user,
  requestData,
  isUsingLoading,
  isEndUsageLoading,
  isReminderSent,
  onApprove,
  onReject,
  onCancel,
  onUsingVehicle,
  onEndUsage,
  onRemind,
}: ActionButtonsProps) => {
  const { t } = useTranslation();

  const isOverdue = (endDate: string) => {
    const today = new Date().toDateString();
    const dueDate = new Date(endDate).toDateString();
    return new Date(today) > new Date(dueDate);
  };

  const isNearDueDate = (endDate: string) => {
    const now = new Date();
    const dueDate = new Date(endDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 1 && daysDiff > 0;
  };

  const getRemindButtonColor = (endTime: string) => {
    if (isOverdue(endTime)) return 'red';
    if (isNearDueDate(endTime)) return 'orange';
    return 'amber';
  };

  const getRemindButtonText = (endTime: string) => {
    if (isReminderSent) return t('common.button.remind.sent');
    if (isOverdue(endTime)) return t('common.button.remind.urgent');
    if (isNearDueDate(endTime)) return t('common.button.remind.soon');
    return t('common.button.remind.normal');
  };

  if (user?.role === 2) {
    return (
      <View className="mt-4">
        {requestData.status === 0 && (
          <View className="flex-row justify-between">
            <ActionButton
              title={t('common.button.approve')}
              onPress={onApprove}
              color="green"
              width="half"
            />
            <ActionButton
              title={t('common.button.reject')}
              onPress={onReject}
              color="red"
              width="half"
            />
          </View>
        )}

        {requestData.status === 1 && user?.userId !== requestData.userId && (
          <ActionButton title={t('common.button.cancel')} onPress={onCancel} color="gray" />
        )}

        {requestData.status === 4 && (
          <ActionButton
            title={getRemindButtonText(requestData.endTime)}
            onPress={onRemind}
            color={getRemindButtonColor(requestData.endTime)}
            disabled={isReminderSent}
          />
        )}
      </View>
    );
  }

  if (user?.userId === requestData.userId) {
    return (
      <View className="mt-4">
        {requestData.status === 0 && (
          <ActionButton title={t('common.button.cancel')} onPress={onCancel} color="gray" />
        )}

        {requestData.status === 1 && (
          <View className="flex-row justify-between">
            <ActionButton
              title={t('common.button.cancel')}
              onPress={onCancel}
              color="gray"
              width="half"
            />
            <ActionButton
              title={t('common.button.usingVehicle')}
              onPress={onUsingVehicle}
              color="blue"
              width="half"
              loading={isUsingLoading}
              loadingText={t('common.button.loading')}
            />
          </View>
        )}

        {requestData.status === 4 && (
          <ActionButton
            title={t('common.button.endUsage')}
            onPress={onEndUsage}
            color="green"
            loading={isEndUsageLoading}
            loadingText={t('common.button.ending')}
          />
        )}
      </View>
    );
  }

  return null;
};

export default ActionButtons;
