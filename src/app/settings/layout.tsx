'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Lock, 
  Settings as SettingsIcon,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

interface SettingsNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  adminOnly?: boolean;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    href: '/settings/profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your personal information and profile picture',
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Configure email, push, and in-app notifications',
  },
  {
    href: '/settings/ui',
    label: 'UI Preferences',
    icon: Palette,
    description: 'Customize theme, language, and display settings',
  },
  {
    href: '/settings/privacy',
    label: 'Privacy',
    icon: Shield,
    description: 'Control your data sharing and privacy settings',
  },
  {
    href: '/settings/security',
    label: 'Security',
    icon: Lock,
    description: 'Manage password, 2FA, and security settings',
  },
  {
    href: '/settings/admin',
    label: 'Application Settings',
    icon: SettingsIcon,
    description: 'System-wide settings and configuration',
    adminOnly: true,
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'organization_admin';

  const filteredNavItems = settingsNavItems.filter(item => 
    !item.adminOnly || isAdmin
  );

  const currentItem = filteredNavItems.find(item => pathname.startsWith(item.href));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={cn(
            "lg:w-80 lg:flex-shrink-0",
            sidebarOpen ? "block" : "hidden lg:block"
          )}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your account and application preferences
                </p>
              </div>
              
              <nav className="p-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-start p-3 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={cn(
                        "w-5 h-5 mr-3 mt-0.5 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400"
                      )} />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className={cn(
                          "text-xs mt-1",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Content header */}
              {currentItem && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <currentItem.icon className="w-6 h-6 text-gray-400 mr-3" />
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        {currentItem.label}
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentItem.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
