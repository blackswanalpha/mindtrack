'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { AdvancedAnalytics } from '@/components/dashboard/advanced-analytics'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { DashboardLoading } from '@/components/dashboard/dashboard-loading'
import { DashboardError } from '@/components/dashboard/dashboard-error'
import { useDashboardData } from '@/hooks/use-dashboard-data'

export default function DashboardPage() {
  const {
    stats,
    responseTrends,
    completionData,
    mentalHealthTrends,
    riskDistribution,
    recentActivities,
    recentQuestionnaires,
    loading,
    error,
    refetch
  } = useDashboardData()

  if (loading) {
    return <DashboardLoading />
  }

  if (error) {
    return <DashboardError error={new Error(error)} reset={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Statistics Cards */}
      <StatsCards stats={stats} />

      {/* Dashboard Metrics */}
      <DashboardMetrics stats={stats} />

      {/* Analytics Charts */}
      <AnalyticsCharts
        responseTrends={responseTrends}
        completionData={completionData}
      />

      {/* Advanced Analytics */}
      <AdvancedAnalytics
        mentalHealthTrends={mentalHealthTrends}
        riskDistribution={riskDistribution}
      />

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity
            activities={recentActivities}
            questionnaires={recentQuestionnaires}
          />
        </div>
      </div>
    </div>
  )
}
