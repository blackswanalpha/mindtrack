'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface DashboardErrorProps {
  error?: Error
  reset?: () => void
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          {error?.message || 'An unexpected error occurred while loading the dashboard.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <Button onClick={reset} className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href="/dashboard" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </a>
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-red-600">
              {error.stack}
            </pre>
          </details>
        )}
      </Card>
    </div>
  )
}

export function DashboardNotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Dashboard Not Found
        </h2>
        
        <p className="text-gray-600 mb-6">
          The dashboard you're looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild>
          <a href="/dashboard" className="flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </a>
        </Button>
      </Card>
    </div>
  )
}
