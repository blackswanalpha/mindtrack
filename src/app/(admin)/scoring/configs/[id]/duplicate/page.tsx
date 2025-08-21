'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Copy,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { EnhancedScoringConfig, CreateScoringConfigData } from '@/types/scoring'

// Mock original configuration
const mockOriginalConfig: EnhancedScoringConfig = {
  id: 'gad7_standard',
  questionnaire_id: 1,
  name: 'GAD-7 Standard Scoring',
  description: 'Standard scoring configuration for GAD-7 questionnaire based on clinical guidelines',
  scoring_method: 'sum',
  weights: undefined,
  formula: undefined,
  formula_variables: undefined,
  max_score: 21,
  min_score: 0,
  passing_score: undefined,
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

// Mock questionnaires for selection
const mockQuestionnaires = [
  { id: 1, title: 'GAD-7 - Generalized Anxiety Disorder', type: 'assessment' },
  { id: 2, title: 'PHQ-9 - Patient Health Questionnaire', type: 'assessment' },
  { id: 3, title: 'Custom Anxiety Assessment', type: 'custom' },
  { id: 4, title: 'Workplace Stress Evaluation', type: 'survey' },
  { id: 5, title: 'Depression Screening Tool', type: 'screening' }
]

export default function DuplicateConfigPage() {
  const params = useParams()
  const router = useRouter()
  const [originalConfig, setOriginalConfig] = useState<EnhancedScoringConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  const [formData, setFormData] = useState<CreateScoringConfigData>({
    questionnaire_id: 0,
    name: '',
    description: '',
    scoring_method: 'sum',
    max_score: 21,
    min_score: 0,
    visualization_type: 'gauge',
    is_active: true,
    is_default: false,
    rules: []
  })

  useEffect(() => {
    // Simulate loading original configuration
    const timer = setTimeout(() => {
      setOriginalConfig(mockOriginalConfig)
      
      // Pre-populate form with original config data
      setFormData({
        questionnaire_id: mockOriginalConfig.questionnaire_id,
        name: `${mockOriginalConfig.name} (Copy)`,
        description: mockOriginalConfig.description ? `Copy of: ${mockOriginalConfig.description}` : '',
        scoring_method: mockOriginalConfig.scoring_method,
        weights: mockOriginalConfig.weights,
        formula: mockOriginalConfig.formula,
        formula_variables: mockOriginalConfig.formula_variables,
        max_score: mockOriginalConfig.max_score,
        min_score: mockOriginalConfig.min_score,
        passing_score: mockOriginalConfig.passing_score,
        visualization_type: mockOriginalConfig.visualization_type,
        visualization_config: mockOriginalConfig.visualization_config,
        is_active: false, // Default to inactive for duplicates
        is_default: false, // Never default for duplicates
        rules: mockOriginalConfig.rules.map(rule => ({
          min_score: rule.min_score,
          max_score: rule.max_score,
          risk_level: rule.risk_level,
          label: rule.label,
          description: rule.description,
          color: rule.color,
          actions: [...rule.actions],
          order_num: rule.order_num
        }))
      })
      
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [params.id])

  const handleInputChange = (field: keyof CreateScoringConfigData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user makes changes
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.name.trim()) newErrors.push('Configuration name is required')
    if (!formData.questionnaire_id) newErrors.push('Please select a questionnaire')
    if (formData.max_score <= formData.min_score) newErrors.push('Maximum score must be greater than minimum score')
    if (formData.rules.length === 0) newErrors.push('At least one scoring rule is required')

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleDuplicate = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    
    try {
      // TODO: Replace with actual API call
      console.log('Duplicating scoring configuration:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to the new configuration (simulate new ID)
      const newConfigId = `${originalConfig?.id}_copy_${Date.now()}`
      router.push(`/scoring/configs/${newConfigId}`)
    } catch (error) {
      setErrors(['Failed to duplicate configuration. Please try again.'])
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!originalConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Not Found</h3>
            <p className="text-gray-600 text-center mb-4">
              The configuration you're trying to duplicate doesn't exist or has been deleted.
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
            <Link href={`/scoring/configs/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configuration
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Duplicate Configuration</h1>
            <p className="text-gray-600 mt-2">
              Create a copy of "{originalConfig.name}"
            </p>
          </div>
        </div>
        <Button onClick={handleDuplicate} disabled={isSaving}>
          <Copy className="w-4 h-4 mr-2" />
          {isSaving ? 'Duplicating...' : 'Create Duplicate'}
        </Button>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>
                Modify the basic properties for the duplicated configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionnaire">Questionnaire</Label>
                  <Select 
                    value={formData.questionnaire_id.toString()} 
                    onValueChange={(value) => handleInputChange('questionnaire_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockQuestionnaires.map((q) => (
                        <SelectItem key={q.id} value={q.id.toString()}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., GAD-7 Modified Scoring"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this scoring configuration"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-score">Minimum Score</Label>
                  <Input
                    id="min-score"
                    type="number"
                    value={formData.min_score}
                    onChange={(e) => handleInputChange('min_score', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-score">Maximum Score</Label>
                  <Input
                    id="max-score"
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => handleInputChange('max_score', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing-score">Passing Score (Optional)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    placeholder="Optional"
                    value={formData.passing_score || ''}
                    onChange={(e) => handleInputChange('passing_score', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is-active">Active Configuration</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Active configurations can be used for scoring
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                      disabled={true} // Duplicates cannot be default initially
                    />
                    <Label htmlFor="is-default" className="text-gray-400">Default Configuration</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Duplicated configurations cannot be set as default initially
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Rules Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring Rules ({formData.rules.length})</CardTitle>
              <CardDescription>
                The following rules will be copied from the original configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
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
                          <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        )}
                        {rule.actions.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Actions: {rule.actions.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Original Configuration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <Label className="text-gray-500">Name</Label>
                <p className="font-medium">{originalConfig.name}</p>
              </div>
              
              <div className="text-sm">
                <Label className="text-gray-500">Method</Label>
                <p className="capitalize">{originalConfig.scoring_method}</p>
              </div>
              
              <div className="text-sm">
                <Label className="text-gray-500">Score Range</Label>
                <p>{originalConfig.min_score} - {originalConfig.max_score}</p>
              </div>
              
              <div className="text-sm">
                <Label className="text-gray-500">Status</Label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={originalConfig.is_active ? "default" : "secondary"} className="text-xs">
                    {originalConfig.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {originalConfig.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duplication Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>All scoring rules and thresholds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Risk level configurations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Visualization settings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Scoring method and formulas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Question weights (if applicable)</span>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-yellow-700">
              <p>• The duplicate will be created as inactive by default</p>
              <p>• You can modify all settings after creation</p>
              <p>• The duplicate will not be set as default initially</p>
              <p>• All usage statistics will start fresh</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


