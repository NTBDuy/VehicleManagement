import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { LocationType } from '@/types/Location';
import { calculateDistance } from '@/utils/requestUtils';
import { LocationInput } from './LocationInput';
import { LocationDetails } from './LocationDetails';
import { LocationModal } from './LocationModal';
import { DistanceNotice } from './DistanceNotice';
import { useTranslation } from 'react-i18next';

interface validateError {
  startLocation: string;
  endLocation: string;
  purpose: string;
}

interface LocationComponentProps {
  startLocation: string;
  endLocation: string;
  setStartLocation: (value: string) => void;
  setEndLocation: (value: string) => void;
  locations: LocationType[];
  setLocations: Dispatch<SetStateAction<LocationType[]>>;
  errors: Partial<validateError>;
  estimatedTotalDistance: number;
  setEstimatedTotalDistance: (value: number) => void;
}

interface StopPoint {
  id: string;
  value: string;
  order: number;
}

interface MapLocation {
  longitude: number;
  latitude: number;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
}

const RequestLocation: React.FC<LocationComponentProps> = ({
  startLocation,
  endLocation,
  setStartLocation,
  setEndLocation,
  setLocations,
  locations,
  errors,
  estimatedTotalDistance,
  setEstimatedTotalDistance,
}) => {
  const initialLocation = {
    latitude: 10.7769,
    longitude: 106.7009,
  };

  const { t } = useTranslation();
  const [activeInput, setActiveInput] = useState<'from' | 'to' | string | null>('from');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<MapLocation>(initialLocation);
  const [result, setResult] = useState<SearchResult>();
  const [notePointLocation, setNotePointLocation] = useState('');
  const [isShowNote, setIsShowNote] = useState(false);
  const [stopPoint, setStopPoint] = useState<StopPoint[]>([]);

  useEffect(() => {
    setIsShowNote(false);
  }, [showLocationModal]);

  useEffect(() => {
    if (locations.length > 1) {
      let sum = 0;
      for (let i = 1; i < locations.length; i++) {
        sum += calculateDistance(
          locations[i - 1].latitude,
          locations[i - 1].longitude,
          locations[i].latitude,
          locations[i].longitude
        );
      }
      const roundedSum = Math.round(sum * 100) / 100;
      setEstimatedTotalDistance(roundedSum);
    }
  }, [locations, setEstimatedTotalDistance]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchAddress(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchAddress = async (text: string) => {
    if (!text.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setResult(json[0]);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission denied');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    fetchAddressFromLocation(loc.coords.latitude, loc.coords.longitude);
  };

  const fetchAddressFromLocation = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setResult(json);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const getOrderByActiveInput = () => {
    if (activeInput === 'from') return 0;
    if (activeInput === 'to') return Math.max(stopPoint.length + 1, 1);
    if (typeof activeInput === 'string' && activeInput.startsWith('stop_')) {
      const stop = stopPoint.find((s) => s.id === activeInput);
      return stop ? stop.order : stopPoint.length + 1;
    }
    return 0;
  };

  const handleInputPress = (inputType: 'from' | 'to' | string) => {
    setActiveInput(inputType);
    let targetLocation: LocationType | undefined;

    if (inputType === 'from') {
      targetLocation = locations.find((loc) => loc.order === 0);
    } else if (inputType === 'to') {
      const maxOrder = Math.max(...locations.map((l) => l.order));
      targetLocation = locations.find((loc) => loc.order === maxOrder && loc.order > 0);
    } else if (typeof inputType === 'string' && inputType.startsWith('stop_')) {
      const stop = stopPoint.find((s) => s.id === inputType);
      if (stop) {
        targetLocation = locations.find((loc) => loc.order === stop.order);
      }
    }

    if (targetLocation) {
      setLocation({
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude,
      });
      setResult(undefined);
    } else {
      setLocation(initialLocation);
      setResult(undefined);
    }

    setShowLocationModal(true);
  };

  const handleSwapLocations = () => {
    if (stopPoint.length > 0) return;

    const temp = startLocation;
    setStartLocation(endLocation);
    setEndLocation(temp);

    setLocations((prev) => {
      const startLoc = prev.find((loc) => loc.order === 0);
      const endLoc = prev.find((loc) => loc.order === 1);

      if (!startLoc || !endLoc) return prev;

      return prev.map((location) => {
        if (location.order === 0) return { ...endLoc, order: 0 };
        if (location.order === 1) return { ...startLoc, order: 1 };
        return location;
      });
    });
  };

  const addStopPoint = () => {
    const newOrder = stopPoint.length + 1;
    const newStopPoint: StopPoint = {
      id: `stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      value: '',
      order: newOrder,
    };

    setStopPoint((prev) => [...prev, newStopPoint]);

    setLocations((prev) => {
      return prev.map((loc) => {
        const maxOrder = Math.max(...prev.map((l) => l.order));
        if (loc.order === maxOrder && loc.order > 0) {
          return { ...loc, order: newOrder + 1 };
        }
        return loc;
      });
    });
  };

  const removeStopPoint = (stopId: string) => {
    const stopToRemove = stopPoint.find((stop) => stop.id === stopId);
    if (!stopToRemove) return;

    const removedOrder = stopToRemove.order;
    setStopPoint((prev) => {
      const filtered = prev.filter((stop) => stop.id !== stopId);
      return filtered.map((stop) => ({
        ...stop,
        order: stop.order > removedOrder ? stop.order - 1 : stop.order,
      }));
    });

    setLocations((prev) => {
      return prev
        .filter((loc) => loc.order !== removedOrder)
        .map((loc) => {
          if (loc.order > removedOrder) {
            return { ...loc, order: loc.order - 1 };
          }
          return loc;
        });
    });
  };

  const updateStopPoint = (stopId: string, value: string) => {
    setStopPoint((prev) => prev.map((stop) => (stop.id === stopId ? { ...stop, value } : stop)));
  };

  const handleConfirmLocation = () => {
    if (result) {
      const selectedLocation = result.display_name || result.name || '';
      const targetOrder = getOrderByActiveInput();
      const fallbackName = result.display_name ? result.display_name.split(',')[0].trim() : '';
      const locationName = result.name || fallbackName;

      setLocations((prev) => {
        const newPoint: LocationType = {
          name: locationName,
          address: result.display_name || '',
          note: notePointLocation,
          latitude: Number(result.lat) || 0,
          longitude: Number(result.lon) || 0,
          order: targetOrder,
        };

        const filteredLocations = prev.filter((loc) => loc.order !== targetOrder);
        const updatedLocations = [...filteredLocations, newPoint].sort((a, b) => a.order - b.order);
        return updatedLocations;
      });

      if (activeInput === 'from') {
        setStartLocation(selectedLocation);
      } else if (activeInput === 'to') {
        setEndLocation(selectedLocation);
      } else if (typeof activeInput === 'string' && activeInput.startsWith('stop_')) {
        updateStopPoint(activeInput, selectedLocation);
      }

      setResult(undefined);
      setNotePointLocation('');
      setShowLocationModal(false);
    }
  };

  const handleMapPress = (latitude: number, longitude: number) => {
    fetchAddressFromLocation(latitude, longitude);
    setLocation({ latitude, longitude });
  };

  const handleResultPress = (result: SearchResult) => {
    const newLocation = {
      longitude: Number(result.lon),
      latitude: Number(result.lat),
    };
    setLocation(newLocation);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <LocationInput
        startLocation={startLocation}
        endLocation={endLocation}
        stopPoints={stopPoint}
        errors={errors}
        onStartLocationChange={setStartLocation}
        onEndLocationChange={setEndLocation}
        onStopPointChange={updateStopPoint}
        onInputPress={handleInputPress}
        onSwapLocations={handleSwapLocations}
        onAddStopPoint={addStopPoint}
        onRemoveStopPoint={removeStopPoint}
        t={t}
      />

      <LocationDetails
        locations={locations}
        estimatedTotalDistance={estimatedTotalDistance}
        stopPointsCount={stopPoint.length}
        t={t}
      />

      <DistanceNotice show={locations.length > 0} />

      <LocationModal
        visible={showLocationModal}
        activeInput={activeInput}
        location={location}
        searchQuery={searchQuery}
        result={result}
        notePointLocation={notePointLocation}
        isShowNote={isShowNote}
        stopPoints={stopPoint}
        onClose={() => setShowLocationModal(false)}
        onSearch={setSearchQuery}
        onClearFilters={() => setSearchQuery('')}
        onMapPress={handleMapPress}
        onResultPress={handleResultPress}
        onCurrentLocation={fetchCurrentLocation}
        onConfirmLocation={handleConfirmLocation}
        onNoteChange={setNotePointLocation}
        onToggleNote={() => setIsShowNote(!isShowNote)}
        t={t}
      />
    </ScrollView>
  );
};

export default RequestLocation;
