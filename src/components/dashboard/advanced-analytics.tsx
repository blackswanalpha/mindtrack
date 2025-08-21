'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Calendar, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Mock data for advanced analytics
const mentalHealthTrends = [
  { month: 'Jan', anxiety: 65, depression: 45, stress: 70, wellbeing: 75 },
  { month: 'Feb', anxiety: 62, depression: 42, stress: 68, wellbeing: 78 },
  { month: 'Mar', anxiety: 58, depression: 38, stress: 65, wellbeing: 82 },
  { month: 'Apr', anxiety: 55, depression: 35, stress: 62, wellbeing: 85 },
  { month: 'May', anxiety: 52, depression: 32, stress: 58, wellbeing: 88 },
  { month: 'Jun', anxiety: 48, depression: 28, stress: 55, wellbeing: 92 }
]

const riskDistribution = [
  { name: 'Low Risk', value: 65, color: '#10b981' },
  { name: 'Moderate Risk', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 8, color: '#ef4444' },
  { name: 'Critical Risk', value: 2, color: '#dc2626' }
]

// Demographic data for future use
// const demographicData = [
//   { age: '18-25', responses: 320, completion: 89 },
//   { age: '26-35', responses: 450, completion: 92 },
//   { age: '36-45', responses: 380, completion: 87 },
//   { age: '46-55', responses: 280, completion: 85 },
//   { age: '56+', responses: 180, completion: 83 }
// ]

export function AdvancedAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Advanced Analytics</h2>
          <p className="text-sm text-gray-600">Detailed insights and trends analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 6 months
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mental Health Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mental Health Trends</h3>
              <p className="text-sm text-gray-600">Average scores over time</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mentalHealthTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="wellbeing" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Wellbeing"
                />
                <Area 
                  type="monotone" 
                  dataKey="anxiety" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Anxiety"
                />
                <Area 
                  type="monotone" 
                  dataKey="depression" 
                  stackId="3"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name="Depression"
                />
                <Area 
                  type="monotone" 
                  dataKey="stress" 
                  stackId="4"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Stress"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
              <p className="text-sm text-gray-600">Current risk level breakdown</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
