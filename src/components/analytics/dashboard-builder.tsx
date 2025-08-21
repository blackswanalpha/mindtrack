'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Grid3X3, 
  Layout,
  Settings,
  Eye,
  Share2,
  Copy,
  Trash2,
  MoreHorizontal,
  Users,
  Lock,
  Globe,
  Edit,
  Star,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data for dashboards
const mockDashboards = [
  {
    id: '1',
    title: 'Executive Mental Health Overview',
    description: 'High-level metrics and KPIs for executive reporting',
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T15:45:00Z',
    created_by: 'Dr. Sarah Johnson',
    visibility: 'organization',
    layout: 'grid',
    widgets: 12,
    views: 156,
    shared_with: 8,
    tags: ['executive', 'overview', 'kpi'],
    is_favorite: true,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: '2',
    title: 'GAD-7 Assessment Dashboard',
    description: 'Detailed analytics for GAD-7 questionnaire responses',
    created_at: '2024-01-19T14:20:00Z',
    updated_at: '2024-01-19T16:30:00Z',
    created_by: 'Dr. Michael Chen',
    visibility: 'public',
    layout: 'masonry',
    widgets: 8,
    views: 89,
    shared_with: 15,
    tags: ['gad-7', 'anxiety', 'assessment'],
    is_favorite: false,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: '3',
    title: 'User Engagement Analytics',
    description: 'Track user activity and engagement patterns',
    created_at: '2024-01-18T09:15:00Z',
    updated_at: '2024-01-18T11:45:00Z',
    created_by: 'Admin User',
    visibility: 'private',
    layout: 'grid',
    widgets: 6,
    views: 34,
    shared_with: 3,
    tags: ['engagement', 'users', 'activity'],
    is_favorite: true,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: '4',
    title: 'Risk Assessment Monitor',
    description: 'Real-time monitoring of high-risk assessments',
    created_at: '2024-01-17T16:00:00Z',
    updated_at: '2024-01-17T18:20:00Z',
    created_by: 'System Admin',
    visibility: 'organization',
    layout: 'grid',
    widgets: 10,
    views: 203,
    shared_with: 12,
    tags: ['risk', 'monitoring', 'alerts'],
    is_favorite: false,
    thumbnail: '/api/placeholder/300/200'
  }
];

const layoutOptions = [
  { value: 'grid', label: 'Grid Layout', description: 'Organized in a structured grid' },
  { value: 'masonry', label: 'Masonry Layout', description: 'Flexible, Pinterest-style layout' },
  { value: 'flow', label: 'Flow Layout', description: 'Responsive flowing layout' }
];

const visibilityOptions = [
  { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this dashboard' },
  { value: 'organization', label: 'Organization', icon: Users, description: 'Visible to your organization' },
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone with the link can view' }
];

interface DashboardBuilderProps {}

export function DashboardBuilder({}: DashboardBuilderProps) {
  const [dashboards, setDashboards] = useState(mockDashboards);
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [isCreating, setIsCreating] = useState(false);

  const getVisibilityIcon = (visibility: string) => {
    const option = visibilityOptions.find(opt => opt.value === visibility);
    if (!option) return Lock;
    return option.icon;
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-600 bg-green-100';
      case 'organization': return 'text-blue-600 bg-blue-100';
      case 'private': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateDashboard = () => {
    setIsCreating(true);
    // Simulate dashboard creation
    setTimeout(() => {
      const newDashboard = {
        id: Date.now().toString(),
        title: 'New Dashboard',
        description: 'Custom dashboard created by user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'Current User',
        visibility: 'private',
        layout: selectedLayout,
        widgets: 0,
        views: 0,
        shared_with: 0,
        tags: ['custom'],
        is_favorite: false,
        thumbnail: '/api/placeholder/300/200'
      };
      setDashboards(prev => [newDashboard, ...prev]);
      setIsCreating(false);
    }, 2000);
  };

  const toggleFavorite = (dashboardId: string) => {
    setDashboards(prev => prev.map(dashboard => 
      dashboard.id === dashboardId 
        ? { ...dashboard, is_favorite: !dashboard.is_favorite }
        : dashboard
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Builder</h2>
          <p className="text-gray-600">Create and manage custom dashboards for your analytics</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedLayout} onValueChange={setSelectedLayout}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Layout Style" />
            </SelectTrigger>
            <SelectContent>
              {layoutOptions.map((layout) => (
                <SelectItem key={layout.value} value={layout.value}>
                  <div>
                    <div className="font-medium">{layout.label}</div>
                    <div className="text-xs text-gray-500">{layout.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleCreateDashboard} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Dashboard'}
          </Button>
        </div>
      </div>

      {/* Dashboard Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>Get started quickly with pre-built dashboard templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Mental Health Overview', description: 'Comprehensive mental health metrics', widgets: 8 },
              { name: 'Risk Assessment', description: 'Focus on high-risk indicators', widgets: 6 },
              { name: 'User Engagement', description: 'Track user activity and participation', widgets: 7 }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <Grid3X3 className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{template.widgets} widgets included</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Dashboards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Dashboards</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Layout className="w-4 h-4 mr-2" />
              View: {selectedLayout}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => {
            const VisibilityIcon = getVisibilityIcon(dashboard.visibility);
            
            return (
              <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                        {dashboard.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {dashboard.description}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleFavorite(dashboard.id)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {dashboard.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Dashboard Preview */}
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Grid3X3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{dashboard.widgets} widgets</p>
                      </div>
                    </div>
                    
                    {/* Dashboard Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Visibility:</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getVisibilityColor(dashboard.visibility)}`}>
                          <VisibilityIcon className="w-3 h-3" />
                          {dashboard.visibility}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{dashboard.views}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Shared with:</span>
                        <span className="font-medium">{dashboard.shared_with} users</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {dashboard.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(dashboard.updated_at)}
                      </div>
                      <span>by {dashboard.created_by}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {dashboards.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Grid3X3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboards Yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first dashboard to start visualizing your data
            </p>
            <Button onClick={handleCreateDashboard}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
