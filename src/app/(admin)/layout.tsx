import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavigation } from '@/components/dashboard/top-navigation'
import { OrganizationProvider } from '@/lib/organization-context'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Navigation */}
          <TopNavigation />

          {/* Page Content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OrganizationProvider>
  )
}
