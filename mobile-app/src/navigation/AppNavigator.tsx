import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import FieldDataScreen from '../screens/main/FieldDataScreen';
import MRVReportsScreen from '../screens/main/MRVReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import CreateProjectScreen from '../screens/projects/CreateProjectScreen';
import EditProjectScreen from '../screens/projects/EditProjectScreen';
import FieldDataDetailScreen from '../screens/field-data/FieldDataDetailScreen';
import CreateFieldDataScreen from '../screens/field-data/CreateFieldDataScreen';
import EditFieldDataScreen from '../screens/field-data/EditFieldDataScreen';
import MRVReportDetailScreen from '../screens/mrv-reports/MRVReportDetailScreen';
import CreateMRVReportScreen from '../screens/mrv-reports/CreateMRVReportScreen';
import EditMRVReportScreen from '../screens/mrv-reports/EditMRVReportScreen';
import OfflineDataScreen from '../screens/offline/OfflineDataScreen';
import SyncStatusScreen from '../screens/offline/SyncStatusScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import ImageGalleryScreen from '../screens/camera/ImageGalleryScreen';
import MapScreen from '../screens/map/MapScreen';
import LocationPickerScreen from '../screens/map/LocationPickerScreen';

// Import components
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';
import CustomTabBar from '../components/navigation/CustomTabBar';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProjectDetail: { projectId: string };
  CreateProject: undefined;
  EditProject: { projectId: string };
  FieldDataDetail: { fieldDataId: string };
  CreateFieldData: { projectId?: string };
  EditFieldData: { fieldDataId: string };
  MRVReportDetail: { reportId: string };
  CreateMRVReport: { projectId?: string };
  EditMRVReport: { reportId: string };
  OfflineData: undefined;
  SyncStatus: undefined;
  Camera: { onImageCaptured: (imageUri: string) => void };
  ImageGallery: { images: string[]; onImageSelected: (imageUri: string) => void };
  Map: { initialLocation?: { latitude: number; longitude: number } };
  LocationPicker: { onLocationSelected: (location: { latitude: number; longitude: number }) => void };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Projects: undefined;
  FieldData: undefined;
  MRVReports: undefined;
  Profile: undefined;
};

export type MainDrawerParamList = {
  MainTabs: undefined;
  Settings: undefined;
  OfflineData: undefined;
  SyncStatus: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const MainDrawer = createDrawerNavigator<MainDrawerParamList>();

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="FieldData"
        component={FieldDataScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="MRVReports"
        component={MRVReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
};

// Main Drawer Navigator
const MainDrawerNavigator = () => {
  return (
    <MainDrawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <MainDrawer.Screen name="MainTabs" component={MainTabNavigator} />
      <MainDrawer.Screen name="Settings" component={SettingsScreen} />
      <MainDrawer.Screen name="OfflineData" component={OfflineDataScreen} />
      <MainDrawer.Screen name="SyncStatus" component={SyncStatusScreen} />
    </MainDrawer.Navigator>
  );
};

// Root Stack Navigator
const RootStackNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainDrawerNavigator} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
          <Stack.Screen name="EditProject" component={EditProjectScreen} />
          <Stack.Screen name="FieldDataDetail" component={FieldDataDetailScreen} />
          <Stack.Screen name="CreateFieldData" component={CreateFieldDataScreen} />
          <Stack.Screen name="EditFieldData" component={EditFieldDataScreen} />
          <Stack.Screen name="MRVReportDetail" component={MRVReportDetailScreen} />
          <Stack.Screen name="CreateMRVReport" component={CreateMRVReportScreen} />
          <Stack.Screen name="EditMRVReport" component={EditMRVReportScreen} />
          <Stack.Screen name="OfflineData" component={OfflineDataScreen} />
          <Stack.Screen name="SyncStatus" component={SyncStatusScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="ImageGallery" component={ImageGalleryScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;

