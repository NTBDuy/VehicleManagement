import { getLocationLabel } from '@/utils/requestUtils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { formatDate } from 'utils/datetimeUtils';

import Request from 'types/Request';
import InfoRow from '../ui/InfoRowComponent';

interface InformationSectionProps {
  requestData: Request;
}

const InformationSection = ({ requestData }: InformationSectionProps) => {
  const { t } = useTranslation();
  const [isASameDate] = useState(requestData.startTime == requestData.endTime);

  const handleMapsView = (lat: number, long: number) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    const latLng = `${lat},${long}`;
    const label = 'Destination';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => console.error('Failed to open map:', err));
    }
  };

  const handleCall = (phone: number) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="bg-gray-50 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-800">
          {t('request.detail.info.section')}
        </Text>
      </View>

      <View className="p-4">
        <InfoRow
          label={t('request.detail.info.requestBy')}
          value={requestData.user?.fullName || t('common.fields.noInfo')}
        />
        <InfoRow
          label="Số điện thoại"
          value=""
          valueComponent={
            <Pressable onPress={() => handleCall(Number(requestData.user?.phoneNumber))}>
              <Text className="text-right font-semibold text-gray-800">
                {requestData.user?.phoneNumber || t('common.fields.noInfo')}
              </Text>
            </Pressable>
          }
        />
        <InfoRow
          label={
            !isASameDate ? `${t('request.detail.info.dateRange')}` : `${t('common.fields.date')}`
          }
          value=""
          valueComponent={
            <Text className="max-w-[60%] text-right font-semibold text-gray-800">
              {!isASameDate
                ? `${formatDate(requestData.startTime)} - ${formatDate(requestData.endTime)}`
                : `${formatDate(requestData.startTime)}`}
            </Text>
          }
        />
        {requestData.locations.map((item) => (
          <InfoRow
            key={item.id}
            label={getLocationLabel(item.order, requestData.locations.length)}
            value=""
            valueComponent={
              <Pressable
                className="max-w-[60%]"
                onPress={() => handleMapsView(item.latitude, item.longitude)}>
                <Text className="text-right font-semibold text-gray-800">
                  {item.address}{' '}
                  {item.note ? (
                    <Text className="font-normal italic text-gray-500">
                      {`\n`} {item.note}
                    </Text>
                  ) : (
                    <Text></Text>
                  )}
                </Text>
              </Pressable>
            }
          />
        ))}
        <InfoRow
          label={t('request.detail.info.vehicle')}
          value=""
          valueComponent={
            <Text className="max-w-[60%] text-right font-semibold text-gray-800">
              {requestData.vehicle?.brand} {requestData.vehicle?.model} #
              {requestData.vehicle?.licensePlate}
            </Text>
          }
        />
        <InfoRow
          label={t('common.fields.purpose')}
          value={requestData.purpose || t('common.fields.noInfo')}
        />
        <InfoRow
          label={t('request.detail.info.driverRequired')}
          value={
            requestData.isDriverRequired
              ? `${t('request.create.confirm.switchText.assign')}`
              : `${t('request.create.confirm.switchText.self')}`
          }
        />
        <InfoRow
          label={t('request.detail.info.requestDate')}
          value={formatDate(requestData.createdAt)}
          isLast={!Number.isFinite(requestData.totalDistance)}
        />
        {Number.isFinite(requestData.totalDistance) && (
          <InfoRow
            label="Quãng đường đã đi"
            value=""
            valueComponent={
              <Text className="text-right font-semibold text-gray-800">
                {requestData.totalDistance} Km
              </Text>
            }
            isLast
          />
        )}
      </View>
    </View>
  );
};

export default InformationSection;
