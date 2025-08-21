'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Users,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';
import { EnhancedQuestionTypesDemo } from '@/components/demo/enhanced-question-types-demo';
import Link from 'next/link';

export default function EnhancedFeaturesDemo() {
  const features = [
    {
      title: 'Group Targeting',
      description: 'Target specific organizations or individuals with customized access controls',
      icon: Users,
      color: 'blue',
      items: [
        'Organization-specific questionnaires',
        'Individual targeting with demographics',
        'Access control settings',
        'Authentication requirements',
        'Anonymous response options'
      ]
    },
    {
      title: 'Template Library',
      description: 'Pre-built questionnaires for common use cases and validated assessments',
      icon: FileText,
      color: 'green',
      items: [
        'GAD-7 Anxiety Assessment',
        'PHQ-9 Depression Screening',
        'Customer Satisfaction Surveys',
        'Employee Wellness Checks',
        'Research Questionnaires'
      ]
    },
    {
      title: 'Enhanced Questions',
      description: '22+ question types with advanced validation and conditional logic',
      icon: Plus,
      color: 'purple',
      items: [
        'Numeric inputs with validation',
        'Date/time pickers',
        'File and image uploads',
        'Rating scales (Likert, NPS, Stars)',
        'Geographic selection',
        'Conditional logic and branching'
      ]
    }
  ];

  const questionTypeStats = [
    { category: 'Text Input', count: 3, types: ['text', 'textarea', 'rich_text'] },
    { category: 'Numeric', count: 2, types: ['number', 'decimal'] },
    { category: 'Date/Time', count: 3, types: ['date', 'time', 'datetime'] },
    { category: 'Rating Scales', count: 6, types: ['rating', 'star_rating', 'likert', 'nps', 'semantic_differential', 'slider'] },
    { category: 'Choice', count: 3, types: ['single_choice', 'multiple_choice', 'dropdown'] },
    { category: 'File Upload', count: 2, types: ['file_upload', 'image_upload'] },
    { category: 'Geographic', count: 3, types: ['country', 'state', 'city'] },
    { category: 'Basic', count: 1, types: ['boolean'] }
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Enhanced Features Demo</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore the comprehensive enhanced questionnaire system with advanced targeting, 
          templates, and 22+ question types with conditional logic.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant="secondary" className="text-sm">
            <Zap className="w-4 h-4 mr-1" />
            22+ Question Types
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Star className="w-4 h-4 mr-1" />
            Smart Targeting
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <FileText className="w-4 h-4 mr-1" />
            Template Library
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-200 text-blue-900',
            green: 'bg-green-50 border-green-200 text-green-900',
            purple: 'bg-purple-50 border-purple-200 text-purple-900'
          };
          
          return (
            <Card key={index} className={`${colorClasses[feature.color as keyof typeof colorClasses]} transition-transform hover:scale-105`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-6 h-6" />
                  {feature.title}
                </CardTitle>
                <p className="text-sm opacity-80">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Question Types Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Question Type Coverage</CardTitle>
          <p className="text-center text-gray-600">
            Comprehensive support for all common questionnaire needs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {questionTypeStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stat.count}</div>
                <div className="text-sm font-medium text-gray-900 mb-2">{stat.category}</div>
                <div className="text-xs text-gray-600">
                  {stat.types.slice(0, 2).join(', ')}
                  {stat.types.length > 2 && ` +${stat.types.length - 2} more`}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">22+</div>
            <div className="text-lg font-medium text-gray-900">Total Question Types</div>
            <div className="text-sm text-gray-600">All with validation and conditional logic support</div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="workflow">Creation Workflow</TabsTrigger>
          <TabsTrigger value="features">Feature Details</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <EnhancedQuestionTypesDemo />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Questionnaire Creation Workflow</CardTitle>
              <p className="text-gray-600">
                Step-by-step process for creating comprehensive questionnaires
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: 'Basic Information',
                    description: 'Set questionnaire title, description, type, and category',
                    features: ['Title and description', 'Questionnaire type selection', 'Category classification', 'Estimated completion time']
                  },
                  {
                    step: 2,
                    title: 'Target Group Settings',
                    description: 'Configure who can access and respond to the questionnaire',
                    features: ['Organization vs Individual targeting', 'Access control settings', 'Authentication requirements', 'Anonymous response options']
                  },
                  {
                    step: 3,
                    title: 'Template Selection',
                    description: 'Choose from pre-built templates or start from scratch',
                    features: ['Template library browsing', 'Popular templates (GAD-7, PHQ-9)', 'Template customization options', 'Preview functionality']
                  },
                  {
                    step: 4,
                    title: 'Question Building',
                    description: 'Create questions using advanced question types and logic',
                    features: ['22+ question types', 'Conditional logic setup', 'Validation rules', 'Section organization']
                  }
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Text length constraints (min/max characters)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Pattern validation with regex support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Numeric range validation (min/max values)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Date range constraints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>File type and size validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Selection count limits (min/max selections)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conditional Logic</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Show/hide questions based on responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Skip patterns and branching logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>AND/OR condition combinations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Dynamic question text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Required field logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Progress calculation with logic awareness</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Ready to Create Enhanced Questionnaires?</h2>
          <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
            Experience the full power of the enhanced questionnaire system with advanced targeting, 
            templates, and comprehensive question types.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/questionnaires/create-enhanced">
              <Button size="lg" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Create Enhanced Questionnaire
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/questionnaires">
              <Button variant="outline" size="lg">
                View All Questionnaires
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
