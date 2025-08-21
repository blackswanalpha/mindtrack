'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Activity, 
  Settings, 
  UserPlus,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useOrganization } from '@/lib/organization-context';
import { cn } from '@/lib/utils';

interface OrganizationDashboardProps {
  onManageMembers?: () => void;
  onCreateQuestionnaire?: () => void;
  onViewAnalytics?: () => void;
  onOrganizationSettings?: () => void;
  className?: string;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  onManageMembers,
  onCreateQuestionnaire,
  onViewAnalytics,
  onOrganizationSettings,
  className
}) => {
  const { 
    currentOrganization, 
    members, 
    userRole, 
    isLoading 
  } = useOrganization();

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Selected</h3>
          <p className="text-gray-500">Select an organization to view the dashboard</p>
        </div>
      </div>
    );
  }

  const stats = currentOrganization.stats;
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canManageOrganization = userRole === 'owner' || userRole === 'admin';

  const statCards = [
    {
      title: 'Total Members',
      value: stats.member_count,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: canManageMembers ? onManageMembers : undefined,
      actionLabel: 'Manage'
    },
    {
      title: 'Questionnaires',
      value: stats.questionnaire_count,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: `${stats.active_questionnaire_count} active`,
      action: onCreateQuestionnaire,
      actionLabel: 'Create'
    },
    {
      title: 'Total Responses',
      value: stats.response_count,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: onViewAnalytics,
      actionLabel: 'View Analytics'
    },
    {
      title: 'Recent Activity',
      value: stats.recent_activity_count,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtitle: 'Last 7 days'
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentOrganization.name}
          </h1>
          {currentOrganization.description && (
            <p className="text-gray-600 mt-1">{currentOrganization.description}</p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="capitalize">
              {userRole}
            </Badge>
            {currentOrganization.type && (
              <Badge variant="secondary">
                {currentOrganization.type}
              </Badge>
            )}
          </div>
        </div>
        {canManageOrganization && (
          <Button
            variant="outline"
            onClick={onOrganizationSettings}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
              {stat.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stat.action}
                  className="mt-2 h-8 px-2 text-xs"
                >
                  {stat.actionLabel}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Members</CardTitle>
            {canManageMembers && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManageMembers}
                className="flex items-center space-x-1"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {member.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {member.role}
                    </Badge>
                  </div>
                ))}
                {members.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onManageMembers}
                    className="w-full mt-2"
                  >
                    View all {members.length} members
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No members yet</p>
                {canManageMembers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onManageMembers}
                    className="mt-2"
                  >
                    Invite members
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onCreateQuestionnaire}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Questionnaire
              </Button>
              
              {canManageMembers && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onManageMembers}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              )}
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onViewAnalytics}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              
              {canManageOrganization && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onOrganizationSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Organization Settings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
