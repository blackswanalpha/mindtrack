'use client'

import { useState, useEffect } from 'react'
import {
  getDashboardStats,
  getResponseTrends,
  getCompletionData,
  getMentalHealthTrends,
  getRiskDistribution,
  getRecentActivities,
  getRecentQuestionnaires,
  apiCall,
  type DashboardStats,
  type ResponseTrend,
  type CompletionData,
  type MentalHealthTrend,
  type RiskDistribution,
  type Activity,
  type RecentQuestionnaire
} from '@/lib/dashboard-api'

interface UseDashboardDataReturn {
  stats: DashboardStats | null
  responseTrends: ResponseTrend[]
  completionData: CompletionData[]
  mentalHealthTrends: MentalHealthTrend[]
  riskDistribution: RiskDistribution[]
  recentActivities: Activity[]
  recentQuestionnaires: RecentQuestionnaire[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardData(): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [responseTrends, setResponseTrends] = useState<ResponseTrend[]>([])
  const [completionData, setCompletionData] = useState<CompletionData[]>([])
  const [mentalHealthTrends, setMentalHealthTrends] = useState<MentalHealthTrend[]>([])
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [recentQuestionnaires, setRecentQuestionnaires] = useState<RecentQuestionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [
        statsData,
        trendsData,
        completionDataResult,
        mentalHealthData,
        riskData,
        activitiesData,
        questionnairesData
      ] = await Promise.all([
        apiCall(getDashboardStats, 'Failed to fetch dashboard statistics'),
        apiCall(getResponseTrends, 'Failed to fetch response trends'),
        apiCall(getCompletionData, 'Failed to fetch completion data'),
        apiCall(getMentalHealthTrends, 'Failed to fetch mental health trends'),
        apiCall(getRiskDistribution, 'Failed to fetch risk distribution'),
        apiCall(getRecentActivities, 'Failed to fetch recent activities'),
        apiCall(getRecentQuestionnaires, 'Failed to fetch recent questionnaires')
      ])

      setStats(statsData)
      setResponseTrends(trendsData)
      setCompletionData(completionDataResult)
      setMentalHealthTrends(mentalHealthData)
      setRiskDistribution(riskData)
      setRecentActivities(activitiesData)
      setRecentQuestionnaires(questionnairesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refetch = () => {
    fetchData()
  }

  return {
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
  }
}

// Hook for individual data sections (for better performance)
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiCall(getDashboardStats)
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useResponseTrends() {
  const [data, setData] = useState<ResponseTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall(getResponseTrends)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch response trends')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export function useRecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiCall(getRecentActivities)
        setActivities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent activities')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return { activities, loading, error }
}
