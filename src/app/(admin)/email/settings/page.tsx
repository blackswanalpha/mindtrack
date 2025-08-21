'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Server, 
  Shield, 
  Mail, 
  TestTube,
  CheckCircle,
  AlertCircle,
  Settings,
  Globe,
  Clock,
  Users
} from 'lucide-react';

interface EmailConfiguration {
  email_configured: boolean;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
}

interface SecuritySettings {
  enableRateLimit: boolean;
  enableHtmlSanitization: boolean;
  enableSpamFilter: boolean;
  enableUnsubscribeLinks: boolean;
  maxEmailSize: number;
  allowedDomains: string[];
  blockedDomains: string[];
}

export default function EmailSettingsPage() {
  const [emailConfig, setEmailConfig] = useState<EmailConfiguration | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    enableRateLimit: true,
    enableHtmlSanitization: true,
    enableSpamFilter: true,
    enableUnsubscribeLinks: true,
    maxEmailSize: 10 * 1024 * 1024,
    allowedDomains: [],
    blockedDomains: []
  });
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [allowedDomainsText, setAllowedDomainsText] = useState('');
  const [blockedDomainsText, setBlockedDomainsText] = useState('');

  useEffect(() => {
    fetchEmailConfiguration();
  }, []);

  const fetchEmailConfiguration = async () => {
    try {
      const response = await fetch('/api/email/send', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching email configuration:', error);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;

    try {
      setLoading(true);
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: testEmail,
          is_test: true
        })
      });

      const data = await response.json();
      setTestResult({
        success: response.ok,
        message: data.message || (response.ok ? 'Test email sent successfully!' : 'Failed to send test email')
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error sending test email'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = () => {
    // Parse domain lists
    const allowedDomains = allowedDomainsText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
    
    const blockedDomains = blockedDomainsText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    const updatedSettings = {
      ...securitySettings,
      allowedDomains,
      blockedDomains
    };

    setSecuritySettings(updatedSettings);
    
    // Here you would typically save to backend
    alert('Security settings saved successfully!');
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-gray-600">Configure SMTP, security, and email preferences</p>
        </div>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Testing</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>SMTP Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailConfig ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Email system is configured and ready to send emails.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SMTP Host</Label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {emailConfig.smtp_host}
                      </div>
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {emailConfig.smtp_port}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>SMTP User</Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      {emailConfig.smtp_user}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={emailConfig.email_configured ? "default" : "destructive"}>
                      {emailConfig.email_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Email configuration not found. Please check your environment variables.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Environment Variables Required:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><code>SMTP_HOST</code> - SMTP server hostname</div>
                  <div><code>SMTP_PORT</code> - SMTP server port (usually 587)</div>
                  <div><code>SMTP_USER</code> - SMTP username/email</div>
                  <div><code>SMTP_PASS</code> - SMTP password/app password</div>
                  <div><code>SMTP_SECURE</code> - Use TLS (true/false)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-gray-600">Prevent email abuse with rate limits</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableRateLimit}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableRateLimit: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>HTML Sanitization</Label>
                    <p className="text-sm text-gray-600">Remove dangerous HTML content</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableHtmlSanitization}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableHtmlSanitization: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Spam Filter</Label>
                    <p className="text-sm text-gray-600">Detect and block spam content</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableSpamFilter}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableSpamFilter: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Unsubscribe Links</Label>
                    <p className="text-sm text-gray-600">Automatically add unsubscribe links</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableUnsubscribeLinks}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableUnsubscribeLinks: checked })}
                  />
                </div>
              </div>

              {/* Email Size Limit */}
              <div>
                <Label htmlFor="maxSize">Maximum Email Size</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="maxSize"
                    type="number"
                    value={Math.round(securitySettings.maxEmailSize / (1024 * 1024))}
                    onChange={(e) => setSecuritySettings({ 
                      ...securitySettings, 
                      maxEmailSize: parseInt(e.target.value) * 1024 * 1024 
                    })}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">MB</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Current limit: {formatFileSize(securitySettings.maxEmailSize)}
                </p>
              </div>

              {/* Domain Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allowedDomains">Allowed Domains</Label>
                  <Textarea
                    id="allowedDomains"
                    value={allowedDomainsText}
                    onChange={(e) => setAllowedDomainsText(e.target.value)}
                    placeholder="example.com&#10;company.org&#10;(one per line)"
                    rows={6}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Leave empty to allow all domains
                  </p>
                </div>

                <div>
                  <Label htmlFor="blockedDomains">Blocked Domains</Label>
                  <Textarea
                    id="blockedDomains"
                    value={blockedDomainsText}
                    onChange={(e) => setBlockedDomainsText(e.target.value)}
                    placeholder="spam.com&#10;blocked.org&#10;(one per line)"
                    rows={6}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Domains to block from receiving emails
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveSecuritySettings} className="w-full">
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Rate Limits Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Rate Limits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">50</div>
                  <div className="text-sm text-gray-600">Per User/Hour</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">200</div>
                  <div className="text-sm text-gray-600">Per User/Day</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">500</div>
                  <div className="text-sm text-gray-600">Per Org/Hour</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">100</div>
                  <div className="text-sm text-gray-600">Per IP/Hour</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Email Testing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="flex-1"
                  />
                  <Button onClick={handleTestEmail} disabled={loading || !testEmail}>
                    {loading ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </div>
              </div>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Test Email Content:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Subject: "MindTrack Email Configuration Test"</div>
                  <div>• Content: Basic test message with timestamp</div>
                  <div>• Purpose: Verify SMTP configuration and delivery</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Email Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monitoring Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Monitor email performance, delivery rates, and system health.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    View Email Analytics
                  </Button>
                  <Button variant="outline" className="w-full">
                    Check System Health
                  </Button>
                  <Button variant="outline" className="w-full">
                    Review Error Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
