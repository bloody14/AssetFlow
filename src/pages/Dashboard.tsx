import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/axios';
import { 
  Monitor, 
  CheckCircle, 
  Wrench, 
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardSummary {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  maintenanceAssets: number;
  activeAllocations: number;
  activeBookings: number;
  pendingMaintenance: number;
  recentActivity: any[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/reporting/summary');
      setData(response.data.data);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mr-4">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Assets</p>
              <h3 className="text-2xl font-bold text-slate-900">{data?.totalAssets}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mr-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Available</p>
              <h3 className="text-2xl font-bold text-slate-900">{data?.availableAssets}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mr-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Bookings</p>
              <h3 className="text-2xl font-bold text-slate-900">{data?.activeBookings}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-full mr-4">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">In Maintenance</p>
              <h3 className="text-2xl font-bold text-slate-900">{data?.maintenanceAssets}</h3>
            </div>
          </div>
          
        </div>

        {/* Activity Feed Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center">
            <Activity className="w-5 h-5 text-slate-500 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">Recent Audit Activity</h2>
          </div>
          
          <div className="divide-y divide-slate-100">
            {data?.recentActivity?.length === 0 && (
              <div className="p-8 text-center text-slate-500">No recent activity found.</div>
            )}
            {data?.recentActivity?.slice(0, 10).map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-4"></div>
                <div>
                  <p className="text-sm text-slate-900 font-medium">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600 mr-2">
                      {activity.entityType}
                    </span>
                    {activity.action}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Performed by {activity.user?.name || 'Unknown'} • {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
