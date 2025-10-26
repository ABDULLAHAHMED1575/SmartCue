import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderContext } from '../context/ReminderContext';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

const HomeScreen = ({ navigation }) => {
  const { reminders, loading, fetchReminders, completeReminder, deleteReminder } =
    useContext(ReminderContext);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  };

  const handleComplete = async (id) => {
    const result = await completeReminder(id);
    if (result.success) {
      Alert.alert('Success', 'Reminder marked as completed');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteReminder(id);
            if (result.success) {
              Alert.alert('Success', 'Reminder deleted');
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Groceries: 'cart',
      Bills: 'card',
      Work: 'briefcase',
      Personal: 'person',
      Health: 'fitness',
      Shopping: 'bag',
    };
    return icons[category] || 'ellipse';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Groceries: '#4CAF50',
      Bills: '#FF9800',
      Work: '#2196F3',
      Personal: '#9C27B0',
      Health: '#F44336',
      Shopping: '#FF5722',
    };
    return colors[category] || '#666';
  };

  const renderReminder = ({ item }) => {
    const isCompleted = item.status === 'completed';

    return (
      <TouchableOpacity
        style={[styles.reminderCard, isCompleted && styles.completedCard]}
        onPress={() => navigation.navigate('ReminderDetail', { reminder: item })}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={16}
              color={getCategoryColor(item.category)}
            />
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(item.category) },
              ]}
            >
              {item.category}
            </Text>
          </View>
          {item.priority === 'high' && (
            <Ionicons name="flag" size={16} color="#F44336" />
          )}
        </View>

        <Text style={[styles.title, isCompleted && styles.completedText]}>
          {item.title}
        </Text>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.metaInfo}>
          {item.triggerType === 'location' && (
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.metaText}>
                {item.location?.placeName || 'Location-based'}
              </Text>
            </View>
          )}

          {item.dueDate && (
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.metaText}>
                {format(new Date(item.dueDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {!isCompleted && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleComplete(item._id)}
            >
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subheading}>
            You have {reminders.filter((r) => r.status === 'active').length} active
            reminders
          </Text>
        </View>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first reminder
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReminder')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  list: {
    padding: 15,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedCard: {
    opacity: 0.6,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;
