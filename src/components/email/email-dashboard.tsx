'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Send,
  FileText,
  Settings,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  pendingEmails: number;
  activeTemplates: number;
  automationRules: number;
  unsubscribes: number;
  todayStats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

interface RecentActivity {
  id: number;
  type: 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'automation' | 'template';
  message: string;
  time: string;
  status: 'success' | 'info' | 'warning' | 'error';
  recipient?: string;
  template?: string;
}

export const EmailDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/email/analytics?type=dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        const analytics = analyticsData.data.analytics;
        
        // Mock additional stats (in real implementation, these would come from API)
        setStats({
          totalSent: analytics.total_sent,
          deliveryRate: analytics.delivery_rate,
          openRate: analytics.open_rate,
          clickRate: analytics.click_rate,
          bounceRate: analytics.bounce_rate,
          pendingEmails: 12,
          activeTemplates: 8,
          automationRules: 5,
          unsubscribes: 23,
          todayStats: {
            sent: 156,
            delivered: 152,
            opened: 38,
            clicked: 6
          }
        });
      }

      // Mock recent activity (in real implementation, this would come from API)
      setRecentActivity([
        { id: 1, type: 'sent', message: 'Welcome email sent to john@example.com', time: '2 minutes ago', status: 'success', recipient: 'john@example.com', template: 'Welcome' },
        { id: 2, type: 'opened', message: 'Assessment results email opened by patient@clinic.com', time: '5 minutes ago', status: 'info', recipient: 'patient@clinic.com' },
        { id: 3, type: 'automation', message: 'Follow-up reminder triggered for Response #1234', time: '10 minutes ago', status: 'info' },
        { id: 4, type: 'failed', message: 'Email delivery failed to invalid@domain.com', time: '15 minutes ago', status: 'error', recipient: 'invalid@domain.com' },
        { id: 5, type: 'template', message: 'New template "Patient Survey" created', time: '1 hour ago', status: 'success', template: 'Patient Survey' },
        { id: 6, type: 'clicked', message: 'Link clicked in newsletter by subscriber@example.com', time: '2 hours ago', status: 'success', recipient: 'subscriber@example.com' },
        { id: 7, type: 'bounced', message: 'Email bounced from old-email@company.com', time: '3 hours ago', status: 'warning', recipient: 'old-email@company.com' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'opened':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4 text-purple-500" />;
      case 'bounced':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'automation':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'template':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
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

  if (!stats) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
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
                <p className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.deliveryRate}%` }}
                  ></div>
                </div>
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
                <p className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${stats.openRate}%` }}
                  ></div>
                </div>
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
                <p className="text-2xl font-bold">{stats.clickRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min(stats.clickRate * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Today's Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.todayStats.sent}</div>
              <div className="text-sm text-gray-600">Emails Sent</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.todayStats.delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.todayStats.opened}</div>
              <div className="text-sm text-gray-600">Opened</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.todayStats.clicked}</div>
              <div className="text-sm text-gray-600">Clicked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Emails</p>
                  <p className="text-lg font-semibold">{stats.pendingEmails}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Templates</p>
                  <p className="text-lg font-semibold">{stats.activeTemplates}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Automation Rules</p>
                  <p className="text-lg font-semibold">{stats.automationRules}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Unsubscribes</p>
                  <p className="text-lg font-semibold">{stats.unsubscribes}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Health</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 border-l-4 rounded-r ${getStatusColor(activity.status)}`}
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.recipient && (
                        <Badge variant="outline" className="text-xs">
                          {activity.recipient}
                        </Badge>
                      )}
                      {activity.template && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.template}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Send className="h-6 w-6" />
              <span>Compose Email</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Create Template</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span>Email Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
