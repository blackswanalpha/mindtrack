'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react'
import { type DashboardStats } from '@/lib/dashboard-api'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
    period: string
  }
  icon: React.ComponentType<{ className?: string }>
  color: string
  description?: string
}

function MetricCard({ title, value, change, icon: Icon, color, description }: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            
            {change && (
              <div className="flex items-center space-x-1">
                {change.type === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : change.type === 'decrease' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Activity className="w-4 h-4 text-gray-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change.type === 'increase'
                      ? 'text-green-600'
                      : change.type === 'decrease'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {change.value}
                </span>
                <span className="text-sm text-gray-500">{change.period}</span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface DashboardMetricsProps {
  stats: DashboardStats | null
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      change: {
        value: '+2.1%',
        type: 'increase' as const,
        period: 'vs last month'
      },
      icon: Target,
      color: 'bg-green-500',
      description: 'Average completion rate across all questionnaires'
    },
    {
      title: 'Avg. Response Time',
      value: stats.avgResponseTime,
      change: {
        value: '-0.8 min',
        type: 'increase' as const,
        period: 'vs last month'
      },
      icon: Clock,
      color: 'bg-blue-500',
      description: 'Time taken to complete questionnaires'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: {
        value: '+156',
        type: 'increase' as const,
        period: 'this month'
      },
      icon: Activity,
      color: 'bg-purple-500',
      description: 'Users who completed at least one questionnaire'
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts.toString(),
      change: {
        value: '+3',
        type: 'decrease' as const,
        period: 'this week'
      },
      icon: AlertCircle,
      color: 'bg-red-500',
      description: 'High-risk responses requiring attention'
    }
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
          <p className="text-sm text-gray-600">Performance indicators for your mental health platform</p>
        </div>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  )
}
