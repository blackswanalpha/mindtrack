'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Layers,
  Plus,
  Settings,
  Eye,
  Copy,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data for different chart types
const barData = [
  { name: 'GAD-7', responses: 156, completion: 87 },
  { name: 'PHQ-9', responses: 134, completion: 92 },
  { name: 'PSS-10', responses: 98, completion: 78 },
  { name: 'DASS-21', responses: 87, completion: 85 }
];

const lineData = [
  { month: 'Jan', anxiety: 12, depression: 8, stress: 15 },
  { month: 'Feb', anxiety: 14, depression: 10, stress: 18 },
  { month: 'Mar', anxiety: 11, depression: 7, stress: 13 },
  { month: 'Apr', anxiety: 16, depression: 12, stress: 20 },
  { month: 'May', anxiety: 13, depression: 9, stress: 16 },
  { month: 'Jun', anxiety: 15, depression: 11, stress: 19 }
];

const pieData = [
  { name: 'Minimal', value: 45, color: '#10b981' },
  { name: 'Mild', value: 30, color: '#f59e0b' },
  { name: 'Moderate', value: 18, color: '#ef4444' },
  { name: 'Severe', value: 7, color: '#dc2626' }
];

const radarData = [
  { subject: 'Anxiety', A: 120, B: 110, fullMark: 150 },
  { subject: 'Depression', A: 98, B: 130, fullMark: 150 },
  { subject: 'Stress', A: 86, B: 130, fullMark: 150 },
  { subject: 'Sleep', A: 99, B: 100, fullMark: 150 },
  { subject: 'Social', A: 85, B: 90, fullMark: 150 },
  { subject: 'Work', A: 65, B: 85, fullMark: 150 }
];

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 }
];

const areaData = [
  { name: 'Week 1', wellbeing: 65, anxiety: 12, depression: 8 },
  { name: 'Week 2', wellbeing: 62, anxiety: 14, depression: 10 },
  { name: 'Week 3', wellbeing: 69, anxiety: 11, depression: 7 },
  { name: 'Week 4', wellbeing: 58, anxiety: 16, depression: 12 }
];

const chartTypes = [
  {
    id: 'bar',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    icon: BarChart3,
    category: 'comparison',
    difficulty: 'easy',
    useCase: 'Comparing questionnaire completion rates'
  },
  {
    id: 'line',
    name: 'Line Chart',
    description: 'Show trends over time',
    icon: LineChart,
    category: 'trend',
    difficulty: 'easy',
    useCase: 'Mental health score trends over months'
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    description: 'Display proportions of a whole',
    icon: PieChart,
    category: 'distribution',
    difficulty: 'easy',
    useCase: 'Risk level distribution'
  },
  {
    id: 'area',
    name: 'Area Chart',
    description: 'Show volume over time',
    icon: Activity,
    category: 'trend',
    difficulty: 'medium',
    useCase: 'Stacked mental health indicators'
  },
  {
    id: 'radar',
    name: 'Radar Chart',
    description: 'Compare multiple variables',
    icon: Target,
    category: 'comparison',
    difficulty: 'advanced',
    useCase: 'Multi-dimensional mental health assessment'
  },
  {
    id: 'scatter',
    name: 'Scatter Chart',
    description: 'Display correlation between variables',
    icon: Zap,
    category: 'correlation',
    difficulty: 'advanced',
    useCase: 'Correlation between different assessment scores'
  }
];

interface ChartGalleryProps {}

export function ChartGallery({}: ChartGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Charts' },
    { value: 'comparison', label: 'Comparison' },
    { value: 'trend', label: 'Trends' },
    { value: 'distribution', label: 'Distribution' },
    { value: 'correlation', label: 'Correlation' }
  ];

  const filteredCharts = selectedCategory === 'all' 
    ? chartTypes 
    : chartTypes.filter(chart => chart.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderChart = (chartId: string) => {
    switch (chartId) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="responses" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsLineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="depression" stroke="#8b5cf6" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="wellbeing" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="anxiety" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Previous" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart data={scatterData}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" />
              <YAxis type="number" dataKey="y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Scores" dataKey="z" fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="h-48 bg-gray-100 rounded flex items-center justify-center">Chart Preview</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chart Gallery</h2>
          <p className="text-gray-600">Explore and create different types of data visualizations</p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Chart
        </Button>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharts.map((chart) => {
          const IconComponent = chart.icon;
          return (
            <Card key={chart.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{chart.name}</CardTitle>
                      <CardDescription>{chart.description}</CardDescription>
                    </div>
                  </div>
                  
                  <Badge className={getDifficultyColor(chart.difficulty)}>
                    {chart.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Chart Preview */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {renderChart(chart.id)}
                  </div>
                  
                  {/* Use Case */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Use Case:</p>
                    <p className="text-sm text-gray-600">{chart.useCase}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Builder Section */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Chart Builder</CardTitle>
          <CardDescription>
            Create custom visualizations tailored to your specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">1. Select Data Source</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Questionnaire Responses
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  User Activity Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Score Analytics
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">2. Choose Chart Type</h4>
              <div className="grid grid-cols-2 gap-2">
                {chartTypes.slice(0, 4).map((chart) => {
                  const IconComponent = chart.icon;
                  return (
                    <Button key={chart.id} variant="outline" size="sm" className="h-16 flex flex-col">
                      <IconComponent className="w-4 h-4 mb-1" />
                      <span className="text-xs">{chart.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">3. Configure & Create</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Chart Settings
                </Button>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Chart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
