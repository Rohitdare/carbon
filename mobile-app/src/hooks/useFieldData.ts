import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchFieldData, 
  fetchFieldDataById, 
  createFieldData, 
  updateFieldData, 
  deleteFieldData,
  uploadFieldData,
  syncFieldData,
  fetchFieldDataByProject,
  fetchFieldDataByType,
  fetchFieldDataByDateRange
} from '../store/slices/fieldDataSlice';
import { FieldData, CreateFieldDataData, UpdateFieldDataData } from '../types';

export const useFieldData = () => {
  const dispatch = useAppDispatch();
  const { 
    fieldData, 
    currentFieldData, 
    isLoading, 
    error,
    uploadProgress,
    syncStatus
  } = useAppSelector(state => state.fieldData);

  const loadFieldData = useCallback(async () => {
    try {
      await dispatch(fetchFieldData()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadFieldDataById = useCallback(async (fieldDataId: string) => {
    try {
      await dispatch(fetchFieldDataById(fieldDataId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleCreateFieldData = useCallback(async (fieldDataData: CreateFieldDataData) => {
    try {
      const result = await dispatch(createFieldData(fieldDataData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateFieldData = useCallback(async (fieldDataId: string, fieldDataData: UpdateFieldDataData) => {
    try {
      const result = await dispatch(updateFieldData({ fieldDataId, fieldDataData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleDeleteFieldData = useCallback(async (fieldDataId: string) => {
    try {
      await dispatch(deleteFieldData(fieldDataId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUploadFieldData = useCallback(async (fieldDataData: CreateFieldDataData) => {
    try {
      const result = await dispatch(uploadFieldData(fieldDataData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSyncFieldData = useCallback(async () => {
    try {
      await dispatch(syncFieldData()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadFieldDataByProject = useCallback(async (projectId: string) => {
    try {
      await dispatch(fetchFieldDataByProject(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadFieldDataByType = useCallback(async (dataType: string) => {
    try {
      await dispatch(fetchFieldDataByType(dataType)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadFieldDataByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      await dispatch(fetchFieldDataByDateRange({ startDate, endDate })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    fieldData,
    currentFieldData,
    isLoading,
    error,
    uploadProgress,
    syncStatus,
    loadFieldData,
    loadFieldDataById,
    createFieldData: handleCreateFieldData,
    updateFieldData: handleUpdateFieldData,
    deleteFieldData: handleDeleteFieldData,
    uploadFieldData: handleUploadFieldData,
    syncFieldData: handleSyncFieldData,
    loadFieldDataByProject,
    loadFieldDataByType,
    loadFieldDataByDateRange,
  };
};

