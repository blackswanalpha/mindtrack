'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Edit,
  Save,
  Star,
  StarOff,
  Settings,
  BarChart3,
  AlertTriangle,
  Copy,
  Trash2,
  Play,
  Pause
} from 'lucide-react'
import Link from 'next/link'
import { ScoreVisualization } from '@/components/scoring/score-visualization'
import { EnhancedScoringConfig, VisualizationData } from '@/types/scoring'

// Mock configuration data
const mockConfiguration: EnhancedScoringConfig = {
  id: 'gad7_standard',
  questionnaire_id: 1,
  name: 'GAD-7 Standard Scoring',
  description: 'Standard scoring configuration for GAD-7 questionnaire based on clinical guidelines',
  scoring_method: 'sum',
  max_score: 21,
  min_score: 0,
  visualization_type: 'gauge',
  visualization_config: {},
  is_active: true,
  is_default: true,
  rules: [
    {
      id: 'rule-1',
      config_id: 'gad7_standard',
      min_score: 0,
      max_score: 4,
      risk_level: 'low',
      label: 'Minimal Anxiety',
      description: 'Minimal anxiety symptoms that do not significantly impact daily functioning',
      color: '#10B981',
      actions: ['No clinical intervention needed', 'Continue monitoring', 'Lifestyle recommendations'],
      order_num: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'rule-2',
      config_id: 'gad7_standard',
      min_score: 5,
      max_score: 9,
      risk_level: 'medium',
      label: 'Mild Anxiety',
      description: 'Mild anxiety symptoms that may benefit from intervention',
      color: '#F59E0B',
      actions: ['Consider counseling', 'Lifestyle modifications', 'Follow-up in 2-4 weeks'],
      order_num: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'rule-3',
      config_id: 'gad7_standard',
      min_score: 10,
      max_score: 14,
      risk_level: 'high',
      label: 'Moderate Anxiety',
      description: 'Moderate anxiety symptoms requiring clinical attention',
      color: '#EF4444',
      actions: ['Recommend therapy', 'Consider medication evaluation', 'Weekly follow-up'],
      order_num: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'rule-4',
      config_id: 'gad7_standard',
      min_score: 15,
      max_score: 21,
      risk_level: 'critical',
      label: 'Severe Anxiety',
      description: 'Severe anxiety symptoms requiring immediate clinical attention',
      color: '#DC2626',
      actions: ['Immediate clinical attention', 'Comprehensive treatment plan', 'Daily monitoring'],
      order_num: 4,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  created_by_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}

// Mock usage statistics
const mockStats = {
  total_scores: 156,
  average_score: 8.4,
  last_used: '2024-01-20T14:30:00Z',
  risk_distribution: {
    low: 45,
    medium: 67,
    high: 32,
    critical: 12
  }
}

// Mock sample visualization data
const mockVisualizationData: VisualizationData = {
  score: 12,
  max_score: 21,
  min_score: 0,
  risk_level: 'high',
  label: 'Moderate Anxiety',
  visualization_type: 'gauge',
  percentage: 57.1,
  zones: [
    { min: 0, max: 19.0, color: '#10B981', label: 'Minimal Anxiety', risk_level: 'low' },
    { min: 19.1, max: 42.9, color: '#F59E0B', label: 'Mild Anxiety', risk_level: 'medium' },
    { min: 43.0, max: 66.7, color: '#EF4444', label: 'Moderate Anxiety', risk_level: 'high' },
    { min: 66.8, max: 100, color: '#DC2626', label: 'Severe Anxiety', risk_level: 'critical' }
  ]
}

export default function ScoringConfigPage() {
  const params = useParams()
  const router = useRouter()
  const [config, setConfig] = useState<EnhancedScoringConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Simulate loading configuration
    const timer = setTimeout(() => {
      setConfig(mockConfiguration)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [params.id])

  const handleToggleDefault = async () => {
    if (!config) return
    
    setConfig(prev => prev ? { ...prev, is_default: !prev.is_default } : null)
    // TODO: API call to update default status
  }

  const handleToggleActive = async () => {
    if (!config) return
    
    setConfig(prev => prev ? { ...prev, is_active: !prev.is_active } : null)
    // TODO: API call to update active status
  }

  const handleDuplicate = () => {
    router.push(`/scoring/configs/${params.id}/duplicate`)
  }

  const handleDelete = async () => {
    if (!config || config.is_default) return
    
    if (confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      // TODO: API call to delete configuration
      router.push('/scoring/configs')
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

  if (!config) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Not Found</h3>
            <p className="text-gray-600 text-center mb-4">
              The scoring configuration you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/scoring/configs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Configurations
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
            <Link href="/scoring/configs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configurations
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{config.name}</h1>
              {config.is_default && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
              <Badge 
                variant={config.is_active ? "default" : "secondary"}
                className="text-xs"
              >
                {config.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-gray-600 mt-2">{config.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleDefault}>
            {config.is_default ? (
              <>
                <StarOff className="w-4 h-4 mr-2" />
                Remove Default
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Set as Default
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={handleToggleActive}>
            {config.is_active ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={config.is_default}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          
          <Button asChild>
            <Link href={`/scoring/configs/${config.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Scoring Rules</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Configuration Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Questionnaire</Label>
                        <p className="text-sm">Generalized Anxiety Disorder Assessment</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Scoring Method</Label>
                        <p className="text-sm capitalize">{config.scoring_method}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Score Range</Label>
                        <p className="text-sm">{config.min_score} - {config.max_score}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Visualization</Label>
                        <p className="text-sm capitalize">{config.visualization_type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Created</Label>
                        <p className="text-sm">{new Date(config.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                        <p className="text-sm">{new Date(config.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Visualization */}
              <ScoreVisualization
                data={mockVisualizationData}
                title="Sample Score Visualization"
                description="Preview of how scores will be displayed to users"
              />
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scoring Rules ({config.rules.length})</CardTitle>
                  <CardDescription>
                    Risk levels and score ranges for this configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {config.rules.map((rule) => (
                      <div key={rule.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: rule.color }}
                              />
                              <span className="font-medium">{rule.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {rule.min_score}-{rule.max_score}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {rule.risk_level}
                              </Badge>
                            </div>
                            {rule.description && (
                              <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                            )}
                            {rule.actions.length > 0 && (
                              <div>
                                <Label className="text-xs font-medium text-gray-500">Recommended Actions:</Label>
                                <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                                  {rule.actions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Scores</span>
                        <span className="font-medium">{mockStats.total_scores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Score</span>
                        <span className="font-medium">{mockStats.average_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Used</span>
                        <span className="font-medium">
                          {new Date(mockStats.last_used).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(mockStats.risk_distribution).map(([level, count]) => {
                        const rule = config.rules.find(r => r.risk_level === level)
                        const percentage = Math.round((count / mockStats.total_scores) * 100)
                        
                        return (
                          <div key={level} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: rule?.color || '#6B7280' }}
                              />
                              <span className="text-sm capitalize">{level}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{count}</span>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/scoring/configs/${config.id}/analytics`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/scoring/configs/${config.id}/test`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Test Configuration
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Export Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Configuration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <Label className="text-gray-500">ID</Label>
                <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">{config.id}</p>
              </div>
              
              <div className="text-sm">
                <Label className="text-gray-500">Rules Coverage</Label>
                <p className="mt-1">
                  {config.min_score} - {config.max_score} (Complete)
                </p>
              </div>
              
              <div className="text-sm">
                <Label className="text-gray-500">Status</Label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={config.is_active ? "default" : "secondary"} className="text-xs">
                    {config.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {config.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: any) {
  return <label className={`text-sm font-medium ${className || ''}`} {...props}>{children}</label>
}
