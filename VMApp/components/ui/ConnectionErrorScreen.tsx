import { showToast } from '@/utils/toast';
import { faServer, faWifi } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const WifiOffIcon = ({ size = 32, color = '#ef4444' }) => (
  <View className="relative">
    <FontAwesomeIcon icon={faWifi} size={size} color={color} />
    <View className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
  </View>
);

export default function ConnectionErrorScreen({ onRetry }: { onRetry: () => void }) {
  const [gateway, setGateway] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { t } = useTranslation();

  useEffect(() => {
    const loadGateway = async () => {
      const savedGateway = await AsyncStorage.getItem('gateway');
      if (savedGateway) {
        setGateway(savedGateway);
      }
    };

    loadGateway();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRetry = async () => {
    const trimmed = gateway.trim();

    if (!trimmed) {
      showToast.error(t('common.error.serverAddressRequired'));
      return;
    }

    setIsLoading(true);

    try {
      await AsyncStorage.setItem('gateway', trimmed);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onRetry();
    } catch (err) {
      console.error('Lỗi lưu gateway:', err);
      showToast.error(t('common.error.cannotSaveServerAddress'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100">
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 items-center justify-center px-8">
        <View className="mb-8 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-red-50 shadow-lg">
            <WifiOffIcon size={32} />
          </View>

          <View className="flex-row items-center">
            <View className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <Text className="text-xs font-medium uppercase tracking-wider text-red-600">
              {t('connection.iconSubTitle')}
            </Text>
          </View>
        </View>

        <View className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl shadow-black/5">
          <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
            {t('connection.title')}
          </Text>
          <Text className="mb-6 text-center text-sm leading-relaxed text-gray-600">
            {t('connection.description')}
          </Text>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              {t('connection.serverAddress')}
            </Text>
            <View className="relative">
              <TextInput
                value={gateway}
                onChangeText={setGateway}
                placeholder="192.168.2.103:8018"
                placeholderTextColor="#9CA3AF"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900 focus:border-blue-500 focus:bg-white"
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
                selectTextOnFocus
              />
              <View className="absolute right-3 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faServer} size={16} color="#6B7280" />
              </View>
            </View>
          </View>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleRetry}
              disabled={isLoading}
              className={`w-full rounded-xl px-6 py-4 ${
                isLoading
                  ? 'bg-blue-400'
                  : 'bg-blue-600 shadow-lg shadow-blue-600/25 active:bg-blue-700'
              }`}>
              <Text className="text-center text-base font-semibold text-white">
                {isLoading
                  ? t('common.button.connectionAgainLoading')
                  : t('common.button.connectionAgain')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGateway('')}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 active:bg-gray-100">
              <Text className="text-center text-sm font-medium text-gray-600">
                {t('common.button.deleteSavedAddress')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8 rounded-lg bg-blue-50 p-4">
          <Text className="text-center text-xs text-blue-600">
            💡 <Text className="font-medium">{t('connection.hint')}:</Text>{' '}
            {t('connection.hintText')}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
