import { formatVietnamPhoneNumber } from '@/utils/userUtils';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View, Linking } from 'react-native';

import Assignment from 'types/Assignment';

import InfoRow from '@/components/ui/InfoRowComponent';

interface DriverInformationProps {
  assignmentData: Assignment;
}

const DriverInformation = ({ assignmentData }: DriverInformationProps) => {
  const { t } = useTranslation();

  const handleCall = (phone: number) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="bg-gray-50 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-800">
          {t('request.detail.driver.section')}
        </Text>
      </View>

      <View className="p-4">
        <InfoRow
          label={t('request.detail.driver.name')}
          value={assignmentData?.driver.fullName || t('common.fields.noInfo')}
        />
        <InfoRow
          label={t('common.fields.phone')}
          value=""
          valueComponent={
            <Pressable
              onPress={() => {
                const rawPhone = assignmentData.driver.phoneNumber ?? '';
                const cleanPhone = rawPhone.replace(/^deleted_(\d+__)?/, '');
                handleCall(Number(cleanPhone));
              }}>
              <Text className="text-right font-semibold text-gray-800">
                {assignmentData?.driver.phoneNumber
                  ? formatVietnamPhoneNumber(assignmentData?.driver.phoneNumber)
                  : t('common.fields.noInfo')}
              </Text>
            </Pressable>
          }
          isLast
        />
      </View>
    </View>
  );
};

export default DriverInformation;
