import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, Eye } from 'lucide-react';
import { useSurveyStore } from '../stores/surveyStore';
import { useUserStore } from '../stores/userStore';
import { fadeIn } from '../animations/fadeIn';
import Card from './Card';

const CreatorDashboard = () => {
  const { createdSurveys, getCreatorStats } = useSurveyStore();
  const { balance } = useUserStore();
  const stats = getCreatorStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSurveys}</p>
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
              <p className="text-2xl font-bold text-orange-600">{stats.escrowBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-500">MOVE</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Created Surveys List */}
      <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Surveys</h2>
        
        {createdSurveys.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Surveys Yet</h3>
            <p className="text-gray-600 mb-4">Create your first survey to start gathering insights</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {createdSurveys.map((survey) => (
              <Card key={survey.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${survey.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {survey.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{survey.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{survey.responses}/{survey.maxResponses} responses</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{survey.rewardAmount} MOVE/response</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{survey.estimatedTime} min</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Eye className="w-4 h-4 mr-2" />
                        <span>{survey.questions.length} questions</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="ml-6 w-32">
                    <div className="text-right mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round((survey.responses / survey.maxResponses) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(survey.responses / survey.maxResponses) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreatorDashboard;
