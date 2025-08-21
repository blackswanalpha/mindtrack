'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { 
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  Filter,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'

// Mock report data
const mockReports = [
  {
    id: '1',
    title: 'Weekly Risk Assessment Summary',
    description: 'Summary of high-risk alerts and interventions for the past week',
    type: 'summary',
    period: 'weekly',
    generated_at: '2024-01-20T09:00:00Z',
    generated_by: 'System',
    status: 'completed',
    file_size: '2.3 MB',
    download_count: 12,
    metrics: {
      total_alerts: 24,
      critical_alerts: 8,
      resolved_alerts: 18,
      response_time: '2.1 hours'
    }
  },
  {
    id: '2',
    title: 'Monthly Risk Trends Analysis',
    description: 'Detailed analysis of risk trends and patterns over the past month',
    type: 'analysis',
    period: 'monthly',
    generated_at: '2024-01-15T10:30:00Z',
    generated_by: 'Dr. Smith',
    status: 'completed',
    file_size: '5.7 MB',
    download_count: 8,
    metrics: {
      total_patients: 156,
      high_risk_patients: 32,
      improvement_rate: '78%',
      readmission_rate: '12%'
    }
  },
  {
    id: '3',
    title: 'Team Performance Report',
    description: 'Performance metrics for the clinical team handling risk assessments',
    type: 'performance',
    period: 'monthly',
    generated_at: '2024-01-10T14:15:00Z',
    generated_by: 'Admin',
    status: 'completed',
    file_size: '1.8 MB',
    download_count: 15,
    metrics: {
      team_members: 8,
      avg_response_time: '1.8 hours',
      resolution_rate: '94%',
      satisfaction_score: '4.6/5'
    }
  },
  {
    id: '4',
    title: 'Quarterly Compliance Report',
    description: 'Compliance metrics and regulatory requirements status',
    type: 'compliance',
    period: 'quarterly',
    generated_at: '2024-01-05T16:45:00Z',
    generated_by: 'Compliance Officer',
    status: 'completed',
    file_size: '8.2 MB',
    download_count: 5,
    metrics: {
      compliance_score: '98%',
      audit_findings: 2,
      corrective_actions: 1,
      certification_status: 'Valid'
    }
  }
]

// Mock statistics for report generation
const mockStats = {
  total_reports: 24,
  reports_this_month: 8,
  most_downloaded: 'Weekly Risk Assessment Summary',
  avg_generation_time: '3.2 minutes'
}

export default function RiskAssessmentReportsPage() {
  const [reports, setReports] = useState(mockReports)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesPeriod = selectedPeriod === 'all' || report.period === selectedPeriod
    const matchesType = selectedType === 'all' || report.type === selectedType
    return matchesPeriod && matchesType
  })

  const handleGenerateReport = async (type: string) => {
    setIsGenerating(true)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newReport = {
      id: Date.now().toString(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      description: `Generated ${type} report`,
      type,
      period: 'custom',
      generated_at: new Date().toISOString(),
      generated_by: 'Current User',
      status: 'completed',
      file_size: '1.2 MB',
      download_count: 0,
      metrics: {
        total_alerts: Math.floor(Math.random() * 50),
        critical_alerts: Math.floor(Math.random() * 10),
        resolved_alerts: Math.floor(Math.random() * 40),
        response_time: `${(Math.random() * 3 + 1).toFixed(1)} hours`
      }
    }

    setReports(prev => [newReport, ...prev])
    setIsGenerating(false)
  }

  const handleDownloadReport = (reportId: string) => {
    // TODO: Implement actual download
    console.log(`Downloading report ${reportId}`)
    
    // Update download count
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, download_count: report.download_count + 1 }
        : report
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return <FileText className="w-4 h-4" />
      case 'analysis': return <BarChart3 className="w-4 h-4" />
      case 'performance': return <TrendingUp className="w-4 h-4" />
      case 'compliance': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/scoring/risk-assessment">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Risk Assessment
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessment Reports</h1>
            <p className="text-gray-600 mt-2">
              Generate and manage risk assessment reports and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total_reports}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.reports_this_month} generated this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Downloaded</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{mockStats.most_downloaded}</div>
            <p className="text-xs text-muted-foreground">
              Most popular report type
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.avg_generation_time}</div>
            <p className="text-xs text-muted-foreground">
              Average time to generate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for download
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Create custom reports based on your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                placeholder="Select date range"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerateReport('summary')}
                disabled={isGenerating}
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Summary Report
              </Button>
              <Button
                onClick={() => handleGenerateReport('analysis')}
                disabled={isGenerating}
                variant="outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analysis Report
              </Button>
              <Button
                onClick={() => handleGenerateReport('performance')}
                disabled={isGenerating}
                variant="outline"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Report
              </Button>
            </div>
          </div>
          {isGenerating && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-800">Generating report...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600 text-center">
                No reports match your current filters. Try adjusting the filters or generate a new report.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(report.type)}
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {report.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {report.period}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{report.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {Object.entries(report.metrics).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <p className="text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Generated by {report.generated_by}</span>
                      <span>•</span>
                      <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.file_size}</span>
                      <span>•</span>
                      <span>{report.download_count} downloads</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
