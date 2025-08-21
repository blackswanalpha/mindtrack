'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Filter,
  Settings,
  Target,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Star,
  StarOff
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for scoring configurations
const mockConfigurations = [
  {
    id: 'gad7_standard',
    name: 'GAD-7 Standard Scoring',
    description: 'Standard scoring configuration for GAD-7 questionnaire',
    questionnaire: 'Generalized Anxiety Disorder Assessment',
    questionnaire_id: 1,
    scoring_method: 'sum',
    max_score: 21,
    min_score: 0,
    visualization_type: 'gauge',
    is_active: true,
    is_default: true,
    rules_count: 4,
    total_scores: 156,
    last_used: '2024-01-20T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'Dr. Smith'
  },
  {
    id: 'phq9_standard',
    name: 'PHQ-9 Depression Scoring',
    description: 'Standard scoring for Patient Health Questionnaire-9',
    questionnaire: 'Patient Health Questionnaire-9',
    questionnaire_id: 2,
    scoring_method: 'sum',
    max_score: 27,
    min_score: 0,
    visualization_type: 'gauge',
    is_active: true,
    is_default: true,
    rules_count: 5,
    total_scores: 89,
    last_used: '2024-01-19T15:45:00Z',
    created_at: '2024-01-02T00:00:00Z',
    created_by: 'Dr. Johnson'
  },
  {
    id: 'custom_anxiety',
    name: 'Custom Anxiety Assessment',
    description: 'Weighted scoring for custom anxiety questionnaire',
    questionnaire: 'Custom Anxiety Questionnaire',
    questionnaire_id: 3,
    scoring_method: 'weighted',
    max_score: 30,
    min_score: 0,
    visualization_type: 'bar',
    is_active: true,
    is_default: false,
    rules_count: 3,
    total_scores: 34,
    last_used: '2024-01-18T09:15:00Z',
    created_at: '2024-01-05T00:00:00Z',
    created_by: 'Dr. Wilson'
  },
  {
    id: 'stress_formula',
    name: 'Stress Level Formula',
    description: 'Custom formula-based scoring for stress assessment',
    questionnaire: 'Workplace Stress Assessment',
    questionnaire_id: 4,
    scoring_method: 'custom',
    max_score: 100,
    min_score: 0,
    visualization_type: 'radar',
    is_active: false,
    is_default: false,
    rules_count: 4,
    total_scores: 12,
    last_used: '2024-01-10T14:20:00Z',
    created_at: '2024-01-08T00:00:00Z',
    created_by: 'Dr. Brown'
  }
]

export default function ScoringConfigurationsPage() {
  const [configurations, setConfigurations] = useState(mockConfigurations)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.questionnaire.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterActive === null || config.is_active === filterActive
    return matchesSearch && matchesFilter
  })

  const handleSetDefault = (configId: string) => {
    setConfigurations(prev => prev.map(config => ({
      ...config,
      is_default: config.id === configId ? true : 
                  (config.questionnaire_id === prev.find(c => c.id === configId)?.questionnaire_id ? false : config.is_default)
    })))
  }

  const handleToggleActive = (configId: string) => {
    setConfigurations(prev => prev.map(config => 
      config.id === configId ? { ...config, is_active: !config.is_active } : config
    ))
  }

  const handleDelete = (configId: string) => {
    setConfigurations(prev => prev.filter(config => config.id !== configId))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Scoring Configurations</h1>
          <p className="text-gray-600 mt-2">
            Manage scoring rules and configurations for your questionnaires
          </p>
        </div>
        <Button asChild>
          <Link href="/scoring/configs/new">
            <Plus className="w-4 h-4 mr-2" />
            New Configuration
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterActive === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive(null)}
          >
            All
          </Button>
          <Button
            variant={filterActive === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive(true)}
          >
            Active
          </Button>
          <Button
            variant={filterActive === false ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive(false)}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Configurations List */}
      <div className="space-y-4">
        {filteredConfigurations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations found</h3>
              <p className="text-gray-600 text-center mb-4">
                {searchTerm || filterActive !== null 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first scoring configuration"
                }
              </p>
              {!searchTerm && filterActive === null && (
                <Button asChild>
                  <Link href="/scoring/configs/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Configuration
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredConfigurations.map((config) => (
            <Card key={config.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{config.name}</CardTitle>
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
                      <Badge variant="outline" className="text-xs">
                        {config.scoring_method}
                      </Badge>
                    </div>
                    <CardDescription className="mb-3">
                      {config.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Questionnaire: {config.questionnaire}</span>
                      <span>•</span>
                      <span>Score Range: {config.min_score}-{config.max_score}</span>
                      <span>•</span>
                      <span>{config.rules_count} rules</span>
                      <span>•</span>
                      <span>{config.total_scores} scores calculated</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/scoring/configs/${config.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/scoring/configs/${config.id}/duplicate`}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSetDefault(config.id)}>
                        {config.is_default ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Remove Default
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(config.id)}>
                        <Settings className="h-4 w-4 mr-2" />
                        {config.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(config.id)}
                        className="text-red-600"
                        disabled={config.is_default}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Created by {config.created_by} • Last used {new Date(config.last_used).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/scoring/configs/${config.id}/analytics`}>
                        View Analytics
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/scoring/configs/${config.id}`}>
                        Configure
                      </Link>
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
