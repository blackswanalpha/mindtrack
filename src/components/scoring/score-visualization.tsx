'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { VisualizationData, RiskLevel } from '@/types/scoring'

interface ScoreVisualizationProps {
  data: VisualizationData
  title?: string
  description?: string
  showDetails?: boolean
  className?: string
}

export function ScoreVisualization({ 
  data, 
  title = "Score Result", 
  description,
  showDetails = true,
  className 
}: ScoreVisualizationProps) {
  const riskLevelConfig = useMemo(() => {
    const configs: Record<RiskLevel, { color: string; bgColor: string; textColor: string }> = {
      none: { color: '#6B7280', bgColor: '#F9FAFB', textColor: '#374151' },
      low: { color: '#10B981', bgColor: '#ECFDF5', textColor: '#065F46' },
      medium: { color: '#F59E0B', bgColor: '#FFFBEB', textColor: '#92400E' },
      high: { color: '#EF4444', bgColor: '#FEF2F2', textColor: '#991B1B' },
      critical: { color: '#DC2626', bgColor: '#FEF2F2', textColor: '#7F1D1D' }
    }
    return configs[data.risk_level] || configs.none
  }, [data.risk_level])

  const renderGaugeVisualization = () => {
    const circumference = 2 * Math.PI * 45 // radius = 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (data.percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={riskLevelConfig.color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{data.score}</span>
            <span className="text-xs text-gray-500">/ {data.max_score}</span>
          </div>
        </div>
        <div className="text-center">
          <Badge 
            style={{ 
              backgroundColor: riskLevelConfig.bgColor,
              color: riskLevelConfig.textColor,
              borderColor: riskLevelConfig.color
            }}
            className="mb-2"
          >
            {data.label}
          </Badge>
          <div className="text-sm text-gray-600">
            {data.percentage.toFixed(1)}% of maximum score
          </div>
        </div>
      </div>
    )
  }

  const renderBarVisualization = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Score: {data.score}</span>
          <Badge 
            style={{ 
              backgroundColor: riskLevelConfig.bgColor,
              color: riskLevelConfig.textColor,
              borderColor: riskLevelConfig.color
            }}
          >
            {data.label}
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress 
            value={data.percentage} 
            className="h-3"
            style={{ 
              '--progress-background': riskLevelConfig.color 
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{data.min_score}</span>
            {data.passing_score && (
              <span>Pass: {data.passing_score}</span>
            )}
            <span>{data.max_score}</span>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          {data.percentage.toFixed(1)}% ({data.score}/{data.max_score})
        </div>
      </div>
    )
  }

  const renderZoneVisualization = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">{data.score}</div>
          <Badge 
            style={{ 
              backgroundColor: riskLevelConfig.bgColor,
              color: riskLevelConfig.textColor,
              borderColor: riskLevelConfig.color
            }}
            className="mb-2"
          >
            {data.label}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Risk Zones</div>
          {data.zones.map((zone, index) => {
            const isCurrentZone = data.percentage >= zone.min && data.percentage <= zone.max
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded ${
                  isCurrentZone ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <span className="text-sm font-medium">{zone.label}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {zone.min.toFixed(0)}% - {zone.max.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderVisualization = () => {
    switch (data.visualization_type) {
      case 'gauge':
        return renderGaugeVisualization()
      case 'bar':
        return renderBarVisualization()
      case 'line':
      case 'radar':
      case 'pie':
      case 'heatmap':
        return renderZoneVisualization() // Fallback for complex visualizations
      default:
        return renderBarVisualization()
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderVisualization()}
        
        {showDetails && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Score Range:</span>
                <div className="font-medium">{data.min_score} - {data.max_score}</div>
              </div>
              {data.passing_score && (
                <div>
                  <span className="text-gray-500">Passing Score:</span>
                  <div className="font-medium">{data.passing_score}</div>
                </div>
              )}
              <div>
                <span className="text-gray-500">Risk Level:</span>
                <div className="font-medium capitalize">{data.risk_level}</div>
              </div>
              <div>
                <span className="text-gray-500">Percentage:</span>
                <div className="font-medium">{data.percentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for dashboard cards
export function CompactScoreVisualization({ 
  data, 
  className 
}: { 
  data: VisualizationData
  className?: string 
}) {
  const riskLevelConfig = useMemo(() => {
    const configs: Record<RiskLevel, { color: string; bgColor: string; textColor: string }> = {
      none: { color: '#6B7280', bgColor: '#F9FAFB', textColor: '#374151' },
      low: { color: '#10B981', bgColor: '#ECFDF5', textColor: '#065F46' },
      medium: { color: '#F59E0B', bgColor: '#FFFBEB', textColor: '#92400E' },
      high: { color: '#EF4444', bgColor: '#FEF2F2', textColor: '#991B1B' },
      critical: { color: '#DC2626', bgColor: '#FEF2F2', textColor: '#7F1D1D' }
    }
    return configs[data.risk_level] || configs.none
  }, [data.risk_level])

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={riskLevelConfig.color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 - (data.percentage / 100) * 2 * Math.PI * 40}`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900">{data.score}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{data.score}/{data.max_score}</span>
          <Badge 
            size="sm"
            style={{ 
              backgroundColor: riskLevelConfig.bgColor,
              color: riskLevelConfig.textColor,
              borderColor: riskLevelConfig.color
            }}
          >
            {data.label}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">
          {data.percentage.toFixed(1)}% of maximum
        </div>
      </div>
    </div>
  )
}
