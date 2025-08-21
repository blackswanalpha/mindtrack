'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Settings,
  BarChart3,
  Users,
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const mockScoringStats = {
  totalConfigurations: 12,
  activeConfigurations: 8,
  totalScoresCalculated: 1247,
  highRiskAlerts: 23,
  averageScore: 14.2,
  scoresTrend: '+5.2%'
}

const mockRecentConfigurations = [
  {
    id: 'gad7_config',
    name: 'GAD-7 Standard Scoring',
    questionnaire: 'Generalized Anxiety Disorder Assessment',
    method: 'sum',
    isDefault: true,
    isActive: true,
    lastUsed: '2024-01-20T10:30:00Z',
    totalScores: 156
  },
  {
    id: 'phq9_config',
    name: 'PHQ-9 Depression Scoring',
    questionnaire: 'Patient Health Questionnaire-9',
    method: 'sum',
    isDefault: true,
    isActive: true,
    lastUsed: '2024-01-19T15:45:00Z',
    totalScores: 89
  },
  {
    id: 'custom_anxiety_config',
    name: 'Custom Anxiety Assessment',
    questionnaire: 'Custom Anxiety Questionnaire',
    method: 'weighted',
    isDefault: false,
    isActive: true,
    lastUsed: '2024-01-18T09:15:00Z',
    totalScores: 34
  }
]

const mockRiskAlerts = [
  {
    id: 1,
    patientId: 'P001',
    questionnaire: 'GAD-7',
    score: 18,
    riskLevel: 'high',
    timestamp: '2024-01-20T14:30:00Z'
  },
  {
    id: 2,
    patientId: 'P002',
    questionnaire: 'PHQ-9',
    score: 22,
    riskLevel: 'critical',
    timestamp: '2024-01-20T13:15:00Z'
  },
  {
    id: 3,
    patientId: 'P003',
    questionnaire: 'GAD-7',
    score: 16,
    riskLevel: 'high',
    timestamp: '2024-01-20T11:45:00Z'
  }
]

export default function ScoringDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-gray-900">Scoring Engine</h1>
          <p className="text-gray-600 mt-2">
            Manage scoring configurations, analyze results, and monitor risk assessments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/scoring/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/scoring/configs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Configuration
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockScoringStats.totalConfigurations}</div>
            <p className="text-xs text-muted-foreground">
              {mockScoringStats.activeConfigurations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scores Calculated</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockScoringStats.totalScoresCalculated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mockScoringStats.scoresTrend} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockScoringStats.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Across all questionnaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockScoringStats.highRiskAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/scoring/configs" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Manage Configurations
              </CardTitle>
              <CardDescription>
                Create, edit, and manage scoring configurations for your questionnaires
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/scoring/analytics" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Score Analytics
              </CardTitle>
              <CardDescription>
                View detailed analytics, trends, and insights from scoring data
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/scoring/risk-assessment" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Monitor high-risk scores and manage alert notifications
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recent Configurations
            </CardTitle>
            <CardDescription>
              Recently used scoring configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentConfigurations.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{config.name}</h4>
                    {config.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                    <Badge 
                      variant={config.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{config.questionnaire}</p>
                  <p className="text-xs text-gray-500">
                    Method: {config.method} • {config.totalScores} scores calculated
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/scoring/configs/${config.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Risk Alerts
            </CardTitle>
            <CardDescription>
              High-risk scores requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRiskAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Patient {alert.patientId}</h4>
                    <Badge 
                      variant={alert.riskLevel === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.riskLevel === 'critical' ? 'Critical' : 'High Risk'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {alert.questionnaire} • Score: {alert.score}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
