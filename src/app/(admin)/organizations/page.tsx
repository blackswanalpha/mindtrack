'use client';

import React, { useState } from 'react';
import { OrganizationDashboard } from '@/components/organization/organization-dashboard';
import { MemberManagement } from '@/components/organization/member-management';
import { InviteMemberForm } from '@/components/organization/invite-member-form';
import { CreateOrganizationForm } from '@/components/organization/create-organization-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Settings, 
  BarChart3, 
  Plus,
  UserPlus
} from 'lucide-react';
import { useOrganization } from '@/lib/organization-context';

export default function OrganizationsPage() {
  const { currentOrganization, userRole } = useOrganization();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canManageOrganization = userRole === 'owner' || userRole === 'admin';

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to MindTrack Organizations
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Organizations help you collaborate with team members and manage questionnaires together. 
            Create your first organization to get started.
          </p>
          <Button
            onClick={() => setShowCreateOrg(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Organization</span>
          </Button>
        </div>

        <CreateOrganizationForm
          open={showCreateOrg}
          onOpenChange={setShowCreateOrg}
          onSuccess={() => setShowCreateOrg(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization</h1>
          <p className="text-gray-600">
            Manage your organization, members, and settings
          </p>
        </div>
        {canManageMembers && (
          <Button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* Organization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="questionnaires" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Questionnaires</span>
          </TabsTrigger>
          {canManageOrganization && (
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <OrganizationDashboard
            onManageMembers={() => setActiveTab('members')}
            onCreateQuestionnaire={() => {
              // Navigate to questionnaire creation
              window.location.href = '/questionnaires/create';
            }}
            onViewAnalytics={() => {
              // Navigate to analytics
              window.location.href = '/analytics';
            }}
            onOrganizationSettings={() => setActiveTab('settings')}
          />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <MemberManagement
            onInviteMember={() => setShowInviteForm(true)}
          />
        </TabsContent>

        {/* Questionnaires Tab */}
        <TabsContent value="questionnaires" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Questionnaires</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Questionnaire Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Organization-specific questionnaire management will be integrated here.
                </p>
                <Button
                  onClick={() => window.location.href = '/questionnaires'}
                  variant="outline"
                >
                  Go to Questionnaires
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        {canManageOrganization && (
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Organization Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Settings Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Organization settings and configuration options will be available here.
                  </p>
                  <p className="text-sm text-gray-500">
                    Coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Member Dialog */}
      <InviteMemberForm
        open={showInviteForm}
        onOpenChange={setShowInviteForm}
        onSuccess={() => setShowInviteForm(false)}
      />
    </div>
  );
}
