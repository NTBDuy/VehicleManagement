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
import RequestLocation from '@/components/request/RequestLocation';
import RequestVehiclePicker from '@/components/request/RequestVehiclePicker';
import { LocationType } from '@/types/Location';
import { UserService } from '@/services/userService';

interface validateError {
  startLocation: string;
  endLocation: string;
  purpose: string;
}

enum TabState {
  DATE = 0,
  VEHICLE = 1,
  LOCATION = 2,
  CONFIRM = 3,
}

const RequestCreateScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabState>(TabState.DATE);
  const [completedTabs, setCompletedTabs] = useState<Set<TabState>>(new Set());
  const [isMultiDayTrip, setIsMultiDayTrip] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableVehicle, setAvailableVehicle] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [estimatedTotalDistance, setEstimatedTotalDistance] = useState(0);
  const [purpose, setPurpose] = useState('');
  const [isAssignDriver, setIsAssignDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<validateError>>({});

  const tabs = [
    { id: TabState.DATE, title: t('request.create.tabs.time'), icon: faCalendarDays },
    { id: TabState.VEHICLE, title: t('request.create.tabs.vehicle'), icon: faCarSide },
    { id: TabState.LOCATION, title: t('request.create.tabs.location'), icon: faLocation },
    { id: TabState.CONFIRM, title: t('request.create.tabs.confirm'), icon: faCalendarCheck },
  ];

  useFocusEffect(
    useCallback(() => {
      clearContent();
    }, [])
  );

  const validateCurrentTab = (): boolean => {
    switch (activeTab) {
      case TabState.DATE:
        return true;

      case TabState.VEHICLE:
        if (!selectedVehicle?.vehicleId) {
          return false;
        }
        return true;

      case TabState.LOCATION:
        if (startLocation.trim() === '') {
          return false;
        }
        if (endLocation.trim() === '') {
          return false;
        }
        return true;

      case TabState.CONFIRM:
        if (purpose.trim() === '') {
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentTab()) return;
    setCompletedTabs((prev) => new Set([...prev, activeTab]));
    if (activeTab === TabState.DATE) {
      await fetchAvailableVehicle();
    } else if (activeTab < TabState.CONFIRM) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleBack = () => {
    if (activeTab > TabState.DATE) {
      setActiveTab(activeTab - 1);
      setErrors({});
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TabState.DATE:
        return renderDateComponent();
      case TabState.VEHICLE:
        return renderVehicleComponent();
      case TabState.LOCATION:
        return renderDestinationComponent();
      case TabState.CONFIRM:
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
      setIsDisabled={(disabled) => {
        if (!disabled) {
          setCompletedTabs((prev) => new Set([...prev, TabState.DATE]));
        } else {
          setCompletedTabs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(TabState.DATE);
            return newSet;
          });
        }
      }}
      handleClearList={clearAvailableList}
    />
  );

  const renderVehicleComponent = () => (
    <RequestVehiclePicker
      availableVehicle={availableVehicle}
      setSelectedVehicle={(vehicle) => {
        setSelectedVehicle(vehicle);
        if (vehicle) {
          setCompletedTabs((prev) => new Set([...prev, TabState.VEHICLE]));
        }
      }}
      selectedVehicle={selectedVehicle}
    />
  );

  const renderDestinationComponent = () => (
    <RequestLocation
      startLocation={startLocation}
      setStartLocation={setStartLocation}
      endLocation={endLocation}
      setEndLocation={setEndLocation}
      setLocations={setLocations}
      locations={locations}
      errors={errors}
      estimatedTotalDistance={estimatedTotalDistance}
      setEstimatedTotalDistance={setEstimatedTotalDistance}
    />
  );

  const renderConfirmComponent = () => (
    <RequestConfirm
      startDate={startDate}
      endDate={endDate}
      selectedVehicle={selectedVehicle}
      purpose={purpose}
      setPurpose={setPurpose}
      isAssignDriver={isAssignDriver}
      setIsAssignDriver={setIsAssignDriver}
      errors={errors.purpose || ''}
      locations={locations}
      estimatedTotalDistance={estimatedTotalDistance}
    />
  );

  const isAvailableDay = async (startDate: string, endDate: string) => {
    try {
      const results = await UserService.getUserRequests(startDate, endDate);
      if (results.length > 0) {
        showToast.error(
          'Bạn đã có lịch đặt xe trong khoảng ngày này xin vui lòng kiểm tra và chọn ngày khác!'
        );
        return false;
      } else {
        return true;
      }
    } catch (error) {
      showToast.error(t('common.error.title'), t('common.error.generic'));
      return false;
    }
  };

  const fetchAvailableVehicle = async () => {
    if (isMultiDayTrip && endDate === '') {
      showToast.error(t('common.error.endDate'));
      return;
    }

    try {
      setIsLoading(true);

      if ((await isAvailableDay(startDate, endDate)) == false) {
        return;
      }

      const data = await VehicleService.getAvailableVehicles(
        startDate,
        isMultiDayTrip ? endDate : startDate
      );

      setAvailableVehicle(data);

      if (data.length > 0) {
        setActiveTab(TabState.VEHICLE);
      } else {
        showToast.error(t('common.error.noVehicleAvailable'));
      }
    } catch (error) {
      console.error('Fetch vehicle error:', error);
      showToast.error(t('common.error.title'), t('common.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearAvailableList = () => {
    setAvailableVehicle([]);
    setSelectedVehicle(undefined);
    setCompletedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(TabState.VEHICLE);
      newSet.delete(TabState.LOCATION);
      newSet.delete(TabState.CONFIRM);
      return newSet;
    });
  };

  const handleConfirm = async () => {
    if (!validateCurrentTab()) return;

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
        locations: locations,
      };

      const response = await RequestService.createRequest(requestDTO);
      if (response) {
        showToast.success(`${t('common.success.newRequest')}`);
        clearContent();
        navigation.getParent()?.navigate('HistoryStack');
      } else {
        showToast.error(`${t('common.error.newRequest')}`);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearContent = () => {
    setActiveTab(TabState.DATE);
    setCompletedTabs(new Set());
    setIsMultiDayTrip(false);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setSelectedVehicle(undefined);
    setAvailableVehicle([]);
    setLocations([]);
    setStartLocation('');
    setEndLocation('');
    setEstimatedTotalDistance(0);
    setPurpose('');
    setIsAssignDriver(false);
    setErrors({});
  };

  const isNextButtonEnabled = () => {
    switch (activeTab) {
      case TabState.DATE:
        return completedTabs.has(TabState.DATE) && !isLoading;
      case TabState.VEHICLE:
        return selectedVehicle !== undefined;
      case TabState.LOCATION:
        return startLocation.trim() !== '' && endLocation.trim() !== '';
      case TabState.CONFIRM:
        return purpose.trim() !== '' && !isLoading;
      default:
        return false;
    }
  };

  const showDisabledReason = () => {
    const newErrors: Partial<validateError> = {};
    switch (activeTab) {
      case TabState.DATE:
        showToast.error(t('common.error.dateIncomplete'));
        break;
      case TabState.VEHICLE:
        showToast.error(t('common.error.vehicleUnselected'));
        break;
      case TabState.LOCATION:
        if (!startLocation.trim()) {
          newErrors.startLocation = `${t('validate.required.startLocation')}`;
        } else if (!endLocation.trim()) {
          newErrors.endLocation = `${t('validate.required.endLocation')}`;
        }
        break;
      case TabState.CONFIRM:
        showToast.error(t('validate.required.purpose'));
        newErrors.purpose = t('validate.required.purpose');
        break;
    }
    setErrors(newErrors);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title={t('request.create.title')} />

      <View className="mt-4 flex-1 px-6">
        <View className="mb-4 overflow-hidden rounded-2xl">
          <View className="flex-row">
            {tabs.map((tab) => (
              <View key={tab.id} className="flex-1 items-center py-4">
                <View className="flex-row items-center">
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id
                        ? 'bg-blue-500'
                        : completedTabs.has(tab.id)
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                    } mr-1 w-8`}></View>
                  <FontAwesomeIcon
                    icon={tab.icon}
                    color={
                      activeTab === tab.id
                        ? '#3b82f6'
                        : completedTabs.has(tab.id)
                          ? '#10b981'
                          : '#6b7280'
                    }
                    size={20}
                  />
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id
                        ? 'bg-blue-500'
                        : completedTabs.has(tab.id)
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                    } ml-1 w-8`}></View>
                </View>
                <Text
                  className={`mt-1 text-xs font-medium ${
                    activeTab === tab.id
                      ? 'text-blue-500'
                      : completedTabs.has(tab.id)
                        ? 'text-green-500'
                        : 'text-gray-600'
                  }`}>
                  {tab.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className="flex-1">{renderTabContent()}</View>
      </View>

      <View className="bg-gray-50 px-6 pb-4">
        {activeTab === TabState.DATE && (
          <TouchableOpacity
            className={`mt-4 w-full py-4 ${
              !isNextButtonEnabled() ? 'bg-gray-400' : 'bg-blue-400'
            } rounded-2xl`}
            onPress={() => {
              if (!isNextButtonEnabled()) {
                showDisabledReason();
              } else {
                handleNext();
              }
            }}>
            <Text className="text-center text-lg font-bold text-white">
              {isLoading ? `${t('common.button.loading')}` : `${t('common.button.next')}`}
            </Text>
          </TouchableOpacity>
        )}

        {activeTab > TabState.DATE && activeTab < TabState.CONFIRM && (
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4"
              onPress={handleBack}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mt-4 w-[48%] rounded-2xl py-4 ${
                !isNextButtonEnabled() ? 'bg-gray-400' : 'bg-blue-400'
              }`}
              onPress={() => {
                if (!isNextButtonEnabled()) {
                  showDisabledReason();
                } else {
                  handleNext();
                }
              }}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.next')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === TabState.CONFIRM && (
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4"
              onPress={handleBack}>
              <Text className="text-center text-lg font-bold text-white">
                {t('common.button.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mt-4 w-[48%] rounded-2xl py-4 ${
                !isNextButtonEnabled() ? 'bg-gray-400' : 'bg-blue-400'
              }`}
              onPress={() => {
                if (!isNextButtonEnabled()) {
                  showDisabledReason();
                } else {
                  handleConfirm();
                }
              }}>
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
