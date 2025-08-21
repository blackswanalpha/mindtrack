'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Save,
  UserCheck,
  Activity,
  TrendingUp,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { ScoreVisualization } from '@/components/scoring/score-visualization'
import { RiskLevel, VisualizationData } from '@/types/scoring'

// Mock detailed alert data
const mockAlertDetail = {
  id: '1',
  patient_id: 'P001',
  patient_name: 'Sarah Johnson',
  patient_email: 'sarah.johnson@email.com',
  patient_phone: '+1 (555) 123-4567',
  age: 28,
  gender: 'Female',
  questionnaire: 'GAD-7',
  questionnaire_title: 'Generalized Anxiety Disorder Assessment',
  score: 19,
  risk_level: 'critical' as RiskLevel,
  risk_label: 'Severe Anxiety',
  timestamp: '2024-01-20T14:30:00Z',
  status: 'new',
  assigned_to: null,
  created_by: 'System Alert',
  priority: 'urgent',
  visualization_data: {
    score: 19,
    max_score: 21,
    min_score: 0,
    percentage: 90.5,
    risk_level: 'critical' as RiskLevel,
    label: 'Severe Anxiety',
    visualization_type: 'gauge' as const,
    zones: [
      { min: 0, max: 19.0, color: '#10B981', label: 'Minimal Anxiety', risk_level: 'low' as RiskLevel },
      { min: 19.1, max: 42.9, color: '#F59E0B', label: 'Mild Anxiety', risk_level: 'medium' as RiskLevel },
      { min: 43.0, max: 66.7, color: '#EF4444', label: 'Moderate Anxiety', risk_level: 'high' as RiskLevel },
      { min: 66.8, max: 100, color: '#DC2626', label: 'Severe Anxiety', risk_level: 'critical' as RiskLevel }
    ]
  },
  recommended_actions: [
    'Immediate clinical attention required',
    'Consider emergency psychiatric evaluation',
    'Implement safety planning',
    'Schedule follow-up within 24 hours',
    'Contact emergency contact if necessary'
  ],
  assessment_responses: [
    { question: 'Feeling nervous, anxious, or on edge', answer: 'Nearly every day', score: 3 },
    { question: 'Not being able to stop or control worrying', answer: 'Nearly every day', score: 3 },
    { question: 'Worrying too much about different things', answer: 'More than half the days', score: 2 },
    { question: 'Trouble relaxing', answer: 'Nearly every day', score: 3 },
    { question: 'Being so restless that it is hard to sit still', answer: 'Nearly every day', score: 3 },
    { question: 'Becoming easily annoyed or irritable', answer: 'More than half the days', score: 2 },
    { question: 'Feeling afraid, as if something awful might happen', answer: 'Nearly every day', score: 3 }
  ]
}

// Mock notes data
const mockNotes = [
  {
    id: '1',
    author: 'Dr. Smith',
    timestamp: '2024-01-20T15:30:00Z',
    content: 'Patient contacted via phone. Expressed willingness to schedule emergency appointment. Safety plan discussed.',
    type: 'contact'
  },
  {
    id: '2',
    author: 'System',
    timestamp: '2024-01-20T14:30:00Z',
    content: 'High-risk alert generated based on GAD-7 assessment score of 19/21.',
    type: 'system'
  }
]

// Mock team members
const mockTeamMembers = [
  { id: '1', name: 'Dr. Smith', role: 'Psychiatrist' },
  { id: '2', name: 'Dr. Johnson', role: 'Psychologist' },
  { id: '3', name: 'Dr. Brown', role: 'Therapist' },
  { id: '4', name: 'Dr. Wilson', role: 'Counselor' }
]

export default function RiskAlertDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [alert, setAlert] = useState(mockAlertDetail)
  const [notes, setNotes] = useState(mockNotes)
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [params.id])

  const handleStatusChange = (newStatus: string) => {
    setAlert(prev => ({ ...prev, status: newStatus }))
    // TODO: API call to update status
  }

  const handleAssignAlert = (assignee: string) => {
    setAlert(prev => ({ ...prev, assigned_to: assignee, status: 'in_progress' }))
    // TODO: API call to assign alert
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSavingNote(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const note = {
      id: Date.now().toString(),
      author: 'Current User', // TODO: Get from auth context
      timestamp: new Date().toISOString(),
      content: newNote,
      type: 'note' as const
    }

    setNotes(prev => [note, ...prev])
    setNewNote('')
    setIsSavingNote(false)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{alert.patient_name}</h1>
              <Badge variant="outline" className="text-xs">
                {alert.patient_id}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(alert.status)}`}>
                {alert.status.replace('_', ' ')}
              </Badge>
              <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                {alert.priority}
              </Badge>
            </div>
            <p className="text-gray-600 mt-2">
              {alert.questionnaire_title} - Critical Risk Alert
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Call Patient
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          {alert.status !== 'resolved' && (
            <Button 
              size="sm"
              onClick={() => handleStatusChange('resolved')}
            >
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment">Assessment Details</TabsTrigger>
              <TabsTrigger value="history">Patient History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Risk Assessment */}
              <ScoreVisualization
                data={alert.visualization_data}
                title="Risk Assessment Result"
                description={`${alert.questionnaire} assessment completed on ${new Date(alert.timestamp).toLocaleDateString()}`}
              />

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Recommended Actions
                  </CardTitle>
                  <CardDescription>
                    Immediate actions recommended based on risk level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {alert.recommended_actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Responses</CardTitle>
                  <CardDescription>
                    Detailed responses from {alert.questionnaire} assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alert.assessment_responses.map((response, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-2">{response.question}</p>
                            <p className="text-sm text-gray-600">{response.answer}</p>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            {response.score} pts
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Score:</span>
                      <Badge className="bg-red-100 text-red-800">
                        {alert.score} / {alert.visualization_data.max_score}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient History</CardTitle>
                  <CardDescription>
                    Previous assessments and risk alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Patient history will be displayed here</p>
                    <p className="text-sm">Previous assessments, alerts, and interventions</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Case Notes ({notes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Note */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a note about this case..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || isSavingNote}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingNote ? 'Saving...' : 'Add Note'}
                </Button>
              </div>

              {/* Existing Notes */}
              <div className="space-y-3 pt-4 border-t">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{note.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {note.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{alert.patient_name}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Patient ID</p>
                <p className="font-medium">{alert.patient_id}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Age</p>
                <p className="font-medium">{alert.age} years</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Gender</p>
                <p className="font-medium">{alert.gender}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-blue-600">{alert.patient_email}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{alert.patient_phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Alert Details */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-500">Risk Level</p>
                <Badge className={`${getRiskColor(alert.risk_level)} capitalize`}>
                  {alert.risk_level}
                </Badge>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Created By</p>
                <p className="font-medium">{alert.created_by}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Assigned To</p>
                <p className="font-medium">{alert.assigned_to || 'Unassigned'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          {alert.status !== 'resolved' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select onValueChange={handleAssignAlert} value={alert.assigned_to || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleStatusChange} value={alert.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Call Patient
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
