import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchMRVReports, 
  fetchMRVReportById, 
  createMRVReport, 
  updateMRVReport, 
  deleteMRVReport,
  submitMRVReport,
  approveMRVReport,
  rejectMRVReport,
  fetchMRVReportsByProject,
  fetchMRVReportsByStatus,
  fetchMRVReportsByDateRange
} from '../store/slices/mrvReportSlice';
import { MRVReport, CreateMRVReportData, UpdateMRVReportData } from '../types';

export const useMRVReports = () => {
  const dispatch = useAppDispatch();
  const { 
    mrvReports, 
    currentMRVReport, 
    isLoading, 
    error 
  } = useAppSelector(state => state.mrvReports);

  const loadMRVReports = useCallback(async () => {
    try {
      await dispatch(fetchMRVReports()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadMRVReportById = useCallback(async (reportId: string) => {
    try {
      await dispatch(fetchMRVReportById(reportId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleCreateMRVReport = useCallback(async (reportData: CreateMRVReportData) => {
    try {
      const result = await dispatch(createMRVReport(reportData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateMRVReport = useCallback(async (reportId: string, reportData: UpdateMRVReportData) => {
    try {
      const result = await dispatch(updateMRVReport({ reportId, reportData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleDeleteMRVReport = useCallback(async (reportId: string) => {
    try {
      await dispatch(deleteMRVReport(reportId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSubmitMRVReport = useCallback(async (reportId: string) => {
    try {
      const result = await dispatch(submitMRVReport(reportId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleApproveMRVReport = useCallback(async (reportId: string, comments?: string) => {
    try {
      const result = await dispatch(approveMRVReport({ reportId, comments })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleRejectMRVReport = useCallback(async (reportId: string, comments: string) => {
    try {
      const result = await dispatch(rejectMRVReport({ reportId, comments })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadMRVReportsByProject = useCallback(async (projectId: string) => {
    try {
      await dispatch(fetchMRVReportsByProject(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadMRVReportsByStatus = useCallback(async (status: string) => {
    try {
      await dispatch(fetchMRVReportsByStatus(status)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadMRVReportsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      await dispatch(fetchMRVReportsByDateRange({ startDate, endDate })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    mrvReports,
    currentMRVReport,
    isLoading,
    error,
    loadMRVReports,
    loadMRVReportById,
    createMRVReport: handleCreateMRVReport,
    updateMRVReport: handleUpdateMRVReport,
    deleteMRVReport: handleDeleteMRVReport,
    submitMRVReport: handleSubmitMRVReport,
    approveMRVReport: handleApproveMRVReport,
    rejectMRVReport: handleRejectMRVReport,
    loadMRVReportsByProject,
    loadMRVReportsByStatus,
    loadMRVReportsByDateRange,
  };
};

