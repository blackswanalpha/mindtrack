'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Users,
  Calendar,
  Download
} from 'lucide-react'
import { CompactScoreVisualization } from '@/components/scoring/score-visualization'
import { ScoringAnalytics, VisualizationData } from '@/types/scoring'

// Mock analytics data
const mockAnalytics: ScoringAnalytics = {
  total_scores: 1247,
  average_score: 14.2,
  risk_distribution: {
    none: 156,
    low: 423,
    medium: 387,
    high: 198,
    critical: 83
  },
  risk_percentage: {
    none: 13,
    low: 34,
    medium: 31,
    high: 16,
    critical: 6
  },
  high_risk_count: 281,
  trend_direction: 'up',
  score_trends: [
    { date: '2024-01-15', average_score: 13.2, total_responses: 45 },
    { date: '2024-01-16', average_score: 13.8, total_responses: 52 },
    { date: '2024-01-17', average_score: 14.1, total_responses: 48 },
    { date: '2024-01-18', average_score: 14.5, total_responses: 61 },
    { date: '2024-01-19', average_score: 14.2, total_responses: 39 },
    { date: '2024-01-20', average_score: 14.8, total_responses: 44 }
  ],
  last_updated: '2024-01-20T15:30:00Z'
}

const mockRecentScores = [
  {
    id: '1',
    score: 18,
    max_score: 21,
    min_score: 0,
    percentage: 85.7,
    risk_level: 'high' as const,
    label: 'High Anxiety',
    visualization_type: 'gauge' as const,
    zones: []
  },
  {
    id: '2',
    score: 8,
    max_score: 21,
    min_score: 0,
    percentage: 38.1,
    risk_level: 'medium' as const,
    label: 'Mild Anxiety',
    visualization_type: 'gauge' as const,
    zones: []
  },
  {
    id: '3',
    score: 3,
    max_score: 21,
    min_score: 0,
    percentage: 14.3,
    risk_level: 'low' as const,
    label: 'Minimal Anxiety',
    visualization_type: 'gauge' as const,
    zones: []
  }
]

export default function ScoringAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ScoringAnalytics>(mockAnalytics)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Score Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights and trends from scoring data
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scores</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_scores.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Calculated across all questionnaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.average_score}</div>
            <div className={`flex items-center text-xs ${getTrendColor(analytics.trend_direction)}`}>
              {getTrendIcon(analytics.trend_direction)}
              <span className="ml-1">
                {analytics.trend_direction === 'up' ? 'Increasing' : 
                 analytics.trend_direction === 'down' ? 'Decreasing' : 'Stable'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.high_risk_count}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.risk_percentage.high + analytics.risk_percentage.critical}% of total scores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Low Risk</span>
                <span>{analytics.risk_percentage.low + analytics.risk_percentage.none}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Medium Risk</span>
                <span>{analytics.risk_percentage.medium}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>High Risk</span>
                <span>{analytics.risk_percentage.high + analytics.risk_percentage.critical}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>
              Breakdown of scores by risk categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.risk_distribution).map(([level, count]) => {
                const percentage = analytics.risk_percentage[level as keyof typeof analytics.risk_percentage]
                const colors = {
                  none: 'bg-gray-500',
                  low: 'bg-green-500',
                  medium: 'bg-yellow-500',
                  high: 'bg-red-500',
                  critical: 'bg-red-700'
                }
                
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[level as keyof typeof colors]}`} />
                      <span className="text-sm font-medium capitalize">{level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Score Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Score Trends</CardTitle>
            <CardDescription>
              Average scores over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.score_trends.slice(-5).map((trend, index) => (
                <div key={trend.date} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{trend.average_score}</span>
                    <Badge variant="outline" className="text-xs">
                      {trend.total_responses} responses
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent High Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Recent High-Risk Scores</CardTitle>
            <CardDescription>
              Latest scores requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentScores.filter(score => score.risk_level === 'high' || score.risk_level === 'critical').map((score, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <CompactScoreVisualization data={score} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Response Time</span>
                <span className="text-sm font-medium">4.2 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium">94.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Configurations</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Most Used Config</span>
                <span className="text-sm font-medium">GAD-7 Standard</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">
                  {new Date(analytics.last_updated).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
