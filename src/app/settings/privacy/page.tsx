'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Shield, Eye, Database, Cookie, AlertTriangle } from 'lucide-react';
import { PrivacySettings } from '@/types/database';

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    analytics_opt_out: false,
    data_sharing_opt_out: false,
    profile_indexing: true,
    activity_tracking: true,
    usage_statistics: true,
    third_party_cookies: true,
    data_retention_period: 365,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/user');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data.settings.privacy);
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privacy: settings
        }),
      });

      if (response.ok) {
        console.log('Privacy settings updated successfully');
      } else {
        console.error('Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy is important to us. These settings help you control how your data is used and shared. 
          Changes to these settings may affect the functionality of certain features.
        </AlertDescription>
      </Alert>

      {/* Data Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Collection
          </CardTitle>
          <CardDescription>
            Control what data we collect about your usage and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Opt-out</Label>
              <p className="text-sm text-gray-500">
                Prevent collection of usage analytics and performance data
              </p>
            </div>
            <Switch
              checked={settings.analytics_opt_out}
              onCheckedChange={(checked) => updateSetting('analytics_opt_out', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Activity Tracking</Label>
              <p className="text-sm text-gray-500">
                Track your activity to improve user experience
              </p>
            </div>
            <Switch
              checked={settings.activity_tracking}
              onCheckedChange={(checked) => updateSetting('activity_tracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Usage Statistics</Label>
              <p className="text-sm text-gray-500">
                Collect anonymous usage statistics to improve the platform
              </p>
            </div>
            <Switch
              checked={settings.usage_statistics}
              onCheckedChange={(checked) => updateSetting('usage_statistics', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Data Sharing & Visibility
          </CardTitle>
          <CardDescription>
            Control how your data is shared and who can see your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Sharing Opt-out</Label>
              <p className="text-sm text-gray-500">
                Prevent sharing of anonymized data with research partners
              </p>
            </div>
            <Switch
              checked={settings.data_sharing_opt_out}
              onCheckedChange={(checked) => updateSetting('data_sharing_opt_out', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Profile Indexing</Label>
              <p className="text-sm text-gray-500">
                Allow your profile to be discoverable in search results
              </p>
            </div>
            <Switch
              checked={settings.profile_indexing}
              onCheckedChange={(checked) => updateSetting('profile_indexing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cookies & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cookie className="w-5 h-5 mr-2" />
            Cookies & Tracking
          </CardTitle>
          <CardDescription>
            Manage cookie preferences and third-party tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Third-party Cookies</Label>
              <p className="text-sm text-gray-500">
                Allow third-party cookies for enhanced functionality
              </p>
            </div>
            <Switch
              checked={settings.third_party_cookies}
              onCheckedChange={(checked) => updateSetting('third_party_cookies', checked)}
            />
          </div>

          {!settings.third_party_cookies && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling third-party cookies may affect some features like social media integrations 
                and analytics dashboards.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Control how long your data is stored in our systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Data Retention Period</Label>
            <Select
              value={settings.data_retention_period.toString()}
              onValueChange={(value) => updateSetting('data_retention_period', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">6 months</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="1095">3 years</SelectItem>
                <SelectItem value="-1">Keep indefinitely</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              How long to keep your data after account deletion or inactivity
            </p>
          </div>

          {settings.data_retention_period < 365 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Short retention periods may result in loss of historical data and analytics. 
                Some features may not work properly with limited data history.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>
            Exercise your rights regarding your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Download Your Data</div>
                <div className="text-sm text-gray-500 mt-1">
                  Get a copy of all your personal data
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Request Data Correction</div>
                <div className="text-sm text-gray-500 mt-1">
                  Request corrections to your personal data
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Data Portability</div>
                <div className="text-sm text-gray-500 mt-1">
                  Transfer your data to another service
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 border-red-200 text-red-700 hover:bg-red-50">
              <div className="text-left">
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-red-500 mt-1">
                  Permanently delete your account and data
                </div>
              </div>
            </Button>
          </div>

          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-2">Important Information:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Data download requests are processed within 30 days</li>
              <li>Account deletion is permanent and cannot be undone</li>
              <li>Some data may be retained for legal or security purposes</li>
              <li>Contact support for assistance with data requests</li>
            </ul>
          </div>
        </CardContent>
      </Card>

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
