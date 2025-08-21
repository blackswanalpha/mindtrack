'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Target,
  Calculator,
  BarChart3,
  Gauge,
  PieChart,
  TrendingUp,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { CreateScoringConfigData, ScoringMethod, VisualizationType, RiskLevel } from '@/types/scoring'

// Mock questionnaires for selection
const mockQuestionnaires = [
  { id: 1, title: 'GAD-7 - Generalized Anxiety Disorder', type: 'assessment' },
  { id: 2, title: 'PHQ-9 - Patient Health Questionnaire', type: 'assessment' },
  { id: 3, title: 'Custom Anxiety Assessment', type: 'custom' },
  { id: 4, title: 'Workplace Stress Evaluation', type: 'survey' },
  { id: 5, title: 'Depression Screening Tool', type: 'screening' }
]

const scoringMethods: { value: ScoringMethod; label: string; description: string; icon: any }[] = [
  {
    value: 'sum',
    label: 'Sum',
    description: 'Simple addition of all answer scores',
    icon: Calculator
  },
  {
    value: 'average',
    label: 'Average',
    description: 'Mean of all answer scores',
    icon: BarChart3
  },
  {
    value: 'weighted',
    label: 'Weighted',
    description: 'Weighted sum with question-specific weights',
    icon: Target
  },
  {
    value: 'custom',
    label: 'Custom Formula',
    description: 'Custom mathematical formula',
    icon: Activity
  }
]

const visualizationTypes: { value: VisualizationType; label: string; icon: any }[] = [
  { value: 'gauge', label: 'Gauge Chart', icon: Gauge },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'radar', label: 'Radar Chart', icon: Target },
  { value: 'heatmap', label: 'Heatmap', icon: Activity }
]

const riskLevels: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'none', label: 'No Risk', color: '#6B7280' },
  { value: 'low', label: 'Low Risk', color: '#10B981' },
  { value: 'medium', label: 'Medium Risk', color: '#F59E0B' },
  { value: 'high', label: 'High Risk', color: '#EF4444' },
  { value: 'critical', label: 'Critical Risk', color: '#DC2626' }
]

interface ScoringRule {
  min_score: number
  max_score: number
  risk_level: RiskLevel
  label: string
  description: string
  color: string
  actions: string[]
  order_num: number
}

export default function NewScoringConfigPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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

  const [currentRule, setCurrentRule] = useState<Partial<ScoringRule>>({
    min_score: 0,
    max_score: 5,
    risk_level: 'low',
    label: '',
    description: '',
    color: '#10B981',
    actions: [''],
    order_num: 1
  })

  const [weights, setWeights] = useState<Record<string, number>>({})
  const [customFormula, setCustomFormula] = useState('')
  const [formulaVariables, setFormulaVariables] = useState<Record<string, number>>({})

  const handleInputChange = (field: keyof CreateScoringConfigData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user makes changes
  }

  const handleAddRule = () => {
    if (!currentRule.label || currentRule.min_score === undefined || currentRule.max_score === undefined) {
      setErrors(['Please fill in all rule fields'])
      return
    }

    const newRule: ScoringRule = {
      min_score: currentRule.min_score!,
      max_score: currentRule.max_score!,
      risk_level: currentRule.risk_level!,
      label: currentRule.label!,
      description: currentRule.description || '',
      color: currentRule.color!,
      actions: currentRule.actions?.filter(action => action.trim()) || [],
      order_num: formData.rules.length + 1
    }

    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }))

    // Reset current rule
    setCurrentRule({
      min_score: formData.rules.length > 0 ? Math.max(...formData.rules.map(r => r.max_score)) + 1 : 0,
      max_score: formData.max_score,
      risk_level: 'low',
      label: '',
      description: '',
      color: '#10B981',
      actions: [''],
      order_num: formData.rules.length + 2
    })
  }

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }))
  }

  const handleRuleActionChange = (index: number, value: string) => {
    const newActions = [...(currentRule.actions || [])]
    newActions[index] = value
    setCurrentRule(prev => ({ ...prev, actions: newActions }))
  }

  const handleAddRuleAction = () => {
    setCurrentRule(prev => ({
      ...prev,
      actions: [...(prev.actions || []), '']
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.name.trim()) newErrors.push('Configuration name is required')
    if (!formData.questionnaire_id) newErrors.push('Please select a questionnaire')
    if (formData.max_score <= formData.min_score) newErrors.push('Maximum score must be greater than minimum score')
    if (formData.rules.length === 0) newErrors.push('At least one scoring rule is required')
    
    // Check for gaps in rule coverage
    const sortedRules = [...formData.rules].sort((a, b) => a.min_score - b.min_score)
    let expectedMin = formData.min_score
    
    for (const rule of sortedRules) {
      if (rule.min_score !== expectedMin) {
        newErrors.push(`Gap in score coverage at ${expectedMin}`)
        break
      }
      expectedMin = rule.max_score + 1
    }
    
    if (expectedMin <= formData.max_score) {
      newErrors.push(`Incomplete score coverage from ${expectedMin} to ${formData.max_score}`)
    }

    if (formData.scoring_method === 'custom' && !customFormula.trim()) {
      newErrors.push('Custom formula is required for custom scoring method')
    }

    if (formData.scoring_method === 'weighted' && Object.keys(weights).length === 0) {
      newErrors.push('Weights are required for weighted scoring method')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const configData: CreateScoringConfigData = {
        ...formData,
        weights: formData.scoring_method === 'weighted' ? weights : undefined,
        formula: formData.scoring_method === 'custom' ? customFormula : undefined,
        formula_variables: formData.scoring_method === 'custom' ? formulaVariables : undefined
      }

      // TODO: Replace with actual API call
      console.log('Creating scoring configuration:', configData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to configurations list
      router.push('/scoring/configs')
    } catch (error) {
      setErrors(['Failed to create configuration. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/scoring/configs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Configurations
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">New Scoring Configuration</h1>
          <p className="text-gray-600 mt-2">
            Create a new scoring configuration for your questionnaire
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Creating...' : 'Create Configuration'}
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

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="method">Scoring Method</TabsTrigger>
          <TabsTrigger value="rules">Scoring Rules</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>
                Set up the basic properties of your scoring configuration
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
                    placeholder="e.g., GAD-7 Standard Scoring"
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
                    />
                    <Label htmlFor="is-default">Default Configuration</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Default configuration for this questionnaire
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Method */}
        <TabsContent value="method" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Method</CardTitle>
              <CardDescription>
                Choose how scores will be calculated from questionnaire responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scoringMethods.map((method) => (
                  <div
                    key={method.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.scoring_method === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('scoring_method', method.value)}
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{method.label}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Method-specific settings */}
              {formData.scoring_method === 'weighted' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question Weights</CardTitle>
                    <CardDescription>
                      Assign weights to questions (higher weight = more important)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((questionNum) => (
                        <div key={questionNum} className="flex items-center gap-4">
                          <Label className="w-24">Question {questionNum}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="1.0"
                            className="w-24"
                            value={weights[`question_${questionNum}`] || ''}
                            onChange={(e) => setWeights(prev => ({
                              ...prev,
                              [`question_${questionNum}`]: parseFloat(e.target.value) || 1
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {formData.scoring_method === 'custom' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Formula</CardTitle>
                    <CardDescription>
                      Define a custom mathematical formula for score calculation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="formula">Formula</Label>
                      <Input
                        id="formula"
                        placeholder="e.g., total * 2 + average"
                        value={customFormula}
                        onChange={(e) => setCustomFormula(e.target.value)}
                      />
                      <p className="text-sm text-gray-600">
                        Available variables: total, count, average, q_1, q_2, etc.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Formula Variables</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="w-20">multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="1.0"
                            value={formulaVariables.multiplier || ''}
                            onChange={(e) => setFormulaVariables(prev => ({
                              ...prev,
                              multiplier: parseFloat(e.target.value) || 1
                            }))}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="w-20">bonus</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            value={formulaVariables.bonus || ''}
                            onChange={(e) => setFormulaVariables(prev => ({
                              ...prev,
                              bonus: parseFloat(e.target.value) || 0
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Rules */}
        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Rule */}
            <Card>
              <CardHeader>
                <CardTitle>Add Scoring Rule</CardTitle>
                <CardDescription>
                  Define risk levels and score ranges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-min">Min Score</Label>
                    <Input
                      id="rule-min"
                      type="number"
                      value={currentRule.min_score || 0}
                      onChange={(e) => setCurrentRule(prev => ({
                        ...prev,
                        min_score: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-max">Max Score</Label>
                    <Input
                      id="rule-max"
                      type="number"
                      value={currentRule.max_score || 0}
                      onChange={(e) => setCurrentRule(prev => ({
                        ...prev,
                        max_score: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-risk">Risk Level</Label>
                  <Select
                    value={currentRule.risk_level}
                    onValueChange={(value: RiskLevel) => {
                      const riskLevel = riskLevels.find(r => r.value === value)
                      setCurrentRule(prev => ({
                        ...prev,
                        risk_level: value,
                        color: riskLevel?.color || '#6B7280'
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: level.color }}
                            />
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-label">Label</Label>
                  <Input
                    id="rule-label"
                    placeholder="e.g., Minimal Anxiety"
                    value={currentRule.label || ''}
                    onChange={(e) => setCurrentRule(prev => ({
                      ...prev,
                      label: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea
                    id="rule-description"
                    placeholder="Optional description"
                    value={currentRule.description || ''}
                    onChange={(e) => setCurrentRule(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recommended Actions</Label>
                  {(currentRule.actions || ['']).map((action, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., No intervention needed"
                        value={action}
                        onChange={(e) => handleRuleActionChange(index, e.target.value)}
                      />
                      {index === (currentRule.actions?.length || 1) - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddRuleAction}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button onClick={handleAddRule} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </CardContent>
            </Card>

            {/* Existing Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Current Rules ({formData.rules.length})</CardTitle>
                <CardDescription>
                  Rules must cover the complete score range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.rules.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No rules added yet. Add your first rule to get started.
                    </p>
                  ) : (
                    formData.rules.map((rule, index) => (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRule(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visualization */}
        <TabsContent value="visualization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualization Settings</CardTitle>
              <CardDescription>
                Choose how scores will be displayed to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Visualization Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {visualizationTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.visualization_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('visualization_type', type.value)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <type.icon className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>
                    Preview of how scores will be displayed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {visualizationTypes.find(t => t.value === formData.visualization_type)?.icon && (
                          <div className="text-blue-600">
                            {React.createElement(
                              visualizationTypes.find(t => t.value === formData.visualization_type)!.icon,
                              { className: "w-8 h-8" }
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {visualizationTypes.find(t => t.value === formData.visualization_type)?.label} Preview
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Score: 15/{formData.max_score} (71.4%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
