import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, Eye, ExternalLink, Database, Link } from 'lucide-react';
import { usePostStore } from '../stores/postStore';
import { useMovementWallet } from '../hooks/useMovementWallet';
import { useEffect, useState } from 'react';
import { fadeIn } from '../animations/fadeIn';
import { movementService } from '../services/movementService';
import Card from './Card';

const CreatorDashboard = () => {
  const { getCreatorSurveys, getCreatorStats, posts } = usePostStore();
  const { wallet } = useMovementWallet();
  const [createdSurveys, setCreatedSurveys] = useState([]);
  const [blockchainSurveys, setBlockchainSurveys] = useState([]);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    escrowBalance: 0,
    blockchainSurveys: 0,
    supabaseSurveys: 0
  });
  const [loading, setLoading] = useState(true);

  // Load creator's surveys and stats
  useEffect(() => {
    const loadCreatorData = async () => {
      if (!wallet?.address) return;
      
      setLoading(true);
      try {
        // Load Supabase surveys
        const surveys = await getCreatorSurveys(wallet.address);
        setCreatedSurveys(surveys);
        
        // Load blockchain surveys
        try {
          const allBlockchainSurveys = await movementService.getSurveys();
          const creatorBlockchainSurveys = allBlockchainSurveys.filter(s => 
            s.creator && s.creator.toLowerCase() === wallet.address.toLowerCase()
          );
          setBlockchainSurveys(creatorBlockchainSurveys);
        } catch (blockchainError) {
          console.warn('Failed to load blockchain surveys:', blockchainError);
          setBlockchainSurveys([]);
        }
        
        // Load stats (including blockchain escrow)
        const creatorStats = await getCreatorStats(wallet.address);
        
        // Enhanced stats with blockchain data
        const blockchainActiveSurveys = blockchainSurveys.filter(s => s.isActive).length;
        const supabaseActiveSurveys = surveys.filter(s => s.is_active).length;
        
        setStats({
          ...creatorStats,
          blockchainSurveys: blockchainSurveys.length,
          supabaseSurveys: surveys.length,
          totalSurveys: Math.max(creatorStats.totalSurveys, blockchainSurveys.length + surveys.length),
          activeSurveys: Math.max(creatorStats.activeSurveys, blockchainActiveSurveys + supabaseActiveSurveys)
        });
        
        console.log('Loaded creator data:', { 
          supabaseSurveys: surveys.length, 
          blockchainSurveys: blockchainSurveys.length,
          stats: creatorStats 
        });
      } catch (error) {
        console.error('Failed to load creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCreatorData();
  }, [wallet?.address, getCreatorSurveys, getCreatorStats, posts]); // Added posts dependency to refresh when surveys change

  console.log('Current stats:', stats, 'for wallet:', wallet?.address);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSurveys}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-blue-600">⛓️ {stats.blockchainSurveys}</span>
                <span className="text-xs text-green-600">📊 {stats.supabaseSurveys}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Surveys</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSurveys}</p>
              <p className="text-xs text-gray-500">Currently running</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalResponses}</p>
              <p className="text-xs text-gray-500">Across all surveys</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Escrow</p>
              <p className="text-2xl font-bold text-orange-600">{(stats.escrowBalance || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500">MOVE tokens</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Blockchain Surveys Section */}
      {blockchainSurveys.length > 0 && (
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Blockchain Surveys</h2>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              ⛓️ {blockchainSurveys.length} on-chain
            </span>
          </div>
          
          <div className="space-y-4">
            {blockchainSurveys.map((survey) => (
              <Card key={`blockchain-${survey.id}`} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${survey.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {survey.isActive ? 'Active' : 'Completed'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        ⛓️ On-Chain
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{survey.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{survey.current_responses || 0}/{survey.max_responses} responses</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{survey.reward_amount} MOVE/response</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Database className="w-4 h-4 mr-2" />
                        <span>ID: {survey.id}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{new Date(survey.timestamp).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Blockchain Explorer Link */}
                      <div className="col-span-1">
                        <button
                          onClick={() => window.open(`https://explorer.movementnetwork.xyz/account/${import.meta.env.VITE_CONTRACT_ADDRESS}?network=testnet`, '_blank')}
                          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Contract
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="ml-6 w-32">
                    <div className="text-right mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(((survey.current_responses || 0) / survey.max_responses) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((survey.current_responses || 0) / survey.max_responses) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Supabase Surveys Section */}
      <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
        <div className="flex items-center space-x-2 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Database Surveys</h2>
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            📊 {createdSurveys.length} in database
          </span>
        </div>
        
        {createdSurveys.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Database Surveys Yet</h3>
            <p className="text-gray-600 mb-4">Create your first survey to start gathering insights</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {createdSurveys.map((survey) => (
              <Card key={`supabase-${survey.id}`} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${survey.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {survey.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        📊 Database
                      </span>
                      {survey.blockchain_tx_hash && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          ⛓️ Linked
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{survey.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{survey.current_responses || 0}/{survey.max_responses} responses</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{survey.reward_amount} MOVE/response</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{survey.estimated_time || 5} min</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Eye className="w-4 h-4 mr-2" />
                        <span>{survey.questions?.length || 0} questions</span>
                      </div>
                      
                      {/* Transaction Hash Button */}
                      <div className="col-span-1">
                        {survey.blockchain_tx_hash ? (
                          <button
                            onClick={() => window.open(`https://explorer.movementnetwork.xyz/txn/${survey.blockchain_tx_hash}?network=testnet`, '_blank')}
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Link className="w-4 h-4 mr-1" />
                            View TX
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No TX hash</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="ml-6 w-32">
                    <div className="text-right mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(((survey.current_responses || 0) / survey.max_responses) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((survey.current_responses || 0) / survey.max_responses) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Summary Info */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>⛓️ Blockchain surveys are stored on Movement Network</span>
              <span>📊 Database surveys are stored in Supabase</span>
            </div>
            <button
              onClick={() => window.open(`https://explorer.movementnetwork.xyz/account/${import.meta.env.VITE_CONTRACT_ADDRESS}?network=testnet`, '_blank')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Contract on Explorer
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatorDashboard;
