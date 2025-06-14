import { getRequestBackgroundColor, getRequestLabel } from '@/utils/requestUtils';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { getUserInitials } from 'utils/userUtils';

import Request from 'types/Request';

interface RequestDetailHeaderProps {
  requestData: Request;
}

const RequestDetailHeader = ({ requestData }: RequestDetailHeaderProps) => {
  const { t } = useTranslation();

  const renderBadgeRequestStatus = ({ status }: { status: number }) => {
    const bgColor = getRequestBackgroundColor(status);
    return (
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text className="text-xs font-medium text-white">{getRequestLabel(status, t)}</Text>
      </View>
    );
  };

  return (
    <View className="px-4">
      <View className="mb-4 mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
        <View className="bg-blue-50 p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
                <Text className="text-lg font-bold text-white">
                  {getUserInitials(requestData.user?.fullName)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t('request.detail.requestId')} #{requestData.requestId}
                </Text>
                <Text className="mb-1 text-xl font-bold text-gray-900">
                  {requestData.user?.fullName}
                </Text>
                <Text className="text-sm text-gray-600">{t('request.detail.submitted')}</Text>
              </View>
            </View>
            <View className="ml-4">{renderBadgeRequestStatus({ status: requestData.status })}</View>
          </View>
          {requestData.status !== 0 && (
            <View className="mt-4 rounded-2xl border border-blue-200 bg-white/90 p-4 shadow-sm">
              <Text className="text-base leading-relaxed text-gray-700">
                <Text className="font-semibold">{t('common.fields.status')}: </Text>
                {t('request.detail.thisRequestWas')}{' '}
                <Text
                  className={`font-bold ${
                    requestData.status === 1
                      ? 'text-green-600'
                      : requestData.status === 4
                        ? 'text-green-600'
                        : requestData.status === 5
                          ? 'text-green-600'
                          : requestData.status === 2
                            ? 'text-red-600'
                            : 'text-orange-600'
                  }`}>
                  {requestData.status === 1 && t('common.status.approved')}
                  {requestData.status === 4 && t('common.status.approved')}
                  {requestData.status === 5 && t('common.status.approved')}
                  {requestData.status === 2 && t('common.status.rejected')}
                  {requestData.status === 3 && t('common.status.cancelled')}
                </Text>{' '}
                {t('request.detail.by')}{' '}
                <Text className="font-semibold text-gray-800">
                  {requestData.actionByUser.fullName || 'No Information'}
                </Text>
              </Text>
            </View>
          )}
        </View>

        {(requestData.status === 3 || requestData.status === 2) && (
          <View className="border-t border-red-100 bg-red-50 p-6">
            <View className="flex-row items-start">
              <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-sm">
                <Text className="text-sm font-bold text-white">!</Text>
              </View>
              <View className="flex-1">
                <Text className="mb-3 text-lg font-bold text-red-800">
                  {requestData.status === 3
                    ? `${t('request.detail.cancellationTitle')}`
                    : `${t('request.detail.rejectionTitle')}`}
                </Text>
                <View className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
                  <Text className="text-base font-medium leading-6 text-red-700">
                    {requestData.cancelOrRejectReason}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default RequestDetailHeader;
