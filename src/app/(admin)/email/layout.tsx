'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  FileText, 
  BarChart3, 
  Settings, 
  Send,
  Clock,
  Users,
  Shield
} from 'lucide-react';

interface EmailLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Overview',
    href: '/email',
    icon: BarChart3,
    description: 'Email dashboard and overview'
  },
  {
    name: 'Compose',
    href: '/email/compose',
    icon: Send,
    description: 'Send emails and compose messages'
  },
  {
    name: 'Templates',
    href: '/email/templates',
    icon: FileText,
    description: 'Manage email templates'
  },
  {
    name: 'Logs',
    href: '/email/logs',
    icon: Mail,
    description: 'View email sending history'
  },
  {
    name: 'Automations',
    href: '/email/automations',
    icon: Clock,
    description: 'Manage email automation rules'
  },
  {
    name: 'Analytics',
    href: '/email/analytics',
    icon: BarChart3,
    description: 'Email performance analytics'
  },
  {
    name: 'Settings',
    href: '/email/settings',
    icon: Settings,
    description: 'Configure email settings'
  }
];

export default function EmailLayout({ children }: EmailLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Email Management</h1>
                <p className="text-sm text-gray-500">Comprehensive email system</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">1,247</div>
                <div className="text-xs text-gray-500">Sent Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">98.2%</div>
                <div className="text-xs text-gray-500">Delivery Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">24.5%</div>
                <div className="text-xs text-gray-500">Open Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/email' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Email Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Template Management</li>
                <li>Email Automation</li>
                <li>Performance Analytics</li>
                <li>Security & Compliance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Security</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Rate Limiting</li>
                <li>HTML Sanitization</li>
                <li>Spam Detection</li>
                <li>GDPR Compliance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Analytics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Delivery Tracking</li>
                <li>Open Rate Monitoring</li>
                <li>Click Tracking</li>
                <li>Performance Reports</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Best Practices</li>
                <li>Troubleshooting</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Secure Email System</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">GDPR Compliant</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              MindTrack Email Management System v2.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
