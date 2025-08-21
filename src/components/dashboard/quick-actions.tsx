'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Mail,
  Download,
  Settings,
  Brain
} from 'lucide-react'

const quickActions = [
  {
    title: 'Create Questionnaire',
    description: 'Build a new mental health assessment',
    icon: Plus,
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/questionnaires/new'
  },
  {
    title: 'View Responses',
    description: 'Review latest participant responses',
    icon: Users,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/responses'
  },
  {
    title: 'Generate Report',
    description: 'Create analytics and insights report',
    icon: BarChart3,
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/analytics/reports'
  },
  {
    title: 'Send Email',
    description: 'Communicate with participants',
    icon: Mail,
    color: 'bg-orange-500 hover:bg-orange-600',
    href: '/email/compose'
  },
  {
    title: 'AI Analysis',
    description: 'Run AI-powered mental health analysis',
    icon: Brain,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    href: '/ai-analysis/new'
  },
  {
    title: 'Export Data',
    description: 'Download data for external analysis',
    icon: Download,
    color: 'bg-gray-500 hover:bg-gray-600',
    href: '/export'
  }
]

export function QuickActions() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all"
            asChild
          >
            <a href={action.href}>
              <div className="flex items-center space-x-3 w-full">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center transition-colors`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </a>
          </Button>
        ))}
      </div>
    </Card>
  )
}
