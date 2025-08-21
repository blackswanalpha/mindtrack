'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  UserMinus,
  Crown,
  Eye
} from 'lucide-react';
import { useOrganization } from '@/lib/organization-context';
import { OrganizationMember } from '@/types/database';
import { cn } from '@/lib/utils';

interface MemberManagementProps {
  onInviteMember?: () => void;
  className?: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  onInviteMember,
  className
}) => {
  const { 
    currentOrganization, 
    members, 
    userRole, 
    isLoadingMembers,
    fetchMembers 
  } = useOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState<number | null>(null);

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canRemoveMembers = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  // Filter members based on search and role filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm || 
      member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'member':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRoleChange = async (memberId: number, newRole: string) => {
    if (!currentOrganization) return;

    try {
      setIsUpdatingRole(memberId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/members/${memberId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchMembers();
      } else {
        console.error('Failed to update member role:', data.error);
      }
    } catch (error) {
      console.error('Error updating member role:', error);
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (member: OrganizationMember) => {
    if (!currentOrganization) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/members/${member.user_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchMembers();
        setMemberToRemove(null);
      } else {
        console.error('Failed to remove member:', data.error);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (!currentOrganization) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Selected</h3>
          <p className="text-gray-500">Select an organization to manage members</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-600">
            Manage members and their roles in {currentOrganization.name}
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={onInviteMember} className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Organization Members ({filteredMembers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {member.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {member.user?.name}
                        </p>
                        {member.status !== 'active' && (
                          <Badge variant="secondary" className="text-xs">
                            {member.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {member.user?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <Badge
                        variant="outline"
                        className={cn("capitalize", getRoleBadgeColor(member.role))}
                      >
                        {member.role}
                      </Badge>
                    </div>

                    {canManageMembers && member.user_id !== currentOrganization.created_by_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUpdatingRole === member.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Role change options */}
                          {isOwner && member.role !== 'owner' && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.user_id, 'owner')}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Make Owner
                            </DropdownMenuItem>
                          )}
                          
                          {(isOwner || member.role !== 'admin') && member.role !== 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.user_id, 'admin')}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          
                          {member.role !== 'member' && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.user_id, 'member')}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Make Member
                            </DropdownMenuItem>
                          )}
                          
                          {member.role !== 'viewer' && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.user_id, 'viewer')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Make Viewer
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          {canRemoveMembers && (
                            <DropdownMenuItem
                              onClick={() => setMemberToRemove(member)}
                              className="text-red-600"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || roleFilter !== 'all' ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by inviting members to your organization'
                }
              </p>
              {canManageMembers && !searchTerm && roleFilter === 'all' && (
                <Button onClick={onInviteMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.user?.name}</strong> from {currentOrganization.name}? 
              This action cannot be undone and they will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
