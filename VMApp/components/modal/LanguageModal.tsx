import { showToast } from '@/utils/toast';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CountryFlag from 'react-native-country-flag';

Dimensions.get('window');

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

const LanguageModal = ({ visible, onClose }: LanguageModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    {
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      flag: 'us',
    },
    {
      code: 'vi-VN',
      name: 'Vietnamese',
      nativeName: 'Tiếng Việt',
      flag: 'vn',
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLanguageChange = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      closeModal();
      showToast.success(t('setting.languageChanged'));
    } catch (error) {
      showToast.error(t('setting.languageChangeError'));
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={closeModal}>
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 items-center justify-center bg-black/50 px-4">
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
          <View className="flex-row items-center justify-between border-b border-gray-100 p-6">
            <Text className="text-xl font-bold text-gray-800">{t('setting.selectLanguage')}</Text>
            <TouchableOpacity
              onPress={closeModal}
              className="rounded-full bg-gray-100 p-2"
              activeOpacity={0.7}>
              <FontAwesomeIcon icon={faTimes} size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="px-2 py-4">
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleLanguageChange(language.code)}
                className={`mx-2 flex-row items-center rounded-xl p-4 ${
                  currentLanguage === language.code
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'bg-transparent hover:bg-gray-50'
                } ${index !== languages.length - 1 ? 'mb-2' : ''}`}
                activeOpacity={0.7}>
                <View className="mr-4 rounded-lg bg-white p-2 shadow-sm">
                  <CountryFlag isoCode={language.flag} size={24} />
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      currentLanguage === language.code ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                    {language.name}
                  </Text>
                  <Text
                    className={`text-sm ${
                      currentLanguage === language.code ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    {language.nativeName}
                  </Text>
                </View>

                {currentLanguage === language.code && (
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <View className="h-2 w-2 rounded-full bg-white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default LanguageModal;
