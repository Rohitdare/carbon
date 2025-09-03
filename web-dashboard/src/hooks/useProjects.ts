import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  fetchProjects, 
  fetchProject, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../store/slices/projectSlice';

export const useProjects = () => {
  const dispatch = useDispatch();
  const { projects, currentProject, loading, error } = useSelector((state: RootState) => state.projects);

  const getProjects = async () => {
    return dispatch(fetchProjects()).unwrap();
  };

  const getProject = async (id: string) => {
    return dispatch(fetchProject(id)).unwrap();
  };

  const createNewProject = async (projectData: {
    name: string;
    description: string;
    location: string;
    boundary: any;
    startDate: string;
    endDate?: string;
    status: string;
  }) => {
    return dispatch(createProject(projectData)).unwrap();
  };

  const updateExistingProject = async (id: string, projectData: Partial<{
    name: string;
    description: string;
    location: string;
    boundary: any;
    startDate: string;
    endDate: string;
    status: string;
  }>) => {
    return dispatch(updateProject({ id, data: projectData })).unwrap();
  };

  const deleteExistingProject = async (id: string) => {
    return dispatch(deleteProject(id)).unwrap();
  };

  const getActiveProjects = () => {
    return projects.filter(project => project.status === 'active');
  };

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const getProjectsByUser = (userId: string) => {
    return projects.filter(project => project.createdBy === userId);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const pending = projects.filter(p => p.status === 'pending').length;

    return {
      total,
      active,
      completed,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  };

  return {
    projects,
    currentProject,
    loading,
    error,
    getProjects,
    getProject,
    createNewProject,
    updateExistingProject,
    deleteExistingProject,
    getActiveProjects,
    getProjectsByStatus,
    getProjectsByUser,
    getProjectStats
  };
};

