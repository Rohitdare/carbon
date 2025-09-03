import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchProjects } from '../store/slices/projectSlice';
import {
  ChartBarIcon,
  FolderIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Mock data for dashboard stats
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalCarbonCredits: 1250,
    verifiedReports: 45,
    carbonSequestration: 12500, // tons CO2
    monthlyGrowth: 12.5
  };

  const recentActivities = [
    {
      id: 1,
      type: 'project',
      title: 'New project "Mangrove Restoration" created',
      time: '2 hours ago',
      user: 'Jane Smith'
    },
    {
      id: 2,
      type: 'report',
      title: 'MRV Report submitted for review',
      time: '4 hours ago',
      user: 'John Doe'
    },
    {
      id: 3,
      type: 'credit',
      title: 'Carbon credits issued for Project Alpha',
      time: '1 day ago',
      user: 'System'
    },
    {
      id: 4,
      type: 'verification',
      title: 'Report verification completed',
      time: '2 days ago',
      user: 'Dr. Wilson'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderIcon className="h-5 w-5 text-blue-500" />;
      case 'report':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
      case 'credit':
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      case 'verification':
        return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {user?.name || 'User'}!
        </h1>
        <p className="mt-2 text-blue-100">
          Welcome to the Blue Carbon MRV Platform. Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Verified Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.verifiedReports}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Carbon Credits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCarbonCredits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CO₂ Sequestered</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.carbonSequestration.toLocaleString()} tons</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner h-8 w-8"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FolderIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          project.status === 'active' ? 'badge-success' : 
                          project.status === 'pending' ? 'badge-warning' : 'badge-gray'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              {stats.monthlyGrowth}% this month
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.activeProjects}</div>
              <div className="text-sm text-gray-500">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.verifiedReports}</div>
              <div className="text-sm text-gray-500">Reports Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.totalCarbonCredits}</div>
              <div className="text-sm text-gray-500">Credits Issued</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

