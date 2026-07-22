import { useEffect, useState } from 'react';
import { apiClient } from '../lib/axios';
import { Plus, Monitor, HardDrive, Smartphone, Server } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  status: string;
  category: { name: string };
  department: { name: string };
}

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await apiClient.get('/assets');
      setAssets(res.data.data.items || res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return 'bg-emerald-100 text-emerald-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_MAINTENANCE': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getIcon = (category: string) => {
    if (category.toLowerCase().includes('laptop')) return <Monitor className="w-5 h-5" />;
    if (category.toLowerCase().includes('phone')) return <Smartphone className="w-5 h-5" />;
    if (category.toLowerCase().includes('server')) return <Server className="w-5 h-5" />;
    return <HardDrive className="w-5 h-5" />;
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mt-20"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assets Inventory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage all company hardware and equipment</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {assets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <Monitor className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No assets found</p>
            <p className="text-sm mt-1">Get started by adding your first asset to the inventory.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        {getIcon(asset.category?.name || '')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{asset.name}</div>
                        <div className="text-sm text-slate-500">{asset.category?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{asset.assetTag}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {asset.department?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
