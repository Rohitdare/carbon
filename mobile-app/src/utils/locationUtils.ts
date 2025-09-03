import { Alert, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to capture field data.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS permissions are handled differently
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        resolve(locationData);
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: error.message,
        };
        reject(locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

export const watchLocation = (
  onLocationUpdate: (location: LocationData) => void,
  onError: (error: LocationError) => void
): number => {
  return Geolocation.watchPosition(
    (position) => {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };
      onLocationUpdate(locationData);
    },
    (error) => {
      const locationError: LocationError = {
        code: error.code,
        message: error.message,
      };
      onError(locationError);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 1000, // Update every second
    }
  );
};

export const stopWatchingLocation = (watchId: number): void => {
  Geolocation.clearWatch(watchId);
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = deg2rad(lon2 - lon1);
  const lat1Rad = deg2rad(lat1);
  const lat2Rad = deg2rad(lat2);
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = rad2deg(bearing);
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

export const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const rad2deg = (rad: number): number => {
  return rad * (180 / Math.PI);
};

export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  } else if (distanceInKm < 10) {
    return `${distanceInKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceInKm)}km`;
  }
};

export const formatBearing = (bearing: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return `${directions[index]} (${Math.round(bearing)}°)`;
};

export const isValidCoordinate = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
};

export const getLocationAccuracy = (accuracy: number): string => {
  if (accuracy <= 5) {
    return 'Excellent';
  } else if (accuracy <= 10) {
    return 'Good';
  } else if (accuracy <= 20) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

export const getLocationAccuracyColor = (accuracy: number): string => {
  if (accuracy <= 5) {
    return '#4CAF50'; // Green
  } else if (accuracy <= 10) {
    return '#8BC34A'; // Light Green
  } else if (accuracy <= 20) {
    return '#FF9800'; // Orange
  } else {
    return '#F44336'; // Red
  }
};

export const getLocationAccuracyIcon = (accuracy: number): string => {
  if (accuracy <= 5) {
    return '🎯';
  } else if (accuracy <= 10) {
    return '📍';
  } else if (accuracy <= 20) {
    return '📍';
  } else {
    return '❓';
  }
};

export const getLocationErrorMessage = (error: LocationError): string => {
  switch (error.code) {
    case 1:
      return 'Location access denied. Please enable location services in your device settings.';
    case 2:
      return 'Location unavailable. Please check your GPS settings and try again.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return `Location error: ${error.message}`;
  }
};

export const showLocationError = (error: LocationError): void => {
  const message = getLocationErrorMessage(error);
  Alert.alert('Location Error', message, [{ text: 'OK' }]);
};

export const getLocationFromAddress = async (address: string): Promise<LocationData | null> => {
  try {
    // This would typically use a geocoding service like Google Maps API
    // For now, we'll return null as this requires an API key
    console.warn('Geocoding not implemented - requires API key');
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const getAddressFromLocation = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    // This would typically use a reverse geocoding service like Google Maps API
    // For now, we'll return null as this requires an API key
    console.warn('Reverse geocoding not implemented - requires API key');
    return null;
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
    return null;
  }
};

export const getLocationBounds = (locations: LocationData[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} => {
  if (locations.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  let north = locations[0].latitude;
  let south = locations[0].latitude;
  let east = locations[0].longitude;
  let west = locations[0].longitude;

  locations.forEach(location => {
    north = Math.max(north, location.latitude);
    south = Math.min(south, location.latitude);
    east = Math.max(east, location.longitude);
    west = Math.min(west, location.longitude);
  });

  return { north, south, east, west };
};

export const getLocationCenter = (locations: LocationData[]): LocationData => {
  if (locations.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const sum = locations.reduce(
    (acc, location) => ({
      latitude: acc.latitude + location.latitude,
      longitude: acc.longitude + location.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / locations.length,
    longitude: sum.longitude / locations.length,
  };
};

export const isLocationWithinBounds = (
  location: LocationData,
  bounds: { north: number; south: number; east: number; west: number }
): boolean => {
  return (
    location.latitude >= bounds.south &&
    location.latitude <= bounds.north &&
    location.longitude >= bounds.west &&
    location.longitude <= bounds.east
  );
};

export const getLocationHash = (latitude: number, longitude: number, precision: number = 6): string => {
  const lat = latitude.toFixed(precision);
  const lon = longitude.toFixed(precision);
  return `${lat},${lon}`;
};

export const parseLocationHash = (hash: string): LocationData | null => {
  try {
    const [lat, lon] = hash.split(',').map(Number);
    if (isValidCoordinate(lat, lon)) {
      return { latitude: lat, longitude: lon };
    }
    return null;
  } catch (error) {
    return null;
  }
};

