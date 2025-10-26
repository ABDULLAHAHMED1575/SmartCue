import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';
import { AuthContext } from './AuthContext';

export const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(filters);
      const response = await api.get(`/reminders?${params}`);

      if (response.data.success) {
        setReminders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError(err.response?.data?.message || 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const parseReminder = async (text) => {
    try {
      const response = await api.post('/reminders/parse', { text });

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error('Error parsing reminder:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to parse reminder',
      };
    }
  };

  const createReminder = async (reminderData) => {
    try {
      setError(null);
      const response = await api.post('/reminders', reminderData);

      if (response.data.success) {
        setReminders([response.data.data, ...reminders]);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error('Error creating reminder:', err);
      const message = err.response?.data?.message || 'Failed to create reminder';
      setError(message);
      return { success: false, message };
    }
  };

  const updateReminder = async (id, updates) => {
    try {
      const response = await api.put(`/reminders/${id}`, updates);

      if (response.data.success) {
        setReminders(
          reminders.map((r) => (r._id === id ? response.data.data : r))
        );
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error('Error updating reminder:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update reminder',
      };
    }
  };

  const deleteReminder = async (id) => {
    try {
      const response = await api.delete(`/reminders/${id}`);

      if (response.data.success) {
        setReminders(reminders.filter((r) => r._id !== id));
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting reminder:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to delete reminder',
      };
    }
  };

  const completeReminder = async (id) => {
    try {
      const response = await api.put(`/reminders/${id}/complete`);

      if (response.data.success) {
        setReminders(
          reminders.map((r) => (r._id === id ? response.data.data : r))
        );
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error('Error completing reminder:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to complete reminder',
      };
    }
  };

  const checkLocationReminders = async (latitude, longitude) => {
    try {
      const response = await api.post('/reminders/check-location', {
        latitude,
        longitude,
      });

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error('Error checking location:', err);
      return { success: false, message: 'Failed to check location' };
    }
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        loading,
        error,
        fetchReminders,
        parseReminder,
        createReminder,
        updateReminder,
        deleteReminder,
        completeReminder,
        checkLocationReminders,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};
