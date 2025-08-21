'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data for reports
const mockReports = [
  {
    id: '1',
    title: 'Weekly Mental Health Summary',
    description: 'Comprehensive overview of mental health metrics for the past week',
    type: 'summary',
    category: 'Mental Health',
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T15:45:00Z',
    created_by: 'Dr. Sarah Johnson',
    status: 'completed',
    visibility: 'organization',
    download_count: 24,
    file_size: '2.4 MB',
    tags: ['weekly', 'summary', 'mental-health'],
    metrics: {
      total_responses: 156,
      completion_rate: '87%',
      avg_score: 14.2,
      high_risk_count: 8
    }
  },
  {
    id: '2',
    title: 'GAD-7 Questionnaire Analysis',
    description: 'Detailed analysis of GAD-7 questionnaire responses and trends',
    type: 'questionnaire',
    category: 'Anxiety Assessment',
    created_at: '2024-01-19T14:20:00Z',
    updated_at: '2024-01-19T16:30:00Z',
    created_by: 'Dr. Michael Chen',
    status: 'completed',
    visibility: 'public',
    download_count: 42,
    file_size: '3.1 MB',
    tags: ['gad-7', 'anxiety', 'questionnaire'],
    metrics: {
      total_responses: 89,
      completion_rate: '92%',
      avg_score: 8.7,
      high_risk_count: 12
    }
  },
  {
    id: '3',
    title: 'User Engagement Report',
    description: 'Analysis of user activity and engagement patterns',
    type: 'user',
    category: 'User Analytics',
    created_at: '2024-01-18T09:15:00Z',
    updated_at: '2024-01-18T11:45:00Z',
    created_by: 'Admin User',
    status: 'completed',
    visibility: 'private',
    download_count: 15,
    file_size: '1.8 MB',
    tags: ['engagement', 'users', 'activity'],
    metrics: {
      active_users: 234,
      avg_session_time: '12.5 min',
      bounce_rate: '23%',
      return_rate: '68%'
    }
  },
  {
    id: '4',
    title: 'Organization Performance Dashboard',
    description: 'Performance metrics across all organization questionnaires',
    type: 'organization',
    category: 'Performance',
    created_at: '2024-01-17T16:00:00Z',
    updated_at: '2024-01-17T18:20:00Z',
    created_by: 'System Admin',
    status: 'generating',
    visibility: 'organization',
    download_count: 0,
    file_size: '0 MB',
    tags: ['organization', 'performance', 'dashboard'],
    metrics: {
      total_questionnaires: 12,
      total_responses: 567,
      avg_completion_rate: '84%',
      active_users: 189
    }
  }
];

const reportTypes = [
  { value: 'all', label: 'All Reports' },
  { value: 'questionnaire', label: 'Questionnaire Reports' },
  { value: 'response', label: 'Response Reports' },
  { value: 'user', label: 'User Reports' },
  { value: 'organization', label: 'Organization Reports' },
  { value: 'custom', label: 'Custom Reports' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'generating', label: 'Generating' },
  { value: 'failed', label: 'Failed' },
  { value: 'scheduled', label: 'Scheduled' }
];

interface ReportManagerProps {}

export function ReportManager({}: ReportManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reports, setReports] = useState(mockReports);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'questionnaire':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'organization':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const variants = {
      public: 'default',
      organization: 'secondary',
      private: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[visibility as keyof typeof variants] || 'outline'}>
        {visibility}
      </Badge>
    );
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Manager</h2>
          <p className="text-gray-600">Create, manage, and share your analytics reports</p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Report
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getTypeIcon(report.type)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
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
                      View Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
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
                {/* Status and Visibility */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(report.status)}
                    <span className="text-sm font-medium capitalize">{report.status}</span>
                  </div>
                  {getVisibilityBadge(report.visibility)}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(report.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {report.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span>By {report.created_by}</span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{report.file_size}</span>
                    <span>{report.download_count} downloads</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 text-center mb-4">
              No reports match your current filters. Try adjusting the search or filters.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
