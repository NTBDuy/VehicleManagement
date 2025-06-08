import { faCar, faCarSide, faTruckPickup, faVanShuttle } from '@fortawesome/free-solid-svg-icons';

export const getVehicleTypeIcon = (type: string) => {
  switch (type) {
    case 'Sedan':
      return faCar;
    case 'SUV':
      return faCarSide;
    case 'Truck':
      return faTruckPickup;
    case 'Van':
      return faVanShuttle;
    default:
      return faCar;
  }
};

export const getVehicleBackground = (status: number): string => {
  const styles = ['bg-green-500', 'bg-blue-500', 'bg-orange-500'];
  return styles[status] ?? 'bg-gray-500';
};

export const getVehicleLabelEn = (status: number): string => {
  const label = ['Available', 'InUse', 'UnderMaintenance'];
  return label[status] ?? 'Unknown';
};

export const getVehicleLabelVi = (status: number): string => {
  const label = ['Khả dụng', 'Đang sử dụng', 'Bảo trì'];
  return label[status] ?? 'Không xác định';
};

