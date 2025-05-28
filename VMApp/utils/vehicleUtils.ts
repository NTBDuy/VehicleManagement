import {
  faCar,
  faCarSide,
  faTruckPickup,
  faVanShuttle,
} from '@fortawesome/free-solid-svg-icons';

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
