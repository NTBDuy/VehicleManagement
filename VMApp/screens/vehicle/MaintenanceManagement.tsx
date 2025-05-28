import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { VehicleService } from 'services/vehicleService';

import MaintenanceSchedule from 'types/MaintenanceSchedule';

import Header from 'components/HeaderComponent';
import LoadingData from 'components/LoadingData';

const MaintenanceManagement = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMaintenanceList();
  }, []);

  const fetchMaintenanceList = async () => {
    try {
      setIsLoading(true);
      const response = await VehicleService.getAllMaintenance();
      setMaintenance(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Maintenance Management" />

      {isLoading ? <LoadingData /> : <View></View>}
    </SafeAreaView>
  );
};

export default MaintenanceManagement;
