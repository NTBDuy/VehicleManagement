import { faCalendarCheck, faCalendarDays, faCarSide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { RequestService } from 'services/requestService';
import { VehicleService } from 'services/vehicleService';
import { showToast } from 'utils/toast';

import Vehicle from 'types/Vehicle';

import Header from 'components/HeaderComponent';
import RequestConfirm from 'components/RequestConfirm';
import RequestDatePicker from 'components/RequestDatePicker';
import RequestVehiclePicker from 'components/RequestVehiclePicker';

const RequestCreateScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMultiDayTrip, setIsMultiDayTrip] = useState(false);
  const [availableVehicle, setAvailableVehicle] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [purpose, setPurpose] = useState('');
  const [isAssignDriver, setIsAssignDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    clearContent();
     getAvailableVehicle();
  }, []);

  const tabs = [
    { id: 0, title: 'Choose Date', icon: faCalendarDays },
    { id: 1, title: 'Choose Vehicle', icon: faCarSide },
    { id: 2, title: 'Purpose & Confirm', icon: faCalendarCheck },
  ];

  const  getAvailableVehicle = async () => {
    const data = await VehicleService.getAvailableVehicles();
    return setAvailableVehicle(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderDateComponent();
      case 1:
        return renderVehicleComponent();
      case 2:
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
    />
  );

  const renderVehicleComponent = () => (
    <RequestVehiclePicker
      availableVehicle={availableVehicle}
      setSelectedVehicle={setSelectedVehicle}
      selectedVehicle={selectedVehicle}
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
    />
  );

  const validateData = (): boolean => {
    if (!selectedVehicle?.vehicleId) {
      showToast.error('Action Required', 'Please select a vehicle to continue.');
      setActiveTab(1);
      return false;
    }
    if (purpose.trim() === '') {
      showToast.error('Purpose Required', 'Please specify the purpose of your trip to continue.');
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateData()) return;
    try {
      setIsLoading(true);
      const requestData = {
        userId: user?.userId,
        vehicleId: selectedVehicle?.vehicleId,
        startTime: startDate,
        endTime: endDate,
        purpose: purpose,
        isDriverRequired: isAssignDriver,
      };
      const response = await RequestService.createRequest(requestData);
      if (response) {
        showToast.success('All Set!', 'We’ve received your reservation.');
        clearContent();
        navigation.getParent()?.navigate('HistoryStack');
      } else {
        showToast.error('Failed', 'Reservation could not be submitted.');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      showToast.error('Request Failed', 'We couldn’t complete your reservation. Please try again.');
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
    setIsMultiDayTrip(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="New Request" />
      <View className="flex-1 px-6 mt-4">
        <View className="mb-4 overflow-hidden rounded-2xl">
          <View className="flex-row">
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                className={`flex-1 items-center py-4`}
                onPress={() => setActiveTab(tab.id)}>
                <View className="flex-row items-center">
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                    } mr-1 w-12`}></View>
                  <FontAwesomeIcon
                    icon={tab.icon}
                    color={activeTab === tab.id ? '#3b82f6' : '#6b7280'}
                    size={20}
                  />
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                    } ml-1 w-12`}></View>
                </View>
                <Text
                  className={`mt-1 text-xs font-medium ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-600'
                  }`}>
                  {tab.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="flex-1 mb-24">{renderTabContent()}</View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12 bg-gray-50">
        {activeTab === 0 && (
          <Pressable
            className="w-full py-4 mt-4 bg-blue-400 rounded-2xl active:bg-blue-500"
            onPress={() => setActiveTab(activeTab + 1)}>
            <Text className="text-lg font-bold text-center text-white">Next</Text>
          </Pressable>
        )}
        {activeTab === 1 && (
          <View className="flex-row items-center justify-between">
            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 active:bg-gray-500"
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-lg font-bold text-center text-white">Back</Text>
            </Pressable>

            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-blue-400 py-4 active:bg-blue-500"
              onPress={() => setActiveTab(activeTab + 1)}>
              <Text className="text-lg font-bold text-center text-white">Next</Text>
            </Pressable>
          </View>
        )}
        {activeTab === 2 && (
          <View className="flex-row items-center justify-between">
            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 active:bg-gray-500"
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-lg font-bold text-center text-white">Back</Text>
            </Pressable>

            <Pressable
              className={`mt-4 w-[48%] rounded-2xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-400 active:bg-blue-500'}`}
              onPress={handleConfirm}
              disabled={isLoading}>
              <Text className="text-lg font-bold text-center text-white">
                {isLoading ? 'Confirming ...' : 'Confirm'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RequestCreateScreen;
