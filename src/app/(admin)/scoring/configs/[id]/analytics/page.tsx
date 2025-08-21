'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  Calendar,
  Download,
  AlertTriangle,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { CompactScoreVisualization } from '@/components/scoring/score-visualization'
import { ScoringAnalytics, VisualizationData } from '@/types/scoring'

// Mock detailed analytics data
const mockDetailedAnalytics: ScoringAnalytics = {
  total_scores: 156,
  average_score: 8.4,
  risk_distribution: {
    none: 12,
    low: 45,
    medium: 67,
    high: 24,
    critical: 8
  },
  risk_percentage: {
    none: 8,
    low: 29,
    medium: 43,
    high: 15,
    critical: 5
  },
  high_risk_count: 32,
  trend_direction: 'up',
  score_trends: [
    { date: '2024-01-14', average_score: 7.8, total_responses: 12 },
    { date: '2024-01-15', average_score: 8.1, total_responses: 18 },
    { date: '2024-01-16', average_score: 8.3, total_responses: 15 },
    { date: '2024-01-17', average_score: 8.6, total_responses: 22 },
    { date: '2024-01-18', average_score: 8.2, total_responses: 19 },
    { date: '2024-01-19', average_score: 8.7, total_responses: 16 },
    { date: '2024-01-20', average_score: 8.9, total_responses: 14 }
  ],
  category_performance: {
    'Physical Symptoms': { average_score: 2.3, total_responses: 156 },
    'Emotional Symptoms': { average_score: 3.1, total_responses: 156 },
    'Behavioral Symptoms': { average_score: 3.0, total_responses: 156 }
  },
  last_updated: '2024-01-20T15:30:00Z'
}

const mockRecentHighRiskScores = [
  {
    id: '1',
    patient_id: 'P001',
    score: 18,
    max_score: 21,
    min_score: 0,
    percentage: 85.7,
    risk_level: 'critical' as const,
    label: 'Severe Anxiety',
    visualization_type: 'gauge' as const,
    zones: [],
    timestamp: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    patient_id: 'P002',
    score: 16,
    max_score: 21,
    min_score: 0,
    percentage: 76.2,
    risk_level: 'high' as const,
    label: 'Moderate Anxiety',
    visualization_type: 'gauge' as const,
    zones: [],
    timestamp: '2024-01-20T13:15:00Z'
  },
  {
    id: '3',
    patient_id: 'P003',
    score: 15,
    max_score: 21,
    min_score: 0,
    percentage: 71.4,
    risk_level: 'high' as const,
    label: 'Moderate Anxiety',
    visualization_type: 'gauge' as const,
    zones: [],
    timestamp: '2024-01-20T11:45:00Z'
  }
]

const mockConfigInfo = {
  id: 'gad7_standard',
  name: 'GAD-7 Standard Scoring',
  questionnaire_title: 'Generalized Anxiety Disorder Assessment'
}

export default function ConfigAnalyticsPage() {
  const params = useParams()
  const [analytics, setAnalytics] = useState<ScoringAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  useEffect(() => {
    // Simulate loading analytics
    const timer = setTimeout(() => {
      setAnalytics(mockDetailedAnalytics)
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [params.id, selectedTimeRange])

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

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Not Available</h3>
            <p className="text-gray-600 text-center mb-4">
              Unable to load analytics data for this configuration.
            </p>
            <Button asChild>
              <Link href={`/scoring/configs/${params.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Configuration
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/scoring/configs/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configuration
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuration Analytics</h1>
            <p className="text-gray-600 mt-2">
              Detailed analytics for {mockConfigInfo.name}
            </p>
          </div>
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
            <div className="text-2xl font-bold">{analytics.total_scores}</div>
            <p className="text-xs text-muted-foreground">
              Calculated with this configuration
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
                {analytics.trend_direction === 'up' ? 'Increasing trend' : 
                 analytics.trend_direction === 'down' ? 'Decreasing trend' : 'Stable trend'}
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
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-muted-foreground">
              Assessment completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
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
                      <span className="text-sm font-medium capitalize">{level} Risk</span>
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
              Average scores over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.score_trends.slice(-7).map((trend, index) => (
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

        {/* Category Performance */}
        {analytics.category_performance && (
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Average scores by question categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.category_performance).map(([category, performance]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{performance.average_score}</span>
                      <Badge variant="outline" className="text-xs">
                        avg score
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent High-Risk Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Recent High-Risk Scores</CardTitle>
            <CardDescription>
              Latest high-risk assessments requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentHighRiskScores.map((score, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Patient {score.patient_id}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(score.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <CompactScoreVisualization data={score} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>
            Additional performance metrics for this configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.2</div>
              <p className="text-sm text-gray-600">Avg Response Time (min)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94.3%</div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.1</div>
              <p className="text-sm text-gray-600">Avg Questions Skipped</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">87%</div>
              <p className="text-sm text-gray-600">Clinical Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Download analytics data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF Report
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Raw Data (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
