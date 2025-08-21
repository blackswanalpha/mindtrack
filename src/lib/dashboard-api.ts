// Dashboard API service layer
// This would connect to your actual backend APIs

export interface DashboardStats {
  totalResponses: number
  activeQuestionnaires: number
  completionRate: number
  aiAnalyses: number
  responseRate: number
  avgResponseTime: string
  activeUsers: number
  criticalAlerts: number
}

export interface ResponseTrend {
  month: string
  responses: number
}

export interface CompletionData {
  questionnaire: string
  completion: number
}

export interface MentalHealthTrend {
  month: string
  anxiety: number
  depression: number
  stress: number
  wellbeing: number
}

export interface RiskDistribution {
  name: string
  value: number
  color: string
}

export interface Activity {
  id: number
  type: string
  title: string
  description: string
  time: string
  icon: string
  color: string
}

export interface RecentQuestionnaire {
  id: number
  name: string
  responses: number
  completion: number
  status: 'active' | 'draft' | 'archived'
  lastUpdated: string
}

// Mock API functions - replace with actual API calls
export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    totalResponses: 2847,
    activeQuestionnaires: 24,
    completionRate: 87.3,
    aiAnalyses: 1234,
    responseRate: 87.3,
    avgResponseTime: '4.2 min',
    activeUsers: 1847,
    criticalAlerts: 12
  }
}

export async function getResponseTrends(): Promise<ResponseTrend[]> {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return [
    { month: 'Jan', responses: 120 },
    { month: 'Feb', responses: 150 },
    { month: 'Mar', responses: 180 },
    { month: 'Apr', responses: 220 },
    { month: 'May', responses: 280 },
    { month: 'Jun', responses: 320 }
  ]
}

export async function getCompletionData(): Promise<CompletionData[]> {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return [
    { questionnaire: 'Mental Health Survey', completion: 92 },
    { questionnaire: 'Stress Assessment', completion: 87 },
    { questionnaire: 'Wellness Check', completion: 94 },
    { questionnaire: 'Mood Tracker', completion: 78 },
    { questionnaire: 'Anxiety Scale', completion: 85 }
  ]
}

export async function getMentalHealthTrends(): Promise<MentalHealthTrend[]> {
  await new Promise(resolve => setTimeout(resolve, 900))
  
  return [
    { month: 'Jan', anxiety: 65, depression: 45, stress: 70, wellbeing: 75 },
    { month: 'Feb', anxiety: 62, depression: 42, stress: 68, wellbeing: 78 },
    { month: 'Mar', anxiety: 58, depression: 38, stress: 65, wellbeing: 82 },
    { month: 'Apr', anxiety: 55, depression: 35, stress: 62, wellbeing: 85 },
    { month: 'May', anxiety: 52, depression: 32, stress: 58, wellbeing: 88 },
    { month: 'Jun', anxiety: 48, depression: 28, stress: 55, wellbeing: 92 }
  ]
}

export async function getRiskDistribution(): Promise<RiskDistribution[]> {
  await new Promise(resolve => setTimeout(resolve, 700))
  
  return [
    { name: 'Low Risk', value: 65, color: '#10b981' },
    { name: 'Moderate Risk', value: 25, color: '#f59e0b' },
    { name: 'High Risk', value: 8, color: '#ef4444' },
    { name: 'Critical Risk', value: 2, color: '#dc2626' }
  ]
}

export async function getRecentActivities(): Promise<Activity[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      id: 1,
      type: 'response',
      title: 'New response received',
      description: 'Mental Health Survey - Participant #2847',
      time: '2 minutes ago',
      icon: 'Users',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'questionnaire',
      title: 'Questionnaire published',
      description: 'Stress Assessment v2.1 is now live',
      time: '1 hour ago',
      icon: 'FileText',
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'analysis',
      title: 'AI analysis completed',
      description: 'Weekly mental health trends report',
      time: '3 hours ago',
      icon: 'Brain',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      type: 'email',
      title: 'Email campaign sent',
      description: 'Wellness reminder to 1,234 participants',
      time: '5 hours ago',
      icon: 'Mail',
      color: 'bg-orange-500'
    },
    {
      id: 5,
      type: 'response',
      title: 'Bulk responses imported',
      description: '45 responses from external survey tool',
      time: '1 day ago',
      icon: 'Users',
      color: 'bg-blue-500'
    }
  ]
}

export async function getRecentQuestionnaires(): Promise<RecentQuestionnaire[]> {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return [
    {
      id: 1,
      name: 'Mental Health Survey',
      responses: 234,
      completion: 92,
      status: 'active',
      lastUpdated: '2 hours ago'
    },
    {
      id: 2,
      name: 'Stress Assessment',
      responses: 189,
      completion: 87,
      status: 'active',
      lastUpdated: '1 day ago'
    },
    {
      id: 3,
      name: 'Wellness Check',
      responses: 156,
      completion: 94,
      status: 'active',
      lastUpdated: '2 days ago'
    },
    {
      id: 4,
      name: 'Mood Tracker',
      responses: 98,
      completion: 78,
      status: 'draft',
      lastUpdated: '3 days ago'
    }
  ]
}

// Error handling utility
export class DashboardAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'DashboardAPIError'
  }
}

// Generic API wrapper with error handling
export async function apiCall<T>(
  apiFunction: () => Promise<T>,
  errorMessage: string = 'Failed to fetch data'
): Promise<T> {
  try {
    return await apiFunction()
  } catch (error) {
    console.error('Dashboard API Error:', error)
    throw new DashboardAPIError(errorMessage)
  }
}
