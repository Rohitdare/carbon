import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchProjects, 
  fetchProject, 
  createProject, 
  updateProject, 
  deleteProject,
  joinProject,
  leaveProject,
  fetchProjectMembers,
  fetchProjectFieldData,
  fetchProjectMRVReports
} from '../store/slices/projectSlice';
import { Project, CreateProjectData, UpdateProjectData } from '../types';

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const { 
    projects, 
    currentProject, 
    projectMembers, 
    projectFieldData, 
    projectMRVReports,
    isLoading, 
    error 
  } = useAppSelector(state => state.projects);

  const loadProjects = useCallback(async () => {
    try {
      await dispatch(fetchProjects()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      await dispatch(fetchProject(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleCreateProject = useCallback(async (projectData: CreateProjectData) => {
    try {
      const result = await dispatch(createProject(projectData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateProject = useCallback(async (projectId: string, projectData: UpdateProjectData) => {
    try {
      const result = await dispatch(updateProject({ projectId, projectData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await dispatch(deleteProject(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleJoinProject = useCallback(async (projectId: string) => {
    try {
      const result = await dispatch(joinProject(projectId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleLeaveProject = useCallback(async (projectId: string) => {
    try {
      await dispatch(leaveProject(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadProjectMembers = useCallback(async (projectId: string) => {
    try {
      await dispatch(fetchProjectMembers(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadProjectFieldData = useCallback(async (projectId: string) => {
    try {
      await dispatch(fetchProjectFieldData(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadProjectMRVReports = useCallback(async (projectId: string) => {
    try {
      await dispatch(fetchProjectMRVReports(projectId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    projects,
    currentProject,
    projectMembers,
    projectFieldData,
    projectMRVReports,
    isLoading,
    error,
    loadProjects,
    loadProject,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    joinProject: handleJoinProject,
    leaveProject: handleLeaveProject,
    loadProjectMembers,
    loadProjectFieldData,
    loadProjectMRVReports,
  };
};

