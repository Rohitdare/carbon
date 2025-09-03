import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSettings';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { settings } = useTheme();
  const theme = settings.theme;

  return (
    <View style={[styles.tabBar, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconName = getIconName(route.name, isFocused);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#007AFF' : theme === 'dark' ? '#8E8E93' : '#8E8E93'}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? '#007AFF' : theme === 'dark' ? '#8E8E93' : '#8E8E93',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
  switch (routeName) {
    case 'Home':
      return isFocused ? 'home' : 'home-outline';
    case 'Projects':
      return isFocused ? 'folder' : 'folder-outline';
    case 'FieldData':
      return isFocused ? 'analytics' : 'analytics-outline';
    case 'MRVReports':
      return isFocused ? 'document-text' : 'document-text-outline';
    case 'Profile':
      return isFocused ? 'person' : 'person-outline';
    default:
      return 'circle-outline';
  }
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default CustomTabBar;

