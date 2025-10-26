import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    if (!Device.isDevice) {
      return {
        success: false,
        message: 'Must use physical device for Push Notifications',
      };
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        success: false,
        message: 'Failed to get push token for push notification!',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return { success: false, message: error.message };
  }
};

export const getPushToken = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    await AsyncStorage.setItem('pushToken', token.data);
    return { success: true, token: token.data };
  } catch (error) {
    console.error('Error getting push token:', error);
    return { success: false, message: error.message };
  }
};

export const sendNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, message: error.message };
  }
};

export const scheduleNotification = async (title, body, trigger, data = {}) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });

    return { success: true, notificationId };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return { success: false, message: error.message };
  }
};

export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return { success: true };
  } catch (error) {
    console.error('Error canceling notification:', error);
    return { success: false, message: error.message };
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return { success: true };
  } catch (error) {
    console.error('Error canceling all notifications:', error);
    return { success: false, message: error.message };
  }
};

// Handle notification response (when user taps on notification)
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Handle notification received while app is in foreground
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};
