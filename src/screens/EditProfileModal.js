import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../services/api';
import { storeData, getUser } from '../utils/storage';

export function EditProfileModal({ visible, user, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    if (name.trim() === user?.name) {
      Alert.alert('Info', 'No changes made');
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to update profile
      const response = await Api.updateProfile({ name: name.trim() });
      
      // API returns updated user data in response.user
      const updatedUser = response.user || { ...user, name: name.trim() };
      
      // Update local storage dengan data terbaru dari server
      await storeData('user', JSON.stringify(updatedUser));
      
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess(updatedUser);
            onClose();
          },
        },
      ]);
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setError(null);
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Edit Profile</Text>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={loading}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                editable={!loading}
                autoFocus={true}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              
              <Text style={styles.note}>
                You can update your display name here. This will be visible across the app.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.saveButton, 
                  (loading || !name.trim()) && styles.buttonDisabled
                ]}
                onPress={handleSave}
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: '40%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  note: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});