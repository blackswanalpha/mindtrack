'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Save, 
  Lock, 
  Shield, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { SecuritySettings } from '@/types/database';

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    two_factor_method: 'app',
    session_timeout: 480,
    login_notifications: true,
    device_tracking: true,
    password_expiry_days: 90,
    require_password_change: false,
    allowed_ip_addresses: [],
    security_questions: [],
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/user');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data.settings.security);
        }
      } catch (error) {
        console.error('Error loading security settings:', error);
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
          security: settings
        }),
      });

      if (response.ok) {
        console.log('Security settings updated successfully');
      } else {
        console.error('Failed to update security settings');
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      console.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        console.log('Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const data = await response.json();
        console.error('Failed to change password:', data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setChangingPassword(false);
    }
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
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
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Password Management
          </CardTitle>
          <CardDescription>
            Change your password and configure password policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  current_password: e.target.value
                }))}
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  new_password: e.target.value
                }))}
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirm_password: e.target.value
                }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={changingPassword || !passwordData.current_password || !passwordData.new_password}
          >
            {changingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Change Password
          </Button>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label>Password Expiry</Label>
              <Select
                value={settings.password_expiry_days.toString()}
                onValueChange={(value) => updateSetting('password_expiry_days', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="-1">Never</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                How often you'll be required to change your password
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Password Change</Label>
                <p className="text-sm text-gray-500">Force password change on next login</p>
              </div>
              <Switch
                checked={settings.require_password_change}
                onCheckedChange={(checked) => updateSetting('require_password_change', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">
                Require a second form of authentication when signing in
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.two_factor_enabled && (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              )}
              <Switch
                checked={settings.two_factor_enabled}
                onCheckedChange={(checked) => updateSetting('two_factor_enabled', checked)}
              />
            </div>
          </div>

          {settings.two_factor_enabled && (
            <>
              <Separator />
              
              <div>
                <Label>Authentication Method</Label>
                <Select
                  value={settings.two_factor_method}
                  onValueChange={(value: 'app' | 'sms' | 'email') => 
                    updateSetting('two_factor_method', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Authenticator App (Recommended)
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">SMS Text Message</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Setup Required:</strong> You'll need to configure your chosen 2FA method 
                  before it becomes active. Click "Configure 2FA" to get started.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Configure 2FA
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Session Management
          </CardTitle>
          <CardDescription>
            Control how long you stay logged in and session security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Session Timeout</Label>
            <Select
              value={settings.session_timeout.toString()}
              onValueChange={(value) => updateSetting('session_timeout', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="720">12 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
                <SelectItem value="-1">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Automatically log out after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Login Notifications</Label>
              <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <Switch
              checked={settings.login_notifications}
              onCheckedChange={(checked) => updateSetting('login_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Device Tracking</Label>
              <p className="text-sm text-gray-500">Track devices and locations used to access your account</p>
            </div>
            <Switch
              checked={settings.device_tracking}
              onCheckedChange={(checked) => updateSetting('device_tracking', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active login sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Session */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-gray-600">Chrome on Windows • New York, NY</p>
                  <p className="text-xs text-gray-500">Last active: Now</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                Current
              </Badge>
            </div>

            {/* Other Sessions */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">Mobile App</p>
                  <p className="text-sm text-gray-600">iPhone • San Francisco, CA</p>
                  <p className="text-xs text-gray-500">Last active: 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              Revoke All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>
            Recent security events and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your account security is up to date. No action required.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Consider enabling two-factor authentication for enhanced security.
              </AlertDescription>
            </Alert>
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
