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
import { useFieldData } from '../../hooks/useFieldData';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { FieldData } from '../../types';

const FieldDataScreen: React.FC = () => {
  const { fieldData, loadFieldData, isLoading } = useFieldData();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'soil' | 'water' | 'biomass' | 'satellite'>('all');

  useEffect(() => {
    loadFieldData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFieldData();
    setRefreshing(false);
  };

  const filteredFieldData = fieldData.filter(data => {
    const matchesSearch = data.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         data.dataType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || data.dataType === filterType;
    return matchesSearch && matchesType;
  });

  const renderFieldData = ({ item }: { item: FieldData }) => (
    <TouchableOpacity style={styles.dataCard}>
      <View style={styles.dataHeader}>
        <View style={styles.dataTypeContainer}>
          <Text style={styles.dataType}>{item.dataType.toUpperCase()}</Text>
        </View>
        <Text style={styles.dataTime}>
          {getRelativeTime(item.timestamp)}
        </Text>
      </View>
      
      <Text style={styles.dataDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>
      
      <View style={styles.dataDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>
            {item.location.coordinates.latitude.toFixed(4)}, {item.location.coordinates.longitude.toFixed(4)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Collected by:</Text>
          <Text style={styles.detailValue}>{item.collectedBy}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Timestamp:</Text>
          <Text style={styles.detailValue}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
      
      {item.measurements && item.measurements.length > 0 && (
        <View style={styles.measurementsContainer}>
          <Text style={styles.measurementsTitle}>Measurements:</Text>
          {item.measurements.slice(0, 3).map((measurement, index) => (
            <Text key={index} style={styles.measurementText}>
              {measurement.parameter}: {measurement.value} {measurement.unit}
            </Text>
          ))}
          {item.measurements.length > 3 && (
            <Text style={styles.moreMeasurementsText}>
              +{item.measurements.length - 3} more measurements
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.dataFooter}>
        <Text style={styles.projectText}>
          Project: {item.projectId}
        </Text>
        <View style={styles.attachmentsContainer}>
          {item.attachments && item.attachments.length > 0 && (
            <Text style={styles.attachmentsText}>
              📎 {item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (type: 'all' | 'soil' | 'water' | 'biomass' | 'satellite', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type ? styles.filterButtonActive : null,
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filterType === type ? styles.filterButtonTextActive : null,
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
        <Text style={styles.title}>Field Data</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Data</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search field data..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('soil', 'Soil')}
        {renderFilterButton('water', 'Water')}
        {renderFilterButton('biomass', 'Biomass')}
        {renderFilterButton('satellite', 'Satellite')}
      </View>

      {/* Field Data List */}
      <FlatList
        data={filteredFieldData}
        renderItem={renderFieldData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No field data found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Start collecting field data to see it here'}
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
  dataCard: {
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
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataTypeContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dataType: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  dataTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dataDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  dataDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    width: 100,
  },
  detailValue: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
  measurementsContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  measurementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  measurementText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  moreMeasurementsText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  dataFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentsText: {
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

export default FieldDataScreen;

