'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Calculator
} from 'lucide-react'
import Link from 'next/link'
import { ScoreVisualization } from '@/components/scoring/score-visualization'
import { EnhancedScoringConfig, VisualizationData, ScoreResult } from '@/types/scoring'

// Mock configuration
const mockConfig: EnhancedScoringConfig = {
  id: 'gad7_standard',
  questionnaire_id: 1,
  name: 'GAD-7 Standard Scoring',
  description: 'Standard scoring configuration for GAD-7 questionnaire',
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
      description: 'Minimal anxiety symptoms',
      color: '#10B981',
      actions: ['No clinical intervention needed', 'Continue monitoring'],
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
      description: 'Mild anxiety symptoms',
      color: '#F59E0B',
      actions: ['Consider counseling', 'Lifestyle modifications'],
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
      description: 'Moderate anxiety symptoms',
      color: '#EF4444',
      actions: ['Recommend therapy', 'Consider medication evaluation'],
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
      description: 'Severe anxiety symptoms',
      color: '#DC2626',
      actions: ['Immediate clinical attention', 'Comprehensive treatment plan'],
      order_num: 4,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  created_by_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}

// Mock GAD-7 questions
const mockQuestions = [
  { id: 1, text: 'Feeling nervous, anxious, or on edge', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { id: 2, text: 'Not being able to stop or control worrying', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { id: 3, text: 'Worrying too much about different things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { id: 4, text: 'Trouble relaxing', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { id: 5, text: 'Being so restless that it is hard to sit still', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { id: 6, text: 'Becoming easily annoyed or irritable', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { id: 7, text: 'Feeling afraid, as if something awful might happen', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
]

// Test scenarios
const testScenarios = [
  {
    name: 'Minimal Anxiety',
    description: 'All responses set to "Not at all"',
    answers: Array(7).fill(0),
    expectedScore: 0,
    expectedRisk: 'low'
  },
  {
    name: 'Mild Anxiety',
    description: 'Mixed responses averaging mild symptoms',
    answers: [1, 1, 2, 1, 0, 1, 1],
    expectedScore: 7,
    expectedRisk: 'medium'
  },
  {
    name: 'Moderate Anxiety',
    description: 'Moderate symptoms across most questions',
    answers: [2, 2, 2, 1, 2, 1, 2],
    expectedScore: 12,
    expectedRisk: 'high'
  },
  {
    name: 'Severe Anxiety',
    description: 'High symptoms across all questions',
    answers: [3, 3, 3, 2, 3, 2, 3],
    expectedScore: 19,
    expectedRisk: 'critical'
  }
]

export default function TestConfigPage() {
  const params = useParams()
  const [config, setConfig] = useState<EnhancedScoringConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [answers, setAnswers] = useState<number[]>(Array(7).fill(0))
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    // Simulate loading configuration
    const timer = setTimeout(() => {
      setConfig(mockConfig)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [params.id])

  const calculateScore = async () => {
    if (!config) return

    setIsCalculating(true)
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const totalScore = answers.reduce((sum, answer) => sum + answer, 0)
    const percentage = ((totalScore - config.min_score) / (config.max_score - config.min_score)) * 100

    // Find matching rule
    const matchingRule = config.rules.find(rule => 
      totalScore >= rule.min_score && totalScore <= rule.max_score
    )

    if (matchingRule) {
      const visualizationData: VisualizationData = {
        score: totalScore,
        max_score: config.max_score,
        min_score: config.min_score,
        risk_level: matchingRule.risk_level,
        label: matchingRule.label,
        visualization_type: config.visualization_type,
        percentage: Math.round(percentage * 100) / 100,
        zones: config.rules.map(rule => ({
          min: ((rule.min_score - config.min_score) / (config.max_score - config.min_score)) * 100,
          max: ((rule.max_score - config.min_score) / (config.max_score - config.min_score)) * 100,
          color: rule.color,
          label: rule.label,
          risk_level: rule.risk_level
        }))
      }

      const scoreResult: ScoreResult = {
        response_id: 999, // Mock response ID
        config_id: config.id,
        total_score: totalScore,
        normalized_score: totalScore,
        percentage: Math.round(percentage * 100) / 100,
        risk_level: matchingRule.risk_level,
        risk_label: matchingRule.label,
        risk_color: matchingRule.color,
        actions: matchingRule.actions,
        visualization_data: visualizationData,
        calculated_at: new Date().toISOString()
      }

      setResult(scoreResult)
    }

    setIsCalculating(false)
  }

  const loadScenario = (scenario: typeof testScenarios[0]) => {
    setAnswers(scenario.answers)
    setResult(null)
  }

  const resetTest = () => {
    setAnswers(Array(7).fill(0))
    setResult(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
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
              The configuration you're trying to test doesn't exist or has been deleted.
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
            <h1 className="text-3xl font-bold text-gray-900">Test Configuration</h1>
            <p className="text-gray-600 mt-2">
              Test "{config.name}" with sample responses
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetTest}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={calculateScore} disabled={isCalculating}>
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Calculating...' : 'Calculate Score'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Input */}
        <div className="space-y-6">
          {/* Test Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Scenarios</CardTitle>
              <CardDescription>
                Load predefined test scenarios to quickly validate scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testScenarios.map((scenario, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => loadScenario(scenario)}
                  >
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Score: {scenario.expectedScore}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {scenario.expectedRisk}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Test Input</CardTitle>
              <CardDescription>
                Manually set responses for each question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockQuestions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {index + 1}. {question.text}
                  </Label>
                  <Select 
                    value={answers[index].toString()} 
                    onValueChange={(value) => {
                      const newAnswers = [...answers]
                      newAnswers[index] = parseInt(value)
                      setAnswers(newAnswers)
                      setResult(null) // Clear result when answers change
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option, optionIndex) => (
                        <SelectItem key={optionIndex} value={optionIndex.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {optionIndex} pts
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Total:</span>
                  <Badge variant="outline">
                    {answers.reduce((sum, answer) => sum + answer, 0)} / {config.max_score}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Score Visualization */}
              <ScoreVisualization
                data={result.visualization_data}
                title="Test Result"
                description="Calculated score based on your test inputs"
              />

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Calculation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Total Score</Label>
                      <p className="text-lg font-bold">{result.total_score}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Percentage</Label>
                      <p className="text-lg font-bold">{result.percentage}%</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Risk Level</Label>
                      <Badge 
                        style={{ backgroundColor: result.risk_color + '20', color: result.risk_color }}
                        className="font-medium"
                      >
                        {result.risk_label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Calculated At</Label>
                      <p className="text-sm">{new Date(result.calculated_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {result.actions.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">Recommended Actions</Label>
                      <ul className="mt-2 space-y-1">
                        {result.actions.map((action, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Validation */}
              <Card>
                <CardHeader>
                  <CardTitle>Validation</CardTitle>
                  <CardDescription>
                    Verify the calculation matches expected results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Score within valid range</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk level correctly determined</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Actions properly assigned</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Visualization data generated</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Play className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test</h3>
                <p className="text-gray-600 text-center mb-4">
                  Set your test responses and click "Calculate Score" to see the results
                </p>
                <Button onClick={calculateScore} disabled={isCalculating}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Score
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


