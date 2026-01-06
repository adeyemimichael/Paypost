import { useEffect, useState } from 'react';
import { usePostStore } from '../stores/postStore';
import { useUserStore } from '../stores/userStore';
import { supabaseService } from '../services/supabaseService';

const StatusPage = () => {
  const [status, setStatus] = useState({
    postStore: 'checking...',
    userStore: 'checking...',
    supabase: 'checking...',
    surveys: 'checking...'
  });

  const { posts, isLoading } = usePostStore();
  const { balance, userRole } = useUserStore();

  useEffect(() => {
    const checkStatus = async () => {
      // Check PostStore
      try {
        setStatus(prev => ({ ...prev, postStore: `✅ Loaded ${posts.length} posts` }));
      } catch (error) {
        setStatus(prev => ({ ...prev, postStore: `❌ Error: ${error.message}` }));
      }

      // Check UserStore
      try {
        setStatus(prev => ({ ...prev, userStore: `✅ Balance: ${balance}, Role: ${userRole || 'none'}` }));
      } catch (error) {
        setStatus(prev => ({ ...prev, userStore: `❌ Error: ${error.message}` }));
      }

      // Check Supabase
      try {
        const connected = await supabaseService.testConnection();
        setStatus(prev => ({ ...prev, supabase: connected ? '✅ Connected' : '❌ Not connected' }));
      } catch (error) {
        setStatus(prev => ({ ...prev, supabase: `❌ Error: ${error.message}` }));
      }

      // Check Surveys
      try {
        const surveys = await supabaseService.getSurveys();
        setStatus(prev => ({ ...prev, surveys: `✅ Found ${surveys.length} surveys` }));
      } catch (error) {
        setStatus(prev => ({ ...prev, surveys: `❌ Error: ${error.message}` }));
      }
    };

    checkStatus();
  }, [posts, balance, userRole]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PayPost Status Check</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Post Store</h3>
              <p className="text-sm">{status.postStore}</p>
              <p className="text-xs text-gray-500">Loading: {isLoading ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">User Store</h3>
              <p className="text-sm">{status.userStore}</p>
            </div>
            
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Supabase</h3>
              <p className="text-sm">{status.supabase}</p>
            </div>
            
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Surveys</h3>
              <p className="text-sm">{status.surveys}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Raw Data</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ 
                postsCount: posts.length, 
                balance, 
                userRole,
                isLoading 
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;