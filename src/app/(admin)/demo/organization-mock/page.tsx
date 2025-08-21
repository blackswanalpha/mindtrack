'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockOrganization } from '@/hooks/use-mock-organization';
import { Building2, Users, Mail, Crown, Shield, Eye, User, Plus, Trash2, Settings } from 'lucide-react';
import { CreateOrganizationData, InviteMemberData } from '@/types/database';

export default function OrganizationMockDemo() {
  const {
    organizations,
    currentOrganization,
    members,
    invitations,
    notifications,
    unreadCount,
    loading,
    error,
    isMockMode,
    setCurrentUser,
    fetchOrganizations,
    fetchOrganization,
    createOrganization,
    fetchMembers,
    inviteMember,
    fetchInvitations,
    fetchNotifications,
    setCurrentOrganization
  } = useMockOrganization();

  const [selectedUserId, setSelectedUserId] = useState(1);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [newOrgData, setNewOrgData] = useState<CreateOrganizationData>({
    name: '',
    description: '',
    type: 'healthcare'
  });
  const [inviteData, setInviteData] = useState<InviteMemberData>({
    email: '',
    role: 'member'
  });

  useEffect(() => {
    if (isMockMode) {
      setCurrentUser(selectedUserId);
      fetchOrganizations();
      fetchNotifications();
    }
  }, [selectedUserId, isMockMode, setCurrentUser, fetchOrganizations, fetchNotifications]);

  useEffect(() => {
    if (selectedOrgId && isMockMode) {
      fetchOrganization(selectedOrgId);
      fetchMembers(selectedOrgId);
      fetchInvitations(selectedOrgId);
    }
  }, [selectedOrgId, isMockMode, fetchOrganization, fetchMembers, fetchInvitations]);

  const handleCreateOrganization = async () => {
    if (!newOrgData.name.trim()) return;
    
    const result = await createOrganization(newOrgData);
    if (result) {
      setNewOrgData({ name: '', description: '', type: 'healthcare' });
      setSelectedOrgId(result.id);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedOrgId || !inviteData.email.trim()) return;
    
    const result = await inviteMember(selectedOrgId, inviteData);
    if (result) {
      setInviteData({ email: '', role: 'member' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member': return <User className="h-4 w-4 text-green-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      expired: 'destructive',
      accepted: 'default',
      declined: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  if (!isMockMode) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Mock Mode Disabled</CardTitle>
            <CardDescription>
              To enable mock mode, set NEXT_PUBLIC_USE_MOCK_API=true in your environment variables.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Mock Demo</h1>
          <p className="text-muted-foreground">
            Interactive demo of the organization/member system using mock data
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Mock Mode Active
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId.toString()} onValueChange={(value) => setSelectedUserId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">John Smith (Admin)</SelectItem>
                <SelectItem value="2">Sarah Johnson (User)</SelectItem>
                <SelectItem value="3">Michael Chen (User)</SelectItem>
                <SelectItem value="4">Emily Davis (User)</SelectItem>
                <SelectItem value="5">David Wilson (User)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="text-sm">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-muted-foreground truncate">{notification.message}</div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></div>
                  )}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-muted-foreground text-sm">No notifications</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Organizations</span>
                <span className="font-medium">{organizations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Members</span>
                <span className="font-medium">{members.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending Invites</span>
                <span className="font-medium">{invitations.filter(i => i.status === 'pending').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="create">Create Org</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card 
                key={org.id} 
                className={`cursor-pointer transition-colors ${selectedOrgId === org.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedOrgId(org.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {org.name}
                  </CardTitle>
                  <CardDescription>{org.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your Role</span>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(org.user_role || 'member')}
                        <span className="text-sm font-medium capitalize">{org.user_role}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <span className="text-sm font-medium">{org.stats.member_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Questionnaires</span>
                      <span className="text-sm font-medium">{org.stats.questionnaire_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {selectedOrgId ? (
            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  Members of {currentOrganization?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{member.user?.name}</div>
                          <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className="text-sm font-medium capitalize">{member.role}</span>
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">Select an organization to view members</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {selectedOrgId ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invite New Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="invite-email">Email</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="user@example.com"
                        value={inviteData.email}
                        onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleInviteMember} disabled={loading} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-muted-foreground">
                            Invited by {invitation.invited_by?.name} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(invitation.role)}
                          <span className="text-sm font-medium capitalize">{invitation.role}</span>
                          {getStatusBadge(invitation.status)}
                        </div>
                      </div>
                    ))}
                    {invitations.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No invitations</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">Select an organization to manage invitations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Organization</CardTitle>
              <CardDescription>
                Create a new organization and become its owner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="My Organization"
                  value={newOrgData.name}
                  onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  placeholder="Brief description of your organization"
                  value={newOrgData.description}
                  onChange={(e) => setNewOrgData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="org-type">Type</Label>
                <Select value={newOrgData.type} onValueChange={(value) => setNewOrgData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateOrganization} disabled={loading || !newOrgData.name.trim()} className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
