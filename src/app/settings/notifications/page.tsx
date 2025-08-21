'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Mail, Smartphone, Bell, MessageSquare } from 'lucide-react';
import { NotificationSettings } from '@/types/database';

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      questionnaire_responses: true,
      organization_invites: true,
      system_updates: true,
      marketing: false,
      weekly_digest: true,
      frequency: 'immediate',
    },
    in_app: {
      enabled: true,
      questionnaire_responses: true,
      organization_invites: true,
      system_updates: true,
      mentions: true,
      sound_enabled: true,
    },
    push: {
      enabled: false,
      questionnaire_responses: false,
      organization_invites: true,
      system_updates: false,
      mentions: true,
    },
    sms: {
      enabled: false,
      critical_only: true,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/user');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data.settings.notifications);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
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
          notifications: settings
        }),
      });

      if (response.ok) {
        console.log('Notification settings updated successfully');
      } else {
        console.error('Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateEmailSetting = (key: keyof typeof settings.email, value: any) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updateInAppSetting = (key: keyof typeof settings.in_app, value: any) => {
    setSettings(prev => ({
      ...prev,
      in_app: { ...prev.in_app, [key]: value }
    }));
  };

  const updatePushSetting = (key: keyof typeof settings.push, value: any) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const updateSmsSetting = (key: keyof typeof settings.sms, value: any) => {
    setSettings(prev => ({
      ...prev,
      sms: { ...prev.sms, [key]: value }
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
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.email.enabled}
              onCheckedChange={(checked) => updateEmailSetting('enabled', checked)}
            />
          </div>

          {settings.email.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questionnaire Responses</Label>
                  <Switch
                    checked={settings.email.questionnaire_responses}
                    onCheckedChange={(checked) => updateEmailSetting('questionnaire_responses', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Organization Invites</Label>
                  <Switch
                    checked={settings.email.organization_invites}
                    onCheckedChange={(checked) => updateEmailSetting('organization_invites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>System Updates</Label>
                  <Switch
                    checked={settings.email.system_updates}
                    onCheckedChange={(checked) => updateEmailSetting('system_updates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Marketing Communications</Label>
                  <Switch
                    checked={settings.email.marketing}
                    onCheckedChange={(checked) => updateEmailSetting('marketing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Weekly Digest</Label>
                  <Switch
                    checked={settings.email.weekly_digest}
                    onCheckedChange={(checked) => updateEmailSetting('weekly_digest', checked)}
                  />
                </div>

                <div>
                  <Label>Email Frequency</Label>
                  <Select
                    value={settings.email.frequency}
                    onValueChange={(value: 'immediate' | 'daily' | 'weekly' | 'never') => 
                      updateEmailSetting('frequency', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications that appear within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable In-App Notifications</Label>
              <p className="text-sm text-gray-500">Show notifications in the app</p>
            </div>
            <Switch
              checked={settings.in_app.enabled}
              onCheckedChange={(checked) => updateInAppSetting('enabled', checked)}
            />
          </div>

          {settings.in_app.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questionnaire Responses</Label>
                  <Switch
                    checked={settings.in_app.questionnaire_responses}
                    onCheckedChange={(checked) => updateInAppSetting('questionnaire_responses', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Organization Invites</Label>
                  <Switch
                    checked={settings.in_app.organization_invites}
                    onCheckedChange={(checked) => updateInAppSetting('organization_invites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>System Updates</Label>
                  <Switch
                    checked={settings.in_app.system_updates}
                    onCheckedChange={(checked) => updateInAppSetting('system_updates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mentions</Label>
                  <Switch
                    checked={settings.in_app.mentions}
                    onCheckedChange={(checked) => updateInAppSetting('mentions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-gray-500">Play sound for notifications</p>
                  </div>
                  <Switch
                    checked={settings.in_app.sound_enabled}
                    onCheckedChange={(checked) => updateInAppSetting('sound_enabled', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure browser push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              checked={settings.push.enabled}
              onCheckedChange={(checked) => updatePushSetting('enabled', checked)}
            />
          </div>

          {settings.push.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questionnaire Responses</Label>
                  <Switch
                    checked={settings.push.questionnaire_responses}
                    onCheckedChange={(checked) => updatePushSetting('questionnaire_responses', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Organization Invites</Label>
                  <Switch
                    checked={settings.push.organization_invites}
                    onCheckedChange={(checked) => updatePushSetting('organization_invites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>System Updates</Label>
                  <Switch
                    checked={settings.push.system_updates}
                    onCheckedChange={(checked) => updatePushSetting('system_updates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mentions</Label>
                  <Switch
                    checked={settings.push.mentions}
                    onCheckedChange={(checked) => updatePushSetting('mentions', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Configure SMS notifications for critical alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive SMS for critical notifications</p>
            </div>
            <Switch
              checked={settings.sms.enabled}
              onCheckedChange={(checked) => updateSmsSetting('enabled', checked)}
            />
          </div>

          {settings.sms.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={settings.sms.phone_number || ''}
                    onChange={(e) => updateSmsSetting('phone_number', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Critical Alerts Only</Label>
                    <p className="text-sm text-gray-500">Only send SMS for critical alerts</p>
                  </div>
                  <Switch
                    checked={settings.sms.critical_only}
                    onCheckedChange={(checked) => updateSmsSetting('critical_only', checked)}
                  />
                </div>
              </div>
            </>
          )}
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
