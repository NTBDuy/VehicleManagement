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

export const getVehicleLabel = (status: number, t: (key: string) => string): string => {
  const keys = ['common.status.available', 'common.status.inUse', 'common.status.maintenance'];
  const key = keys[status] ?? 'common.status.unknown';
  return t(key);
};

export const types = [
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Truck', value: 'Truck' },
  { label: 'Van', value: 'Van' },
];
