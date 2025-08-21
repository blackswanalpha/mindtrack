'use client'

import { Card } from '@/components/ui/card'
import {
  Users,
  FileText,
  TrendingUp,
  Brain,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { type DashboardStats } from '@/lib/dashboard-api'

interface StatsCardsProps {
  stats: DashboardStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      name: 'Total Responses',
      value: stats.totalResponses.toLocaleString(),
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Questionnaires',
      value: stats.activeQuestionnaires.toString(),
      change: '+3',
      changeType: 'increase' as const,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      name: 'Completion Rate',
      value: `${stats.completionRate}%`,
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'AI Analyses',
      value: stats.aiAnalyses.toLocaleString(),
      change: '-5.2%',
      changeType: 'decrease' as const,
      icon: Brain,
      color: 'bg-orange-500'
    }
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.name} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <div className="flex items-center mt-2">
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
