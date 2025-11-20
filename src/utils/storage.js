import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Data stored successfully: ${key}`);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Data removed successfully: ${key}`);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// Token management helpers
export const getToken = async () => {
  return await getData('token');
};

export const getUser = async () => {
  const userString = await getData('user');
  return userString ? JSON.parse(userString) : null;
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export const logout = async () => {
  try {
    await removeData('token');
    await removeData('user');
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};