'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Building2, Users, BarChart3 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/lib/organization-context';
import { OrganizationWithStats } from '@/types/database';

interface OrganizationSelectorProps {
  onCreateNew?: () => void;
  className?: string;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  onCreateNew,
  className
}) => {
  const { 
    currentOrganization, 
    organizations, 
    switchOrganization, 
    isLoading,
    userRole 
  } = useOrganization();
  
  const [open, setOpen] = useState(false);

  const handleSelect = async (organizationId: number) => {
    if (organizationId !== currentOrganization?.id) {
      await switchOrganization(organizationId);
    }
    setOpen(false);
  };

  const getRoleColor = (role?: string) => {
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

  const formatRole = (role?: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Building2 className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">No organizations</span>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ml-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create
          </button>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        aria-controls="organization-list"
        className={cn(
          "inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 min-w-[200px]",
          className
        )}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="truncate text-left">
              {currentOrganization?.name || 'Select organization'}
            </div>
            {currentOrganization && userRole && (
              <div className="text-xs text-gray-500">
                {formatRole(userRole)}
              </div>
            )}
          </div>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command id="organization-list">
          <CommandInput placeholder="Search organizations..." />
          <CommandEmpty>No organizations found.</CommandEmpty>
          <CommandGroup>
            {organizations.map((organization) => (
              <CommandItem
                key={organization.id}
                value={organization.name}
                onSelect={() => handleSelect(organization.id)}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      currentOrganization?.id === organization.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {organization.name}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{organization.stats.member_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{organization.stats.questionnaire_count}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getRoleColor(organization.user_role))}
                  >
                    {formatRole(organization.user_role)}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          {onCreateNew && (
            <>
              <Separator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onCreateNew();
                  }}
                  className="flex items-center space-x-2 p-3 text-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create new organization</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
