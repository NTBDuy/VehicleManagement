import { Switch, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { formatDayMonthEn, formatDayMonthVi } from 'utils/datetimeUtils';

import Vehicle from 'types/Vehicle';

import InfoRow from '@/components/ui/InfoRowComponent';
import InputField from '@/components/ui/InputFieldComponent';
import { getLocationLabel } from '@/utils/requestUtils';
import { useTranslation } from 'react-i18next';
import { LocationType } from '@/types/Location';
import { DistanceNotice } from './DistanceNotice';

interface ConfirmComponentProps {
  startDate: string;
  endDate: string;
  selectedVehicle: Vehicle | undefined;
  purpose: string;
  setPurpose: (value: string) => void;
  isAssignDriver: boolean;
  setIsAssignDriver: (value: boolean) => void;
  errors: string;
  locations: LocationType[];
  estimatedTotalDistance: number;
}

const RequestConfirm = ({
  startDate,
  endDate,
  selectedVehicle,
  purpose,
  setPurpose,
  isAssignDriver,
  setIsAssignDriver,
  errors,
  locations,
  estimatedTotalDistance,
}: ConfirmComponentProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const isViCurrent = currentLocale === 'vi-VN';

  const toggleSwitchDriver = () => setIsAssignDriver(!isAssignDriver);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View>
        <View className="rounded-2xl bg-white mb-3">
          <View className="bg-gray-50 px-4 pb-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('request.create.confirm.sectionTitle.info')}
            </Text>
          </View>

          <View className="p-4">
            <InfoRow
              label={t('request.create.confirm.label.time')}
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {isViCurrent ? formatDayMonthVi(startDate) : formatDayMonthEn(startDate)} -
                  {isViCurrent ? formatDayMonthVi(endDate) : formatDayMonthEn(endDate)}
                </Text>
              }
            />
            <InfoRow
              label={t('request.create.confirm.label.vehicle')}
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {selectedVehicle?.brand} {selectedVehicle?.model} #{selectedVehicle?.licensePlate}
                </Text>
              }
            />
            {locations.map((item) => (
              <InfoRow
                key={item.order}
                label={getLocationLabel(item.order, locations.length, t)}
                value=""
                valueComponent={
                  <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                    {item.address}{' '}
                    {item.note ? (
                      <Text className="font-normal italic text-gray-500">
                        {`\n`} {item.note}
                      </Text>
                    ) : (
                      ''
                    )}
                  </Text>
                }
              />
            ))}
            <InfoRow
              label={t('common.fields.estimateDistance')}
              value=""
              valueComponent={
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {estimatedTotalDistance} Km
                </Text>
              }
              isLast
            />
          </View>
        </View>

        <DistanceNotice show={locations.length > 0} />

        <View className="mt-4 rounded-2xl bg-white">
          <View className="bg-gray-50 px-4 pb-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('request.create.confirm.sectionTitle.purpose')}
            </Text>
          </View>
          <View className="p-4">
            <InputField
              label={t('request.create.confirm.label.detailedPurpose')}
              value={purpose}
              onChangeText={setPurpose}
              placeholder={t('request.create.confirm.placeholder.purpose')}
              require={false}
              multiline={true}
              numberOfLines={4}
              error={errors}
            />
          </View>
        </View>
        <View className="mt-4 rounded-2xl bg-white">
          <View className="bg-gray-50 px-4 pb-3">
            <Text className="text-lg font-semibold text-gray-800">
              {t('request.create.confirm.sectionTitle.driver')}
            </Text>
          </View>
          <View className="p-4">
            <View className="mb-2">
              <View className="flex-row items-center justify-between">
                <Switch
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={isAssignDriver ? '#fff' : '#f3f4f6'}
                  ios_backgroundColor="#d1d5db"
                  onValueChange={toggleSwitchDriver}
                  value={isAssignDriver}
                  className="-m-2 scale-75"
                />
                <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                  {isAssignDriver
                    ? `${t('request.create.confirm.switchText.assign')}`
                    : `${t('request.create.confirm.switchText.self')}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RequestConfirm;
