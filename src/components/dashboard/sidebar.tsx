'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Brain,
  Mail,
  Building2,
  Calculator,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Questionnaires', href: '/questionnaires', icon: FileText },
  { name: 'Responses', href: '/responses', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Analysis', href: '/ai-analysis', icon: Brain },
  {
    name: 'Scoring Engine',
    href: '/scoring',
    icon: Calculator,
    subItems: [
      { name: 'Configurations', href: '/scoring/configs', icon: Target },
      { name: 'Score Analytics', href: '/scoring/analytics', icon: TrendingUp },
      { name: 'Risk Assessment', href: '/scoring/risk-assessment', icon: AlertTriangle },
    ]
  },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Email Management', href: '/email', icon: Mail },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Scoring Engine'])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const renderNavigationItem = (item: any) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const isExpanded = expandedItems.includes(item.name)
    const hasSubItems = item.subItems && item.subItems.length > 0

    if (hasSubItems) {
      return (
        <div key={item.name} className="space-y-1">
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <div className="flex items-center">
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* Sub Items */}
          {isExpanded && (
            <div className="ml-6 space-y-1">
              {item.subItems.map((subItem: any) => {
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      isSubActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    aria-current={isSubActive ? 'page' : undefined}
                  >
                    <subItem.icon
                      className={cn(
                        'mr-3 h-4 w-4 flex-shrink-0',
                        isSubActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {subItem.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Regular navigation item without sub-items
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon
          className={cn(
            'mr-3 h-5 w-5 flex-shrink-0',
            isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
          )}
        />
        {item.name}
      </Link>
    )
  }

  return (
    <nav
      className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block hidden"
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MindTrack</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" role="navigation" aria-label="Dashboard sections">
          {navigation.map(renderNavigationItem)}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            MindTrack v1.0.0
          </div>
        </div>
      </div>
    </nav>
  )
}
