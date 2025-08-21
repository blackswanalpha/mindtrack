'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Brain, 
  Mail,
  MoreHorizontal,
  ExternalLink,
  Clock
} from 'lucide-react'

const recentActivities = [
  {
    id: 1,
    type: 'response',
    title: 'New response received',
    description: 'Mental Health Survey - Participant #2847',
    time: '2 minutes ago',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    type: 'questionnaire',
    title: 'Questionnaire published',
    description: 'Stress Assessment v2.1 is now live',
    time: '1 hour ago',
    icon: FileText,
    color: 'bg-green-500'
  },
  {
    id: 3,
    type: 'analysis',
    title: 'AI analysis completed',
    description: 'Weekly mental health trends report',
    time: '3 hours ago',
    icon: Brain,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    type: 'email',
    title: 'Email campaign sent',
    description: 'Wellness reminder to 1,234 participants',
    time: '5 hours ago',
    icon: Mail,
    color: 'bg-orange-500'
  },
  {
    id: 5,
    type: 'response',
    title: 'Bulk responses imported',
    description: '45 responses from external survey tool',
    time: '1 day ago',
    icon: Users,
    color: 'bg-blue-500'
  }
]

const recentQuestionnaires = [
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

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {/* Recent Activity Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest updates and actions</p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <activity.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </div>
      </Card>

      {/* Recent Questionnaires */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Questionnaires</h3>
            <p className="text-sm text-gray-600">Your latest questionnaires and their performance</p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentQuestionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">{questionnaire.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  questionnaire.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {questionnaire.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Responses:</span>
                  <span className="ml-1 font-medium text-gray-900">{questionnaire.responses}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completion:</span>
                  <span className="ml-1 font-medium text-gray-900">{questionnaire.completion}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">Updated {questionnaire.lastUpdated}</span>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" className="w-full">
            View All Questionnaires
          </Button>
        </div>
      </Card>
    </div>
  )
}
