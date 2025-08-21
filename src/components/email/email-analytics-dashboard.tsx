'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Mail, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download
} from 'lucide-react';

interface EmailAnalytics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  failure_rate: number;
}

interface EmailTrendData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

interface TopPerformingTemplate {
  template_id: number;
  template_name: string;
  total_sent: number;
  open_rate: number;
  click_rate: number;
  delivery_rate: number;
}

interface EmailAnalyticsDashboardProps {
  organizationId?: number;
}

export const EmailAnalyticsDashboard: React.FC<EmailAnalyticsDashboardProps> = ({ organizationId }) => {
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [trends, setTrends] = useState<EmailTrendData[]>([]);
  const [topTemplates, setTopTemplates] = useState<TopPerformingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchAnalytics();
  }, [organizationId, dateRange, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const params = new URLSearchParams({
        type: 'dashboard',
        date_from: startDate.toISOString().split('T')[0],
        date_to: endDate.toISOString().split('T')[0],
        period
      });

      if (organizationId) {
        params.append('organization_id', organizationId.toString());
      }

      const response = await fetch(`/api/email/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
        setTrends(data.data.trends);
        setTopTemplates(data.data.top_templates);
      }
    } catch (error) {
      console.error('Error fetching email analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const getStatusColor = (rate: number, type: 'good' | 'bad') => {
    if (type === 'good') {
      return rate >= 20 ? 'text-green-600' : rate >= 10 ? 'text-yellow-600' : 'text-red-600';
    } else {
      return rate <= 2 ? 'text-green-600' : rate <= 5 ? 'text-yellow-600' : 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Analytics</h2>
          <p className="text-gray-600">Monitor your email performance and engagement</p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.total_sent)}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(analytics.delivery_rate, 'good')}`}>
                    {formatPercentage(analytics.delivery_rate)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(analytics.open_rate, 'good')}`}>
                    {formatPercentage(analytics.open_rate)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Click Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(analytics.click_rate, 'good')}`}>
                    {formatPercentage(analytics.click_rate)}
                  </p>
                </div>
                <MousePointer className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p className={`text-xl font-bold ${getStatusColor(analytics.bounce_rate, 'bad')}`}>
                    {formatPercentage(analytics.bounce_rate)}
                  </p>
                  <p className="text-sm text-gray-500">{formatNumber(analytics.total_bounced)} bounced</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failure Rate</p>
                  <p className={`text-xl font-bold ${getStatusColor(analytics.failure_rate, 'bad')}`}>
                    {formatPercentage(analytics.failure_rate)}
                  </p>
                  <p className="text-sm text-gray-500">{formatNumber(analytics.total_failed)} failed</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatNumber(analytics.total_opened + analytics.total_clicked)}
                  </p>
                  <p className="text-sm text-gray-500">Opens + Clicks</p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Email Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart visualization would go here</p>
            <p className="text-sm text-gray-400 ml-2">({trends.length} data points)</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Total Sent</TableHead>
                <TableHead>Delivery Rate</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topTemplates.map((template) => (
                <TableRow key={template.template_id}>
                  <TableCell className="font-medium">{template.template_name}</TableCell>
                  <TableCell>{formatNumber(template.total_sent)}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(template.delivery_rate, 'good')}>
                      {formatPercentage(template.delivery_rate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getStatusColor(template.open_rate, 'good')}>
                      {formatPercentage(template.open_rate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getStatusColor(template.click_rate, 'good')}>
                      {formatPercentage(template.click_rate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        template.open_rate >= 20 ? "default" : 
                        template.open_rate >= 10 ? "secondary" : 
                        "destructive"
                      }
                    >
                      {template.open_rate >= 20 ? 'Excellent' : 
                       template.open_rate >= 10 ? 'Good' : 
                       'Needs Improvement'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {topTemplates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No template data available for the selected period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
