import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useMRVReports } from '../../hooks/useMRVReports';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { MRVReport } from '../../types';

const MRVReportsScreen: React.FC = () => {
  const { mrvReports, loadMRVReports, isLoading } = useMRVReports();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadMRVReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMRVReports();
    setRefreshing(false);
  };

  const filteredMRVReports = mrvReports.filter(report => {
    const matchesSearch = report.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.methodology.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderMRVReport = ({ item }: { item: MRVReport }) => (
    <TouchableOpacity style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportType}>{item.reportType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>
      
      <View style={styles.reportDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Methodology:</Text>
          <Text style={styles.detailValue}>{item.methodology}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Carbon Estimate:</Text>
          <Text style={styles.detailValue}>
            {item.carbonEstimate.amount} {item.carbonEstimate.unit}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Reporting Period:</Text>
          <Text style={styles.detailValue}>
            {formatDate(item.reportingPeriod.start)} - {formatDate(item.reportingPeriod.end)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Submitted by:</Text>
          <Text style={styles.detailValue}>{item.submittedBy}</Text>
        </View>
      </View>
      
      {item.dataSources && item.dataSources.length > 0 && (
        <View style={styles.dataSourcesContainer}>
          <Text style={styles.dataSourcesTitle}>Data Sources:</Text>
          {item.dataSources.slice(0, 3).map((source, index) => (
            <Text key={index} style={styles.dataSourceText}>
              • {source.type}: {source.description}
            </Text>
          ))}
          {item.dataSources.length > 3 && (
            <Text style={styles.moreDataSourcesText}>
              +{item.dataSources.length - 3} more sources
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.reportFooter}>
        <Text style={styles.projectText}>
          Project: {item.projectId}
        </Text>
        <Text style={styles.updatedText}>
          Updated {getRelativeTime(item.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#8E8E93';
      case 'submitted':
        return '#007AFF';
      case 'under_review':
        return '#FF9500';
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const renderFilterButton = (status: 'all' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterStatus === status ? styles.filterButtonActive : null,
      ]}
      onPress={() => setFilterStatus(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filterStatus === status ? styles.filterButtonTextActive : null,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MRV Reports</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Report</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search MRV reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('draft', 'Draft')}
        {renderFilterButton('submitted', 'Submitted')}
        {renderFilterButton('under_review', 'Review')}
        {renderFilterButton('approved', 'Approved')}
        {renderFilterButton('rejected', 'Rejected')}
      </View>

      {/* MRV Reports List */}
      <FlatList
        data={filteredMRVReports}
        renderItem={renderMRVReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No MRV reports found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first MRV report to get started'}
            </Text>
          </View>
        }
      />
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    backgroundColor: '#F2F2F7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    width: 120,
  },
  detailValue: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
  dataSourcesContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dataSourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  dataSourceText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  moreDataSourcesText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  updatedText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default MRVReportsScreen;

