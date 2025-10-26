import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderContext } from '../context/ReminderContext';

const CreateReminderScreen = ({ navigation }) => {
  const { parseReminder, createReminder } = useContext(ReminderContext);
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter a reminder');
      return;
    }

    setLoading(true);
    const result = await parseReminder(input);
    setLoading(false);

    if (result.success) {
      setParsedData(result.data);
    } else {
      Alert.alert('Error', 'Failed to parse reminder');
    }
  };

  const handleCreate = async () => {
    if (!parsedData) {
      Alert.alert('Error', 'Please parse the reminder first');
      return;
    }

    setLoading(true);

    const reminderData = {
      title: parsedData.task,
      originalInput: parsedData.originalInput,
      category: parsedData.category,
      priority: parsedData.priority,
      triggerType: parsedData.triggerType,
    };

    if (parsedData.dueDate) {
      reminderData.dueDate = parsedData.dueDate;
    }

    if (parsedData.location) {
      reminderData.location = parsedData.location;
    }

    const result = await createReminder(reminderData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Reminder created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const examples = [
    'Remind me to buy milk when I\'m near a grocery store',
    'Call John when I reach office',
    'Pay electricity bill before Sunday',
    'Buy birthday gift when I\'m near the mall',
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Smart Reminder</Text>
          <Text style={styles.subtitle}>
            Describe your reminder in natural language
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E.g., Remind me to buy milk when I'm near a grocery store"
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.parseButton}
              onPress={handleParse}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.parseButtonText}>Parse</Text>
              )}
            </TouchableOpacity>
          </View>

          {parsedData && (
            <View style={styles.parsedCard}>
              <Text style={styles.parsedTitle}>Parsed Reminder</Text>

              <View style={styles.parsedRow}>
                <Ionicons name="document-text" size={20} color="#666" />
                <View style={styles.parsedInfo}>
                  <Text style={styles.parsedLabel}>Task</Text>
                  <Text style={styles.parsedValue}>{parsedData.task}</Text>
                </View>
              </View>

              <View style={styles.parsedRow}>
                <Ionicons name="pricetag" size={20} color="#666" />
                <View style={styles.parsedInfo}>
                  <Text style={styles.parsedLabel}>Category</Text>
                  <Text style={styles.parsedValue}>{parsedData.category}</Text>
                </View>
              </View>

              <View style={styles.parsedRow}>
                <Ionicons name="flag" size={20} color="#666" />
                <View style={styles.parsedInfo}>
                  <Text style={styles.parsedLabel}>Priority</Text>
                  <Text style={styles.parsedValue}>
                    {parsedData.priority.charAt(0).toUpperCase() +
                      parsedData.priority.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.parsedRow}>
                <Ionicons name="notifications" size={20} color="#666" />
                <View style={styles.parsedInfo}>
                  <Text style={styles.parsedLabel}>Trigger Type</Text>
                  <Text style={styles.parsedValue}>
                    {parsedData.triggerType === 'location'
                      ? 'Location-based'
                      : parsedData.triggerType === 'time'
                      ? 'Time-based'
                      : 'Both'}
                  </Text>
                </View>
              </View>

              {parsedData.location && (
                <View style={styles.parsedRow}>
                  <Ionicons name="location" size={20} color="#666" />
                  <View style={styles.parsedInfo}>
                    <Text style={styles.parsedLabel}>Location</Text>
                    <Text style={styles.parsedValue}>
                      {parsedData.location.placeName}
                    </Text>
                    {parsedData.location.address && (
                      <Text style={styles.parsedSubvalue}>
                        {parsedData.location.address}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {parsedData.dueDate && (
                <View style={styles.parsedRow}>
                  <Ionicons name="calendar" size={20} color="#666" />
                  <View style={styles.parsedInfo}>
                    <Text style={styles.parsedLabel}>Due Date</Text>
                    <Text style={styles.parsedValue}>
                      {new Date(parsedData.dueDate).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>Create Reminder</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>Examples:</Text>
            {examples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleItem}
                onPress={() => setInput(example)}
              >
                <Ionicons name="bulb-outline" size={16} color="#007AFF" />
                <Text style={styles.exampleText}>{example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  parseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  parseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  parsedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  parsedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  parsedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  parsedInfo: {
    flex: 1,
  },
  parsedLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  parsedValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  parsedSubvalue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  examplesSection: {
    marginTop: 10,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  exampleText: {
    fontSize: 13,
    color: '#007AFF',
    flex: 1,
  },
});

export default CreateReminderScreen;
