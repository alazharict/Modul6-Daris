import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../services/api';
import { getUser, logout, storeData } from '../utils/storage';
import { EditProfileModal } from './EditProfileModal';
import { SwipeIndicator } from "../components/SwipeIndicator";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadUserProfile = async (showRefresh = false) => {
    try {
      if (!showRefresh) {
        setLoading(true);
      }
      
      // Ambil data user dari storage terlebih dahulu
      const storedUser = await getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Fetch fresh data from API
      try {
        const freshData = await Api.getProfile();
        if (freshData.user) {
          setUser(freshData.user);
          // Update storage dengan data terbaru
          await storeData('user', JSON.stringify(freshData.user));
        }
      } catch (apiError) {
        console.log('Using cached user data:', apiError.message);
        // Jika API error, tetap gunakan data dari storage
        if (!storedUser) {
          throw new Error('Failed to load profile data');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (!showRefresh) {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserProfile(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleProfileUpdateSuccess = (updatedUser) => {
    setUser(updatedUser);
    // Refresh data untuk memastikan konsistensi
    setProfileLoading(true);
    loadUserProfile(true);
  };

  const handleChangePassword = () => {
    Alert.alert('Info', 'Change password feature coming soon!');
  };

  const handleNotificationSettings = () => {
    Alert.alert('Info', 'Notification settings feature coming soon!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <SwipeIndicator />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {profileLoading && (
            <ActivityIndicator size="small" color="#2563eb" style={styles.headerLoader} />
          )}
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {user?.name || 'No Name'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.memberSince}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.memberSinceText}>
              Member since {formatDate(user?.created_at)}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="person-outline" size={20} color="#475569" />
              <Text style={styles.infoLabel}>Full Name</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.name || 'Not set'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="mail-outline" size={20} color="#475569" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="key-outline" size={20} color="#475569" />
              <Text style={styles.infoLabel}>User ID</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
              {user?.id ? user.id.substring(0, 8) + '...' : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="create-outline" size={22} color="#2563eb" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>

          
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>2024.01.001</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={profileLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>
            {profileLoading ? 'Loading...' : 'Logout'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>IOTWatch App</Text>
          <Text style={styles.footerSubText}>Temperature Monitoring System</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleProfileUpdateSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  headerLoader: {
    marginLeft: 10,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
    textAlign: 'center',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberSinceText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: '#475569',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  footerSubText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});

export default ProfileScreen; // HANYA default export, hapus named export