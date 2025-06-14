import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';

const WarningNotice = () => {
  const { t } = useTranslation();
  return (
    <View className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <View className="flex-row items-start">
        <View className="mr-3 mt-0.5">
          <FontAwesomeIcon icon={faWarning} size={18} color="#D97706" />
        </View>
        <View className="flex-1">
          <Text className="mb-2 text-sm font-semibold text-amber-800">
            {t('notice.important')}:
          </Text>
          <View className="space-y-1">
            <Text className="text-sm text-amber-700">
              • {t('notice.stopPointChecklist.photoInstruction')}
            </Text>
            <Text className="text-sm text-amber-700">
              • {t('notice.stopPointChecklist.gpsRequirement')}
            </Text>
            <Text className="text-sm text-amber-700">
              • {t('notice.stopPointChecklist.noteGuideline')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WarningNotice;
