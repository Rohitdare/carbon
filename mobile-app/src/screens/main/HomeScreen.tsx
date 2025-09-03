import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useFieldData } from '../../hooks/useFieldData';
import { useMRVReports } from '../../hooks/useMRVReports';
import { useOffline } from '../../hooks/useOffline';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { getNetworkStatusText, getNetworkStatusColor } from '../../utils/networkUtils';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { projects, loadProjects } = useProjects();
  const { fieldData, loadFieldData } = useFieldData();
  const { mrvReports, loadMRVReports } = useMRVReports();
  const { isOfflineMode, syncStatus } = useOffline();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadProjects(),
        loadFieldData(),
        loadMRVReports(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecentFieldData = () => {
    return fieldData
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  const getRecentMRVReports = () => {
    return mrvReports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getActiveProjects = () => {
    return projects.filter(project => project.status === 'active');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <View style={styles.networkStatus}>
          <View
            style={[
              styles.networkIndicator,
              { backgroundColor: getNetworkStatusColor() },
            ]}
          />
          <Text style={styles.networkStatusText}>
            {getNetworkStatusText()}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getActiveProjects().length}</Text>
          <Text style={styles.statLabel}>Active Projects</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{fieldData.length}</Text>
          <Text style={styles.statLabel}>Field Data Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{mrvReports.length}</Text>
          <Text style={styles.statLabel}>MRV Reports</Text>
        </View>
      </View>

      {/* Offline Status */}
      {isOfflineMode && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            🔄 Offline Mode - {syncStatus}
          </Text>
        </View>
      )}

      {/* Recent Field Data */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Field Data</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {getRecentFieldData().length > 0 ? (
          getRecentFieldData().map((data) => (
            <View key={data.id} style={styles.dataItem}>
              <View style={styles.dataItemHeader}>
                <Text style={styles.dataItemTitle}>{data.dataType}</Text>
                <Text style={styles.dataItemTime}>
                  {getRelativeTime(data.timestamp)}
                </Text>
              </View>
              <Text style={styles.dataItemLocation}>
                📍 {data.location.coordinates.latitude.toFixed(4)}, {data.location.coordinates.longitude.toFixed(4)}
              </Text>
              <Text style={styles.dataItemDescription}>
                {data.description || 'No description available'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No field data available</Text>
        )}
      </View>

      {/* Recent MRV Reports */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent MRV Reports</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {getRecentMRVReports().length > 0 ? (
          getRecentMRVReports().map((report) => (
            <View key={report.id} style={styles.dataItem}>
              <View style={styles.dataItemHeader}>
                <Text style={styles.dataItemTitle}>{report.reportType}</Text>
                <Text style={styles.dataItemTime}>
                  {getRelativeTime(report.createdAt)}
                </Text>
              </View>
              <Text style={styles.dataItemDescription}>
                Carbon Estimate: {report.carbonEstimate.amount} {report.carbonEstimate.unit}
              </Text>
              <Text style={styles.dataItemStatus}>
                Status: {report.status}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No MRV reports available</Text>
        )}
      </View>

      {/* Active Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Projects</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {getActiveProjects().length > 0 ? (
          getActiveProjects().map((project) => (
            <View key={project.id} style={styles.dataItem}>
              <View style={styles.dataItemHeader}>
                <Text style={styles.dataItemTitle}>{project.name}</Text>
                <Text style={styles.dataItemTime}>
                  {getRelativeTime(project.startDate)}
                </Text>
              </View>
              <Text style={styles.dataItemDescription}>
                {project.description}
              </Text>
              <Text style={styles.dataItemLocation}>
                📍 {project.location.coordinates.latitude.toFixed(4)}, {project.location.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No active projects</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  offlineBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  offlineText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  dataItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dataItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dataItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  dataItemTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dataItemDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dataItemLocation: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dataItemStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;

