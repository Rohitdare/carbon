import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { useOffline } from '../../hooks/useOffline';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { settings } = useTheme();
  const { user, logout } = useAuth();
  const { isOfflineMode, syncStatus, offlineActions } = useOffline();
  const theme = settings.theme;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Home',
      icon: 'home-outline',
      onPress: () => props.navigation.navigate('MainTabs', { screen: 'Home' }),
    },
    {
      title: 'Projects',
      icon: 'folder-outline',
      onPress: () => props.navigation.navigate('MainTabs', { screen: 'Projects' }),
    },
    {
      title: 'Field Data',
      icon: 'analytics-outline',
      onPress: () => props.navigation.navigate('MainTabs', { screen: 'FieldData' }),
    },
    {
      title: 'MRV Reports',
      icon: 'document-text-outline',
      onPress: () => props.navigation.navigate('MainTabs', { screen: 'MRVReports' }),
    },
    {
      title: 'Profile',
      icon: 'person-outline',
      onPress: () => props.navigation.navigate('MainTabs', { screen: 'Profile' }),
    },
    {
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => props.navigation.navigate('Settings'),
    },
    {
      title: 'Offline Data',
      icon: 'cloud-offline-outline',
      onPress: () => props.navigation.navigate('OfflineData'),
      badge: offlineActions.length > 0 ? offlineActions.length : undefined,
    },
    {
      title: 'Sync Status',
      icon: 'sync-outline',
      onPress: () => props.navigation.navigate('SyncStatus'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#007AFF" />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme === 'dark' ? '#8E8E93' : '#8E8E93' }]}>
                {user?.email || 'user@example.com'}
              </Text>
              <Text style={[styles.userRole, { color: theme === 'dark' ? '#8E8E93' : '#8E8E93' }]}>
                {user?.role || 'Field Worker'}
              </Text>
            </View>
          </View>
          
          {/* Network Status */}
          <View style={styles.networkStatus}>
            <Ionicons
              name={isOfflineMode ? 'cloud-offline' : 'cloud'}
              size={16}
              color={isOfflineMode ? '#FF3B30' : '#34C759'}
            />
            <Text style={[styles.networkStatusText, { color: theme === 'dark' ? '#8E8E93' : '#8E8E93' }]}>
              {isOfflineMode ? 'Offline' : 'Online'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={theme === 'dark' ? '#8E8E93' : '#8E8E93'}
                />
                <Text style={[styles.menuItemText, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                  {item.title}
                </Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sync Status */}
        {isOfflineMode && (
          <View style={styles.syncStatusContainer}>
            <View style={styles.syncStatusHeader}>
              <Ionicons name="sync" size={16} color="#FF9500" />
              <Text style={[styles.syncStatusTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                Sync Status
              </Text>
            </View>
            <Text style={[styles.syncStatusText, { color: theme === 'dark' ? '#8E8E93' : '#8E8E93' }]}>
              {syncStatus}
            </Text>
            {offlineActions.length > 0 && (
              <Text style={[styles.pendingActionsText, { color: theme === 'dark' ? '#8E8E93' : '#8E8E93' }]}>
                {offlineActions.length} pending actions
              </Text>
            )}
          </View>
        )}
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  menuContainer: {
    paddingTop: 20,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  syncStatusContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncStatusText: {
    fontSize: 12,
    marginBottom: 4,
  },
  pendingActionsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default CustomDrawerContent;

