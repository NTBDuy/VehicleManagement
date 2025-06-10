import { useAuth } from '@/contexts/AuthContext';
import { RequestService } from '@/services/requestService';
import { VehicleService } from '@/services/vehicleService';
import { showToast } from '@/utils/toast';
import {
  faCalendarCheck,
  faCalendarDays,
  faCarSide,
  faLocation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import Vehicle from '@/types/Vehicle';

import Header from '@/components/layout/HeaderComponent';
import RequestConfirm from '@/components/request/RequestConfirm';
import RequestDatePicker from '@/components/request/RequestDatePicker';
import RequestDestination from '@/components/request/RequestDestination';
import RequestVehiclePicker from '@/components/request/RequestVehiclePicker';

interface validateError {
  startLocation: string;
  endLocation: string;
  purpose: string;
}

const RequestCreateScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isMultiDayTrip, setIsMultiDayTrip] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableVehicle, setAvailableVehicle] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [purpose, setPurpose] = useState('');
  const [isAssignDriver, setIsAssignDriver] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [errors, setErrors] = useState<Partial<validateError>>({});

  const tabs = [
    { id: 0, title: t('request.create.tabs.time'), icon: faCalendarDays },
    { id: 1, title: t('request.create.tabs.vehicle'), icon: faCarSide },
    { id: 2, title: t('request.create.tabs.location'), icon: faLocation },
    { id: 3, title: t('request.create.tabs.confirm'), icon: faCalendarCheck },
  ];

  useFocusEffect(
    useCallback(() => {
      clearContent();
    }, [])
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderDateComponent();
      case 1:
        return renderVehicleComponent();
      case 2:
        return renderDestinationComponent();
      case 3:
        return renderConfirmComponent();
      default:
        return renderDateComponent();
    }
  };

  const renderDateComponent = () => (
    <RequestDatePicker
      isMultiDayTrip={isMultiDayTrip}
      setIsMultiDayTrip={setIsMultiDayTrip}
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      setIsDisabled={setIsDisabled}
      handleClearList={clearAvailableList}
    />
  );

  const renderVehicleComponent = () => (
    <RequestVehiclePicker
      availableVehicle={availableVehicle}
      setSelectedVehicle={setSelectedVehicle}
      selectedVehicle={selectedVehicle}
    />
  );

  const renderDestinationComponent = () => (
    <RequestDestination
      startLocation={startLocation}
      setStartLocation={setStartLocation}
      endLocation={endLocation}
      setEndLocation={setEndLocation}
      errors={errors}
    />
  );

  const renderConfirmComponent = () => (
    <RequestConfirm
      startDate={startDate}
      endDate={endDate}
      startLocation={startLocation}
      endLocation={endLocation}
      selectedVehicle={selectedVehicle}
      purpose={purpose}
      setPurpose={setPurpose}
      isAssignDriver={isAssignDriver}
      setIsAssignDriver={setIsAssignDriver}
      errors={errors.purpose || ''}
    />
  );

  const fetchAvailableVehicle = async () => {
    if (endDate == '') {
      showToast.error(t('common.error.endDate'));
      return;
    }
    try {
      setIsLoading(true);
      const data = await VehicleService.getAvailableVehicles(
        startDate,
        isMultiDayTrip ? endDate : startDate
      );
      setAvailableVehicle(data);
      setActiveTab(activeTab + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateData = (): boolean => {
    const newErrors: Partial<validateError> = {};

    if (!selectedVehicle?.vehicleId) {
      showToast.error(
        `${t('request.create.toast.vehicleRequired.title')}`,
        `${t('request.create.toast.vehicleRequired.message')}`
      );
      setActiveTab(1);
      return false;
    }

    if (startLocation == '') {
      newErrors.startLocation = `${t('validate.required.startLocation')}`;
      setActiveTab(2);
    }

    if (endLocation == '') {
      newErrors.endLocation = `${t('validate.required.endLocation')}`;
      setActiveTab(2);
    }

    if (purpose.trim() === '') {
      newErrors.purpose = t('validate.required.purpose');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearAvailableList = () => {
    setAvailableVehicle([]);
  };

  const handleConfirm = async () => {
    if (!validateData()) return;
    try {
      setIsLoading(true);
      const requestDTO = {
        userId: user?.userId,
        vehicleId: selectedVehicle?.vehicleId,
        startTime: startDate,
        startLocation: startLocation,
        endLocation: endLocation,
        endTime: isMultiDayTrip ? endDate : startDate,
        purpose: purpose,
        isDriverRequired: isAssignDriver,
      };
      const response = await RequestService.createRequest(requestDTO);
      if (response) {
        showToast.success(
          `${t('request.create.toast.success.title')}`,
          `${t('request.create.toast.success.message')}`
        );
        clearContent();
        navigation.getParent()?.navigate('HistoryStack');
      } else {
        showToast.error(
          `${t('request.create.toast.fail.title')}`,
          `${t('request.create.toast.fail.message')}`
        );
      }
    } catch (error) {
      console.error('Reservation error:', error);
      showToast.error(
        `${t('request.create.toast.requestError.title')}`,
        `${t('request.create.toast.requestError.message')}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearContent = () => {
    setActiveTab(0);
    setSelectedVehicle(undefined);
    setPurpose('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setStartLocation('');
    setEndLocation('');
    setIsMultiDayTrip(false);
    setIsDisabled(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('request.create.title')} />

      <View className="mt-4 flex-1 px-6">
        <View className="mb-4 overflow-hidden rounded-2xl">
          <View className="flex-row">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                className={`flex-1 items-center py-4`}
                disabled={availableVehicle.length === 0}
                onPress={() => {
                  setActiveTab(tab.id);
                }}>
                <View className="flex-row items-center">
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                    } mr-1 w-8`}></View>
                  <FontAwesomeIcon
                    icon={tab.icon}
                    color={activeTab === tab.id ? '#3b82f6' : '#6b7280'}
                    size={20}
                  />
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                    } ml-1 w-8`}></View>
                </View>
                <Text
                  className={`mt-1 text-xs font-medium ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-600'
                  }`}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="flex-1">{renderTabContent()}</View>
      </View>

      <View className="bg-gray-50 px-6 pb-4">
        {activeTab === 0 && (
          <TouchableOpacity
            className={`mt-4 w-full py-4 ${isDisabled && !isLoading ? 'bg-gray-400' : 'bg-blue-400 '} rounded-2xl `}
            // disabled={isDisabled && !isLoading}
            onPress={fetchAvailableVehicle}>
            <Text className="text-center text-lg font-bold text-white">
              {isLoading ? `${t('common.button.loading')}` : `${t('common.button.next')}`}
            </Text>
          </TouchableOpacity>
        )}
        {activeTab === 1 && (
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 "
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-blue-400 py-4 "
              onPress={() => setActiveTab(activeTab + 1)}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.next')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 2 && (
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 "
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-blue-400 py-4 "
              onPress={() => setActiveTab(activeTab + 1)}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.next')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 3 && (
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 "
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mt-4 w-[48%] rounded-2xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-400 '}`}
              onPress={handleConfirm}
              disabled={isLoading}>
              <Text className="text-center text-lg font-bold text-white">
                {isLoading ? `${t('common.button.processing')}` : `${t('common.button.confirm')}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RequestCreateScreen;
