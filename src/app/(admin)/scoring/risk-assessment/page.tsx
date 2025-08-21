'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle,
  Users,
  Clock,
  Filter,
  Search,
  Bell,
  TrendingUp,
  Activity,
  Eye,
  MessageSquare,
  Calendar,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { CompactScoreVisualization } from '@/components/scoring/score-visualization'
import { RiskLevel, VisualizationData } from '@/types/scoring'

// Mock high-risk alerts data
const mockHighRiskAlerts = [
  {
    id: '1',
    patient_id: 'P001',
    patient_name: 'Sarah Johnson',
    questionnaire: 'GAD-7',
    score: 19,
    risk_level: 'critical' as RiskLevel,
    risk_label: 'Severe Anxiety',
    timestamp: '2024-01-20T14:30:00Z',
    status: 'new',
    assigned_to: null,
    notes_count: 0,
    last_contact: null,
    visualization_data: {
      score: 19,
      max_score: 21,
      min_score: 0,
      percentage: 90.5,
      risk_level: 'critical' as RiskLevel,
      label: 'Severe Anxiety',
      visualization_type: 'gauge' as const,
      zones: []
    }
  },
  {
    id: '2',
    patient_id: 'P002',
    patient_name: 'Michael Chen',
    questionnaire: 'PHQ-9',
    score: 22,
    risk_level: 'critical' as RiskLevel,
    risk_label: 'Severe Depression',
    timestamp: '2024-01-20T13:15:00Z',
    status: 'in_progress',
    assigned_to: 'Dr. Smith',
    notes_count: 3,
    last_contact: '2024-01-20T15:00:00Z',
    visualization_data: {
      score: 22,
      max_score: 27,
      min_score: 0,
      percentage: 81.5,
      risk_level: 'critical' as RiskLevel,
      label: 'Severe Depression',
      visualization_type: 'gauge' as const,
      zones: []
    }
  },
  {
    id: '3',
    patient_id: 'P003',
    patient_name: 'Emily Rodriguez',
    questionnaire: 'GAD-7',
    score: 16,
    risk_level: 'high' as RiskLevel,
    risk_label: 'Moderate Anxiety',
    timestamp: '2024-01-20T11:45:00Z',
    status: 'resolved',
    assigned_to: 'Dr. Johnson',
    notes_count: 5,
    last_contact: '2024-01-20T16:30:00Z',
    visualization_data: {
      score: 16,
      max_score: 21,
      min_score: 0,
      percentage: 76.2,
      risk_level: 'high' as RiskLevel,
      label: 'Moderate Anxiety',
      visualization_type: 'gauge' as const,
      zones: []
    }
  },
  {
    id: '4',
    patient_id: 'P004',
    patient_name: 'David Wilson',
    questionnaire: 'Custom Stress',
    score: 28,
    risk_level: 'high' as RiskLevel,
    risk_label: 'High Stress',
    timestamp: '2024-01-20T10:20:00Z',
    status: 'new',
    assigned_to: null,
    notes_count: 0,
    last_contact: null,
    visualization_data: {
      score: 28,
      max_score: 30,
      min_score: 0,
      percentage: 93.3,
      risk_level: 'high' as RiskLevel,
      label: 'High Stress',
      visualization_type: 'gauge' as const,
      zones: []
    }
  }
]

// Mock statistics
const mockStats = {
  total_high_risk: 24,
  critical_alerts: 8,
  new_alerts: 12,
  in_progress: 7,
  resolved_today: 5,
  average_response_time: '2.3 hours',
  escalation_rate: '15%'
}

// Mock team members
const mockTeamMembers = [
  { id: '1', name: 'Dr. Smith', role: 'Psychiatrist', active_cases: 8 },
  { id: '2', name: 'Dr. Johnson', role: 'Psychologist', active_cases: 12 },
  { id: '3', name: 'Dr. Brown', role: 'Therapist', active_cases: 6 },
  { id: '4', name: 'Dr. Wilson', role: 'Counselor', active_cases: 9 }
]

export default function RiskAssessmentPage() {
  const [alerts, setAlerts] = useState(mockHighRiskAlerts)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('alerts')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.questionnaire.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter
    const matchesRisk = riskFilter === 'all' || alert.risk_level === riskFilter
    return matchesSearch && matchesStatus && matchesRisk
  })

  const handleStatusChange = (alertId: string, newStatus: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ))
  }

  const handleAssignAlert = (alertId: string, assignee: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, assigned_to: assignee, status: 'in_progress' } : alert
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Assessment Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage high-risk patients requiring immediate attention
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button asChild>
            <Link href="/scoring/risk-assessment/settings">
              <Settings className="w-4 h-4 mr-2" />
              Alert Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.total_high_risk}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.critical_alerts} critical alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.new_alerts}</div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStats.in_progress}</div>
            <p className="text-xs text-muted-foreground">
              Currently being handled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.average_response_time}</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt; 4 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        {/* Risk Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients, IDs, or questionnaires..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
                  <p className="text-gray-600 text-center">
                    {searchTerm || statusFilter !== 'all' || riskFilter !== 'all' 
                      ? "Try adjusting your filters to see more results"
                      : "No high-risk alerts at this time"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getRiskColor(alert.risk_level)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{alert.patient_name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {alert.patient_id}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(alert.status)}`}>
                            {alert.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`text-xs capitalize ${getRiskColor(alert.risk_level)}`}>
                            {alert.risk_level} Risk
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Assessment</p>
                            <p className="font-medium">{alert.questionnaire}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Alert Time</p>
                            <p className="font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assigned To</p>
                            <p className="font-medium">{alert.assigned_to || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Contact</p>
                            <p className="font-medium">
                              {alert.last_contact 
                                ? new Date(alert.last_contact).toLocaleString()
                                : 'No contact'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <CompactScoreVisualization data={alert.visualization_data} />
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>{alert.notes_count} notes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" asChild>
                          <Link href={`/scoring/risk-assessment/${alert.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        
                        {alert.status === 'new' && (
                          <Select onValueChange={(value) => handleAssignAlert(alert.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockTeamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.name}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {alert.status !== 'resolved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(alert.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Risk Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Trends</CardTitle>
                <CardDescription>
                  High-risk alerts over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Performance</CardTitle>
                <CardDescription>
                  Team response metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="text-sm font-medium text-green-600">2.3 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resolution Rate</span>
                    <span className="text-sm font-medium text-green-600">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Escalation Rate</span>
                    <span className="text-sm font-medium text-yellow-600">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-up Compliance</span>
                    <span className="text-sm font-medium text-green-600">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTeamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Active Cases</span>
                      <Badge variant="outline">{member.active_cases}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
