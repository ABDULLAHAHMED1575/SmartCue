import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { sendNotification } from './notificationService';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_CHECK_INTERVAL = 300000; // 5 minutes

// Define the background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      try {
        // Check for triggered reminders
        const response = await api.post('/reminders/check-location', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (response.data.success && response.data.data.length > 0) {
          // Send notifications for triggered reminders
          for (const reminder of response.data.data) {
            await sendNotification(
              'Smart Reminder',
              reminder.title,
              { reminderId: reminder._id }
            );
          }
        }
      } catch (err) {
        console.error('Error checking location reminders:', err);
      }
    }
  }
});

export const requestLocationPermissions = async () => {
  try {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      return {
        success: false,
        message: 'Foreground location permission denied',
      };
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      return {
        success: false,
        message: 'Background location permission denied',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return { success: false, message: error.message };
  }
};

export const startLocationTracking = async () => {
  try {
    const permissionResult = await requestLocationPermissions();

    if (!permissionResult.success) {
      return permissionResult;
    }

    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );

    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_CHECK_INTERVAL,
        distanceInterval: 100, // meters
        foregroundService: {
          notificationTitle: 'Smart Reminder',
          notificationBody: 'Tracking your location for context-aware reminders',
        },
      });

      await AsyncStorage.setItem('locationTrackingEnabled', 'true');
    }

    return { success: true };
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return { success: false, message: error.message };
  }
};

export const stopLocationTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );

    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      await AsyncStorage.setItem('locationTrackingEnabled', 'false');
    }

    return { success: true };
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    return { success: false, message: error.message };
  }
};

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        success: false,
        message: 'Location permission denied',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      data: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return { success: false, message: error.message };
  }
};

export const isLocationTrackingEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem('locationTrackingEnabled');
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};
