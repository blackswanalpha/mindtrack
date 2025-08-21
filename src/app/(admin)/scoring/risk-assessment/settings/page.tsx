'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Save,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  TestTube
} from 'lucide-react'
import Link from 'next/link'
import { RiskLevel } from '@/types/scoring'

// Mock notification settings
const mockNotificationSettings = {
  email_enabled: true,
  sms_enabled: false,
  push_enabled: true,
  webhook_enabled: false,
  webhook_url: '',
  email_recipients: ['admin@mindtrack.com', 'alerts@mindtrack.com'],
  sms_recipients: ['+1234567890'],
  response_time_threshold: 4, // hours
  escalation_enabled: true,
  escalation_delay: 24, // hours
  business_hours_only: false,
  risk_levels: {
    critical: { enabled: true, immediate: true },
    high: { enabled: true, immediate: false },
    medium: { enabled: false, immediate: false },
    low: { enabled: false, immediate: false }
  }
}

// Mock alert templates
const mockAlertTemplates = [
  {
    id: '1',
    name: 'Critical Risk Alert',
    risk_level: 'critical' as RiskLevel,
    subject: 'URGENT: Critical Risk Alert - {{patient_name}}',
    message: 'Patient {{patient_name}} (ID: {{patient_id}}) has scored {{score}}/{{max_score}} on {{questionnaire}}, indicating {{risk_level}} risk. Immediate attention required.',
    channels: ['email', 'sms', 'push']
  },
  {
    id: '2',
    name: 'High Risk Alert',
    risk_level: 'high' as RiskLevel,
    subject: 'High Risk Alert - {{patient_name}}',
    message: 'Patient {{patient_name}} has been flagged for high risk based on recent assessment. Please review and take appropriate action.',
    channels: ['email', 'push']
  }
]

// Mock team members
const mockTeamMembers = [
  { id: '1', name: 'Dr. Smith', email: 'dr.smith@mindtrack.com', phone: '+1234567891', role: 'Psychiatrist' },
  { id: '2', name: 'Dr. Johnson', email: 'dr.johnson@mindtrack.com', phone: '+1234567892', role: 'Psychologist' },
  { id: '3', name: 'Dr. Brown', email: 'dr.brown@mindtrack.com', phone: '+1234567893', role: 'Therapist' }
]

export default function RiskAssessmentSettingsPage() {
  const [settings, setSettings] = useState(mockNotificationSettings)
  const [templates, setTemplates] = useState(mockAlertTemplates)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newRecipient, setNewRecipient] = useState('')
  const [recipientType, setRecipientType] = useState<'email' | 'sms'>('email')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleRiskLevelChange = (riskLevel: RiskLevel, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      risk_levels: {
        ...prev.risk_levels,
        [riskLevel]: {
          ...prev.risk_levels[riskLevel],
          [setting]: value
        }
      }
    }))
  }

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return

    const key = recipientType === 'email' ? 'email_recipients' : 'sms_recipients'
    setSettings(prev => ({
      ...prev,
      [key]: [...prev[key], newRecipient]
    }))
    setNewRecipient('')
  }

  const handleRemoveRecipient = (type: 'email' | 'sms', index: number) => {
    const key = type === 'email' ? 'email_recipients' : 'sms_recipients'
    setSettings(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // TODO: Replace with actual API call
    console.log('Saving settings:', settings)
    
    setIsSaving(false)
  }

  const handleTestNotification = async (type: string) => {
    // TODO: Implement test notification
    console.log(`Testing ${type} notification`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
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
            <h1 className="text-3xl font-bold text-gray-900">Alert Settings</h1>
            <p className="text-gray-600 mt-2">
              Configure notifications and alerts for high-risk patients
            </p>
          </div>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Alert Templates</TabsTrigger>
          <TabsTrigger value="team">Team Settings</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Rules</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>
                Configure which notification methods to use for alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Send alerts via email</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.email_enabled}
                        onCheckedChange={(checked) => handleSettingChange('email_enabled', checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('email')}
                        disabled={!settings.email_enabled}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Send alerts via SMS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.sms_enabled}
                        onCheckedChange={(checked) => handleSettingChange('sms_enabled', checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('sms')}
                        disabled={!settings.sms_enabled}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-600">Browser push notifications</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.push_enabled}
                        onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('push')}
                        disabled={!settings.push_enabled}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Webhook</p>
                        <p className="text-sm text-gray-600">Send to external system</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.webhook_enabled}
                        onCheckedChange={(checked) => handleSettingChange('webhook_enabled', checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('webhook')}
                        disabled={!settings.webhook_enabled}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {settings.webhook_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-system.com/webhook"
                    value={settings.webhook_url}
                    onChange={(e) => handleSettingChange('webhook_url', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Level Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Notifications</CardTitle>
              <CardDescription>
                Configure which risk levels trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.risk_levels).map(([level, config]) => (
                  <div key={level} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        level === 'critical' ? 'bg-red-600' :
                        level === 'high' ? 'bg-orange-600' :
                        level === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      }`} />
                      <div>
                        <p className="font-medium capitalize">{level} Risk</p>
                        <p className="text-sm text-gray-600">
                          {level === 'critical' ? 'Requires immediate attention' :
                           level === 'high' ? 'Requires prompt attention' :
                           level === 'medium' ? 'Monitor closely' : 'Standard monitoring'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => handleRiskLevelChange(level as RiskLevel, 'enabled', checked)}
                        />
                        <Label className="text-sm">Enable</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.immediate}
                          onCheckedChange={(checked) => handleRiskLevelChange(level as RiskLevel, 'immediate', checked)}
                          disabled={!config.enabled}
                        />
                        <Label className="text-sm">Immediate</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Recipients</CardTitle>
              <CardDescription>
                Manage who receives alert notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Recipient */}
              <div className="flex gap-2">
                <Select value={recipientType} onValueChange={(value: 'email' | 'sms') => setRecipientType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={recipientType === 'email' ? 'email@example.com' : '+1234567890'}
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddRecipient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Email Recipients */}
              <div className="space-y-3">
                <Label>Email Recipients</Label>
                <div className="space-y-2">
                  {settings.email_recipients.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient('email', index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Recipients */}
              <div className="space-y-3">
                <Label>SMS Recipients</Label>
                <div className="space-y-2">
                  {settings.sms_recipients.map((phone, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{phone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient('sms', index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Message Templates</CardTitle>
              <CardDescription>
                Customize notification messages for different risk levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {template.risk_level}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {template.channels.map((channel) => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Subject</Label>
                        <Input value={template.subject} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm">Message</Label>
                        <Textarea value={template.message} readOnly rows={3} className="mt-1" />
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Available variables: {{patient_name}}, {{patient_id}}, {{score}}, {{max_score}}, {{questionnaire}}, {{risk_level}}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage team members who can receive and handle alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>{member.email}</span>
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Active</Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalation Rules Tab */}
        <TabsContent value="escalation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Escalation Rules
              </CardTitle>
              <CardDescription>
                Configure automatic escalation for unhandled alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Escalation</p>
                  <p className="text-sm text-gray-600">Automatically escalate unhandled alerts</p>
                </div>
                <Switch
                  checked={settings.escalation_enabled}
                  onCheckedChange={(checked) => handleSettingChange('escalation_enabled', checked)}
                />
              </div>

              {settings.escalation_enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="response-threshold">Response Time Threshold (hours)</Label>
                      <Input
                        id="response-threshold"
                        type="number"
                        value={settings.response_time_threshold}
                        onChange={(e) => handleSettingChange('response_time_threshold', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="escalation-delay">Escalation Delay (hours)</Label>
                      <Input
                        id="escalation-delay"
                        type="number"
                        value={settings.escalation_delay}
                        onChange={(e) => handleSettingChange('escalation_delay', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Business Hours Only</p>
                      <p className="text-sm text-gray-600">Only escalate during business hours</p>
                    </div>
                    <Switch
                      checked={settings.business_hours_only}
                      onCheckedChange={(checked) => handleSettingChange('business_hours_only', checked)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


