import { create } from 'zustand';

export const useSurveyStore = create((set, get) => ({
  // Survey data
  createdSurveys: [], // Surveys created by the current user (creator)
  completedSurveys: [], // Surveys completed by the current user (participant)
  availableSurveys: [], // All available surveys for participants
  
  // Escrow tracking
  escrowBalance: 0, // Total tokens held in escrow for creator's surveys
  
  // Loading states
  isLoading: false,
  
  // Initialize surveys from localStorage
  initialize: () => {
    const savedCreatedSurveys = localStorage.getItem('paypost_created_surveys');
    const savedCompletedSurveys = localStorage.getItem('paypost_completed_surveys');
    
    if (savedCreatedSurveys) {
      set({ createdSurveys: JSON.parse(savedCreatedSurveys) });
    }
    
    if (savedCompletedSurveys) {
      set({ completedSurveys: JSON.parse(savedCompletedSurveys) });
    }
  },
  
  // Add a created survey (for creators)
  addCreatedSurvey: (survey) => {
    const { createdSurveys } = get();
    const newSurveys = [...createdSurveys, {
      ...survey,
      id: survey.id || Date.now(),
      createdAt: new Date().toISOString(),
      responses: 0,
      status: 'active',
      escrowAmount: survey.totalCost || 0
    }];
    
    set({ createdSurveys: newSurveys });
    localStorage.setItem('paypost_created_surveys', JSON.stringify(newSurveys));
    
    // Update escrow balance
    const { escrowBalance } = get();
    set({ escrowBalance: escrowBalance + (survey.totalCost || 0) });
  },
  
  // Update survey response count
  incrementSurveyResponses: (surveyId) => {
    const { createdSurveys } = get();
    const updatedSurveys = createdSurveys.map(survey => {
      if (survey.id === surveyId) {
        const newResponses = survey.responses + 1;
        const isCompleted = newResponses >= survey.maxResponses;
        
        return {
          ...survey,
          responses: newResponses,
          status: isCompleted ? 'completed' : 'active'
        };
      }
      return survey;
    });
    
    set({ createdSurveys: updatedSurveys });
    localStorage.setItem('paypost_created_surveys', JSON.stringify(updatedSurveys));
  },
  
  // Add a completed survey (for participants)
  addCompletedSurvey: (surveyId, reward) => {
    const { completedSurveys } = get();
    
    // Check if already completed
    if (completedSurveys.some(s => s.surveyId === surveyId)) {
      console.warn('Survey already completed');
      return false;
    }
    
    const newCompleted = [...completedSurveys, {
      surveyId,
      completedAt: new Date().toISOString(),
      reward
    }];
    
    set({ completedSurveys: newCompleted });
    localStorage.setItem('paypost_completed_surveys', JSON.stringify(newCompleted));
    
    return true;
  },
  
  // Check if participant has completed a survey
  hasCompletedSurvey: (surveyId) => {
    const { completedSurveys } = get();
    return completedSurveys.some(s => s.surveyId === surveyId);
  },
  
  // Get total earnings for participant
  getTotalEarnings: () => {
    const { completedSurveys } = get();
    return completedSurveys.reduce((total, survey) => total + (survey.reward || 0), 0);
  },
  
  // Get creator statistics
  getCreatorStats: () => {
    const { createdSurveys, escrowBalance } = get();
    
    const totalSurveys = createdSurveys.length;
    const activeSurveys = createdSurveys.filter(s => s.status === 'active').length;
    const completedSurveys = createdSurveys.filter(s => s.status === 'completed').length;
    const totalResponses = createdSurveys.reduce((sum, s) => sum + s.responses, 0);
    const totalPotentialResponses = createdSurveys.reduce((sum, s) => sum + s.maxResponses, 0);
    
    return {
      totalSurveys,
      activeSurveys,
      completedSurveys,
      totalResponses,
      totalPotentialResponses,
      escrowBalance,
      responseRate: totalPotentialResponses > 0 
        ? ((totalResponses / totalPotentialResponses) * 100).toFixed(1)
        : 0
    };
  },
  
  // Get participant statistics
  getParticipantStats: () => {
    const { completedSurveys } = get();
    
    const totalCompleted = completedSurveys.length;
    const totalEarnings = get().getTotalEarnings();
    const avgEarnings = totalCompleted > 0 ? totalEarnings / totalCompleted : 0;
    
    return {
      totalCompleted,
      totalEarnings,
      avgEarnings
    };
  },
  
  // Set available surveys (fetched from backend/blockchain)
  setAvailableSurveys: (surveys) => {
    set({ availableSurveys: surveys });
  },
  
  // Release escrow when survey is completed
  releaseEscrow: (amount) => {
    const { escrowBalance } = get();
    set({ escrowBalance: Math.max(0, escrowBalance - amount) });
  },
  
  // Clear all data (for logout)
  clear: () => {
    set({
      createdSurveys: [],
      completedSurveys: [],
      availableSurveys: [],
      escrowBalance: 0
    });
    localStorage.removeItem('paypost_created_surveys');
    localStorage.removeItem('paypost_completed_surveys');
  }
}));
