'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Save, 
  Settings, 
  Building, 
  Key, 
  Plug, 
  Mail, 
  Server,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { ApplicationSettings } from '@/types/database';
import { useAuth } from '@/lib/auth-context';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ApplicationSettings | null>(null);

  // Check if user has admin access
  const isAdmin = user?.role === 'admin' || user?.role === 'organization_admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/application');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data.settings);
        }
      } catch (error) {
        console.error('Error loading application settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [isAdmin]);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/settings/application', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        console.log('Application settings updated successfully');
      } else {
        console.error('Failed to update application settings');
      }
    } catch (error) {
      console.error('Error updating application settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">
          You don't have permission to access application settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Settings</h3>
        <p className="text-gray-600">
          Unable to load application settings. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Notice */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          These settings affect the entire application and all users. Changes should be made carefully 
          and may require system restart to take effect.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Plug className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details and branding settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">General Settings</h3>
                <p className="text-gray-600 mb-4">
                  Company information, branding, and default preferences will be configurable here.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Management</CardTitle>
              <CardDescription>
                Manage API keys, rate limits, and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* API Keys */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">API Keys</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Production API Key</p>
                        <p className="text-sm text-gray-600">mk_prod_••••••••••••••••</p>
                        <p className="text-xs text-gray-500">Last used: 2 hours ago</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          Active
                        </Badge>
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Development API Key</p>
                        <p className="text-sm text-gray-600">mk_dev_••••••••••••••••</p>
                        <p className="text-xs text-gray-500">Last used: 1 day ago</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          Active
                        </Badge>
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="mt-3">
                    Create New API Key
                  </Button>
                </div>

                {/* Rate Limits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Rate Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {settings.api.rate_limits.requests_per_minute}
                      </p>
                      <p className="text-sm text-gray-600">Requests per minute</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {settings.api.rate_limits.requests_per_hour}
                      </p>
                      <p className="text-sm text-gray-600">Requests per hour</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {settings.api.rate_limits.requests_per_day}
                      </p>
                      <p className="text-sm text-gray-600">Requests per day</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-party Integrations</CardTitle>
              <CardDescription>
                Configure external service integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Google Analytics */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Plug className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Google Analytics</p>
                      <p className="text-sm text-gray-600">Track website analytics and user behavior</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.integrations.google_analytics.enabled ? "secondary" : "outline"}>
                      {settings.integrations.google_analytics.enabled ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Slack */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Plug className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-gray-600">Send notifications to Slack channels</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.integrations.slack.enabled ? "secondary" : "outline"}>
                      {settings.integrations.slack.enabled ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Zapier */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plug className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Zapier</p>
                      <p className="text-sm text-gray-600">Automate workflows with 5000+ apps</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.integrations.zapier.enabled ? "secondary" : "outline"}>
                      {settings.integrations.zapier.enabled ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                SMTP settings and email automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Settings</h3>
                <p className="text-gray-600 mb-4">
                  SMTP configuration, email templates, and automation settings are available in the dedicated email settings page.
                </p>
                <Button variant="outline" asChild>
                  <a href="/email/settings">
                    Go to Email Settings
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                System-wide settings and maintenance options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">
                      {settings.system.maintenance_mode 
                        ? "System is currently in maintenance mode" 
                        : "System is operational"
                      }
                    </p>
                  </div>
                  <Badge variant={settings.system.maintenance_mode ? "destructive" : "secondary"}>
                    {settings.system.maintenance_mode ? "Maintenance" : "Operational"}
                  </Badge>
                </div>

                {/* System Stats */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Max File Upload Size</p>
                      <p className="text-lg font-semibold">
                        {Math.round(settings.system.max_file_upload_size / (1024 * 1024))}MB
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Session Timeout</p>
                      <p className="text-lg font-semibold">
                        {settings.system.session_timeout} minutes
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Backup Frequency</p>
                      <p className="text-lg font-semibold capitalize">
                        {settings.system.backup_settings.frequency}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Log Level</p>
                      <p className="text-lg font-semibold capitalize">
                        {settings.system.logging.level}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
